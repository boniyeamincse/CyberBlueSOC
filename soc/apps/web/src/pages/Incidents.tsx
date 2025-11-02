import React, { useState, useEffect } from 'react';
import { NavBar } from '../components/NavBar';
import { Sidebar } from '../components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, AlertTriangle, Clock, User, Search, Filter, Plus, Bot, Zap, TrendingUp } from 'lucide-react';

const Incidents = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch incidents from API
    const fetchIncidents = async () => {
      try {
        const response = await fetch('/api/incidents');
        if (response.ok) {
          const data = await response.json();
          setIncidents(data);
        }
      } catch (error) {
        console.error('Failed to fetch incidents:', error);
        // Fallback to mock data if API fails
        setIncidents([
          {
            id: 1,
            title: 'Suspicious Login Attempts Detected',
            severity: 'high',
            status: 'investigating',
            assigned_to: 'John Doe',
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            description: 'Multiple failed login attempts from unknown IP addresses',
            tags: 'alerts:15,category:Authentication',
            ai_analysis: {
              predicted_type: 'intrusion',
              confidence: 0.85,
              risk_score: 78,
              recommended_actions: ['Review access logs', 'Implement MFA', 'Monitor suspicious IPs']
            },
            automated_actions: [
              'Enhanced monitoring enabled',
              'MFA verification initiated'
            ]
          },
          {
            id: 2,
            title: 'Malware Signature Match',
            severity: 'critical',
            status: 'contained',
            assigned_to: 'Jane Smith',
            created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            description: 'Ransomware signature detected on endpoint workstation-12',
            tags: 'alerts:3,category:Malware',
            ai_analysis: {
              predicted_type: 'malware',
              confidence: 0.92,
              risk_score: 95,
              recommended_actions: ['Isolate affected systems', 'Block malicious hashes', 'Update signatures']
            },
            automated_actions: [
              'System isolation initiated',
              'Malware signatures blocked',
              'Endpoint protection updated'
            ]
          },
          {
            id: 3,
            title: 'Unusual Network Traffic',
            severity: 'medium',
            status: 'closed',
            assigned_to: 'Mike Johnson',
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            description: 'Elevated outbound traffic to suspicious domains',
            tags: 'alerts:8,category:Network',
            ai_analysis: {
              predicted_type: 'data_leak',
              confidence: 0.67,
              risk_score: 62,
              recommended_actions: ['Review data flows', 'Implement traffic filtering']
            },
            automated_actions: [
              'Traffic monitoring increased',
              'Suspicious domains blocked'
            ]
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchIncidents();
  }, []);

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
                          (typeof incident.id === 'string' ? incident.id.toLowerCase().includes(searchQuery.toLowerCase()) : incident.id.toString().includes(searchQuery));
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
                <CardTitle className="text-sm font-medium text-slate-200">AI Assisted</CardTitle>
                <Bot className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-400">
                  {filteredIncidents.filter(i => i.ai_analysis).length}
                </div>
                <p className="text-xs text-slate-400">AI-powered analysis</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">Auto Response</CardTitle>
                <Zap className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">
                  {filteredIncidents.filter(i => i.automated_actions && i.automated_actions.length > 0).length}
                </div>
                <p className="text-xs text-slate-400">Automated responses triggered</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">High Risk</CardTitle>
                <TrendingUp className="h-4 w-4 text-red-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-400">
                  {filteredIncidents.filter(i => i.ai_analysis && i.ai_analysis.risk_score > 70).length}
                </div>
                <p className="text-xs text-slate-400">Risk score > 70</p>
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

                    {/* AI Analysis Section */}
                    {incident.ai_analysis && (
                      <div className="mb-3 p-3 bg-slate-600 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Bot className="h-4 w-4 text-blue-400" />
                          <span className="text-sm font-medium text-blue-400">AI Analysis</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-slate-300">Predicted Type:</span>
                            <Badge className="ml-1 text-xs bg-blue-600 text-blue-100">
                              {incident.ai_analysis.predicted_type}
                            </Badge>
                          </div>
                          <div>
                            <span className="text-slate-300">Confidence:</span>
                            <span className="text-green-400 ml-1">
                              {(incident.ai_analysis.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-slate-300">Risk Score:</span>
                            <span className={`ml-1 font-medium ${
                              incident.ai_analysis.risk_score > 70 ? 'text-red-400' :
                              incident.ai_analysis.risk_score > 40 ? 'text-yellow-400' : 'text-green-400'
                            }`}>
                              {incident.ai_analysis.risk_score}/100
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Automated Actions Section */}
                    {incident.automated_actions && incident.automated_actions.length > 0 && (
                      <div className="mb-3 p-3 bg-slate-600 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Zap className="h-4 w-4 text-green-400" />
                          <span className="text-sm font-medium text-green-400">Automated Responses</span>
                        </div>
                        <ul className="text-xs text-slate-300 space-y-1">
                          {incident.automated_actions.slice(0, 3).map((action, idx) => (
                            <li key={idx} className="flex items-center space-x-2">
                              <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                              <span>{action}</span>
                            </li>
                          ))}
                          {incident.automated_actions.length > 3 && (
                            <li className="text-slate-400">
                              +{incident.automated_actions.length - 3} more actions
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-slate-400">
                        <span>Assignee: {incident.assigned_to || 'Unassigned'}</span>
                        <span>Tags: {incident.tags || 'None'}</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-600">
                          View Details
                        </Button>
                        <Button size="sm" variant="outline" className="border-blue-600 text-blue-300 hover:bg-blue-600">
                          AI Analysis
                        </Button>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          Run Playbook
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