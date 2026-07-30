import React from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap, Lightbulb, Terminal, FileText, Mic, BookOpen,
  Sparkles, Menu, Zap
} from 'lucide-react';
import { AgentId } from '../../types/agent';
import { AGENT_REGISTRY } from '../../data/demoData';

interface HeaderProps {
  activeAgent: AgentId | 'dashboard';
  onLaunchWorkflow: (type: 'java_prep' | 'placement_readiness' | 'final_project') => void;
  onToggleSidebar: () => void;
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

export const Header: React.FC<HeaderProps> = ({ activeAgent, onLaunchWorkflow, onToggleSidebar }) => {
  const currentAgent = AGENT_REGISTRY.find(a => a.id === activeAgent);

  return (
    <header className="sticky top-0 z-30 h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center px-4 sm:px-8">
      {/* Mobile hamburger */}
      <button
        onClick={onToggleSidebar}
        className="mobile-menu-btn mr-3 p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
        aria-label="Toggle sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Agent info */}
      <div className="flex-1 min-w-0">
        {activeAgent === 'supervisor' ? (
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-600/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base sm:text-lg text-slate-900">Multi-Agent Orchestrator</h2>
              <span className="text-xs text-blue-600 font-medium hidden sm:block">Supervisor Engine Active</span>
            </div>
          </div>
        ) : activeAgent === 'dashboard' ? (
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md shadow-blue-600/20">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base sm:text-lg text-slate-900">Dashboard</h2>
              <span className="text-xs text-slate-400 font-medium hidden sm:block">Platform Overview</span>
            </div>
          </div>
        ) : currentAgent ? (
          <div className="flex items-center space-x-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md"
              style={{ backgroundColor: currentAgent.color, boxShadow: `0 4px 12px ${currentAgent.color}40` }}
            >
              {getIcon(currentAgent.icon, 'w-4 h-4')}
            </div>
            <div>
              <h2 className="font-display font-bold text-base sm:text-lg text-slate-900">{currentAgent.name}</h2>
              <div className="flex items-center space-x-2">
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-white"
                  style={{ backgroundColor: currentAgent.color }}
                >
                  {currentAgent.badgeTitle}
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">{currentAgent.tagline}</span>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Quick actions */}
      <div className="hidden md:flex items-center space-x-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onLaunchWorkflow('placement_readiness')}
          className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-colors"
        >
          🎯 Placement Readiness
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onLaunchWorkflow('java_prep')}
          className="px-4 py-2 rounded-xl bg-slate-50 text-slate-600 text-xs font-bold hover:bg-slate-100 transition-colors"
        >
          ☕ Java Interview Prep
        </motion.button>
      </div>
    </header>
  );
};
