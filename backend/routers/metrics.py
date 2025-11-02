from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from ..database import get_db
from ..models import Tool, AuditLog, SystemMetrics
from ..routers.auth import get_current_user
from ..websocket import manager
import psutil
import time
import asyncio

router = APIRouter()

@router.get("/system")
async def get_system_metrics(db: AsyncSession = Depends(get_db), user: dict = Depends(get_current_user)):
    """Get real-time system metrics"""
    # CPU and memory usage
    cpu_percent = psutil.cpu_percent(interval=1)
    memory = psutil.virtual_memory()
    uptime = time.time() - psutil.boot_time()

    # Active tools count
    result = await db.execute(select(Tool).where(Tool.status == "running"))
    running_tools = result.scalars().all()
    active_agents = len(running_tools)

    # Store metrics in database
    metrics = SystemMetrics(
        active_agents=active_agents,
        cpu_percent=cpu_percent,
        memory_percent=memory.percent,
        memory_used=memory.used,
        memory_total=memory.total,
        uptime=uptime,
        response_time=0.1  # Mock response time
    )
    db.add(metrics)
    await db.commit()

    return {
        "timestamp": time.time(),
        "active_agents": active_agents,
        "cpu_percent": cpu_percent,
        "memory_percent": memory.percent,
        "memory_used": memory.used,
        "memory_total": memory.total,
        "uptime": uptime,
        "response_time": 0.1  # Mock response time
    }

@router.get("/historical/{metric_type}")
async def get_historical_metrics(metric_type: str, hours: int = 24, db: AsyncSession = Depends(get_db), user: dict = Depends(get_current_user)):
    """Get historical metrics data from database"""
    # Calculate time range
    current_time = time.time()
    start_time = current_time - (hours * 3600)

    # Map metric types to database columns
    column_map = {
        "cpu": SystemMetrics.cpu_percent,
        "memory": SystemMetrics.memory_percent,
        "active_agents": SystemMetrics.active_agents,
        "uptime": SystemMetrics.uptime,
        "response_time": SystemMetrics.response_time
    }

    if metric_type not in column_map:
        return {"error": f"Unsupported metric type: {metric_type}"}

    # Query historical data
    result = await db.execute(
        select(SystemMetrics.timestamp, column_map[metric_type])
        .where(SystemMetrics.timestamp >= func.datetime(start_time, 'unixepoch'))
        .order_by(SystemMetrics.timestamp)
    )

    data_points = [
        {
            "timestamp": row[0].timestamp(),
            "value": row[1]
        }
        for row in result.all()
    ]

    return {
        "metric_type": metric_type,
        "data_points": data_points
    }

@router.get("/logs")
async def get_audit_logs(limit: int = 50, offset: int = 0, db: AsyncSession = Depends(get_db), user: dict = Depends(get_current_user)):
    """Get audit logs for user activity tracking"""
    result = await db.execute(
        select(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).offset(offset)
    )
    logs = result.scalars().all()

    return {
        "logs": [
            {
                "id": log.id,
                "user_id": log.user_id,
                "action": log.action,
                "resource": log.resource,
                "details": log.details,
                "timestamp": log.timestamp.isoformat()
            }
            for log in logs
        ]
    }