from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.middleware import SlowAPIMiddleware
from slowapi.errors import RateLimitExceeded
from routers.auth import router as auth_router
from routers.tools import router as tools_router
from routers.actions import router as actions_router
from routers.metrics import router as metrics_router
from routers.audit import router as audit_router
from routers.incidents import router as incidents_router
from routers.export import router as export_router
from websocket import websocket_status_endpoint
from config import settings

app = FastAPI(title="CyberBlue SOC API", version="1.0.0")

# Rate limiting
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api", tags=["auth"])
app.include_router(tools_router, prefix="/api", tags=["tools"])
app.include_router(actions_router, prefix="/api", tags=["actions"])
app.include_router(metrics_router, prefix="/api", tags=["metrics"])
app.include_router(audit_router, prefix="/api", tags=["audit"])
app.include_router(incidents_router, prefix="/api", tags=["incidents"])
app.include_router(export_router, prefix="/api", tags=["export"])

@app.get("/")
async def root():
    return {"message": "Hello from CyberBlue SOC API!"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.websocket("/ws/status")
async def websocket_status(websocket):
    await websocket_status_endpoint(websocket)