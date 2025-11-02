import React, { useState } from 'react';
import { NavBar } from '../components/NavBar';
import { Sidebar } from '../components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, Zap, Eye, Search, Filter, Play, Square, Monitor, Wifi, Shield } from 'lucide-react';

const Network = () => {
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock network sessions (Arkime/Suricata style)
  const networkSessions = [
    {
      id: 'session-001',
      srcIp: '192.168.1.100',
      dstIp: '8.8.8.8',
      srcPort: 54321,
      dstPort: 53,
      protocol: 'UDP',
      bytes: 1250,
      packets: 2,
      startTime: '2 min ago',
      duration: '1s',
      alerts: 1,
      category: 'DNS Query'
    },
    {
      id: 'session-002',
      srcIp: '10.0.0.15',
      dstIp: 'malicious-site.com',
      srcPort: 44321,
      dstPort: 443,
      protocol: 'TCP',
      bytes: 45670,
      packets: 45,
      startTime: '5 min ago',
      duration: '30s',
      alerts: 3,
      category: 'Suspicious HTTPS'
    },
    {
      id: 'session-003',
      srcIp: '192.168.1.50',
      dstIp: '192.168.1.1',
      srcPort: 56789,
      dstPort: 22,
      protocol: 'TCP',
      bytes: 8900,
      packets: 12,
      startTime: '1 min ago',
      duration: '15s',
      alerts: 0,
      category: 'SSH'
    }
  ];

  // Mock packet captures
  const packetCaptures = [
    {
      id: 'pcap-001',
      filename: 'suspicious-traffic-2024-11-02.pcap',
      size: '2.3 MB',
      packets: 15420,
      duration: '5 min',
      status: 'completed',
      alerts: 12
    },
    {
      id: 'pcap-002',
      filename: 'baseline-capture-2024-11-02.pcap',
      size: '45.8 MB',
      packets: 234560,
      duration: '1 hour',
      status: 'completed',
      alerts: 0
    }
  ];

  const getProtocolColor = (protocol: string) => {
    switch (protocol) {
      case 'TCP': return 'bg-blue-500';
      case 'UDP': return 'bg-green-500';
      case 'ICMP': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getAlertSeverity = (alerts: number) => {
    if (alerts === 0) return 'text-green-400';
    if (alerts <= 2) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <NavBar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-100 mb-2">Network Analysis</h1>
            <p className="text-slate-400">Monitor network traffic and analyze packets with Arkime and Wireshark integration</p>
          </div>

          {/* Network Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">Active Sessions</CardTitle>
                <Activity className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-100">{networkSessions.length}</div>
                <p className="text-xs text-slate-400">Current connections</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">Total Packets</CardTitle>
                <Wifi className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-100">
                  {networkSessions.reduce((sum, s) => sum + s.packets, 0)}
                </div>
                <p className="text-xs text-slate-400">Captured today</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">Data Transfer</CardTitle>
                <Zap className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-100">
                  {(networkSessions.reduce((sum, s) => sum + s.bytes, 0) / 1024 / 1024).toFixed(1)} MB
                </div>
                <p className="text-xs text-slate-400">Transferred today</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">Security Alerts</CardTitle>
                <Shield className="h-4 w-4 text-red-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-400">
                  {networkSessions.reduce((sum, s) => sum + s.alerts, 0)}
                </div>
                <p className="text-xs text-slate-400">Network alerts</p>
              </CardContent>
            </Card>
          </div>

          {/* Controls */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search sessions by IP, port, protocol..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-700 text-slate-100"
                />
              </div>
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-slate-100">
                <SelectValue placeholder="Protocol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Protocols</SelectItem>
                <SelectItem value="tcp">TCP</SelectItem>
                <SelectItem value="udp">UDP</SelectItem>
                <SelectItem value="icmp">ICMP</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Play className="h-4 w-4 mr-2" />
              Start Capture
            </Button>
          </div>

          {/* Network Sessions */}
          <Card className="bg-slate-800 border-slate-700 mb-8">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center">
                <Monitor className="mr-2 h-5 w-5" />
                Active Network Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {networkSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${getProtocolColor(session.protocol)}`} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <code className="text-slate-100 font-mono text-sm bg-slate-600 px-2 py-1 rounded">
                            {session.srcIp}:{session.srcPort}
                          </code>
                          <span className="text-slate-400">→</span>
                          <code className="text-slate-100 font-mono text-sm bg-slate-600 px-2 py-1 rounded">
                            {session.dstIp}:{session.dstPort}
                          </code>
                          <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
                            {session.protocol}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-slate-400">
                          <span>{session.packets} packets</span>
                          <span>{(session.bytes / 1024).toFixed(1)} KB</span>
                          <span>{session.duration}</span>
                          <span className={getAlertSeverity(session.alerts)}>
                            {session.alerts} alerts
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-600">
                        <Eye className="h-3 w-3 mr-1" />
                        Details
                      </Button>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        Block
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Packet Captures */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center">
                <Activity className="mr-2 h-5 w-5" />
                Packet Capture Files
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {packetCaptures.map((pcap) => (
                  <div key={pcap.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${pcap.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}`} />
                      <div>
                        <h4 className="text-slate-100 font-medium">{pcap.filename}</h4>
                        <div className="flex items-center space-x-4 text-xs text-slate-400 mt-1">
                          <span>{pcap.size}</span>
                          <span>{pcap.packets.toLocaleString()} packets</span>
                          <span>{pcap.duration}</span>
                          <span className={getAlertSeverity(pcap.alerts)}>
                            {pcap.alerts} alerts
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-600">
                        Open in Wireshark
                      </Button>
                      <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-600">
                        Analyze
                      </Button>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Network;