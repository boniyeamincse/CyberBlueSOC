import React, { useState } from 'react';
import { NavBar } from '../components/NavBar';
import { Sidebar } from '../components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Monitor, Shield, AlertTriangle, Search, Filter, RefreshCw, Wifi, WifiOff } from 'lucide-react';

const Endpoints = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [osFilter, setOsFilter] = useState('all');

  // Mock endpoint data (FleetDM/Osquery style)
  const endpoints = [
    {
      id: 'endpoint-001',
      hostname: 'workstation-12',
      ip: '192.168.1.12',
      os: 'Windows 11',
      status: 'online',
      lastSeen: '2 min ago',
      agentVersion: '1.8.2',
      vulnerabilities: 3,
      alerts: 1,
      cpu: 45,
      memory: 67
    },
    {
      id: 'endpoint-002',
      hostname: 'server-prod-01',
      ip: '192.168.1.20',
      os: 'Ubuntu 22.04',
      status: 'online',
      lastSeen: '1 min ago',
      agentVersion: '1.8.2',
      vulnerabilities: 0,
      alerts: 0,
      cpu: 23,
      memory: 45
    },
    {
      id: 'endpoint-003',
      hostname: 'laptop-marketing-05',
      ip: '192.168.1.35',
      os: 'macOS 13.2',
      status: 'offline',
      lastSeen: '2 hours ago',
      agentVersion: '1.8.1',
      vulnerabilities: 7,
      alerts: 2,
      cpu: 0,
      memory: 0
    },
    {
      id: 'endpoint-004',
      hostname: 'workstation-dev-08',
      ip: '192.168.1.48',
      os: 'Windows 10',
      status: 'online',
      lastSeen: '30 sec ago',
      agentVersion: '1.8.2',
      vulnerabilities: 1,
      alerts: 0,
      cpu: 78,
      memory: 82
    }
  ];

  const getStatusColor = (status: string) => {
    return status === 'online' ? 'bg-green-500' : 'bg-red-500';
  };

  const getSeverityColor = (count: number) => {
    if (count === 0) return 'text-green-400';
    if (count <= 2) return 'text-yellow-400';
    return 'text-red-400';
  };

  const filteredEndpoints = endpoints.filter(endpoint => {
    const matchesSearch = endpoint.hostname.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         endpoint.ip.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || endpoint.status === statusFilter;
    const matchesOs = osFilter === 'all' || endpoint.os.toLowerCase().includes(osFilter.toLowerCase());
    return matchesSearch && matchesStatus && matchesOs;
  });

  return (
    <div className="min-h-screen bg-slate-900">
      <NavBar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h1 className="text-3xl font-bold text-slate-100">Endpoint Management</h1>
              <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
            <p className="text-slate-400">Monitor and manage connected endpoints via FleetDM and Osquery</p>
          </div>

          {/* Endpoint Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">Total Endpoints</CardTitle>
                <Monitor className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-100">{endpoints.length}</div>
                <p className="text-xs text-slate-400">Managed devices</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">Online</CardTitle>
                <Wifi className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">
                  {endpoints.filter(e => e.status === 'online').length}
                </div>
                <p className="text-xs text-slate-400">Active connections</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">Vulnerabilities</CardTitle>
                <Shield className="h-4 w-4 text-red-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-400">
                  {endpoints.reduce((sum, e) => sum + e.vulnerabilities, 0)}
                </div>
                <p className="text-xs text-slate-400">Total across endpoints</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">Active Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-400">
                  {endpoints.reduce((sum, e) => sum + e.alerts, 0)}
                </div>
                <p className="text-xs text-slate-400">Require attention</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search endpoints by hostname or IP..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-700 text-slate-100"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-slate-100">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
            <Select value={osFilter} onValueChange={setOsFilter}>
              <SelectTrigger className="w-44 bg-slate-800 border-slate-700 text-slate-100">
                <SelectValue placeholder="OS" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All OS</SelectItem>
                <SelectItem value="windows">Windows</SelectItem>
                <SelectItem value="ubuntu">Ubuntu</SelectItem>
                <SelectItem value="macos">macOS</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Endpoints Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredEndpoints.map((endpoint) => (
              <Card key={endpoint.id} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(endpoint.status)}`} />
                      <div>
                        <CardTitle className="text-lg text-slate-100">{endpoint.hostname}</CardTitle>
                        <p className="text-sm text-slate-400">{endpoint.ip}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
                      {endpoint.os}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500">Status:</span>
                        <span className={`ml-2 capitalize ${endpoint.status === 'online' ? 'text-green-400' : 'text-red-400'}`}>
                          {endpoint.status}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Agent:</span>
                        <span className="ml-2 text-slate-100">{endpoint.agentVersion}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Last Seen:</span>
                        <span className="ml-2 text-slate-100">{endpoint.lastSeen}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Vulnerabilities:</span>
                        <span className={`ml-2 ${getSeverityColor(endpoint.vulnerabilities)}`}>
                          {endpoint.vulnerabilities}
                        </span>
                      </div>
                    </div>

                    {endpoint.status === 'online' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-500">CPU</span>
                            <span className="text-slate-100">{endpoint.cpu}%</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${endpoint.cpu}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-500">Memory</span>
                            <span className="text-slate-100">{endpoint.memory}%</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                endpoint.memory > 80 ? 'bg-red-600' : endpoint.memory > 60 ? 'bg-yellow-600' : 'bg-green-600'
                              }`}
                              style={{ width: `${endpoint.memory}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-2 pt-2">
                      <Button size="sm" variant="outline" className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700">
                        View Details
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700">
                        Run Query
                      </Button>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        Isolate
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Endpoints;