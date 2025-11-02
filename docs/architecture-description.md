# CyberBlueSOC System Architecture - Detailed Description

## Overview
CyberBlueSOC is a comprehensive Security Operations Center (SOC) platform built with a modern microservices architecture, providing unified security tool management, real-time monitoring, and automated incident response capabilities.

## Architecture Components

### 1. External Access Layer
- **Internet Access**: All external connections enter through HTTPS/TLS with MFA support
- **Reverse Proxy/WAF**: Nginx or Traefik handles load balancing, SSL termination, HSTS, rate limiting, and Web Application Firewall protection
- **Port**: 443 (HTTPS)

### 2. Core Services Layer

#### Web Frontend
- **Technology**: React with Tailwind CSS
- **Purpose**: User interface for CyberBlueSOC dashboard
- **Authentication**: OIDC integration with Keycloak
- **Features**: Real-time dashboards, tool management, alerts, and reporting

#### Authentication Service
- **Technology**: Keycloak with OAuth2/OIDC
- **Features**:
  - Multi-Factor Authentication (MFA)
  - Role-Based Access Control (RBAC)
  - JWT token management
  - Identity Provider integration (SAML/IdP support)

#### Backend API
- **Technology**: FastAPI/NestJS
- **Interfaces**: REST API and WebSocket support
- **Purpose**: Main business logic, tool orchestration, and data processing
- **Integration**: Async job processing and incident response workflows

#### Message Bus
- **Technology**: Redis/RabbitMQ
- **Purpose**: Asynchronous communication between services
- **Queues**: Jobs, alerts, and real-time notifications

### 3. Data Storage Layer

#### Relational Database
- **Technology**: PostgreSQL
- **Data Types**:
  - User accounts and RBAC configurations
  - Incident cases and case management
  - System configuration settings
  - Audit logs and system metrics

#### Time-Series and Log Storage
- **Technology**: OpenSearch/Elasticsearch
- **Data Sources**:
  - Wazuh security indices
  - Suricata IDS/IPS events (EVE JSON format)
  - Zeek network analysis logs
  - System performance metrics (CPU, memory, uptime, agent status)

#### Visualization Layer
- **Technology**: Grafana/Kibana with React/Recharts
- **Purpose**: Dashboards for metrics visualization and log analysis

### 4. SOC Tooling Network

The SOC tooling is organized into specialized security domains:

#### Digital Forensics and Incident Response (DFIR)
- **Velociraptor**: Advanced digital forensics and endpoint visibility
- **Arkime/Zeek**: Network traffic capture and analysis

#### Security Information and Event Management (SIEM)
- **Wazuh Manager + Indexer**: Centralized log management and security monitoring
- **Suricata**: Network-based IDS/IPS with EVE JSON output

#### Security Orchestration, Automation, and Response (SOAR)
- **Shuffle**: Playbook-based automation for incident response
- **TheHive + Cortex**: Case management and automated analysis

#### Threat Intelligence
- **MISP/OpenCTI**: Threat intelligence platforms
- **External Feeds**: VirusTotal, AbuseIPDB integration

#### Endpoint Management
- **FleetDM**: Osquery-based endpoint management
- **Agent Deployment**: Distributed across managed hosts

## Data Flow

### Log and Alert Ingestion
1. Security tools (Wazuh, Suricata, Zeek) generate logs and alerts
2. Data flows through message queues (optional Kafka integration)
3. Logs are indexed in OpenSearch for search and analysis
4. Real-time alerts trigger automated responses via Shuffle playbooks

### Incident Response Workflow
1. Alerts are detected by SIEM tools
2. Cases are created in TheHive
3. Cortex analyzers provide automated investigation
4. Shuffle executes remediation playbooks
5. Actions may include endpoint isolation, IOC blocking, or notification

### Threat Intelligence Integration
1. External threat feeds are ingested into MISP/OpenCTI
2. IOCs (Indicators of Compromise) are curated and enriched
3. Intelligence is shared with security tools for proactive detection
4. Automated blocking rules are deployed to endpoints and network devices

## Network Security

### Segmentation
- **Production Network**: Isolated from SOC management network
- **SOC Management VLAN**: Dedicated network segment for security tools
- **Access Control**: Zero-trust model with VPN requirements for sensitive operations

### Security Controls
- **Port Restrictions**: Only necessary ports are exposed
- **Internal mTLS**: Mutual TLS for service-to-service communication
- **Network Monitoring**: Zeek and Suricata provide continuous network visibility

## Deployment Architecture

### Container Orchestration
- **Docker**: All services run in containers
- **Docker Compose**: Local development and testing
- **Kubernetes**: Production deployment option

### Service Discovery and Load Balancing
- **Traefik**: Reverse proxy with automatic service discovery
- **Health Checks**: Continuous monitoring of service availability

## Scalability Considerations

### Horizontal Scaling
- **Microservices**: Independent scaling of components
- **Load Balancing**: Distributed request handling
- **Database Sharding**: Data partitioning for performance

### High Availability
- **Redundancy**: Multiple instances of critical services
- **Failover**: Automatic switching to backup systems
- **Data Replication**: Cross-region data synchronization

## Monitoring and Observability

### Metrics Collection
- **System Metrics**: CPU, memory, disk, network utilization
- **Application Metrics**: Request rates, error rates, response times
- **Security Metrics**: Alert volumes, incident response times

### Logging and Alerting
- **Centralized Logging**: All logs aggregated in OpenSearch
- **Real-time Alerts**: Immediate notification of security events
- **Audit Trails**: Comprehensive activity logging for compliance

## Integration Points

### API Integrations
- **REST APIs**: Standard HTTP interfaces for all services
- **WebSocket**: Real-time data streaming for dashboards
- **GraphQL**: Flexible data querying with schema-driven APIs (optional)

#### GraphQL Visualization Architecture

The GraphQL layer provides a unified query interface for complex data relationships:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GraphQL       │    │   Data Loaders  │    │   Resolvers     │
│   Schema        │◄──►│   Batching      │◄──►│   Field         │
│   Types         │    │   Caching       │    │   Resolution    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │   Redis Cache   │    │   OpenSearch    │
│   Relational    │    │   Session       │    │   Search        │
│   Data          │    │   Store         │    │   Indices       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

**GraphQL Schema Components**:
- **Query Types**: `tools`, `alerts`, `incidents`, `metrics`
- **Mutation Types**: `startTool`, `stopTool`, `createIncident`, `updateCase`
- **Subscription Types**: `toolStatusChanged`, `alertReceived`, `metricUpdated`
- **Custom Types**: `Tool`, `Alert`, `Incident`, `Metric`, `User`

**Benefits**:
- **Single Endpoint**: Unified API access instead of multiple REST endpoints
- **Flexible Queries**: Clients request exactly the data they need
- **Strong Typing**: Schema-driven development with type safety
- **Real-time Updates**: Built-in subscription support for live data
- **Efficient Batching**: DataLoader pattern prevents N+1 query problems

**Implementation Options**:
- **Apollo GraphQL**: Full-featured GraphQL server with federation support
- **Graphene-Python**: Python library for building GraphQL APIs with FastAPI
- **Strawberry**: Modern Python GraphQL library with dataclasses integration

### Third-party Tools
- **SIEM Integration**: Wazuh, Splunk, ELK stack compatibility
- **Threat Intel**: Integration with commercial and open-source feeds
- **Cloud Services**: AWS, Azure, GCP security service integration

This architecture provides a robust, scalable, and secure foundation for modern SOC operations, enabling efficient threat detection, investigation, and response while maintaining operational visibility and compliance.