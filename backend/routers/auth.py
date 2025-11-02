from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import jwt
import requests
from ..database import get_db
from ..models import User, RoleEnum
from ..config import settings

router = APIRouter()
security = HTTPBearer()

async def get_current_user(token: str = Depends(security), db: AsyncSession = Depends(get_db)) -> User:
    try:
        # Decode JWT token (simplified - in production, verify with Keycloak public key)
        payload = jwt.decode(token.credentials, options={"verify_signature": False})
        keycloak_id = payload.get("sub")

        result = await db.execute(select(User).where(User.keycloak_id == keycloak_id))
        user = result.scalars().first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def require_role(roles: list[RoleEnum]):
    async def role_checker(user: User = Depends(get_current_user)):
        if user.role not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user
    return role_checker

# Role-based permission helpers
def require_admin(user: User = Depends(get_current_user)):
    """Requires admin role - full control (users, system setup, agents)"""
    if user.role != RoleEnum.admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

def require_analyst(user: User = Depends(get_current_user)):
    """Requires analyst role - view dashboards, alerts, incidents"""
    if user.role not in [RoleEnum.admin, RoleEnum.analyst]:
        raise HTTPException(status_code=403, detail="Analyst or Admin access required")
    return user

def require_manager(user: User = Depends(get_current_user)):
    """Requires manager role - overview reports, health, metrics"""
    if user.role not in [RoleEnum.admin, RoleEnum.manager]:
        raise HTTPException(status_code=403, detail="Manager or Admin access required")
    return user

@router.get("/callback")
async def auth_callback(code: str):
    # Exchange code for tokens with Keycloak
    token_url = f"{settings.keycloak_url}/realms/{settings.keycloak_realm}/protocol/openid-connect/token"
    data = {
        "grant_type": "authorization_code",
        "client_id": settings.keycloak_client_id,
        "client_secret": settings.keycloak_client_secret,
        "code": code,
        "redirect_uri": "http://localhost:3000/auth/callback"  # Adjust as needed
    }
    response = requests.post(token_url, data=data)
    if response.status_code != 200:
        raise HTTPException(status_code=400, detail="Token exchange failed")
    return response.json()

@router.get("/me", response_model=dict)
async def get_me(user: User = Depends(get_current_user)):
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "role": user.role.value
    }

@router.post("/reset-password")
async def reset_password_request(email: str, db: AsyncSession = Depends(get_db)):
    """Initiate password reset process (requires Keycloak integration)"""
    # TODO: Implement password reset logic with Keycloak
    # This would typically send a reset email or SMS
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalars().first()
    if not user:
        # Don't reveal if email exists or not for security
        return {"message": "If the email exists, a reset link has been sent"}

    # TODO: Generate reset token and send email/SMS
    return {"message": "Password reset initiated"}

@router.post("/reset-password-confirm")
async def reset_password_confirm(token: str, new_password: str):
    """Confirm password reset with token"""
    # TODO: Verify reset token and update password in Keycloak
    return {"message": "Password reset successfully"}

@router.post("/enable-mfa")
async def enable_mfa(user: User = Depends(require_admin)):
    """Enable MFA for user (optional feature)"""
    # TODO: Implement MFA setup with TOTP/SMS
    return {"message": "MFA setup initiated"}

@router.post("/verify-mfa")
async def verify_mfa(code: str, user: User = Depends(get_current_user)):
    """Verify MFA code during login"""
    # TODO: Verify MFA code
    return {"verified": True}