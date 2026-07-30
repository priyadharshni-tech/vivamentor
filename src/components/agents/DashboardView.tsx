import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Lightbulb, Terminal, FileText, Mic, BookOpen, Sparkles, ArrowRight, Activity, Clock, Zap, Users, Infinity, ChevronRight, Play, CheckCircle } from 'lucide-react';
import { AgentId, MultiAgentWorkflowType, ActivityEntry } from '../../types/agent';
import { AGENT_REGISTRY } from '../../data/demoData';
import { StorageService } from '../../services/storageService';

const getIcon = (iconName: string, className: string) => {
  switch (iconName) {
    case 'GraduationCap': return <GraduationCap className={className} />;
    case 'Lightbulb': return <Lightbulb className={className} />;
    case 'Terminal': return <Terminal className={className} />;
    case 'FileText': return <FileText className={className} />;
    case 'Mic': return <Mic className={className} />;
    case 'BookOpen': return <BookOpen className={className} />;
    default: return <GraduationCap className={className} />;
  }
};

const formatTimeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  return 'Yesterday';
};

export const DashboardView: React.FC<{ onSelectAgent: (id: AgentId | 'dashboard') => void; onLaunchWorkflow: (type: MultiAgentWorkflowType) => void }> = ({ onSelectAgent, onLaunchWorkflow }) => {
  const [activities, setActivities] = useState<ActivityEntry[]>([]);

  useEffect(() => {
    const fetchActivities = () => {
      const data = StorageService.getActivities() || [];
      setActivities(data.slice(0, 5));
    };
    fetchActivities();
    window.addEventListener('storage', fetchActivities);
    return () => window.removeEventListener('storage', fetchActivities);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-7xl mx-auto p-8 font-sans space-y-12">
      {/* Hero Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-[32px] p-10 lg:p-12 text-white shadow-2xl overflow-hidden"
      >
        <div className="absolute top-[-20%] right-[-10%] w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-10%] w-72 h-72 rounded-full bg-indigo-500/30 blur-3xl" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="space-y-6 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span className="text-xs font-bold tracking-wide uppercase">VivaMentor AI Platform</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold leading-tight">
              Master Your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-400">Tech Career</span>
            </h1>
            
            <p className="text-lg text-blue-100 leading-relaxed max-w-xl">
              Collaborate with 6 specialized AI agents for interview prep, resume building, and project research.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
            {[
              { val: '6', label: 'AI Agents', icon: Users },
              { val: '3', label: 'Pipelines', icon: Activity },
              { val: '∞', label: 'Practice', icon: Infinity },
              { val: '⚡', label: 'Real-Time', icon: Zap }
            ].map((stat, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-md px-6 py-5 rounded-2xl border border-white/20 flex flex-col items-center justify-center">
                <stat.icon className="w-5 h-5 text-blue-300 mb-2" />
                <div className="text-3xl font-display font-extrabold">{stat.val}</div>
                <div className="text-[10px] uppercase tracking-widest text-blue-200 font-bold mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Agent Cards Grid */}
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-2xl font-display font-bold text-slate-900">Your Agent Suite</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {AGENT_REGISTRY.map((agent) => (
            <motion.div
              variants={itemVariants}
              key={agent.id}
              className="bg-white rounded-[24px] p-6 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] flex flex-col h-full"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-4 rounded-2xl" style={{ backgroundColor: `${agent.color}15`, color: agent.color }}>
                  {getIcon(agent.icon, 'w-8 h-8')}
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border" style={{ backgroundColor: `${agent.color}10`, color: agent.color, borderColor: `${agent.color}30` }}>
                  {agent.badgeTitle}
                </span>
              </div>
              
              <h3 className="font-display font-bold text-xl text-slate-900 mb-2">{agent.name}</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-6 flex-1">{agent.description}</p>
              
              <button
                onClick={() => onSelectAgent(agent.id)}
                className="w-full py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center space-x-2"
                style={{ backgroundColor: `${agent.color}15`, color: agent.color }}
              >
                <span>Launch Agent</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Bottom Section: Pipelines & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Pipelines */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-display font-bold text-slate-900 px-2">Multi-Agent Pipelines</h2>
          
          <div className="space-y-4">
            {[
              { id: 'placement_readiness', title: 'Help Me Get Placed', desc: 'End-to-end campus placement preparation', agents: ['ResumeCraft', 'InterviewAce', 'ConceptGuru', 'CodeDoctor', 'VivaMentor'], color: 'blue' },
              { id: 'java_prep', title: 'Java Interview Mastery', desc: 'Comprehensive Java technical round prep', agents: ['VivaMentor', 'ConceptGuru', 'CodeDoctor', 'InterviewAce', 'ResumeCraft'], color: 'amber' },
              { id: 'final_project', title: 'Final Year Project Prep', desc: 'From IEEE survey to defense viva', agents: ['ResearchPilot', 'ConceptGuru', 'CodeDoctor', 'ResumeCraft', 'VivaMentor'], color: 'cyan' }
            ].map(pipe => (
              <div key={pipe.id} className="bg-white rounded-[24px] p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-slate-300 transition-colors">
                <div>
                  <h4 className="font-display font-bold text-lg text-slate-900">{pipe.title}</h4>
                  <p className="text-sm text-slate-500 mb-3 mt-1">{pipe.desc}</p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {pipe.agents.map((ag, idx) => (
                      <React.Fragment key={idx}>
                        <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-md">{ag}</span>
                        {idx < pipe.agents.length - 1 && <ChevronRight className="w-3 h-3 text-slate-300" />}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => onLaunchWorkflow(pipe.id as MultiAgentWorkflowType)}
                  className={`shrink-0 px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center space-x-2 bg-${pipe.color}-600 text-white hover:bg-${pipe.color}-700 shadow-lg shadow-${pipe.color}-500/20`}
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Launch</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="space-y-6">
          <h2 className="text-2xl font-display font-bold text-slate-900 px-2">Recent Activity</h2>
          
          <div className="bg-white rounded-[24px] p-6 border border-slate-200/80 shadow-sm min-h-[300px]">
            {activities.length > 0 ? (
              <div className="space-y-6">
                {activities.map((act, i) => {
                  const agent = AGENT_REGISTRY.find(a => a.id === act.agentId) || AGENT_REGISTRY[0];
                  return (
                    <div key={i} className="flex gap-4 relative">
                      {i !== activities.length - 1 && <div className="absolute left-5 top-10 bottom-[-24px] w-[2px] bg-slate-100" />}
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10" style={{ backgroundColor: `${agent.color}15`, color: agent.color }}>
                        {getIcon(agent.icon, 'w-5 h-5')}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{agent.name}</div>
                        <p className="text-xs text-slate-600 mt-0.5">{act.action}</p>
                        <div className="flex items-center space-x-3 mt-1.5">
                          <span className="text-[10px] text-slate-400 flex items-center"><Clock className="w-3 h-3 mr-1" /> {formatTimeAgo(act.timestamp)}</span>
                          {act.score && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Score: {act.score}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-8">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-slate-300" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">No Activity Yet</h4>
                  <p className="text-sm text-slate-500 px-4">Launch an agent or pipeline to start your preparation journey.</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
};
