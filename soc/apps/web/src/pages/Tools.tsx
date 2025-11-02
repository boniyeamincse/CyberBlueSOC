import React, { useState, useMemo } from 'react';
import { NavBar } from '../components/NavBar';
import { Sidebar } from '../components/Sidebar';
import { BulkActionsBar } from '../components/BulkActionsBar';
import { ToolCard } from '../components/ToolCard';
import { Modal } from '../components/Modal';
import { seedTools } from '@/data/tools';
import type { Tool } from '../types/tool';

const Tools = () => {
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [modalType, setModalType] = useState<'open' | 'credentials' | 'info' | null>(null);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);

  const filteredTools = useMemo(() => {
    return seedTools.filter(tool => {
      // Status filter
      if (statusFilter === 'running' && tool.status !== 'running') return false;
      if (statusFilter === 'stopped' && tool.status !== 'stopped') return false;
      if (statusFilter === 'critical' && !tool.critical) return false;
      if (statusFilter === 'recent' && (!tool.uptimeMinutes || tool.uptimeMinutes > 60)) return false;

      // Category filter
      if (categoryFilter !== 'all' && tool.category !== categoryFilter) return false;

      return true;
    });
  }, [statusFilter, categoryFilter]);

  const toggleToolSelection = (toolId: string) => {
    setSelectedTools(prev =>
      prev.includes(toolId)
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    );
  };

  const handleBulkAction = (action: 'start' | 'stop' | 'restart') => {
    console.log(`Bulk ${action} for tools:`, selectedTools);
    // TODO: Implement bulk actions
  };

  const handleToolAction = (toolId: string, action: 'start' | 'stop' | 'restart') => {
    console.log(`${action} tool:`, toolId);
    // TODO: Implement individual tool actions
  };

  const openModal = (tool: Tool, type: 'open' | 'credentials' | 'info') => {
    setSelectedTool(tool);
    setModalType(type);
  };

  const closeModal = () => {
    setSelectedTool(null);
    setModalType(null);
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <NavBar
        statusFilter={statusFilter}
        categoryFilter={categoryFilter}
        onStatusFilterChange={setStatusFilter}
        onCategoryFilterChange={setCategoryFilter}
      />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-100 mb-2">Tools Management</h1>
            <p className="text-slate-400">Manage and monitor your SOC security tools</p>
          </div>

          <BulkActionsBar
            selectedCount={selectedTools.length}
            onBulkAction={handleBulkAction}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
            {filteredTools.map(tool => (
              <ToolCard
                key={tool.id}
                tool={tool}
                isSelected={selectedTools.includes(tool.id)}
                onSelect={() => toggleToolSelection(tool.id)}
                onAction={(action) => handleToolAction(tool.id, action)}
                onOpen={() => openModal(tool, 'open')}
                onCredentials={() => openModal(tool, 'credentials')}
                onInfo={() => openModal(tool, 'info')}
              />
            ))}
          </div>
        </main>
      </div>
      {modalType && selectedTool && (
        <Modal
          type={modalType}
          tool={selectedTool}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default Tools;