# CyberBlue SOC Cheatsheet

## Quick Commands

### Deployment

```bash
# Production deployment
cd infrastructure && docker compose up -d --build

# Development deployment
cd docker-compose && docker-compose up -d --build

# Stop all services
docker compose down

# View logs
docker compose logs -f

# Update services
docker compose pull && docker compose up -d
```

### Health Checks

```bash
# API health
curl https://api.soc.local/health

# Database connection
docker compose exec db psql -U soc -d soc -c "SELECT 1;"

# Keycloak status
curl http://localhost:8080/realms/soc/.well-known/openid-connect-configuration
```

## User Management

### Keycloak Operations

```bash
# Access admin console
open https://auth.soc.local/

# Default credentials
admin / change_me

# Create user via API
curl -X POST https://auth.soc.local/admin/realms/soc/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username": "analyst", "enabled": true, "groups": ["analyst"]}'
```

### Role Permissions

| Role | Dashboard | Tools | Incidents | Metrics | Audit | Admin |
|------|-----------|-------|-----------|---------|-------|-------|
| Admin | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| Analyst | ✅ Read | ✅ Start/Stop | ✅ Create/Update | ✅ Read | ✅ Read | ❌ None |
| Manager | ✅ Read | ❌ None | ✅ Read | ✅ Read | ✅ Export | ❌ None |

## Tool Management

### Bulk Operations

```bash
# Start all stopped tools via API
curl -X PUT https://api.soc.local/api/actions/bulk/start \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tool_ids": ["wazuh", "thehive", "misp"]}'

# Check tool status
curl https://api.soc.local/api/tools \
  -H "Authorization: Bearer $TOKEN"
```

### Tool Health Indicators

- 🟢 **Optimal**: < 5% error rate
- 🟡 **Healthy**: 5-15% error rate
- 🟠 **Degraded**: 15-30% error rate
- 🔴 **Critical**: > 30% error rate

## Incident Response

### Create Incident from Alert

```bash
# Manual incident creation
curl -X POST https://api.soc.local/api/incidents \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Suspicious Login Attempt",
    "description": "Multiple failed login attempts from IP 192.168.1.100",
    "severity": "medium"
  }'

# Update incident status
curl -X PUT https://api.soc.local/api/incidents/123/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "investigating"}'
```

### Incident Priority Matrix

| Severity | Response Time | Escalation |
|----------|---------------|------------|
| Critical | Immediate (< 15 min) | C-level notification |
| High | < 1 hour | Department head |
| Medium | < 4 hours | Team lead |
| Low | < 24 hours | Standard process |

## Monitoring & Metrics

### Key Metrics to Monitor

```bash
# API performance
curl https://api.soc.local/api/metrics/performance?hours=24 \
  -H "Authorization: Bearer $TOKEN"

# System health
curl https://api.soc.local/api/metrics \
  -H "Authorization: Bearer $TOKEN"
```

### Grafana Queries

```promql
# API response time (95th percentile)
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job="cyberblue-api"}[5m]))

# Tool availability
up{job=~"wazuh|thehive|misp|arkime"}

# Database connections
pg_stat_activity_count{datname="soc"}

# Security events
wazuh_security_events_total
```

## Automation Playbooks

### VirusTotal Enrichment

```bash
# Enrich single hash
curl -X POST https://api.soc.local/api/playbooks/virustotal-enrich \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"hash": "a1b2c3d4e5f6..."}'

# Automated response (Wazuh → VT → Block)
curl -X POST https://api.soc.local/api/playbooks/auto-incident-response \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"id": "12345", "rule": {"level": 10}, "agent": {"name": "server01"}}'
```

## Data Export

### CSV Export Options

```bash
# Export all tools
curl "https://api.soc.local/api/export/csv" \
  -H "Authorization: Bearer $TOKEN" \
  -o tools.csv

# Export running tools only
curl "https://api.soc.local/api/export/csv?status=running" \
  -H "Authorization: Bearer $TOKEN" \
  -o running-tools.csv

# Export by category
curl "https://api.soc.local/api/export/csv?category=SIEM" \
  -H "Authorization: Bearer $TOKEN" \
  -o siem-tools.csv
```

### JSON Export

```bash
# Programmatic export
curl https://api.soc.local/api/export/json \
  -H "Authorization: Bearer $TOKEN" \
  -o tools.json
```

## Audit & Compliance

### Audit Log Queries

```bash
# Recent actions by user
curl "https://api.soc.local/api/audit-logs?user=username&action=start_tool" \
  -H "Authorization: Bearer $TOKEN"

# Failed authentications
curl "https://api.soc.local/api/audit-logs?action=login&search=fail" \
  -H "Authorization: Bearer $TOKEN"

# Tool modifications
curl "https://api.soc.local/api/audit-logs?resource=tool:*" \
  -H "Authorization: Bearer $TOKEN"
```

### Compliance Checks

```bash
# Daily audit summary
curl "https://api.soc.local/api/audit-logs/summary?days=1" \
  -H "Authorization: Bearer $TOKEN"

# User activity report
curl "https://api.soc.local/api/audit-logs?user=analyst&page=1&per_page=100" \
  -H "Authorization: Bearer $TOKEN"
```

## Troubleshooting

### Service Issues

```bash
# Check service health
docker compose ps

# Restart failing service
docker compose restart api

# View service logs
docker compose logs --tail=50 api

# Check resource usage
docker stats
```

### Network Issues

```bash
# Test DNS resolution
nslookup soc.local

# Check Traefik routes
curl http://localhost:8080/api/http/routers

# Verify SSL certificates
openssl s_client -connect soc.local:443 -servername soc.local
```

### Database Issues

```bash
# Test database connection
docker compose exec db psql -U soc -d soc -c "SELECT version();"

# Check active connections
docker compose exec db psql -U soc -d soc -c "SELECT count(*) FROM pg_stat_activity;"

# Backup database
docker compose exec db pg_dump -U soc soc > backup.sql
```

## Backup & Recovery

### Quick Backup

```bash
# Database backup
docker compose exec db pg_dump -U soc soc > backup_$(date +%Y%m%d).sql

# Configuration backup
tar czf config_backup.tar.gz infrastructure/.env

# Volume backup
docker run --rm -v cyberblue_pgdata:/data -v $(pwd):/backup alpine tar czf /backup/volumes.tar.gz -C /data .
```

### Emergency Recovery

```bash
# Stop all services
docker compose down

# Restore database
docker compose exec -T db psql -U soc soc < backup.sql

# Restore volumes
docker run --rm -v cyberblue_pgdata:/data -v $(pwd):/backup alpine tar xzf /backup/volumes.tar.gz -C /data

# Restart services
docker compose up -d
```

## Security Operations

### Daily Checklist

- [ ] Review dashboard for alerts
- [ ] Check tool health status
- [ ] Verify backup completion
- [ ] Monitor resource usage
- [ ] Review audit logs for anomalies

### Incident Response Flow

1. **Detection**: Alert triggered
2. **Assessment**: Evaluate severity
3. **Containment**: Isolate affected systems
4. **Investigation**: Gather evidence
5. **Recovery**: Restore normal operations
6. **Lessons Learned**: Update procedures

### Escalation Matrix

| Issue | Response Time | Contact |
|-------|---------------|---------|
| System Down | Immediate | On-call admin |
| Security Breach | < 15 min | SOC lead + CISO |
| Performance Issue | < 1 hour | DevOps team |
| Feature Request | < 24 hours | Product manager |

## API Reference

### Authentication

```bash
# Get access token (client credentials)
curl -X POST https://auth.soc.local/realms/soc/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password&client_id=cyberbluesoc&username=user&password=pass"

# Use token in requests
curl -H "Authorization: Bearer $ACCESS_TOKEN" https://api.soc.local/api/tools
```

### Rate Limits

- **General API**: 50 req/min, 100 burst
- **Admin actions**: 10 req/min
- **Authentication**: 5 req/min per IP

### Error Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | - |
| 401 | Unauthorized | Check token |
| 403 | Forbidden | Verify permissions |
| 429 | Rate Limited | Wait and retry |
| 500 | Server Error | Check logs |

## Keyboard Shortcuts

- `Ctrl+K`: Focus search
- `Tab`: Navigate elements
- `Enter`: Activate buttons
- `Escape`: Close modals
- `Ctrl+R`: Refresh data
- `Ctrl+E`: Export current view