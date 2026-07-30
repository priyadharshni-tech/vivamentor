import { 
    VivaReport, 
    InterviewSession, 
    ActivityEntry,
    ResumeAnalysis,
    ResearchAnalysis,
    CodeAnalysis
} from '../types/agent';

const KEYS = {
  VIVA_REPORTS: 'vivamentor_viva_reports',
  RESUME_ANALYSIS: 'vivamentor_resume_analysis',
  RESEARCH_SAVED: 'vivamentor_research_saved',
  CODE_HISTORY: 'vivamentor_code_history',
  INTERVIEW_SESSIONS: 'vivamentor_interview_sessions',
  API_KEY: 'vivamentor_api_key',
  ACTIVITIES: 'vivamentor_activities'
};

export const StorageService = {
  // Viva Reports
  getVivaReports: (): VivaReport[] => {
    try {
      const data = localStorage.getItem(KEYS.VIVA_REPORTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },
  saveVivaReport: (report: VivaReport) => {
    const existing = StorageService.getVivaReports();
    const updated = [report, ...existing];
    localStorage.setItem(KEYS.VIVA_REPORTS, JSON.stringify(updated));
  },

  // API Key
  getApiKey: (): string => {
    return localStorage.getItem(KEYS.API_KEY) || '';
  },
  saveApiKey: (key: string) => {
    localStorage.setItem(KEYS.API_KEY, key.trim());
  },

  // Interview Sessions
  getInterviewSessions: (): InterviewSession[] => {
    try {
        const data = localStorage.getItem(KEYS.INTERVIEW_SESSIONS);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
  },
  saveInterviewSession: (session: InterviewSession) => {
      const existing = StorageService.getInterviewSessions();
      // Update if exists, else add
      const index = existing.findIndex(s => s.id === session.id);
      if (index >= 0) {
          existing[index] = session;
      } else {
          existing.unshift(session);
      }
      localStorage.setItem(KEYS.INTERVIEW_SESSIONS, JSON.stringify(existing));
  },

  // Code History
  getCodeHistory: (): CodeAnalysis[] => {
      try {
          const data = localStorage.getItem(KEYS.CODE_HISTORY);
          return data ? JSON.parse(data) : [];
      } catch (e) {
          return [];
      }
  },
  saveCodeHistory: (analysis: CodeAnalysis) => {
      const existing = StorageService.getCodeHistory();
      localStorage.setItem(KEYS.CODE_HISTORY, JSON.stringify([analysis, ...existing]));
  },

  // Resume Analysis
  getResumeAnalyses: (): ResumeAnalysis[] => {
      try {
          const data = localStorage.getItem(KEYS.RESUME_ANALYSIS);
          return data ? JSON.parse(data) : [];
      } catch (e) {
          return [];
      }
  },
  saveResumeAnalysis: (analysis: ResumeAnalysis) => {
      const existing = StorageService.getResumeAnalyses();
      localStorage.setItem(KEYS.RESUME_ANALYSIS, JSON.stringify([analysis, ...existing]));
  },

  // Research Saved
  getResearchSaved: (): ResearchAnalysis[] => {
      try {
          const data = localStorage.getItem(KEYS.RESEARCH_SAVED);
          return data ? JSON.parse(data) : [];
      } catch (e) {
          return [];
      }
  },
  saveResearchSaved: (analysis: ResearchAnalysis) => {
      const existing = StorageService.getResearchSaved();
      localStorage.setItem(KEYS.RESEARCH_SAVED, JSON.stringify([analysis, ...existing]));
  },

  // Activity Tracking
  getActivities: (): ActivityEntry[] => {
      try {
          const data = localStorage.getItem(KEYS.ACTIVITIES);
          return data ? JSON.parse(data) : [];
      } catch (e) {
          return [];
      }
  },
  addActivity: (entry: Omit<ActivityEntry, 'id' | 'timestamp'>) => {
      const existing = StorageService.getActivities();
      const newEntry: ActivityEntry = {
          ...entry,
          id: Date.now().toString(),
          timestamp: new Date().toISOString()
      };
      // Keep only last 50 activities to save space
      const updated = [newEntry, ...existing].slice(0, 50);
      localStorage.setItem(KEYS.ACTIVITIES, JSON.stringify(updated));
  }
};
