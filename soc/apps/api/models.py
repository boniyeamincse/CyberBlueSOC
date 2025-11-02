from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    sub = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    roles = relationship("UserRole", back_populates="user")


class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)

    users = relationship("UserRole", back_populates="role")


class UserRole(Base):
    __tablename__ = "user_roles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    role_id = Column(Integer, ForeignKey("roles.id"))

    user = relationship("User", back_populates="roles")
    role = relationship("Role", back_populates="users")


class Tool(Base):
    __tablename__ = "tools"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(Text)
    status = Column(String, default="stopped")  # stopped, running, restarting
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_sub = Column(String)
    action = Column(String)
    resource = Column(String)
    details = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Metric(Base):
    __tablename__ = "metrics"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    cpu_usage = Column(Integer)  # Percentage
    memory_usage = Column(Integer)  # Percentage
    disk_usage = Column(Integer)  # Percentage
    network_rx = Column(Integer)  # Bytes
    network_tx = Column(Integer)  # Bytes
    active_connections = Column(Integer)
    alerts_count = Column(Integer, default=0)
    tool_name = Column(String)  # Which tool this metric relates to
    tool_status = Column(String)  # Current status of the tool


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(Text)
    severity = Column(String)  # low, medium, high, critical
    status = Column(String, default="open")  # open, investigating, resolved, closed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    assigned_to = Column(String)  # User sub
    tags = Column(String)  # JSON array of tags


class IOC(Base):
    __tablename__ = "iocs"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String)  # ip, domain, hash, url, etc.
    value = Column(String)
    severity = Column(String, default="medium")
    source = Column(String)  # Source of the IOC (e.g., MISP, custom, etc.)
    status = Column(String, default="active")  # active, false_positive, resolved
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_seen = Column(DateTime(timezone=True))
    confidence = Column(Integer, default=50)  # 0-100
    tags = Column(String)  # JSON array of tags