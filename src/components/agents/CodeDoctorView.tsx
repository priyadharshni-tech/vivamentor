import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Bug, GitCompareArrows, ListChecks, Zap, Clock, HardDrive, Play, Loader2, Copy, Check, Info } from 'lucide-react';
import { CodeAnalysis } from '../../types/agent';
import { AIService } from '../../services/aiService';
import { DEMO_CODE_DOCTOR_SAMPLES } from '../../data/demoData';

export const CodeDoctorView: React.FC = () => {
  const [language, setLanguage] = useState<string>('java');
  const [code, setCode] = useState<string>(DEMO_CODE_DOCTOR_SAMPLES.java);
  const [analysis, setAnalysis] = useState<CodeAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'bugs' | 'diff' | 'linebyline'>('bugs');
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  
  const handleScroll = () => {
    if (textAreaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textAreaRef.current.scrollTop;
    }
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    if (lang === 'java') setCode(DEMO_CODE_DOCTOR_SAMPLES.java);
    else if (lang === 'python') setCode(DEMO_CODE_DOCTOR_SAMPLES.python);
    else if (lang === 'javascript') setCode(DEMO_CODE_DOCTOR_SAMPLES.javascript);
    else if (lang === 'cpp') setCode(DEMO_CODE_DOCTOR_SAMPLES.cpp || '');
    else if (lang === 'c') setCode(DEMO_CODE_DOCTOR_SAMPLES.c || '');
  };

  const handleAnalyze = async () => {
    if (!code.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await AIService.analyzeCode(code, language);
      setAnalysis(res);
      setActiveTab('bugs');
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong. Check your API key.');
    } finally {
      setIsLoading(false);
    }
  };

  const lineCount = code.split('\n').length;
  const bugLines = analysis ? analysis.bugs.map(b => b.line) : [];

  return (
    <div className="max-w-6xl mx-auto p-8 font-sans space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
             <div className="bg-emerald-100 p-3 rounded-xl">
               <Terminal className="w-6 h-6 text-emerald-600" />
             </div>
             <h2 className="text-xl font-bold text-slate-900">CodeDoctor</h2>
          </div>
          <div className="flex space-x-2">
            {['java', 'python', 'javascript', 'cpp', 'c'].map((lang) => {
              const colors: Record<string, string> = {
                java: 'bg-orange-100 text-orange-700',
                python: 'bg-blue-100 text-blue-700',
                javascript: 'bg-yellow-100 text-yellow-700',
                cpp: 'bg-indigo-100 text-indigo-700',
                c: 'bg-slate-200 text-slate-700'
              };
              return (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                    language === lang ? 'ring-2 ring-emerald-500 ring-offset-1 ' + colors[lang] : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {lang}
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-inner flex h-80">
           <div 
             ref={lineNumbersRef} 
             className="w-12 bg-slate-950 text-slate-500 font-mono text-sm py-4 text-right pr-2 select-none overflow-hidden"
             style={{ fontFamily: "'IBM Plex Mono', monospace" }}
           >
             {Array.from({ length: Math.max(lineCount, 10) }).map((_, i) => (
               <div key={i} className={`relative ${bugLines.includes(i + 1) ? 'text-red-400 bg-red-900/30 font-bold border-l-2 border-red-500' : ''}`}>
                 {i + 1}
               </div>
             ))}
           </div>
           <textarea
             ref={textAreaRef}
             value={code}
             onChange={e => setCode(e.target.value)}
             onScroll={handleScroll}
             className="flex-1 bg-transparent text-slate-100 font-mono text-sm p-4 outline-none resize-none whitespace-pre leading-relaxed"
             style={{ fontFamily: "'IBM Plex Mono', monospace" }}
             spellCheck="false"
           />
           <button
             onClick={handleAnalyze}
             disabled={isLoading || !code}
             className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center space-x-2 shadow-lg transition-colors"
           >
             {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Play className="w-4 h-4" /><span>Analyze Code</span></>}
           </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-sm font-medium">
          ⚠️ {error}
        </div>
      )}

      {analysis && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white p-6 rounded-3xl shadow-lg border border-slate-200">
               <div className="flex items-center space-x-3 mb-4">
                 <Clock className="w-5 h-5 text-emerald-500" />
                 <h3 className="font-bold text-slate-900">Time Complexity</h3>
               </div>
               <div className="flex items-center justify-between mb-2">
                 <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full font-mono text-sm font-bold">Old: {analysis.timeComplexity.original}</span>
                 <span className="text-slate-400">→</span>
                 <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full font-mono text-sm font-bold">New: {analysis.timeComplexity.optimized}</span>
               </div>
               <p className="text-sm text-slate-600">{analysis.timeComplexity.explanation}</p>
             </motion.div>
             <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-3xl shadow-lg border border-slate-200">
               <div className="flex items-center space-x-3 mb-4">
                 <HardDrive className="w-5 h-5 text-blue-500" />
                 <h3 className="font-bold text-slate-900">Space Complexity</h3>
               </div>
               <div className="flex items-center justify-between mb-2">
                 <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full font-mono text-sm font-bold">Old: {analysis.spaceComplexity.original}</span>
                 <span className="text-slate-400">→</span>
                 <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full font-mono text-sm font-bold">New: {analysis.spaceComplexity.optimized}</span>
               </div>
               <p className="text-sm text-slate-600">{analysis.spaceComplexity.explanation}</p>
             </motion.div>
          </div>

          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
             <div className="flex border-b border-slate-200 bg-slate-50">
               <button onClick={() => setActiveTab('bugs')} className={`flex items-center space-x-2 px-6 py-4 font-bold text-sm transition-colors border-b-2 ${activeTab === 'bugs' ? 'border-emerald-500 text-emerald-600 bg-white' : 'border-transparent text-slate-500'}`}>
                 <Bug className="w-4 h-4" /><span>Bugs & Issues</span>
               </button>
               <button onClick={() => setActiveTab('diff')} className={`flex items-center space-x-2 px-6 py-4 font-bold text-sm transition-colors border-b-2 ${activeTab === 'diff' ? 'border-emerald-500 text-emerald-600 bg-white' : 'border-transparent text-slate-500'}`}>
                 <GitCompareArrows className="w-4 h-4" /><span>Code Diff</span>
               </button>
               <button onClick={() => setActiveTab('linebyline')} className={`flex items-center space-x-2 px-6 py-4 font-bold text-sm transition-colors border-b-2 ${activeTab === 'linebyline' ? 'border-emerald-500 text-emerald-600 bg-white' : 'border-transparent text-slate-500'}`}>
                 <ListChecks className="w-4 h-4" /><span>Line-by-Line</span>
               </button>
             </div>
             
             <div className="p-6 bg-white min-h-[300px]">
               {activeTab === 'bugs' && (
                 <div className="space-y-4">
                   {analysis.bugs.map((bug, i) => {
                     const severityColors = {
                       error: 'bg-red-100 text-red-700 border-red-200',
                       warning: 'bg-amber-100 text-amber-700 border-amber-200',
                       optimization: 'bg-blue-100 text-blue-700 border-blue-200'
                     };
                     return (
                       <div key={i} className={`p-4 rounded-xl border ${severityColors[bug.severity]} bg-opacity-50`}>
                         <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-sm font-bold px-2 py-0.5 bg-white rounded-md shadow-sm">L{bug.line}</span>
                              <span className="font-bold">{bug.issue}</span>
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider opacity-80">{bug.severity}</span>
                         </div>
                         <p className="text-sm mb-3 opacity-90">{bug.explanation}</p>
                         <div className="bg-slate-900 rounded-lg p-3 overflow-x-auto text-emerald-300 font-mono text-sm">
                           <code>{bug.fix}</code>
                         </div>
                       </div>
                     )
                   })}
                 </div>
               )}

               {activeTab === 'diff' && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="rounded-xl overflow-hidden border border-red-200">
                     <div className="bg-red-50 text-red-700 p-3 font-bold text-sm border-b border-red-200 flex items-center space-x-2">
                       <div className="w-2 h-2 rounded-full bg-red-500"></div>
                       <span>Original Code</span>
                     </div>
                     <pre className="p-4 bg-slate-900 text-slate-300 font-mono text-sm overflow-x-auto h-64">
                       <code>{analysis.originalCode}</code>
                     </pre>
                   </div>
                   <div className="rounded-xl overflow-hidden border border-emerald-200">
                     <div className="bg-emerald-50 text-emerald-700 p-3 font-bold text-sm border-b border-emerald-200 flex items-center space-x-2">
                       <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                       <span>Optimized Code</span>
                     </div>
                     <pre className="p-4 bg-slate-900 text-emerald-300 font-mono text-sm overflow-x-auto h-64">
                       <code>{analysis.improvedCode}</code>
                     </pre>
                   </div>
                 </div>
               )}

               {activeTab === 'linebyline' && (
                 <div className="rounded-xl overflow-hidden border border-slate-200">
                   <table className="w-full text-left border-collapse">
                     <thead>
                       <tr className="bg-slate-50">
                         <th className="p-3 font-bold text-slate-600 w-16 border-b border-slate-200 text-sm">Line</th>
                         <th className="p-3 font-bold text-slate-600 border-b border-slate-200 text-sm">Code Snippet</th>
                         <th className="p-3 font-bold text-slate-600 border-b border-slate-200 text-sm">Explanation</th>
                       </tr>
                     </thead>
                     <tbody>
                       {analysis.lineByLineExplanation.map((lbl, i) => (
                         <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                           <td className="p-3 font-mono text-slate-500 text-sm">L{lbl.line}</td>
                           <td className="p-3 font-mono text-emerald-600 text-sm bg-emerald-50/30"><code>{lbl.code}</code></td>
                           <td className="p-3 text-slate-600 text-sm">{lbl.explanation}</td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               )}
             </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-3xl border border-emerald-100 shadow-sm flex items-start space-x-4">
             <div className="bg-emerald-200 p-2 rounded-full text-emerald-700 mt-1">
               <Info className="w-5 h-5" />
             </div>
             <div>
               <h4 className="font-bold text-emerald-900 mb-1">Code Quality Summary</h4>
               <p className="text-emerald-800 text-sm leading-relaxed">{analysis.summary}</p>
             </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
