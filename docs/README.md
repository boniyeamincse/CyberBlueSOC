# CyberBlue SOC Documentation

Welcome to the CyberBlue SOC platform documentation. This documentation provides comprehensive guidance for users, administrators, and developers working with the CyberBlue Security Operations Center platform.

## 📖 Documentation Overview

| Document | Audience | Purpose |
|----------|----------|---------|
| **[📊 Comprehensive SOC Architecture](./comprehensive-soc-architecture.md)** | All Users | Complete system architecture with detailed diagrams |
| **[🏗️ Architecture Description](./architecture-description.md)** | Developers, Architects | Detailed text-based architecture explanation |
| **[🔧 SOC Architecture Diagram](./SOC_Architecture.md)** | All Users | ASCII visual representation of system components |
| **[User Guide](./user-guide.md)** | SOC Analysts, Managers | How to use the platform for daily operations |
| **[Admin Guide](./admin-guide.md)** | System Administrators | Installation, configuration, and maintenance |
| **[Cheatsheet](./cheatsheet.md)** | All Users | Quick reference and common commands |
| **[Developer Docs](./dev-docs.md)** | Developers | Architecture, API, and contribution guidelines |

## 🚀 Quick Start

### For Users
If you're new to CyberBlue SOC:

1. **Read the [User Guide](./user-guide.md)** to understand basic operations
2. **Check the [Cheatsheet](./cheatsheet.md)** for quick commands
3. **Access the platform** at your organization's URL

### For Administrators
If you're setting up or managing CyberBlue SOC:

1. **Follow the [Admin Guide](./admin-guide.md)** for installation
2. **Configure authentication** and user access
3. **Set up monitoring** and alerting

### For Developers
If you're contributing to CyberBlue SOC:

1. **Study the [Developer Docs](./dev-docs.md)** for architecture
2. **Set up the development environment**
3. **Follow the contribution guidelines**

## 🏗️ Architecture Overview

CyberBlue SOC is a modern, containerized security operations platform featuring:

- **Unified Dashboard**: Single pane of glass for all SOC tools
- **Role-Based Access**: Admin, Analyst, and Manager permissions
- **Real-time Monitoring**: Live tool status and system metrics
- **Automated Incident Response**: SOAR capabilities with playbooks
- **Audit Compliance**: Complete activity logging and reporting
- **Production Ready**: Security hardening and enterprise features

### Technology Stack

```
Frontend: React + TypeScript + Tailwind CSS
Backend: FastAPI + Python + SQLAlchemy
Database: PostgreSQL
Auth: Keycloak + OIDC + JWT
Reverse Proxy: Traefik
Monitoring: Prometheus + Grafana
Search: OpenSearch
Container: Docker + Docker Compose
```

## 🛠️ SOC Tools Integration

CyberBlue SOC integrates with leading security tools:

| Category | Tools | Purpose |
|----------|-------|---------|
| **SIEM** | Wazuh | Log collection, alerting, threat detection |
| **SOAR** | Shuffle | Automated workflows and incident response |
| **Threat Intel** | MISP | IOC sharing and correlation |
| **Incident Response** | TheHive + Cortex | Case management and analysis |
| **Endpoint** | FleetDM | Device management and monitoring |
| **Network** | Arkime | Packet capture and analysis |

## 📊 Key Features

### 🔐 Security & Compliance
- **End-to-end encryption** with TLS 1.3
- **Role-based access control** with fine-grained permissions
- **Complete audit logging** for regulatory compliance
- **Rate limiting** and security headers protection

### ⚡ Performance & Scalability
- **Microservices architecture** for independent scaling
- **Real-time updates** via WebSocket connections
- **Efficient caching** and database optimization
- **Horizontal scaling** capabilities

### 🤖 Automation & Intelligence
- **AI-powered assistant** for SOC guidance
- **Automated playbooks** for incident response
- **Threat intelligence integration** with external feeds
- **Customizable workflows** and automation rules

### 📈 Monitoring & Analytics
- **Comprehensive dashboards** in Grafana
- **System metrics collection** via Prometheus
- **Log aggregation** with OpenSearch
- **Performance monitoring** and alerting

## 🔧 Installation Options

### Production Deployment (Recommended)

```bash
cd infrastructure
cp .env.example .env
# Edit .env with secure passwords
docker compose up -d --build
```

**Access**: https://soc.local/

### Development Setup

```bash
# Backend
cd soc/apps/api && pip install -r requirements.txt && uvicorn main:app --reload

# Frontend
cd soc/apps/web && npm install && npm run dev

# Services
cd infrastructure && docker compose up -d db keycloak
```

**Access**: http://localhost:5173/ (frontend) and http://localhost:8000/ (API)

## 👥 User Roles & Permissions

| Role | Dashboard Access | Tool Management | Incident Creation | Metrics | Audit Logs | Admin Functions |
|------|------------------|-----------------|-------------------|---------|------------|-----------------|
| **Admin** | ✅ Full | ✅ Full Control | ✅ Any | ✅ Full | ✅ Full | ✅ Complete |
| **Analyst** | ✅ Read | ✅ Start/Stop | ✅ Own/Create | ✅ Read | ✅ Read | ❌ None |
| **Manager** | ✅ Read | ❌ None | ✅ Read | ✅ Read | ✅ Export | ❌ None |

## 📚 API Documentation

### Interactive API Docs

- **Swagger UI**: `https://api.soc.local/docs`
- **ReDoc**: `https://api.soc.local/redoc`
- **OpenAPI Spec**: [`cyberblue-openapi.json`](../cyberblue-openapi.json)

### Key Endpoints

```bash
# Tools management
GET    /api/tools           # List all tools
POST   /api/actions/{id}/{op} # Start/stop/restart tools

# Incident management
POST   /api/incidents       # Create incident
GET    /api/incidents       # List incidents
PUT    /api/incidents/{id}/status # Update status

# Automation
POST   /api/playbooks/virustotal-enrich    # Enrich IOCs
POST   /api/playbooks/auto-incident-response # Automated response

# Reporting
GET    /api/export/csv      # Export tools to CSV
GET    /api/audit-logs      # Audit log access
```

## 🔍 Troubleshooting

### Common Issues

**"Cannot access dashboard"**
- Check DNS resolution for `soc.local`
- Verify SSL certificate validity
- Ensure Keycloak is running

**"Tools not starting"**
- Check system resources (CPU/memory)
- Review container logs: `docker compose logs`
- Verify Docker daemon is running

**"Authentication failed"**
- Confirm Keycloak realm configuration
- Check user credentials and roles
- Verify JWT token expiration

**"Slow performance"**
- Monitor system resources
- Check database connection pool
- Review API response times

### Support Resources

- **Logs**: `docker compose logs -f [service]`
- **Metrics**: Access Grafana dashboard
- **Health Checks**: `curl https://api.soc.local/health`
- **API Docs**: Interactive Swagger documentation

## 🚀 Roadmap & Future Features

### Phase 2 (SOAR Integration) - In Progress
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
- [ ] Compliance reporting

## 🤝 Contributing

We welcome contributions! Please see the [Developer Docs](./dev-docs.md) for:

- Development environment setup
- Code style guidelines
- Testing procedures
- API development patterns
- Deployment workflows

### Contribution Process

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests and documentation
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

- **Documentation**: This docs folder
- **Issues**: GitHub Issues for bugs and feature requests
- **Discussions**: GitHub Discussions for questions
- **Security**: security@cyberblue-soc.local for security issues

## 🎯 About CyberBlue SOC

CyberBlue SOC is designed to democratize security operations by providing:

- **Unified Interface**: Single dashboard for all security tools
- **Automation**: Reduce manual work with intelligent playbooks
- **Scalability**: From small teams to enterprise deployments
- **Compliance**: Built-in audit trails and reporting
- **Community**: Open-source and extensible architecture

Whether you're a small security team or a large enterprise, CyberBlue SOC provides the tools and automation needed to effectively monitor, detect, and respond to security threats.

---

**Getting Started**: Begin with the [User Guide](./user-guide.md) or jump straight to deployment with the [Admin Guide](./admin-guide.md).