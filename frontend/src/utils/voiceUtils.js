/**
 * Voice Transcript Utilities — Frontend
 * Mirrors normalization logic from backend/src/services/voice_intent_parser.js
 * so the frontend can preprocess before sending to the conversational flow.
 */

const FILLER_WORDS_RE = /\b(umm?|uh+|er+|ah+|like|you know|basically|actually|please|kindly|i want to|i'd like to|i need|help me|show me|take me to|open|go to|navigate to|let me see)\b/gi;

const SPOKEN_NUMBERS = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
  sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
  thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70,
  eighty: 80, ninety: 90, hundred: 100, thousand: 1000,
  lakh: 100000, lakhs: 100000, lac: 100000, lacs: 100000,
  crore: 10000000, crores: 10000000,
};

/**
 * Convert spoken Indian number expressions to digits.
 * "five lakh" → "500000"
 * "two crore" → "20000000"
 */
export function parseSpokenCurrency(text) {
  const pattern = /(\b(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)\b)\s*(\b(?:lakh|lac|crore|lacs|lakhs|crores|thousand|million|billion)\b)/gi;
  return text.replace(pattern, (_, numWord, multWord) => {
    const n = SPOKEN_NUMBERS[numWord.toLowerCase()] || 0;
    const m = SPOKEN_NUMBERS[multWord.toLowerCase()] || 1;
    return String(n * m);
  });
}

/**
 * Normalize a raw STT transcript for intent/command processing.
 *
 * @param {string} raw
 * @returns {string} normalized
 */
export function normalizeTranscript(raw = '') {
  if (!raw || typeof raw !== 'string') return '';

  let text = raw.trim().toLowerCase();

  // Remove filler words
  text = text.replace(FILLER_WORDS_RE, ' ');

  // Contractions
  text = text
    .replace(/\bdon't\b/g, 'do not')
    .replace(/\bcan't\b/g, 'cannot')
    .replace(/\bwon't\b/g, 'will not')
    .replace(/\bi'm\b/g, 'i am')
    .replace(/\bi've\b/g, 'i have')
    .replace(/\bi'd\b/g, 'i would')
    .replace(/\bit's\b/g, 'it is');

  // Spoken numbers / Indian currency
  text = parseSpokenCurrency(text);

  // Remove stray punctuation from STT
  text = text.replace(/[,;:!?.]+/g, ' ');

  // Collapse whitespace
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

/**
 * Extract the best numeric amount from a normalized transcript.
 * Returns null if no number found.
 *
 * Handles: "500000", "3L", "3.5 lakh", "₹50,000"
 */
export function extractAmount(text) {
  const cleaned = text.replace(/₹/g, '').replace(/,/g, '');

  const lakhShort = cleaned.match(/(\d+(?:\.\d+)?)\s*[lL](?:akh)?/);
  if (lakhShort) return Math.round(parseFloat(lakhShort[1]) * 100000);

  const kShort = cleaned.match(/(\d+(?:\.\d+)?)\s*[kK]/);
  if (kShort) return Math.round(parseFloat(kShort[1]) * 1000);

  const plain = cleaned.match(/\d+(?:\.\d+)?/);
  if (plain) return Math.round(parseFloat(plain[0]));

  return null;
}

const OCCUPATION_KEYWORDS = {
  agriculture: ['farm', 'agri', 'kisan', 'crop', 'irrigation', 'horticulture', 'cultivation'],
  manufacturing: ['manufactur', 'factory', 'production', 'industrial', 'assembly'],
  services: ['service', 'salon', 'repair', 'tailoring', 'catering', 'beauty'],
  trading: ['trading', 'shop', 'retail', 'wholesale', 'market', 'dealer'],
  education: ['education', 'training', 'skill', 'scholarship', 'study'],
  healthcare: ['health', 'medical', 'pharmacy', 'clinic', 'hospital'],
  handicraft: ['artisan', 'craft', 'weav', 'potter', 'handicraft', 'handloom'],
};

/**
 * Detect project type from normalized text.
 */
export function detectProjectType(text) {
  for (const [type, keywords] of Object.entries(OCCUPATION_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) return type;
  }
  return 'business'; // default
}

/**
 * Detect if a transcript is asking about a number (cost/income context).
 */
export function detectNumberContext(text) {
  if (/income|earn|salary|wage|monthly|annual/.test(text)) return 'income';
  if (/cost|loan|borrow|amount|need|require|invest/.test(text)) return 'cost';
  return 'unknown';
}

/**
 * Simple confidence check: is the transcript long enough to be meaningful?
 * Very short transcripts (< 2 words) may be noise.
 */
export function isTranscriptMeaningful(transcript) {
  if (!transcript || typeof transcript !== 'string') return false;
  const words = transcript.trim().split(/\s+/).filter(Boolean);
  return words.length >= 1 && transcript.trim().length >= 2;
}
