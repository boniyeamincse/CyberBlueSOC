# 🛡️ CyberBlueSOC - Enterprise Security Operations Center Platform

CyberBlueSOC is a **comprehensive, enterprise-grade Security Operations Center (SOC) platform** designed for modern cybersecurity operations. Built with cutting-edge technologies and following security best practices, it provides a unified command center for threat detection, incident response, and security tool orchestration.

[![GitHub](https://img.shields.io/badge/GitHub-CyberBlueSOC-blue)](https://github.com/boniyeamincse/CyberBlueSOC)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://docker.com)
[![Python](https://img.shields.io/badge/Python-3.11+-blue)](https://python.org)

---

## 🚀 Features

- **Secure Login (OIDC / Keycloak)** — Role-based authentication with Admin, Analyst, and Manager roles.  
- **Unified Dashboard** — Manage tools like Wazuh, Velociraptor, MISP, Cortex, TheHive, Shuffle, and more.  
- **Tool Control** — Start / Restart / Stop / View credentials per security tool.  
- **Live Metrics** — CPU, Memory, and container health monitoring.  
### 🔐 Enterprise Security Features
- **Zero-Trust Architecture** — Identity-based access control with continuous verification
- **Multi-Factor Authentication** — Enhanced security with Keycloak OIDC integration
- **Role-Based Access Control** — Granular permissions for Admin, Analyst, and Manager roles
- **End-to-End Encryption** — TLS 1.3 with certificate-based authentication
- **Audit Trail** — Comprehensive logging of all user actions and system events

### 🎯 SOC Operations
- **Unified Dashboard** — Single pane of glass for all integrated security tools
- **Real-Time Monitoring** — Live metrics, alerts, and system health visualization
- **Tool Orchestration** — Automated start/stop/restart of security services
- **Smart Suggestions** — AI-powered recommendations for threat hunting and response
- **WebSocket Updates** — Instant notifications and live data streaming

### 🔗 Advanced Integrations
- **GraphQL API** — Flexible, schema-driven data access and real-time subscriptions
- **REST API** — Comprehensive REST endpoints for third-party integrations
- **SOAR Automation** — Workflow-based incident response with Shuffle playbooks
- **Threat Intelligence** — IOC correlation with MISP and OpenCTI platforms
- **Multi-Tool Support** — Native integration with 10+ security tools

### 🎨 Modern User Experience
- **Responsive Design** — Optimized for desktop, tablet, and mobile devices
- **Dark Theme UI** — Built with React, TypeScript, and Tailwind CSS
- **Interactive Components** — Shadcn/ui component library for consistent UX
- **Accessibility** — WCAG 2.1 compliant interface design

---

## 🏗️ System Architecture Overview

For a detailed text-based architecture description, see [`docs/architecture-description.md`](docs/architecture-description.md).

```
Frontend (React + Tailwind) ─▶ FastAPI Backend ─▶ PostgreSQL (Users, Logs, Tools)
                                   │
                                   ├── Keycloak (OIDC Auth)
                                   ├── Wazuh / MISP / TheHive / Cortex / Shuffle
                                   ├── Grafana (Metrics Visualization)
                                   └── Traefik (Reverse Proxy with TLS)
```

---

## ⚙️ Tech Stack

| Layer | Technology |
|--------|-------------|
| **Frontend** | React + Vite + Tailwind + shadcn/ui |
| **Backend** | FastAPI (Python 3.11) + GraphQL |
| **Database** | PostgreSQL |
| **Authentication** | Keycloak (OIDC) |
| **Containerization** | Docker Compose |
| **Reverse Proxy** | Traefik |
| **Monitoring (optional)** | Grafana + Prometheus |
| **Automation (optional)** | Shuffle, TheHive, Cortex |

---

## 🧩 Modules

| Module | Description |
|---------|--------------|
| **User Management** | Secure login via OIDC, role-based access control |
| **Dashboard** | Grid-based control panel for all SOC tools |
| **System Status** | CPU, Memory, Containers, Health overview |
| **Smart Suggestions** | Recommended next steps or threat-hunting tasks |
| **Audit Logs** | Track every tool operation and user action |
| **SOAR Integration** | Integrate Shuffle and Cortex playbooks |
| **Threat Intel** | Sync indicators via MISP / OpenCTI |

---

## 🪄 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- Python 3.11+
- Git

### Setup Steps

```bash
git clone https://github.com/boniyeamincse/CyberBlueSOC.git
cd CyberBlueSOC

# Start everything
docker compose up -d --build

# Access the dashboard
https://soc.local/

# Default admin credentials
Username: admin
Password: change_me
```

---

## 🧠 Default Tools (Preloaded)

| Tool | Category | Description |
|------|-----------|-------------|
| Velociraptor | DFIR | Digital Forensics and Incident Response platform |
| Wazuh Dashboard | SIEM | Log analysis and security event management |
| Shuffle | SOAR | Security automation and orchestration platform |
| MISP | Threat Intel | IOC correlation and sharing platform |
| CyberChef | Utility | Data analysis and decoding tool |
| TheHive | SOAR | Incident response and case management |
| Cortex | SOAR | Threat analyzer integrated with TheHive |
| FleetDM | Endpoint Management | Osquery-based endpoint visibility |
| Arkime | Network Analysis | Full packet capture and session engine |
| Caldera | Attack Simulation | Adversary emulation framework |
| Evebox | Intrusion Detection | Web viewer for Suricata EVE JSON logs |
| Wireshark | Network Analysis | Protocol analyzer for traffic inspection |

---

## 🔒 Security Recommendations

- Enable HTTPS with valid TLS certs (Traefik or Nginx)  
- Enforce MFA in Keycloak  
- Restrict SOC access to VPN or internal network  
- Rotate API tokens and DB passwords regularly  
- Run containers as non-root  
- Enable Wazuh agent on SOC host for self-monitoring  

---

## 🧱 Directory Structure

```
/cyberbluesoc
 ├── apps/
 │    ├── web/           # React + Tailwind frontend
 │    └── api/           # FastAPI backend
 ├── infrastructure/
 │    ├── docker-compose.yml
 │    └── traefik/
 ├── packages/
 │    └── types/         # Shared TypeScript types
 ├── README.md
 └── .env.example
```

---

## 🧪 Development Commands

### Frontend
```bash
cd apps/web
npm install
npm run dev
```

### Backend
```bash
cd apps/api
pip install -r requirements.txt
uvicorn main:app --reload
```

### Full Stack (Docker)
```bash
docker compose up -d --build
```

---

## 📋 Documentation & Resources

- **📚 [Complete Documentation](./docs/)** — Comprehensive guides for all user types
- **🏗️ [System Architecture](./docs/comprehensive-soc-architecture.md)** — Detailed technical architecture
- **🔧 [Developer Guide](./docs/dev-docs.md)** — API documentation and contribution guidelines
- **📖 [User Manual](./docs/user-guide.md)** — Step-by-step operational procedures
- **⚙️ [Admin Guide](./docs/admin-guide.md)** — Installation and configuration guide

## 🤝 Contributing

We welcome contributions from the cybersecurity community! Here's how to get involved:

### Ways to Contribute
- **🐛 Bug Reports** — Report issues via [GitHub Issues](https://github.com/boniyeamincse/CyberBlueSOC/issues)
- **💡 Feature Requests** — Suggest new capabilities or improvements
- **🔧 Code Contributions** — Submit pull requests for bug fixes or enhancements
- **📖 Documentation** — Help improve documentation and guides
- **🧪 Testing** — Test new features and provide feedback

### Development Setup
```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/CyberBlueSOC.git
cd CyberBlueSOC

# Set up development environment
make setup-dev

# Run tests
make test

# Start development servers
make dev
```

### Contribution Guidelines
- Follow the existing code style and architecture patterns
- Write comprehensive tests for new features
- Update documentation for any user-facing changes
- Use conventional commit messages
- Ensure all CI/CD checks pass

## 📊 Project Roadmap

### ✅ Phase 1 - Core Platform (Completed)
- Enterprise-grade authentication and authorization
- Unified dashboard with real-time monitoring
- Containerized deployment with Docker
- Comprehensive API (REST, GraphQL, WebSocket)
- Production-ready security hardening

### 🚧 Phase 2 - Advanced SOC Operations (In Progress)
- AI-powered threat analysis and anomaly detection
- Automated incident response workflows
- Advanced threat intelligence integration
- Real-time alerting and notification systems

### 📋 Phase 3 - Enterprise Features (Planned)
- Multi-tenancy and role customization
- Advanced reporting and compliance dashboards
- Mobile application for SOC operations
- Integration with enterprise SIEM platforms

### 🔮 Phase 4 - AI & Automation (Future)
- Machine learning for threat prediction
- Automated threat hunting capabilities
- Natural language processing for incident analysis
- Predictive security analytics

## 🌟 Community & Support

- **📧 Email**: boniyeamin.cse@gmail.com
- **🌐 Website**: [www.ntasbd.com](https://www.ntasbd.com)
- **🐙 GitHub**: [github.com/boniyeamincse/CyberBlueSOC](https://github.com/boniyeamincse/CyberBlueSOC)
- **💬 Discussions**: Use [GitHub Discussions](https://github.com/boniyeamincse/CyberBlueSOC/discussions) for questions
- **🆘 Security Issues**: Report security vulnerabilities privately to security@cyberbluesoc.local

---

## 👨‍💻 Author

**Boni Yeamin**  
📧 Email: boniyeamin.cse@gmail.com  
🌐 Website: [www.ntasbd.com](https://www.ntasbd.com)  

---

## 🪪 License

This project is licensed under the **MIT License**.  
Feel free to use and modify with credit.

---

> “Cyber defense is not a one-time project — it’s a continuous journey.”
