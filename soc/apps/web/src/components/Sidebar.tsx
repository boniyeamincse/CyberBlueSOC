import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Zap, AlertTriangle } from 'lucide-react';

interface Suggestion {
  id: string;
  title: string;
  description: string;
  toolId: string;
  priority: 'high' | 'medium' | 'low';
}

const mockSuggestions: Suggestion[] = [
  {
    id: '1',
    title: 'Start Wazuh Dashboard',
    description: 'Critical SIEM tool is stopped',
    toolId: 'wazuh-dashboard',
    priority: 'high'
  },
  {
    id: '2',
    title: 'Review Degraded Tools',
    description: 'Shuffle and Caldera need attention',
    toolId: 'shuffle',
    priority: 'medium'
  },
  {
    id: '3',
    title: 'Optimize FleetDM',
    description: 'Endpoint management tool running optimally',
    toolId: 'fleetdm',
    priority: 'low'
  }
];

const getPriorityColor = (priority: Suggestion['priority']) => {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
  }
};

export const Sidebar = () => {
  return (
    <div className="w-80 bg-slate-800 dark:bg-slate-800 border-r border-slate-700 dark:border-slate-700 p-6">
      {/* System Status */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Activity className="mr-2 h-5 w-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Containers:</span>
            <span className="font-semibold">8 / 12</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Health:</span>
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
              Excellent
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">CPU:</span>
            <span className="font-semibold">45%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Memory:</span>
            <span className="font-semibold">67%</span>
          </div>
        </CardContent>
      </Card>

      {/* Smart Suggestions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Zap className="mr-2 h-5 w-5" />
            Smart Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockSuggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="p-3 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between mb-1">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {suggestion.title}
                  </h4>
                  <Badge
                    variant="secondary"
                    className={`text-xs ${getPriorityColor(suggestion.priority)}`}
                  >
                    {suggestion.priority}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {suggestion.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};