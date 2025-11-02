from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
import asyncio
from ..database import get_db
from ..models import Tool, ToolStatus, AuditLog
from ..routers.auth import get_current_user, require_role, RoleEnum
from ..websocket import manager

router = APIRouter()

@router.post("/{tool_id}/start")
async def start_tool(tool_id: int, db: AsyncSession = Depends(get_db), user: dict = Depends(require_role([RoleEnum.admin, RoleEnum.manager]))):
    result = await db.execute(select(Tool).where(Tool.id == tool_id))
    tool = result.scalars().first()
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")

    # Mock starting the tool
    await db.execute(update(Tool).where(Tool.id == tool_id).values(status=ToolStatus.running))
    await db.commit()

    # Log the action
    audit_log = AuditLog(user_id=user.id, action="start", resource=f"tool:{tool_id}", details=f"Started tool {tool.name}")
    db.add(audit_log)
    await db.commit()

    # Broadcast status update
    await manager.broadcast(f"Tool {tool.name} started")

    return {"message": f"Tool {tool.name} started"}

@router.post("/{tool_id}/stop")
async def stop_tool(tool_id: int, db: AsyncSession = Depends(get_db), user: dict = Depends(require_role([RoleEnum.admin, RoleEnum.manager]))):
    result = await db.execute(select(Tool).where(Tool.id == tool_id))
    tool = result.scalars().first()
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")

    await db.execute(update(Tool).where(Tool.id == tool_id).values(status=ToolStatus.stopped))
    await db.commit()

    audit_log = AuditLog(user_id=user.id, action="stop", resource=f"tool:{tool_id}", details=f"Stopped tool {tool.name}")
    db.add(audit_log)
    await db.commit()

    await manager.broadcast(f"Tool {tool.name} stopped")

    return {"message": f"Tool {tool.name} stopped"}

@router.post("/{tool_id}/restart")
async def restart_tool(tool_id: int, db: AsyncSession = Depends(get_db), user: dict = Depends(require_role([RoleEnum.admin, RoleEnum.manager]))):
    result = await db.execute(select(Tool).where(Tool.id == tool_id))
    tool = result.scalars().first()
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")

    # Mock restart sequence
    await db.execute(update(Tool).where(Tool.id == tool_id).values(status=ToolStatus.restarting))
    await db.commit()
    await manager.broadcast(f"Tool {tool.name} restarting")
    await asyncio.sleep(2)  # Mock restart time
    await db.execute(update(Tool).where(Tool.id == tool_id).values(status=ToolStatus.running))
    await db.commit()
    await manager.broadcast(f"Tool {tool.name} restarted")

    audit_log = AuditLog(user_id=user.id, action="restart", resource=f"tool:{tool_id}", details=f"Restarted tool {tool.name}")
    db.add(audit_log)
    await db.commit()

    return {"message": f"Tool {tool.name} restarted"}