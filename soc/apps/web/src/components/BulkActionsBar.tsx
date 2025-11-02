import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Square, RotateCcw } from 'lucide-react';

interface BulkActionsBarProps {
  selectedCount: number;
  onBulkAction: (action: 'start' | 'stop' | 'restart') => void;
}

export const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedCount,
  onBulkAction
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center space-x-4 p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
        {selectedCount} tool{selectedCount > 1 ? 's' : ''} selected
      </span>
      <div className="flex space-x-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onBulkAction('start')}
          className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/20"
        >
          <Play className="h-4 w-4 mr-1" />
          Start All
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onBulkAction('stop')}
          className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
        >
          <Square className="h-4 w-4 mr-1" />
          Stop All
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onBulkAction('restart')}
          className="border-yellow-300 text-yellow-700 hover:bg-yellow-50 dark:border-yellow-700 dark:text-yellow-400 dark:hover:bg-yellow-900/20"
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Restart All
        </Button>
      </div>
    </div>
  );
};