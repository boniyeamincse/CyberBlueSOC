# CyberBlue SOC Infrastructure

This directory contains the Docker Compose configuration for deploying the complete CyberBlue SOC platform.

## Services

- **reverse-proxy**: Traefik v2.11 with Let's Encrypt TLS certificates
- **keycloak**: Authentication service (admin/change_me)
- **db**: PostgreSQL 16 database
- **api**: FastAPI backend (build from ../apps/api)
- **web**: React frontend (build from ../apps/web)
- **grafana**: Monitoring dashboards (admin/change_me)
- **opensearch**: Search and analytics engine

## Quick Start

```bash
# Add to /etc/hosts (Linux/Mac) or C:\Windows\System32\drivers\etc\hosts (Windows)
127.0.0.1 soc.local api.soc.local auth.soc.local grafana.soc.local opensearch.soc.local traefik.soc.local

# Deploy the stack
docker compose up -d --build

# Check logs
docker compose logs -f
```

## Access URLs (HTTPS)

- **Main Dashboard**: https://soc.local/
- **API**: https://api.soc.local/
- **Keycloak Admin**: https://auth.soc.local/ (admin/change_me)
- **Grafana**: https://grafana.soc.local/ (admin/change_me)
- **OpenSearch**: https://opensearch.soc.local/
- **Traefik Dashboard**: https://traefik.soc.local/

## Environment Variables

Update passwords and configuration in the docker-compose.yml file:

```yaml
environment:
  - POSTGRES_PASSWORD: change_me  # Database password
  - KEYCLOAK_ADMIN_PASSWORD: change_me  # Keycloak admin
  - GF_SECURITY_ADMIN_PASSWORD: change_me  # Grafana admin
```

## Hardening Checklist

### 🔒 Security Headers (Implemented)
- ✅ HSTS (HTTP Strict Transport Security) - Forces HTTPS
- ✅ X-Frame-Options: DENY - Prevents clickjacking
- ✅ X-Content-Type-Options: nosniff - Prevents MIME sniffing
- ✅ Referrer-Policy: strict-origin-when-cross-origin - Controls referrer info
- ✅ Permissions-Policy - Restricts browser features
- ✅ XSS Protection enabled

### 🚦 Rate Limiting (Implemented)
- ✅ 50 requests/minute average rate
- ✅ 100 requests burst limit
- ✅ 10 actions/minute for admin operations
- ✅ In-memory rate limiting (upgrade to Redis for production)

### 🔐 CORS Configuration (Implemented)
- ✅ Environment-driven allowlist
- ✅ Restricted to HTTPS origins only
- ✅ Limited HTTP methods (GET, POST, PUT, DELETE)

### 📊 Audit Logging (Implemented)
- ✅ All tool actions logged (user, tool_id, operation, timestamp, IP)
- ✅ POST /actions endpoint captures client IP
- ✅ Structured audit trail for compliance

### 🔑 Additional Hardening Recommendations

#### Database
- [ ] Enable PostgreSQL SSL connections
- [ ] Implement database connection pooling
- [ ] Regular backup verification
- [ ] Database user least privilege principle

#### Authentication
- [ ] Enable MFA for all users (currently optional)
- [ ] Implement session timeouts
- [ ] Add brute force protection
- [ ] Regular password rotation policies

#### Network Security
- [ ] Implement network segmentation
- [ ] Add WAF rules (ModSecurity)
- [ ] Enable container network policies
- [ ] Regular vulnerability scanning

#### Monitoring & Alerting
- [ ] Implement centralized logging (ELK Stack)
- [ ] Add security event monitoring
- [ ] Configure alerting for suspicious activities
- [ ] Implement log retention policies

#### Code Security
- [ ] Regular dependency updates
- [ ] Static code analysis
- [ ] Input validation and sanitization
- [ ] API versioning and deprecation policies

## Troubleshooting

### Port Conflicts
If port 443 is already in use:
```bash
# Check what's using port 443
sudo lsof -i :443

# Stop conflicting service or change port in docker-compose.yml
```

### DNS Resolution
Ensure hosts file entries are correct for local development.

### SSL Certificates
Let's Encrypt certificates are automatically provisioned for *.soc.local domains.

For production, update domains and email in the traefik service configuration.

### Rate Limiting Issues
If experiencing rate limit errors:
- Check application logs for rate limit violations
- Consider increasing limits for legitimate high-traffic scenarios
- Implement Redis-based rate limiting for distributed deployments

### CORS Issues
Update `CORS_ORIGINS` environment variable in production:
```bash
CORS_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
```