# CyberBlue SOC User Guide

## Overview

CyberBlue is a modern Security Operations Center (SOC) platform that provides a unified dashboard for managing cybersecurity tools and monitoring security operations.

## Getting Started

### Login Process

1. **Access the Dashboard**: Navigate to `https://soc.local/`
2. **Authentication**: Click "Login" to be redirected to Keycloak
3. **Credentials**: Use your assigned SOC credentials
4. **Dashboard**: Access granted based on your role permissions

### User Roles

- **Analyst**: View dashboards, triage alerts, run approved playbooks
- **Manager**: Read-only metrics, export reports, SLA tracking
- **Admin**: Full system access, tool lifecycle management

## Dashboard Navigation

### Main Dashboard

The main dashboard provides an overview of all SOC tools and their status:

- **Tool Cards**: Each tool shows status, health, and uptime
- **Bulk Actions**: Select multiple tools for batch operations
- **Filtering**: Filter by status (running/stopped) or category
- **Real-time Updates**: Live status updates via WebSocket

### Metrics Dashboard

Monitor system performance and security metrics:

- **System Health**: Overall platform status
- **Resource Usage**: CPU, memory, disk, and network metrics
- **Tool Status**: Running vs. stopped tools count
- **Active Incidents**: Current security incidents

### Audit Logs

Track all system activities:

- **Activity Timeline**: Chronological log of all actions
- **Filtering**: Search by user, action, or date range
- **Export**: Download logs in CSV format
- **Compliance**: Complete audit trail for regulatory requirements

### AI Assistant

Intelligent SOC assistance:

- **Natural Language Queries**: Ask questions about your SOC
- **Automated Suggestions**: AI-powered recommendations
- **Quick Actions**: One-click execution of common tasks

## Tool Management

### Viewing Tools

1. **Tool Grid**: Browse all configured SOC tools
2. **Status Indicators**:
   - 🟢 **Running**: Tool is operational
   - 🔴 **Stopped**: Tool is offline
   - 🟡 **Restarting**: Tool is being restarted

3. **Health Status**:
   - **Optimal**: Perfect operating condition
   - **Healthy**: Normal operation
   - **Degraded**: Performance issues
   - **Critical**: Immediate attention required

### Tool Actions

#### Individual Actions

- **Start**: Launch stopped tools
- **Stop**: Gracefully shut down running tools
- **Restart**: Restart tools with configuration reload

#### Bulk Actions

1. **Select Tools**: Check multiple tool cards
2. **Choose Action**: Start, stop, or restart selected tools
3. **Confirm**: Review and execute bulk operation

### Accessing Tools

- **Open**: Direct link to tool interface
- **Credentials**: View access credentials (admin only)
- **Info**: Detailed tool information and documentation

## Incident Management

### Creating Incidents

#### Manual Creation

1. **Click "Create Case"** on any tool card or from dashboard
2. **Fill Details**:
   - Title: Descriptive incident name
   - Description: Detailed incident information
   - Severity: Low, Medium, High, Critical
3. **Assign**: Assign to appropriate analyst
4. **Submit**: Create the incident case

#### Automated Creation

Incidents can be automatically created from:
- Wazuh security alerts
- AI assistant recommendations
- System health alerts

### Incident Lifecycle

1. **Open**: New incident created
2. **Investigating**: Analyst actively working
3. **Resolved**: Issue resolved, awaiting verification
4. **Closed**: Incident fully resolved

### Incident Actions

- **Update Status**: Change incident state
- **Add Comments**: Document investigation findings
- **Assign Users**: Reassign to different analysts
- **Export Reports**: Generate incident reports

## Reporting & Export

### Export Options

#### CSV Export

1. **Navigate**: Go to Tools or Incidents section
2. **Filter**: Apply desired filters
3. **Export**: Click CSV export button
4. **Download**: File downloads automatically

#### JSON Export

- **API Access**: Use REST API for programmatic export
- **Custom Queries**: Filter by status, category, date range
- **Integration**: Feed into external reporting systems

### Report Types

- **Tool Inventory**: Complete list of all SOC tools
- **Incident Reports**: Detailed incident documentation
- **Audit Logs**: Security and activity reports
- **Performance Metrics**: System usage statistics

## Security Features

### Authentication

- **Single Sign-On**: Keycloak-based authentication
- **Role-Based Access**: Permissions based on user roles
- **Session Management**: Automatic logout on inactivity

### Data Protection

- **HTTPS Only**: All communications encrypted
- **Rate Limiting**: Protection against abuse
- **Audit Logging**: Complete activity tracking

## Best Practices

### Daily Operations

1. **Morning Review**: Check dashboard for overnight alerts
2. **Tool Health**: Verify all critical tools are running
3. **Incident Triage**: Review and assign new incidents
4. **Metrics Review**: Monitor system performance

### Incident Response

1. **Immediate Assessment**: Evaluate alert severity
2. **Tool Verification**: Ensure response tools are available
3. **Incident Creation**: Document all security events
4. **Communication**: Keep stakeholders informed

### Maintenance

1. **Regular Backups**: Verify automated backups
2. **Log Rotation**: Monitor log file sizes
3. **Update Checks**: Review for security updates
4. **Performance Monitoring**: Track system resources

## Troubleshooting

### Common Issues

#### Cannot Access Dashboard

- Check network connectivity
- Verify DNS resolution (`soc.local`)
- Clear browser cache
- Contact administrator for credential issues

#### Tools Not Starting

- Check system resources (CPU, memory)
- Review tool logs
- Verify dependencies are running
- Contact system administrator

#### Export Fails

- Check file permissions
- Verify disk space
- Reduce filter scope for large datasets
- Try JSON export as alternative

### Getting Help

- **Documentation**: Check this user guide
- **AI Assistant**: Ask questions in the dashboard
- **Team Communication**: Use designated channels
- **Support Tickets**: Create incident for technical issues

## Keyboard Shortcuts

- `Ctrl/Cmd + K`: Focus search
- `Tab`: Navigate between elements
- `Enter`: Activate buttons
- `Escape`: Close modals
- `Ctrl/Cmd + R`: Refresh data

## Accessibility

CyberBlue is designed with accessibility in mind:

- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels
- **High Contrast**: Supports system accessibility settings
- **Responsive Design**: Works on all device sizes

## Feedback & Support

- **Feature Requests**: Use the AI assistant to suggest improvements
- **Bug Reports**: Create incidents for technical issues
- **Documentation Updates**: Suggest improvements to this guide