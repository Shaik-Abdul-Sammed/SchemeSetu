/**
 * SchemeSetu Voice Intent Parser v2.0
 * ─────────────────────────────────────────────────────────────────────────────
 * Robust NLU engine with:
 *   • Alias/synonym resolution
 *   • Slot extraction (numbers, occupations, locations)
 *   • Confidence-weighted scoring (not just keyword includes)
 *   • Conversation context for follow-ups
 *   • Security: validates and sanitizes input before action
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

// ── 1. TRANSCRIPT NORMALIZATION ───────────────────────────────────────────────
const FILLER_WORDS = /\b(umm?|uh+|er+|ah+|like|you know|basically|actually|please|kindly|can you|could you|would you|i want to|i'd like to|i need|help me|show me|take me to|open|go to|navigate to|let me see)\b/gi;

const SPOKEN_NUMBERS = {
  'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
  'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
  'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
  'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19, 'twenty': 20,
  'thirty': 30, 'forty': 40, 'fifty': 50, 'sixty': 60, 'seventy': 70,
  'eighty': 80, 'ninety': 90, 'hundred': 100, 'thousand': 1000,
  'lakh': 100000, 'lakhs': 100000, 'lac': 100000, 'lacs': 100000,
  'crore': 10000000, 'crores': 10000000,
  'million': 1000000, 'billion': 1000000000,
};

/**
 * Normalize a raw speech-to-text transcript.
 * @param {string} raw - Raw transcript from Web Speech API
 * @returns {string} - Normalized text safe for intent parsing
 */
function normalizeTranscript(raw = '') {
  if (!raw || typeof raw !== 'string') return '';

  let text = raw.trim();

  // 1. Lowercase
  text = text.toLowerCase();

  // 2. Remove filler words
  text = text.replace(FILLER_WORDS, ' ');

  // 3. Normalize common contractions
  text = text.replace(/\bdon't\b/g, 'do not')
             .replace(/\bcan't\b/g, 'cannot')
             .replace(/\bwon't\b/g, 'will not')
             .replace(/\bi'm\b/g, 'i am')
             .replace(/\bi've\b/g, 'i have')
             .replace(/\bi'd\b/g, 'i would')
             .replace(/\bit's\b/g, 'it is');

  // 4. Normalize Indian spoken number expressions  
  // e.g. "five lakh rupees" → "500000"
  text = parseSpokenCurrency(text);

  // 5. Remove extra punctuation from STT
  text = text.replace(/[,;:!?.]+/g, ' ');

  // 6. Collapse multiple spaces
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

/**
 * Parse spoken currency/number expressions.
 * "five lakh" → "500000", "2 crore" → "20000000"
 */
function parseSpokenCurrency(text) {
  // Handle compound expressions like "five lakh fifty thousand"
  let result = text;

  // Replace written numbers adjacent to multipliers
  const pattern = /(\b(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)\b)\s*(?:point\s*\d+\s*)?(\b(?:lakh|lac|crore|lacs|lakhs|crores|thousand|million|billion)\b)/gi;

  result = result.replace(pattern, (match, numWord, multiplierWord) => {
    const num = SPOKEN_NUMBERS[numWord.toLowerCase()] || 0;
    const mult = SPOKEN_NUMBERS[multiplierWord.toLowerCase()] || 1;
    return String(num * mult);
  });

  return result;
}

/**
 * Extract a numeric value from normalized text.
 * Handles: "300000", "3 lakh", "₹3L", "5.5 lakhs"
 */
function extractNumber(text) {
  // Already converted spoken → numeric by normalizeTranscript
  // Also handle ₹, L, K shorthand
  const cleaned = text.replace(/₹/g, '').replace(/,/g, '');

  // Match "3L" or "3.5L" (lakh shorthand)
  const lakhShort = cleaned.match(/(\d+(?:\.\d+)?)\s*[lL](?:akh)?/);
  if (lakhShort) return Math.round(parseFloat(lakhShort[1]) * 100000);

  // Match "3K" (thousand shorthand)
  const kShort = cleaned.match(/(\d+(?:\.\d+)?)\s*[kK]/);
  if (kShort) return Math.round(parseFloat(kShort[1]) * 1000);

  // Match plain number
  const plain = cleaned.match(/\d+(?:\.\d+)?/);
  if (plain) return Math.round(parseFloat(plain[0]));

  return null;
}

// ── 2. INTENT DEFINITIONS ─────────────────────────────────────────────────────

/**
 * Each intent has:
 *   - id: string
 *   - patterns: array of keyword groups (each group is OR'd; groups are AND'd)
 *   - aliases: flat array of trigger phrases (any match = strong signal)
 *   - targetPage: app route
 *   - requiresSlots: optional slots that must be extracted for the intent to be actionable
 *   - confirmationRequired: boolean (for destructive/sensitive actions)
 *   - baseScore: numeric weight when the intent is matched
 */
const INTENT_DEFINITIONS = [
  {
    id: 'NAVIGATE_HOME',
    aliases: ['home', 'main page', 'homepage', 'go home', 'back home', 'start'],
    patterns: [['home']],
    targetPage: '/',
    confirmationRequired: false,
    baseScore: 1.0,
  },
  {
    id: 'NAVIGATE_SCHEMES',
    aliases: [
      'schemes', 'all schemes', 'scheme list', 'view schemes', 'browse schemes',
      'explore schemes', 'government schemes', 'welfare schemes', 'yojana list',
      'show schemes', 'see schemes',
    ],
    patterns: [['scheme', 'yojana', 'welfare', 'programme', 'program']],
    targetPage: '/schemes',
    confirmationRequired: false,
    baseScore: 1.0,
  },
  {
    id: 'CHECK_ELIGIBILITY',
    aliases: [
      'eligibility', 'check eligibility', 'am i eligible', 'eligible schemes',
      'find my schemes', 'which schemes', 'what schemes', 'qualify',
      'suitable schemes', 'apply eligibility',
    ],
    patterns: [['eligib', 'qualify', 'suitable', 'my scheme', 'find scheme']],
    targetPage: '/eligibility',
    confirmationRequired: false,
    baseScore: 1.0,
  },
  {
    id: 'DISCOVER_SCHEMES',
    aliases: [
      'loan', 'business loan', 'mudra', 'pmegp', 'agriculture loan',
      'farming help', 'kisan loan', 'stand up india', 'startup loan',
      'money help', 'financial help', 'subsidy',
    ],
    patterns: [['loan', 'borrow', 'money', 'fund', 'subsidy', 'grant', 'farm', 'kisan', 'agri', 'business', 'entrepreneur', 'mudra', 'msme']],
    targetPage: '/input-hub',
    confirmationRequired: false,
    baseScore: 0.85,
  },
  {
    id: 'OPEN_INPUT_HUB',
    aliases: [
      'input hub', 'chat', 'voice chat', 'tell you', 'start chat',
      'open chat', 'voice assistant', 'ask question', 'ask ai',
    ],
    patterns: [['input', 'hub', 'chat', 'voice', 'assistant', 'ai']],
    targetPage: '/input-hub',
    confirmationRequired: false,
    baseScore: 1.0,
  },
  {
    id: 'CHECK_STATUS',
    aliases: [
      'status', 'application status', 'my applications', 'track application',
      'track my', 'applied schemes', 'applied status', 'check application',
      'what did i apply', 'pending application',
    ],
    patterns: [['status', 'application', 'track', 'applied', 'pending', 'check my']],
    targetPage: '/applications',
    confirmationRequired: false,
    baseScore: 1.0,
  },
  {
    id: 'NAVIGATE_DASHBOARD',
    aliases: [
      'dashboard', 'my dashboard', 'profile', 'my profile', 'account',
    ],
    patterns: [['dashboard', 'profile', 'account', 'my page']],
    targetPage: '/dashboard',
    confirmationRequired: false,
    baseScore: 1.0,
  },
  {
    id: 'AGENT_REGISTRATION',
    aliases: [
      'agent', 'vle', 'register agent', 'csc', 'village entrepreneur',
      'jan seva kendra', 'common service',
    ],
    patterns: [['agent', 'vle', 'csc', 'village level', 'register']],
    targetPage: '/input-hub',
    slotsToPrefill: { mode: 'agent' },
    confirmationRequired: false,
    baseScore: 0.9,
  },
  {
    id: 'NAVIGATE_LOGIN',
    aliases: ['login', 'sign in', 'log in', 'signin'],
    patterns: [['login', 'sign in']],
    targetPage: '/login',
    confirmationRequired: false,
    baseScore: 1.0,
  },
  {
    id: 'NAVIGATE_COMMUNITY',
    aliases: ['community', 'forum', 'discussion', 'community forum'],
    patterns: [['community', 'forum', 'discuss']],
    targetPage: '/community',
    confirmationRequired: false,
    baseScore: 1.0,
  },
  {
    id: 'SEARCH_SCHEME',
    aliases: [],
    patterns: [['search', 'find', 'look for', 'find scheme for']],
    targetPage: '/schemes',
    requiresSlots: ['query'],
    confirmationRequired: false,
    baseScore: 0.8,
  },
  {
    id: 'GENERAL_QUERY',
    aliases: [],
    patterns: [],
    targetPage: '/input-hub',
    confirmationRequired: false,
    baseScore: 0.4,
  },
];

// ── 3. CONFIDENCE SCORING ─────────────────────────────────────────────────────

/**
 * Compute a confidence score (0–1) for how well text matches an intent.
 */
function scoreIntent(normalizedText, intentDef) {
  let score = 0;
  let matchCount = 0;

  // A. Exact alias match — very strong signal
  for (const alias of intentDef.aliases) {
    if (normalizedText.includes(alias)) {
      score += 0.9;
      matchCount++;
      break; // Only count once per alias list
    }
  }

  // B. Pattern group match — moderate signal
  for (const group of intentDef.patterns) {
    const groupHit = group.some((kw) => normalizedText.includes(kw));
    if (groupHit) {
      score += 0.5;
      matchCount++;
    }
  }

  // C. Token-level fuzzy matching (count word overlaps)
  const textTokens = new Set(normalizedText.split(/\s+/));
  const allKeywords = [
    ...intentDef.aliases.flatMap((a) => a.split(/\s+/)),
    ...intentDef.patterns.flat(),
  ];
  const tokenHits = allKeywords.filter((kw) => textTokens.has(kw)).length;
  score += tokenHits * 0.05;

  // D. Apply base score weight
  const rawScore = matchCount > 0 ? (score / Math.max(1, matchCount)) * intentDef.baseScore : 0;

  return Math.min(1.0, rawScore);
}

// ── 4. SLOT EXTRACTION ────────────────────────────────────────────────────────

const OCCUPATION_MAP = {
  farmer: ['farmer', 'farming', 'agriculture', 'agri', 'kisan', 'crop', 'field'],
  artisan: ['artisan', 'craftsman', 'weaver', 'potter', 'blacksmith', 'handicraft'],
  vendor: ['vendor', 'street vendor', 'hawker', 'seller', 'trader', 'shopkeeper'],
  business: ['business', 'entrepreneur', 'startup', 'msme', 'small business', 'manufacturer'],
  student: ['student', 'education', 'college', 'scholarship', 'study', 'school'],
  healthcare: ['health', 'medical', 'hospital', 'doctor', 'nurse', 'ayushman'],
};

function extractSlots(normalizedText) {
  const slots = {};

  // Extract numeric values
  const amount = extractNumber(normalizedText);
  if (amount !== null && amount > 0) {
    slots.amount = amount;
    // Classify as income or cost based on context
    if (normalizedText.includes('income') || normalizedText.includes('earn') || normalizedText.includes('salary') || normalizedText.includes('wage')) {
      slots.income = amount;
    } else if (normalizedText.includes('cost') || normalizedText.includes('loan') || normalizedText.includes('amount') || normalizedText.includes('borrow') || normalizedText.includes('need')) {
      slots.cost = amount;
    }
  }

  // Extract occupation
  for (const [occupation, keywords] of Object.entries(OCCUPATION_MAP)) {
    if (keywords.some((kw) => normalizedText.includes(kw))) {
      slots.occupation = occupation;
      break;
    }
  }

  // Extract project type
  const PROJECT_TYPES = {
    agriculture: ['farm', 'agri', 'kisan', 'crop', 'irrigation', 'horticulture'],
    manufacturing: ['manufactur', 'factory', 'production', 'industrial'],
    services: ['service', 'salon', 'repair', 'tailoring', 'catering'],
    trading: ['trading', 'shop', 'retail', 'wholesale', 'market'],
    education: ['education', 'training', 'skill', 'scholarship'],
    healthcare: ['health', 'medical', 'pharmacy', 'clinic'],
  };
  for (const [type, keywords] of Object.entries(PROJECT_TYPES)) {
    if (keywords.some((kw) => normalizedText.includes(kw))) {
      slots.projectType = type;
      break;
    }
  }

  // Extract search query (words after "search for", "find", "about")
  const queryMatch = normalizedText.match(/(?:search for|find|about|regarding|related to)\s+(.+)/);
  if (queryMatch) {
    slots.query = queryMatch[1].trim();
  }

  return slots;
}

// ── 5. MAIN INTENT PARSER ─────────────────────────────────────────────────────

const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.75,   // Execute directly
  MEDIUM: 0.50, // Ask for clarification
  LOW: 0.25,    // Ask to repeat
};

/**
 * Parse a voice/text input and return structured intent with confidence.
 *
 * @param {string} rawTranscript - Raw text from STT or text input
 * @param {object} context - Conversation context (previous intent, collected slots, etc.)
 * @returns {object} ParsedIntent
 */
function parseVoiceIntent(rawTranscript = '', context = {}) {
  // 1. Validate input
  if (!rawTranscript || typeof rawTranscript !== 'string') {
    return buildResult('EMPTY_INPUT', 0, null, {}, 'repeat');
  }

  // 2. Sanitize: reject suspiciously long input (possible injection)
  if (rawTranscript.length > 500) {
    return buildResult('INVALID_INPUT', 0, null, {}, 'repeat');
  }

  // 3. Normalize transcript
  const normalized = normalizeTranscript(rawTranscript);

  if (!normalized || normalized.length < 2) {
    return buildResult('EMPTY_INPUT', 0, null, {}, 'repeat');
  }

  // 4. Extract slots regardless of intent
  const slots = extractSlots(normalized);

  // 5. Score all intents
  const scores = INTENT_DEFINITIONS.map((intentDef) => ({
    intent: intentDef,
    score: scoreIntent(normalized, intentDef),
  }));

  // 6. Sort by descending score
  scores.sort((a, b) => b.score - a.score);

  const best = scores[0];
  const runnerUp = scores[1];

  // 7. Handle ambiguity: if top two intents are too close together
  const isAmbiguous =
    runnerUp &&
    best.score > CONFIDENCE_THRESHOLDS.LOW &&
    best.score - runnerUp.score < 0.15 &&
    best.intent.id !== 'GENERAL_QUERY';

  // 8. Determine action tier
  let action;
  if (best.score >= CONFIDENCE_THRESHOLDS.HIGH) {
    action = 'execute';
  } else if (best.score >= CONFIDENCE_THRESHOLDS.MEDIUM) {
    action = isAmbiguous ? 'clarify' : 'execute';
  } else if (best.score >= CONFIDENCE_THRESHOLDS.LOW) {
    action = 'clarify';
  } else {
    action = 'repeat';
  }

  // 9. Apply conversation context for follow-ups
  const intentId = best.intent.id;
  const targetPage = best.intent.targetPage;
  const confirmationRequired = best.intent.confirmationRequired || false;

  return buildResult(intentId, best.score, targetPage, slots, action, {
    normalized,
    confirmationRequired,
    ambiguousAlternative: isAmbiguous ? runnerUp.intent.id : null,
    slotsToPrefill: best.intent.slotsToPrefill || {},
    requiresSlots: best.intent.requiresSlots || [],
    rawTranscript: rawTranscript.substring(0, 200), // Safe truncated reference
  });
}

function buildResult(intentId, confidence, targetPage, slots, action, extra = {}) {
  return {
    intent: intentId,
    confidence: Math.round(confidence * 100) / 100,
    targetPage,
    slots,
    action, // 'execute' | 'clarify' | 'repeat'
    ...extra,
  };
}

// ── 6. CONVERSATION CONTEXT MANAGER ───────────────────────────────────────────

class ConversationContext {
  constructor(maxTurns = 5) {
    this.turns = [];
    this.maxTurns = maxTurns;
    this.collectedSlots = {};
    this.lastIntent = null;
    this.lastTargetPage = null;
    this.pendingConfirmation = null;
  }

  addTurn(transcript, parsedIntent) {
    this.turns.push({ transcript, parsedIntent, timestamp: Date.now() });
    if (this.turns.length > this.maxTurns) {
      this.turns.shift(); // Keep rolling window
    }
    // Merge slots
    if (parsedIntent.slots) {
      Object.assign(this.collectedSlots, parsedIntent.slots);
    }
    if (parsedIntent.intent !== 'EMPTY_INPUT' && parsedIntent.intent !== 'INVALID_INPUT') {
      this.lastIntent = parsedIntent.intent;
      this.lastTargetPage = parsedIntent.targetPage;
    }
  }

  resolvePronouns(normalized) {
    // Resolve "it", "this", "that" to last page/entity if known
    if ((normalized.includes(' it') || normalized.includes(' this') || normalized.includes(' that')) && this.lastTargetPage) {
      return normalized + ` ${this.lastTargetPage}`;
    }
    return normalized;
  }

  getCollectedSlots() {
    return { ...this.collectedSlots };
  }

  clear() {
    this.turns = [];
    this.collectedSlots = {};
    this.lastIntent = null;
    this.lastTargetPage = null;
    this.pendingConfirmation = null;
  }
}

module.exports = {
  parseVoiceIntent,
  normalizeTranscript,
  extractSlots,
  extractNumber,
  parseSpokenCurrency,
  ConversationContext,
  CONFIDENCE_THRESHOLDS,
  INTENT_DEFINITIONS,
};
