# CyberBlueSOC Cheatsheet

## User Operations

| Operation | Method | Description | Example |
|-----------|--------|-------------|---------|
| **Login** | Web UI | Access via Keycloak OIDC | Navigate to `https://soc.yourcompany.com` |
| **Logout** | Web UI | Secure session termination | Click profile menu → Logout |
| **Start Tool** | Web UI/API | Launch individual SOC tool | Click ▶️ button on tool card |
| **Stop Tool** | Web UI/API | Gracefully shut down tool | Click ⏹️ button on tool card |
| **Restart Tool** | Web UI/API | Restart with fresh config | Click 🔄 button on tool card |
| **Bulk Start** | Web UI | Start multiple tools | Select tools → Bulk Actions → Start |
| **Bulk Stop** | Web UI | Stop multiple tools | Select tools → Bulk Actions → Stop |
| **View CPU/Memory** | Dashboard | Real-time resource metrics | Check "System Health" panel |
| **View Tool Uptime** | Tool Cards | Individual tool status | Look at uptime counter on cards |
| **Export CSV** | Web UI | Download tool inventory | Click "Export CSV" button |
| **Export JSON** | API | Programmatic data export | `GET /api/export/json` |

## Admin Operations

| Operation | Method | Description | Command/Example |
|-----------|--------|-------------|----------------|
| **Add User** | Keycloak UI | Create new SOC user | `https://auth.company.com` → Users → Create user |
| **Remove User** | Keycloak UI | Deactivate user account | Edit user → Disable account |
| **Configure Roles** | Keycloak UI | Assign user permissions | User → Role mapping → Assign roles |
| **Start Backend** | Docker | Launch API service | `docker compose up -d api` |
| **Stop Backend** | Docker | Shutdown API service | `docker compose stop api` |
| **Restart Frontend** | Docker | Reload web interface | `docker compose restart web` |
| **Manage Backups** | CLI | Database backup/restore | `docker compose exec db pg_dump > backup.sql` |
| **System Updates** | CLI | Update all containers | `docker compose pull && docker compose up -d` |

## Quick References

### Key API Endpoints

| Endpoint | Method | Description | Authentication |
|----------|--------|-------------|----------------|
| `/api/me` | GET | Current user info | JWT Required |
| `/api/tools` | GET | List all tools | JWT Required |
| `/api/actions/{tool}/{operation}` | PUT | Control individual tool | Admin JWT |
| `/api/export/csv` | GET | Export tool data | JWT Required |
| `/ws/dashboard` | WS | Real-time updates | JWT Required |

### WebSocket Messages

| Message Type | Direction | Description | Example Payload |
|--------------|-----------|-------------|----------------|
| `tool_status` | Server→Client | Tool state changes | `{"tool": "wazuh", "status": "running"}` |
| `alert_new` | Server→Client | New security alert | `{"id": "123", "severity": "high"}` |
| `metric_update` | Server→Client | System metrics | `{"cpu": 45.2, "memory": 67.8}` |

### Common Troubleshooting

| Issue | Quick Check | Resolution |
|-------|-------------|------------|
| **WebSocket Issues** | Browser dev tools | Check network tab, verify WSS connection |
| **Login Problems** | Keycloak logs | Verify realm config, check user status |
| **Tool Not Starting** | Container logs | `docker compose logs tool_name` |
| **Slow Performance** | System metrics | Check CPU/memory, review database queries |

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

| Shortcut | Context | Description |
|----------|---------|-------------|
| `Ctrl+K` / `Cmd+K` | Dashboard | Focus search bar |
| `Tab` | Any | Navigate between interactive elements |
| `Enter` | Buttons/Forms | Activate button or submit form |
| `Escape` | Modals/Dialogs | Close modal or cancel action |
| `Ctrl+R` / `Cmd+R` | Dashboard | Refresh all data |
| `Ctrl+E` / `Cmd+E` | Tables | Export current view |
| `Ctrl+F` / `Cmd+F` | Dashboard | Filter/search tools |
| `Arrow Keys` | Tool Grid | Navigate tool cards |