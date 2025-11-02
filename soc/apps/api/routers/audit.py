from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from database import get_db
from models import AuditLog
from typing import List, Dict, Any

router = APIRouter()


@router.get("/audit-logs")
async def get_audit_logs(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    search: str = Query(""),
    action: str = Query("all"),
    user: str = Query("all"),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get paginated audit logs with filtering"""

    query = db.query(AuditLog)

    # Apply filters
    if search:
        query = query.filter(
            (AuditLog.action.ilike(f"%{search}%")) |
            (AuditLog.resource.ilike(f"%{search}%")) |
            (AuditLog.details.ilike(f"%{search}%"))
        )

    if action != "all":
        query = query.filter(AuditLog.action == action)

    if user != "all":
        query = query.filter(AuditLog.user_sub == user)

    # Get total count
    total_count = query.count()
    total_pages = (total_count + per_page - 1) // per_page

    # Apply pagination
    logs = query.order_by(desc(AuditLog.created_at)).offset((page - 1) * per_page).limit(per_page).all()

    return {
        "logs": [
            {
                "id": log.id,
                "user_sub": log.user_sub,
                "action": log.action,
                "resource": log.resource,
                "details": log.details,
                "created_at": log.created_at.isoformat()
            }
            for log in logs
        ],
        "total_pages": total_pages,
        "current_page": page,
        "total_count": total_count
    }


@router.get("/audit-logs/summary")
async def get_audit_summary(
    days: int = Query(7, ge=1, le=90),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get audit log summary statistics"""

    import datetime
    from sqlalchemy import func

    time_ago = datetime.datetime.utcnow() - datetime.timedelta(days=days)

    # Get action counts
    action_counts = db.query(
        AuditLog.action,
        func.count(AuditLog.id).label('count')
    ).filter(
        AuditLog.created_at >= time_ago
    ).group_by(AuditLog.action).all()

    # Get user activity counts
    user_counts = db.query(
        AuditLog.user_sub,
        func.count(AuditLog.id).label('count')
    ).filter(
        AuditLog.created_at >= time_ago
    ).group_by(AuditLog.user_sub).all()

    # Get daily activity
    daily_activity = db.query(
        func.date(AuditLog.created_at).label('date'),
        func.count(AuditLog.id).label('count')
    ).filter(
        AuditLog.created_at >= time_ago
    ).group_by(func.date(AuditLog.created_at)).all()

    return {
        "action_counts": {action: count for action, count in action_counts},
        "user_counts": {user: count for user, count in user_counts},
        "daily_activity": [{"date": str(date), "count": count} for date, count in daily_activity],
        "time_range": f"Last {days} days"
    }