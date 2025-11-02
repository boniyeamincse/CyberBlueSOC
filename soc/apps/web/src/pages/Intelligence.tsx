import React, { useState } from 'react';
import { NavBar } from '../components/NavBar';
import { Sidebar } from '../components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RefreshCw, Search, ExternalLink, Shield, AlertTriangle } from 'lucide-react';

const Intelligence = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock threat intelligence data
  const threatFeeds = [
    {
      id: 'misp',
      name: 'MISP',
      description: 'Malware Information Sharing Platform',
      status: 'active',
      lastUpdated: '5 min ago',
      indicators: 1247,
      criticalThreats: 23
    },
    {
      id: 'abuseipdb',
      name: 'AbuseIPDB',
      description: 'IP Address Abuse Database',
      status: 'active',
      lastUpdated: '12 min ago',
      indicators: 5678,
      criticalThreats: 156
    },
    {
      id: 'virustotal',
      name: 'VirusTotal',
      description: 'File and URL Analysis Platform',
      status: 'active',
      lastUpdated: '8 min ago',
      indicators: 8923,
      criticalThreats: 89
    }
  ];

  const recentThreats = [
    {
      id: 1,
      type: 'malware',
      indicator: '192.168.1.100',
      source: 'AbuseIPDB',
      severity: 'high',
      description: 'Command & Control server detected'
    },
    {
      id: 2,
      type: 'phishing',
      indicator: 'malicious-domain.com',
      source: 'VirusTotal',
      severity: 'medium',
      description: 'Suspicious phishing site'
    },
    {
      id: 3,
      type: 'ransomware',
      indicator: 'trojan.exe',
      source: 'MISP',
      severity: 'critical',
      description: 'New ransomware variant detected'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-500' : 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <NavBar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-100 mb-2">Threat Intelligence</h1>
            <p className="text-slate-400">Monitor threat feeds and analyze indicators</p>
          </div>

          {/* Search and Controls */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search indicators, IPs, domains..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-700 text-slate-100"
                />
              </div>
            </div>
            <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Feeds
            </Button>
          </div>

          {/* Threat Feed Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {threatFeeds.map((feed) => (
              <Card key={feed.id} className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-200">{feed.name}</CardTitle>
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(feed.status)}`} />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-slate-400 mb-3">{feed.description}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500">Indicators:</span>
                      <span className="text-slate-100 ml-1">{feed.indicators.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Critical:</span>
                      <span className="text-red-400 ml-1">{feed.criticalThreats}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Updated {feed.lastUpdated}</p>
                  <Button size="sm" variant="ghost" className="mt-2 p-0 h-auto text-slate-400 hover:text-slate-200">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View Feed
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Threats */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Recent Threat Indicators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentThreats.map((threat) => (
                  <div key={threat.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${getSeverityColor(threat.severity)}`} />
                      <div>
                        <div className="flex items-center space-x-2">
                          <code className="text-slate-100 font-mono text-sm bg-slate-600 px-2 py-1 rounded">
                            {threat.indicator}
                          </code>
                          <Badge variant="outline" className="text-xs capitalize">
                            {threat.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-400 mt-1">{threat.description}</p>
                        <p className="text-xs text-slate-500">Source: {threat.source}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-600">
                        Investigate
                      </Button>
                      <Button size="sm" variant="ghost" className="text-slate-400 hover:text-slate-200">
                        <AlertTriangle className="h-4 w-4" />
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

export default Intelligence;