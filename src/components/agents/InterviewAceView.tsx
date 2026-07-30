import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { 
  Mic, MicOff, Send, Timer, User, Briefcase, Brain, 
  MessageSquare, Award, RotateCcw, ChevronDown, ChevronUp, 
  Loader2, CheckCircle2, ArrowRight, Clock, Target, Play
} from 'lucide-react';
import { InterviewConfig, InterviewTurn, InterviewSession } from '../../types/agent';
import { AIService } from '../../services/aiService';

const CircularTimer = ({ timeLeft, maxTime }: { timeLeft: number, maxTime: number }) => {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (timeLeft / maxTime) * circumference;
  
  const percentage = timeLeft / maxTime;
  const colorClass = percentage < 0.25 ? 'text-rose-500' : percentage < 0.5 ? 'text-amber-500' : 'text-emerald-500';

  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle 
          cx="50" cy="50" r={radius} 
          className="stroke-current text-slate-100" 
          strokeWidth="8" fill="transparent" 
        />
        <circle 
          cx="50" cy="50" r={radius} 
          className={`stroke-current ${colorClass} transition-all duration-1000 ease-linear`} 
          strokeWidth="8" fill="transparent" 
          strokeDasharray={circumference} 
          strokeDashoffset={strokeDashoffset} 
          strokeLinecap="round" 
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span className="text-sm font-bold text-slate-700">{timeLeft}s</span>
      </div>
    </div>
  );
};

const MiniGauge = ({ score, label, color }: { score: number, label: string, color: string }) => {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  return (
    <div className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
      <div className="relative w-12 h-12 flex items-center justify-center mb-2">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} className="stroke-current text-slate-200" strokeWidth="8" fill="transparent" />
          <circle 
            cx="50" cy="50" r={radius} 
            className={`stroke-current ${color}`} 
            strokeWidth="8" fill="transparent" 
            strokeDasharray={circumference} 
            strokeDashoffset={strokeDashoffset} 
            strokeLinecap="round" 
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-bold text-slate-700">{score}</span>
        </div>
      </div>
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
    </div>
  );
}

export const InterviewAceView: React.FC = () => {
  const [status, setStatus] = useState<'setup' | 'active' | 'completed'>('setup');
  const [config, setConfig] = useState<InterviewConfig & { timePerQuestion: number }>({
    track: 'Behavioral',
    targetCompany: 'Tier-1 Product Company',
    targetRole: 'Software Engineer',
    experienceLevel: 'Fresher',
    timePerQuestion: 60
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const questions = [
    'Tell me about a time when you faced a severe technical challenge or bug during a team project and how you resolved it.',
    'Describe a situation where you had to disagree with a senior team member or manager. How did you handle it?',
    'Give an example of a goal you reached and tell me how you achieved it.'
  ];
  
  const [userAnswer, setUserAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(config.timePerQuestion);
  const [isLoading, setIsLoading] = useState(false);
  
  const [turns, setTurns] = useState<InterviewTurn[]>([]);
  const [currentTurnResult, setCurrentTurnResult] = useState<InterviewTurn | null>(null);
  const [showModelAnswer, setShowModelAnswer] = useState(false);

  const startInterview = () => {
    setStatus('active');
    setCurrentQuestionIndex(0);
    setTurns([]);
    setCurrentTurnResult(null);
    setUserAnswer('');
    setTimeLeft(config.timePerQuestion);
  };

  const endInterview = () => {
    setStatus('completed');
  };

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim() || isLoading) return;
    setIsLoading(true);
    try {
      const result = await AIService.evaluateInterviewTurn(questions[currentQuestionIndex], userAnswer, config);
      setCurrentTurnResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const nextQuestion = () => {
    if (currentTurnResult) {
      setTurns(prev => [...prev, currentTurnResult]);
    }
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setCurrentTurnResult(null);
      setUserAnswer('');
      setTimeLeft(config.timePerQuestion);
      setShowModelAnswer(false);
    } else {
      endInterview();
    }
  };

  useEffect(() => {
    let timerId: NodeJS.Timeout;
    if (status === 'active' && !currentTurnResult && timeLeft > 0) {
      timerId = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && !currentTurnResult && !isLoading) {
      handleSubmitAnswer();
    }
    return () => clearInterval(timerId);
  }, [status, currentTurnResult, timeLeft, isLoading]);

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      if ('webkitSpeechRecognition' in window) {
        // Mocking speech recognition for demo
        setTimeout(() => {
          setUserAnswer(prev => prev + (prev ? ' ' : '') + 'I used the STAR method to organize my approach...');
          setIsRecording(false);
        }, 2000);
      } else {
        setTimeout(() => setIsRecording(false), 2000);
      }
    } else {
      setIsRecording(false);
    }
  };

  const chartData = [
    { subject: 'Communication', A: 85, fullMark: 100 },
    { subject: 'Confidence', A: 78, fullMark: 100 },
    { subject: 'Clarity', A: 82, fullMark: 100 },
    { subject: 'Situation', A: 90, fullMark: 100 },
    { subject: 'Task', A: 88, fullMark: 100 },
    { subject: 'Action', A: 85, fullMark: 100 },
    { subject: 'Result', A: 80, fullMark: 100 },
  ];

  return (
    <div className="max-w-6xl mx-auto p-8 font-sans space-y-8">
      <AnimatePresence mode="wait">
        
        {/* SETUP STAGE */}
        {status === 'setup' && (
          <motion.div 
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl shadow-rose-900/5 space-y-8"
          >
            <div className="flex items-center space-x-4 pb-6 border-b border-slate-100">
              <div className="p-4 bg-gradient-to-br from-rose-100 to-orange-50 text-rose-600 rounded-2xl shadow-sm border border-rose-100">
                <Mic className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-slate-900 text-2xl tracking-tight">InterviewAce Setup</h3>
                <p className="text-sm text-slate-500 font-medium mt-1">Configure your mock interview session.</p>
              </div>
            </div>

            {/* Track Selector Cards */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Select Interview Track</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { id: 'HR', icon: <User className="w-5 h-5"/>, label: 'HR & Culture' },
                  { id: 'Technical', icon: <Brain className="w-5 h-5"/>, label: 'Technical' },
                  { id: 'Behavioral', icon: <MessageSquare className="w-5 h-5"/>, label: 'Behavioral' },
                  { id: 'Company Specific', icon: <Briefcase className="w-5 h-5"/>, label: 'Company Specific' }
                ].map(track => (
                  <button
                    key={track.id}
                    onClick={() => setConfig({...config, track: track.id as any})}
                    className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all ${
                      config.track === track.id 
                        ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-md' 
                        : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-rose-200 hover:bg-white'
                    }`}
                  >
                    <div className={`p-3 rounded-full ${config.track === track.id ? 'bg-rose-100' : 'bg-slate-200'}`}>
                      {track.icon}
                    </div>
                    <span className="text-sm font-bold text-center">{track.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Target Role</label>
                <input
                  type="text"
                  value={config.targetRole}
                  onChange={e => setConfig({ ...config, targetRole: e.target.value })}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:outline-none focus:ring-4 focus:ring-rose-600/10 focus:border-rose-500 text-sm font-bold bg-slate-50 focus:bg-white transition-all"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Target Company</label>
                <input
                  type="text"
                  value={config.targetCompany}
                  onChange={e => setConfig({ ...config, targetCompany: e.target.value })}
                  disabled={config.track !== 'Company Specific'}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:outline-none focus:ring-4 focus:ring-rose-600/10 focus:border-rose-500 text-sm font-bold bg-slate-50 focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder={config.track !== 'Company Specific' ? 'Select Company Specific track' : 'e.g. Google, Amazon'}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Experience Level</label>
                <div className="flex space-x-4">
                  {['Fresher', 'Junior', 'Senior'].map(lvl => (
                    <label key={lvl} className="flex items-center space-x-2 cursor-pointer group">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${config.experienceLevel === lvl ? 'border-rose-500' : 'border-slate-300 group-hover:border-rose-400'}`}>
                        {config.experienceLevel === lvl && <div className="w-2.5 h-2.5 bg-rose-500 rounded-full" />}
                      </div>
                      <span className="text-sm font-bold text-slate-700">{lvl}</span>
                      <input type="radio" className="hidden" checked={config.experienceLevel === lvl} onChange={() => setConfig({...config, experienceLevel: lvl as any})} />
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Time per Question</label>
                  <span className="text-sm font-bold text-rose-600">{config.timePerQuestion}s</span>
                </div>
                <input 
                  type="range" 
                  min="30" max="180" step="30"
                  value={config.timePerQuestion}
                  onChange={(e) => setConfig({...config, timePerQuestion: parseInt(e.target.value)})}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={startInterview}
                className="w-full py-5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-bold text-lg shadow-xl shadow-rose-600/20 transition-all flex items-center justify-center space-x-3 transform hover:-translate-y-1"
              >
                <Play className="w-6 h-6 fill-current" />
                <span>Start Interview Session</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* ACTIVE INTERVIEW STAGE */}
        {status === 'active' && (
          <motion.div 
            key="active"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm">
                  Question <span className="text-slate-900">{currentQuestionIndex + 1}</span> of {questions.length}
                </div>
                <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-sm flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  <span>Live {config.track} Track</span>
                </span>
              </div>
              <button onClick={() => setStatus('setup')} className="text-slate-400 hover:text-slate-600 font-medium text-sm transition-colors">Abort Session</button>
            </div>

            {/* Question Area */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl shadow-slate-200/50 space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-rose-50 to-transparent rounded-bl-full pointer-events-none" />
              
              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-start space-x-5 max-w-3xl">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center flex-shrink-0 shadow-lg border-2 border-white">
                    <User className="w-6 h-6 text-slate-200" />
                  </div>
                  <div className="space-y-3 pt-1">
                    <span className="text-xs font-bold text-rose-600 uppercase tracking-widest bg-rose-50 px-2 py-1 rounded">Interviewer</span>
                    <h3 className="text-2xl font-display font-bold text-slate-800 leading-snug">
                      {questions[currentQuestionIndex]}
                    </h3>
                  </div>
                </div>
                {!currentTurnResult && (
                  <div className="flex-shrink-0">
                    <CircularTimer timeLeft={timeLeft} maxTime={config.timePerQuestion} />
                  </div>
                )}
              </div>

              {!currentTurnResult ? (
                <div className="space-y-4 relative z-10">
                  <div className="relative group">
                    <textarea
                      rows={6}
                      value={userAnswer}
                      onChange={e => setUserAnswer(e.target.value)}
                      placeholder="Draft your response using the STAR method..."
                      className="w-full p-6 pb-16 rounded-2xl border-2 border-slate-100 focus:outline-none focus:ring-4 focus:ring-rose-600/10 focus:border-rose-500 text-base text-slate-700 leading-relaxed font-medium bg-slate-50 focus:bg-white transition-all resize-none shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={toggleRecording}
                      className={`absolute right-4 bottom-4 p-4 rounded-xl transition-all shadow-md flex items-center space-x-2 ${
                        isRecording 
                          ? 'bg-rose-600 text-white animate-pulse shadow-rose-600/30' 
                          : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-rose-600 border border-slate-200'
                      }`}
                    >
                      {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={!userAnswer.trim() || isLoading}
                      className="px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-base shadow-lg shadow-slate-900/20 transition-all flex items-center space-x-3 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /><span>Evaluating...</span></>
                      ) : (
                        <><span>Submit Answer</span><Send className="w-4 h-4" /></>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6 pt-6 border-t border-slate-100 relative z-10"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-display font-extrabold text-slate-900 text-xl">STAR Evaluation Results</h4>
                    <div className="flex items-center space-x-2 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-200">
                      <Target className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-bold text-emerald-700">Confidence: {currentTurnResult.confidenceScore}%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <MiniGauge score={currentTurnResult.starEvaluation.situationScore} label="Situation" color="text-blue-500" />
                    <MiniGauge score={currentTurnResult.starEvaluation.taskScore} label="Task" color="text-indigo-500" />
                    <MiniGauge score={currentTurnResult.starEvaluation.actionScore} label="Action" color="text-purple-500" />
                    <MiniGauge score={currentTurnResult.starEvaluation.resultScore} label="Result" color="text-rose-500" />
                  </div>

                  <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-50 to-white border border-slate-200 shadow-sm">
                    <div className="flex items-center space-x-2 mb-3">
                      <Brain className="w-5 h-5 text-rose-600" />
                      <span className="font-bold text-slate-800">AI Coach Feedback</span>
                    </div>
                    <p className="text-sm font-medium text-slate-600 leading-relaxed">
                      {currentTurnResult.starEvaluation.feedback}
                    </p>
                  </div>

                  <div className="border border-slate-200 rounded-2xl overflow-hidden">
                    <button 
                      onClick={() => setShowModelAnswer(!showModelAnswer)}
                      className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                      <span className="font-bold text-sm text-slate-700 flex items-center space-x-2">
                        <Award className="w-4 h-4 text-amber-500" />
                        <span>View Model Answer</span>
                      </span>
                      {showModelAnswer ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                    </button>
                    <AnimatePresence>
                      {showModelAnswer && (
                        <motion.div 
                          initial={{ height: 0 }} 
                          animate={{ height: 'auto' }} 
                          exit={{ height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-6 bg-white text-sm text-slate-600 leading-relaxed italic border-t border-slate-100">
                            "{currentTurnResult.modelAnswer}"
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={nextQuestion}
                      className="px-8 py-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-base shadow-lg shadow-rose-600/20 transition-all flex items-center space-x-2"
                    >
                      <span>{currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Complete Interview'}</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* COMPLETED STAGE */}
        {status === 'completed' && (
          <motion.div 
            key="completed"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            <div className="bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden text-center">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <div className="relative z-10 flex flex-col items-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-rose-500/20 border border-rose-400/30 flex items-center justify-center mb-2">
                  <Award className="w-10 h-10 text-rose-300" />
                </div>
                <h2 className="text-4xl font-display font-extrabold">Interview Completed</h2>
                <p className="text-rose-200 text-lg font-medium max-w-xl">
                  Great job! You've completed the {config.track} mock interview for {config.targetCompany}. Here is your detailed performance breakdown.
                </p>
                <div className="inline-block mt-4 px-6 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
                  <span className="text-sm font-bold uppercase tracking-wider text-rose-200">Overall Score</span>
                  <span className="ml-3 text-2xl font-black text-white">84%</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 flex flex-col items-center">
                <h3 className="font-display font-bold text-slate-800 text-xl mb-6">Performance Radar</h3>
                <div className="w-full h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                      <Radar name="Score" dataKey="A" stroke="#e11d48" fill="#e11d48" fillOpacity={0.3} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 space-y-6">
                <h3 className="font-display font-bold text-slate-800 text-xl flex items-center space-x-2">
                  <Brain className="w-6 h-6 text-rose-600" />
                  <span>AI Coach Recommendations</span>
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start space-x-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" />
                    <div>
                      <span className="block font-bold text-slate-800 text-sm">Strong Situational Context</span>
                      <span className="text-xs text-slate-500 font-medium">You consistently set the stage well before describing your actions.</span>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3 p-4 rounded-xl bg-amber-50 border border-amber-100">
                    <Target className="w-5 h-5 text-amber-500 mt-0.5" />
                    <div>
                      <span className="block font-bold text-amber-900 text-sm">Quantify Results More</span>
                      <span className="text-xs text-amber-700 font-medium">Try to include more numbers (e.g. percentages, dollars, time saved) in the Result phase.</span>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <span className="block font-bold text-slate-800 text-sm">Pacing & Timing</span>
                      <span className="text-xs text-slate-500 font-medium">Your answers averaged 45 seconds, which is a great sweet spot for behavioral questions.</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex justify-center pt-8">
              <button
                onClick={() => setStatus('setup')}
                className="px-8 py-4 rounded-xl bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-base shadow-sm transition-all flex items-center space-x-2"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Start New Session</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
