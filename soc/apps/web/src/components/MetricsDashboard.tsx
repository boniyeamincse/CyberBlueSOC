import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, AlertTriangle, CheckCircle, Activity } from 'lucide-react';

interface MetricData {
  timestamp: string;
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_rx: number;
  network_tx: number;
  active_connections: number;
  alerts_count: number;
  incidents_count: number;
}

interface SystemMetrics {
  tools_status: { [key: string]: string };
  system_health: {
    overall: 'healthy' | 'warning' | 'critical';
    uptime: string;
    last_backup: string;
  };
  recent_metrics: MetricData[];
}

export const MetricsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/metrics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-500';
      case 'stopped':
        return 'bg-red-500';
      case 'restarting':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'stopped':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'restarting':
        return <Activity className="h-4 w-4 text-yellow-600" />;
      default:
        return <RefreshCw className="h-4 w-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">Failed to load metrics</p>
        <Button onClick={fetchMetrics} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  const latestMetrics = metrics.recent_metrics[metrics.recent_metrics.length - 1];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">System Metrics</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Last updated: {lastUpdated?.toLocaleString()}
          </p>
        </div>
        <Button onClick={fetchMetrics}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{metrics.system_health.overall}</div>
            <p className="text-xs text-muted-foreground">
              Uptime: {metrics.system_health.uptime}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tools</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(metrics.tools_status).filter(status => status === 'running').length}
              <span className="text-sm text-muted-foreground"> / {Object.keys(metrics.tools_status).length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.incidents_count}</div>
            <p className="text-xs text-muted-foreground">
              {latestMetrics?.alerts_count || 0} alerts today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      {latestMetrics && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Real-time system resource usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{latestMetrics.cpu_usage}%</div>
                <p className="text-sm text-muted-foreground">CPU Usage</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{latestMetrics.memory_usage}%</div>
                <p className="text-sm text-muted-foreground">Memory Usage</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{latestMetrics.disk_usage}%</div>
                <p className="text-sm text-muted-foreground">Disk Usage</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{latestMetrics.active_connections}</div>
                <p className="text-sm text-muted-foreground">Active Connections</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tool Status Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Tool Status</CardTitle>
          <CardDescription>Current status of all SOC tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(metrics.tools_status).map(([toolName, status]) => (
              <div key={toolName} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-2">
                  {getHealthIcon(status)}
                  <span className="text-sm font-medium">{toolName}</span>
                </div>
                <Badge className={getHealthColor(status)}>
                  {status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};