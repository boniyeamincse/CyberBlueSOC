from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from database import get_db
from models import Incident, AuditLog
from auth import get_current_user, requires_roles
from typing import List, Dict, Any
from pydantic import BaseModel

router = APIRouter()

class CreateCaseRequest(BaseModel):
    title: str
    description: str
    severity: str = "medium"
    alert_id: str = None
    source: str = "cyberbluesoc"

class IncidentResponse(BaseModel):
    id: int
    title: str
    description: str
    severity: str
    status: str
    created_at: str
    assigned_to: str = None
    tags: str = None

@router.post("/incidents", response_model=IncidentResponse)
@requires_roles(["admin", "analyst"])
async def create_incident(
    request: CreateCaseRequest,
    req: Request,
    db: Session = Depends(get_db)
):
    """Create a new incident/case from alert or manual creation"""

    user_data = get_current_user(req)
    client_ip = req.client.host if req.client else "unknown"

    # Create incident
    incident = Incident(
        title=request.title,
        description=request.description,
        severity=request.severity,
        tags=f"source:{request.source}" + (f",alert_id:{request.alert_id}" if request.alert_id else "")
    )

    db.add(incident)
    db.commit()
    db.refresh(incident)

    # Log the action
    audit_log = AuditLog(
        user_sub=user_data["sub"],
        action="create_incident",
        resource=f"incident:{incident.id}",
        details=f"Created incident '{request.title}' from {client_ip}"
    )
    db.add(audit_log)
    db.commit()

    return IncidentResponse(
        id=incident.id,
        title=incident.title,
        description=incident.description,
        severity=incident.severity,
        status=incident.status,
        created_at=incident.created_at.isoformat(),
        assigned_to=incident.assigned_to,
        tags=incident.tags
    )

@router.get("/incidents")
@requires_roles(["admin", "analyst", "manager"])
async def get_incidents(
    status: str = None,
    severity: str = None,
    limit: int = 50,
    db: Session = Depends(get_db)
) -> List[IncidentResponse]:
    """Get incidents/cases with filtering"""

    query = db.query(Incident)

    if status:
        query = query.filter(Incident.status == status)
    if severity:
        query = query.filter(Incident.severity == severity)

    incidents = query.order_by(Incident.created_at.desc()).limit(limit).all()

    return [
        IncidentResponse(
            id=inc.id,
            title=inc.title,
            description=inc.description,
            severity=inc.severity,
            status=inc.status,
            created_at=inc.created_at.isoformat(),
            assigned_to=inc.assigned_to,
            tags=inc.tags
        )
        for inc in incidents
    ]

@router.put("/incidents/{incident_id}/status")
@requires_roles(["admin", "analyst"])
async def update_incident_status(
    incident_id: int,
    status: str,
    req: Request,
    db: Session = Depends(get_db)
):
    """Update incident status"""

    if status not in ["open", "investigating", "resolved", "closed"]:
        raise HTTPException(status_code=400, detail="Invalid status")

    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    user_data = get_current_user(req)
    client_ip = req.client.host if req.client else "unknown"

    old_status = incident.status
    incident.status = status

    db.commit()

    # Log the action
    audit_log = AuditLog(
        user_sub=user_data["sub"],
        action="update_incident_status",
        resource=f"incident:{incident_id}",
        details=f"Changed status from '{old_status}' to '{status}' from {client_ip}"
    )
    db.add(audit_log)
    db.commit()

    return {"message": f"Incident status updated to {status}"}

@router.post("/incidents/from-alert")
@requires_roles(["admin", "analyst"])
async def create_case_from_alert(
    alert_data: Dict[str, Any],
    req: Request,
    db: Session = Depends(get_db)
):
    """Create incident from Wazuh alert or other alert source"""

    # Extract alert information
    alert_id = alert_data.get("id", "unknown")
    title = alert_data.get("rule", {}).get("description", f"Security Alert {alert_id}")
    description = f"Alert ID: {alert_id}\nRule Level: {alert_data.get('rule', {}).get('level', 'unknown')}\nAgent: {alert_data.get('agent', {}).get('name', 'unknown')}"

    # Determine severity
    rule_level = alert_data.get("rule", {}).get("level", 5)
    if rule_level >= 12:
        severity = "critical"
    elif rule_level >= 8:
        severity = "high"
    elif rule_level >= 5:
        severity = "medium"
    else:
        severity = "low"

    # Create the incident
    create_request = CreateCaseRequest(
        title=f"[ALERT] {title}",
        description=description,
        severity=severity,
        alert_id=str(alert_id),
        source="wazuh"
    )

    return await create_incident(create_request, req, db)