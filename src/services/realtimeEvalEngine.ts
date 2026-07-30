/**
 * Real-Time Evidence Engine
 * ─────────────────────────
 * Extracts verifiable metrics from a raw speech transcript with ZERO fake values.
 *
 * Rules:
 *  - Every returned value is derived directly from the transcript text or timing data.
 *  - If there is not enough data, hasSufficientData = false and scores stay null.
 *  - No Math.random(), no hardcoded percentages, no placeholder values.
 */

import { LiveEvidenceMetrics, FillerWordHit } from '../types/agent';

// ─── Constants ────────────────────────────────────────────────────────────────

/** Minimum words before we consider data sufficient for any scoring */
export const MIN_WORDS_FOR_SCORING = 20;

/** Filler words with exact multi-word phrases first (order matters) */
const FILLER_PATTERNS: string[] = [
  'you know what',
  'you know',
  'i mean',
  'kind of',
  'sort of',
  'so yeah',
  'i guess',
  'like i said',
  'basically',
  'actually',
  'literally',
  'obviously',
  'honestly',
  'right so',
  'um',
  'uh',
  'hmm',
  'er',
  'like',
];

/** Strong confidence-indicating phrases */
const CONFIDENCE_PHRASES: string[] = [
  'i am confident',
  "i'm confident",
  'i know',
  'definitely',
  'absolutely',
  'certainly',
  'i have experience',
  'i have worked',
  'i have built',
  'i have implemented',
  'for example',
  'specifically',
  'in my experience',
  'we achieved',
  'we implemented',
];

/** Hedging phrases that reduce perceived confidence */
const HEDGING_PHRASES: string[] = [
  "i'm not sure",
  'i think maybe',
  'i guess',
  'i suppose',
  'probably',
  'i might be wrong',
  'not totally sure',
  'sort of',
  'kind of',
  'i believe but',
  'if i recall correctly',
  'something like that',
  'along those lines',
];

/**
 * Broad technical vocabulary pool.
 * These are deliberately not domain-locked; the AI layer does semantic analysis.
 * This layer only checks surface presence.
 */
const TECH_TERMS: string[] = [
  // Core CS
  'algorithm', 'data structure', 'complexity', 'recursion', 'iteration',
  'stack', 'queue', 'tree', 'graph', 'hash', 'linked list', 'binary',
  // OOP
  'polymorphism', 'inheritance', 'encapsulation', 'abstraction', 'interface',
  'class', 'object', 'method', 'constructor', 'overriding', 'overloading',
  // Web
  'react', 'angular', 'vue', 'node', 'express', 'rest', 'graphql', 'api',
  'http', 'https', 'websocket', 'json', 'xml', 'cors', 'jwt', 'oauth',
  // Databases
  'sql', 'nosql', 'mongodb', 'postgresql', 'mysql', 'redis', 'query',
  'index', 'transaction', 'acid', 'join', 'foreign key', 'normalization',
  // Systems
  'microservice', 'monolith', 'docker', 'kubernetes', 'ci/cd', 'devops',
  'load balancer', 'cache', 'caching', 'cdn', 'latency', 'throughput',
  // Concurrency
  'thread', 'process', 'async', 'await', 'promise', 'callback', 'event loop',
  'mutex', 'semaphore', 'deadlock', 'race condition', 'concurrent',
  // Languages
  'python', 'java', 'javascript', 'typescript', 'golang', 'rust', 'c++',
  // Design Patterns
  'singleton', 'factory', 'observer', 'decorator', 'strategy', 'mvc', 'mvvm',
  'design pattern', 'solid principle', 'dry principle',
  // Complexity
  'o(n)', 'o(log n)', 'o(1)', 'o(n^2)', 'time complexity', 'space complexity',
  'big o', 'linear', 'logarithmic', 'constant time',
  // Soft markers
  'architecture', 'scalable', 'maintainable', 'optimized', 'refactor',
  'unit test', 'integration test', 'tdd', 'agile', 'scrum',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Count exact occurrences of `phrase` (word-boundary aware) in `text` */
function countPhraseOccurrences(text: string, phrase: string): number {
  if (!phrase) return 0;
  // Use word boundaries only if phrase is a single word
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const boundary = phrase.includes(' ') ? '' : '\\b';
  const re = new RegExp(`${boundary}${escaped}${boundary}`, 'gi');
  return (text.match(re) || []).length;
}

/** Split a transcript into approximate sentences */
function splitSentences(text: string): string[] {
  return text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 4);
}

/** Detect consecutive repeated words (stutter / nervous repetition) */
function detectRepeatingWords(text: string): string[] {
  const words = text.toLowerCase().split(/\s+/);
  const repeats: Set<string> = new Set();
  for (let i = 0; i < words.length - 1; i++) {
    if (words[i].length > 2 && words[i] === words[i + 1]) {
      repeats.add(words[i]);
    }
  }
  return Array.from(repeats);
}

/** Count words (non-empty tokens) */
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

// ─── Main Export ─────────────────────────────────────────────────────────────

/**
 * Extract all evidence metrics from a live transcript.
 *
 * @param transcript        The accumulated speech-to-text transcript so far
 * @param recordingStartMs  `Date.now()` when recording began (for real WPM)
 * @param pauseEventCount   How many times VAD fired `onspeechend` (from state machine)
 */
export function extractEvidenceMetrics(
  transcript: string,
  recordingStartMs: number,
  pauseEventCount: number,
): LiveEvidenceMetrics {
  const clean = transcript.trim();
  const lower = clean.toLowerCase();
  const wordCount = countWords(clean);
  const elapsedMs = Date.now() - recordingStartMs;
  const elapsedSeconds = Math.max(1, Math.round(elapsedMs / 1000));

  // Real WPM: only meaningful after 5 seconds of speaking
  const wordsPerMinute: number | null =
    elapsedSeconds >= 5 && wordCount > 0
      ? Math.round((wordCount / elapsedMs) * 60000)
      : null;

  // ── Filler words ──────────────────────────────────────────────────────────
  const fillerWords: FillerWordHit[] = [];
  let processedText = lower;

  // Scan multi-word fillers first (avoid double counting)
  for (const pattern of FILLER_PATTERNS) {
    const cnt = countPhraseOccurrences(processedText, pattern);
    if (cnt > 0) {
      fillerWords.push({ word: pattern, count: cnt });
      // Replace to avoid re-counting as part of other patterns
      processedText = processedText.split(pattern).join(' '.repeat(pattern.length));
    }
  }
  const totalFillerCount = fillerWords.reduce((s, f) => s + f.count, 0);

  // ── Technical terms ───────────────────────────────────────────────────────
  const technicalTermsFound: string[] = [];
  for (const term of TECH_TERMS) {
    if (lower.includes(term)) {
      technicalTermsFound.push(term);
    }
  }

  // ── Sentences ─────────────────────────────────────────────────────────────
  const sentences = splitSentences(clean);
  const sentenceCount = sentences.length;

  // ── Confidence indicators ─────────────────────────────────────────────────
  const confidenceIndicators = CONFIDENCE_PHRASES.filter(p => lower.includes(p));
  const hedgingPhrases = HEDGING_PHRASES.filter(p => lower.includes(p));

  // ── Repeating words ───────────────────────────────────────────────────────
  const repeatingWords = detectRepeatingWords(clean);

  return {
    hasSufficientData: wordCount >= MIN_WORDS_FOR_SCORING,
    minWordsRequired: MIN_WORDS_FOR_SCORING,
    wordCount,
    wordsPerMinute,
    fillerWords,
    totalFillerCount,
    technicalTermsFound,
    sentenceCount,
    pauseEventCount,
    confidenceIndicators,
    hedgingPhrases,
    repeatingWords,
    elapsedSeconds,
    transcriptSnippet: clean.slice(0, 120) + (clean.length > 120 ? '…' : ''),
  };
}

/**
 * Build a human-readable AI status string based on current state.
 */
export function buildAIStatusMessage(
  wordCount: number,
  isAnalyzing: boolean,
  lastEvalWordCount: number | null,
): string {
  if (wordCount === 0) return 'Waiting for speech...';
  if (wordCount < MIN_WORDS_FOR_SCORING) {
    return `Collecting evidence... (${wordCount}/${MIN_WORDS_FOR_SCORING} words)`;
  }
  if (isAnalyzing) return `Analyzing ${wordCount} words with Gemini AI...`;
  if (lastEvalWordCount !== null) {
    return `Evidence-based evaluation complete (${lastEvalWordCount} words analyzed)`;
  }
  return `Ready to evaluate (${wordCount} words)`;
}

/**
 * Returns a safe "—" label for metrics that truly have no data yet.
 * Use this instead of any hardcoded number.
 */
export function noDataLabel(): null {
  return null;
}
