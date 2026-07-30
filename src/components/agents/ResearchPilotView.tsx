import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, Lightbulb, FileText, GitBranch, Calendar, Copy, Check, Loader2, FlaskConical, ArrowUpRight, ChevronRight, Table } from 'lucide-react';
import { ResearchAnalysis } from '../../types/agent';
import { AIService } from '../../services/aiService';

const DOMAIN_PILLS = ['Machine Learning', 'IoT', 'Blockchain', 'Cloud Computing', 'Cybersecurity'];

export const ResearchPilotView: React.FC = () => {
  const [topic, setTopic] = useState('Multi-Agent Autonomous AI Systems in Education');
  const [domain, setDomain] = useState('Artificial Intelligence & Software Engineering');
  const [analysis, setAnalysis] = useState<ResearchAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [activeCitationTab, setActiveCitationTab] = useState<string>('IEEE');

  const handleResearch = async () => {
    if (!topic.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await AIService.analyzeResearchTopic(topic, domain);
      setAnalysis(res);
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong. Check your API key.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, format: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const scrollToTopAndSetTopic = (newTopic: string) => {
    setTopic(newTopic);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="max-w-6xl mx-auto p-8 font-sans space-y-8"
    >
      {/* Input Section */}
      <motion.div 
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        className="bg-white rounded-[24px] p-8 border border-slate-200/80 shadow-sm space-y-6"
      >
        <div className="flex items-center space-x-4 pb-6 border-b border-slate-100">
          <div className="p-4 bg-cyan-100/50 text-cyan-600 rounded-2xl">
            <FlaskConical className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-display font-bold text-slate-900 text-2xl">ResearchPilot Studio</h3>
            <p className="text-sm text-slate-500 mt-1">AI-powered literature surveys, gap analysis, and IEEE paper insights.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Research Domain</label>
            <input
              type="text"
              value={domain}
              onChange={e => setDomain(e.target.value)}
              placeholder="e.g. Artificial Intelligence"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-sm font-medium"
            />
            <div className="flex flex-wrap gap-2 pt-2">
              {DOMAIN_PILLS.map(p => (
                <button 
                  key={p} 
                  onClick={() => setDomain(p)}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 hover:bg-cyan-50 hover:text-cyan-700 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 flex flex-col justify-between">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">Project Title / Topic</label>
              <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g. Multi-Agent AI Systems"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-sm font-medium"
              />
            </div>
            
            <button
              onClick={handleResearch}
              disabled={isLoading || !topic.trim()}
              className="w-full mt-auto py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold text-sm shadow-lg shadow-cyan-600/20 transition-all flex items-center justify-center space-x-2 h-[46px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing Literature...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>Analyze Topic</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Output Section */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-sm font-medium">
          ⚠️ {error}
        </div>
      )}

      <AnimatePresence>
        {analysis && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Executive Summary */}
            <div className="bg-white rounded-[24px] overflow-hidden border border-slate-200/80 shadow-sm">
              <div className="bg-cyan-600 px-6 py-4 flex items-center space-x-3">
                <FileText className="w-5 h-5 text-cyan-100" />
                <h4 className="font-display font-bold text-white text-lg">Executive Summary</h4>
              </div>
              <div className="p-6">
                <p className="text-sm text-slate-700 leading-relaxed font-medium">{analysis.summary}</p>
              </div>
            </div>

            {/* Novel Ideas */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <h4 className="font-display font-bold text-slate-900 text-lg">Novel Contributions</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {analysis.novelIdeas.map((idea, i) => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    key={i} 
                    className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-cyan-300 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Lightbulb className="w-5 h-5 text-amber-500" />
                    </div>
                    <p className="text-sm font-medium text-slate-800 leading-relaxed">{idea}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Literature Survey Matrix */}
            <div className="bg-white rounded-[24px] p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 font-display font-bold text-slate-900 text-lg mb-4">
                <Table className="w-5 h-5 text-cyan-600" />
                <span>Literature Survey Matrix</span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-sm border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-bold font-mono text-xs uppercase tracking-wider border-b border-slate-200">
                      <th className="p-4 w-1/4">Title</th>
                      <th className="p-4 w-1/6">Authors & Year</th>
                      <th className="p-4 w-1/5">Methodology</th>
                      <th className="p-4 w-1/6">Limitations</th>
                      <th className="p-4">Key Results</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {analysis.literatureSurvey.map((item, idx) => (
                      <tr key={item.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-cyan-50/30 transition-colors`}>
                        <td className="p-4 font-semibold text-slate-900">{item.title}</td>
                        <td className="p-4 text-slate-600 text-xs">{item.authors} ({item.year})</td>
                        <td className="p-4 text-slate-700 text-xs">{item.methodology}</td>
                        <td className="p-4 text-rose-600 text-xs italic">{item.limitations}</td>
                        <td className="p-4 text-emerald-700 text-xs font-medium">{item.keyResults}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Research Gaps (Simulated) */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <GitBranch className="w-5 h-5 text-indigo-500" />
                <h4 className="font-display font-bold text-slate-900 text-lg">Identified Research Gaps</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Mocked gaps based on limitations */}
                {analysis.literatureSurvey.slice(0, 2).map((item, i) => (
                  <div key={i} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 uppercase tracking-wider mb-3">Gap Identified</span>
                      <p className="text-sm font-medium text-slate-800 mb-4">Current approaches in {item.methodology.toLowerCase()} struggle with: <span className="text-rose-600 font-semibold">{item.limitations}</span>.</p>
                    </div>
                    <button 
                      onClick={() => scrollToTopAndSetTopic(`Novel approach for addressing ${item.limitations} in ${domain}`)}
                      className="flex items-center text-xs font-bold text-cyan-600 hover:text-cyan-700 group mt-auto w-max"
                    >
                      <span>Explore This Gap</span>
                      <ArrowUpRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Project Timeline */}
            <div className="bg-white rounded-[24px] p-6 border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex items-center space-x-2 font-display font-bold text-slate-900 text-lg">
                <Calendar className="w-5 h-5 text-cyan-600" />
                <span>Project Milestone Timeline</span>
              </div>
              
              <div className="relative pl-6 border-l-2 border-slate-100 space-y-8 mt-4">
                {analysis.projectRoadmap.map((step, idx) => (
                  <div key={idx} className="relative">
                    {/* Dot */}
                    <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-white border-4 border-cyan-500" />
                    
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <h5 className="font-bold text-slate-900 text-base">{step.phase}</h5>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-100 text-cyan-800 w-max">
                          {step.duration}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-3"><span className="font-semibold text-slate-700">Milestone:</span> Research completion</p>
                      <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs text-slate-700 font-medium">
                        <span className="text-cyan-700 font-bold">Deliverables:</span> {step.deliverables}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Citation Generator */}
            <div className="bg-white rounded-[24px] overflow-hidden border border-slate-200/80 shadow-sm">
              <div className="border-b border-slate-200 bg-slate-50 px-2 flex">
                {Object.keys(analysis.citations).map(format => (
                  <button
                    key={format}
                    onClick={() => setActiveCitationTab(format)}
                    className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors ${activeCitationTab === format ? 'border-cyan-600 text-cyan-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                    {format}
                  </button>
                ))}
              </div>
              
              <div className="p-6 relative">
                <button
                  onClick={() => copyToClipboard(analysis.citations[activeCitationTab as keyof typeof analysis.citations], activeCitationTab)}
                  className="absolute top-6 right-6 p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors flex items-center space-x-2 text-xs font-bold"
                >
                  {copiedFormat === activeCitationTab ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedFormat === activeCitationTab ? 'Copied' : 'Copy'}</span>
                </button>
                
                <p className="font-mono text-sm text-slate-800 bg-slate-50 p-6 rounded-xl border border-slate-200/80 leading-relaxed pt-12">
                  {analysis.citations[activeCitationTab as keyof typeof analysis.citations]}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
