import React, { useState } from 'react';
import { NavBar } from '../components/NavBar';
import { Sidebar } from '../components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Square, Zap, Settings, Plus, Eye, Edit, Trash2 } from 'lucide-react';

const Automation = () => {
  const [selectedPlaybook, setSelectedPlaybook] = useState<string | null>(null);

  // Mock playbooks data
  const playbooks = [
    {
      id: 'pb-001',
      name: 'Ransomware Response',
      description: 'Automated response to ransomware detection with isolation and alerting',
      status: 'active',
      executions: 15,
      lastRun: '2 hours ago',
      successRate: 92,
      triggers: ['malware-detection', 'file-encryption']
    },
    {
      id: 'pb-002',
      name: 'Brute Force Mitigation',
      description: 'Blocks suspicious IPs and alerts security team on failed login attempts',
      status: 'active',
      executions: 8,
      lastRun: '30 min ago',
      successRate: 100,
      triggers: ['failed-login', 'suspicious-ip']
    },
    {
      id: 'pb-003',
      name: 'Data Exfiltration Alert',
      description: 'Monitors and alerts on unusual data transfer patterns',
      status: 'inactive',
      executions: 3,
      lastRun: '1 day ago',
      successRate: 85,
      triggers: ['large-file-transfer', 'unusual-traffic']
    }
  ];

  const executionHistory = [
    {
      id: 'exec-001',
      playbookId: 'pb-001',
      playbookName: 'Ransomware Response',
      status: 'success',
      triggeredBy: 'Wazuh Alert',
      executedAt: '2 hours ago',
      duration: '45s'
    },
    {
      id: 'exec-002',
      playbookId: 'pb-002',
      playbookName: 'Brute Force Mitigation',
      status: 'success',
      triggeredBy: 'Failed Login Alert',
      executedAt: '30 min ago',
      duration: '12s'
    },
    {
      id: 'exec-003',
      playbookId: 'pb-001',
      playbookName: 'Ransomware Response',
      status: 'failed',
      triggeredBy: 'Malware Detection',
      executedAt: '5 hours ago',
      duration: '28s'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'success': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'running': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <NavBar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h1 className="text-3xl font-bold text-slate-100">Automation & SOAR</h1>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                New Playbook
              </Button>
            </div>
            <p className="text-slate-400">Manage security automation workflows and incident response playbooks</p>
          </div>

          {/* Automation Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">Active Playbooks</CardTitle>
                <Zap className="h-4 w-4 text-yellow-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-100">
                  {playbooks.filter(p => p.status === 'active').length}
                </div>
                <p className="text-xs text-slate-400">Running automations</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">Total Executions</CardTitle>
                <Play className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-100">
                  {playbooks.reduce((sum, p) => sum + p.executions, 0)}
                </div>
                <p className="text-xs text-slate-400">This month</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">Success Rate</CardTitle>
                <Settings className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">94%</div>
                <p className="text-xs text-slate-400">Average success rate</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">Failed Executions</CardTitle>
                <Square className="h-4 w-4 text-red-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-400">
                  {executionHistory.filter(e => e.status === 'failed').length}
                </div>
                <p className="text-xs text-slate-400">Last 24 hours</p>
              </CardContent>
            </Card>
          </div>

          {/* Playbooks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {playbooks.map((playbook) => (
              <Card key={playbook.id} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-slate-100">{playbook.name}</CardTitle>
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(playbook.status)}`} />
                  </div>
                  <p className="text-sm text-slate-400">{playbook.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Executions:</span>
                      <span className="text-slate-100">{playbook.executions}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Success Rate:</span>
                      <span className="text-green-400">{playbook.successRate}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Last Run:</span>
                      <span className="text-slate-100">{playbook.lastRun}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {playbook.triggers.map((trigger, index) => (
                        <Badge key={index} variant="outline" className="text-xs border-slate-600 text-slate-300">
                          {trigger}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <Button size="sm" variant="outline" className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="ghost" className="text-slate-400 hover:text-slate-200">
                        <Play className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Executions */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100">Recent Executions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {executionHistory.map((execution) => (
                  <div key={execution.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        execution.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <h4 className="text-slate-100 font-medium">{execution.playbookName}</h4>
                        <p className="text-sm text-slate-400">Triggered by: {execution.triggeredBy}</p>
                        <p className="text-xs text-slate-500">{execution.executedAt} • Duration: {execution.duration}</p>
                      </div>
                    </div>
                    <Badge className={`text-xs ${getStatusColor(execution.status)}`}>
                      {execution.status.toUpperCase()}
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

export default Automation;