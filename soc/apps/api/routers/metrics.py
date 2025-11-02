from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from database import get_db
from models import Metric, Tool, Incident, AuditLog
from typing import Dict, List, Any
import datetime

router = APIRouter()


@router.get("/metrics")
async def get_system_metrics(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Get comprehensive system metrics for the dashboard"""

    # Get current tool statuses
    tools = db.query(Tool).all()
    tools_status = {tool.name: tool.status for tool in tools}

    # Get recent metrics (last 24 hours)
    one_day_ago = datetime.datetime.utcnow() - datetime.timedelta(days=1)
    recent_metrics = db.query(Metric).filter(
        Metric.timestamp >= one_day_ago
    ).order_by(desc(Metric.timestamp)).limit(100).all()

    # Get incidents count
    incidents_count = db.query(Incident).filter(
        Incident.status.in_(['open', 'investigating'])
    ).count()

    # Calculate system health
    running_tools = sum(1 for status in tools_status.values() if status == 'running')
    total_tools = len(tools_status)

    if running_tools == total_tools:
        overall_health = 'healthy'
    elif running_tools >= total_tools * 0.8:
        overall_health = 'warning'
    else:
        overall_health = 'critical'

    # Calculate uptime (simplified - last restart time)
    last_restart = db.query(AuditLog).filter(
        AuditLog.action.like('%restart%')
    ).order_by(desc(AuditLog.created_at)).first()

    uptime = "Unknown"
    if last_restart:
        uptime_delta = datetime.datetime.utcnow() - last_restart.created_at
        uptime = f"{uptime_delta.days}d {uptime_delta.seconds//3600}h"

    # Last backup (simplified - last successful backup log)
    last_backup = db.query(AuditLog).filter(
        AuditLog.action.like('%backup%')
    ).order_by(desc(AuditLog.created_at)).first()

    last_backup_str = "Never"
    if last_backup:
        last_backup_str = last_backup.created_at.strftime("%Y-%m-%d %H:%M:%S")

    return {
        "tools_status": tools_status,
        "system_health": {
            "overall": overall_health,
            "uptime": uptime,
            "last_backup": last_backup_str
        },
        "recent_metrics": [
            {
                "timestamp": m.timestamp.isoformat(),
                "cpu_usage": m.cpu_usage,
                "memory_usage": m.memory_usage,
                "disk_usage": m.disk_usage,
                "network_rx": m.network_rx,
                "network_tx": m.network_tx,
                "active_connections": m.active_connections,
                "alerts_count": m.alerts_count
            }
            for m in recent_metrics
        ],
        "incidents_count": incidents_count
    }


@router.post("/metrics/collect")
async def collect_system_metrics(db: Session = Depends(get_db)):
    """Collect current system metrics (called by monitoring service)"""

    # This would typically be called by a system monitoring service
    # For now, we'll generate mock data
    import random

    # Get current tool statuses
    tools = db.query(Tool).all()

    # Create metrics for each tool
    for tool in tools:
        metric = Metric(
            cpu_usage=random.randint(10, 90),
            memory_usage=random.randint(20, 85),
            disk_usage=random.randint(15, 75),
            network_rx=random.randint(1000, 100000),
            network_tx=random.randint(1000, 100000),
            active_connections=random.randint(1, 50),
            alerts_count=random.randint(0, 10),
            tool_name=tool.name,
            tool_status=tool.status
        )
        db.add(metric)

    db.commit()
    return {"message": "Metrics collected successfully"}


@router.get("/metrics/performance")
async def get_performance_metrics(hours: int = 24, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Get performance metrics for the specified time period"""

    time_ago = datetime.datetime.utcnow() - datetime.timedelta(hours=hours)

    metrics = db.query(Metric).filter(
        Metric.timestamp >= time_ago
    ).order_by(Metric.timestamp).all()

    # Aggregate metrics
    cpu_avg = sum(m.cpu_usage for m in metrics) / len(metrics) if metrics else 0
    memory_avg = sum(m.memory_usage for m in metrics) / len(metrics) if metrics else 0
    alerts_total = sum(m.alerts_count for m in metrics)

    return {
        "time_range": f"Last {hours} hours",
        "cpu_average": round(cpu_avg, 2),
        "memory_average": round(memory_avg, 2),
        "total_alerts": alerts_total,
        "data_points": len(metrics)
    }