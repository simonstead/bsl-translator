/**
 * Tokenizer for English text processing
 * Handles normalization, tokenization, and basic lemmatization
 */

// Words to remove - articles, auxiliaries, copula
const STOP_WORDS = new Set([
  // Articles
  'a', 'an', 'the',
  // Copula (be verbs)
  'is', 'are', 'am', 'was', 'were', 'be', 'been', 'being',
  // Auxiliaries
  'do', 'does', 'did',
  'have', 'has', 'had',
  'will', 'would', 'shall', 'should',
  'can', 'could', 'may', 'might', 'must',
  // Common function words
  'to', 'of',
]);

// Common irregular verb lemmas
const LEMMA_MAP: Record<string, string> = {
  // Be
  'am': 'be', 'is': 'be', 'are': 'be', 'was': 'be', 'were': 'be', 'been': 'be', 'being': 'be',
  // Have
  'has': 'have', 'had': 'have', 'having': 'have',
  // Do
  'does': 'do', 'did': 'do', 'doing': 'do', 'done': 'do',
  // Go
  'goes': 'go', 'went': 'go', 'gone': 'go', 'going': 'go',
  // Common verbs
  'wants': 'want', 'wanted': 'want', 'wanting': 'want',
  'likes': 'like', 'liked': 'like', 'liking': 'like',
  'needs': 'need', 'needed': 'need', 'needing': 'need',
  'drinks': 'drink', 'drank': 'drink', 'drunk': 'drink', 'drinking': 'drink',
  'eats': 'eat', 'ate': 'eat', 'eaten': 'eat', 'eating': 'eat',
  'says': 'say', 'said': 'say', 'saying': 'say',
  'makes': 'make', 'made': 'make', 'making': 'make',
  'gets': 'get', 'got': 'get', 'gotten': 'get', 'getting': 'get',
  'takes': 'take', 'took': 'take', 'taken': 'take', 'taking': 'take',
  'comes': 'come', 'came': 'come', 'coming': 'come',
  'sees': 'see', 'saw': 'see', 'seen': 'see', 'seeing': 'see',
  'knows': 'know', 'knew': 'know', 'known': 'know', 'knowing': 'know',
  'thinks': 'think', 'thought': 'think', 'thinking': 'think',
  'gives': 'give', 'gave': 'give', 'given': 'give', 'giving': 'give',
  'finds': 'find', 'found': 'find', 'finding': 'find',
  'tells': 'tell', 'told': 'tell', 'telling': 'tell',
  'asks': 'ask', 'asked': 'ask', 'asking': 'ask',
  'works': 'work', 'worked': 'work', 'working': 'work',
  'feels': 'feel', 'felt': 'feel', 'feeling': 'feel',
  'tries': 'try', 'tried': 'try', 'trying': 'try',
  'leaves': 'leave', 'left': 'leave', 'leaving': 'leave',
  'calls': 'call', 'called': 'call', 'calling': 'call',
  'keeps': 'keep', 'kept': 'keep', 'keeping': 'keep',
  'lets': 'let', 'letting': 'let',
  'begins': 'begin', 'began': 'begin', 'begun': 'begin', 'beginning': 'begin',
  'seems': 'seem', 'seemed': 'seem', 'seeming': 'seem',
  'helps': 'help', 'helped': 'help', 'helping': 'help',
  'shows': 'show', 'showed': 'show', 'shown': 'show', 'showing': 'show',
  'hears': 'hear', 'heard': 'hear', 'hearing': 'hear',
  'plays': 'play', 'played': 'play', 'playing': 'play',
  'runs': 'run', 'ran': 'run', 'running': 'run',
  'moves': 'move', 'moved': 'move', 'moving': 'move',
  'lives': 'live', 'lived': 'live', 'living': 'live',
  'believes': 'believe', 'believed': 'believe', 'believing': 'believe',
  'brings': 'bring', 'brought': 'bring', 'bringing': 'bring',
  'writes': 'write', 'wrote': 'write', 'written': 'write', 'writing': 'write',
  'sits': 'sit', 'sat': 'sit', 'sitting': 'sit',
  'stands': 'stand', 'stood': 'stand', 'standing': 'stand',
  'loses': 'lose', 'lost': 'lose', 'losing': 'lose',
  'pays': 'pay', 'paid': 'pay', 'paying': 'pay',
  'meets': 'meet', 'met': 'meet', 'meeting': 'meet',
  'includes': 'include', 'included': 'include', 'including': 'include',
  'continues': 'continue', 'continued': 'continue', 'continuing': 'continue',
  'sets': 'set', 'setting': 'set',
  'learns': 'learn', 'learned': 'learn', 'learnt': 'learn', 'learning': 'learn',
  'changes': 'change', 'changed': 'change', 'changing': 'change',
  'leads': 'lead', 'led': 'lead', 'leading': 'lead',
  'understands': 'understand', 'understood': 'understand', 'understanding': 'understand',
  'watches': 'watch', 'watched': 'watch', 'watching': 'watch',
  'follows': 'follow', 'followed': 'follow', 'following': 'follow',
  'stops': 'stop', 'stopped': 'stop', 'stopping': 'stop',
  'creates': 'create', 'created': 'create', 'creating': 'create',
  'speaks': 'speak', 'spoke': 'speak', 'spoken': 'speak', 'speaking': 'speak',
  'reads': 'read', 'reading': 'read',
  'spends': 'spend', 'spent': 'spend', 'spending': 'spend',
  'grows': 'grow', 'grew': 'grow', 'grown': 'grow', 'growing': 'grow',
  'opens': 'open', 'opened': 'open', 'opening': 'open',
  'walks': 'walk', 'walked': 'walk', 'walking': 'walk',
  'wins': 'win', 'won': 'win', 'winning': 'win',
  'offers': 'offer', 'offered': 'offer', 'offering': 'offer',
  'remembers': 'remember', 'remembered': 'remember', 'remembering': 'remember',
  'loves': 'love', 'loved': 'love', 'loving': 'love',
  'considers': 'consider', 'considered': 'consider', 'considering': 'consider',
  'appears': 'appear', 'appeared': 'appear', 'appearing': 'appear',
  'buys': 'buy', 'bought': 'buy', 'buying': 'buy',
  'waits': 'wait', 'waited': 'wait', 'waiting': 'wait',
  'serves': 'serve', 'served': 'serve', 'serving': 'serve',
  'dies': 'die', 'died': 'die', 'dying': 'die',
  'sends': 'send', 'sent': 'send', 'sending': 'send',
  'expects': 'expect', 'expected': 'expect', 'expecting': 'expect',
  'builds': 'build', 'built': 'build', 'building': 'build',
  'stays': 'stay', 'stayed': 'stay', 'staying': 'stay',
  'falls': 'fall', 'fell': 'fall', 'fallen': 'fall', 'falling': 'fall',
  'cuts': 'cut', 'cutting': 'cut',
  'reaches': 'reach', 'reached': 'reach', 'reaching': 'reach',
  'kills': 'kill', 'killed': 'kill', 'killing': 'kill',
  'remains': 'remain', 'remained': 'remain', 'remaining': 'remain',

  // Pronouns - keep as-is but map variants
  "i'm": 'i',
  "you're": 'you',
  "he's": 'he',
  "she's": 'she',
  "it's": 'it',
  "we're": 'we',
  "they're": 'they',

  // Contractions with not
  "don't": 'not',
  "doesn't": 'not',
  "didn't": 'not',
  "won't": 'not',
  "wouldn't": 'not',
  "can't": 'not',
  "couldn't": 'not',
  "shouldn't": 'not',
  "isn't": 'not',
  "aren't": 'not',
  "wasn't": 'not',
  "weren't": 'not',
  "haven't": 'not',
  "hasn't": 'not',
  "hadn't": 'not',
};

// Common noun plurals
const PLURAL_MAP: Record<string, string> = {
  'children': 'child',
  'people': 'person',
  'men': 'man',
  'women': 'woman',
  'feet': 'foot',
  'teeth': 'tooth',
  'mice': 'mouse',
  'geese': 'goose',
};

/**
 * Tokenize a sentence into words
 */
export function tokenize(sentence: string): string[] {
  return sentence
    .toLowerCase()
    .replace(/[^\w\s']/g, ' ') // Remove punctuation except apostrophes
    .split(/\s+/)
    .filter(word => word.length > 0);
}

/**
 * Remove stop words from token list
 */
export function removeStopWords(tokens: string[]): string[] {
  return tokens.filter(token => !STOP_WORDS.has(token));
}

/**
 * Lemmatize a word (reduce to base form)
 */
export function lemmatize(word: string): string {
  // Check explicit lemma map first
  if (LEMMA_MAP[word]) {
    return LEMMA_MAP[word];
  }

  // Check plural map
  if (PLURAL_MAP[word]) {
    return PLURAL_MAP[word];
  }

  // Simple suffix rules for regular forms
  if (word.endsWith('ies') && word.length > 4) {
    return word.slice(0, -3) + 'y'; // carries -> carry
  }
  if (word.endsWith('es') && word.length > 3) {
    // watches -> watch, goes -> go
    const stem = word.slice(0, -2);
    if (stem.endsWith('sh') || stem.endsWith('ch') || stem.endsWith('x') || stem.endsWith('s') || stem.endsWith('z')) {
      return stem;
    }
  }
  if (word.endsWith('ed') && word.length > 3) {
    // walked -> walk, but not 'bed'
    const stem = word.slice(0, -2);
    if (stem.endsWith('e')) {
      return stem; // liked -> like (but stem is 'lik' so return 'lik' + 'e' = 'like')
    }
    // Check for doubled consonant: stopped -> stop
    if (stem.length > 2 && stem[stem.length - 1] === stem[stem.length - 2]) {
      return stem.slice(0, -1);
    }
    return word.slice(0, -2);
  }
  if (word.endsWith('ing') && word.length > 4) {
    const stem = word.slice(0, -3);
    // Check for doubled consonant: running -> run
    if (stem.length > 2 && stem[stem.length - 1] === stem[stem.length - 2]) {
      return stem.slice(0, -1);
    }
    // Check if we need to add 'e': making -> make
    // This is imperfect but covers common cases
    return stem;
  }
  if (word.endsWith('s') && word.length > 2 && !word.endsWith('ss')) {
    return word.slice(0, -1); // cats -> cat
  }

  return word;
}

/**
 * Lemmatize all tokens
 */
export function lemmatizeTokens(tokens: string[]): string[] {
  return tokens.map(lemmatize);
}

/**
 * Check if sentence is a question
 */
export function isQuestion(sentence: string): boolean {
  return sentence.trim().endsWith('?');
}

/**
 * Detect question type
 */
export type QuestionType = 'wh' | 'yes-no' | 'none';

const WH_WORDS = new Set(['what', 'where', 'when', 'why', 'who', 'whom', 'whose', 'which', 'how']);

export function detectQuestionType(sentence: string): QuestionType {
  if (!isQuestion(sentence)) {
    return 'none';
  }

  const tokens = tokenize(sentence);
  const hasWhWord = tokens.some(token => WH_WORDS.has(token));

  return hasWhWord ? 'wh' : 'yes-no';
}

/**
 * Extract the WH word from a sentence
 */
export function extractWhWord(tokens: string[]): string | null {
  for (const token of tokens) {
    if (WH_WORDS.has(token)) {
      return token;
    }
  }
  return null;
}
