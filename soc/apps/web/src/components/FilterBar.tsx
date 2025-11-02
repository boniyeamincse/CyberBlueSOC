import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface FilterBarProps {
  filter: string;
  onFilterChange: (filter: string) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ filter, onFilterChange }) => {
  return (
    <div className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search tools..."
          value={filter}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFilterChange(e.target.value)}
          className="pl-10"
          aria-label="Search tools"
        />
      </div>
    </div>
  );
};