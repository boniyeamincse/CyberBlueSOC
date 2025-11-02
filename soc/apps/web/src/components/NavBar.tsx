import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LogOut, User, Settings, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';

interface NavBarProps {
  statusFilter: string;
  categoryFilter: string;
  onStatusFilterChange: (value: string) => void;
  onCategoryFilterChange: (value: string) => void;
  currentView?: 'dashboard' | 'metrics' | 'audit' | 'ai' | 'anomalies';
  onViewChange?: (view: 'dashboard' | 'metrics' | 'audit' | 'ai' | 'anomalies') => void;
}

export const NavBar: React.FC<NavBarProps> = ({
  statusFilter,
  categoryFilter,
  onStatusFilterChange,
  onCategoryFilterChange,
  currentView,
  onViewChange
}) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'running', label: 'Running Only' },
    { value: 'stopped', label: 'Stopped Only' },
    { value: 'critical', label: 'Critical Tools' },
    { value: 'recent', label: 'Recently Started' }
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'DFIR', label: 'DFIR' },
    { value: 'SIEM', label: 'SIEM' },
    { value: 'SOAR', label: 'SOAR' },
    { value: 'Threat Intel', label: 'Threat Intel' },
    { value: 'Endpoint Management', label: 'Endpoint Management' },
    { value: 'Network Analysis', label: 'Network Analysis' },
    { value: 'Attack Simulation', label: 'Attack Simulation' },
    { value: 'Intrusion Detection', label: 'Intrusion Detection' },
    { value: 'Utility', label: 'Utility' }
  ];

  return (
    <nav className="bg-slate-800 dark:bg-slate-800 border-b border-slate-700 dark:border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link to="/dashboard" className="text-xl font-bold text-gray-900 dark:text-white">
            CyberBlueSOC
          </Link>
          <div className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => onViewChange?.('dashboard')}
              className={`text-sm font-medium pb-1 ${
                currentView === 'dashboard'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              Tools
            </button>
            <button
              onClick={() => onViewChange?.('metrics')}
              className={`text-sm font-medium pb-1 ${
                currentView === 'metrics'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              Metrics
            </button>
            <button
              onClick={() => onViewChange?.('audit')}
              className={`text-sm font-medium pb-1 ${
                currentView === 'audit'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              Audit Log
            </button>
            <button
              onClick={() => onViewChange?.('ai')}
              className={`text-sm font-medium pb-1 ${
                currentView === 'ai'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              AI Assistant
            </button>
            <button
              onClick={() => onViewChange?.('anomalies')}
              className={`text-sm font-medium pb-1 ${
                currentView === 'anomalies'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              Anomalies
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {user && (
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">{user.roles.join(', ')}</Badge>
              <span className="text-sm text-gray-600 dark:text-gray-300">{user.name}</span>
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={toggleTheme}>
            {theme === 'light' ? (
              <Moon className="h-4 w-4 mr-2" />
            ) : (
              <Sun className="h-4 w-4 mr-2" />
            )}
            {theme === 'light' ? 'Dark' : 'Light'}
          </Button>
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button variant="ghost" size="sm">
            <User className="h-4 w-4 mr-2" />
            Profile
          </Button>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
};