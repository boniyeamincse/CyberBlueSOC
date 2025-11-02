# 🛡️ CyberBlueSOC - Security Operations Center Platform

CyberBlueSOC is a **next-generation Security Operations Center (SOC) platform** built for defenders, blue teams, and cybersecurity researchers.  
It provides a unified dashboard to monitor, manage, and automate security tools — all in one place.

---

## 🚀 Features

- **Secure Login (OIDC / Keycloak)** — Role-based authentication with Admin, Analyst, and Manager roles.  
- **Unified Dashboard** — Manage tools like Wazuh, Velociraptor, MISP, Cortex, TheHive, Shuffle, and more.  
- **Tool Control** — Start / Restart / Stop / View credentials per security tool.  
- **Live Metrics** — CPU, Memory, and container health monitoring.  
- **Smart Suggestions** — AI-based recommendations for next security actions.
- **WebSocket Updates** — Real-time tool and system status feed.
- **GraphQL API** — Flexible querying with schema-driven data access.
- **Audit Logging** — Every action is logged with user, tool, and timestamp.  
- **Dark Modern UI** — Built with React, Tailwind, and shadcn/ui.  
- **Extensible Architecture** — Modular backend and container-ready.  

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
git clone https://github.com/<your-org>/cyberbluesoc.git
cd cyberbluesoc

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

## 📊 Future Roadmap

- ✅ Core dashboard & RBAC login  
- ⏳ Integrate Wazuh & TheHive alerts feed  
- ⏳ Add AI Analyst (GPT-assisted investigation)  
- ⏳ Export reports (PDF/CSV)  
- ⏳ Mobile SOC app  

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
