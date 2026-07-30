import React, { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AgentId, MultiAgentWorkflowType } from './types/agent';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/agents/DashboardView';
import { VivaMentorView } from './components/agents/VivaMentorView';
import { ConceptGuruView } from './components/agents/ConceptGuruView';
import { CodeDoctorView } from './components/agents/CodeDoctorView';
import { ResumeCraftView } from './components/agents/ResumeCraftView';
import { InterviewAceView } from './components/agents/InterviewAceView';
import { ResearchPilotView } from './components/agents/ResearchPilotView';
import { SupervisorWorkflowView } from './components/agents/SupervisorWorkflowView';
import { X, Key, Save } from 'lucide-react';
import { StorageService } from './services/storageService';

function App() {
  const [activeAgent, setActiveAgent] = useState<AgentId | 'dashboard'>('dashboard');
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(StorageService.getApiKey());
  const [workflowType, setWorkflowType] = useState<MultiAgentWorkflowType>('placement_readiness');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [activeAgent]);

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSidebarOpen(false);
        setShowSettings(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const handleSelectAgent = useCallback((id: AgentId | 'dashboard') => {
    setActiveAgent(id);
  }, []);

  const handleLaunchWorkflow = useCallback((type: MultiAgentWorkflowType) => {
    setWorkflowType(type);
    setActiveAgent('supervisor');
  }, []);

  const handleSaveSettings = useCallback(() => {
    StorageService.saveApiKey(apiKey);
    setShowSettings(false);
  }, [apiKey]);

  const handleToggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const renderAgentView = () => {
    switch (activeAgent) {
      case 'dashboard':
        return <DashboardView onSelectAgent={handleSelectAgent} onLaunchWorkflow={handleLaunchWorkflow} />;
      case 'vivamentor':
        return <VivaMentorView />;
      case 'conceptguru':
        return <ConceptGuruView />;
      case 'codedoctor':
        return <CodeDoctorView />;
      case 'resumecraft':
        return <ResumeCraftView />;
      case 'interviewace':
        return <InterviewAceView />;
      case 'researchpilot':
        return <ResearchPilotView />;
      case 'supervisor':
        return <SupervisorWorkflowView initialWorkflow={workflowType} onNavigateAgent={handleSelectAgent} />;
      default:
        return <DashboardView onSelectAgent={handleSelectAgent} onLaunchWorkflow={handleLaunchWorkflow} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-bgLight font-sans">
      {/* Sidebar */}
      <Sidebar
        activeAgent={activeAgent}
        onSelectAgent={handleSelectAgent}
        onOpenSettings={() => setShowSettings(true)}
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        <Header
          activeAgent={activeAgent}
          onLaunchWorkflow={handleLaunchWorkflow}
          onToggleSidebar={handleToggleSidebar}
        />

        {/* Agent Content Renderer with smooth transitions */}
        <div className="flex-1 pb-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeAgent}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {renderAgentView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Settings Modal Overlay */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setShowSettings(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-card p-8 w-full max-w-lg shadow-2xl border border-slate-200 mx-4"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-bold text-xl text-slate-900">Platform Settings</h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    AI API Key (OpenAI / Gemini / Claude)
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                    <input
                      type="password"
                      value={apiKey}
                      onChange={e => setApiKey(e.target.value)}
                      placeholder="sk-... or AIza... (optional for demo mode)"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm font-medium text-slate-800"
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    Leave blank to use built-in intelligent demo engines. Add a key to connect live AI models.
                  </p>
                </div>

                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200/80">
                  <h4 className="font-display font-bold text-blue-800 text-sm mb-1">Demo Mode Active</h4>
                  <p className="text-xs text-blue-700">
                    All 6 agents operate using pre-built intelligent simulation engines. Every feature is fully functional without requiring an API key.
                  </p>
                </div>

                <button
                  onClick={handleSaveSettings}
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition-all flex items-center justify-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Settings</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
