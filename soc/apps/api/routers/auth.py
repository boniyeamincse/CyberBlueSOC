from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from auth import get_current_user
from database import get_db
from models import User, UserRole, Role

router = APIRouter()


@router.get("/me")
async def me(request: Request, db: Session = Depends(get_db)):
    user_data = get_current_user(request)
    sub = user_data["sub"]

    # Get or create user
    user = db.query(User).filter(User.sub == sub).first()
    if not user:
        user = User(
            sub=sub,
            email=user_data.get("email", "")
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Get user roles
    roles = []
    user_roles = db.query(UserRole).filter(UserRole.user_id == user.id).all()
    for ur in user_roles:
        role = db.query(Role).filter(Role.id == ur.role_id).first()
        if role:
            roles.append(role.name)

    return {
        "subject": sub,
        "roles": roles
    }