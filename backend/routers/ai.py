from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, desc
from ..database import get_db
from ..models import Tool, AuditLog, AnomalyDetection, AnomalySeverity
from ..routers.auth import get_current_user
from ..anomaly_detection import anomaly_service
import openai
import json
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter()

# Mock AI suggestions based on tool status and recent activity
def generate_smart_suggestions(tools, recent_logs):
    """Generate contextual suggestions based on current SOC state"""
    suggestions = []

    # Count running tools
    running_tools = [t for t in tools if t.status == "running"]
    stopped_tools = [t for t in tools if t.status == "stopped"]

    if len(running_tools) < 3:
        suggestions.append({
            "type": "action",
            "priority": "high",
            "title": "Increase Monitoring Coverage",
            "description": f"Only {len(running_tools)} tools are running. Consider starting key monitoring tools like Velociraptor or OSQuery.",
            "action": "start_tools"
        })

    if stopped_tools:
        suggestions.append({
            "type": "maintenance",
            "priority": "medium",
            "title": "Review Stopped Tools",
            "description": f"{len(stopped_tools)} tools are stopped. Check if they need to be restarted or if there are issues.",
            "action": "check_stopped_tools"
        })

    # Analyze recent activity patterns
    recent_actions = [log.action for log in recent_logs[-10:]]
    if recent_actions.count("start") > recent_actions.count("stop"):
        suggestions.append({
            "type": "optimization",
            "priority": "low",
            "title": "Tool Usage Analysis",
            "description": "High tool startup activity detected. Consider automating frequent tool management tasks.",
            "action": "review_automation"
        })

    return suggestions

@router.get("/suggestions")
async def get_smart_suggestions(db: AsyncSession = Depends(get_db), user: dict = Depends(get_current_user)):
    """Get AI-powered suggestions for SOC operations"""
    # Get current tool status
    result = await db.execute(select(Tool))
    tools = result.scalars().all()

    # Get recent audit logs
    result = await db.execute(
        select(AuditLog).order_by(AuditLog.timestamp.desc()).limit(20)
    )
    recent_logs = result.scalars().all()

    suggestions = generate_smart_suggestions(tools, recent_logs)

    return {
        "suggestions": suggestions,
        "timestamp": "2023-11-02T10:50:00Z"
    }

@router.post("/chat")
async def chat_with_ai(message: str, db: AsyncSession = Depends(get_db), user: dict = Depends(get_current_user)):
    """Chat with AI assistant for SOC guidance"""
    # Get context from current system state
    result = await db.execute(select(Tool))
    tools = result.scalars().all()

    system_context = f"""
    You are a SOC (Security Operations Center) AI assistant.
    Current system state:
    - Total tools: {len(tools)}
    - Running tools: {len([t for t in tools if t.status == 'running'])}
    - Stopped tools: {len([t for t in tools if t.status == 'stopped'])}
    - Tools: {', '.join([f"{t.name} ({t.status})" for t in tools])}

    Provide helpful, actionable advice for SOC operations.
    """

    # Mock AI response (in production, integrate with OpenAI/ChatGPT)
    responses = {
        "help": "I can help you with SOC operations, tool management, incident response, and security best practices. What would you like to know?",
        "tools": "I see you have several security tools configured. Would you like recommendations on which tools to start for comprehensive monitoring?",
        "incident": "For incident response, I recommend checking your running tools first, then collecting relevant logs and memory dumps. Would you like me to guide you through the process?",
        "default": "I'm here to help with your SOC operations. I can provide guidance on tool management, incident response, security monitoring, and best practices."
    }

    message_lower = message.lower()
    if "help" in message_lower:
        response = responses["help"]
    elif "tool" in message_lower:
        response = responses["tools"]
    elif "incident" in message_lower:
        response = responses["incident"]
    else:
        response = responses["default"]

    return {
        "response": response,
        "timestamp": "2023-11-02T10:50:00Z",
        "suggestions": []  # Could include follow-up actions
    }


# Anomaly Detection API Endpoints
class AnomalyAcknowledgeRequest(BaseModel):
    anomaly_ids: List[int]

class AnomalyFilterRequest(BaseModel):
    severity: Optional[str] = None
    acknowledged: Optional[bool] = None
    limit: int = 50

@router.get("/anomalies")
async def get_anomalies(
    filter_request: AnomalyFilterRequest = None,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Get detected anomalies with optional filtering"""
    if filter_request is None:
        filter_request = AnomalyFilterRequest()

    query = select(AnomalyDetection)

    # Apply filters
    if filter_request.severity:
        try:
            severity_enum = AnomalySeverity(filter_request.severity)
            query = query.where(AnomalyDetection.severity == severity_enum)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid severity value")

    if filter_request.acknowledged is not None:
        query = query.where(AnomalyDetection.acknowledged == filter_request.acknowledged)

    # Order by timestamp (most recent first)
    query = query.order_by(desc(AnomalyDetection.timestamp)).limit(filter_request.limit)

    result = await db.execute(query)
    anomalies = result.scalars().all()

    return {
        "anomalies": [
            {
                "id": a.id,
                "timestamp": a.timestamp.isoformat(),
                "type": a.type.value,
                "severity": a.severity.value,
                "score": a.score,
                "description": a.description,
                "details": a.details,
                "source": a.source,
                "acknowledged": a.acknowledged,
                "acknowledged_by": a.acknowledged_by,
                "acknowledged_at": a.acknowledged_at.isoformat() if a.acknowledged_at else None
            }
            for a in anomalies
        ],
        "total": len(anomalies)
    }

@router.post("/anomalies/acknowledge")
async def acknowledge_anomalies(
    request: AnomalyAcknowledgeRequest,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Acknowledge one or more anomalies"""
    # Get user ID from keycloak ID
    from ..models import User
    result = await db.execute(
        select(User).where(User.keycloak_id == user.get("sub"))
    )
    db_user = result.scalar_one_or_none()

    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Update anomalies
    query = select(AnomalyDetection).where(AnomalyDetection.id.in_(request.anomaly_ids))
    result = await db.execute(query)
    anomalies = result.scalars().all()

    updated_count = 0
    for anomaly in anomalies:
        if not anomaly.acknowledged:
            anomaly.acknowledged = True
            anomaly.acknowledged_by = db_user.id
            anomaly.acknowledged_at = datetime.utcnow()
            updated_count += 1

    await db.commit()

    return {
        "message": f"Acknowledged {updated_count} anomalies",
        "updated_count": updated_count
    }

@router.post("/anomalies/detect")
async def detect_anomalies_now(
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Trigger real-time anomaly detection on current system metrics"""
    try:
        # Process current metrics and detect anomalies
        detected_anomalies = await anomaly_service.process_current_metrics(db)

        return {
            "message": f"Detected {len(detected_anomalies)} anomalies",
            "anomalies": detected_anomalies
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Anomaly detection failed: {str(e)}")

@router.post("/anomalies/train")
async def train_anomaly_models(
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Train anomaly detection models with historical data"""
    try:
        await anomaly_service.train_all_models(db)
        return {
            "message": "Anomaly detection models trained successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model training failed: {str(e)}")

# Initialize anomaly detection service on startup
@router.on_event("startup")
async def startup_event():
    """Initialize anomaly detection service on application startup"""
    anomaly_service.load_models()