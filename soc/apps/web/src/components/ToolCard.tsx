import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Square, RotateCcw, ExternalLink, Key, Info } from 'lucide-react';
import type { Tool } from '@/types/tool';

interface ToolCardProps {
  tool: Tool;
  isSelected: boolean;
  onSelect: () => void;
  onAction: (action: 'start' | 'stop' | 'restart') => void;
  onOpen: () => void;
  onCredentials: () => void;
  onInfo: () => void;
}

const getStatusColor = (status: Tool['status']) => {
  switch (status) {
    case 'running': return 'text-green-400 bg-green-900/30 dark:text-green-400 dark:bg-green-900/30';
    case 'stopped': return 'text-gray-400 bg-gray-900/30 dark:text-gray-400 dark:bg-gray-900/30';
    default: return 'text-gray-400 bg-gray-900/30 dark:text-gray-400 dark:bg-gray-900/30';
  }
};

const getHealthColor = (health: Tool['health']) => {
  switch (health) {
    case 'Optimal': return 'text-green-400 bg-green-900/30 dark:text-green-400 dark:bg-green-900/30';
    case 'Healthy': return 'text-blue-400 bg-blue-900/30 dark:text-blue-400 dark:bg-blue-900/30';
    case 'Degraded': return 'text-orange-400 bg-orange-900/30 dark:text-orange-400 dark:bg-orange-900/30';
    default: return 'text-gray-400 bg-gray-900/30 dark:text-gray-400 dark:bg-gray-900/30';
  }
};

const getCategoryColor = (category: Tool['category']) => {
  const colors: Record<Tool['category'], string> = {
    'DFIR': 'bg-red-900/30 text-red-300 dark:bg-red-900/30 dark:text-red-300',
    'SIEM': 'bg-blue-900/30 text-blue-300 dark:bg-blue-900/30 dark:text-blue-300',
    'SOAR': 'bg-purple-900/30 text-purple-300 dark:bg-purple-900/30 dark:text-purple-300',
    'Threat Intel': 'bg-yellow-900/30 text-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300',
    'Endpoint Management': 'bg-green-900/30 text-green-300 dark:bg-green-900/30 dark:text-green-300',
    'Network Analysis': 'bg-indigo-900/30 text-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-300',
    'Attack Simulation': 'bg-pink-900/30 text-pink-300 dark:bg-pink-900/30 dark:text-pink-300',
    'Intrusion Detection': 'bg-red-900/30 text-red-300 dark:bg-red-900/30 dark:text-red-300',
    'Utility': 'bg-gray-900/30 text-gray-300 dark:bg-gray-900/30 dark:text-gray-300'
  };
  return colors[category] || 'bg-gray-900/30 text-gray-300';
};

export const ToolCard: React.FC<ToolCardProps> = ({
  tool,
  isSelected,
  onSelect,
  onAction,
  onOpen,
  onCredentials,
  onInfo
}) => {
  return (
    <Card className={`cursor-pointer transition-all hover:shadow-lg rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-slate-600 ${
      isSelected ? 'ring-2 ring-blue-500' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelect}
              aria-label={`Select ${tool.name}`}
              tabIndex={0}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect();
                }
              }}
            />
            <div className="text-2xl">🔧</div>
            <div>
              <h3 className="font-semibold text-lg">{tool.name}</h3>
              <Badge variant="secondary" className={`text-xs ${getCategoryColor(tool.category)}`}>
                {tool.category}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">{tool.description}</p>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Status:</span>
          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(tool.status)}`}>
            {tool.status.charAt(0).toUpperCase() + tool.status.slice(1)}
          </span>
          <span className="text-sm text-gray-500">Health:</span>
          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getHealthColor(tool.health)}`}>
            {tool.health}
          </span>
        </div>
        {tool.uptimeMinutes && (
          <div className="text-sm text-gray-500">
            Up {Math.floor(tool.uptimeMinutes / 60)}h {tool.uptimeMinutes % 60}m
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant={tool.status === 'running' ? 'outline' : 'default'}
              onClick={() => onAction('start')}
              disabled={tool.status === 'running'}
              className="text-xs"
            >
              <Play className="h-3 w-3 mr-1" />
              Start
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAction('stop')}
              disabled={tool.status === 'stopped'}
              className="text-xs border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <Square className="h-3 w-3 mr-1" />
              Stop
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAction('restart')}
              className="text-xs border-yellow-300 text-yellow-700 hover:bg-yellow-50 dark:border-yellow-700 dark:text-yellow-400 dark:hover:bg-yellow-900/20"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Restart
            </Button>
          </div>
          <div className="flex space-x-1">
            <Button size="sm" variant="ghost" onClick={onOpen} className="p-1">
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={onCredentials} className="p-1">
              <Key className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={onInfo} className="p-1">
              <Info className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};