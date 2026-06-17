import os
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from database import supabase
from schemas import UserRole

# We will use OAuth2PasswordBearer for Swagger UI integration
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Verify the token with Supabase and get the auth user
        response = supabase.auth.get_user(token)
        if not response or not response.user:
            raise credentials_exception
        user_id = response.user.id
    except Exception:
        raise credentials_exception

    # Fetch additional user details and role from public.users
    user_response = supabase.table('users').select('*').eq('id', user_id).execute()
    if not user_response.data:
        raise credentials_exception
    
    user = user_response.data[0]
    return user

def require_role(allowed_roles: list[UserRole]):
    def role_checker(current_user: dict = Depends(get_current_user)):
        user_role = current_user.get("role")
        if user_role not in [role.value for role in allowed_roles]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Operation not permitted"
            )
        return current_user
    return role_checker

# Dependency shortcuts
require_admin = require_role([UserRole.admin])
require_doctor = require_role([UserRole.admin, UserRole.doctor])
require_receptionist = require_role([UserRole.admin, UserRole.receptionist])
require_staff = require_role([UserRole.admin, UserRole.doctor, UserRole.receptionist])
require_patient = require_role([UserRole.admin, UserRole.patient])
