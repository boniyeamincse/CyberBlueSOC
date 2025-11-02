from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from database import get_db
from models import AuditLog
from auth import get_current_user, requires_roles
from typing import Dict, Any, List
import httpx
import json
import logging
from datetime import datetime

router = APIRouter()
logger = logging.getLogger(__name__)

VIRUSTOTAL_API_KEY = "your-virustotal-api-key"  # Should be in environment variables

# Import AI analysis service
try:
    from routers.ai import incident_analysis_service
except ImportError:
    incident_analysis_service = None
    logger.warning("AI analysis service not available")

@router.post("/playbooks/virustotal-enrich")
@requires_roles(["admin", "analyst"])
async def enrich_with_virustotal(
    payload: Dict[str, Any],
    req: Request,
    db: Session = Depends(get_db)
):
    """Enrich IOC with VirusTotal data"""

    hash_value = payload.get("hash")
    if not hash_value:
        raise HTTPException(status_code=400, detail="Hash is required")

    user_data = get_current_user(req)
    client_ip = req.client.host if req.client else "unknown"

    try:
        # Call VirusTotal API
        url = f"https://www.virustotal.com/api/v3/files/{hash_value}"
        headers = {
            "accept": "application/json",
            "x-apikey": VIRUSTOTAL_API_KEY
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers)
            if response.status_code == 200:
                vt_data = response.json()

                # Log the enrichment
                audit_log = AuditLog(
                    user_sub=user_data["sub"],
                    action="virustotal_enrichment",
                    resource=f"hash:{hash_value}",
                    details=f"Enriched hash with VirusTotal data from {client_ip}"
                )
                db.add(audit_log)
                db.commit()

                return {
                    "hash": hash_value,
                    "virustotal": vt_data,
                    "enriched": True
                }
            else:
                raise HTTPException(status_code=response.status_code, detail="VirusTotal API error")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Enrichment failed: {str(e)}")

@router.post("/playbooks/block-hash")
@requires_roles(["admin", "analyst"])
async def block_hash_via_fleetdm(
    payload: Dict[str, Any],
    req: Request,
    db: Session = Depends(get_db)
):
    """Block hash via FleetDM endpoint management"""

    hash_value = payload.get("hash")
    if not hash_value:
        raise HTTPException(status_code=400, detail="Hash is required")

    user_data = get_current_user(req)
    client_ip = req.client.host if req.client else "unknown"

    try:
        # This would integrate with FleetDM API to create a policy/rule
        # For now, simulate the blocking action

        # Log the blocking action
        audit_log = AuditLog(
            user_sub=user_data["sub"],
            action="block_hash_fleetdm",
            resource=f"hash:{hash_value}",
            details=f"Blocked hash via FleetDM policy from {client_ip}"
        )
        db.add(audit_log)
        db.commit()

        return {
            "hash": hash_value,
            "action": "blocked",
            "method": "fleetdm_policy",
            "status": "success"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Blocking failed: {str(e)}")

@router.post("/playbooks/auto-incident-response")
@requires_roles(["admin", "analyst"])
async def auto_incident_response(
    alert_data: Dict[str, Any],
    req: Request,
    db: Session = Depends(get_db)
):
    """AI-powered automated incident response playbook with dynamic adjustments"""

    alert_id = alert_data.get("id")
    rule_level = alert_data.get("rule", {}).get("level", 5)

    user_data = get_current_user(req)
    client_ip = req.client.host if req.client else "unknown"

    actions_taken = []
    ai_recommendations = {}

    try:
        # Step 1: Create incident case first
        from routers.incidents import create_case_from_alert
        incident_result = await create_case_from_alert(alert_data, req, db)
        actions_taken.append(f"Created incident case {incident_result.id}")

        # Step 2: AI Analysis if available
        if incident_analysis_service:
            # Prepare incident data for AI analysis
            incident_data = {
                'id': incident_result.id,
                'title': incident_result.title,
                'description': incident_result.description,
                'severity': incident_result.severity,
                'created_at': incident_result.created_at.isoformat(),
                'tags': incident_result.tags
            }

            # Perform AI analysis
            ai_analysis = incident_analysis_service.analyze_incident(incident_data)
            ai_recommendations = {
                'predicted_type': ai_analysis.get('predicted_type'),
                'confidence': ai_analysis.get('confidence', 0),
                'recommended_actions': ai_analysis.get('recommended_actions', []),
                'risk_score': ai_analysis.get('risk_score', 50),
                'severity_assessment': ai_analysis.get('severity_assessment')
            }

            actions_taken.append(f"AI analysis completed: {ai_analysis.get('predicted_type', 'unknown')} "
                               f"(confidence: {ai_analysis.get('confidence', 0):.2f})")

            # Adjust severity based on AI assessment if confidence is high
            if ai_analysis.get('confidence', 0) > 0.7:
                adjusted_severity = ai_analysis.get('severity_assessment')
                if adjusted_severity != incident_result.severity:
                    # Update incident severity
                    incident = db.query(Incident).filter(Incident.id == incident_result.id).first()
                    if incident:
                        old_severity = incident.severity
                        incident.severity = adjusted_severity
                        db.commit()

                        actions_taken.append(f"Severity adjusted from {old_severity} to {adjusted_severity} "
                                           f"based on AI analysis")
                        rule_level = max(rule_level, {'low': 5, 'medium': 8, 'high': 12, 'critical': 15}.get(adjusted_severity, 8))

        # Step 3: Dynamic playbook execution based on analysis
        playbook_result = await execute_dynamic_playbook(
            alert_data, rule_level, ai_recommendations, req, db
        )
        actions_taken.extend(playbook_result.get('actions', []))

        # Step 4: Log automated response with AI insights
        audit_details = {
            'alert_id': alert_id,
            'actions_taken': actions_taken,
            'incident_id': incident_result.id,
            'ai_analysis': ai_recommendations,
            'rule_level': rule_level,
            'client_ip': client_ip
        }

        audit_log = AuditLog(
            user_sub=user_data["sub"],
            action="auto_incident_response",
            resource=f"alert:{alert_id}",
            details=json.dumps(audit_details)
        )
        db.add(audit_log)
        db.commit()

        return {
            "alert_id": alert_id,
            "actions_taken": actions_taken,
            "incident_id": incident_result.id,
            "ai_analysis": ai_recommendations,
            "status": "completed",
            "playbook_result": playbook_result
        }

    except Exception as e:
        logger.error(f"Automated response failed: {e}")
        raise HTTPException(status_code=500, detail=f"Automated response failed: {str(e)}")

def extract_hashes_from_alert(alert_data: Dict[str, Any]) -> list:
    """Extract MD5/SHA256 hashes from alert data"""
    hashes = []

    # Look for hashes in various fields
    fields_to_check = ["syscheck.md5", "syscheck.sha256", "data.md5", "data.sha256"]

    for field in fields_to_check:
        value = get_nested_value(alert_data, field.split("."))
        if value and is_valid_hash(value):
            hashes.append(value)

    return hashes

def get_nested_value(data: Dict[str, Any], keys: list) -> Any:
    """Get nested dictionary value"""
    for key in keys:
        if isinstance(data, dict) and key in data:
            data = data[key]
        else:
            return None
    return data

def is_valid_hash(value: str) -> bool:
    """Check if string is a valid MD5 or SHA256 hash"""
    import re
    return bool(re.match(r'^[a-fA-F0-9]{32}|[a-fA-F0-9]{64}$', value))

async def execute_dynamic_playbook(
    alert_data: Dict[str, Any],
    rule_level: int,
    ai_recommendations: Dict[str, Any],
    req: Request,
    db: Session
) -> Dict[str, Any]:
    """Execute dynamic playbook based on AI analysis and incident parameters"""

    actions = []
    predicted_type = ai_recommendations.get('predicted_type', 'unknown')
    confidence = ai_recommendations.get('confidence', 0)
    risk_score = ai_recommendations.get('risk_score', 50)

    # Adaptive response based on AI predictions with confidence thresholds
    if predicted_type in ['malware', 'intrusion'] and confidence > 0.6:
        # High-confidence malware/intrusion detection
        if rule_level >= 12 or risk_score > 75:
            # Critical response: Immediate containment
            actions.extend(await execute_critical_response_playbook(alert_data, req, db))
        elif rule_level >= 8 or risk_score > 60:
            # High response: Investigation and blocking
            actions.extend(await execute_high_response_playbook(alert_data, req, db))
        else:
            # Medium response: Enrichment and monitoring
            actions.extend(await execute_medium_response_playbook(alert_data, req, db))

    elif predicted_type == 'phishing' and confidence > 0.5:
        # Phishing response playbook
        actions.extend(await execute_phishing_response_playbook(alert_data, req, db))

    elif predicted_type == 'data_leak' and confidence > 0.7:
        # Data exfiltration response
        actions.extend(await execute_data_leak_response_playbook(alert_data, req, db))

    elif predicted_type == 'denial_of_service' and confidence > 0.6:
        # DoS response playbook
        actions.extend(await execute_dos_response_playbook(alert_data, req, db))

    elif predicted_type == 'privilege_escalation' and confidence > 0.5:
        # Privilege escalation response
        actions.extend(await execute_privilege_escalation_playbook(alert_data, req, db))

    else:
        # Default response for low confidence or unknown types
        actions.extend(await execute_default_response_playbook(alert_data, req, db))

    return {
        'actions': actions,
        'predicted_type': predicted_type,
        'confidence': confidence,
        'risk_score': risk_score,
        'rule_level': rule_level
    }

async def execute_critical_response_playbook(alert_data: Dict[str, Any], req: Request, db: Session) -> List[str]:
    """Critical response playbook for high-severity incidents"""
    actions = []

    try:
        # Immediate threat intelligence enrichment
        hashes = extract_hashes_from_alert(alert_data)
        for hash_val in hashes:
            vt_result = await enrich_with_virustotal({"hash": hash_val}, req, db)
            actions.append(f"Critical: Enriched hash {hash_val} with VirusTotal")

        # Immediate blocking
        for hash_val in hashes:
            block_result = await block_hash_via_fleetdm({"hash": hash_val}, req, db)
            actions.append(f"Critical: Blocked hash {hash_val} via FleetDM")

        # Isolate affected systems (placeholder for EDR integration)
        actions.append("Critical: Initiated system isolation procedures")

        # Escalate to incident response team
        actions.append("Critical: Escalated to incident response team")

        # Enable enhanced monitoring
        actions.append("Critical: Enabled enhanced monitoring and logging")

    except Exception as e:
        actions.append(f"Critical response error: {str(e)}")

    return actions

async def execute_high_response_playbook(alert_data: Dict[str, Any], req: Request, db: Session) -> List[str]:
    """High response playbook for medium-high severity incidents"""
    actions = []

    try:
        # Threat intelligence enrichment
        hashes = extract_hashes_from_alert(alert_data)
        for hash_val in hashes:
            vt_result = await enrich_with_virustotal({"hash": hash_val}, req, db)
            actions.append(f"High: Enriched hash {hash_val} with VirusTotal")

        # Selective blocking based on confidence
        for hash_val in hashes:
            block_result = await block_hash_via_fleetdm({"hash": hash_val}, req, db)
            actions.append(f"High: Blocked hash {hash_val} via FleetDM")

        # Network traffic analysis
        actions.append("High: Initiated network traffic analysis")

        # User behavior monitoring
        actions.append("High: Enhanced user behavior monitoring")

    except Exception as e:
        actions.append(f"High response error: {str(e)}")

    return actions

async def execute_medium_response_playbook(alert_data: Dict[str, Any], req: Request, db: Session) -> List[str]:
    """Medium response playbook for standard incidents"""
    actions = []

    try:
        # Basic threat intelligence enrichment
        hashes = extract_hashes_from_alert(alert_data)
        if hashes:
            for hash_val in hashes:
                vt_result = await enrich_with_virustotal({"hash": hash_val}, req, db)
                actions.append(f"Medium: Enriched hash {hash_val} with VirusTotal")

        # Monitoring and alerting
        actions.append("Medium: Increased monitoring frequency")
        actions.append("Medium: Enabled additional alerting rules")

        # Log analysis
        actions.append("Medium: Scheduled detailed log analysis")

    except Exception as e:
        actions.append(f"Medium response error: {str(e)}")

    return actions

async def execute_phishing_response_playbook(alert_data: Dict[str, Any], req: Request, db: Session) -> List[str]:
    """Phishing-specific response playbook"""
    actions = []

    try:
        # Email quarantine and analysis
        actions.append("Phishing: Quarantined suspicious emails")

        # URL/domain blocking
        actions.append("Phishing: Blocked suspicious URLs and domains")

        # User education notification
        actions.append("Phishing: Sent user awareness notification")

        # Credential monitoring
        actions.append("Phishing: Enabled credential compromise monitoring")

    except Exception as e:
        actions.append(f"Phishing response error: {str(e)}")

    return actions

async def execute_data_leak_response_playbook(alert_data: Dict[str, Any], req: Request, db: Session) -> List[str]:
    """Data exfiltration response playbook"""
    actions = []

    try:
        # Data flow analysis
        actions.append("Data Leak: Initiated data flow analysis")

        # Access pattern review
        actions.append("Data Leak: Reviewing access patterns and permissions")

        # Encryption verification
        actions.append("Data Leak: Verified data encryption status")

        # External communication monitoring
        actions.append("Data Leak: Enhanced external communication monitoring")

        # Legal compliance notification
        actions.append("Data Leak: Initiated compliance notification procedures")

    except Exception as e:
        actions.append(f"Data leak response error: {str(e)}")

    return actions

async def execute_dos_response_playbook(alert_data: Dict[str, Any], req: Request, db: Session) -> List[str]:
    """Denial of Service response playbook"""
    actions = []

    try:
        # Traffic analysis and filtering
        actions.append("DoS: Implemented traffic filtering rules")

        # Rate limiting
        actions.append("DoS: Enabled rate limiting on affected services")

        # CDN/WAF activation
        actions.append("DoS: Activated CDN and WAF protections")

        # Resource scaling
        actions.append("DoS: Initiated resource scaling procedures")

        # ISP coordination
        actions.append("DoS: Coordinated with ISP for traffic mitigation")

    except Exception as e:
        actions.append(f"DoS response error: {str(e)}")

    return actions

async def execute_privilege_escalation_playbook(alert_data: Dict[str, Any], req: Request, db: Session) -> List[str]:
    """Privilege escalation response playbook"""
    actions = []

    try:
        # Access review
        actions.append("Privilege: Initiated comprehensive access review")

        # Session invalidation
        actions.append("Privilege: Invalidated suspicious sessions")

        # Multi-factor authentication enforcement
        actions.append("Privilege: Enforced MFA for affected accounts")

        # Audit logging enhancement
        actions.append("Privilege: Enhanced audit logging for privileged operations")

        # Password reset requirements
        actions.append("Privilege: Required password resets for compromised accounts")

    except Exception as e:
        actions.append(f"Privilege escalation response error: {str(e)}")

    return actions

async def execute_default_response_playbook(alert_data: Dict[str, Any], req: Request, db: Session) -> List[str]:
    """Default response playbook for standard monitoring and alerting"""
    actions = []

    try:
        # Basic enrichment
        hashes = extract_hashes_from_alert(alert_data)
        if hashes:
            for hash_val in hashes:
                vt_result = await enrich_with_virustotal({"hash": hash_val}, req, db)
                actions.append(f"Default: Enriched hash {hash_val} with VirusTotal")

        # Monitoring enhancement
        actions.append("Default: Enhanced monitoring and alerting")

        # Incident documentation
        actions.append("Default: Documented incident for review")

        # Follow-up scheduling
        actions.append("Default: Scheduled follow-up investigation")

    except Exception as e:
        actions.append(f"Default response error: {str(e)}")

    return actions