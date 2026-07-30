import React from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap, Lightbulb, Terminal, FileText, Mic, BookOpen,
  Sparkles, Settings, Zap, X
} from 'lucide-react';
import { AgentId } from '../../types/agent';
import { AGENT_REGISTRY } from '../../data/demoData';

interface SidebarProps {
  activeAgent: AgentId | 'dashboard';
  onSelectAgent: (id: AgentId | 'dashboard') => void;
  onOpenSettings: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const getIcon = (name: string, className: string) => {
  const icons: Record<string, React.ReactNode> = {
    GraduationCap: <GraduationCap className={className} />,
    Lightbulb: <Lightbulb className={className} />,
    Terminal: <Terminal className={className} />,
    FileText: <FileText className={className} />,
    Mic: <Mic className={className} />,
    BookOpen: <BookOpen className={className} />,
  };
  return icons[name] || <Sparkles className={className} />;
};

export const Sidebar: React.FC<SidebarProps> = ({
  activeAgent,
  onSelectAgent,
  onOpenSettings,
  isOpen,
  onClose
}) => {
  const handleNavigate = (id: AgentId | 'dashboard') => {
    onSelectAgent(id);
    onClose();
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="sidebar-overlay fixed inset-0 z-35 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar-wrapper bg-white border-r border-slate-200/80 flex flex-col h-screen sticky top-0 overflow-y-auto ${isOpen ? 'sidebar-open' : ''}`}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-display font-bold text-lg text-slate-900 leading-tight">VivaMentor</h1>
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">AI Platform</span>
              </div>
            </div>
            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dashboard Nav Item */}
        <div className="px-4 mb-1">
          <button
            onClick={() => handleNavigate('dashboard')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all text-left ${
              activeAgent === 'dashboard'
                ? 'bg-blue-50 text-blue-700 shadow-sm'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              activeAgent === 'dashboard'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-slate-100 text-slate-500'
            }`}>
              <Zap className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-sm block">Dashboard</span>
              <span className="text-[10px] text-slate-400 block">Overview & Quick Actions</span>
            </div>
            {activeAgent === 'dashboard' && (
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            )}
          </button>
        </div>

        {/* Supervisor Engine */}
        <div className="px-4 mb-3">
          <button
            onClick={() => handleNavigate('supervisor' as AgentId)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all text-left ${
              activeAgent === 'supervisor'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25'
                : 'bg-gradient-to-r from-slate-50 to-blue-50 text-slate-700 hover:from-blue-50 hover:to-indigo-50 border border-slate-200/50'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${activeAgent === 'supervisor' ? 'text-white' : 'text-blue-600'}`} />
            <div className="flex-1 min-w-0">
              <span className="font-bold text-sm block">Multi-Agent Hub</span>
              <span className={`text-[10px] block ${activeAgent === 'supervisor' ? 'text-blue-100' : 'text-slate-400'}`}>
                Orchestration Engine
              </span>
            </div>
          </button>
        </div>

        {/* Divider */}
        <div className="px-6 mb-2">
          <div className="flex items-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Specialized AI Agents</span>
          </div>
        </div>

        {/* Agent List */}
        <nav className="flex-1 px-4 space-y-0.5 overflow-y-auto pb-4">
          {AGENT_REGISTRY.map((agent) => {
            const isActive = activeAgent === agent.id;
            return (
              <motion.button
                key={agent.id}
                whileHover={{ x: 2 }}
                onClick={() => handleNavigate(agent.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all text-left ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-md"
                  style={{ backgroundColor: isActive ? agent.color : '#94A3B8', boxShadow: isActive ? `0 4px 12px ${agent.color}40` : 'none' }}
                >
                  {getIcon(agent.icon, 'w-4 h-4')}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-sm block truncate">{agent.name}</span>
                  <span className="text-[10px] text-slate-400 block truncate">{agent.badgeTitle}</span>
                </div>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: agent.color }} />
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 pb-5 mt-auto space-y-3">
          <button
            onClick={() => {
              onOpenSettings();
              onClose();
            }}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all text-left"
          >
            <Settings className="w-4 h-4" />
            <span className="text-sm font-medium">Settings & API</span>
          </button>
          <div className="text-center">
            <span className="text-[10px] text-slate-300 font-mono">v1.0.0 • MVP</span>
          </div>
        </div>
      </aside>
    </>
  );
};
