import {
  VivaConfig, VivaQuestion, VivaEvaluation,
  ConceptExplanation, CodeAnalysis,
  ResumeAnalysis, InterviewConfig, InterviewTurn,
  ResearchAnalysis, MultiAgentOrchestration
} from '../types/agent';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

async function callGemini(prompt: string): Promise<string> {
  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
    })
  });
  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

function parseJSON<T>(text: string): T {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/) || text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  const raw = match ? match[1].trim() : text.trim();
  return JSON.parse(raw);
}

export const AIService = {

  // 🎓 Agent 1: VivaMentor
  generateVivaQuestions: async (config: VivaConfig): Promise<VivaQuestion[]> => {
    const prompt = `You are a strict university viva examiner for ${config.department}, Semester ${config.semester}.
Subject: ${config.subject}, Topic: ${config.topic}, Difficulty: ${config.difficulty}.
Generate exactly ${config.numQuestions} viva questions. Return ONLY a JSON array:
[{"id":1,"question":"...","contextHint":"...","expectedKeywords":["kw1","kw2","kw3"]}]
Questions must be specific to the topic, progressively harder, and academically rigorous.`;
    const text = await callGemini(prompt);
    return parseJSON<VivaQuestion[]>(text);
  },

  evaluateVivaAnswer: async (
    question: VivaQuestion,
    userAnswer: string,
    difficulty: string
  ): Promise<VivaEvaluation> => {
    const prompt = `You are a strict university viva examiner. Evaluate this student answer.

Question: ${question.question}
Expected Keywords: ${question.expectedKeywords.join(', ')}
Difficulty: ${difficulty}
Student Answer: "${userAnswer}"

Score strictly based on technical accuracy, completeness, and use of correct terminology.
Return ONLY this JSON (no markdown):
{
  "questionId": ${question.id},
  "questionText": "${question.question.replace(/"/g, "'")}",
  "userAnswer": "${userAnswer.replace(/"/g, "'")}",
  "score": <1-10>,
  "correctness": <1-10>,
  "communication": <1-10>,
  "confidence": <1-10>,
  "strengths": ["...","..."],
  "weaknesses": ["...","..."],
  "followUpQuestion": "...",
  "modelAnswer": "A comprehensive model answer covering all key aspects..."
}`;
    const text = await callGemini(prompt);
    return parseJSON<VivaEvaluation>(text);
  },

  // 💡 Agent 2: ConceptGuru
  explainConcept: async (topic: string, difficulty: string): Promise<ConceptExplanation> => {
    const prompt = `You are ConceptGuru, an expert CS educator. Explain "${topic}" at ${difficulty} level.
Return ONLY this JSON (no markdown):
{
  "topic": "${topic}",
  "difficulty": "${difficulty}",
  "analogy": "A vivid real-world analogy...",
  "simpleExplanation": "Clear 2-3 sentence explanation...",
  "technicalDetails": "In-depth technical explanation with internals...",
  "nodes": [
    {"id":"1","label":"Step Name","description":"What happens here","type":"start","connectedTo":["2"]},
    {"id":"2","label":"Step Name","description":"What happens here","type":"process","connectedTo":["3"]},
    {"id":"3","label":"Step Name","description":"What happens here","type":"decision","connectedTo":["4"]},
    {"id":"4","label":"Step Name","description":"What happens here","type":"end"}
  ],
  "codeExample": {
    "language": "python",
    "code": "# working code example with comments",
    "explanation": "Line by line walkthrough..."
  },
  "quiz": [
    {"question":"...","options":["A","B","C","D"],"correctIndex":0,"explanation":"Why A is correct..."},
    {"question":"...","options":["A","B","C","D"],"correctIndex":2,"explanation":"Why C is correct..."},
    {"question":"...","options":["A","B","C","D"],"correctIndex":1,"explanation":"Why B is correct..."}
  ],
  "interviewQuestions": ["Q1?","Q2?","Q3?","Q4?","Q5?"],
  "commonMisconceptions": ["Misconception 1...","Misconception 2...","Misconception 3..."]
}`;
    const text = await callGemini(prompt);
    return parseJSON<ConceptExplanation>(text);
  },

  // 💻 Agent 3: CodeDoctor
  analyzeCode: async (code: string, language: string): Promise<CodeAnalysis> => {
    const prompt = `You are CodeDoctor, an expert code reviewer. Analyze this ${language} code:

\`\`\`${language}
${code}
\`\`\`

Find ALL bugs, security issues, and optimization opportunities. Return ONLY this JSON:
{
  "language": "${language}",
  "originalCode": ${JSON.stringify(code)},
  "improvedCode": "fully corrected and optimized version of the code",
  "bugs": [
    {"line": 1, "severity": "error", "issue": "Bug name", "explanation": "Why it's a bug", "fix": "How to fix it"}
  ],
  "timeComplexity": {"original": "O(?)", "optimized": "O(?)", "explanation": "..."},
  "spaceComplexity": {"original": "O(?)", "optimized": "O(?)", "explanation": "..."},
  "lineByLineExplanation": [
    {"line": 1, "code": "line content", "explanation": "what this line does"}
  ],
  "summary": "Overall summary of issues found and improvements made."
}`;
    const text = await callGemini(prompt);
    return parseJSON<CodeAnalysis>(text);
  },

  // 📄 Agent 4: ResumeCraft
  analyzeResume: async (resumeText: string, targetRole: string): Promise<ResumeAnalysis> => {
    const prompt = `You are ResumeCraft, an expert ATS resume analyzer. Analyze this resume for the role: "${targetRole}".

Resume:
${resumeText}

Return ONLY this JSON:
{
  "targetRole": "${targetRole}",
  "atsScore": <realistic 0-100 based on actual keyword match>,
  "matchedKeywords": ["keywords actually found in the resume relevant to ${targetRole}"],
  "missingKeywords": ["important keywords for ${targetRole} missing from resume"],
  "formattingScore": <0-100>,
  "impactScore": <0-100>,
  "grammarScore": <0-100>,
  "rewrittenBullets": [
    {
      "original": "exact bullet from resume",
      "improved": "rewritten with metrics and strong action verbs",
      "impactScore": <improvement percentage>,
      "actionVerbsAdded": ["verb1","verb2"],
      "reason": "why this is better"
    }
  ],
  "summarySuggestion": "A powerful 2-3 sentence professional summary tailored to ${targetRole}",
  "recommendedCertifications": ["cert1","cert2","cert3"],
  "topFixes": ["fix1","fix2","fix3"],
  "recommendedSkills": ["skill1","skill2","skill3","skill4"]
}`;
    const text = await callGemini(prompt);
    return parseJSON<ResumeAnalysis>(text);
  },

  // 🎤 Agent 5: InterviewAce
  generateInterviewQuestions: async (config: InterviewConfig): Promise<{ question: string; category: string }[]> => {
    const prompt = `You are InterviewAce. Generate 8 ${config.track} interview questions for a ${config.experienceLevel} ${config.targetRole}${config.targetCompany ? ` at ${config.targetCompany}` : ''}.
Return ONLY a JSON array:
[{"question":"...","category":"${config.track}"}]
Make questions realistic, specific, and progressively challenging.`;
    const text = await callGemini(prompt);
    return parseJSON<{ question: string; category: string }[]>(text);
  },

  evaluateInterviewTurn: async (
    question: string,
    userAnswer: string,
    config: InterviewConfig
  ): Promise<InterviewTurn> => {
    const prompt = `You are an expert ${config.track} interview coach evaluating a ${config.experienceLevel} candidate for ${config.targetRole}.

Question: "${question}"
Candidate Answer: "${userAnswer}"

Evaluate strictly and honestly using STAR framework where applicable.
Return ONLY this JSON:
{
  "id": ${Date.now()},
  "question": ${JSON.stringify(question)},
  "category": "${config.track}",
  "userAnswer": ${JSON.stringify(userAnswer)},
  "confidenceScore": <0-100 based on answer assertiveness and specificity>,
  "communicationScore": <0-100 based on clarity and structure>,
  "clarityScore": <0-100 based on how clearly the point was made>,
  "starEvaluation": {
    "situationScore": <0-100>,
    "taskScore": <0-100>,
    "actionScore": <0-100>,
    "resultScore": <0-100>,
    "feedback": "Specific feedback on STAR structure..."
  },
  "modelAnswer": "An ideal answer demonstrating STAR format with specific metrics...",
  "suggestions": ["Specific improvement tip 1", "Specific improvement tip 2"]
}`;
    const text = await callGemini(prompt);
    return parseJSON<InterviewTurn>(text);
  },

  // 📚 Agent 6: ResearchPilot
  analyzeResearchTopic: async (topic: string, domain: string): Promise<ResearchAnalysis> => {
    const prompt = `You are ResearchPilot, an academic research assistant. Analyze the research topic: "${topic}" in the domain of "${domain}".

Return ONLY this JSON:
{
  "topic": "${topic}",
  "domain": "${domain}",
  "summary": "Comprehensive 3-4 sentence research overview...",
  "novelIdeas": ["Novel idea 1 for this topic","Novel idea 2","Novel idea 3","Novel idea 4"],
  "literatureSurvey": [
    {"id":"lit-1","title":"Realistic paper title","authors":"Author, A., et al.","year":2023,"methodology":"Method used","limitations":"Key limitation","keyResults":"Key finding with metric"},
    {"id":"lit-2","title":"Realistic paper title","authors":"Author, B., et al.","year":2024,"methodology":"Method used","limitations":"Key limitation","keyResults":"Key finding with metric"},
    {"id":"lit-3","title":"Realistic paper title","authors":"Author, C., et al.","year":2022,"methodology":"Method used","limitations":"Key limitation","keyResults":"Key finding with metric"}
  ],
  "researchGaps": ["Gap 1 in current literature","Gap 2","Gap 3"],
  "projectRoadmap": [
    {"phase":"Phase 1: Literature Survey","duration":"2 Weeks","milestone":"Survey Matrix Approved","deliverables":"Problem Statement & Scope"},
    {"phase":"Phase 2: System Design","duration":"3 Weeks","milestone":"Architecture Finalized","deliverables":"Design Document & API Spec"},
    {"phase":"Phase 3: Implementation","duration":"4 Weeks","milestone":"Prototype Built","deliverables":"Working Codebase"},
    {"phase":"Phase 4: Evaluation","duration":"2 Weeks","milestone":"Results Validated","deliverables":"Metrics Report & Paper Draft"}
  ],
  "citations": {
    "ieee": "[1] Author, A., et al., \\"Paper title,\\" Journal, vol. X, pp. XX-XX, 2024.",
    "apa": "Author, A., et al. (2024). Paper title. Journal.",
    "bibtex": "@article{key2024, title={Paper title}, author={Author, A.}, year={2024}}",
    "mla": "Author, A., et al. \\"Paper title.\\" Journal, 2024."
  }
}`;
    const text = await callGemini(prompt);
    return parseJSON<ResearchAnalysis>(text);
  },

  // 🤖 Supervisor Multi-Agent Workflow (kept as structured data, enhanced with real context)
  runMultiAgentWorkflow: async (workflowType: 'java_prep' | 'placement_readiness' | 'final_project'): Promise<MultiAgentOrchestration> => {
    const prompt = `You are the VivaMentor Supervisor AI orchestrating a multi-agent workflow.
Workflow type: "${workflowType}".

Generate a realistic synthesized report for this workflow. Return ONLY this JSON:
{
  "workflowId": "wf-${workflowType}-${Date.now()}",
  "title": "Descriptive workflow title",
  "description": "What this workflow does in 1-2 sentences",
  "currentStepIndex": 0,
  "steps": [
    {"agentId":"vivamentor","agentName":"VivaMentor","status":"active","outputTitle":"Step title","summary":"What this agent does in this workflow"},
    {"agentId":"conceptguru","agentName":"ConceptGuru","status":"pending","outputTitle":"Step title","summary":"What this agent does"},
    {"agentId":"codedoctor","agentName":"CodeDoctor","status":"pending","outputTitle":"Step title","summary":"What this agent does"},
    {"agentId":"interviewace","agentName":"InterviewAce","status":"pending","outputTitle":"Step title","summary":"What this agent does"},
    {"agentId":"resumecraft","agentName":"ResumeCraft","status":"pending","outputTitle":"Step title","summary":"What this agent does"}
  ],
  "finalSynthesizedReport": {
    "overallScore": <75-98>,
    "statusBadge": "READY / NEEDS WORK / EXCELLENT",
    "executiveSummary": "2-3 sentence summary of the student's readiness...",
    "agentHighlights": [
      {"agentName":"VivaMentor","keyTakeaway":"Specific insight..."},
      {"agentName":"ConceptGuru","keyTakeaway":"Specific insight..."},
      {"agentName":"CodeDoctor","keyTakeaway":"Specific insight..."},
      {"agentName":"InterviewAce","keyTakeaway":"Specific insight..."},
      {"agentName":"ResumeCraft","keyTakeaway":"Specific insight..."}
    ],
    "actionItems": ["Specific action 1","Specific action 2","Specific action 3"]
  }
}`;
    const text = await callGemini(prompt);
    return parseJSON<MultiAgentOrchestration>(text);
  }
};
