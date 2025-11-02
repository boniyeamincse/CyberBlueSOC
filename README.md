# CyberBlue SOC Platform

A minimal but extensible Security Operations Center (SOC) platform built with modern technologies.

## Features

- **Frontend**: React + Vite with Tailwind CSS (dark UI)
- **Backend**: FastAPI (Python) with PostgreSQL
- **Authentication**: OIDC with Keycloak (admin, analyst, manager roles)
- **Real-time Updates**: WebSocket for tool status updates
- **Tool Management**: Start, stop, restart SOC tools
- **Dockerized**: Complete setup with Docker Compose and Traefik reverse proxy

## Architecture

- **Frontend**: Single-page application with routing and protected routes
- **Backend**: RESTful API with JWT authentication and role-based access control
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: Keycloak OIDC provider
- **Reverse Proxy**: Traefik for load balancing and routing
- **Tools**: 12 pre-seeded SOC tools (Velociraptor, Wazuh, Shuffle, etc.)

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### Using Docker Compose (Recommended)

1. Clone the repository
2. Copy environment file:
   ```bash
   cp .env.example .env
   ```
3. Start the services:
   ```bash
   cd docker-compose
   docker-compose up -d
   ```
4. Access the application:
   - Frontend: http://localhost
   - API: http://localhost/api
   - Keycloak Admin: http://localhost:8081 (admin/admin123)
   - Traefik Dashboard: http://localhost:8080

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
├── backend/           # FastAPI backend
├── frontend/          # React frontend
├── docker-compose/    # Docker orchestration
├── docs/             # Documentation
├── .env.example      # Environment template
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

## License

This project is for educational and demonstration purposes.