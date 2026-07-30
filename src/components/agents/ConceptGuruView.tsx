import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Search, BookOpen, Code2, HelpCircle, BriefcaseBusiness, GitFork, X, CheckCircle2, XCircle, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { ConceptExplanation } from '../../types/agent';
import { AIService } from '../../services/aiService';

export const ConceptGuruView: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [explanation, setExplanation] = useState<ConceptExplanation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'explanation' | 'diagram' | 'code' | 'quiz' | 'interview'>('explanation');
  
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [dismissedMisconceptions, setDismissedMisconceptions] = useState<number[]>([]);

  const handleExplain = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = topic.trim() || 'Garbage Collection';
    setIsLoading(true);
    try {
      const data = await AIService.explainConcept(query, difficulty);
      setExplanation(data);
      setQuizAnswers({});
      setShowQuizResults(false);
      setDismissedMisconceptions([]);
      setActiveTab('explanation');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getScore = () => {
    if (!explanation) return 0;
    return explanation.quiz.reduce((score, q, idx) => {
      return score + (quizAnswers[idx] === q.correctIndex ? 1 : 0);
    }, 0);
  };

  const renderTabContent = () => {
    if (!explanation) return null;
    
    switch (activeTab) {
      case 'explanation':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 space-y-6">
            <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200/80">
              <div className="flex items-center space-x-2 text-amber-700 font-bold mb-3">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <span>Real-World Mental Analogy</span>
              </div>
              <p className="text-slate-800 text-base leading-relaxed font-medium">
                {explanation.analogy}
              </p>
            </div>
            
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/60">
              <h4 className="font-bold text-slate-900 mb-2">Simple Explanation</h4>
              <p className="text-slate-700 leading-relaxed">{explanation.simpleExplanation}</p>
            </div>

            <div className="border border-slate-200/60 rounded-2xl overflow-hidden">
              <button 
                onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                className="w-full flex items-center justify-between p-6 bg-white hover:bg-slate-50 transition-colors"
              >
                <h4 className="font-bold text-slate-900">Technical Deep-Dive</h4>
                {showTechnicalDetails ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
              </button>
              <AnimatePresence>
                {showTechnicalDetails && (
                  <motion.div 
                    initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 pt-0 bg-white border-t border-slate-100">
                      <p className="text-slate-700 leading-relaxed">{explanation.technicalDetails}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        );
      
      case 'diagram':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 overflow-x-auto flex justify-center">
             <svg width="500" height={Math.max(600, explanation.nodes.length * 120 + 50)} className="bg-slate-50 rounded-2xl border border-slate-200">
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
                  </marker>
                </defs>
                {explanation.nodes.map((node, i) => {
                  const y = i * 120 + 50;
                  const x = 250;
                  const nextY = (i + 1) * 120 + 50;
                  const hasNext = i < explanation.nodes.length - 1;
                  
                  return (
                    <g key={node.id}>
                      {hasNext && (
                        <line x1={x} y1={y + 30} x2={x} y2={nextY - 30} stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrowhead)" />
                      )}
                      
                      {node.type === 'start' && (
                        <rect x={x - 75} y={y - 25} width="150" height="50" rx="25" fill="#22c55e" />
                      )}
                      {node.type === 'process' && (
                        <rect x={x - 75} y={y - 25} width="150" height="50" fill="#3b82f6" />
                      )}
                      {node.type === 'decision' && (
                        <polygon points={`${x},${y-30} ${x+75},${y} ${x},${y+30} ${x-75},${y}`} fill="#f59e0b" />
                      )}
                      {node.type === 'end' && (
                        <rect x={x - 75} y={y - 25} width="150" height="50" rx="15" fill="#ef4444" />
                      )}
                      
                      <text x={x} y={y + 5} textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">
                        {node.label}
                      </text>
                      <text x={x} y={y + 45} textAnchor="middle" fill="#64748b" fontSize="11">
                        {node.description}
                      </text>
                    </g>
                  );
                })}
             </svg>
          </motion.div>
        );

      case 'code':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 space-y-4">
             <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-slate-900">Code Implementation</h4>
                <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold uppercase">
                  {explanation.codeExample.language}
                </span>
             </div>
             <div className="bg-slate-900 rounded-xl overflow-hidden flex">
                <div className="bg-slate-800 text-slate-500 p-4 text-right select-none font-mono text-sm border-r border-slate-700">
                  {explanation.codeExample.code.split('\n').map((_, i) => <div key={i}>{i+1}</div>)}
                </div>
                <pre className="p-4 text-amber-100 font-mono text-sm overflow-x-auto">
                  <code>{explanation.codeExample.code}</code>
                </pre>
             </div>
             <div className="mt-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className="text-sm text-slate-700"><strong>Walkthrough:</strong> {explanation.codeExample.explanation}</p>
             </div>
          </motion.div>
        );

      case 'quiz':
        const score = getScore();
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 space-y-6">
            {explanation.quiz.map((q, qIdx) => {
              const isCorrect = quizAnswers[qIdx] === q.correctIndex;
              
              return (
                <div key={qIdx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h4 className="font-bold text-slate-900">{qIdx + 1}. {q.question}</h4>
                  <div className="space-y-2">
                    {q.options.map((opt, oIdx) => {
                      const isSelected = quizAnswers[qIdx] === oIdx;
                      let btnClass = "w-full text-left p-4 rounded-xl border text-sm transition-all ";
                      if (showQuizResults) {
                         if (oIdx === q.correctIndex) btnClass += "bg-green-50 border-green-500 text-green-900 font-semibold";
                         else if (isSelected) btnClass += "bg-red-50 border-red-500 text-red-900";
                         else btnClass += "bg-white border-slate-200 text-slate-500";
                      } else {
                         if (isSelected) btnClass += "bg-amber-50 border-amber-500 text-amber-900 font-semibold";
                         else btnClass += "bg-white border-slate-200 hover:border-amber-300 text-slate-700";
                      }
                      
                      return (
                        <button key={oIdx} onClick={() => !showQuizResults && setQuizAnswers({...quizAnswers, [qIdx]: oIdx})} disabled={showQuizResults} className={btnClass}>
                           <div className="flex items-center space-x-3">
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-amber-500' : 'border-slate-300'}`}>
                                 {isSelected && <div className="w-2 h-2 bg-amber-500 rounded-full" />}
                              </div>
                              <span>{opt}</span>
                           </div>
                        </button>
                      );
                    })}
                  </div>
                  <AnimatePresence>
                    {showQuizResults && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
                        <div className={`mt-4 p-4 rounded-xl text-sm ${isCorrect ? 'bg-green-50 text-green-900' : 'bg-red-50 text-red-900'}`}>
                           <p><strong>{isCorrect ? 'Correct!' : 'Incorrect.'}</strong> {q.explanation}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
            {!showQuizResults ? (
               <button onClick={() => setShowQuizResults(true)} className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-colors shadow-md">
                 Submit Quiz
               </button>
            ) : (
               <div className="p-6 bg-slate-900 text-white rounded-2xl text-center shadow-lg">
                 <h3 className="text-2xl font-bold mb-2">Final Score</h3>
                 <div className="text-5xl font-extrabold text-amber-400">{score} <span className="text-xl text-slate-400">/ {explanation.quiz.length}</span></div>
               </div>
            )}
          </motion.div>
        );

      case 'interview':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 space-y-8">
            <div>
              <h4 className="font-bold text-slate-900 text-lg mb-4 flex items-center space-x-2">
                <BriefcaseBusiness className="w-5 h-5 text-amber-600" />
                <span>Interview Questions</span>
              </h4>
              <ul className="space-y-3">
                {explanation.interviewQuestions.map((q, idx) => (
                  <li key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex space-x-3">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold flex-shrink-0">{idx+1}</span>
                    <span className="text-slate-700 font-medium">{q}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
               <h4 className="font-bold text-slate-900 text-lg mb-4 text-red-600">Common Misconceptions</h4>
               <div className="space-y-3">
                 <AnimatePresence>
                   {explanation.commonMisconceptions.map((m, idx) => {
                     if (dismissedMisconceptions.includes(idx)) return null;
                     return (
                       <motion.div key={idx} exit={{ opacity: 0, scale: 0.95 }} className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-start justify-between">
                         <div className="flex space-x-3">
                           <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                           <span className="text-red-900 text-sm">{m}</span>
                         </div>
                         <button onClick={() => setDismissedMisconceptions([...dismissedMisconceptions, idx])} className="text-red-400 hover:text-red-600 transition-colors">
                           <X className="w-4 h-4" />
                         </button>
                       </motion.div>
                     );
                   })}
                 </AnimatePresence>
               </div>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8 font-sans space-y-8">
      {/* Search & Topic Selector Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-lg">
        <form onSubmit={handleExplain} className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="Search any concept (e.g. Garbage Collection, B-Trees, Linked Lists)..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-800"
            />
          </div>

          <select
            value={difficulty}
            onChange={e => setDifficulty(e.target.value)}
            className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-sm text-slate-700 focus:outline-none"
          >
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full md:w-auto px-8 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-md transition-all flex items-center justify-center space-x-2"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Lightbulb className="w-5 h-5" /><span>Explain</span></>}
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2 items-center text-sm">
          <span className="text-slate-400 font-semibold uppercase text-xs">Popular:</span>
          {['Garbage Collection', 'B-Trees', 'Event Loop', 'OOP Polymorphism', 'Linked Lists', 'SQL Joins'].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => { setTopic(item); handleExplain(); }}
              className="px-4 py-1.5 rounded-full bg-slate-100 hover:bg-amber-100 hover:text-amber-800 text-slate-600 font-medium transition-colors text-xs border border-transparent hover:border-amber-200"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {explanation && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="flex border-b border-slate-200 bg-slate-50 overflow-x-auto">
             {[
               { id: 'explanation', icon: BookOpen, label: 'Explanation' },
               { id: 'diagram', icon: GitFork, label: 'Diagram' },
               { id: 'code', icon: Code2, label: 'Code' },
               { id: 'quiz', icon: HelpCircle, label: 'Quiz' },
               { id: 'interview', icon: BriefcaseBusiness, label: 'Interview' }
             ].map((tab) => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id as any)}
                 className={`flex items-center space-x-2 px-6 py-4 font-bold text-sm tracking-wide transition-colors border-b-2 whitespace-nowrap ${
                   activeTab === tab.id ? 'border-amber-500 text-amber-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800'
                 }`}
               >
                 <tab.icon className="w-4 h-4" />
                 <span>{tab.label}</span>
               </button>
             ))}
          </div>

          <div className="min-h-[400px]">
            {renderTabContent()}
          </div>
        </div>
      )}
    </div>
  );
};
