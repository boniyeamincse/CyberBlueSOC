import httpx
from fastapi import HTTPException, Request
from jose import jwt, JWTError
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization
import json
from typing import Dict, List
from config import settings


class JWTMiddleware:
    def __init__(self):
        self.jwks = {}
        self._load_jwks()

    def _load_jwks(self):
        try:
            response = httpx.get(f"{settings.oidc_issuer}/.well-known/jwks_uri")
            jwks_uri = response.json()["jwks_uri"]
            jwks_response = httpx.get(jwks_uri)
            self.jwks = jwks_response.json()
        except Exception as e:
            print(f"Failed to load JWKS: {e}")

    def get_public_key(self, kid: str):
        for key in self.jwks.get("keys", []):
            if key["kid"] == kid:
                return serialization.load_pem_public_key(
                    f'-----BEGIN PUBLIC KEY-----\n{key["n"]}\n-----END PUBLIC KEY-----'.encode(),
                    backend=default_backend()
                )
        raise ValueError("Public key not found")

    def validate_token(self, token: str) -> Dict:
        try:
            header = jwt.get_unverified_header(token)
            kid = header["kid"]
            public_key = self.get_public_key(kid)
            payload = jwt.decode(token, public_key, algorithms=["RS256"], audience=settings.oidc_audience)
            return payload
        except JWTError as e:
            raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")


jwt_middleware = JWTMiddleware()


def get_current_user(request: Request) -> Dict:
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")

    token = auth_header.split(" ")[1]
    return jwt_middleware.validate_token(token)


def requires_roles(required_roles: List[str]):
    def decorator(func):
        def wrapper(*args, **kwargs):
            request = kwargs.get('request')
            if not request:
                raise HTTPException(status_code=500, detail="Request object not found")

            user = get_current_user(request)
            user_roles = user.get("realm_access", {}).get("roles", [])
            if not any(role in user_roles for role in required_roles):
                raise HTTPException(status_code=403, detail="Insufficient permissions")

            return func(*args, **kwargs)
        return wrapper
    return decorator