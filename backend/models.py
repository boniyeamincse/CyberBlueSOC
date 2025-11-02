from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Text, Float
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from .database import Base

class RoleEnum(enum.Enum):
    admin = "admin"
    analyst = "analyst"
    manager = "manager"

class ToolStatus(enum.Enum):
    running = "running"
    stopped = "stopped"
    restarting = "restarting"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    keycloak_id = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    first_name = Column(String)
    last_name = Column(String)
    role = Column(Enum(RoleEnum), default=RoleEnum.analyst)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String)

class Tool(Base):
    __tablename__ = "tools"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(Text)
    status = Column(Enum(ToolStatus), default=ToolStatus.stopped)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String)
    resource = Column(String)
    details = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")

class SystemMetrics(Base):
    __tablename__ = "system_metrics"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    active_agents = Column(Integer)
    cpu_percent = Column(Float)
    memory_percent = Column(Float)
    memory_used = Column(Float)
    memory_total = Column(Float)
    uptime = Column(Float)
    response_time = Column(Float)

class AnomalySeverity(enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"

class AnomalyType(enum.Enum):
    cpu_spike = "cpu_spike"
    memory_anomaly = "memory_anomaly"
    login_anomaly = "login_anomaly"
    network_traffic = "network_traffic"
    data_exfiltration = "data_exfiltration"
    other = "other"

class AnomalyDetection(Base):
    __tablename__ = "anomaly_detections"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    type = Column(Enum(AnomalyType), nullable=False)
    severity = Column(Enum(AnomalySeverity), nullable=False)
    score = Column(Float, nullable=False)  # Anomaly score from ML model
    description = Column(Text, nullable=False)
    details = Column(Text)  # Additional context/details
    source = Column(String, nullable=False)  # e.g., "system_logs", "network_traffic", "metrics"
    acknowledged = Column(String, default=False)  # Whether the anomaly has been reviewed
    acknowledged_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    acknowledged_at = Column(DateTime, nullable=True)

    acknowledged_user = relationship("User")