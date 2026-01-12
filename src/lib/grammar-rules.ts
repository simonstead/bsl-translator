/**
 * BSL Grammar Rules
 *
 * BSL uses different word order than English:
 * 1. Topic-Comment structure (topic first, then comment)
 * 2. Time expressions at the start
 * 3. Question words (wh-) often at the END
 * 4. Spatial/directional verbs (simplified for MVP)
 */

import { QuestionType, extractWhWord } from './tokenizer';

// Time-related words that should go first
const TIME_WORDS = new Set([
  'yesterday', 'today', 'tomorrow', 'now', 'later', 'soon', 'always', 'never',
  'sometimes', 'often', 'usually', 'morning', 'afternoon', 'evening', 'night',
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
  'week', 'month', 'year', 'before', 'after', 'already', 'still', 'yet',
  'last', 'next', 'ago', 'past', 'future', 'recently', 'early', 'late',
]);

// WH-question words
const WH_WORDS = new Set(['what', 'where', 'when', 'why', 'who', 'whom', 'whose', 'which', 'how']);

// Pronouns (subjects)
const PRONOUNS = new Set(['i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them']);

// Common verbs
const VERBS = new Set([
  'want', 'need', 'like', 'love', 'hate', 'have', 'go', 'come', 'see', 'know',
  'think', 'feel', 'make', 'take', 'give', 'get', 'find', 'tell', 'ask', 'work',
  'try', 'leave', 'call', 'keep', 'let', 'begin', 'seem', 'help', 'show', 'hear',
  'play', 'run', 'move', 'live', 'believe', 'bring', 'write', 'sit', 'stand',
  'lose', 'pay', 'meet', 'learn', 'change', 'lead', 'understand', 'watch', 'follow',
  'stop', 'create', 'speak', 'read', 'spend', 'grow', 'open', 'walk', 'win',
  'offer', 'remember', 'consider', 'appear', 'buy', 'wait', 'serve', 'die', 'send',
  'expect', 'build', 'stay', 'fall', 'cut', 'reach', 'kill', 'remain', 'eat',
  'drink', 'sleep', 'wake', 'look', 'say', 'talk', 'finish', 'start', 'use',
]);

export interface GrammarContext {
  isQuestion: boolean;
  questionType: QuestionType;
  originalSentence: string;
}

/**
 * Apply BSL word order rules to a list of glosses
 *
 * Rules applied:
 * 1. Time words first
 * 2. For wh-questions: move question word to end
 * 3. Topic-comment: object before verb (simplified)
 */
export function applyBSLWordOrder(glosses: string[], context: GrammarContext): string[] {
  if (glosses.length === 0) return [];

  const result: string[] = [];
  const timeWords: string[] = [];
  const whWords: string[] = [];
  const subjects: string[] = [];
  const verbs: string[] = [];
  const objects: string[] = [];
  const others: string[] = [];

  // Categorize each gloss
  for (const gloss of glosses) {
    const lower = gloss.toLowerCase();

    if (TIME_WORDS.has(lower)) {
      timeWords.push(gloss);
    } else if (WH_WORDS.has(lower)) {
      whWords.push(gloss);
    } else if (PRONOUNS.has(lower)) {
      subjects.push(gloss);
    } else if (VERBS.has(lower)) {
      verbs.push(gloss);
    } else {
      // Assume nouns/objects
      objects.push(gloss);
    }
  }

  // Build BSL order

  // 1. Time words first
  result.push(...timeWords);

  // 2. For wh-questions, we'll add the wh-word at the end
  // For yes/no questions, order is similar but with raised eyebrows (non-manual marker)

  if (context.questionType === 'wh') {
    // BSL order for wh-questions: TOPIC SUBJECT VERB WH-WORD
    // "What is your name?" -> NAME YOU WHAT
    // "Where do you live?" -> YOU LIVE WHERE

    result.push(...objects);  // Topic/object first
    result.push(...subjects); // Subject
    result.push(...verbs);    // Verb
    result.push(...others);   // Any remaining
    result.push(...whWords);  // WH-word at END
  } else {
    // Statement or yes/no question
    // BSL order: TIME TOPIC SUBJECT VERB
    // "Do you want coffee?" -> COFFEE YOU WANT
    // "I want coffee" -> COFFEE I WANT

    result.push(...objects);  // Topic/object first
    result.push(...subjects); // Subject
    result.push(...verbs);    // Verb
    result.push(...others);   // Any remaining
    result.push(...whWords);  // Include any wh-words (shouldn't be many for non-wh)
  }

  // Convert to uppercase (BSL gloss convention)
  return result.map(g => g.toUpperCase());
}

/**
 * Simple topic-comment reordering
 * In BSL, the topic (what you're talking about) often comes first
 */
export function reorderTopicComment(glosses: string[]): string[] {
  // This is a simplified version
  // A more sophisticated version would use POS tagging

  // Find first noun-like word (not pronoun, not verb, not time)
  const pronounIdx = glosses.findIndex(g => PRONOUNS.has(g.toLowerCase()));
  const verbIdx = glosses.findIndex(g => VERBS.has(g.toLowerCase()));

  // If we have pronoun...verb...noun pattern, move noun to front
  if (pronounIdx !== -1 && verbIdx !== -1 && verbIdx > pronounIdx) {
    const afterVerb = glosses.slice(verbIdx + 1);
    const nouns = afterVerb.filter(g =>
      !PRONOUNS.has(g.toLowerCase()) &&
      !VERBS.has(g.toLowerCase()) &&
      !TIME_WORDS.has(g.toLowerCase())
    );

    if (nouns.length > 0) {
      // Move nouns to front
      const others = glosses.filter(g => !nouns.includes(g));
      return [...nouns, ...others];
    }
  }

  return glosses;
}

/**
 * Get a human-readable explanation of the BSL order
 */
export function explainBSLOrder(context: GrammarContext): string {
  if (context.questionType === 'wh') {
    return 'In BSL wh-questions, the question word (what, where, etc.) goes at the END.';
  } else if (context.questionType === 'yes-no') {
    return 'In BSL yes/no questions, the word order is similar but facial expressions (raised eyebrows) indicate it\'s a question.';
  } else {
    return 'BSL uses topic-comment order: what you\'re talking about (topic) comes first, then the comment about it.';
  }
}
