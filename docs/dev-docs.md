# CyberBlue SOC Developer Documentation

## Architecture Overview

### System Components

```mermaid
graph TB
    A[Internet] --> B[Traefik Reverse Proxy]
    B --> C[Web Frontend - React]
    B --> D[API Backend - FastAPI]
    B --> E[Keycloak Auth Service]
    B --> F[Grafana Monitoring]

    D --> G[PostgreSQL Database]
    D --> H[Redis Message Queue]

    I[Wazuh SIEM] --> D
    J[TheHive IR] --> D
    K[MISP Threat Intel] --> D
    L[OpenSearch] --> D
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React + TypeScript + Tailwind CSS | User interface and interactions |
| **Backend** | FastAPI + Python + SQLAlchemy | API services and business logic |
| **Database** | PostgreSQL + Alembic | Data persistence and migrations |
| **Authentication** | Keycloak + OIDC + JWT | Identity and access management |
| **Reverse Proxy** | Traefik | Load balancing and TLS termination |
| **Monitoring** | Prometheus + Grafana | Metrics and visualization |
| **Search** | OpenSearch | Log aggregation and analysis |
| **Container** | Docker + Docker Compose | Orchestration and deployment |

## Development Setup

### Prerequisites

```bash
# Required software
Node.js >= 18.0.0
Python >= 3.11.0
Docker >= 20.0.0
Docker Compose >= 2.0.0

# Verify installations
node --version
python --version
docker --version
docker compose version
```

### Local Development Environment

#### 1. Backend Setup

```bash
cd soc/apps/api

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL="postgresql://soc:change_me@localhost:5432/soc"
export OIDC_ISSUER="http://localhost:8080/realms/soc"
export OIDC_AUDIENCE="cyberbluesoc"

# Run database migrations
python seed.py

# Start development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### 2. Frontend Setup

```bash
cd soc/apps/web

# Install dependencies
npm install

# Start development server
npm run dev
```

#### 3. Services Setup

```bash
cd infrastructure

# Start required services
docker compose up -d db keycloak grafana opensearch

# Verify services are running
docker compose ps
```

### Development Workflow

#### Code Changes

```bash
# Backend changes
cd soc/apps/api
# Edit code
# Server auto-reloads with --reload flag

# Frontend changes
cd soc/apps/web
# Edit code
# Hot reload enabled by default
```

#### Database Migrations

```bash
cd soc/apps/api

# Create new migration
alembic revision -m "Add new table"

# Apply migrations
alembic upgrade head

# Rollback if needed
alembic downgrade -1
```

## API Development

### FastAPI Structure

```
soc/apps/api/
├── main.py              # Application entry point
├── config.py            # Configuration management
├── database.py          # Database connection
├── models.py            # SQLAlchemy models
├── auth.py              # Authentication middleware
├── routers/             # API route handlers
│   ├── auth.py          # Authentication endpoints
│   ├── tools.py         # Tool management
│   ├── actions.py       # Tool actions
│   ├── metrics.py       # System metrics
│   ├── incidents.py     # Incident management
│   ├── export.py        # Data export
│   └── audit.py         # Audit logging
└── seed.py              # Database seeding
```

### Creating New Endpoints

#### 1. Define Pydantic Models

```python
from pydantic import BaseModel
from typing import Optional

class ToolCreateRequest(BaseModel):
    name: str
    category: str
    description: Optional[str] = None

class ToolResponse(BaseModel):
    id: int
    name: str
    category: str
    description: str
    status: str
    created_at: str
```

#### 2. Create Router Handler

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Tool
from auth import requires_roles

router = APIRouter()

@router.post("/tools", response_model=ToolResponse)
@requires_roles(["admin"])
async def create_tool(
    request: ToolCreateRequest,
    db: Session = Depends(get_db)
):
    # Create new tool
    tool = Tool(
        name=request.name,
        category=request.category,
        description=request.description or ""
    )

    db.add(tool)
    db.commit()
    db.refresh(tool)

    return ToolResponse(
        id=tool.id,
        name=tool.name,
        category=tool.category,
        description=tool.description,
        status=tool.status,
        created_at=tool.created_at.isoformat()
    )
```

#### 3. Register Router

```python
# In main.py
from routers.tools import router as tools_router

app.include_router(tools_router, prefix="/api", tags=["tools"])
```

### Authentication & Authorization

#### JWT Token Validation

```python
from auth import get_current_user, requires_roles

@router.get("/protected")
async def protected_endpoint(
    current_user = Depends(get_current_user)
):
    return {"user": current_user}

@router.post("/admin-only")
@requires_roles(["admin"])
async def admin_endpoint():
    return {"message": "Admin access granted"}
```

#### Rate Limiting

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@router.get("/rate-limited")
@limiter.limit("10/minute")
async def rate_limited_endpoint():
    return {"message": "Rate limited endpoint"}
```

### Database Operations

#### SQLAlchemy Models

```python
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from database import Base

class CustomModel(Base):
    __tablename__ = "custom_table"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
```

#### CRUD Operations

```python
@router.get("/items")
async def get_items(db: Session = Depends(get_db)):
    return db.query(CustomModel).all()

@router.post("/items")
async def create_item(
    name: str,
    db: Session = Depends(get_db)
):
    item = CustomModel(name=name)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item
```

## Frontend Development

### React Component Structure

```
soc/apps/web/src/
├── components/          # Reusable components
│   ├── ui/             # Base UI components
│   ├── ToolCard.tsx    # Tool management
│   ├── MetricsDashboard.tsx
│   └── AuditLogViewer.tsx
├── pages/              # Page components
├── contexts/           # React contexts
├── hooks/              # Custom hooks
├── lib/                # Utilities
└── types/              # TypeScript definitions
```

### Component Development

#### Custom Hook Example

```typescript
// hooks/useTools.ts
import { useState, useEffect } from 'react';
import { Tool } from '@/types/tool';

export const useTools = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTools = async () => {
    try {
      const response = await fetch('/api/tools', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTools(data);
      }
    } catch (error) {
      console.error('Failed to fetch tools:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTools();
  }, []);

  return { tools, loading, refetch: fetchTools };
};
```

#### API Integration

```typescript
// lib/api.ts
const API_BASE = '/api';

export const apiClient = {
  async get(endpoint: string) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  },

  async post(endpoint: string, data: any) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }
};
```

### State Management

#### Context API Example

```typescript
// contexts/ToolsContext.tsx
import React, { createContext, useContext, useReducer } from 'react';

interface ToolsState {
  tools: Tool[];
  selectedTools: string[];
  loading: boolean;
}

type ToolsAction =
  | { type: 'SET_TOOLS'; payload: Tool[] }
  | { type: 'SELECT_TOOL'; payload: string }
  | { type: 'DESELECT_TOOL'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean };

const toolsReducer = (state: ToolsState, action: ToolsAction): ToolsState => {
  switch (action.type) {
    case 'SET_TOOLS':
      return { ...state, tools: action.payload };
    case 'SELECT_TOOL':
      return {
        ...state,
        selectedTools: [...state.selectedTools, action.payload]
      };
    case 'DESELECT_TOOL':
      return {
        ...state,
        selectedTools: state.selectedTools.filter(id => id !== action.payload)
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

const ToolsContext = createContext<{
  state: ToolsState;
  dispatch: React.Dispatch<ToolsAction>;
} | null>(null);

export const ToolsProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [state, dispatch] = useReducer(toolsReducer, {
    tools: [],
    selectedTools: [],
    loading: false
  });

  return (
    <ToolsContext.Provider value={{ state, dispatch }}>
      {children}
    </ToolsContext.Provider>
  );
};

export const useToolsContext = () => {
  const context = useContext(ToolsContext);
  if (!context) {
    throw new Error('useToolsContext must be used within ToolsProvider');
  }
  return context;
};
```

## Testing

### Backend Testing

#### Pytest Setup

```python
# tests/test_tools.py
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_get_tools():
    response = client.get("/api/tools")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_create_tool():
    tool_data = {
        "name": "Test Tool",
        "category": "Utility",
        "description": "Test description"
    }

    response = client.post("/api/tools", json=tool_data)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == tool_data["name"]
```

#### Running Tests

```bash
cd soc/apps/api

# Run all tests
pytest

# Run with coverage
pytest --cov=. --cov-report=html

# Run specific test
pytest tests/test_tools.py::test_get_tools
```

### Frontend Testing

#### Jest + React Testing Library

```typescript
// components/__tests__/ToolCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ToolCard } from '../ToolCard';

const mockTool: Tool = {
  id: '1',
  name: 'Test Tool',
  category: 'Utility',
  description: 'Test description',
  status: 'running',
  health: 'Optimal'
};

describe('ToolCard', () => {
  it('renders tool information', () => {
    render(
      <ToolCard
        tool={mockTool}
        isSelected={false}
        onSelect={() => {}}
        onAction={() => {}}
        onOpen={() => {}}
        onCredentials={() => {}}
        onInfo={() => {}}
      />
    );

    expect(screen.getByText('Test Tool')).toBeInTheDocument();
    expect(screen.getByText('Utility')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('calls onSelect when checkbox is clicked', () => {
    const mockOnSelect = jest.fn();
    render(
      <ToolCard
        tool={mockTool}
        isSelected={false}
        onSelect={mockOnSelect}
        onAction={() => {}}
        onOpen={() => {}}
        onCredentials={() => {}}
        onInfo={() => {}}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(mockOnSelect).toHaveBeenCalledTimes(1);
  });
});
```

#### Running Frontend Tests

```bash
cd soc/apps/web

# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test
npm test ToolCard.test.tsx
```

## Deployment

### Docker Development

#### Building Images

```bash
# Build API image
cd soc/apps/api
docker build -t cyberblue-api:latest .

# Build web image
cd soc/apps/web
docker build -t cyberblue-web:latest .
```

#### Local Testing

```bash
cd infrastructure

# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Run tests in containers
docker compose exec api pytest
```

### Production Deployment

#### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Test API
        run: |
          cd soc/apps/api
          pip install -r requirements.txt
          pytest
      - name: Test Frontend
        run: |
          cd soc/apps/web
          npm install
          npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Production
        run: |
          cd infrastructure
          docker compose pull
          docker compose up -d --build
```

#### Environment Management

```bash
# Environment validation
cd infrastructure

# Check environment variables
docker compose config

# Validate configuration
docker compose exec api python -c "import config; print('Config OK')"

# Health checks
curl https://api.soc.local/health
```

## Monitoring & Debugging

### Application Logs

```bash
# View API logs
docker compose logs -f api

# View web logs
docker compose logs -f web

# View all logs
docker compose logs -f

# Filter logs by time
docker compose logs --since "1h" api
```

### Performance Monitoring

```bash
# API performance
curl https://api.soc.local/api/metrics/performance?hours=1

# Database performance
docker compose exec db psql -U soc -d soc -c "SELECT * FROM pg_stat_activity;"

# System resources
docker stats
```

### Debug Mode

#### Backend Debug

```python
# Enable debug logging
import logging
logging.basicConfig(level=logging.DEBUG)

# Add debug endpoints
@app.get("/debug/routes")
async def debug_routes():
    return [{"path": route.path, "methods": route.methods} for route in app.routes]
```

#### Frontend Debug

```typescript
// Enable React dev tools
if (process.env.NODE_ENV === 'development') {
  // Debug helpers
  window.__CYBERBLUE_DEBUG__ = {
    version: '1.0.0',
    api: '/api',
    auth: '/auth'
  };
}
```

## Security Best Practices

### Input Validation

```python
from pydantic import BaseModel, validator

class SecureInput(BaseModel):
    name: str

    @validator('name')
    def name_must_be_safe(cls, v):
        if not v.replace(' ', '').replace('-', '').isalnum():
            raise ValueError('Name contains invalid characters')
        return v
```

### SQL Injection Prevention

```python
# Use SQLAlchemy ORM instead of raw SQL
# user_input = request.query_params.get('search')
# SAFE: db.query(Tool).filter(Tool.name.ilike(f"%{user_input}%"))

# Use parameterized queries
result = db.execute(
    text("SELECT * FROM tools WHERE name ILIKE :search"),
    {"search": f"%{user_input}%"}
)
```

### XSS Prevention

```typescript
// React automatically escapes content
const userContent = "<script>alert('xss')</script>";
return <div>{userContent}</div>; // Safe

// For dynamic HTML (rare)
import DOMPurify from 'dompurify';
const cleanHTML = DOMPurify.sanitize(dangerousHTML);
```

### Secure Headers

```python
from fastapi.middleware.trustedhost import TrustedHostMiddleware

# Add security middleware
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["soc.local"])

# CORS with specific origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://soc.local"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)
```

## Contributing

### Code Style

#### Python (PEP 8)

```bash
# Install black and isort
pip install black isort

# Format code
black soc/apps/api/
isort soc/apps/api/

# Check style
flake8 soc/apps/api/
mypy soc/apps/api/
```

#### TypeScript (Prettier)

```bash
# Install prettier
npm install -D prettier

# Format code
npx prettier --write "soc/apps/web/src/**/*.{ts,tsx}"

# Check formatting
npx prettier --check "soc/apps/web/src/**/*.{ts,tsx}"
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-component

# Commit changes
git add .
git commit -m "feat: Add new component

- Add component description
- Update tests
- Update documentation"

# Push branch
git push origin feature/new-component

# Create pull request
# Code review and merge
```

### Documentation

```bash
# Update API docs
cd soc/apps/api
python -c "from main import app; print(app.openapi())" > openapi.json

# Update README
# Update user guide
# Update admin guide
```

## Troubleshooting

### Common Development Issues

#### Module Not Found

```bash
# Backend
pip install -r requirements.txt

# Frontend
npm install

# Clear caches
rm -rf node_modules package-lock.json
npm install
```

#### Port Conflicts

```bash
# Find processes using ports
lsof -i :8000
lsof -i :3000

# Kill processes
kill -9 <PID>

# Or change ports in docker-compose.yml
```

#### Database Issues

```bash
# Reset database
docker compose down
docker volume rm cyberblue_pgdata
docker compose up -d db

# Re-run migrations
docker compose exec api python seed.py
```

#### Authentication Issues

```bash
# Check Keycloak logs
docker compose logs keycloak

# Verify realm configuration
curl http://localhost:8080/realms/soc

# Check JWT tokens
# Use browser dev tools → Network tab
```

### Performance Issues

#### Frontend

```bash
# Bundle analyzer
npm install -D webpack-bundle-analyzer
npm run build -- --analyze

# Lighthouse audit
npx lighthouse https://soc.local/
```

#### Backend

```bash
# Profiling
pip install py-spy
py-spy top --pid $(pgrep uvicorn)

# Memory profiling
pip install memory-profiler
python -m memory_profiler main.py
```

## API Documentation

### Interactive Documentation

```bash
# FastAPI automatic docs
open http://localhost:8000/docs

# Alternative docs
open http://localhost:8000/redoc
```

### External API Testing

```bash
# Postman collection
# Import cyberblue.postman_collection.json

# curl examples
curl -X GET "https://api.soc.local/api/tools" \
  -H "Authorization: Bearer $TOKEN"

# Newman (Postman CLI)
npm install -g newman
newman run cyberblue.postman_collection.json
```

## Deployment Checklist

### Pre-deployment

- [ ] Code reviewed and tested
- [ ] Security scan passed
- [ ] Documentation updated
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] SSL certificates valid

### Deployment Steps

- [ ] Backup current system
- [ ] Update infrastructure code
- [ ] Build new images
- [ ] Run database migrations
- [ ] Deploy new containers
- [ ] Verify health checks
- [ ] Update DNS if needed

### Post-deployment

- [ ] Monitor system health
- [ ] Check application logs
- [ ] Verify user access
- [ ] Performance testing
- [ ] Update monitoring dashboards