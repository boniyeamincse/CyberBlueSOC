import React from 'react';
import { NavBar } from '../components/NavBar';
import { Sidebar } from '../components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, AlertTriangle, FileText, Users, Cpu, MemoryStick } from 'lucide-react';

const Overview = () => {
  // Mock data - would come from API in production
  const systemStats = {
    totalAlerts: 47,
    activeIncidents: 3,
    agentsOnline: 12,
    cpuUsage: 45,
    memoryUsage: 67,
    systemHealth: 'Good'
  };

  const recentAlerts = [
    { id: 1, severity: 'critical', message: 'Suspicious login attempt detected', time: '2 min ago' },
    { id: 2, severity: 'high', message: 'Malware signature detected', time: '15 min ago' },
    { id: 3, severity: 'medium', message: 'Unusual network traffic', time: '1 hour ago' },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <NavBar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-100 mb-2">SOC Overview Dashboard</h1>
            <p className="text-slate-400">Real-time system health and security metrics</p>
          </div>

          {/* System Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">Total Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-100">{systemStats.totalAlerts}</div>
                <p className="text-xs text-slate-400">Last 24 hours</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">Active Incidents</CardTitle>
                <FileText className="h-4 w-4 text-orange-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-100">{systemStats.activeIncidents}</div>
                <p className="text-xs text-slate-400">Requires attention</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">Agents Online</CardTitle>
                <Users className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-100">{systemStats.agentsOnline}</div>
                <p className="text-xs text-slate-400">Out of 15 total</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">CPU Usage</CardTitle>
                <Cpu className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-100">{systemStats.cpuUsage}%</div>
                <p className="text-xs text-slate-400">System load</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">Memory Usage</CardTitle>
                <MemoryStick className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-100">{systemStats.memoryUsage}%</div>
                <p className="text-xs text-slate-400">RAM utilization</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">System Health</CardTitle>
                <Activity className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-100">{systemStats.systemHealth}</div>
                <p className="text-xs text-slate-400">Overall status</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Alerts */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100">Recent Security Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getSeverityColor(alert.severity)}`} />
                      <div>
                        <p className="text-slate-100 font-medium">{alert.message}</p>
                        <p className="text-slate-400 text-sm">{alert.time}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs capitalize">
                      {alert.severity}
                    </Badge>
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

export default Overview;