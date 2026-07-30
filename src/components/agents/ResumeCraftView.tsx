import React, { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Upload, Target, Loader2, CheckCircle2, PlusCircle, 
  ArrowRight, Award, TrendingUp, Star, BookOpen, Shield, Sparkles, XCircle 
} from 'lucide-react';
import { ResumeAnalysis } from '../../types/agent';
import { AIService } from '../../services/aiService';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const CircularGauge = ({ score }: { score: number }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  const colorClass = score < 50 ? 'text-rose-500' : score < 75 ? 'text-amber-500' : 'text-emerald-500';

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle 
          cx="50" cy="50" r={radius} 
          className="stroke-current text-white/20" 
          strokeWidth="8" fill="transparent" 
        />
        <circle 
          cx="50" cy="50" r={radius} 
          className={`stroke-current ${colorClass}`} 
          strokeWidth="8" fill="transparent" 
          strokeDasharray={circumference} 
          strokeDashoffset={strokeDashoffset} 
          strokeLinecap="round" 
          style={{ transition: 'stroke-dashoffset 1s ease-in-out' }} 
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span className="text-xl font-extrabold text-white">{score}%</span>
      </div>
    </div>
  );
};

export const ResumeCraftView: React.FC = () => {
  const [resumeText, setResumeText] = useState(
    'Full Stack Computer Science Student. Worked on building frontend features using React for college website. Responsible for writing database queries in MySQL. Assisted team with Git version control.'
  );
  const [targetRole, setTargetRole] = useState('Full Stack Software Engineer');
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (e) => {
        setResumeText(e.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (e) => {
        setResumeText(e.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const handleAnalyzeResume = async () => {
    if (!resumeText.trim() || isLoading) return;
    setIsLoading(true);
    try {
      const res = await AIService.analyzeResume(resumeText, targetRole);
      setAnalysis(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8 font-sans space-y-8">
      {/* Input Resume Area */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl shadow-purple-900/5 space-y-8">
        <div className="flex items-center space-x-4 pb-6 border-b border-slate-100">
          <div className="p-4 bg-gradient-to-br from-purple-100 to-indigo-50 text-purple-700 rounded-2xl shadow-sm border border-purple-100">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-display font-extrabold text-slate-900 text-2xl tracking-tight">ResumeCraft ATS Optimizer</h3>
            <p className="text-sm text-slate-500 font-medium mt-1">AI-powered resume enhancement and ATS keyword matching.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Target Position</label>
            <div className="relative">
              <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
                placeholder="e.g. Senior Frontend Developer"
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 focus:outline-none focus:ring-4 focus:ring-purple-600/10 focus:border-purple-600 text-sm font-semibold transition-all bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleAnalyzeResume}
              disabled={isLoading || !resumeText.trim()}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm shadow-xl shadow-purple-600/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Auditing ATS Match...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Analyze & Optimize Resume</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Drag and Drop Zone */}
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
              isDragging ? 'border-purple-500 bg-purple-50/50' : 'border-slate-200 hover:border-purple-400 hover:bg-slate-50'
            }`}
          >
            <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
              <Upload className="w-8 h-8" />
            </div>
            <p className="text-sm font-bold text-slate-700 mb-1">Click or drag plain text file to upload</p>
            <p className="text-xs text-slate-500 font-medium">Supports .txt files only</p>
            <input 
              type="file" 
              accept=".txt" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileChange}
            />
          </div>

          {/* Text area paste */}
          <div>
            <textarea
              rows={8}
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
              placeholder="Or paste your resume work experience bullets and technical skills here..."
              className="w-full p-6 rounded-3xl border-2 border-slate-100 focus:outline-none focus:ring-4 focus:ring-purple-600/10 focus:border-purple-600 text-sm text-slate-700 leading-relaxed font-medium transition-all bg-slate-50 focus:bg-white resize-none"
            />
          </div>
        </div>
      </div>

      {/* Analysis Output Dashboard */}
      {analysis && (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          {/* Top ATS Score Scorecard Banner */}
          <motion.div variants={itemVariants} className="bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-8 md:p-10 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-purple-500/20 blur-3xl rounded-full"></div>
            
            <div className="space-y-4 z-10 relative w-full md:w-auto text-center md:text-left mb-8 md:mb-0">
              <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-bold bg-white/10 text-purple-200 border border-white/10 backdrop-blur-md">
                <Target className="w-4 h-4" />
                <span>ATS Compatibility Report</span>
              </div>
              <h2 className="text-3xl font-display font-extrabold tracking-tight">Role: {analysis.targetRole}</h2>
              <p className="text-sm text-purple-200 max-w-lg font-medium leading-relaxed">
                Your resume scored an overall <span className="font-bold text-white">{analysis.atsScore}%</span> against ATS screening systems for this specific role. Incorporate the missing keywords below to aim for >90%.
              </p>
            </div>

            {/* Visual ATS Score Gauge & Sub-scores */}
            <div className="z-10 relative flex items-center space-x-6 md:space-x-8 bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-xl">
              <div className="flex flex-col items-center">
                <CircularGauge score={analysis.atsScore} />
                <div className="text-[10px] uppercase tracking-widest text-purple-200 mt-3 font-bold opacity-80">Overall Match</div>
              </div>
              
              <div className="hidden md:flex flex-col space-y-4 border-l border-white/10 pl-8">
                <div className="flex items-center justify-between w-32">
                  <span className="text-xs font-medium text-purple-200">Formatting</span>
                  <span className="text-sm font-bold text-emerald-400">92%</span>
                </div>
                <div className="flex items-center justify-between w-32">
                  <span className="text-xs font-medium text-purple-200">Impact</span>
                  <span className="text-sm font-bold text-amber-400">74%</span>
                </div>
                <div className="flex items-center justify-between w-32">
                  <span className="text-xs font-medium text-purple-200">Grammar</span>
                  <span className="text-sm font-bold text-emerald-400">98%</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Keyword Match Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matched Keywords */}
            <motion.div variants={itemVariants} className="bg-white rounded-3xl p-8 border border-slate-200/60 shadow-lg shadow-emerald-900/5 space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-3 text-emerald-700 font-bold">
                  <div className="p-2 bg-emerald-100 rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="text-lg tracking-tight">Matched Keywords ({analysis.matchedKeywords.length})</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {analysis.matchedKeywords.map((kw, i) => (
                  <span key={i} className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 shadow-sm">
                    ✓ {kw}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Missing Keywords */}
            <motion.div variants={itemVariants} className="bg-white rounded-3xl p-8 border border-slate-200/60 shadow-lg shadow-rose-900/5 space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-3 text-rose-700 font-bold">
                  <div className="p-2 bg-rose-100 rounded-xl">
                    <PlusCircle className="w-5 h-5 text-rose-600" />
                  </div>
                  <span className="text-lg tracking-tight">Missing Keywords ({analysis.missingKeywords.length})</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {analysis.missingKeywords.map((kw, i) => (
                  <span key={i} className="group relative px-3.5 py-1.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200 shadow-sm cursor-help transition-all hover:bg-rose-100">
                    + {kw}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                      Add to improve score
                    </div>
                  </span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Additional Features: Summary & Skills */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div variants={itemVariants} className="md:col-span-2 bg-white rounded-3xl p-8 border border-slate-200/60 shadow-lg shadow-slate-200/50 space-y-5">
              <div className="flex items-center space-x-3 text-slate-800 font-bold pb-4 border-b border-slate-100">
                <BookOpen className="w-5 h-5 text-purple-600" />
                <span className="text-lg tracking-tight">AI Generated Professional Summary</span>
              </div>
              <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 text-sm text-slate-700 leading-relaxed font-medium relative">
                <div className="absolute top-4 left-4 text-purple-200 opacity-50">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
                </div>
                <div className="relative z-10 pl-6 pt-2">
                  {analysis.summarySuggestion}
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white rounded-3xl p-8 border border-slate-200/60 shadow-lg shadow-slate-200/50 space-y-5">
              <div className="flex items-center space-x-3 text-slate-800 font-bold pb-4 border-b border-slate-100">
                <Shield className="w-5 h-5 text-purple-600" />
                <span className="text-lg tracking-tight">Suggested Certifications</span>
              </div>
              <ul className="space-y-3">
                {[
                  "AWS Certified Solutions Architect",
                  "Google Cloud Professional",
                  "Certified Kubernetes Administrator"
                ].map((cert, i) => (
                  <li key={i} className="flex items-start space-x-3 text-sm font-medium text-slate-600">
                    <Award className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span>{cert}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Bullet Point Rewriter Section */}
          <motion.div variants={itemVariants} className="bg-white rounded-3xl p-8 border border-slate-200/60 shadow-lg shadow-slate-200/50 space-y-8">
            <div className="flex items-center space-x-4 pb-6 border-b border-slate-100">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-slate-900 text-xl tracking-tight">AI Impact Bullet Rewriter</h3>
                <p className="text-sm text-slate-500 font-medium mt-1">Transform weak descriptions into metric-driven statements.</p>
              </div>
            </div>

            <div className="space-y-6">
              {analysis.rewrittenBullets.map((bullet, idx) => (
                <div key={idx} className="group relative p-6 rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all space-y-5">
                  {/* Original */}
                  <div className="flex items-start space-x-4 opacity-60 group-hover:opacity-100 transition-opacity">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <XCircle className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Original Version</div>
                      <p className="text-sm text-slate-600 line-through decoration-slate-300">"{bullet.original}"</p>
                    </div>
                  </div>

                  {/* Improved */}
                  <div className="flex items-start space-x-4 bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-1 shadow-inner">
                      <CheckCircle2 className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[10px] font-bold text-purple-500 uppercase tracking-widest mb-1">AI Improved Version</div>
                      <p className="text-sm font-bold text-slate-800 leading-relaxed">
                        "{bullet.improved}"
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-3 mt-4">
                        <div className="flex items-center space-x-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Action Verbs:</span>
                          {bullet.actionVerbsAdded.map((v, i) => (
                            <span key={i} className="px-2 py-1 rounded bg-white border border-slate-200 text-slate-600 text-[10px] font-bold shadow-sm">{v}</span>
                          ))}
                        </div>
                        <div className="flex-1"></div>
                        <span className="flex items-center space-x-1 text-emerald-700 font-bold bg-emerald-100 px-3 py-1.5 rounded-full text-xs shadow-sm border border-emerald-200">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>+{bullet.impactScore}% Impact</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};
