import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from models import Tool, Base
from config import settings

async def seed_tools():
    engine = create_async_engine(settings.database_url, echo=True)
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    tools_data = [
        {"name": "Velociraptor", "description": "Advanced digital forensics and incident response tool"},
        {"name": "Wazuh Dashboard", "description": "Security monitoring and compliance platform"},
        {"name": "Shuffle", "description": "SOAR platform for incident response automation"},
        {"name": "MISP", "description": "Open source threat intelligence platform"},
        {"name": "CyberChef", "description": "Web app for encryption, encoding, compression and data analysis"},
        {"name": "TheHive", "description": "Scalable Security Incident Response Platform"},
        {"name": "Cortex", "description": "Powerful observable analysis engine"},
        {"name": "FleetDM", "description": "Open source device management for computers and servers"},
        {"name": "Arkime", "description": "Large scale packet capture and search tool"},
        {"name": "Caldera", "description": "Automated Adversary Emulation Platform"},
        {"name": "Evebox", "description": "Web based alert and event management tool"},
        {"name": "Wireshark", "description": "Network protocol analyzer"}
    ]
    
    async with async_session() as session:
        for tool_data in tools_data:
            tool = Tool(**tool_data)
            session.add(tool)
        await session.commit()
    
    print("Seeded 12 tools successfully!")

if __name__ == "__main__":
    asyncio.run(seed_tools())