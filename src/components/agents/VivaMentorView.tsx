import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { GraduationCap, Mic, MicOff, Send, ChevronRight, Award, RotateCcw, Printer, AlertCircle, Loader2, MessageCircle } from 'lucide-react';
import { VivaConfig, VivaQuestion, VivaEvaluation, VivaReport } from '../../types/agent';
import { AIService } from '../../services/aiService';
import { StorageService } from '../../services/storageService';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.4 }
};

export const VivaMentorView: React.FC = () => {
  const [stage, setStage] = useState<'config' | 'exam' | 'report'>('config');
  
  // Viva Setup State
  const [config, setConfig] = useState<VivaConfig>({
    department: 'Computer Science & Engineering',
    semester: '6th Semester',
    subject: 'Data Structures & Algorithms',
    topic: 'Binary Search Trees & Heap Memory',
    difficulty: 'Medium',
    numQuestions: 5,
    language: 'English'
  });

  // Active Exam State
  const [questions, setQuestions] = useState<VivaQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [evaluations, setEvaluations] = useState<VivaEvaluation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [finalReport, setFinalReport] = useState<VivaReport | null>(null);
  
  const [followUpMode, setFollowUpMode] = useState(false);
  const [currentFollowUp, setCurrentFollowUp] = useState<string | null>(null);
  
  const [expandedAnswers, setExpandedAnswers] = useState<Record<number, boolean>>({});

  const toggleAnswer = (idx: number) => {
    setExpandedAnswers(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Start Viva Examination
  const handleStartViva = async () => {
    setIsLoading(true);
    try {
      const qList = await AIService.generateVivaQuestions(config);
      setQuestions(qList);
      setCurrentIndex(0);
      setEvaluations([]);
      setStage('exam');
      setFollowUpMode(false);
      setCurrentFollowUp(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Answer to AI Evaluator
  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const q = questions[currentIndex];
      // In follow-up mode, we evaluate the combined context or just proceed
      // For this demo, we mock the followUp check
      let evaluation;
      if (followUpMode) {
        evaluation = await AIService.evaluateVivaAnswer(q, userAnswer, config.difficulty);
        setFollowUpMode(false);
        setCurrentFollowUp(null);
      } else {
        evaluation = await AIService.evaluateVivaAnswer(q, userAnswer, config.difficulty);
        
        // Mock follow-up question logic (e.g. 30% chance or if confidence is low)
        const needsFollowUp = Math.random() > 0.7 && !followUpMode;
        if (needsFollowUp) {
          setFollowUpMode(true);
          setCurrentFollowUp("Could you elaborate a bit more on that, specifically regarding its practical application?");
          setUserAnswer('');
          setIsLoading(false);
          return; // Wait for follow-up answer
        }
      }
      
      const newEvals = [...evaluations, evaluation];
      setEvaluations(newEvals);
      setUserAnswer('');

      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // Calculate Final Viva Score Report
        const totalScore = newEvals.reduce((acc, curr) => acc + curr.score, 0);
        const maxScore = questions.length * 10;
        const percentage = Math.round((totalScore / maxScore) * 100);

        const report: VivaReport = {
          id: `viva-${Date.now()}`,
          timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          config,
          totalScore,
          maxScore,
          percentage,
          evaluations: newEvals,
          overallFeedback: percentage >= 80 
            ? 'Outstanding performance! Demonstrates clear technical depth, accurate terminology, and confident delivery.' 
            : 'Good performance. Re-examine core theoretical memory concepts and practice concise 2-sentence summaries.',
          improvementTips: [
            'State time complexity O(N) constraints upfront when answering.',
            'Maintain steady pacing when explaining exception handling.',
            'Include specific JVM memory regions in your answers.'
          ]
        };

        setFinalReport(report);
        StorageService.saveVivaReport(report);
        setStage('report');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }
    
    if (!isRecording) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setUserAnswer(prev => prev + (prev ? ' ' : '') + transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } else {
      setIsRecording(false);
    }
  };
  
  // Calculate synthetic averages for Radar chart
  const radarData = [
    { subject: 'Correctness', A: finalReport ? Math.min(10, Math.round((finalReport.percentage / 100) * 10 + 1)) : 0, fullMark: 10 },
    { subject: 'Communication', A: finalReport ? Math.min(10, Math.round((finalReport.percentage / 100) * 10)) : 0, fullMark: 10 },
    { subject: 'Confidence', A: finalReport ? Math.min(10, Math.round((finalReport.percentage / 100) * 10 - 1)) : 0, fullMark: 10 },
  ];

  return (
    <div className="max-w-6xl mx-auto p-8 font-sans animate-fade-in-up">
      <AnimatePresence mode="wait">
        {/* 1. CONFIGURATION STAGE */}
        {stage === 'config' && (
          <motion.div key="config" {...fadeInUp} className="bg-white/70 backdrop-blur-xl rounded-[20px] p-8 border border-white/40 shadow-soft">
            <div className="flex items-center space-x-3 mb-8 pb-6 border-b border-slate-100">
              <div className="p-3 bg-blue-100 text-blue-700 rounded-2xl">
                <GraduationCap className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-display font-bold text-slate-900">Configure Your Viva</h3>
                <p className="text-sm text-slate-500">Set up parameters for a highly adaptive AI examination.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Department</label>
                  <input
                    type="text"
                    value={config.department}
                    onChange={e => setConfig({ ...config, department: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 font-medium text-sm bg-white shadow-sm transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Semester</label>
                  <select
                    value={config.semester}
                    onChange={e => setConfig({ ...config, semester: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 font-medium text-sm bg-white shadow-sm transition-all"
                  >
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s}>{s}{s===1?'st':s===2?'nd':s===3?'rd':'th'} Semester</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Subject</label>
                  <input
                    type="text"
                    value={config.subject}
                    onChange={e => setConfig({ ...config, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 font-medium text-sm bg-white shadow-sm transition-all"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Specific Topic</label>
                  <input
                    type="text"
                    value={config.topic}
                    onChange={e => setConfig({ ...config, topic: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 font-medium text-sm bg-white shadow-sm transition-all"
                    placeholder="e.g. Garbage Collection, B-Trees..."
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Difficulty</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['Easy', 'Medium', 'Hard', 'Expert'] as const).map(diff => (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => setConfig({ ...config, difficulty: diff })}
                        className={`py-2 rounded-xl font-bold text-xs transition-all border ${
                          config.difficulty === diff
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Number of Questions</label>
                    <span className="text-xs font-bold text-blue-600">{config.numQuestions}</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="10"
                    value={config.numQuestions}
                    onChange={e => setConfig({ ...config, numQuestions: parseInt(e.target.value) })}
                    className="w-full accent-blue-600"
                  />
                </div>
              </div>
            </div>

            <div className="mt-10 flex justify-end">
              <button
                onClick={handleStartViva}
                disabled={isLoading}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Preparing Exam...</span>
                  </>
                ) : (
                  <>
                    <span>Start Exam</span>
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* 2. EXAM SESSION STAGE */}
        {stage === 'exam' && questions.length > 0 && (
          <motion.div key="exam" {...fadeInUp} className="space-y-6">
            <div className="bg-white rounded-[20px] p-6 border border-slate-200/80 shadow-soft flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-display font-bold text-xl shadow-lg shadow-blue-600/20">
                  {currentIndex + 1}
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Question {currentIndex + 1} of {questions.length}</span>
                  <h4 className="font-display font-bold text-slate-900 text-base">{config.topic} • {config.difficulty}</h4>
                </div>
              </div>
              <div className="w-48 bg-slate-100 h-2.5 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="bg-blue-600 h-full transition-all duration-500 ease-out rounded-full"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-white rounded-[20px] p-8 border border-slate-200/80 shadow-card relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
              
              <div className="space-y-4">
                <h3 className="text-2xl font-display font-bold text-slate-900 leading-snug">
                  {questions[currentIndex].question}
                </h3>
                
                {followUpMode && currentFollowUp && (
                  <motion.div {...fadeInUp} className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 flex items-start space-x-3 mt-4">
                    <MessageCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">Follow-up Question</span>
                      <p className="text-slate-700 text-sm">{currentFollowUp}</p>
                    </div>
                  </motion.div>
                )}
                
                {!followUpMode && (
                  <p className="inline-block text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    💡 Hint: {questions[currentIndex].contextHint}
                  </p>
                )}
              </div>

              <div className="mt-8 space-y-4 relative">
                <textarea
                  rows={6}
                  value={userAnswer}
                  onChange={e => setUserAnswer(e.target.value)}
                  placeholder={followUpMode ? "Type your follow-up answer here..." : "Type your answer here or dictate..."}
                  className="w-full p-5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 font-sans text-slate-800 text-sm leading-relaxed bg-slate-50/30 transition-all shadow-inner"
                />
                
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className={`absolute right-4 bottom-6 p-3 rounded-xl transition-all ${
                    isRecording 
                      ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse' 
                      : 'bg-white text-slate-600 shadow-sm border border-slate-200 hover:bg-slate-50 hover:text-blue-600'
                  }`}
                  title="Use Microphone"
                >
                  {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
              </div>

              <div className="flex items-center justify-between mt-6">
                <div className="text-xs text-slate-400 font-mono bg-slate-100 px-3 py-1 rounded-full">
                  {userAnswer.trim().split(/\s+/).filter(Boolean).length} words
                </div>

                <button
                  onClick={handleSubmitAnswer}
                  disabled={!userAnswer.trim() || isLoading}
                  className={`flex items-center space-x-2 px-8 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-md ${
                    !userAnswer.trim() || isLoading
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98]'
                  } ${isLoading ? 'animate-pulse' : ''}`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Evaluating...</span>
                    </>
                  ) : (
                    <>
                      <span>{followUpMode ? "Submit Follow-up" : "Submit Answer"}</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* 3. REPORT CARD STAGE */}
        {stage === 'report' && finalReport && (
          <motion.div key="report" {...fadeInUp} className="space-y-8">
            <div className="bg-gradient-to-br from-slate-900 to-blue-950 rounded-[24px] p-10 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between relative overflow-hidden border border-blue-900/50">
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
              
              <div className="space-y-4 z-10 max-w-xl">
                <div className="flex items-center space-x-3">
                  <Award className="w-8 h-8 text-blue-400" />
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase tracking-widest">
                    Exam Completed
                  </span>
                </div>
                <h2 className="text-4xl font-display font-bold text-white">Performance Scorecard</h2>
                <p className="text-sm text-slate-300 leading-relaxed opacity-90">{finalReport.overallFeedback}</p>
              </div>

              <div className="mt-8 md:mt-0 flex items-center space-x-4 z-10">
                <div className="text-center bg-white/5 backdrop-blur-md px-8 py-6 rounded-[20px] border border-white/10 shadow-xl">
                  <div className="text-5xl font-display font-extrabold text-white">{finalReport.totalScore}<span className="text-2xl text-slate-400">/{finalReport.maxScore}</span></div>
                  <div className="text-xs uppercase tracking-widest text-slate-400 mt-2 font-bold">Total Score</div>
                </div>
                <div className="text-center bg-blue-600 px-8 py-6 rounded-[20px] shadow-lg shadow-blue-600/30 border border-blue-500">
                  <div className="text-5xl font-display font-extrabold text-white">{finalReport.percentage}%</div>
                  <div className="text-xs uppercase tracking-widest text-blue-200 mt-2 font-bold">Grade</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1 bg-white rounded-[20px] p-6 border border-slate-200/80 shadow-soft">
                <h3 className="font-display font-bold text-slate-900 mb-6 text-center">Skills Analysis</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                    <Radar name="Score" dataKey="A" stroke="#2563EB" strokeWidth={2} fill="#3b82f6" fillOpacity={0.4} />
                  </RadarChart>
                </ResponsiveContainer>
                
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-900 mb-3">Improvement Tips</h4>
                  <ul className="space-y-2">
                    {finalReport.improvementTips.map((tip, i) => (
                      <li key={i} className="text-xs text-slate-600 flex items-start space-x-2">
                        <span className="text-blue-500 mt-0.5">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="md:col-span-2 space-y-6">
                <h3 className="font-display font-bold text-lg text-slate-900 flex items-center space-x-2">
                  <span>Question Breakdown</span>
                </h3>
                {finalReport.evaluations.map((evalItem, idx) => (
                  <div key={idx} className="bg-white rounded-[20px] p-6 border border-slate-200/80 shadow-soft transition-all hover:shadow-card">
                    <div className="flex items-start justify-between border-b border-slate-100 pb-4 mb-4">
                      <div className="pr-4">
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Q{idx + 1}</span>
                        <h4 className="font-display font-bold text-slate-900 text-sm mt-1">{evalItem.questionText}</h4>
                      </div>
                      <div className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-sm whitespace-nowrap">
                        {evalItem.score} / 10
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/50">
                        <span className="font-bold text-emerald-700 text-xs uppercase flex items-center space-x-1.5 mb-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                          <span>Strengths</span>
                        </span>
                        <ul className="space-y-2 text-xs text-slate-700">
                          {evalItem.strengths.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                      </div>
                      <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100/50">
                        <span className="font-bold text-amber-700 text-xs uppercase flex items-center space-x-1.5 mb-3">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          <span>Weaknesses</span>
                        </span>
                        <ul className="space-y-2 text-xs text-slate-700">
                          {evalItem.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                        </ul>
                      </div>
                    </div>

                    <div>
                      <button 
                        onClick={() => toggleAnswer(idx)}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center space-x-1"
                      >
                        <span>{expandedAnswers[idx] ? 'Hide' : 'Show'} Answer Details</span>
                      </button>
                      
                      <AnimatePresence>
                        {expandedAnswers[idx] && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-3 text-sm">
                              <p className="text-slate-700 italic">"{evalItem.userAnswer}"</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 pt-4">
              <button
                onClick={() => setStage('config')}
                className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-bold text-sm transition-all shadow-sm"
              >
                <RotateCcw className="w-4 h-4" />
                <span>New Exam</span>
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02]"
              >
                <Printer className="w-4 h-4" />
                <span>Print Report</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
