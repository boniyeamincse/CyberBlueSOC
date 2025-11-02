import React, { useState } from 'react';
import { NavBar } from '../components/NavBar';
import { Sidebar } from '../components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, AlertTriangle, Clock, User, Search, Filter, Plus } from 'lucide-react';

const Incidents = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  // Mock incident data
  const incidents = [
    {
      id: 'INC-2024-001',
      title: 'Suspicious Login Attempts Detected',
      severity: 'high',
      status: 'investigating',
      assignee: 'John Doe',
      created: '2 hours ago',
      description: 'Multiple failed login attempts from unknown IP addresses',
      alerts: 15,
      category: 'Authentication'
    },
    {
      id: 'INC-2024-002',
      title: 'Malware Signature Match',
      severity: 'critical',
      status: 'contained',
      assignee: 'Jane Smith',
      created: '4 hours ago',
      description: 'Ransomware signature detected on endpoint workstation-12',
      alerts: 3,
      category: 'Malware'
    },
    {
      id: 'INC-2024-003',
      title: 'Unusual Network Traffic',
      severity: 'medium',
      status: 'closed',
      assignee: 'Mike Johnson',
      created: '1 day ago',
      description: 'Elevated outbound traffic to suspicious domains',
      alerts: 8,
      category: 'Network'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-red-100';
      case 'high': return 'bg-orange-500 text-orange-100';
      case 'medium': return 'bg-yellow-500 text-yellow-100';
      case 'low': return 'bg-blue-500 text-blue-100';
      default: return 'bg-gray-500 text-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'investigating': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'contained': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'closed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         incident.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || incident.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || incident.severity === severityFilter;
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  return (
    <div className="min-h-screen bg-slate-900">
      <NavBar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h1 className="text-3xl font-bold text-slate-100">Incident Response</h1>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                New Incident
              </Button>
            </div>
            <p className="text-slate-400">Manage security incidents and investigate threats</p>
          </div>

          {/* Filters and Search */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search incidents..."
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
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="contained">Contained</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-slate-100">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Incident Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">Total Incidents</CardTitle>
                <FileText className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-100">{filteredIncidents.length}</div>
                <p className="text-xs text-slate-400">This month</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">Critical</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-400">
                  {filteredIncidents.filter(i => i.severity === 'critical').length}
                </div>
                <p className="text-xs text-slate-400">Requires immediate action</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">Investigating</CardTitle>
                <Clock className="h-4 w-4 text-yellow-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-400">
                  {filteredIncidents.filter(i => i.status === 'investigating').length}
                </div>
                <p className="text-xs text-slate-400">Active investigations</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">Avg Resolution</CardTitle>
                <User className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">4.2h</div>
                <p className="text-xs text-slate-400">Time to resolve</p>
              </CardContent>
            </Card>
          </div>

          {/* Incidents List */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100">Security Incidents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredIncidents.map((incident) => (
                  <div key={incident.id} className="p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <code className="text-slate-100 font-mono text-sm bg-slate-600 px-2 py-1 rounded">
                          {incident.id}
                        </code>
                        <Badge className={`text-xs ${getSeverityColor(incident.severity)}`}>
                          {incident.severity.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${getStatusColor(incident.status)}`}>
                          {incident.status}
                        </Badge>
                      </div>
                      <span className="text-xs text-slate-400">{incident.created}</span>
                    </div>

                    <h3 className="text-lg font-medium text-slate-100 mb-2">{incident.title}</h3>
                    <p className="text-sm text-slate-400 mb-3">{incident.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-slate-400">
                        <span>Assignee: {incident.assignee}</span>
                        <span>Alerts: {incident.alerts}</span>
                        <span>Category: {incident.category}</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-600">
                          View Details
                        </Button>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          Update Status
                        </Button>
                      </div>
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

export default Incidents;