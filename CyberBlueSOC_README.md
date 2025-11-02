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
- **Network IDS/IPS** — Suricata integration with Filebeat-OpenSearch pipeline for real-time threat detection
- **Multi-Tool Support** — Native integration with 10+ security tools

### 🎨 Modern User Experience
- **Responsive Design** — Optimized for desktop, tablet, and mobile devices
- **Dark Theme UI** — Built with React, TypeScript, and Tailwind CSS
- **Interactive Components** — Shadcn/ui component library for consistent UX
- **Accessibility** — WCAG 2.1 compliant interface design

## Core Features

1. Secure User Authentication

OIDC-based Authentication (Keycloak): Supports single sign-on (SSO) and role-based access control (RBAC) with Admin, Analyst, and Manager roles.

Multi-factor Authentication (MFA): Add an extra layer of security for users logging into the platform.

Role-based Access Control (RBAC): Enforces access restrictions based on user roles to ensure the right people have access to the right data and tools.

2. Dashboard Overview

Unified SOC Dashboard: A single-page dashboard displaying system health, tools status, alerts, and metrics for quick oversight.

Real-Time Monitoring: View real-time data for security tools, network traffic, and system health (CPU, memory, container status).

Alerts Feed: Real-time alert notifications for high-priority security events.

Smart Suggestions: AI-driven recommendations to guide users on the next steps for incident response or monitoring.

System Health Monitoring: Includes uptime, CPU, memory, disk space usage, and health metrics of the entire SOC infrastructure.

3. Tools Management

Tool Integration: Seamlessly integrate security tools like Wazuh, Velociraptor, MISP, Cortex, TheHive, Suricata, Arkime, and more.

Tool Control: Start, stop, and restart security tools directly from the dashboard.

Credential Management: Store and retrieve tool credentials securely for use within the platform.

Tool Configuration: Edit configuration settings for connected tools directly from the UI.

4. Real-Time Threat Detection

Anomaly Detection: Detect unusual patterns in system behavior, network traffic, or security logs using machine learning models like Isolation Forest or Autoencoders.

Threat Intelligence Integration: Correlate indicators of compromise (IOCs) from external threat intelligence platforms (e.g., MISP, VirusTotal) and internal logs.

Intrusion Detection: Integrate with IDS/IPS tools like Suricata and Wazuh to identify potential malicious activities in real-time.

Incident Severity Classification: AI-powered models classify incidents into high, medium, or low severity to prioritize response actions.

Behavioral Analytics: Track normal user/system behavior and flag deviations that may indicate insider threats or malware.

5. Incident Response Automation

Automated Playbooks (SOAR): Automatically recommend and trigger response playbooks for common threats and incidents.

Incident Management: Create, track, and manage incidents in TheHive with automated case generation and escalation based on threat severity.

AI-Driven Incident Triage: Use AI to triage and prioritize security incidents based on their severity and historical data.

Actionable Alerts: Automatically trigger predefined actions like IP blocking, quarantining, or system shutdown upon detection of critical threats.

6. Threat Hunting

Intelligent Query Generation: Use AI to generate custom queries for threat hunting based on past incidents, attack vectors, or trends.

Behavioral Threat Hunting: Use machine learning to identify abnormal user or system behaviors and flag suspicious activities.

Advanced Log Analysis: Search through system and network logs using a sophisticated query interface to detect signs of advanced persistent threats (APTs).

AI-based Detection: Implement machine learning models for real-time threat detection and reporting based on historical patterns.

7. AI-Powered Alert Prioritization & Triage

Alert Correlation: AI algorithms automatically correlate alerts from different tools (e.g., Wazuh, Suricata) into single incidents for easier investigation.

Alert Severity Ranking: AI ranks alerts based on threat likelihood and impact, automatically filtering out false positives.

Incident Classification: Classify incidents by severity and urgency to streamline response and focus on high-priority issues.

8. AI-Powered Vulnerability Management

Automated Vulnerability Scanning: Integrate with vulnerability scanners to automatically identify and catalog vulnerabilities in the network.

AI Risk Scoring: Use machine learning to assign risk scores to vulnerabilities based on exploitability, impact, and threat intelligence feeds.

Vulnerability Prioritization: Prioritize remediation of vulnerabilities based on AI analysis, minimizing risk exposure.

9. Phishing Detection

Email Phishing Detection: AI-based models analyze email content, headers, and attachments to detect potential phishing attempts.

Phishing Simulation: Test users' ability to recognize phishing emails by simulating phishing attacks within the organization.

Automated Response: Automatically quarantine or block identified phishing emails to prevent user interaction with malicious links or attachments.

10. Data Exfiltration Detection

Traffic Anomaly Detection: AI models detect unusual data transfers or network activity that could indicate data exfiltration.

DLP Integration: Integration with Data Loss Prevention (DLP) systems to prevent unauthorized access or transfer of sensitive data.

Automated Alerts and Actions: Trigger alerts and automatic actions (e.g., blocking an IP or network) when data exfiltration patterns are detected.

11. AI-Driven Reporting

Automated Report Generation: Generate incident and system reports automatically using AI models that summarize the findings and actions taken.

Customizable Reporting: Allow users to generate custom reports based on tool data, alerts, and security metrics.

Incident Documentation: AI-driven assistance in documenting incidents and response actions, making it easy to create compliance-ready reports.

12. Graphical Visualization & Dashboards

Interactive Dashboards: View graphical representations of security data such as alerts, tool health, incidents, and threat intelligence feeds.

Real-Time Metrics Visualization: Use Grafana or similar tools to visualize real-time metrics, including system health, user behavior, and network traffic.

Threat Map: Global visualization of incoming attacks, including their geographic origin and targeted regions.

Historical Data Views: View historical trends in system health, security incidents, and attack activity.

13. Incident Collaboration & Case Management

Case Tracking: Manage security incidents with integrated case management (e.g., TheHive) for collaborative investigation.

Team Collaboration: Provide collaborative features for SOC teams to work on incidents, share findings, and assign tasks.

Escalation Management: Automatically escalate critical incidents based on severity or time-to-resolution metrics.

14. Real-Time Communication

WebSocket Support: Push real-time updates to the dashboard (e.g., tool health, alert status, system health) using WebSockets.

Integration with ChatOps: Integrate with communication tools like Slack or Microsoft Teams for real-time notifications and chat-based incident management.

Live Incident Monitoring: View live updates of ongoing incidents, including the number of open cases and status of active response actions.

15. Backup and Recovery

Automated Backups: Schedule regular backups of the database, configuration files, and incident data to ensure system integrity.

Disaster Recovery: Implement disaster recovery procedures for seamless recovery of critical data in case of failure.

Restore Tools & Data: Restore configuration, tool states, and user data to previous states when necessary.

Additional Features (Stretch Goals)

Mobile Access: Create a mobile app or responsive web interface for managing security incidents on the go.

Integrations with Other SOC Tools: Extend integrations with additional third-party tools like Elastic Stack, Splunk, and CrowdStrike for enhanced detection and response.

Custom Plugin Support: Allow users to add custom security tools or integrate with other third-party software as plugins within the SOC.

Machine Learning Model Management: Allow users to upload and manage custom machine learning models for threat detection or alert classification.

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
| Suricata | IDS/IPS | Real-time network threat detection and alerting |
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
- Network IDS/IPS with Suricata integration
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
