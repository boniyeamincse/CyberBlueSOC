# CyberBlueSOC User Guide

## Introduction

### What is CyberBlueSOC?

CyberBlueSOC is a comprehensive Security Operations Center (SOC) platform designed to streamline cybersecurity operations through unified tool management, real-time monitoring, and automated incident response. It provides blue teams, defenders, and cybersecurity professionals with a single pane of glass to orchestrate and monitor their entire SOC stack.

The platform integrates industry-leading security tools into a cohesive ecosystem, enabling efficient threat detection, investigation, and response workflows. From SIEM alerts to threat intelligence correlation and automated remediation, CyberBlueSOC empowers security teams to work smarter, not harder.

### Benefits for Blue Teams and Defenders

**For SOC Analysts:**
- **Unified Visibility**: Monitor all security tools from a single dashboard instead of juggling multiple interfaces
- **Real-time Awareness**: Live WebSocket updates ensure you're always aware of system status and new alerts
- **Automated Response**: Leverage AI-powered suggestions and Shuffle playbooks for rapid incident handling
- **Comprehensive Coverage**: Built-in integration with Wazuh, MISP, TheHive, Shuffle, and other essential SOC tools

**For Security Managers:**
- **Operational Efficiency**: Reduce time spent on manual tool management and status checks
- **Compliance Ready**: Complete audit trails and reporting capabilities for regulatory requirements
- **Resource Optimization**: Monitor system health and resource usage to ensure optimal performance
- **Incident Tracking**: SLA tracking and incident lifecycle management for better oversight

**For Cybersecurity Professionals:**
- **Rapid Deployment**: Pre-configured Docker containers for quick setup of complex SOC environments
- **Extensible Architecture**: Easy integration of new tools and custom playbooks
- **Training Ground**: Safe environment for testing and practicing SOC procedures
- **Professional Development**: Learn from AI assistant recommendations and automated workflows

## Getting Started

### How to Access the Platform

CyberBlueSOC is secured with HTTPS-only access to ensure encrypted communications:

1. **Open your web browser** and navigate to: `https://soc.local`
2. **Certificate Acceptance**: Accept the self-signed SSL certificate (or configure your own CA-signed certificate)
3. **DNS Resolution**: Ensure `soc.local` resolves to your SOC server (add to hosts file if needed)

### How to Log In with Keycloak (OIDC Authentication)

CyberBlueSOC uses Keycloak for secure, enterprise-grade authentication:

1. **Access Login Page**: Click the "Login" button on the landing page
2. **OIDC Redirect**: You'll be automatically redirected to the Keycloak login portal
3. **Enter Credentials**:
   - **Username**: Your assigned SOC username
   - **Password**: Your SOC password
   - **MFA (if enabled)**: Enter your multi-factor authentication code
4. **Authorization**: Keycloak validates your credentials and redirects back to CyberBlueSOC
5. **Dashboard Access**: You're now logged in with appropriate permissions based on your role

### Overview of Main Dashboard Components

The CyberBlueSOC dashboard is organized into intuitive sections:

#### Tools Section
- **Tool Grid**: Visual cards representing each SOC tool (Wazuh, MISP, Shuffle, etc.)
- **Status Indicators**:
  - 🟢 **Running**: Tool operational and healthy
  - 🔴 **Stopped**: Tool offline or not responding
  - 🟡 **Restarting**: Tool in transition state
- **Bulk Actions Bar**: Select multiple tools for batch operations (start/stop/restart)
- **Filter Bar**: Filter tools by status, category, or health

#### Alerts & Incidents
- **Alert Feed**: Real-time security alerts from integrated tools
- **Incident Tracker**: Active cases with status, assignee, and timeline
- **Quick Actions**: One-click buttons for common incident response tasks

#### System Status
- **Health Metrics**: CPU, memory, disk usage, and container statistics
- **Network Monitoring**: Active connections and throughput metrics
- **Service Dependencies**: Inter-tool communication status

### How to Interact with Tools (Start, Stop, Restart)

#### Individual Tool Control

1. **Locate Tool**: Find the tool card in the main dashboard grid
2. **Action Buttons**:
   - **Start**: Click the ▶️ button to launch a stopped tool
   - **Stop**: Click the ⏹️ button to gracefully shut down a running tool
   - **Restart**: Click the 🔄 button to restart with fresh configuration
3. **Confirmation**: Some actions may require confirmation for critical tools
4. **Status Update**: Watch for real-time status changes via WebSocket

#### Bulk Tool Management

1. **Select Tools**: Check the checkboxes on multiple tool cards
2. **Bulk Actions Bar**: Appears at the top when tools are selected
3. **Choose Operation**: Select Start, Stop, or Restart for all selected tools
4. **Review & Confirm**: Verify the operation and click "Execute"
5. **Progress Monitoring**: Track progress through the bulk operation modal

## Key Features

### System Health Monitoring

CyberBlueSOC provides comprehensive system health monitoring to ensure optimal SOC performance:

#### CPU, Memory, and Container Monitoring

**Real-time Metrics Dashboard:**
- **CPU Usage**: Per-core and aggregate CPU utilization graphs
- **Memory Usage**: RAM and swap usage with trend analysis
- **Container Stats**: Individual container resource consumption
- **Disk I/O**: Read/write operations and latency monitoring

**Health Alerts:**
- **Threshold Warnings**: Automatic alerts when resources exceed safe limits
- **Predictive Analysis**: AI-powered predictions for resource exhaustion
- **Historical Trends**: 7-day, 30-day, and 90-day performance graphs

#### Container Health Checks

- **Automatic Health Probes**: Built-in checks for each SOC tool container
- **Dependency Monitoring**: Track inter-container communication status
- **Auto-healing**: Automatic restart of failed containers (configurable)
- **Health Scoring**: Overall system health score from 0-100

### How to View and Use Smart Suggestions

The AI Assistant provides intelligent recommendations to optimize your SOC operations:

#### Accessing AI Suggestions

1. **AI Assistant Panel**: Located in the right sidebar of the dashboard
2. **Contextual Suggestions**: AI analyzes current system state and alerts
3. **Proactive Recommendations**: Suggestions appear automatically based on patterns

#### Types of Smart Suggestions

**Operational Efficiency:**
- "Consider restarting Wazuh indexer - memory usage trending upward"
- "MISP has 150+ unprocessed IOCs - recommend enrichment playbook"

**Security Optimization:**
- "Detected unusual login pattern - review Keycloak logs"
- "Shuffle playbook 'IOC_Enrich' has been inactive for 24 hours"

**Performance Tuning:**
- "Grafana dashboards consuming high memory - consider archiving old data"
- "Network traffic spike detected - check Arkime for anomalies"

#### Using Suggestions

1. **Review Suggestion**: Read the AI-generated recommendation
2. **Quick Actions**: One-click buttons to implement suggestions
3. **Manual Override**: Dismiss suggestions or provide feedback
4. **Learning System**: AI improves based on your responses and actions

### How to Interact with Live WebSocket Status Updates

CyberBlueSOC uses WebSocket connections for real-time updates without page refreshes:

#### Real-time Tool Status

- **Live Indicators**: Tool status icons update instantly when tools start/stop
- **Health Changes**: Color-coded health status changes appear immediately
- **Alert Notifications**: New security alerts appear with sound/vibration alerts
- **Incident Updates**: Live updates to incident status and assignments

#### Interactive Features

**Toast Notifications:**
- **Alert Popups**: Instant notifications for critical events
- **Actionable Toasts**: Click to view details or take immediate action
- **Dismiss Options**: Clear notifications individually or in bulk

**Live Data Updates:**
- **Metrics Graphs**: Real-time updating charts and gauges
- **Log Streams**: Live tailing of system and security logs
- **Status Badges**: Dynamic badges showing current operational state

## Actionable Items

### Steps to Take When Receiving Alerts

CyberBlueSOC provides structured workflows for handling security alerts efficiently:

#### Example: Analyzing a Wazuh Security Alert

1. **Alert Reception**:
   - Alert appears in dashboard with red indicator
   - Click alert to open detailed view
   - Review alert metadata: timestamp, source, severity, description

2. **Initial Assessment**:
   - Check affected assets and potential impact
   - Review related logs in Wazuh dashboard
   - Use AI assistant: "Analyze this Wazuh alert for potential threats"

3. **Investigation**:
   - Open Wazuh interface directly from tool card
   - Correlate with other data sources (MISP, Arkime)
   - Check threat intelligence for known indicators

4. **Response Actions**:
   - **Create Case**: Click "Create Case" to open incident in TheHive
   - **Run Playbook**: Execute Shuffle playbook for automated response
   - **Block Indicators**: Use endpoint tools to quarantine affected systems
   - **Document Findings**: Add notes to incident case

5. **Resolution**:
   - Update incident status as findings are documented
   - Generate reports for stakeholders
   - Close incident when threat is contained

#### Taking Automated Actions in Shuffle

Shuffle playbooks automate complex security workflows:

**IOC Enrichment Playbook:**
1. **Trigger**: Alert contains suspicious file hash or IP
2. **Automatic Steps**:
   - Query VirusTotal for reputation data
   - Check MISP for related indicators
   - Enrich with threat intelligence
   - Generate automated report

**Endpoint Blocking Workflow:**
1. **Trigger**: Malware detected on endpoint
2. **Automated Response**:
   - Isolate affected endpoint via FleetDM
   - Block malicious domains at network level
   - Update firewall rules automatically
   - Notify security team

**Manual Playbook Execution:**
1. **Access Shuffle**: Click tool card to open Shuffle interface
2. **Select Playbook**: Choose appropriate automated workflow
3. **Input Parameters**: Provide alert details and context
4. **Execute**: Run playbook with one click
5. **Monitor Progress**: Track execution in real-time

### How to Use the Export Report Feature

CyberBlueSOC provides comprehensive export capabilities for reporting and compliance:

#### Exporting Tool Data

1. **Navigate to Tools Section**: Access main dashboard or tools page
2. **Apply Filters**: Filter by status, category, health, or custom criteria
3. **Select Export Format**:
   - **CSV**: For spreadsheet analysis and reporting
   - **JSON**: For programmatic processing and API integration
4. **Choose Scope**:
   - **Visible Tools**: Currently displayed/filtered tools
   - **All Tools**: Complete inventory regardless of filters
5. **Click Export**: File downloads automatically
6. **Verify Download**: Check browser downloads folder

#### Export Options and Formats

**CSV Export Features:**
- **Columns**: Name, Status, Health, Category, Uptime, Last Restart
- **Custom Fields**: Additional metadata based on tool type
- **Timestamps**: Export date/time included
- **Filtering Preserved**: Exported data matches current view filters

**JSON Export Features:**
- **Structured Data**: Complete tool objects with all metadata
- **API Compatible**: Ready for integration with external systems
- **Bulk Processing**: Efficient for large datasets
- **Schema Versioning**: Consistent data structure across exports

#### Advanced Export Scenarios

**Compliance Reporting:**
- Export tool inventory for audit purposes
- Generate uptime reports for SLA tracking
- Document system changes for change management

**Integration with External Tools:**
- Feed tool status into monitoring systems
- Import into CMDB or asset management platforms
- Generate automated reports for stakeholders

### How to Interact with the Threat Intelligence Module

CyberBlueSOC integrates MISP and VirusTotal for comprehensive threat intelligence:

#### Using MISP (Malware Information Sharing Platform)

1. **Access MISP**: Click MISP tool card to open interface
2. **IOC Search**:
   - Search by hash, IP, domain, or URL
   - Browse shared threat intelligence feeds
   - View detailed IOC attributes and context

3. **Event Management**:
   - Create new threat events
   - Add IOCs to existing events
   - Share events with threat intelligence community

4. **Integration Features**:
   - **Auto-import**: IOCs automatically ingested into Shuffle playbooks
   - **Correlation Engine**: Link MISP IOCs with Wazuh alerts
   - **Enrichment**: Add context to security events

#### Using VirusTotal for IOC Enrichment

1. **Direct Integration**: Built into Shuffle playbooks and incident response
2. **Automated Queries**:
   - Hash reputation checking
   - URL/domain analysis
   - IP address intelligence

3. **Manual Investigation**:
   - Open VirusTotal interface from tool card
   - Paste suspicious indicators for analysis
   - Review detection ratios and community feedback

#### Integrated Threat Intelligence Workflow

1. **Alert Trigger**: Wazuh detects suspicious file or network activity
2. **Automatic Enrichment**:
   - Shuffle playbook queries VirusTotal and MISP
   - IOCs are correlated and enriched with context
   - Threat intelligence added to incident case

3. **Manual Intelligence Gathering**:
   - Analyst reviews enriched IOC details
   - Additional research conducted if needed
   - Findings documented in TheHive case

4. **Response Actions**:
   - Block malicious indicators at network/firewall level
   - Quarantine affected endpoints
   - Update security policies based on intelligence

## Conclusion

### Summary of Features

CyberBlueSOC provides a complete SOC platform that transforms complex security operations into streamlined, efficient workflows. Key capabilities include:

- **Unified Management**: Single dashboard for all SOC tools with real-time status monitoring
- **Automated Response**: AI-powered suggestions and Shuffle playbooks for rapid incident handling
- **Comprehensive Integration**: Built-in connections between Wazuh, MISP, TheHive, Shuffle, and other essential tools
- **Enterprise Security**: Keycloak authentication, HTTPS encryption, and complete audit logging
- **Operational Intelligence**: Live WebSocket updates and system health monitoring
- **Reporting & Compliance**: Flexible export options and comprehensive audit trails

### Next Steps for Users

**For New SOC Teams:**
1. **Complete Setup**: Follow the admin guide to configure all integrated tools
2. **User Training**: Review this guide and practice basic operations
3. **Playbook Development**: Customize Shuffle workflows for your environment
4. **Integration Testing**: Verify all tool connections and data flows

**For Experienced Teams:**
1. **Migration Planning**: Map existing workflows to CyberBlueSOC features
2. **Custom Integration**: Add proprietary tools using the API
3. **Advanced Automation**: Develop complex playbooks for unique threat scenarios
4. **Performance Tuning**: Optimize resource allocation based on usage patterns

**Advanced Exploration:**
- **API Integration**: Connect external systems using REST APIs
- **Custom Dashboards**: Build specialized monitoring views in Grafana
- **Threat Hunting**: Use Arkime and Zeek for advanced network analysis
- **Automation Development**: Create custom Shuffle playbooks for unique workflows

**Continuous Improvement:**
- **Feedback Loop**: Use the AI assistant to suggest platform improvements
- **Community Engagement**: Share playbooks and configurations with the security community
- **Skills Development**: Leverage built-in training scenarios and AI recommendations
- **Stay Updated**: Monitor release notes for new features and security updates

CyberBlueSOC empowers security teams to focus on what matters most - protecting their organizations from cyber threats. With its comprehensive feature set and extensible architecture, it serves as both a powerful operational platform and a foundation for advanced SOC capabilities.