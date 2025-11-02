# CyberBlue SOC Platform

## What It Is

CyberBlue is a modern, containerized Security Operations Center (SOC) platform that provides a unified dashboard for managing and monitoring cybersecurity tools. Built with a microservices architecture, it offers role-based access control, real-time monitoring, and automated tool management for SOC teams.

**Key Capabilities:**
- Unified SOC tool management and monitoring
- Role-based access control (Admin/Analyst/Manager)
- Real-time dashboards and metrics
- Automated audit logging for compliance
- Production-ready with security hardening
- Extensible architecture for adding new tools

## Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | React + TypeScript + Tailwind CSS | SOC Dashboard & Tool Management |
| **Backend** | FastAPI + Python + SQLAlchemy | REST API & Business Logic |
| **Database** | PostgreSQL | User data, audit logs, metrics |
| **Auth** | Keycloak + OIDC + JWT | Authentication & Authorization |
| **Reverse Proxy** | Traefik | Load balancing & TLS termination |
| **Monitoring** | Prometheus + Grafana | Metrics & Dashboards |
| **Search** | OpenSearch | Log aggregation & analysis |
| **Container** | Docker + Docker Compose | Orchestration & Deployment |
| **WebSocket** | Native WebSocket | Real-time tool status updates |
| **Documentation** | Markdown + SVG | User guides, API docs, architecture |

## Prerequisites

- **Docker & Docker Compose**: Latest versions
- **Node.js 18+**: For local frontend development
- **Python 3.11+**: For local backend development
- **8GB RAM**: Minimum for running all SOC services (12GB recommended)
- **20GB Disk Space**: For containers, databases, and logs (50GB recommended for production)
- **4 CPU Cores**: Minimum (8 cores recommended for production workloads)

### Recommended Ports

**External Access:**
- **443 (HTTPS)**: Main access port via Traefik reverse proxy

**Internal Service Ports:**
- **Keycloak**: 8080 (HTTP), 8443 (HTTPS)
- **API Backend**: 8000 (FastAPI), 443 (HTTPS via reverse proxy)
- **PostgreSQL**: 5432
- **Wazuh**: 55000 (API), 1514/UDP (agents), 1515/TCP (agents)
- **OpenSearch/Elasticsearch**: 9200 (HTTP), 9300 (transport)
- **FleetDM**: 8080
- **Osquery TLS**: 8080
- **Grafana**: 3000
- **Kibana**: 5601 (if used)
- **Suricata EVE**: Local file/Unix socket → Filebeat ingestion

### System Requirements

```bash
# Check Docker
docker --version
docker compose version

# Check Node.js (for local dev)
node --version  # Should be 18+
npm --version

# Check Python (for local dev)
python --version  # Should be 3.11+
```

## Quick Start (Docker Compose)

### Production Deployment

1. **Clone & Navigate**:
   ```bash
   git clone <repository>
   cd cyberblue-soc/infrastructure
   ```

2. **Configure Environment**:
   ```bash
   cp .env.example .env
   # Edit .env with secure passwords
   ```

3. **Update Hosts File**:
   ```bash
   # Linux/Mac: /etc/hosts
   # Windows: C:\Windows\System32\drivers\etc\hosts
   127.0.0.1 soc.local api.soc.local auth.soc.local grafana.soc.local opensearch.soc.local traefik.soc.local
   ```

4. **Deploy**:
   ```bash
   docker compose up -d --build
   ```

5. **Access URLs**:
   - **SOC Dashboard**: https://soc.local/
   - **API Documentation**: https://api.soc.local/docs
   - **Keycloak Admin**: https://auth.soc.local/ (admin/change_me)
   - **Grafana**: https://grafana.soc.local/ (admin/change_me)
   - **OpenSearch**: https://opensearch.soc.local/

## Local Development

### Backend Setup

```bash
cd soc/apps/api

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL="postgresql://soc:change_me@localhost:5432/soc"
export OIDC_ISSUER="http://localhost:8080/realms/soc"
export OIDC_AUDIENCE="cyberbluesoc"

# Run database migrations
python seed.py

# Start FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

```bash
cd soc/apps/web

# Install dependencies
npm install

# Start development server
npm run dev
```

### Keycloak Setup

1. **Access Admin Console**: http://localhost:8080 (admin/admin)
2. **Create Realm**: Import `cyberbluesoc-realm-export.json`
3. **Configure Clients**:
   - Client ID: `cyberbluesoc`
   - Access Type: `public`
   - Valid Redirect URIs: `http://localhost:5173/*`
4. **Create Users**: admin, analyst, manager with respective roles

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `POSTGRES_DB` | Database name | `soc` | Yes |
| `POSTGRES_USER` | Database user | `soc` | Yes |
| `POSTGRES_PASSWORD` | Database password | `change_me` | Yes |
| `KEYCLOAK_ADMIN` | Keycloak admin user | `admin` | Yes |
| `KEYCLOAK_ADMIN_PASSWORD` | Keycloak admin password | `change_me` | Yes |
| `CORS_ORIGINS` | Allowed CORS origins | `https://soc.local` | Yes |
| `GF_SECURITY_ADMIN_PASSWORD` | Grafana admin password | `change_me` | No |
| `OIDC_ISSUER` | Keycloak issuer URL | `http://keycloak:8080/realms/soc` | Yes |
| `OIDC_AUDIENCE` | JWT audience | `cyberbluesoc` | Yes |

## Keycloak Setup Steps

### Step 1: Access Admin Console
Navigate to https://auth.soc.local/ and login with `admin/change_me`

### Step 2: Create/Import Realm
- Go to **Master** → **Import** → Select `cyberbluesoc-realm-export.json`
- Or create new realm named `cyberbluesoc`

### Step 3: Configure Client
```
Client ID: cyberbluesoc
Client Type: OpenID Connect
Access Type: public
Valid Redirect URIs: https://soc.local/*
Web Origins: https://soc.local
```

### Step 4: Create Users & Roles
- **Roles**: admin, analyst, manager
- **Users**: Create with emails and assign roles
- **Credentials**: Set passwords (temporary)

### Step 5: Test Authentication
- Visit https://soc.local/
- Should redirect to Keycloak login
- Login with created user
- Should redirect back to dashboard

## Troubleshooting

### Common Issues

#### Port Conflicts
```bash
# Check port usage
sudo lsof -i :443
sudo lsof -i :80

# Stop conflicting services
sudo systemctl stop apache2 nginx
```

#### CORS Errors
- Check `CORS_ORIGINS` in environment variables
- Ensure HTTPS URLs for production
- Verify Keycloak redirect URIs match frontend URL

#### TLS/SSL Issues
- Check Let's Encrypt certificates in `infrastructure/letsencrypt/`
- Verify domain DNS resolution
- Check Traefik logs: `docker compose logs traefik`

#### Database Connection
```bash
# Test connection
docker compose exec db psql -U soc -d soc -c "SELECT 1;"

# Check logs
docker compose logs db
```

#### Authentication Issues
- Verify Keycloak realm configuration
- Check JWT tokens in browser dev tools
- Ensure client secrets match between Keycloak and API

## Roadmap

### Phase 1 (Current) ✅
- [x] Core SOC dashboard with tool management
- [x] Role-based authentication (Keycloak)
- [x] Basic audit logging
- [x] Docker container orchestration

### Phase 2 (SOAR Integration)
- [ ] Shuffle playbook automation
- [ ] Custom workflow builder
- [ ] Integration with SIEM alerts
- [ ] Automated incident response

### Phase 3 (Threat Intelligence)
- [ ] MISP platform integration
- [ ] IOC correlation engine
- [ ] Threat feed ingestion
- [ ] Automated enrichment pipelines

### Phase 4 (Advanced Monitoring)
- [ ] Wazuh agent deployment
- [ ] ELK stack for log aggregation
- [ ] Custom Grafana dashboards
- [ ] Real-time alerting system

### Phase 5 (Enterprise Features)
- [ ] Multi-tenancy support
- [ ] High availability setup
- [ ] Backup and disaster recovery
- [ ] Compliance reporting (SOC2, ISO27001)

### Manual Setup (Development)

#### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt

# Set up environment variables (copy from .env.example)
# Run database migrations
python seed.py

# Start server
uvicorn main:app --reload
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Default Credentials

### Keycloak Users
- **Admin**: admin/admin123
- **Analyst**: analyst/analyst123
- **Manager**: manager/manager123

### Database
- **Host**: localhost:5432
- **Database**: cyberblue_soc
- **User**: cyberblue
- **Password**: cyberblue123

## API Endpoints

### Authentication
- `GET /auth/me` - Get current user info

### Tools
- `GET /tools` - List all tools
- `GET /tools/{id}` - Get specific tool

### Actions (Admin/Manager only)
- `POST /actions/{id}/start` - Start a tool
- `POST /actions/{id}/stop` - Stop a tool
- `POST /actions/{id}/restart` - Restart a tool

## WebSocket

Connect to `ws://localhost:8000/ws/tools` for real-time tool status updates.

## Tools Included

1. Velociraptor - Advanced digital forensics
2. Wazuh Dashboard - Security monitoring
3. Shuffle - SOAR platform
4. MISP - Threat intelligence
5. CyberChef - Data analysis
6. TheHive - Incident response
7. Cortex - Observable analysis
8. FleetDM - Device management
9. Arkime - Packet capture
10. Caldera - Adversary emulation
11. Evebox - Alert management
12. Wireshark - Network analysis

## Development

### Project Structure
```
cyberblue-soc/
├── backend/                    # Legacy FastAPI backend (development)
├── frontend/                   # Legacy React frontend (development)
├── docker-compose/             # Legacy Docker setup
│   ├── docker-compose.yml     # Development deployment
│   └── README.md              # Development guide
├── soc/                        # Production monorepo
│   ├── apps/
│   │   ├── api/               # FastAPI backend (production)
│   │   └── web/               # React frontend (production)
│   ├── infrastructure/         # Production Docker setup
│   │   ├── docker-compose.yml # Production deployment
│   │   ├── traefik.yml        # Security-hardened reverse proxy
│   │   ├── .env              # Environment configuration
│   │   └── README.md          # Production deployment guide
│   └── packages/              # Shared packages
├── docs/                       # Documentation
├── .env.example               # Environment template
└── README.md
```

### Key Technologies

- **Frontend**: React, TypeScript, Tailwind CSS, React Router, Axios
- **Backend**: FastAPI, SQLAlchemy, Pydantic, Uvicorn
- **Database**: PostgreSQL
- **Auth**: Keycloak OIDC
- **Container**: Docker, Docker Compose
- **Reverse Proxy**: Traefik

## Configuration

Key environment variables:

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/db
KEYCLOAK_URL=http://localhost:8081
KEYCLOAK_REALM=cyberblue
KEYCLOAK_CLIENT_ID=cyberblue-frontend
KEYCLOAK_CLIENT_SECRET=secret
```

## Testing

Use the provided Postman collection (`CyberBlueSOC.postman_collection.json`) for API testing.

## Documentation

### 📚 Complete Documentation Suite

The CyberBlue SOC platform includes comprehensive documentation for users, administrators, and developers:

- [**User Guide**](./docs/user-guide.md) - Step-by-step guide for SOC operators and analysts
- [**Administrator Guide**](./docs/admin-guide.md) - System administration, user management, and configuration
- [**Cheatsheet**](./docs/cheatsheet.md) - Quick reference for daily SOC operations
- [**Development Documentation**](./docs/dev-docs.md) - API references, deployment guides, and contribution guidelines
- [**System Architecture Diagram**](./docs/architecture-diagram.svg) - Visual overview of the platform architecture

### 🚀 Quick Access Links

- **Dashboard**: https://soc.local/ (after deployment)
- **API Documentation**: https://api.soc.local/docs (after deployment)
- **Grafana Dashboards**: https://grafana.soc.local/ (admin/change_me)

## License

This project is for educational and demonstration purposes.