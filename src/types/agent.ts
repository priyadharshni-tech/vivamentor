export type AgentId = 
  | 'vivamentor'
  | 'conceptguru'
  | 'codedoctor'
  | 'resumecraft'
  | 'interviewace'
  | 'researchpilot'
  | 'supervisor';

export interface AgentMetadata {
  id: AgentId;
  name: string;
  badgeTitle: string;
  tagline: string;
  icon: string;
  color: string;
  accentBg: string;
  description: string;
}

// VivaMentor Types
export interface VivaConfig {
  department: string;
  semester: string;
  subject: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  numQuestions: number;
  language: string;
}

export interface VivaQuestion {
  id: number;
  question: string;
  contextHint: string;
  expectedKeywords: string[];
}

export interface VivaEvaluation {
  questionId: number;
  questionText: string;
  userAnswer: string;
  score: number;
  correctness: number;
  communication: number;
  confidence: number;
  strengths: string[];
  weaknesses: string[];
  followUpQuestion?: string;
  modelAnswer: string;
}

export interface VivaReport {
  id: string;
  timestamp: string;
  config: VivaConfig;
  totalScore: number;
  maxScore: number;
  percentage: number;
  evaluations: VivaEvaluation[];
  overallFeedback: string;
  improvementTips: string[];
}

// ConceptGuru Types
export interface ConceptDiagramNode {
  id: string;
  label: string;
  description: string;
  type: 'start' | 'process' | 'decision' | 'end';
  connectedTo?: string[];
}

export interface ConceptExplanation {
  topic: string;
  difficulty: string;
  analogy: string;
  simpleExplanation: string;
  technicalDetails: string;
  nodes: ConceptDiagramNode[];
  codeExample: {
    language: string;
    code: string;
    explanation: string;
  };
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
  interviewQuestions: string[];
  commonMisconceptions: string[];
}

// CodeDoctor Types
export interface BugReport {
  line: number;
  severity: 'error' | 'warning' | 'optimization';
  issue: string;
  explanation: string;
  fix: string;
}

export interface CodeAnalysis {
  language: string;
  originalCode: string;
  improvedCode: string;
  bugs: BugReport[];
  timeComplexity: {
    original: string;
    optimized: string;
    explanation: string;
  };
  spaceComplexity: {
    original: string;
    optimized: string;
    explanation: string;
  };
  lineByLineExplanation: { line: number; code: string; explanation: string }[];
  summary: string;
}

// ResumeCraft Types
export interface BulletPointRewrite {
  original: string;
  improved: string;
  impactScore: number;
  actionVerbsAdded: string[];
  reason: string;
}

export interface ResumeAnalysis {
  targetRole: string;
  atsScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  formattingScore: number;
  impactScore: number;
  grammarScore: number;
  rewrittenBullets: BulletPointRewrite[];
  summarySuggestion: string;
  recommendedCertifications: string[];
  topFixes: string[];
  recommendedSkills: string[];
}

// InterviewAce Types
export interface InterviewConfig {
  track: 'HR' | 'Technical' | 'Behavioral' | 'Company Specific';
  targetCompany?: string;
  targetRole: string;
  experienceLevel: 'Fresher' | 'Junior' | 'Senior';
}

export interface STAREval {
  situationScore: number;
  taskScore: number;
  actionScore: number;
  resultScore: number;
  feedback: string;
}

export interface InterviewTurn {
  id: number;
  question: string;
  category: string;
  userAnswer: string;
  confidenceScore: number;
  communicationScore: number;
  clarityScore: number;
  starEvaluation: STAREval;
  modelAnswer: string;
  suggestions: string[];
}

export interface InterviewSession {
  id: string;
  config: InterviewConfig;
  questions: { question: string; category: string }[];
  turns: InterviewTurn[];
  currentTurnIndex: number;
  totalQuestions: number;
  status: 'setup' | 'active' | 'completed';
  startedAt: string;
  timePerQuestion: number; // seconds
}

// ResearchPilot Types
export interface LiteratureItem {
  id: string;
  title: string;
  authors: string;
  year: number;
  methodology: string;
  limitations: string;
  keyResults: string;
}

export interface ResearchAnalysis {
  topic: string;
  domain: string;
  novelIdeas: string[];
  summary: string;
  literatureSurvey: LiteratureItem[];
  researchGaps: string[];
  projectRoadmap: { phase: string; duration: string; milestone: string; deliverables: string }[];
  citations: {
    ieee: string;
    apa: string;
    bibtex: string;
    mla: string;
  };
}

// Supervisor Multi-Agent Workflow
export type MultiAgentWorkflowType = 'java_prep' | 'placement_readiness' | 'final_project';

export interface WorkflowStep {
  agentId: AgentId;
  agentName: string;
  status: 'pending' | 'active' | 'completed';
  outputTitle: string;
  summary: string;
  data?: any;
}

export interface MultiAgentOrchestration {
  workflowId: string;
  title: string;
  description: string;
  currentStepIndex: number;
  steps: WorkflowStep[];
  finalSynthesizedReport?: {
    overallScore: number;
    statusBadge: string;
    executiveSummary: string;
    agentHighlights: { agentName: string; keyTakeaway: string }[];
    actionItems: string[];
  };
}

// Activity tracking
export interface ActivityEntry {
  id: string;
  agentId: AgentId;
  agentName: string;
  action: string;
  timestamp: string;
  score?: number;
}
