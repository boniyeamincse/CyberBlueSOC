import asyncio
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Tool, Role

tools_data = [
    {"name": "Velociraptor", "description": "DFIR platform for live endpoint forensics and threat hunting"},
    {"name": "Wazuh Dashboard", "description": "SIEM dashboard for log analysis, alerting, and security monitoring"},
    {"name": "Shuffle", "description": "SOAR platform for building, testing, and deploying security workflows"},
    {"name": "MISP", "description": "Threat Intelligence Platform for sharing, storing, and correlating IOCs"},
    {"name": "CyberChef", "description": "Swiss Army Knife for data analysis, encoding, decoding, and forensics"},
    {"name": "TheHive", "description": "SOAR platform for Incident Response and Case Management"},
    {"name": "Cortex", "description": "Automated threat analysis platform with analyzers integrated for TheHive"},
    {"name": "FleetDM", "description": "Osquery-based endpoint visibility and fleet management platform"},
    {"name": "Arkime", "description": "Full packet capture and session engine for network analysis"},
    {"name": "Caldera", "description": "Automated adversary emulation platform for security testing"},
    {"name": "Evebox", "description": "Web-based viewer for Suricata EVE JSON logs and alert management"},
    {"name": "Wireshark", "description": "Protocol analyzer for deep packet inspection and network troubleshooting"},
]

roles_data = [
    {"name": "admin"},
    {"name": "user"},
]


def seed_db():
    db: Session = SessionLocal()
    try:
        # Seed roles
        for role_data in roles_data:
            role = Role(**role_data)
            db.merge(role)  # Use merge to avoid duplicates

        # Seed tools
        for tool_data in tools_data:
            tool = Tool(**tool_data)
            if not db.query(Tool).filter(Tool.name == tool.name).first():
                db.add(tool)

        db.commit()
        print("Database seeded successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_db()