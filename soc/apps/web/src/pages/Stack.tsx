import React, { useState } from 'react';
import { NavBar } from '../components/NavBar';
import { Sidebar } from '../components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Server, Database, Shield, Globe, Play, Square, RotateCcw, Settings, Activity, Cpu, MemoryStick } from 'lucide-react';

const Stack = () => {
  const [selectedService, setSelectedService] = useState<string | null>(null);

  // Mock stack services data
  const stackServices = [
    {
      id: 'traefik',
      name: 'Traefik',
      type: 'Reverse Proxy',
      status: 'running',
      health: 'healthy',
      image: 'traefik:v2.5',
      ports: ['80:80', '8080:8080'],
      cpu: 2.3,
      memory: 45.2,
      uptime: '7d 4h 23m',
      dependencies: []
    },
    {
      id: 'postgres',
      name: 'PostgreSQL',
      type: 'Database',
      status: 'running',
      health: 'healthy',
      image: 'postgres:14',
      ports: [],
      cpu: 1.8,
      memory: 234.1,
      uptime: '7d 4h 20m',
      dependencies: []
    },
    {
      id: 'keycloak',
      name: 'Keycloak',
      type: 'Identity Management',
      status: 'running',
      health: 'healthy',
      image: 'quay.io/keycloak/keycloak:22.0',
      ports: ['8081:8080'],
      cpu: 8.7,
      memory: 678.4,
      uptime: '7d 4h 18m',
      dependencies: ['postgres']
    },
    {
      id: 'api',
      name: 'Backend API',
      type: 'Application',
      status: 'running',
      health: 'healthy',
      image: 'cyberblue-soc-api:latest',
      ports: [],
      cpu: 4.2,
      memory: 156.8,
      uptime: '7d 4h 15m',
      dependencies: ['postgres', 'keycloak']
    },
    {
      id: 'web',
      name: 'Frontend',
      type: 'Application',
      status: 'running',
      health: 'healthy',
      image: 'cyberblue-soc-web:latest',
      ports: [],
      cpu: 1.5,
      memory: 89.3,
      uptime: '7d 4h 10m',
      dependencies: []
    }
  ];

  // Mock stack metrics
  const stackMetrics = {
    totalServices: stackServices.length,
    runningServices: stackServices.filter(s => s.status === 'running').length,
    healthyServices: stackServices.filter(s => s.health === 'healthy').length,
    totalCpu: stackServices.reduce((sum, s) => sum + s.cpu, 0),
    totalMemory: stackServices.reduce((sum, s) => sum + s.memory, 0),
    networkTraffic: 2.4, // GB/day
    uptime: '7d 4h 23m'
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'stopped': return 'bg-red-500';
      case 'starting': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-400';
      case 'degraded': return 'text-yellow-400';
      case 'unhealthy': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Reverse Proxy': return <Globe className="h-4 w-4" />;
      case 'Database': return <Database className="h-4 w-4" />;
      case 'Identity Management': return <Shield className="h-4 w-4" />;
      case 'Application': return <Server className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const handleServiceAction = (serviceId: string, action: 'start' | 'stop' | 'restart') => {
    console.log(`${action} service:`, serviceId);
    // TODO: Implement service control logic
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <NavBar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h1 className="text-3xl font-bold text-slate-100">Stack Management</h1>
              <div className="flex space-x-2">
                <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Play className="h-4 w-4 mr-2" />
                  Deploy Stack
                </Button>
              </div>
            </div>
            <p className="text-slate-400">Monitor and manage your SOC infrastructure stack</p>
          </div>

          {/* Stack Overview Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">Total Services</CardTitle>
                <Server className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-100">{stackMetrics.totalServices}</div>
                <p className="text-xs text-slate-400">{stackMetrics.runningServices} running</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">Health Status</CardTitle>
                <Shield className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">{stackMetrics.healthyServices}</div>
                <p className="text-xs text-slate-400">Services healthy</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">Total CPU</CardTitle>
                <Cpu className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-100">{stackMetrics.totalCpu.toFixed(1)}%</div>
                <p className="text-xs text-slate-400">System load</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">Total Memory</CardTitle>
                <MemoryStick className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-100">{stackMetrics.totalMemory.toFixed(0)}MB</div>
                <p className="text-xs text-slate-400">Memory usage</p>
              </CardContent>
            </Card>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {stackServices.map((service) => (
              <Card key={service.id} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getTypeIcon(service.type)}
                      <div>
                        <CardTitle className="text-lg text-slate-100">{service.name}</CardTitle>
                        <p className="text-sm text-slate-400">{service.type}</p>
                      </div>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(service.status)}`} />
                  </div>
                  <div className="flex items-center space-x-4 mt-2">
                    <Badge variant="outline" className={`text-xs ${getHealthColor(service.health)} border-current`}>
                      {service.health}
                    </Badge>
                    <span className="text-xs text-slate-500">{service.uptime}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-xs text-slate-400">
                      <div>Image: {service.image}</div>
                      {service.ports.length > 0 && <div>Ports: {service.ports.join(', ')}</div>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-500">CPU</span>
                          <span className="text-slate-100">{service.cpu}%</span>
                        </div>
                        <Progress value={service.cpu} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-500">Memory</span>
                          <span className="text-slate-100">{service.memory}MB</span>
                        </div>
                        <Progress value={(service.memory / 1024) * 100} className="h-2" />
                      </div>
                    </div>

                    {service.dependencies.length > 0 && (
                      <div className="text-xs">
                        <span className="text-slate-500">Dependencies: </span>
                        <span className="text-slate-100">{service.dependencies.join(', ')}</span>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                        onClick={() => handleServiceAction(service.id, 'start')}
                        disabled={service.status === 'running'}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Start
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                        onClick={() => handleServiceAction(service.id, 'stop')}
                        disabled={service.status === 'stopped'}
                      >
                        <Square className="h-3 w-3 mr-1" />
                        Stop
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                        onClick={() => handleServiceAction(service.id, 'restart')}
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Restart
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

export default Stack;