import React, { useState, useMemo, useEffect } from 'react';
import { NavBar } from '../components/NavBar';
import { Sidebar } from '../components/Sidebar';
import { BulkActionsBar } from '../components/BulkActionsBar';
import { ToolCard } from '../components/ToolCard';
import { Modal } from '../components/Modal';
import { MetricsDashboard } from '../components/MetricsDashboard';
import { AuditLogViewer } from '../components/AuditLogViewer';
import { AIAssistant } from '../components/AIAssistant';
import { seedTools } from '@/data/tools';
import type { Tool } from '../types/tool';

const Dashboard = () => {
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [modalType, setModalType] = useState<'open' | 'credentials' | 'info' | null>(null);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'metrics' | 'audit' | 'ai'>('dashboard');

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
    // Integrate with Docker API to actually start/stop/restart containers
    fetch(`/api/actions/${toolId}/${action}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      console.log('Action result:', data);
      // Update tool status in local state
      // This would trigger a WebSocket update in a real implementation
    })
    .catch(error => console.error('Error performing action:', error));
  };

  const openModal = (tool: Tool, type: 'open' | 'credentials' | 'info') => {
    setSelectedTool(tool);
    setModalType(type);
  };

  const closeModal = () => {
    setSelectedTool(null);
    setModalType(null);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'metrics':
        return <MetricsDashboard />;
      case 'audit':
        return <AuditLogViewer />;
      case 'ai':
        return <AIAssistant />;
      default:
        return (
          <>
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
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 dark:bg-slate-900">
      <NavBar
        statusFilter={statusFilter}
        categoryFilter={categoryFilter}
        onStatusFilterChange={setStatusFilter}
        onCategoryFilterChange={setCategoryFilter}
        currentView={currentView}
        onViewChange={setCurrentView}
      />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          {renderContent()}
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

export default Dashboard;