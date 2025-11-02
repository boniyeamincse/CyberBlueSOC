from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Tool

router = APIRouter()


@router.get("/tools")
async def get_tools(db: Session = Depends(get_db)):
    tools = db.query(Tool).all()
    return [
        {
            "id": tool.id,
            "name": tool.name,
            "description": tool.description,
            "status": tool.status
        }
        for tool in tools
    ]