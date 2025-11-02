import React, { useState } from 'react';
import { NavBar } from '../components/NavBar';
import { Sidebar } from '../components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Square, Target, AlertTriangle, CheckCircle, Clock, Shield, Zap } from 'lucide-react';

const Simulation = () => {
  const [runningSimulation, setRunningSimulation] = useState<string | null>(null);

  // Mock attack simulation scenarios (Caldera-style)
  const simulationScenarios = [
    {
      id: 'scenario-001',
      name: 'Phishing Campaign Simulation',
      description: 'Simulate a targeted phishing campaign with credential harvesting',
      difficulty: 'medium',
      duration: '15 min',
      status: 'ready',
      objectives: ['Test user awareness', 'Validate email filters', 'Assess incident response'],
      lastRun: '3 days ago',
      successRate: 85
    },
    {
      id: 'scenario-002',
      name: 'Ransomware Attack Chain',
      description: 'Full ransomware simulation from initial access to data encryption',
      difficulty: 'hard',
      duration: '45 min',
      status: 'ready',
      objectives: ['Test backup systems', 'Validate EDR response', 'Assess recovery procedures'],
      lastRun: '1 week ago',
      successRate: 72
    },
    {
      id: 'scenario-003',
      name: 'Lateral Movement Test',
      description: 'Simulate attacker movement through network after initial compromise',
      difficulty: 'hard',
      duration: '30 min',
      status: 'ready',
      objectives: ['Test network segmentation', 'Validate access controls', 'Assess detection capabilities'],
      lastRun: '2 days ago',
      successRate: 68
    },
    {
      id: 'scenario-004',
      name: 'Insider Threat Scenario',
      description: 'Simulate malicious insider actions and data exfiltration',
      difficulty: 'medium',
      duration: '20 min',
      status: 'ready',
      objectives: ['Test DLP systems', 'Validate user monitoring', 'Assess incident detection'],
      lastRun: '5 days ago',
      successRate: 91
    }
  ];

  // Mock running simulations
  const activeSimulations = [
    {
      id: 'run-001',
      scenarioId: 'scenario-001',
      scenarioName: 'Phishing Campaign Simulation',
      status: 'running',
      progress: 65,
      startTime: '10 min ago',
      estimatedEnd: '5 min remaining'
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500 text-green-100';
      case 'medium': return 'bg-yellow-500 text-yellow-100';
      case 'hard': return 'bg-red-500 text-red-100';
      default: return 'bg-gray-500 text-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'ready': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const handleStartSimulation = (scenarioId: string) => {
    setRunningSimulation(scenarioId);
    // TODO: Implement simulation start logic
  };

  const handleStopSimulation = (scenarioId: string) => {
    setRunningSimulation(null);
    // TODO: Implement simulation stop logic
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <NavBar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-100 mb-2">Attack Simulation</h1>
            <p className="text-slate-400">Run controlled attack simulations with Caldera red-team modules</p>
          </div>

          {/* Simulation Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">Total Scenarios</CardTitle>
                <Target className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-100">{simulationScenarios.length}</div>
                <p className="text-xs text-slate-400">Available simulations</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">Active Runs</CardTitle>
                <Play className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">{activeSimulations.length}</div>
                <p className="text-xs text-slate-400">Currently running</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">Success Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">79%</div>
                <p className="text-xs text-slate-400">Average detection rate</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">Alert Triggers</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-400">127</div>
                <p className="text-xs text-slate-400">Generated this month</p>
              </CardContent>
            </Card>
          </div>

          {/* Active Simulations */}
          {activeSimulations.length > 0 && (
            <Card className="bg-slate-800 border-slate-700 mb-8">
              <CardHeader>
                <CardTitle className="text-slate-100 flex items-center">
                  <Zap className="mr-2 h-5 w-5" />
                  Active Simulations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeSimulations.map((sim) => (
                    <div key={sim.id} className="p-4 bg-slate-700 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                          <div>
                            <h4 className="text-slate-100 font-medium">{sim.scenarioName}</h4>
                            <p className="text-sm text-slate-400">Started {sim.startTime}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleStopSimulation(sim.scenarioId)}
                        >
                          <Square className="h-3 w-3 mr-1" />
                          Stop
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Progress</span>
                          <span className="text-slate-100">{sim.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-600 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${sim.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-slate-400">{sim.estimatedEnd}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Available Scenarios */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Available Scenarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {simulationScenarios.map((scenario) => (
                  <div key={scenario.id} className="p-6 bg-slate-700 rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium text-slate-100">{scenario.name}</h3>
                          <Badge className={`text-xs ${getDifficultyColor(scenario.difficulty)}`}>
                            {scenario.difficulty.toUpperCase()}
                          </Badge>
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(scenario.status)}`} />
                        </div>
                        <p className="text-slate-400 mb-3">{scenario.description}</p>
                        <div className="flex items-center space-x-6 text-sm text-slate-400">
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {scenario.duration}
                          </span>
                          <span>Last run: {scenario.lastRun}</span>
                          <span>Success rate: {scenario.successRate}%</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-slate-600 text-slate-300 hover:bg-slate-600"
                        >
                          Configure
                        </Button>
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={() => handleStartSimulation(scenario.id)}
                          disabled={runningSimulation !== null}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Run Simulation
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-slate-200">Objectives:</h4>
                      <div className="flex flex-wrap gap-2">
                        {scenario.objectives.map((objective, index) => (
                          <Badge key={index} variant="outline" className="text-xs border-slate-600 text-slate-300">
                            {objective}
                          </Badge>
                        ))}
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

export default Simulation;