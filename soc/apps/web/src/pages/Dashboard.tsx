import React, { useState } from 'react';
import { NavBar } from '@/components/NavBar';
import { FilterBar } from '@/components/FilterBar';
import { Sidebar } from '@/components/Sidebar';
import { BulkActionsBar } from '@/components/BulkActionsBar';
import { ToolCard } from '@/components/ToolCard';
import { Modal } from '@/components/Modal';

interface Tool {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error';
  description: string;
  icon: string;
  category: string;
}

const mockTools: Tool[] = [
  { id: '1', name: 'Network Scanner', status: 'running', description: 'Scans network for vulnerabilities', icon: '🔍', category: 'Network' },
  { id: '2', name: 'Log Analyzer', status: 'stopped', description: 'Analyzes system logs for threats', icon: '📊', category: 'Analysis' },
  { id: '3', name: 'Firewall Monitor', status: 'running', description: 'Monitors firewall activity', icon: '🛡️', category: 'Security' },
  { id: '4', name: 'Intrusion Detection', status: 'error', description: 'Detects unauthorized access', icon: '🚨', category: 'Security' },
  { id: '5', name: 'Packet Sniffer', status: 'running', description: 'Captures and analyzes packets', icon: '📡', category: 'Network' },
  { id: '6', name: 'Malware Scanner', status: 'stopped', description: 'Scans for malware infections', icon: '🦠', category: 'Security' },
  { id: '7', name: 'SIEM', status: 'running', description: 'Security information and event management', icon: '📈', category: 'Analysis' },
  { id: '8', name: 'Vulnerability Assessor', status: 'running', description: 'Assesses system vulnerabilities', icon: '⚠️', category: 'Assessment' },
  { id: '9', name: 'Endpoint Protection', status: 'stopped', description: 'Protects endpoint devices', icon: '💻', category: 'Security' },
  { id: '10', name: 'Incident Response', status: 'running', description: 'Manages security incidents', icon: '🚑', category: 'Response' },
  { id: '11', name: 'Compliance Checker', status: 'error', description: 'Checks regulatory compliance', icon: '📋', category: 'Compliance' },
  { id: '12', name: 'Threat Intelligence', status: 'running', description: 'Gathers threat intelligence', icon: '🕵️', category: 'Intelligence' },
];

const Dashboard = () => {
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [filter, setFilter] = useState('');
  const [modalType, setModalType] = useState<'open' | 'credentials' | 'info' | null>(null);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);

  const filteredTools = mockTools.filter(tool =>
    tool.name.toLowerCase().includes(filter.toLowerCase()) ||
    tool.category.toLowerCase().includes(filter.toLowerCase())
  );

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavBar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <FilterBar filter={filter} onFilterChange={setFilter} />
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

export default Dashboard;