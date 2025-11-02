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