from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from database import get_db
from models import Tool, AuditLog
from auth import get_current_user, requires_roles
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.put("/actions/{tool_id}/{operation}")
@requires_roles(["admin"])
@limiter.limit("10/minute")
async def perform_action(
    tool_id: int,
    operation: str,
    request: Request,
    db: Session = Depends(get_db)
):
    if operation not in ["start", "stop", "restart"]:
        raise HTTPException(status_code=400, detail="Invalid operation")

    tool = db.query(Tool).filter(Tool.id == tool_id).first()
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")

    # Update tool status
    if operation == "start":
        new_status = "running"
    elif operation == "stop":
        new_status = "stopped"
    elif operation == "restart":
        new_status = "restarting"

    tool.status = new_status
    db.commit()

    # Log the action with IP address
    user_data = get_current_user(request)
    client_ip = request.client.host if request.client else "unknown"
    audit_log = AuditLog(
        user_sub=user_data["sub"],
        action=f"{operation}_tool",
        resource=f"tool:{tool_id}",
        details=f"Changed status to {new_status} from IP {client_ip}"
    )
    db.add(audit_log)
    db.commit()

    return {"message": f"Tool {operation} successful", "status": new_status}