# Docker Compose Deployment

This directory contains the legacy Docker Compose configuration for CyberBlue SOC. For the enhanced, production-ready setup, see [`../infrastructure/`](../infrastructure/).

## Quick Start (Legacy)

> ⚠️ **Note**: This is the original Docker Compose setup. The new [`../infrastructure/`](../infrastructure/) folder contains enhanced security features, rate limiting, and production hardening.

```bash
# From repository root
cd docker-compose
docker-compose up -d --build

# Access URLs
# Frontend: http://localhost
# API: http://localhost/api
# Keycloak: http://localhost:8081 (admin/admin123)
# Traefik Dashboard: http://localhost:8080
```

## Services

| Service | Technology | Port | Description |
|---------|------------|------|-------------|
| `traefik` | Traefik v2.5 | 80, 8080 | Reverse proxy and load balancer |
| `postgres` | PostgreSQL 14 | 5432 | Database |
| `keycloak` | Keycloak 22.0 | 8081 | Authentication & authorization |
| `api` | FastAPI | 8000 | Backend API |
| `web` | React | 80 | Frontend application |

## Default Credentials

| Service | Username | Password | URL |
|---------|----------|----------|-----|
| Keycloak Admin | admin | admin123 | http://localhost:8081 |
| Database | cyberblue | cyberblue123 | localhost:5432 |
| Traefik Dashboard | - | - | http://localhost:8080 |

## Configuration

### Environment Variables

Create a `.env` file in this directory:

```bash
# Database
POSTGRES_DB=cyberblue_soc
POSTGRES_USER=cyberblue
POSTGRES_PASSWORD=cyberblue123

# Keycloak
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=admin123

# API Configuration
DATABASE_URL=postgresql://cyberblue:cyberblue123@postgres:5432/cyberblue_soc
KEYCLOAK_URL=http://keycloak:8080
KEYCLOAK_REALM=cyberblue
KEYCLOAK_CLIENT_ID=cyberblue-backend
KEYCLOAK_CLIENT_SECRET=backend-secret
```

### Network Architecture

```
Internet → Traefik (80/443) → [web, api]
                              → Keycloak (8081)
                              → PostgreSQL (5432)
```

## Development vs Production

### Development
- Uses HTTP (port 80)
- Traefik dashboard exposed
- Keycloak in dev mode
- No TLS certificates

### Production
Use the enhanced setup in [`../infrastructure/`](../infrastructure/) which includes:
- HTTPS with Let's Encrypt
- Security headers
- Rate limiting
- CORS configuration
- Enhanced monitoring

## Troubleshooting

### Port Conflicts
```bash
# Check port usage
netstat -tulpn | grep :80
netstat -tulpn | grep :8080

# Stop services using ports
sudo systemctl stop apache2 nginx
```

### Database Connection Issues
```bash
# Check container logs
docker-compose logs postgres

# Connect to database
docker-compose exec postgres psql -U cyberblue -d cyberblue_soc
```

### Keycloak Setup
1. Access http://localhost:8081
2. Login with admin/admin123
3. Create realm: `cyberblue`
4. Import realm configuration from [`../keycloak-realm-export.json`](../keycloak-realm-export.json)

## Migration to Production

To migrate from this legacy setup to the production-ready infrastructure:

1. **Backup data** (if any)
2. **Stop legacy containers**: `docker-compose down`
3. **Switch to infrastructure folder**: `cd ../infrastructure`
4. **Update environment variables** in `.env`
5. **Deploy**: `docker compose up -d --build`

The new setup includes security hardening, monitoring, and production best practices.