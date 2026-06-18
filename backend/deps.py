from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
from database import supabase_admin
from jwt_handler import verify_token
from jose import JWTError, ExpiredSignatureError

security = HTTPBearer()


def get_current_user(token=Depends(security)):
    # Step 1: Verify JWT signature and expiry — this is the only true auth check
    try:
        payload = verify_token(token.credentials)
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired — please log in again")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token — please log in again")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token — please log in again")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token — please log in again")

    # Step 2: Fetch user profile — DB errors are NOT auth errors
    try:
        profile_res = supabase_admin.table("users").select("*").eq("id", user_id).execute()
    except Exception as e:
        # DB connection issue — return 503 so the frontend does NOT log out
        raise HTTPException(status_code=503, detail="Database temporarily unavailable, please retry")

    if not profile_res.data:
        # User was deleted — this IS a real auth failure
        raise HTTPException(status_code=401, detail="User account not found — please log in again")

    return profile_res.data[0]
