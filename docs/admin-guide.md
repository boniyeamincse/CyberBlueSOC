# CyberBlue SOC Administrator Guide

## System Architecture

### Overview

CyberBlue SOC is a microservices-based platform with the following components:

```
Internet → Traefik (Reverse Proxy) → [Web Frontend, API Backend]
                                      ↓
[Keycloak (Auth)] ←→ [PostgreSQL (Database)]
                                      ↓
[SOC Tools: Wazuh, TheHive, MISP, etc.]
                                      ↓
[Monitoring: Prometheus + Grafana]
```

### Service Dependencies

| Service | Dependencies | Ports | Purpose |
|---------|--------------|-------|---------|
| `traefik` | None | 80, 443 | Load balancing & TLS |
| `web` | None | 80 | React frontend |
| `api` | `db`, `keycloak` | 8000 | FastAPI backend |
| `db` | None | 5432 | PostgreSQL database |
| `keycloak` | `db` | 8080 | Authentication service |
| SOC Tools | Various | Various | Security tooling |

## Initial Setup

### 1. Environment Configuration

Create production environment file:

```bash
cd infrastructure
cp .env.example .env
```

Edit `.env` with secure values:

```bash
# Database
POSTGRES_DB=soc
POSTGRES_USER=soc
POSTGRES_PASSWORD=your-secure-db-password

# Keycloak
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=your-secure-keycloak-password

# CORS (production domains)
CORS_ORIGINS=https://soc.yourdomain.com,https://admin.yourdomain.com

# Optional: External services
GF_SECURITY_ADMIN_PASSWORD=your-grafana-password
```

### 2. DNS Configuration

Update `/etc/hosts` for local development:

```bash
127.0.0.1 soc.local api.soc.local auth.soc.local grafana.soc.local opensearch.soc.local traefik.soc.local
```

For production, configure DNS records:

```
soc.yourdomain.com     → Web frontend
api.yourdomain.com     → API backend
auth.yourdomain.com    → Keycloak
grafana.yourdomain.com → Monitoring
```

### 3. SSL Certificates

Traefik automatically provisions Let's Encrypt certificates. For production:

1. **Update email** in `docker-compose.yml` for certificate notifications
2. **Verify DNS** resolution before deployment
3. **Monitor certificates** in Traefik dashboard

## Deployment

### Production Deployment

```bash
# Navigate to production folder
cd infrastructure

# Deploy with TLS
docker compose up -d --build

# Verify services
docker compose ps
docker compose logs -f
```

### Health Checks

```bash
# API health
curl https://api.soc.local/health

# Database connectivity
docker compose exec db psql -U soc -d soc -c "SELECT 1;"

# Keycloak status
curl http://localhost:8080/realms/soc
```

## User Management

### Keycloak Configuration

#### 1. Access Admin Console

Navigate to `https://auth.soc.local/` and login with admin credentials.

#### 2. Create SOC Realm

- Click **"Master"** → **"Create realm"**
- **Realm name**: `soc`
- **Enabled**: ON
- Import realm configuration from `keycloak-realm-export.json`

#### 3. Configure Client

```
Client ID: cyberbluesoc
Client Type: OpenID Connect
Access Type: public
Valid Redirect URIs: https://soc.local/*
Web Origins: https://soc.local
```

#### 4. Create Users

**Admin User:**
- Username: `admin`
- Email: `admin@soc.local`
- First Name: `SOC`
- Last Name: `Administrator`
- Groups: `admin`

**Analyst User:**
- Username: `analyst`
- Email: `analyst@soc.local`
- Groups: `analyst`

**Manager User:**
- Username: `manager`
- Email: `manager@soc.local`
- Groups: `manager`

#### 5. Set Passwords

For each user:
- **Credentials** tab → **Set password**
- **Temporary**: OFF (allows password change)

### Role-Based Access Control

| Role | Permissions |
|------|-------------|
| `admin` | Full system access, user management, tool lifecycle |
| `analyst` | Alert triage, incident creation, approved playbooks |
| `manager` | Read-only access, reports, SLA monitoring |

## SOC Tool Configuration

### Wazuh SIEM

#### Initial Setup

```bash
# Access Wazuh dashboard
open https://wazuh-dashboard.soc.local/

# Default credentials
Username: admin
Password: admin
```

#### Agent Deployment

1. **Generate agent key** in Wazuh dashboard
2. **Deploy agent** on endpoints:

**Linux:**
```bash
curl -so wazuh-agent.deb https://packages.wazuh.com/4.x/apt/pool/main/w/wazuh-agent/wazuh-agent_4.7.2-1_amd64.deb
sudo dpkg -i wazuh-agent.deb
sudo systemctl enable wazuh-agent
sudo systemctl start wazuh-agent
```

**Windows:**
```powershell
# Download MSI installer
# Run installer with generated key
```

### TheHive Incident Response

#### Configuration

1. **Access TheHive**: `https://thehive.soc.local/`
2. **Default credentials**:
   - Username: `admin@thehive.local`
   - Password: `secret`

#### Cortex Integration

1. **Access Cortex**: `https://cortex.soc.local/`
2. **Configure analyzers** for threat intelligence
3. **Connect to TheHive** via API

### FleetDM Endpoint Management

#### Setup

1. **Access Fleet**: `https://fleet.soc.local/`
2. **Default credentials**:
   - Username: `admin`
   - Password: `admin123#` (change immediately)

#### Osquery Integration

```sql
-- Example query for malware detection
SELECT * FROM hash
WHERE path LIKE '%.exe'
AND MD5 IN (
  SELECT md5 FROM malware_hashes
);
```

## Monitoring & Alerting

### Prometheus Configuration

Metrics are automatically scraped from all services. Custom metrics:

```yaml
# Custom SOC metrics
- job_name: 'cyberblue-soc'
  static_configs:
    - targets: ['api:8000', 'web:80']
  metrics_path: '/metrics'
```

### Grafana Dashboards

#### Import Wazuh Dashboard

1. **Access Grafana**: `https://grafana.soc.local/`
2. **Login** with admin credentials
3. **Create dashboard** → **Import**
4. **Upload** `wazuh_security_dashboard.json`

#### Custom Panels

Common queries:

```promql
# API response time
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job="cyberblue-api"}[5m]))

# Tool status
up{job="wazuh-manager"}

# Database connections
pg_stat_activity_count{datname="soc"}
```

## Backup & Recovery

### Database Backup

```bash
# Automated backup
docker compose exec db pg_dump -U soc soc > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore
docker compose exec -T db psql -U soc soc < backup_file.sql
```

### Configuration Backup

```bash
# Environment files
cp infrastructure/.env .env.backup

# Keycloak realm
# Export from Keycloak admin console

# Volume backups
docker run --rm -v cyberblue_pgdata:/data -v $(pwd):/backup alpine tar czf /backup/pgdata.tar.gz -C /data .
```

### Disaster Recovery

1. **Stop all services**: `docker compose down`
2. **Restore volumes**: `docker volume rm` then recreate
3. **Restore database**: Import backup SQL
4. **Update configurations**: Deploy with new `.env`
5. **Verify services**: `docker compose ps`

## Security Hardening

### Network Security

#### Firewall Rules

```bash
# Allow only necessary ports
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

#### Container Security

- **Non-root users**: All containers run as non-privileged users
- **Read-only filesystems**: Where applicable
- **Resource limits**: CPU and memory constraints
- **Network isolation**: SOC tools in separate networks

### Access Control

#### API Rate Limiting

```python
# Configured in FastAPI
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

# Per-route limits
@router.put("/actions/{tool_id}/{operation}")
@limiter.limit("10/minute")
```

#### Audit Logging

All actions are logged with:
- User ID
- Action performed
- Timestamp
- IP address
- Resource affected

### SSL/TLS Configuration

- **HSTS**: Enabled with 1-year max-age
- **Secure headers**: XSS protection, content type sniffing prevention
- **Certificate renewal**: Automatic via Let's Encrypt

## Maintenance

### Regular Tasks

#### Daily
- [ ] Check system health dashboard
- [ ] Review critical alerts
- [ ] Verify backup completion
- [ ] Monitor resource usage

#### Weekly
- [ ] Update Docker images
- [ ] Review user access logs
- [ ] Test backup restoration
- [ ] Check SSL certificate expiry

#### Monthly
- [ ] Security patch updates
- [ ] Log rotation verification
- [ ] Performance optimization
- [ ] User access review

### Log Management

```bash
# View logs
docker compose logs -f api
docker compose logs -f keycloak

# Log rotation (configure in docker-compose.yml)
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

### Performance Monitoring

Key metrics to monitor:

- **API Response Time**: < 500ms average
- **Database Connections**: < 20 active connections
- **Memory Usage**: < 80% of allocated
- **CPU Usage**: < 70% sustained

## Troubleshooting

### Common Issues

#### Services Won't Start

```bash
# Check dependencies
docker compose config

# View detailed logs
docker compose logs --tail=100 service_name

# Check resource usage
docker stats
```

#### Authentication Issues

1. **Verify Keycloak realm** configuration
2. **Check JWT tokens** in browser dev tools
3. **Validate client settings** in Keycloak
4. **Review network connectivity** between services

#### Database Connection Errors

```bash
# Test connection
docker compose exec db psql -U soc -h localhost -d soc

# Check database logs
docker compose logs db

# Verify environment variables
docker compose exec api env | grep DATABASE
```

#### Performance Issues

1. **Monitor resource usage**: `docker stats`
2. **Check slow queries**: Database logs
3. **Review API endpoints**: Response times
4. **Scale services**: Increase CPU/memory limits

### Debug Mode

Enable debug logging:

```yaml
# docker-compose.yml
environment:
  - DEBUG=1
  - LOG_LEVEL=DEBUG
```

## Upgrades

### Version Upgrades

1. **Backup current state**
2. **Pull new images**: `docker compose pull`
3. **Update environment variables**
4. **Deploy**: `docker compose up -d`
5. **Verify functionality**
6. **Clean up**: Remove old images

### Migration Guide

From legacy to production:

```bash
# Stop legacy
cd docker-compose && docker-compose down

# Start production
cd ../infrastructure && docker compose up -d

# Migrate data if needed
docker compose exec api python migrate_data.py
```

## Support

### Documentation Links

- [User Guide](./user-guide.md)
- [API Documentation](./api-docs.md)
- [Troubleshooting](./troubleshooting.md)

### Getting Help

1. **Check logs**: `docker compose logs`
2. **Review documentation**: This admin guide
3. **Community forums**: GitHub issues
4. **Professional support**: Contact maintainers

### Emergency Contacts

- **Security Incidents**: Immediate response required
- **System Down**: High priority
- **Performance Issues**: Medium priority
- **Feature Requests**: Low priority