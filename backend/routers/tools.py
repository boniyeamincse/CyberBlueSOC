from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..database import get_db
from ..models import Tool
from ..routers.auth import get_current_user, require_role, RoleEnum

router = APIRouter()

@router.get("/")
async def get_tools(db: AsyncSession = Depends(get_db), user: dict = Depends(get_current_user)):
    result = await db.execute(select(Tool))
    tools = result.scalars().all()
    return [{"id": t.id, "name": t.name, "description": t.description, "status": t.status.value} for t in tools]

@router.get("/{tool_id}")
async def get_tool(tool_id: int, db: AsyncSession = Depends(get_db), user: dict = Depends(get_current_user)):
    result = await db.execute(select(Tool).where(Tool.id == tool_id))
    tool = result.scalars().first()
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    return {"id": tool.id, "name": tool.name, "description": tool.description, "status": tool.status.value}