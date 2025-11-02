# CyberBlueSOC Administrator Guide

## Introduction

### Administrative Responsibilities

As a CyberBlueSOC administrator, you are responsible for the overall health, security, and operational efficiency of the Security Operations Center platform. Your key responsibilities include:

#### System Setup and Deployment
- **Initial Platform Deployment**: Setting up the complete SOC infrastructure using Docker Compose
- **Infrastructure Configuration**: Configuring networks, storage, and resource allocation
- **SSL/TLS Management**: Managing certificates and secure communications
- **Backup and Recovery**: Implementing and maintaining data protection strategies

#### User and Access Management
- **Authentication Configuration**: Managing Keycloak OIDC realms, clients, and users
- **Role-Based Access Control**: Defining and enforcing user permissions (Admin, Analyst, Manager)
- **Multi-Factor Authentication**: Configuring MFA for enhanced security
- **Access Auditing**: Monitoring user activities and maintaining compliance

#### Tool Lifecycle Management
- **SOC Tool Orchestration**: Adding, removing, and configuring security tools (Wazuh, MISP, TheHive, etc.)
- **Integration Management**: Ensuring proper communication between SOC components
- **Performance Monitoring**: Tracking tool health and optimizing resource usage
- **Version Management**: Planning and executing tool updates and upgrades

#### Security Operations
- **Threat Detection**: Configuring alerts and monitoring for security events
- **Incident Response**: Setting up automated workflows and escalation procedures
- **Compliance Management**: Ensuring adherence to security standards and regulations
- **Vulnerability Management**: Regular security assessments and patch management

#### System Maintenance and Monitoring
- **Health Monitoring**: Continuous system performance and availability tracking
- **Log Management**: Centralized logging and analysis for troubleshooting
- **Resource Optimization**: Capacity planning and performance tuning
- **Disaster Recovery**: Developing and testing backup and recovery procedures

### Backend Components Overview

CyberBlueSOC is built on a robust microservices architecture designed for scalability, security, and maintainability:

#### FastAPI Backend
- **RESTful API**: Provides all business logic and data operations
- **Asynchronous Processing**: Handles concurrent requests efficiently
- **Auto-generated Documentation**: Interactive API docs via Swagger/OpenAPI
- **Security Middleware**: JWT authentication, rate limiting, and CORS protection

#### PostgreSQL Database
- **Relational Data Storage**: Structured data for users, tools, incidents, and audit logs
- **ACID Compliance**: Ensures data integrity and transactional consistency
- **Optimized Queries**: Indexed tables for fast data retrieval
- **Backup Automation**: Automated snapshots and point-in-time recovery

#### Keycloak Authentication Service
- **OIDC Provider**: Industry-standard authentication and authorization
- **Multi-tenant Support**: Realm-based user isolation and customization
- **Social Login Integration**: Support for external identity providers
- **Fine-grained Permissions**: Role and group-based access control

#### Docker Compose Orchestration
- **Container Management**: Isolated, reproducible environments for all services
- **Service Dependencies**: Automatic startup ordering and health checks
- **Network Isolation**: Secure communication between components
- **Resource Management**: CPU, memory, and storage allocation per service
- **Scaling Capabilities**: Horizontal scaling for high-availability deployments

## System Setup

### Detailed Docker Compose Deployment

This section provides comprehensive instructions for deploying CyberBlueSOC in production environments.

#### Prerequisites

**System Requirements:**
- **Operating System**: Ubuntu 20.04+ or CentOS 8+ (64-bit)
- **CPU**: 4+ cores (8+ recommended for production)
- **RAM**: 16GB minimum (32GB+ recommended)
- **Storage**: 100GB+ SSD storage
- **Network**: Stable internet connection for updates and threat intelligence

**Software Dependencies:**
- **Docker**: Version 20.10+ with Docker Compose plugin
- **Git**: For cloning the repository
- **OpenSSL**: For certificate generation (if needed)

#### Step-by-Step Deployment

1. **Clone the Repository**
   ```bash
   git clone https://github.com/boniyeamincse/CyberBlueSOC.git
   cd CyberBlueSOC/soc/infrastructure
   ```

2. **Configure Environment Variables**
   ```bash
   cp .env.example .env
   nano .env  # Edit with your production values
   ```

   **Critical Environment Variables:**
   ```bash
   # Database Configuration
   POSTGRES_DB=cyberblue_soc
   POSTGRES_USER=cyberblue_admin
   POSTGRES_PASSWORD=your-secure-db-password-here
   
   # Keycloak Administration
   KEYCLOAK_ADMIN=cyberblue_admin
   KEYCLOAK_ADMIN_PASSWORD=your-secure-keycloak-password
   
   # Domain Configuration
   DOMAIN=soc.yourcompany.com
   TRAEFIK_ACME_EMAIL=admin@yourcompany.com
   
   # CORS Origins (Production domains)
   CORS_ORIGINS=https://soc.yourcompany.com,https://api.yourcompany.com
   
   # Monitoring Credentials
   GF_SECURITY_ADMIN_PASSWORD=your-secure-grafana-password
   ```

3. **DNS Configuration**

   **Production DNS Setup:**
   ```
   soc.yourcompany.com        A     YOUR_SERVER_IP
   api.yourcompany.com        CNAME soc.yourcompany.com
   auth.yourcompany.com       CNAME soc.yourcompany.com
   grafana.yourcompany.com    CNAME soc.yourcompany.com
   wazuh.yourcompany.com      CNAME soc.yourcompany.com
   thehive.yourcompany.com    CNAME soc.yourcompany.com
   misp.yourcompany.com       CNAME soc.yourcompany.com
   ```

4. **SSL Certificate Preparation**

   CyberBlueSOC uses Traefik with automatic Let's Encrypt certificates. For custom certificates:
   
   ```bash
   # Create certificates directory
   mkdir -p certificates
   
   # Place your certificates
   # certificates/cert.pem     - Your SSL certificate
   # certificates/key.pem      - Your private key
   # certificates/ca.pem       - Certificate Authority (optional)
   ```

5. **Firewall Configuration**

   ```bash
   # Allow only necessary ports
   sudo ufw allow 80/tcp      # HTTP (redirects to HTTPS)
   sudo ufw allow 443/tcp     # HTTPS
   sudo ufw allow 22/tcp      # SSH (for management)
   sudo ufw --force enable
   ```

6. **Deploy the Platform**

   ```bash
   # Pull latest images
   docker compose pull
   
   # Deploy in detached mode
   docker compose up -d
   
   # Monitor deployment
   docker compose logs -f --tail=100
   ```

7. **Verify Deployment**

   ```bash
   # Check all services are running
   docker compose ps
   
   # Verify web interface
   curl -I https://soc.yourcompany.com
   
   # Test API health
   curl https://api.yourcompany.com/health
   
   # Check Traefik dashboard (if enabled)
   curl http://localhost:8080/dashboard/
   ```

#### Post-Deployment Configuration

1. **Initialize Database**
   ```bash
   # Run database migrations
   docker compose exec api alembic upgrade head
   
   # Seed initial data
   docker compose exec api python seed.py
   ```

2. **SSL Certificate Validation**
   ```bash
   # Check certificate validity
   openssl s_client -connect soc.yourcompany.com:443 -servername soc.yourcompany.com < /dev/null 2>/dev/null | openssl x509 -noout -dates
   
   # Verify certificate chain
   openssl s_client -connect soc.yourcompany.com:443 -servername soc.yourcompany.com < /dev/null | openssl x509 -text | grep -A 5 "Subject:"
   ```

### Keycloak OIDC Configuration

#### Creating and Configuring Realms

1. **Access Keycloak Admin Console**
   
   Navigate to `https://auth.yourcompany.com/` and login with the admin credentials from your `.env` file.

2. **Create SOC Realm**
   
   - Click the realm dropdown (shows "Master") → "Create realm"
   - **Realm name**: `cyberblue-soc`
   - **Enabled**: ✅ On
   - **Display name**: `CyberBlue SOC`
   - Click "Create"

3. **Import Realm Configuration**
   
   ```bash
   # From your local machine, import the provided realm configuration
   # This sets up predefined roles, groups, and basic client configuration
   ```

4. **Configure Realm Settings**
   
   - **Login**: Enable "User registration" if self-service is needed
   - **Email**: Configure SMTP settings for notifications
   - **Themes**: Customize login page appearance
   - **Security Defenses**: Configure brute force protection

#### Creating Clients for Applications

1. **Create Web Client**
   
   - Go to "Clients" → "Create client"
   - **Client ID**: `cyberblue-web`
   - **Client Type**: `OpenID Connect`
   - **Client authentication**: `Off` (public client)
   
   **Capability config:**
   - ✅ Standard flow
   - ✅ Direct access grants
   
   **Login settings:**
   - **Valid redirect URIs**: `https://soc.yourcompany.com/*`
   - **Web origins**: `https://soc.yourcompany.com`
   - **Login theme**: `cyberblue` (custom theme)

2. **Create API Client**
   
   - **Client ID**: `cyberblue-api`
   - **Client Type**: `OpenID Connect`
   - **Client authentication**: `On` (confidential client)
   
   **Capability config:**
   - ✅ Service accounts roles
   
   **Credentials:**
   - Generate client secret for API authentication

#### Setting Up Identity Providers (Optional)

1. **Social Login Integration**
   
   - Go to "Identity providers"
   - Configure Google, GitHub, or corporate SSO providers
   - Map external user attributes to Keycloak user attributes

2. **LDAP Integration**
   
   - Add LDAP provider for enterprise directory integration
   - Configure user synchronization and group mapping
   - Set up periodic sync schedules

## User and Role Management

### Creating and Managing Users in Keycloak

#### User Creation Process

1. **Access Users Section**
   
   In Keycloak admin console, navigate to "Users" in the left sidebar.

2. **Create New User**
   
   - Click "Create new user"
   - **Username**: `analyst.johnson` (use consistent naming convention)
   - **Email**: `johnson@yourcompany.com`
   - **First name**: `John`
   - **Last name**: `Johnson`
   - **User enabled**: ✅ On

3. **Set User Credentials**
   
   - Go to "Credentials" tab
   - Click "Set password"
   - **Password**: Enter secure password
   - **Temporary**: ✅ On (forces password change on first login)
   - **Password policy**: Enforce complexity requirements

4. **Configure User Attributes**
   
   - **Department**: `SOC Operations`
   - **Employee ID**: `SOC001`
   - **Manager**: `soc.manager@yourcompany.com`
   - **Phone**: For emergency contact

#### Group-Based User Organization

1. **Create User Groups**
   
   - Go to "Groups" → "Create group"
   - **Group name**: `SOC Analysts`
   - **Description**: `Level 1 SOC analysts with triage permissions`

2. **Assign Users to Groups**
   
   - Edit user → "Groups" tab
   - Select appropriate groups
   - Groups determine role inheritance

3. **Group Hierarchy**
   
   ```
   SOC Team
   ├── SOC Administrators
   │   ├── Platform Admins
   │   └── Security Admins
   ├── SOC Managers
   │   ├── Shift Managers
   │   └── Department Leads
   ├── SOC Analysts
   │   ├── Senior Analysts
   │   └── Junior Analysts
   └── SOC Interns
   ```

### Assigning Roles and Permissions

#### Understanding Role-Based Access Control (RBAC)

CyberBlueSOC implements a hierarchical permission system:

| Role Level | Permissions | Dashboard Access |
|------------|-------------|------------------|
| **SOC Administrator** | Full system access, user management, tool configuration | Complete read/write |
| **SOC Manager** | SLA monitoring, report generation, limited configuration | Read-only metrics, export capabilities |
| **SOC Analyst** | Alert triage, incident creation, approved automation | Tool monitoring, incident management |
| **SOC Intern** | Limited read access, training scenarios | Restricted dashboard view |

#### Role Assignment Process

1. **Assign Realm Roles**
   
   - Edit user → "Role mapping" tab
   - **Realm roles**: Select from predefined roles
   - **Client roles**: Assign application-specific permissions

2. **Configure Role Attributes**
   
   - **Role name**: `soc_analyst`
   - **Description**: `SOC Analyst with triage and incident creation permissions`
   - **Composite roles**: Combine multiple roles for complex permissions

3. **Permission Matrix**
   
   | Permission | Admin | Manager | Analyst | Intern |
   |------------|-------|---------|---------|--------|
   | View Dashboard | ✅ | ✅ | ✅ | ✅ |
   | Start/Stop Tools | ✅ | ❌ | ⚠️ | ❌ |
   | Create Incidents | ✅ | ✅ | ✅ | ❌ |
   | Run Playbooks | ✅ | ⚠️ | ⚠️ | ❌ |
   | User Management | ✅ | ❌ | ❌ | ❌ |
   | Export Reports | ✅ | ✅ | ⚠️ | ❌ |

#### Advanced Permission Configuration

1. **Attribute-Based Access Control (ABAC)**
   
   - Define permissions based on user attributes
   - Example: Allow access only during work hours
   - Configure in client scopes and policies

2. **Time-Based Permissions**
   
   - Restrict access to sensitive operations
   - Configure in role policies
   - Useful for separation of duties

### Integrating Other Authentication Services

#### SAML Integration

1. **Configure SAML Identity Provider**
   
   - Go to "Identity providers" → "SAML v2.0"
   - **Alias**: `corporate-saml`
   - **Display name**: `Corporate SSO`
   - Upload SAML metadata XML

2. **Map SAML Attributes**
   
   - Configure attribute mappers
   - Map corporate roles to CyberBlueSOC roles
   - Set up group membership mapping

#### Active Directory Integration

1. **LDAP Provider Setup**
   
   - **Vendor**: `Active Directory`
   - **Connection URL**: `ldap://dc.corporate.com:389`
   - **Bind DN**: `CN=Keycloak Service,OU=Service Accounts,DC=corporate,DC=com`
   - **Bind credential**: Service account password

2. **User Synchronization**
   
   - Configure sync settings
   - Set periodic import intervals
   - Map AD groups to Keycloak roles

#### Multi-Factor Authentication (MFA)

1. **Enable MFA for Realm**
   
   - Realm settings → "Security defenses" → "OTP Policy"
   - **OTP type**: `Time-based`
   - **OTP algorithm**: `HOTP`
   - **Number of digits**: `6`

2. **Configure Authenticator**
   
   - Users can set up Google Authenticator or similar
   - SMS-based MFA for remote access
   - Hardware security keys support

3. **Conditional MFA**
   
   - Require MFA for sensitive operations
   - Configure in authentication flows
   - Browser-based vs. app-based policies

## Tool Management

### Adding, Removing, and Modifying SOC Tools

#### Tool Registration Process

1. **Access Tool Configuration**
   
   Via CyberBlueSOC admin interface or directly in database/API.

2. **Define Tool Properties**
   
   ```json
   {
     "name": "Wazuh SIEM",
     "category": "SIEM",
     "description": "Enterprise-grade security monitoring",
     "docker_image": "wazuh/wazuh-manager:4.7.2",
     "ports": ["1514:1514", "1515:1515", "55000:55000"],
     "volumes": ["/var/ossec/data:/var/ossec/data"],
     "environment": {
       "WAZUH_INDEXER_URL": "wazuh-indexer:9200"
     },
     "health_check": {
       "test": ["CMD-SHELL", "curl -f http://localhost:55000/"],
       "interval": "30s",
       "timeout": "10s",
       "retries": 3
     }
   }
   ```

3. **Container Configuration**
   
   - Define resource limits (CPU, memory)
   - Configure networking and service discovery
   - Set up persistent volumes for data retention

4. **Integration Setup**
   
   - Configure API endpoints for status monitoring
   - Set up authentication credentials
   - Define health check endpoints

#### Tool Lifecycle Management

1. **Deployment**
   
   ```bash
   # Add new tool to docker-compose.yml
   docker compose up -d new_tool_service
   
   # Register in CyberBlueSOC database
   curl -X POST https://api.yourcompany.com/tools \
     -H "Authorization: Bearer $ADMIN_TOKEN" \
     -d @tool_config.json
   ```

2. **Configuration Updates**
   
   ```bash
   # Update tool configuration
   docker compose exec new_tool_service configure_tool.sh
   
   # Restart with new settings
   docker compose restart new_tool_service
   ```

3. **Removal Process**
   
   ```bash
   # Graceful shutdown
   docker compose stop new_tool_service
   
   # Remove from CyberBlueSOC
   curl -X DELETE https://api.yourcompany.com/tools/new_tool \
     -H "Authorization: Bearer $ADMIN_TOKEN"
   
   # Clean up volumes (if permanent removal)
   docker volume rm cyberblue_new_tool_data
   ```

#### Managing System Health Monitoring Tools

##### Prometheus Configuration

1. **Service Discovery**
   
   ```yaml
   # prometheus.yml
   global:
     scrape_interval: 15s
   
   scrape_configs:
     - job_name: 'cyberblue-soc'
       static_configs:
         - targets: ['api:8000', 'web:80']
       metrics_path: '/metrics'
   
     - job_name: 'soc-tools'
       dns_sd_configs:
         - names: ['_prometheus._tcp.cyberblue.local']
   ```

2. **Custom Metrics**
   
   - API response times and error rates
   - Database connection pools
   - Tool status and health scores
   - User session metrics

##### Grafana Dashboard Management

1. **Dashboard Creation**
   
   - Import pre-built SOC dashboards
   - Create custom panels for specific metrics
   - Set up alerting rules and notifications

2. **Data Source Configuration**
   
   ```yaml
   # Configure Prometheus as data source
   apiVersion: 1
   datasources:
     - name: Prometheus
       type: prometheus
       url: http://prometheus:9090
       access: proxy
   ```

3. **Alert Rules**
   
   - Configure alerts for service down states
   - Set up notification channels (email, Slack, PagerDuty)
   - Define escalation policies

## Advanced Configurations

### WebSocket Channels for Real-time Updates

#### WebSocket Architecture

CyberBlueSOC uses WebSocket connections for real-time communication between the frontend dashboard and backend services.

1. **Connection Establishment**
   
   ```javascript
   // Frontend connection
   const ws = new WebSocket('wss://api.yourcompany.com/ws/dashboard');
   
   ws.onmessage = (event) => {
     const update = JSON.parse(event.data);
     updateDashboard(update);
   };
   ```

2. **Channel Configuration**
   
   ```python
   # Backend WebSocket manager
   @app.websocket("/ws/dashboard")
   async def dashboard_websocket(websocket: WebSocket):
       await websocket.accept()
       # Register client for updates
       websocket_manager.add_client(websocket)
   ```

3. **Message Routing**
   
   - **Tool Status Updates**: Real-time tool health and status changes
   - **Alert Notifications**: Instant security alert delivery
   - **Incident Updates**: Live incident status and assignment changes
   - **Metrics Broadcast**: Continuous system health data

#### WebSocket Security

1. **Authentication**
   
   - JWT token validation on connection
   - Role-based channel access
   - Connection rate limiting

2. **Encryption**
   
   - WSS (WebSocket Secure) only
   - Certificate-based authentication
   - Message encryption for sensitive data

### Managing Tool Configurations in the Backend

#### Configuration Management System

1. **Tool Configuration Schema**
   
   ```python
   # Tool configuration model
   class ToolConfig(BaseModel):
       name: str
       category: str
       docker_config: DockerConfig
       api_endpoints: List[str]
       authentication: AuthConfig
       monitoring: MonitoringConfig
   ```

2. **Dynamic Configuration Updates**
   
   ```python
   # Update tool configuration
   @app.put("/tools/{tool_id}/config")
   async def update_tool_config(
       tool_id: str,
       config: ToolConfigUpdate,
       current_user: User = Depends(get_current_admin_user)
   ):
       # Validate configuration
       validated_config = validate_tool_config(config)
       
       # Update database
       await update_tool_in_db(tool_id, validated_config)
       
       # Apply to running container
       await restart_tool_container(tool_id)
       
       return {"status": "configuration_updated"}
   ```

3. **Configuration Validation**
   
   - Schema validation using Pydantic
   - Dependency checking
   - Security policy enforcement
   - Performance impact assessment

### Backup and Restore Procedures

#### Automated Backup Strategy

1. **Database Backups**
   
   ```bash
   # Daily database backup
   0 2 * * * docker compose exec -T db pg_dump -U cyberblue cyberblue_soc | gzip > /backups/db_$(date +\%Y\%m\%d).sql.gz
   
   # Retention policy: 30 days
   0 3 * * * find /backups -name "db_*.sql.gz" -mtime +30 -delete
   ```

2. **Configuration Backups**
   
   ```bash
   # Environment files
   cp /opt/cyberblue/.env /backups/config_$(date +%Y%m%d).env
   
   # Docker volumes
   docker run --rm -v cyberblue_pgdata:/data -v /backups:/backup alpine tar czf /backup/volumes_$(date +%Y%m%d).tar.gz -C /data .
   ```

3. **Keycloak Realm Backup**
   
   ```bash
   # Export realm configuration
   curl -X POST "https://auth.yourcompany.com/admin/realms/cyberblue-soc/partial-export" \
     -H "Authorization: Bearer $ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"exportClients": true, "exportGroupsAndRoles": true}' \
     > /backups/realm_$(date +%Y%m%d).json
   ```

#### Disaster Recovery Procedures

1. **Complete System Recovery**
   
   ```bash
   # Stop all services
   cd /opt/cyberblue
   docker compose down
   
   # Restore database
   docker compose up -d db
   docker compose exec -T db gunzip < /backups/db_latest.sql.gz | psql -U cyberblue cyberblue_soc
   
   # Restore volumes
   docker run --rm -v cyberblue_pgdata:/data -v /backups:/backup alpine tar xzf /backup/volumes_latest.tar.gz -C /data .
   
   # Start all services
   docker compose up -d
   
   # Verify recovery
   curl https://soc.yourcompany.com/health
   ```

2. **Partial Recovery Scenarios**
   
   - Single service recovery
   - Data corruption recovery
   - Configuration rollback procedures

## Security & Hardening

### Securing the SOC Platform

#### Network Security Best Practices

1. **Network Segmentation**
   
   - SOC tools in isolated Docker networks
   - Database accessible only to API services
   - External access through Traefik reverse proxy only

2. **Firewall Configuration**
   
   ```bash
   # UFW rules for production
   ufw default deny incoming
   ufw default allow outgoing
   ufw allow 22/tcp          # SSH
   ufw allow 80/tcp          # HTTP (redirect)
   ufw allow 443/tcp         # HTTPS
   ufw allow from 10.0.0.0/8 # Internal network
   ufw --force enable
   ```

3. **Zero Trust Architecture**
   
   - Every request authenticated and authorized
   - Service-to-service mutual TLS
   - Network-level encryption for all communications

#### Password Policies and Account Security

1. **Password Complexity Requirements**
   
   - Minimum 12 characters
   - Mix of uppercase, lowercase, numbers, symbols
   - No dictionary words or common patterns
   - Regular password rotation (90 days)

2. **Account Lockout Policies**
   
   - 5 failed attempts lock account for 30 minutes
   - Progressive lockout times
   - Administrator notification on lockouts

3. **Session Management**
   
   - Session timeout after 60 minutes of inactivity
   - Single session per user
   - Secure session cookies with HttpOnly and Secure flags

#### SSL/TLS Setup and Management

1. **Certificate Management**
   
   ```bash
   # Let's Encrypt with Traefik
   certificatesResolvers:
     letsencrypt:
       acme:
         email: admin@yourcompany.com
         storage: /letsencrypt/acme.json
         httpChallenge:
           entryPoint: web
   ```

2. **SSL Configuration**
   
   - TLS 1.3 only
   - Strong cipher suites
   - HSTS headers
   - Certificate pinning for APIs

3. **Certificate Monitoring**
   
   - Automatic renewal via Traefik
   - Expiry alerts 30 days in advance
   - Certificate transparency monitoring

### Configuring VPN or Zero-Trust Network Access

#### VPN Configuration

1. **OpenVPN Setup**
   
   ```bash
   # Install OpenVPN
   apt install openvpn easy-rsa
   
   # Generate certificates
   ./easyrsa init-pki
   ./easyrsa build-ca
   ./easyrsa gen-req server nopass
   ./easyrsa sign-req server server
   
   # Configure server
   cp pki/ca.crt /etc/openvpn/
   cp pki/issued/server.crt /etc/openvpn/
   cp pki/private/server.key /etc/openvpn/
   ```

2. **Client Configuration**
   
   - Generate client certificates
   - Distribute .ovpn files securely
   - Configure auto-connection for SOC users

#### Zero-Trust Network Access (ZTNA)

1. **Identity-Aware Proxy Setup**
   
   - All access requires valid authentication
   - Context-aware access policies
   - Continuous verification of device health

2. **Service Mesh Integration**
   
   - Istio or Linkerd for service-to-service security
   - Mutual TLS between all services
   - Fine-grained traffic policies

## Maintenance

### Regular Maintenance Tasks

#### Daily Maintenance Checklist

- [ ] Review system health dashboard for alerts
- [ ] Check disk space usage (>80% requires attention)
- [ ] Verify all SOC tools are running and healthy
- [ ] Review authentication logs for suspicious activity
- [ ] Check backup completion status
- [ ] Monitor SSL certificate expiry dates

#### Weekly Maintenance Tasks

- [ ] Update Docker container images
- [ ] Review and rotate application logs
- [ ] Analyze performance metrics trends
- [ ] Test backup restoration procedures
- [ ] Verify monitoring alert configurations
- [ ] Check user account status and permissions

#### Monthly Maintenance Tasks

- [ ] Security patch updates for all containers
- [ ] User access review and cleanup
- [ ] Database maintenance (vacuum, reindex)
- [ ] Certificate renewal verification
- [ ] Compliance audit preparation
- [ ] Performance optimization review

### Upgrading the System

#### Version Upgrade Process

1. **Pre-Upgrade Preparation**
   
   ```bash
   # Create full backup
   ./backup.sh full
   
   # Review release notes
   # Check compatibility matrix
   # Notify users of maintenance window
   ```

2. **Upgrade Execution**
   
   ```bash
   # Pull new images
   docker compose pull
   
   # Update environment variables if needed
   # Modify docker-compose.yml for new services
   
   # Deploy with zero-downtime
   docker compose up -d --scale web=2
   docker compose up -d --scale api=2
   # Wait for health checks
   docker compose up -d --scale web=1
   docker compose up -d --scale api=1
   ```

3. **Post-Upgrade Validation**
   
   - Verify all services are running
   - Test critical functionality
   - Check logs for errors
   - Update documentation

#### Rolling Back Upgrades

```bash
# Quick rollback procedure
docker compose down
git checkout previous_version_tag
docker compose pull
docker compose up -d

# Restore from backup if needed
./restore.sh latest
```

### Troubleshooting Common Issues

#### Keycloak Authentication Problems

1. **Users Can't Log In**
   
   - Check realm configuration
   - Verify user credentials and status
   - Review Keycloak logs: `docker compose logs keycloak`
   - Test OIDC endpoints: `curl https://auth.yourcompany.com/realms/cyberblue-soc/.well-known/openid-connect-configuration`

2. **Token Validation Errors**
   
   - Verify JWT secret keys match between Keycloak and API
   - Check token expiration settings
   - Validate CORS configuration
   - Review network connectivity

#### WebSocket Connection Issues

1. **Connection Drops**
   
   - Check reverse proxy WebSocket support
   - Verify firewall rules allow WebSocket traffic
   - Monitor connection pool limits
   - Review client-side error handling

2. **Real-time Updates Not Working**
   
   - Verify WebSocket server is running
   - Check authentication for WebSocket connections
   - Review message queue configuration
   - Test with WebSocket client tools

#### Database Connectivity Issues

1. **Connection Pool Exhaustion**
   
   - Monitor active connections: `SELECT count(*) FROM pg_stat_activity;`
   - Adjust pool size in application configuration
   - Check for connection leaks in application code
   - Implement connection retry logic

2. **Performance Degradation**
   
   - Analyze slow queries: `SELECT * FROM pg_stat_statements ORDER BY total_time DESC;`
   - Check index usage and create missing indexes
   - Review table bloat and vacuum strategy
   - Consider read replicas for high-traffic scenarios

#### High Resource Usage

1. **Memory Issues**
   
   - Monitor container memory usage: `docker stats`
   - Adjust memory limits in docker-compose.yml
   - Profile application memory usage
   - Check for memory leaks in application code

2. **CPU Performance**
   
   - Identify CPU-intensive processes
   - Optimize database queries
   - Consider horizontal scaling
   - Review background job scheduling

## Conclusion

### Summary of SOC Platform Administration

Successful administration of CyberBlueSOC requires a comprehensive understanding of modern cybersecurity operations, microservices architecture, and security best practices. The platform's modular design allows administrators to:

- **Maintain Operational Excellence**: Through proactive monitoring, automated maintenance, and efficient incident response
- **Ensure Security Posture**: Via robust authentication, network segmentation, and continuous security hardening
- **Scale Effectively**: With container orchestration, resource management, and performance optimization
- **Support SOC Teams**: By providing reliable tools, comprehensive documentation, and responsive support

### Best Practices for Ongoing SOC Maintenance

#### Operational Excellence

1. **Implement Change Management**
   
   - Document all configuration changes
   - Test changes in staging environment first
   - Maintain rollback procedures for all changes
   - Communicate changes to SOC team members

2. **Establish Monitoring Baselines**
   
   - Define normal operating parameters for all metrics
   - Set up alerting thresholds based on historical data
   - Regularly review and adjust monitoring rules
   - Document incident response procedures

3. **Maintain Documentation**
   
   - Keep runbooks updated with current procedures
   - Document custom configurations and integrations
   - Maintain inventory of all systems and credentials
   - Create knowledge base for common issues

#### Security Maintenance

1. **Regular Security Assessments**
   
   - Conduct quarterly security reviews
   - Perform vulnerability scans of all components
   - Review and update security policies
   - Stay informed about security threats and patches

2. **Access Control Governance**
   
   - Regular review of user access and permissions
   - Implement principle of least privilege
   - Conduct periodic access certification campaigns
   - Maintain audit logs for compliance requirements

#### Performance Optimization

1. **Capacity Planning**
   
   - Monitor resource utilization trends
   - Plan for growth and peak loads
   - Optimize database performance
   - Scale services based on demand

2. **Continuous Improvement**
   
   - Regularly review system performance
   - Optimize slow queries and processes
   - Update to latest stable versions
   - Implement performance monitoring dashboards

#### Team Collaboration

1. **Knowledge Sharing**
   
   - Conduct regular training sessions
   - Share lessons learned from incidents
   - Maintain comprehensive documentation
   - Foster collaboration between team members

2. **Support Structure**
   
   - Establish clear escalation paths
   - Define service level agreements
   - Maintain vendor relationships
   - Plan for knowledge transfer and succession

By following these administrative guidelines and best practices, CyberBlueSOC administrators can ensure their SOC platform remains secure, reliable, and effective in supporting cybersecurity operations. Regular maintenance, proactive monitoring, and continuous improvement are essential for maintaining a robust SOC infrastructure that can adapt to evolving security threats and organizational needs.

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