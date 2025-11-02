from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from models import Tool
from auth import requires_roles
import csv
import io
from typing import List

router = APIRouter()

@router.get("/export/csv")
@requires_roles(["admin", "analyst", "manager"])
async def export_tools_csv(
    status: str = Query("all", description="Filter by status: all, running, stopped"),
    category: str = Query("all", description="Filter by category"),
    db: Session = Depends(get_db)
):
    """Export visible tools to CSV format"""

    # Build query with filters
    query = db.query(Tool)

    if status != "all":
        query = query.filter(Tool.status == status)

    if category != "all":
        query = query.filter(Tool.category == category)

    tools = query.all()

    if not tools:
        raise HTTPException(status_code=404, detail="No tools found matching the criteria")

    # Create CSV content
    output = io.StringIO()
    writer = csv.writer(output)

    # Write header
    writer.writerow([
        "ID", "Name", "Category", "Description", "Status", "Health",
        "Uptime (Minutes)", "Critical", "Tags", "Created At"
    ])

    # Write data rows
    for tool in tools:
        tags_str = ",".join(tool.tags) if tool.tags else ""
        writer.writerow([
            tool.id,
            tool.name,
            tool.category,
            tool.description,
            tool.status,
            tool.health if hasattr(tool, 'health') else "Unknown",
            tool.uptimeMinutes if hasattr(tool, 'uptimeMinutes') else "",
            tool.critical if hasattr(tool, 'critical') else False,
            tags_str,
            tool.created_at.strftime("%Y-%m-%d %H:%M:%S") if tool.created_at else ""
        ])

    csv_content = output.getvalue()
    output.close()

    # Return as downloadable file
    from fastapi.responses import StreamingResponse

    def iter_csv():
        yield csv_content

    return StreamingResponse(
        iter_csv(),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=cyberblue-tools-{status}-{category}.csv"
        }
    )

@router.get("/export/json")
@requires_roles(["admin", "analyst", "manager"])
async def export_tools_json(
    status: str = Query("all"),
    category: str = Query("all"),
    db: Session = Depends(get_db)
) -> List[dict]:
    """Export visible tools to JSON format"""

    query = db.query(Tool)

    if status != "all":
        query = query.filter(Tool.status == status)

    if category != "all":
        query = query.filter(Tool.category == category)

    tools = query.all()

    return [
        {
            "id": tool.id,
            "name": tool.name,
            "category": tool.category,
            "description": tool.description,
            "status": tool.status,
            "health": tool.health if hasattr(tool, 'health') else "Unknown",
            "uptimeMinutes": tool.uptimeMinutes if hasattr(tool, 'uptimeMinutes') else None,
            "critical": tool.critical if hasattr(tool, 'critical') else False,
            "tags": tool.tags,
            "created_at": tool.created_at.isoformat() if tool.created_at else None
        }
        for tool in tools
    ]