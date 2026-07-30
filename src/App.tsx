import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AgentId, MultiAgentWorkflowType, ActivityEntry } from './types/agent';
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
import {
  X, Key, Save, User, Clock, Settings, Mail, Building2, GraduationCap,
  Calendar, Trash2, ChevronRight, Shield, Sparkles, LogOut
} from 'lucide-react';
import { StorageService } from './services/storageService';

type SettingsTab = 'profile' | 'history' | 'api';

const PROFILE_STORAGE_KEY = 'vivamentor_user_profile';

interface UserProfile {
  name: string;
  email: string;
  college: string;
  department: string;
  year: string;
  avatar: string;
}

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  email: '',
  college: '',
  department: '',
  year: '',
  avatar: '',
};

const loadProfile = (): UserProfile => {
  try {
    const data = localStorage.getItem(PROFILE_STORAGE_KEY);
    return data ? { ...DEFAULT_PROFILE, ...JSON.parse(data) } : DEFAULT_PROFILE;
  } catch {
    return DEFAULT_PROFILE;
  }
};

const saveProfile = (profile: UserProfile) => {
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
};

const SETTINGS_TABS: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
  { id: 'history', label: 'History', icon: <Clock className="w-4 h-4" /> },
  { id: 'api', label: 'API Settings', icon: <Settings className="w-4 h-4" /> },
];

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const d = new Date(dateStr).getTime();
  const diffMs = now - d;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const AGENT_COLORS: Record<string, string> = {
  vivamentor: '#6366F1',
  conceptguru: '#8B5CF6',
  codedoctor: '#10B981',
  resumecraft: '#F59E0B',
  interviewace: '#EF4444',
  researchpilot: '#3B82F6',
};

function App() {
  const [activeAgent, setActiveAgent] = useState<AgentId | 'dashboard'>('dashboard');
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(StorageService.getApiKey());
  const [workflowType, setWorkflowType] = useState<MultiAgentWorkflowType>('placement_readiness');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('profile');
  const [profile, setProfile] = useState<UserProfile>(loadProfile);
  const [profileSaved, setProfileSaved] = useState(false);
  const [activities, setActivities] = useState<ActivityEntry[]>([]);

  // Load activities when settings modal opens
  useEffect(() => {
    if (showSettings) {
      setActivities(StorageService.getActivities());
      setSettingsTab('profile');
      setProfileSaved(false);
    }
  }, [showSettings]);

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

  const handleSaveApiKey = useCallback(() => {
    StorageService.saveApiKey(apiKey);
    setShowSettings(false);
  }, [apiKey]);

  const handleSaveProfile = useCallback(() => {
    saveProfile(profile);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  }, [profile]);

  const handleClearHistory = useCallback(() => {
    localStorage.removeItem('vivamentor_activities');
    setActivities([]);
  }, []);

  const handleToggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const initials = useMemo(() => {
    const n = profile.name.trim();
    if (!n) return '?';
    const parts = n.split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return n[0].toUpperCase();
  }, [profile.name]);

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

  /* ───────── Settings Tab Content Renderers ───────── */

  const renderProfileTab = () => (
    <motion.div
      key="profile"
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      transition={{ duration: 0.2 }}
      className="space-y-5"
    >
      {/* Avatar & Name Header */}
      <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-600/25 flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-display font-bold text-slate-900 text-base truncate">
            {profile.name || 'Set your name'}
          </h4>
          <p className="text-xs text-slate-500 truncate">{profile.email || 'Add your email'}</p>
          <div className="flex items-center space-x-1 mt-1">
            <Shield className="w-3 h-3 text-emerald-500" />
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Authenticated Locally</span>
          </div>
        </div>
      </div>

      {/* Profile Fields */}
      <div className="grid grid-cols-1 gap-4">
        {/* Full Name */}
        <div>
          <label className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            <User className="w-3.5 h-3.5" />
            <span>Full Name</span>
          </label>
          <input
            type="text"
            value={profile.name}
            onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
            placeholder="Enter your full name"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm font-medium text-slate-800 bg-white placeholder-slate-400"
          />
        </div>

        {/* Email */}
        <div>
          <label className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            <Mail className="w-3.5 h-3.5" />
            <span>Email</span>
          </label>
          <input
            type="email"
            value={profile.email}
            onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
            placeholder="you@example.com"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm font-medium text-slate-800 bg-white placeholder-slate-400"
          />
        </div>

        {/* College */}
        <div>
          <label className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            <Building2 className="w-3.5 h-3.5" />
            <span>College / Institution</span>
          </label>
          <input
            type="text"
            value={profile.college}
            onChange={e => setProfile(p => ({ ...p, college: e.target.value }))}
            placeholder="e.g. IIT Madras, Anna University"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm font-medium text-slate-800 bg-white placeholder-slate-400"
          />
        </div>

        {/* Department & Year row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Department</span>
            </label>
            <input
              type="text"
              value={profile.department}
              onChange={e => setProfile(p => ({ ...p, department: e.target.value }))}
              placeholder="e.g. CSE, ECE"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm font-medium text-slate-800 bg-white placeholder-slate-400"
            />
          </div>
          <div>
            <label className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Year</span>
            </label>
            <select
              value={profile.year}
              onChange={e => setProfile(p => ({ ...p, year: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm font-medium text-slate-800 bg-white"
            >
              <option value="">Select</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
              <option value="PG">PG</option>
              <option value="Alumni">Alumni</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save Profile */}
      <button
        onClick={handleSaveProfile}
        className={`w-full py-3 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 ${
          profileSaved
            ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
        }`}
      >
        {profileSaved ? (
          <>
            <Sparkles className="w-4 h-4" />
            <span>Profile Saved!</span>
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            <span>Save Profile</span>
          </>
        )}
      </button>

      {/* Logout / Reset */}
      <button
        onClick={() => {
          localStorage.removeItem(PROFILE_STORAGE_KEY);
          setProfile(DEFAULT_PROFILE);
        }}
        className="w-full py-2.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 font-medium text-xs transition-colors flex items-center justify-center space-x-2"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span>Reset Profile</span>
      </button>
    </motion.div>
  );

  const renderHistoryTab = () => (
    <motion.div
      key="history"
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      {/* History Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-display font-bold text-slate-900 text-sm">Activity History</h4>
          <p className="text-xs text-slate-400">{activities.length} recorded activit{activities.length === 1 ? 'y' : 'ies'}</p>
        </div>
        {activities.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-50 text-xs font-medium transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Activity List */}
      <div className="max-h-[400px] overflow-y-auto pr-1 space-y-2 custom-scrollbar">
        {activities.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-400">No activity yet</p>
            <p className="text-xs text-slate-300 mt-1">Start using the agents to see your history here</p>
          </div>
        ) : (
          activities.map((entry, idx) => {
            const color = AGENT_COLORS[entry.agentId] || '#6366F1';
            return (
              <motion.div
                key={entry.id || idx}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03, duration: 0.2 }}
                className="flex items-start space-x-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                {/* Color dot / agent icon */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-[10px] font-bold mt-0.5"
                  style={{ backgroundColor: color }}
                >
                  {entry.agentName?.charAt(0) || '?'}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-800 truncate">{entry.agentName}</span>
                    {entry.score !== undefined && (
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{
                          backgroundColor: entry.score >= 80 ? '#DCFCE7' : entry.score >= 50 ? '#FEF9C3' : '#FEE2E2',
                          color: entry.score >= 80 ? '#166534' : entry.score >= 50 ? '#854D0E' : '#991B1B',
                        }}
                      >
                        {entry.score}%
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2">{entry.action}</p>
                </div>

                {/* Timestamp */}
                <span className="text-[10px] text-slate-300 flex-shrink-0 pt-1">{formatRelativeTime(entry.timestamp)}</span>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );

  const renderApiTab = () => (
    <motion.div
      key="api"
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      transition={{ duration: 0.2 }}
      className="space-y-5"
    >
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          AI API Key (OpenAI / Gemini / Claude)
        </label>
        <div className="relative">
          <Key className="w-4 h-4 text-slate-400 absolute left-4 top-3" />
          <input
            type="password"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="sk-... or AIza... (optional for demo mode)"
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm font-medium text-slate-800 bg-white placeholder-slate-400"
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
        onClick={handleSaveApiKey}
        className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition-all flex items-center justify-center space-x-2"
      >
        <Save className="w-4 h-4" />
        <span>Save API Key</span>
      </button>
    </motion.div>
  );

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
              className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-200 mx-4 overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-7 pt-6 pb-4">
                <h3 className="font-display font-bold text-xl text-slate-900">Settings</h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tab Bar */}
              <div className="flex px-7 space-x-1 border-b border-slate-100">
                {SETTINGS_TABS.map(tab => {
                  const isActive = settingsTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setSettingsTab(tab.id)}
                      className={`relative flex items-center space-x-2 px-4 py-3 text-sm font-semibold transition-colors ${
                        isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="settings-tab-indicator"
                          className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 rounded-full"
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Tab Content */}
              <div className="px-7 py-6 max-h-[65vh] overflow-y-auto custom-scrollbar">
                <AnimatePresence mode="wait">
                  {settingsTab === 'profile' && renderProfileTab()}
                  {settingsTab === 'history' && renderHistoryTab()}
                  {settingsTab === 'api' && renderApiTab()}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;

