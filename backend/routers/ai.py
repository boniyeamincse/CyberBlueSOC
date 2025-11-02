from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..database import get_db
from ..models import Tool, AuditLog
from ..routers.auth import get_current_user
import openai
import json

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