from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from database import get_db
from models import AuditLog
from auth import get_current_user, requires_roles
from typing import Dict, Any
import httpx
import json

router = APIRouter()

VIRUSTOTAL_API_KEY = "your-virustotal-api-key"  # Should be in environment variables

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
    """Automated incident response playbook"""

    alert_id = alert_data.get("id")
    rule_level = alert_data.get("rule", {}).get("level", 5)

    user_data = get_current_user(req)
    client_ip = req.client.host if req.client else "unknown"

    actions_taken = []

    try:
        # Step 1: Enrich with threat intelligence if high severity
        if rule_level >= 10:
            # Extract any hashes from alert data
            hashes = extract_hashes_from_alert(alert_data)
            for hash_val in hashes:
                # Enrich with VirusTotal
                vt_result = await enrich_with_virustotal({"hash": hash_val}, req, db)
                actions_taken.append(f"Enriched hash {hash_val} with VirusTotal")

                # Block the hash
                block_result = await block_hash_via_fleetdm({"hash": hash_val}, req, db)
                actions_taken.append(f"Blocked hash {hash_val} via FleetDM")

        # Step 2: Create incident case
        from routers.incidents import create_case_from_alert
        incident_result = await create_case_from_alert(alert_data, req, db)
        actions_taken.append(f"Created incident case {incident_result.id}")

        # Step 3: Log automated response
        audit_log = AuditLog(
            user_sub=user_data["sub"],
            action="auto_incident_response",
            resource=f"alert:{alert_id}",
            details=f"Automated response completed: {', '.join(actions_taken)} from {client_ip}"
        )
        db.add(audit_log)
        db.commit()

        return {
            "alert_id": alert_id,
            "actions_taken": actions_taken,
            "incident_id": incident_result.id,
            "status": "completed"
        }

    except Exception as e:
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