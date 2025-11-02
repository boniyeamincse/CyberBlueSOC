export interface Tool {
  id: string;
  name: string;
  category: string;
  status: 'running' | 'stopped' | 'restarting' | 'error';
  health: 'healthy' | 'warning' | 'critical';
  uptimeMinutes: number;
  critical: boolean;
}