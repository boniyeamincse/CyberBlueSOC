from fastapi import WebSocket
import asyncio
import json
from database import get_db
from models import Tool
from sqlalchemy.orm import Session

connected_clients = set()


async def websocket_status_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_clients.add(websocket)

    try:
        while True:
            # Mock status updates every 5 seconds
            await asyncio.sleep(5)

            db: Session = next(get_db())
            tools = db.query(Tool).all()
            status_data = {
                "timestamp": asyncio.get_event_loop().time(),
                "tools": [
                    {
                        "id": tool.id,
                        "name": tool.name,
                        "status": tool.status
                    }
                    for tool in tools
                ]
            }

            # Send status to all connected clients
            for client in connected_clients.copy():
                try:
                    await client.send_json(status_data)
                except Exception:
                    connected_clients.discard(client)

    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        connected_clients.discard(websocket)