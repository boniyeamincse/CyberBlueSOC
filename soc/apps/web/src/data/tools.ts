import type { Tool } from '@/types/tool';

export const seedTools: Tool[] = [
  {
    id: 'velociraptor',
    name: 'Velociraptor',
    category: 'DFIR',
    description: 'Digital Forensics and Incident Response platform for live endpoint forensics and threat hunting.',
    status: 'running',
    health: 'Optimal',
    uptimeMinutes: 1440,
    critical: false,
    tags: ['forensics', 'endpoint', 'threat-hunting']
  },
  {
    id: 'wazuh-dashboard',
    name: 'Wazuh Dashboard',
    category: 'SIEM',
    description: 'SIEM dashboard for log analysis, alerting, and security monitoring with Kibana-style interface.',
    status: 'running',
    health: 'Healthy',
    uptimeMinutes: 2880,
    critical: true,
    tags: ['logs', 'alerting', 'monitoring']
  },
  {
    id: 'shuffle',
    name: 'Shuffle',
    category: 'SOAR',
    description: 'Security automation and orchestration platform for building, testing, and deploying security workflows.',
    status: 'stopped',
    health: 'Degraded',
    uptimeMinutes: undefined,
    critical: false,
    tags: ['automation', 'workflows', 'orchestration']
  },
  {
    id: 'misp',
    name: 'MISP',
    category: 'Threat Intel',
    description: 'Threat Intelligence Platform for sharing, storing, and correlating IOCs.',
    status: 'running',
    health: 'Optimal',
    uptimeMinutes: 4320,
    critical: false,
    tags: ['intelligence', 'ioc', 'sharing']
  },
  {
    id: 'cyberchef',
    name: 'CyberChef',
    category: 'Utility',
    description: 'Swiss Army Knife for data analysis, encoding/decoding, and forensics operations.',
    status: 'running',
    health: 'Healthy',
    uptimeMinutes: 720,
    critical: false,
    tags: ['analysis', 'encoding', 'forensics']
  },
  {
    id: 'thehive',
    name: 'TheHive',
    category: 'SOAR',
    description: 'Incident response and case management.',
    status: 'running',
    health: 'Optimal',
    uptimeMinutes: 2160,
    critical: true,
    tags: ['incident-response', 'case-management']
  },
  {
    id: 'cortex',
    name: 'Cortex',
    category: 'SOAR',
    description: 'Automated threat analysis with analyzers for TheHive.',
    status: 'stopped',
    health: 'Healthy',
    uptimeMinutes: undefined,
    critical: false,
    tags: ['analysis', 'threat', 'analyzers']
  },
  {
    id: 'fleetdm',
    name: 'FleetDM',
    category: 'Endpoint Management',
    description: 'Osquery-based endpoint visibility and fleet management.',
    status: 'running',
    health: 'Healthy',
    uptimeMinutes: 1440,
    critical: false,
    tags: ['endpoint', 'osquery', 'fleet']
  },
  {
    id: 'arkime',
    name: 'Arkime',
    category: 'Network Analysis',
    description: 'Full packet capture and session engine.',
    status: 'running',
    health: 'Optimal',
    uptimeMinutes: 2880,
    critical: true,
    tags: ['packet-capture', 'network', 'sessions']
  },
  {
    id: 'caldera',
    name: 'Caldera',
    category: 'Attack Simulation',
    description: 'Automated adversary emulation platform.',
    status: 'stopped',
    health: 'Degraded',
    uptimeMinutes: undefined,
    critical: false,
    tags: ['adversary', 'simulation', 'emulation']
  },
  {
    id: 'evebox',
    name: 'Evebox',
    category: 'Intrusion Detection',
    description: 'Web viewer for Suricata EVE JSON logs and alerts.',
    status: 'running',
    health: 'Healthy',
    uptimeMinutes: 720,
    critical: false,
    tags: ['suricata', 'logs', 'alerts']
  },
  {
    id: 'wireshark',
    name: 'Wireshark',
    category: 'Network Analysis',
    description: 'Protocol analyzer for deep packet inspection and troubleshooting.',
    status: 'running',
    health: 'Optimal',
    uptimeMinutes: 360,
    critical: false,
    tags: ['protocol', 'packets', 'troubleshooting']
  }
];