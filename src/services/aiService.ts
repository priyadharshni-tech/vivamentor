import { 
  VivaConfig, VivaQuestion, VivaEvaluation,
  ConceptExplanation, CodeAnalysis, BugReport,
  ResumeAnalysis, InterviewConfig, InterviewTurn,
  ResearchAnalysis, MultiAgentOrchestration
} from '../types/agent';
import { DEMO_CONCEPT_GRAPH, DEMO_CODE_DOCTOR_SAMPLES, DEMO_INTERVIEW_QUESTIONS, DEMO_RESEARCH_TOPICS } from '../data/demoData';

export const AIService = {
  // 🎓 Agent 1: VivaMentor Question Generation & Evaluation
  generateVivaQuestions: async (config: VivaConfig): Promise<VivaQuestion[]> => {
    // Artificial slight delay for streaming experience
    await new Promise(r => setTimeout(r, 600));

    const topic = config.topic || config.subject || 'Computer Science';
    const numQuestions = config.numQuestions || 3;
    const questions: VivaQuestion[] = [];
    
    for (let i = 1; i <= numQuestions; i++) {
        let questionText = '';
        let hint = '';
        let keywords: string[] = [];

        if (i % 3 === 1) {
            questionText = `Explain the fundamental concept of ${topic} and how it operates in real-world application architecture.`;
            hint = 'Focus on core principles, memory/execution model, and key benefits.';
            keywords = ['architecture', 'execution', 'performance', 'efficiency'];
        } else if (i % 3 === 2) {
            questionText = `What are the trade-offs or limitations associated with using ${topic} under heavy load or edge cases?`;
            hint = 'Discuss time/space complexity, resource overhead, or deadlock scenarios.';
            keywords = ['trade-off', 'overhead', 'scalability', 'complexity'];
        } else {
            questionText = `How would you debug or resolve an unexpected exception or failure when implementing ${topic}?`;
            hint = 'Mention logging, diagnostic tools, stack traces, and mitigation strategies.';
            keywords = ['debugging', 'stack trace', 'mitigation', 'isolation'];
        }

        questions.push({
            id: i,
            question: questionText,
            contextHint: hint,
            expectedKeywords: keywords
        });
    }

    return questions;
  },

  evaluateVivaAnswer: async (
    question: VivaQuestion, 
    userAnswer: string,
    difficulty: string
  ): Promise<VivaEvaluation> => {
    await new Promise(r => setTimeout(r, 800));

    const wordCount = userAnswer.trim().split(/\s+/).length;
    const isDetailed = wordCount > 15;
    
    const correctness = isDetailed ? Math.floor(Math.random() * 2) + 8 : Math.floor(Math.random() * 3) + 5;
    const communication = isDetailed ? 9 : 6;
    const confidence = isDetailed ? 8 : 5;
    const score = Math.round((correctness * 0.5) + (communication * 0.3) + (confidence * 0.2));

    const improvementTips = isDetailed 
      ? ['Consider adding more real-world examples to solidify your explanation.', 'Try to use more precise technical vocabulary for edge cases.']
      : ['Expand on your points with more details.', 'Mention specific keywords like ' + question.expectedKeywords.join(', ') + '.'];

    return {
      questionId: question.id,
      questionText: question.question,
      userAnswer,
      score,
      correctness,
      communication,
      confidence,
      strengths: isDetailed 
        ? ['Demonstrated clear understanding of core concepts', 'Articulated key terminology accurately', 'Good structural flow'] 
        : ['Basic grasp of topic presented', 'Direct response to prompt'],
      weaknesses: isDetailed
        ? ['Could elaborate further on edge-case memory bounds', 'Mention specific library classes']
        : ['Response was brief', 'Missing specific technical terms like heap allocation & time complexity'],
      followUpQuestion: isDetailed 
        ? `Building on your point: Can you specify how the underlying runtime handles thread synchronization during this process?` 
        : `Could you elaborate on the basic principles you mentioned and give an example?`,
      modelAnswer: `A comprehensive answer should cover: 1) Core definition and purpose of ${question.question.substring(0, 30)}..., 2) Execution mechanics in memory, 3) Performance implications, and 4) Industry best practices.`
    };
  },

  // 💡 Agent 2: ConceptGuru Engine
  explainConcept: async (topic: string, difficulty: string): Promise<ConceptExplanation> => {
    await new Promise(r => setTimeout(r, 700));

    const key = topic.toLowerCase().trim();
    
    // Check if the exact concept exists in our demo graph
    if (DEMO_CONCEPT_GRAPH[key]) {
      return DEMO_CONCEPT_GRAPH[key];
    }
    
    // Check if a partial match exists
    const matchingKey = Object.keys(DEMO_CONCEPT_GRAPH).find(k => key.includes(k) || k.includes(key));
    if (matchingKey) {
        return DEMO_CONCEPT_GRAPH[matchingKey];
    }

    // Fallback generator
    return {
      topic: topic || 'Data Structures & Algorithms',
      difficulty: difficulty || 'Intermediate',
      analogy: `Think of ${topic} like a highly organized library automated sorting system. Books (data elements) arrive continuously, and the system uses dedicated indexing rules to categorize, locate, and retrieve any book in O(1) or O(log N) operations without searching every single shelf manually.`,
      simpleExplanation: `${topic} is a fundamental engineering concept designed to organize, process, and optimize data handling in software applications efficiently.`,
      technicalDetails: `At the low-level architecture, ${topic} manages pointer references, memory layouts, and algorithmic traversal logic to achieve optimal time and space execution constraints.`,
      nodes: [
        { id: '1', label: `Initialize ${topic}`, description: 'Setup base configuration and memory allocation.', type: 'start', connectedTo: ['2'] },
        { id: '2', label: 'Validate Input & Bounds', description: 'Ensure parameters satisfy pre-conditions and safety checks.', type: 'decision', connectedTo: ['3', '4'] },
        { id: '3', label: 'Execute Core Logic', description: 'Process data with primary algorithmic state transitions.', type: 'process' },
        { id: '4', label: 'Return Result / Reclaim State', description: 'Emit output payload and clean up transient resources.', type: 'end' }
      ],
      codeExample: {
        language: 'typescript',
        code: `// ${topic} Implementation Example\nclass ${topic.replace(/\\s+/g, '')}Handler {\n  private items: string[] = [];\n\n  public process(data: string): boolean {\n    if (!data) return false;\n    this.items.push(data);\n    console.log("Processed:", data);\n    return true;\n  }\n}`,
        explanation: `This snippet demonstrates how ${topic} manages internal state cleanly and handles incoming request streams.`
      },
      quiz: [
        {
          question: `What is the primary advantage of using ${topic}?`,
          options: [
            'Dramatically improves retrieval time and structural efficiency',
            'Increases disk space consumption',
            'Requires manual assembly code',
            'Disables thread safety'
          ],
          correctIndex: 0,
          explanation: `The core purpose of ${topic} is optimizing time/space trade-offs for robust application performance.`
        }
      ],
      interviewQuestions: [
        `How would you scale ${topic} for high-throughput distributed systems?`,
        `What are the space complexity trade-offs of ${topic}?`
      ],
      commonMisconceptions: [
        `Students often confuse ${topic}'s average-case runtime with worst-case performance under hash collisions.`
      ]
    };
  },

  // 💻 Agent 3: CodeDoctor Engine
  analyzeCode: async (code: string, language: string): Promise<CodeAnalysis> => {
    await new Promise(r => setTimeout(r, 900));

    const langLower = language.toLowerCase();
    
    // If the code matches one of our demo samples exactly, or we just want to return a rich sample based on language
    let originalCode = code;
    let improvedCode = code;
    let bugs: BugReport[] = [];
    
    if (langLower === 'java') {
        originalCode = DEMO_CODE_DOCTOR_SAMPLES.java;
        improvedCode = `public class ArraySearch {\n    public static int findTarget(int[] nums, int target) {\n        if (nums == null) return -1;\n        for (int i = 0; i < nums.length; i++) {\n            if (nums[i] == target) {\n                return i;\n            }\n        }\n        return -1;\n    }\n}`;
        bugs = [{ line: 3, severity: 'error', issue: 'Array Index Out of Bounds', explanation: 'Condition i <= nums.length causes out of bounds when i == nums.length.', fix: 'Change <= to <' }];
    } else if (langLower === 'python') {
        originalCode = DEMO_CODE_DOCTOR_SAMPLES.python;
        improvedCode = `def calculate_average(scores: list[float]) -> float:\n    if not scores:\n        return 0.0\n    return sum(scores) / len(scores)`;
        bugs = [{ line: 5, severity: 'error', issue: 'Division by Zero', explanation: 'If scores is empty, len(scores) is 0.', fix: 'Add early return for empty list.' }];
    } else if (langLower === 'javascript' || langLower === 'typescript') {
        originalCode = DEMO_CODE_DOCTOR_SAMPLES.javascript;
        improvedCode = `async function fetchUserData(userId) {\n    try {\n        const response = await fetch('/api/users/' + userId);\n        const user = await response.json();\n        console.log(user.name);\n        return user;\n    } catch (e) {\n        console.error(e);\n        return null;\n    }\n}`;
        bugs = [{ line: 2, severity: 'error', issue: 'Missing await', explanation: 'fetch returns a Promise, not the result.', fix: 'Add await keyword.' }];
    } else if (langLower === 'cpp' || langLower === 'c++') {
        originalCode = DEMO_CODE_DOCTOR_SAMPLES.cpp;
        improvedCode = `void printArray(int* arr, int size) {\n    for(int i=0; i<size; i++) {\n        cout << arr[i] << endl;\n    }\n}`;
        bugs = [{ line: 2, severity: 'error', issue: 'sizeof on pointer', explanation: 'sizeof(arr) returns size of pointer (e.g., 8 bytes), not the array size.', fix: 'Pass array size as a parameter.' }];
    } else if (langLower === 'c') {
        originalCode = DEMO_CODE_DOCTOR_SAMPLES.c;
        improvedCode = `#include <stdio.h>\n#include <string.h>\nint main() {\n    char buffer[50];\n    strncpy(buffer, "This string is way too long for the buffer", sizeof(buffer) - 1);\n    buffer[sizeof(buffer)-1] = '\\0';\n    printf("%s", buffer);\n    return 0;\n}`;
        bugs = [{ line: 5, severity: 'error', issue: 'Buffer Overflow', explanation: 'strcpy does not check buffer bounds.', fix: 'Use strncpy and increase buffer size.' }];
    } else {
        originalCode = code;
        improvedCode = `// Refactored\n${code}`;
        bugs = [{ line: 1, severity: 'optimization', issue: 'General Optimization', explanation: 'Consider adding type hints and better variable names.', fix: 'Refactor names and types.' }];
    }

    return {
      language,
      originalCode: originalCode,
      improvedCode: improvedCode,
      bugs,
      timeComplexity: {
        original: 'O(N)',
        optimized: 'O(N) or better',
        explanation: 'Traverses input collection once linearly. Optimized version reduces constant factors.'
      },
      spaceComplexity: {
        original: 'O(1)',
        optimized: 'O(1)',
        explanation: 'Uses constant auxiliary memory variables.'
      },
      lineByLineExplanation: [
        { line: 1, code: improvedCode.split('\\n')[0] || '', explanation: 'Declares function entry point with safe parameters.' },
        { line: 2, code: improvedCode.split('\\n')[1] || '', explanation: 'Handles edge cases and prevents exceptions.' }
      ],
      summary: `CodeDoctor found ${bugs.length} critical issues. Refactored version handles errors safely and improves performance.`
    };
  },

  // 📄 Agent 4: ResumeCraft ATS Scorer & Bullet Rewriter
  analyzeResume: async (resumeText: string, targetRole: string): Promise<ResumeAnalysis> => {
    await new Promise(r => setTimeout(r, 1000));

    const role = targetRole || 'Software Engineer';

    return {
      targetRole: role,
      atsScore: Math.floor(Math.random() * 20) + 70, // 70-90 range
      matchedKeywords: ['React', 'TypeScript', 'Node.js', 'REST APIs', 'Git', 'SQL', 'Agile', 'CI/CD'],
      missingKeywords: ['Docker', 'Kubernetes', 'GraphQL', 'System Design', 'Redis', 'Unit Testing'],
      formattingScore: 90,
      impactScore: 78,
      grammarScore: 95,
      rewrittenBullets: [
        {
          original: 'Worked on building frontend features using React for college website.',
          improved: 'Architected and deployed 6 responsive React components, reducing page load time by 35% for 5,000+ monthly active users.',
          impactScore: 45,
          actionVerbsAdded: ['Architected', 'Deployed', 'Reduced'],
          reason: 'Transformed passive responsibility into quantifiable metric with strong action verbs.'
        },
        {
          original: 'Responsible for writing database queries in MySQL.',
          improved: 'Optimized complex SQL join queries & added database indexes, decreasing API response latency from 450ms to 120ms.',
          impactScore: 40,
          actionVerbsAdded: ['Optimized', 'Decreased'],
          reason: 'Replaced "Responsible for" with impact metrics (450ms to 120ms).'
        }
      ],
      summarySuggestion: `Dynamic Engineer proficient in modern architectures. Proven track record of reducing latency by 35% and delivering robust solutions. Seeking to leverage skills in ${role} roles.`,
      recommendedCertifications: ['AWS Certified Developer Associate', 'MetaData Engineering Professional Cert'],
      topFixes: [
        'Add quantitative impact metrics (% improvement, user count, latency ms) to project section.',
        'Incorporate missing ATS keywords: Docker, Redis, and Unit Testing.',
        'Replace passive phrasing ("worked on", "assisted with") with proactive technical verbs.'
      ],
      recommendedSkills: ['Cloud Deployment', 'Microservices', 'Test Driven Development', 'NoSQL']
    };
  },

  // 🎤 Agent 5: InterviewAce Simulator & STAR Evaluator
  generateInterviewQuestions: async (config: InterviewConfig): Promise<{question: string, category: string}[]> => {
      await new Promise(r => setTimeout(r, 500));
      const track = config.track;
      
      if (DEMO_INTERVIEW_QUESTIONS[track]) {
          return DEMO_INTERVIEW_QUESTIONS[track];
      }
      return DEMO_INTERVIEW_QUESTIONS['Technical']; // Fallback
  },

  evaluateInterviewTurn: async (
    question: string,
    userAnswer: string,
    config: InterviewConfig
  ): Promise<InterviewTurn> => {
    await new Promise(r => setTimeout(r, 800));

    const length = userAnswer.length;
    const isDetailed = length > 120;
    const isVeryDetailed = length > 250;

    return {
      id: Date.now(),
      question,
      category: config.track,
      userAnswer,
      confidenceScore: isVeryDetailed ? 95 : (isDetailed ? 88 : 65),
      communicationScore: isVeryDetailed ? 96 : (isDetailed ? 92 : 70),
      clarityScore: isVeryDetailed ? 94 : (isDetailed ? 90 : 68),
      starEvaluation: {
        situationScore: isDetailed ? 90 : 60,
        taskScore: isDetailed ? 85 : 65,
        actionScore: isDetailed ? 95 : 70,
        resultScore: isDetailed ? 88 : 50,
        feedback: isDetailed 
          ? 'Excellent structure! Clear breakdown of Situation, Task, Action, and measurable Result metrics.' 
          : 'Good start. To elevate to top 5% candidate quality, explicitly state the quantitative Result of your action.'
      },
      modelAnswer: `An ideal response uses STAR: 1) Situation: "In my 3rd year project...", 2) Task: "I was assigned to resolve database bottlenecks...", 3) Action: "I implemented Redis caching and query indexing...", 4) Result: "This reduced query time by 60% and secured 1st prize in project expo."`,
      suggestions: isDetailed 
          ? ['Your STAR format is great. Try to add one more metric about business impact.', 'Maintain good eye contact if on video.']
          : ['Use specific percentages or time savings in the Result section.', 'Maintain a steady pace and clear pause between STAR transitions.']
    };
  },

  // 📚 Agent 6: ResearchPilot Assistant
  analyzeResearchTopic: async (topic: string, domain: string): Promise<ResearchAnalysis> => {
    await new Promise(r => setTimeout(r, 1000));

    const t = topic.toLowerCase().trim();
    
    // Check demo data first
    const match = Object.keys(DEMO_RESEARCH_TOPICS).find(k => t.includes(k));
    if (match) {
        return DEMO_RESEARCH_TOPICS[match];
    }

    return {
      topic: topic || 'Multi-Agent Autonomous AI Systems in Education',
      domain: domain || 'Artificial Intelligence',
      summary: `Research into ${topic} focuses on leveraging new methodologies to improve efficiency and capability in ${domain}.`,
      novelIdeas: [
        'Dynamic Agent Consensus Mechanism for Real-Time Execution',
        'Adaptive Scaling using Knowledge Graph Embeddings',
        'Multi-Modal Feedback Loops'
      ],
      literatureSurvey: [
        {
          id: 'lit-1',
          title: `Advancements in ${domain}`,
          authors: 'Smith, J., et al.',
          year: 2024,
          methodology: 'Empirical analysis',
          limitations: 'Context limits',
          keyResults: 'Achieved 42% higher accuracy.'
        }
      ],
      researchGaps: [
        'Lack of real-time synchronization in low-bandwidth environments.',
        'Limited evaluation benchmarks.'
      ],
      projectRoadmap: [
        { phase: 'Phase 1: Literature Survey', duration: '2 Weeks', milestone: 'Survey Matrix Approved', deliverables: 'Problem Statement' },
        { phase: 'Phase 2: System Architecture', duration: '3 Weeks', milestone: 'Architecture Built', deliverables: 'API Pipeline' },
        { phase: 'Phase 3: Prototype Evaluation', duration: '3 Weeks', milestone: 'User Study Completed', deliverables: 'Metrics Report' }
      ],
      citations: {
        ieee: `[1] J. Smith et al., "Advancements in ${domain}," IEEE Trans., 2024.`,
        apa: `Smith, J., et al. (2024). Advancements in ${domain}. IEEE.`,
        bibtex: `@article{smith2024, title={Advancements in ${domain}}, author={Smith, J.}, year={2024} }`,
        mla: `Smith, J., et al. "Advancements in ${domain}." IEEE, 2024.`
      }
    };
  },

  // 🤖 Multi-Agent Orchestration (Supervisor Mode)
  runMultiAgentWorkflow: async (workflowType: 'java_prep' | 'placement_readiness' | 'final_project'): Promise<MultiAgentOrchestration> => {
    await new Promise(r => setTimeout(r, 1200)); // slightly longer delay for full orchestration simulation

    if (workflowType === 'java_prep') {
      return {
        workflowId: 'wf-java-101',
        title: 'Java Interview & Viva Mastery Pipeline',
        description: 'Automated 5-agent sequential preparation pipeline for Java technical roles.',
        currentStepIndex: 0,
        steps: [
          { agentId: 'vivamentor', agentName: 'VivaMentor (Supervisor)', status: 'active', outputTitle: 'Initialization', summary: 'Orchestrating Java Technical Preparation Roadmap with personalized learning path.' },
          { agentId: 'conceptguru', agentName: 'ConceptGuru', status: 'pending', outputTitle: 'Java Memory Model', summary: 'Explaining JVM Heap, Stack, and Garbage Collection with interactive diagrams.' },
          { agentId: 'codedoctor', agentName: 'CodeDoctor', status: 'pending', outputTitle: 'Java Code Audit', summary: 'Analyzing Array & Exception Handling Code Snippets for NullPointerExceptions.' },
          { agentId: 'interviewace', agentName: 'InterviewAce', status: 'pending', outputTitle: 'Java HR & Tech Round', summary: 'Simulating Java Technical Interview Questions on Spring Boot & Core Java.' },
          { agentId: 'resumecraft', agentName: 'ResumeCraft', status: 'pending', outputTitle: 'Java Keyword Tuning', summary: 'Injecting Java, Spring Boot, and JVM terms into resume and checking ATS score.' }
        ],
        finalSynthesizedReport: {
          overallScore: 92,
          statusBadge: 'JAVA INTERVIEW READY (Top 5%)',
          executiveSummary: 'Student demonstrates deep understanding of JVM Garbage collection, error handling, and STAR interview delivery.',
          agentHighlights: [
            { agentName: 'ConceptGuru', keyTakeaway: 'Mastered JVM Eden vs Tenured space memory allocation.' },
            { agentName: 'CodeDoctor', keyTakeaway: 'Fixed array index out of bounds bug & optimized O(N) loop.' },
            { agentName: 'InterviewAce', keyTakeaway: 'Achieved 88% STAR response clarity score.' },
            { agentName: 'ResumeCraft', keyTakeaway: 'Enhanced resume ATS score from 72% to 91% for Java Developer roles.' }
          ],
          actionItems: [
            'Review G1 Garbage Collector vs ZGC differences before tier-1 company rounds.',
            'Mock test multi-threading deadlock questions.'
          ]
        }
      };
    } else if (workflowType === 'placement_readiness') {
      return {
        workflowId: 'wf-placement-202',
        title: 'Complete Campus Placement Readiness Workflow',
        description: 'Comprehensive evaluation spanning resume ATS, mock interview, concept mastery, code audit, and viva.',
        currentStepIndex: 0,
        steps: [
          { agentId: 'resumecraft', agentName: 'ResumeCraft', status: 'active', outputTitle: 'ATS Audit', summary: 'Evaluating resume keywords and action verbs for target engineering roles.' },
          { agentId: 'interviewace', agentName: 'InterviewAce', status: 'pending', outputTitle: 'Interview Simulation', summary: 'Simulating technical + HR company rounds focusing on behavioral questions.' },
          { agentId: 'conceptguru', agentName: 'ConceptGuru', status: 'pending', outputTitle: 'Core CS Refresh', summary: 'Verifying Operating Systems, Networks & DBMS understanding.' },
          { agentId: 'codedoctor', agentName: 'CodeDoctor', status: 'pending', outputTitle: 'Coding Test Audit', summary: 'Reviewing data structures code efficiency and algorithmic complexity.' },
          { agentId: 'vivamentor', agentName: 'VivaMentor (Supervisor)', status: 'pending', outputTitle: 'Final Readiness Score', summary: 'Synthesizing placement readiness report card with actionable steps.' }
        ],
        finalSynthesizedReport: {
          overallScore: 89,
          statusBadge: 'PLACEMENT READY',
          executiveSummary: 'Comprehensive multi-agent diagnostic completed. Candidate is highly competitive for Product & Service company campus drives.',
          agentHighlights: [
            { agentName: 'ResumeCraft', keyTakeaway: 'ATS Keyword Match: 88% for SDE-1 role.' },
            { agentName: 'InterviewAce', keyTakeaway: 'Behavioral STAR score: 85%.' },
            { agentName: 'ConceptGuru', keyTakeaway: 'Strong grasp of ACID properties & OS Process Scheduling.' },
            { agentName: 'CodeDoctor', keyTakeaway: 'Clean code score: 94% with safe boundary validation.' }
          ],
          actionItems: [
            'Practice 3 additional dynamic programming questions.',
            'Refine 60-second self-introduction pitch for HR round.'
          ]
        }
      };
    } else {
      return {
        workflowId: 'wf-project-303',
        title: 'Final Year Research & Major Project Workflow',
        description: 'End-to-end guidance from research paper survey to prototype code refactoring and project presentation.',
        currentStepIndex: 0,
        steps: [
          { agentId: 'researchpilot', agentName: 'ResearchPilot', status: 'active', outputTitle: 'Literature Survey', summary: 'Gathering IEEE paper matrix, summarizing methodology & identifying research gaps.' },
          { agentId: 'conceptguru', agentName: 'ConceptGuru', status: 'pending', outputTitle: 'Architecture Design', summary: 'Visualizing multi-tier system flowchart, DB schema & state machine.' },
          { agentId: 'codedoctor', agentName: 'CodeDoctor', status: 'pending', outputTitle: 'Project Code Audit', summary: 'Refactoring prototype codebase for production efficiency and security.' },
          { agentId: 'resumecraft', agentName: 'ResumeCraft', status: 'pending', outputTitle: 'Project Portfolio Bullet', summary: 'Adding major project metrics and technologies to student resume.' },
          { agentId: 'vivamentor', agentName: 'VivaMentor (Supervisor)', status: 'pending', outputTitle: 'Project Defense Viva', summary: 'Simulating final year project external examiner viva with aggressive Q&A.' }
        ],
        finalSynthesizedReport: {
          overallScore: 95,
          statusBadge: 'EXCELLENT DEFENSE PREPARED',
          executiveSummary: 'Project artifacts, literature survey matrix, optimized codebase, and defense presentation are fully aligned.',
          agentHighlights: [
            { agentName: 'ResearchPilot', keyTakeaway: 'Extracted 5 IEEE paper citations & identified novel agent consensus gap.' },
            { agentName: 'ConceptGuru', keyTakeaway: 'Generated interactive system architecture diagram.' },
            { agentName: 'CodeDoctor', keyTakeaway: 'Refactored backend code complexity from O(N^2) to O(N log N).' },
            { agentName: 'VivaMentor', keyTakeaway: 'Scored 9.5/10 in mock external project viva defense.' }
          ],
          actionItems: [
            'Print IEEE format paper copy for project external guide signature.',
            'Finalize live working prototype demo setup.'
          ]
        }
      };
    }
  }
};
