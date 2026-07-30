import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Play, CheckCircle2, Loader2, ArrowRight, Award, Printer, ChevronRight, Zap, Network, Activity } from 'lucide-react';
import { AgentId, MultiAgentOrchestration, MultiAgentWorkflowType } from '../../types/agent';
import { AIService } from '../../services/aiService';

export const SupervisorWorkflowView: React.FC<{ initialWorkflow: MultiAgentWorkflowType; onNavigateAgent: (id: AgentId) => void }> = ({ initialWorkflow, onNavigateAgent }) => {
  const [selectedWorkflow, setSelectedWorkflow] = useState<MultiAgentWorkflowType>(initialWorkflow);
  const [orchestration, setOrchestration] = useState<MultiAgentOrchestration | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const handleRunWorkflow = async (type: MultiAgentWorkflowType) => {
    setSelectedWorkflow(type);
    setIsRunning(true);
    setActiveStep(0);
    setOrchestration(null);

    const initData = await AIService.runMultiAgentWorkflow(type);
    setOrchestration(initData);

    for (let i = 0; i < initData.steps.length; i++) {
      setActiveStep(i);
      await new Promise(r => setTimeout(r, 1200));
    }
    setActiveStep(initData.steps.length);
    setIsRunning(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-5xl mx-auto p-8 font-sans space-y-10">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 rounded-[32px] p-10 text-white shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />
        
        <div className="relative z-10 space-y-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
              <Network className="w-8 h-8 text-blue-300" />
            </div>
            <div>
              <h2 className="text-3xl font-display font-bold">Supervisor Orchestrator</h2>
              <p className="text-indigo-200 mt-1">Multi-Agent Collaboration Engine</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { type: 'placement_readiness', title: 'Help Me Get Placed', icon: Award, path: 'Resume → Interview → Viva' },
              { type: 'java_prep', title: 'Java Interview Prep', icon: Zap, path: 'Viva → Concept → Code' },
              { type: 'final_project', title: 'Final Year Project', icon: Activity, path: 'Research → Code → Viva' }
            ].map(wf => (
              <button
                key={wf.type}
                onClick={() => handleRunWorkflow(wf.type as MultiAgentWorkflowType)}
                disabled={isRunning}
                className={`p-6 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden group ${
                  selectedWorkflow === wf.type
                    ? 'bg-blue-600/90 border-blue-400 shadow-[0_0_30px_rgba(37,99,235,0.3)]'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="relative z-10">
                  <wf.icon className={`w-6 h-6 mb-3 ${selectedWorkflow === wf.type ? 'text-white' : 'text-blue-300'}`} />
                  <h4 className="font-display font-bold text-lg mb-1">{wf.title}</h4>
                  <p className={`text-xs ${selectedWorkflow === wf.type ? 'text-blue-100' : 'text-slate-400'}`}>{wf.path}</p>
                </div>
                {selectedWorkflow === wf.type && isRunning && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Animated Pipeline Visualization */}
      <AnimatePresence>
        {orchestration && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[32px] p-8 border border-slate-200/80 shadow-sm"
          >
            <div className="flex justify-between items-end mb-8">
              <div>
                <h3 className="font-display font-bold text-slate-900 text-2xl">{orchestration.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{orchestration.description}</p>
              </div>
              {isRunning && (
                <div className="flex items-center space-x-2 text-blue-600 font-bold bg-blue-50 px-4 py-2 rounded-full">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Executing Pipeline...</span>
                </div>
              )}
            </div>

            <div className="relative space-y-6">
              {orchestration.steps.map((step, idx) => {
                const isPast = idx < activeStep;
                const isCurrent = idx === activeStep && isRunning;
                const isPending = idx > activeStep;

                return (
                  <div key={idx} className="relative flex gap-6 group">
                    {/* SVG Connecting Line */}
                    {idx !== orchestration.steps.length - 1 && (
                      <div className={`absolute left-[23px] top-[46px] bottom-[-24px] w-0.5 ${isPast ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                    )}

                    {/* Agent Icon Circle */}
                    <div className={`relative z-10 w-12 h-12 shrink-0 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-all duration-500 ${
                      isPast ? 'bg-emerald-500 text-white' : 
                      isCurrent ? 'bg-blue-600 text-white animate-pulse shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 
                      'bg-slate-100 text-slate-400'
                    }`}>
                      {isPast ? <CheckCircle2 className="w-5 h-5" /> : 
                       isCurrent ? <Loader2 className="w-5 h-5 animate-spin" /> : 
                       <span className="font-bold text-sm">{idx + 1}</span>}
                    </div>

                    {/* Content Card */}
                    <div className={`flex-1 transition-all duration-500 ${isPending ? 'opacity-50' : 'opacity-100'}`}>
                      <div className={`p-5 rounded-2xl border transition-all ${
                        isCurrent ? 'bg-blue-50/50 border-blue-200' : 
                        isPast ? 'bg-white border-emerald-100 hover:border-emerald-200' : 
                        'bg-slate-50 border-slate-100'
                      }`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-display font-bold text-slate-900 text-base">{step.agentName}</h4>
                            <p className="text-xs text-slate-500 mt-0.5">{step.summary}</p>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full ${
                              isPast ? 'bg-emerald-100 text-emerald-700' : 
                              isCurrent ? 'bg-blue-100 text-blue-700' : 
                              'bg-slate-200 text-slate-600'
                            }`}>
                              {isPast ? 'Completed' : isCurrent ? 'Processing' : 'Pending'}
                            </span>
                            
                            {(isPast || isCurrent) && (
                              <button
                                onClick={() => onNavigateAgent(step.agentId)}
                                className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center group-hover:underline"
                              >
                                View Agent <ChevronRight className="w-3 h-3 ml-0.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Step Preview Snippet */}
                        {isPast && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }} 
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-4 p-4 rounded-xl bg-emerald-50/50 border border-emerald-100/50 text-sm text-slate-700"
                          >
                            <span className="font-semibold text-emerald-800">Result: </span>
                            Output securely stored in agent context. Ready for next phase.
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Synthesized Final Report */}
      <AnimatePresence>
        {orchestration && !isRunning && orchestration.finalSynthesizedReport && (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="bg-white rounded-[32px] p-8 border border-slate-200/80 shadow-lg"
          >
            <div className="flex flex-col md:flex-row gap-8 items-center border-b border-slate-100 pb-8">
              {/* Circular Gauge */}
              <motion.div variants={itemVariants} className="relative w-40 h-40 shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" className="stroke-slate-100" strokeWidth="10" fill="none" />
                  <motion.circle 
                    initial={{ strokeDasharray: "0 300" }}
                    animate={{ strokeDasharray: `${orchestration.finalSynthesizedReport.overallScore * 2.83} 300` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    cx="50" cy="50" r="45" 
                    className="stroke-indigo-600" strokeWidth="10" fill="none" strokeLinecap="round" 
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-display font-extrabold text-slate-900">{orchestration.finalSynthesizedReport.overallScore}</span>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Score</span>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="flex-1 space-y-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                  {orchestration.finalSynthesizedReport.statusBadge}
                </span>
                <h3 className="text-3xl font-display font-bold text-slate-900">Executive Summary</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {orchestration.finalSynthesizedReport.executiveSummary}
                </p>
                <button className="flex items-center space-x-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-colors">
                  <Printer className="w-4 h-4" />
                  <span>Print Full Report</span>
                </button>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
              <motion.div variants={itemVariants} className="space-y-4">
                <h4 className="font-display font-bold text-slate-900 flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                  <span>Agent Highlights</span>
                </h4>
                <div className="space-y-3">
                  {orchestration.finalSynthesizedReport.agentHighlights.map((hl, i) => (
                    <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-colors">
                      <div className="font-bold text-xs text-indigo-600 uppercase tracking-wider mb-1">{hl.agentName}</div>
                      <p className="text-sm text-slate-700">{hl.keyTakeaway}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-4">
                <h4 className="font-display font-bold text-slate-900 flex items-center space-x-2">
                  <ArrowRight className="w-5 h-5 text-emerald-500" />
                  <span>Strategic Action Items</span>
                </h4>
                <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100">
                  <ul className="space-y-4">
                    {orchestration.finalSynthesizedReport.actionItems.map((item, idx) => (
                      <li key={idx} className="flex items-start space-x-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <span className="text-sm text-slate-700 font-medium leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
