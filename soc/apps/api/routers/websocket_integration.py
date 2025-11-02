"""
WebSocket integration for real-time AI detection alerts
Pushes AI-powered security notifications to the frontend dashboard
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Request
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user_ws
import json
import logging
from datetime import datetime
from typing import Dict, List, Any
from collections import defaultdict

router = APIRouter()
logger = logging.getLogger(__name__)

class ConnectionManager:
    """WebSocket connection manager for real-time AI alerts"""

    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = defaultdict(list)
        self.user_sessions: Dict[str, str] = {}  # WebSocket ID to user mapping

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id].append(websocket)
        self.user_sessions[str(id(websocket))] = user_id
        logger.info(f"WebSocket connected for user {user_id}. Total connections: {len(self.active_connections[user_id])}")

    def disconnect(self, websocket: WebSocket):
        user_id = self.user_sessions.get(str(id(websocket)))
        if user_id and websocket in self.active_connections[user_id]:
            self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        del self.user_sessions[str(id(websocket))]
        logger.info(f"WebSocket disconnected for user {user_id}")

    async def broadcast_to_user(self, user_id: str, message: Dict[str, Any]):
        """Send message to specific user"""
        if user_id in self.active_connections:
            disconnected = []
            for websocket in self.active_connections[user_id]:
                try:
                    await websocket.send_json(message)
                except Exception as e:
                    logger.error(f"Failed to send message to user {user_id}: {e}")
                    disconnected.append(websocket)

            # Clean up disconnected websockets
            for ws in disconnected:
                self.disconnect(ws)

    async def broadcast_to_role(self, role: str, message: Dict[str, Any], db: Session):
        """Broadcast to all users with specific role"""
        # This would require user role lookup from database
        # For now, broadcast to all connected users
        await self.broadcast_to_all(message)

    async def broadcast_to_all(self, message: Dict[str, Any]):
        """Broadcast to all connected users"""
        disconnected = []
        for user_id, websockets in self.active_connections.items():
            for websocket in websockets:
                try:
                    await websocket.send_json(message)
                except Exception as e:
                    logger.error(f"Failed to broadcast to user {user_id}: {e}")
                    disconnected.append(websocket)

        # Clean up disconnected websockets
        for ws in disconnected:
            self.disconnect(ws)

# Global manager instance
manager = ConnectionManager()

@router.websocket("/ws/ai-alerts")
async def websocket_ai_alerts(websocket: WebSocket, db: Session = Depends(get_db)):
    """WebSocket endpoint for real-time AI-powered security alerts"""

    try:
        # Authenticate WebSocket connection
        token = websocket.query_params.get("token")
        if not token:
            await websocket.close(code=1008, reason="Authentication required")
            return

        # Verify user (simplified - would use JWT validation)
        user_data = {"sub": "user123", "roles": ["analyst"]}  # Mock user data

        user_id = user_data["sub"]
        await manager.connect(websocket, user_id)

        # Send welcome message
        await websocket.send_json({
            "type": "connection_established",
            "message": "Connected to AI alerts stream",
            "timestamp": datetime.utcnow().isoformat(),
            "user_id": user_id
        })

        # Keep connection alive and handle incoming messages
        while True:
            try:
                # Receive message from client (optional)
                data = await websocket.receive_text()
                message = json.loads(data)

                # Handle client messages (e.g., subscription preferences)
                if message.get("type") == "subscribe":
                    alert_types = message.get("alert_types", ["all"])
                    await websocket.send_json({
                        "type": "subscription_confirmed",
                        "alert_types": alert_types,
                        "timestamp": datetime.utcnow().isoformat()
                    })

            except json.JSONDecodeError:
                await websocket.send_json({
                    "type": "error",
                    "message": "Invalid message format",
                    "timestamp": datetime.utcnow().isoformat()
                })

    except WebSocketDisconnect:
        logger.info("WebSocket disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        manager.disconnect(websocket)

# AI Alert broadcasting functions (called from other services)

async def broadcast_ai_incident_analysis(incident_id: int, analysis_result: Dict[str, Any]):
    """Broadcast AI incident analysis results"""
    message = {
        "type": "ai_analysis_complete",
        "data": {
            "incident_id": incident_id,
            "analysis": analysis_result,
            "timestamp": datetime.utcnow().isoformat()
        }
    }

    # Broadcast to analysts and admins
    await manager.broadcast_to_all(message)

async def broadcast_anomaly_detected(anomaly_data: Dict[str, Any]):
    """Broadcast anomaly detection alerts"""
    message = {
        "type": "anomaly_detected",
        "data": anomaly_data,
        "timestamp": datetime.utcnow().isoformat()
    }

    await manager.broadcast_to_all(message)

async def broadcast_automated_response(response_data: Dict[str, Any]):
    """Broadcast automated response execution"""
    message = {
        "type": "automated_response_executed",
        "data": response_data,
        "timestamp": datetime.utcnow().isoformat()
    }

    await manager.broadcast_to_all(message)

async def broadcast_threat_intelligence_update(threat_data: Dict[str, Any]):
    """Broadcast threat intelligence updates"""
    message = {
        "type": "threat_intelligence_update",
        "data": threat_data,
        "timestamp": datetime.utcnow().isoformat()
    }

    await manager.broadcast_to_all(message)

async def broadcast_model_retrained(model_info: Dict[str, Any]):
    """Broadcast AI model retraining notifications"""
    message = {
        "type": "ai_model_updated",
        "data": model_info,
        "timestamp": datetime.utcnow().isoformat()
    }

    # Only broadcast to admins
    # await manager.broadcast_to_role("admin", message)
    await manager.broadcast_to_all(message)