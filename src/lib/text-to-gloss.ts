/**
 * Text-to-Gloss Translation
 *
 * Main entry point for converting English text to BSL gloss sequence.
 * Combines tokenization, lemmatization, dictionary lookup, and grammar rules.
 */

import { tokenize, removeStopWords, lemmatize, detectQuestionType, isQuestion } from './tokenizer';
import { applyBSLWordOrder, GrammarContext, explainBSLOrder } from './grammar-rules';
import { wordToGloss, getSignEntry, getSearchUrl, SignEntry } from './gloss-dictionary';

export interface GlossResult {
  gloss: string;
  signEntry: SignEntry | null;
  isUnknown: boolean;
  searchUrl: string;
  originalWord: string;
}

export interface TranslationResult {
  originalSentence: string;
  glossSequence: GlossResult[];
  glossString: string;
  questionType: 'wh' | 'yes-no' | 'none';
  isQuestion: boolean;
  explanation: string;
}

/**
 * Translate English sentence to BSL gloss sequence
 */
export function translateToBSL(sentence: string): TranslationResult {
  // 1. Tokenize and normalize
  const tokens = tokenize(sentence);

  // 2. Detect question type
  const questionType = detectQuestionType(sentence);
  const question = isQuestion(sentence);

  // 3. Remove stop words (articles, auxiliaries)
  const contentWords = removeStopWords(tokens);

  // 4. Lemmatize each word
  const lemmas = contentWords.map(lemmatize);

  // 5. Map words to glosses
  const wordGlossPairs: { word: string; gloss: string }[] = [];
  for (let i = 0; i < lemmas.length; i++) {
    const lemma = lemmas[i];
    const originalWord = contentWords[i];
    const gloss = wordToGloss(lemma);

    if (gloss) {
      wordGlossPairs.push({ word: originalWord, gloss });
    } else {
      // Keep the original word as a fallback (uppercase for gloss convention)
      wordGlossPairs.push({ word: originalWord, gloss: lemma.toUpperCase() });
    }
  }

  // 6. Apply BSL grammar rules (word order)
  const context: GrammarContext = {
    isQuestion: question,
    questionType,
    originalSentence: sentence,
  };

  const glosses = wordGlossPairs.map(p => p.gloss);
  const reorderedGlosses = applyBSLWordOrder(glosses, context);

  // 7. Build result with video sources
  const glossSequence: GlossResult[] = reorderedGlosses.map(gloss => {
    const signEntry = getSignEntry(gloss);
    const originalPair = wordGlossPairs.find(p => p.gloss.toUpperCase() === gloss);
    const originalWord = originalPair?.word || gloss.toLowerCase();

    return {
      gloss,
      signEntry,
      isUnknown: signEntry === null,
      searchUrl: getSearchUrl(gloss.toLowerCase()),
      originalWord,
    };
  });

  return {
    originalSentence: sentence,
    glossSequence,
    glossString: reorderedGlosses.join(' '),
    questionType,
    isQuestion: question,
    explanation: explainBSLOrder(context),
  };
}

/**
 * Quick translation - returns just the gloss string
 */
export function quickTranslate(sentence: string): string {
  const result = translateToBSL(sentence);
  return result.glossString;
}

/**
 * Get stats about the translation
 */
export function getTranslationStats(result: TranslationResult): {
  totalGlosses: number;
  knownGlosses: number;
  unknownGlosses: number;
  coveragePercent: number;
} {
  const total = result.glossSequence.length;
  const known = result.glossSequence.filter(g => !g.isUnknown).length;
  const unknown = total - known;

  return {
    totalGlosses: total,
    knownGlosses: known,
    unknownGlosses: unknown,
    coveragePercent: total > 0 ? Math.round((known / total) * 100) : 100,
  };
}
