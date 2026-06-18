from fastapi import APIRouter, HTTPException, Depends
from database import supabase, supabase_admin
from schemas import UserLogin, UserCreate, UserProfileUpdate, PasswordChange
from deps import get_current_user
from jwt_handler import create_access_token
import bcrypt
import uuid

router = APIRouter(prefix="/auth", tags=["Auth"])

ALLOWED_ROLES = {"patient", "doctor", "receptionist"}


def _hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def _verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode(), hashed.encode())
    except Exception:
        return False


@router.post("/register")
def register(user: UserCreate):
    if user.role not in ALLOWED_ROLES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid role '{user.role}'. Must be one of: {', '.join(ALLOWED_ROLES)}"
        )

    # Check if email already exists
    existing = supabase_admin.table("users").select("id").eq("email", user.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    try:
        password_hash = _hash_password(user.password)
        new_id = str(uuid.uuid4())

        # Step 1: Insert into users table (identity row for ALL roles)
        res = supabase_admin.table("users").insert({
            "id": new_id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "phone": password_hash,  # phone column stores bcrypt hash
        }).execute()

        if not res.data:
            raise HTTPException(status_code=400, detail="Failed to create user account")

        # Step 2: Auto-create role-specific profile row
        if user.role == "patient":
            try:
                supabase_admin.table("patients").insert({
                    "user_id": new_id,
                    "date_of_birth": "2000-01-01",
                    "gender": "other",
                    "address": "Not set",
                    "blood_group": "O+",
                    "emergency_contact": "0000000000",
                }).execute()
            except Exception:
                pass  # non-critical — patient can update profile later

        elif user.role == "doctor":
            try:
                supabase_admin.table("doctors").insert({
                    "user_id": new_id,
                    "specialization": "General Medicine",
                    "qualification": "MBBS",
                    "experience": 0,
                    "consultation_fee": 0,
                }).execute()
            except Exception:
                pass  # non-critical — doctor fills profile on next step

        # receptionist has no separate profile table — users row is sufficient

        # Welcome notification for the new user
        try:
            welcome_msgs = {
                "patient":      ("👋 Welcome to MediFlow!", f"Hi {user.full_name}! Your patient account is ready. You can now book appointments, view prescriptions, and track your health records."),
                "doctor":       ("👨‍⚕️ Welcome, Doctor!", f"Hi Dr. {user.full_name}! Please complete your profile to start accepting appointments."),
                "receptionist": ("👋 Welcome to MediFlow!", f"Hi {user.full_name}! Your receptionist account is ready. You can manage appointments from your dashboard."),
            }
            title, msg = welcome_msgs.get(user.role, ("👋 Welcome!", f"Welcome to MediFlow, {user.full_name}!"))
            supabase_admin.table("notifications").insert({
                "user_id": new_id, "title": title, "message": msg, "is_read": False
            }).execute()
            # Notify admins of new signup
            admins = supabase_admin.table("users").select("id").eq("role", "admin").execute()
            role_label = user.role.capitalize()
            for a in (admins.data or []):
                supabase_admin.table("notifications").insert({
                    "user_id": a["id"],
                    "title": f"🆕 New {role_label} Registered",
                    "message": f"{user.full_name} ({user.email}) just created a {user.role} account.",
                    "is_read": False
                }).execute()
        except Exception:
            pass

        return {"message": "User created", "user_id": new_id}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
@router.post("/login")
def login(user: UserLogin):
    # Fetch user from our users table
    res = supabase_admin.table("users").select("*").eq("email", user.email).execute()
    if not res.data:
        raise HTTPException(status_code=400, detail="Invalid email or password")

    db_user = res.data[0]
    stored_hash = db_user.get("phone", "")

    # For users created before this system (no hash stored), try Supabase auth as fallback
    if not stored_hash or not stored_hash.startswith("$2"):
        # Try Supabase auth
        try:
            auth_res = supabase.auth.sign_in_with_password({
                "email": user.email,
                "password": user.password
            })
            if auth_res.user and auth_res.session:
                # Migrate: store hash in phone column for future logins
                try:
                    supabase_admin.table("users").update({
                        "phone": _hash_password(user.password)
                    }).eq("id", db_user["id"]).execute()
                except Exception:
                    pass
                token = create_access_token({"sub": db_user["id"], "role": db_user["role"]})
                return {"access_token": token, "user": db_user}
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid email or password")
        raise HTTPException(status_code=400, detail="Invalid email or password")

    # Verify password against our bcrypt hash
    if not _verify_password(user.password, stored_hash):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    # Issue our own JWT
    token = create_access_token({"sub": db_user["id"], "role": db_user["role"]})
    return {"access_token": token, "user": db_user}


@router.patch("/profile")
def update_profile(data: UserProfileUpdate, current_user=Depends(get_current_user)):
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    try:
        res = supabase_admin.table("users").update(update_data).eq("id", current_user["id"]).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="User not found")
        return res.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/change-password")
def change_password(data: PasswordChange, current_user=Depends(get_current_user)):
    stored_hash = current_user.get("phone", "")

    # Verify current password
    if stored_hash and stored_hash.startswith("$2"):
        if not _verify_password(data.current_password, stored_hash):
            raise HTTPException(status_code=400, detail="Current password is incorrect")
    else:
        # Fallback: verify via Supabase
        try:
            supabase.auth.sign_in_with_password({
                "email": current_user["email"],
                "password": data.current_password
            })
        except Exception:
            raise HTTPException(status_code=400, detail="Current password is incorrect")

    # Update with new hash
    new_hash = _hash_password(data.new_password)
    supabase_admin.table("users").update({"phone": new_hash}).eq("id", current_user["id"]).execute()
    return {"message": "Password updated successfully"}
