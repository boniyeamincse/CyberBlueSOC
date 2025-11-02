                           ┌─────────────────────────────── Internet ────────────────────────────────┐
                           │                                                                         │
                           │                         (HTTPS/TLS, MFA supported)                      │
                           │                                                                         │
                           └─────────────────────────────────────────────────────────────────────────┘
                                                   ▲
                                                   │ 443
                                      ┌────────────┴────────────┐
                                      │  Reverse Proxy / WAF    │  (Nginx / Traefik)
                                      │  HSTS, rate-limit, WAF  │
                                      └────────────┬────────────┘
                                                   │ internal mTLS
        ┌──────────────────────────────┬───────────┴───────────────────────────┬───────────────────────────────┐
        │                              │                                       │                               │
┌───────┴─────────┐          ┌─────────┴──────────┐                   ┌────────┴────────┐            ┌────────┴────────┐
│  Web Frontend   │          │  Auth Service      │                   │ Backend API     │            │  Message Bus    │
│  React/Tailwind │◀───────▶ │  Keycloak / OAuth2 │◀───(IdP/SAML)────▶│ FastAPI/NestJS  │◀──────────▶│  Redis/RabbitMQ │
│  (CyberBlueSOC) │  OIDC    │  MFA, RBAC, JWT    │                   │ REST/WebSockets │  jobs/IR   │  queues/alerts  │
└───────┬─────────┘          └─────────┬──────────┘                   └────────┬────────┘            └────────┬────────┘
        │                                tokens/JWT                                  │                            │
        │                                                                                async playbooks          │
        │                                ┌──────────────────────────────────────────────┼──────────────────────────┘
        │                                │                                              │
        │                       ┌────────┴─────────┐                         ┌──────────┴─────────┐
        │                       │  Relational DB   │                         │  Time-series/Logs  │
        │                       │  PostgreSQL      │                         │  OpenSearch/ES     │
        │                       │  users, RBAC,    │                         │  Wazuh indices,    │
        │                       │  cases, config   │                         │  Suricata, Zeek    │
        │                       └────────┬─────────┘                         └──────────┬─────────┘
        │                                 │                                           ┌─┴─────────────────────┐
        │                                 │                                           │ Dashboards / Metrics  │
        │                                 │                                           │ Grafana/Kibana        │
        │                                 │                                           └───────────────────────┘
        │                                 │
        │    ┌───────────────────────────────────────────────────────── SOC Tooling Network ──────────────────────────────────────────────────────┐
        │    │                                                                                                                                   │
        │    │  ┌───────── DFIR ─────────┐  ┌───────── SIEM ────────┐  ┌──────── SOAR ───────┐  ┌──── Threat Intel ────┐  ┌── Endpoint ───────┐ │
        │    │  │ Velociraptor           │  │ Wazuh Manager+Indexer │  │ Shuffle (playbooks) │  │ MISP / OpenCTI      │  │ FleetDM (osquery) │ │
        │    │  └────────┬───────────────┘  └─────────┬─────────────┘  └────────┬────────────┘  └──────────┬──────────┘  └─────────┬─────────┘ │
        │    │           │                             │                           │                         │                         │           │
        │    │  ┌────────┴─────────┐        ┌──────────┴─────────┐       ┌─────────┴────────┐     ┌──────────┴─────────┐    ┌────────┴────────┐ │
        │    │  │ Arkime / Zeek    │        │ Suricata (EVE JSON)│       │ TheHive + Cortex │     │ TI feeds/APIs     │    │ Agents (hosts)  │ │
        │    │  │ Net capture      │        │ IDS/IPS            │       │ Case mgmt/IR     │     │ (VT, AbuseIPDB)   │    │ endpoints        │ │
        │    │  └────────┬─────────┘        └──────────┬─────────┘       └─────────┬────────┘     └──────────┬─────────┘    └────────┬────────┘ │
        │    │           └─────► ship logs/pcaps/alerts ───────────────► (OpenSearch/Wazuh/Kafka optional) ◄──────── ingest/curate IOCs ────────┘ │
        │    └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
        │
        └────────────────── SOC Mgmt VLAN (segmented from Production; allow only needed ports, VPN/Zero-Trust access) ─────────────────────────────
