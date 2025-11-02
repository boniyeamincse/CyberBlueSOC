from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
import uvicorn

from .config import settings
from .database import Base, get_db, engine
from .models import User, Role, Tool, AuditLog
from .routers import auth, tools, actions, metrics, ai
from .websocket import manager

app = FastAPI(title="CyberBlue SOC API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(tools.router, prefix="/tools", tags=["tools"])
app.include_router(actions.router, prefix="/actions", tags=["actions"])
app.include_router(metrics.router, prefix="/metrics", tags=["metrics"])
app.include_router(ai.router, prefix="/ai", tags=["ai"])

@app.on_event("startup")
async def startup_event():
    # Create database tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.websocket("/ws/tools")
async def websocket_endpoint(websocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(f"Tool status update: {data}")
    except Exception:
        manager.disconnect(websocket)

@app.get("/")
async def root():
    return {"message": "CyberBlue SOC API"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)