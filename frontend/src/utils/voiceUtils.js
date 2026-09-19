/**
 * Voice Transcript Utilities — Frontend
 * Mirrors normalization logic from backend/src/services/voice_intent_parser.js
 * so the frontend can preprocess before sending to the conversational flow.
 */

const FILLER_WORDS_RE = /\b(umm?|uh+|er+|ah+|like|you know|basically|actually|please|kindly|i want to|i'd like to|i need|help me|show me|take me to|open|go to|navigate to|let me see)\b/gi;

const SPOKEN_NUMBERS = {
  // English
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
  sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
  thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70,
  eighty: 80, ninety: 90, hundred: 100, thousand: 1000,
  lakh: 100000, lakhs: 100000, lac: 100000, lacs: 100000,
  crore: 10000000, crores: 10000000,

  // Telugu
  'ఒకటి': 1, 'ఒక': 1, 'రెండు': 2, 'మూడు': 3, 'నాలుగు': 4, 'ఐదు': 5,
  'ఆరు': 6, 'ఏడు': 7, 'ఎనిమిది': 8, 'తొమ్మిది': 9, 'పది': 10,
  'ఇరవై': 20, 'ముప్పై': 30, 'నలభై': 40, 'అభై': 50, 'యాభై': 50,
  'అరవై': 60, 'డెబ్బై': 70, 'ఎనభై': 80, 'తొంబై': 90, 'వంద': 100,
  'వేలు': 1000, 'వేల': 1000, 'లక్ష': 100000, 'లక్షలు': 100000, 'లక్షల': 100000, 'లాఖ్': 100000,
  'కోటి': 10000000, 'కోట్లు': 10000000,

  // Hindi (Devanagari)
  'एक': 1, 'दो': 2, 'तीन': 3, 'चार': 4, 'पांच': 5, 'पाँच': 5,
  'छह': 6, 'सात': 7, 'आठ': 8, 'नौ': 9, 'दस': 10,
  'बीस': 20, 'तीस': 30, 'चालिस': 40, 'पचास': 50, 'साठ': 60, 'सत्तर': 70, 'अस्सी': 80, 'नब्बे': 90, 'सौ': 100,
  'हजार': 1000, 'हज़ार': 1000, 'लाख': 100000, 'करोड़': 10000000,

  // Kannada
  'ಒಂದು': 1, 'ಎರಡು': 2, 'ಮೂರು': 3, 'ನಾಲ್ಕು': 4, 'ಐದು': 5,
  'ಆರು': 6, 'ಏಳು': 7, 'ಎಂಟು': 8, 'ಒಂಬತ್ತು': 9, 'ಹತ್ತು': 10,
  'ಸಾವಿರ': 1000, 'ಲಕ್ಷ': 100000, 'ಕೋಟಿ': 10000000,

  // Tamil
  'ஒன்று': 1, 'இரண்டு': 2, 'மூன்று': 3, 'நான்கு': 4, 'ஐந்து': 5,
  'ஆறு': 6, 'ஏழு': 7, 'எட்டு': 8, 'ஒன்பது': 9, 'பத்து': 10,
  'ஆயிரம்': 1000, 'லட்சம்': 100000, 'கோடி': 10000000,
};

/**
 * Convert spoken Indian number expressions to digits.
 * "five lakh" → "500000"
 * "two crore" → "20000000"
 */
export function parseSpokenCurrency(text) {
  if (!text) return '';
  let result = text;

  // 1. English spoken numbers
  const pattern = /(\b(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)\b)\s*(\b(?:lakh|lac|crore|lacs|lakhs|crores|thousand|million|billion)\b)/gi;
  result = result.replace(pattern, (_, numWord, multWord) => {
    const n = SPOKEN_NUMBERS[numWord.toLowerCase()] || 0;
    const m = SPOKEN_NUMBERS[multWord.toLowerCase()] || 1;
    return String(n * m);
  });

  // 2. Indic spoken numbers
  for (const [word, val] of Object.entries(SPOKEN_NUMBERS)) {
    if (word.length > 1 && !/^[a-z]+$/i.test(word) && result.includes(word)) {
      result = result.replace(new RegExp(word, 'g'), String(val));
    }
  }

  return result;
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
 * Handles: "500000", "3L", "3.5 lakh", "₹50,000", "10 లక్షలు", "పది లక్షలు"
 */
export function extractAmount(text) {
  if (!text) return null;
  const cleaned = text.replace(/₹/g, '').replace(/,/g, '');

  let normalizedDigits = cleaned;
  for (const [word, val] of Object.entries(SPOKEN_NUMBERS)) {
    if (word.length > 1 && !/^[a-z]+$/i.test(word) && normalizedDigits.includes(word)) {
      normalizedDigits = normalizedDigits.replace(new RegExp(word, 'g'), String(val));
    }
  }

  // 1. Lakhs multiplier (English & 9 Indic scripts)
  const lakhMatch = normalizedDigits.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|lac|lacs|l|लाख|लक्ष|లక్ష|లక్షలు|లక్షల|లాఖ్|லட்சம்|லட்சங்கள்|ലക്ഷം|ലാഖ്|ലാഖ്|লাখ|লক্ষ|ಲಕ್ಷ|ಲಕ್ಷಗಳು)/i)
                 || cleaned.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|lac|lacs|l|लाख|लक्ष|లక్ష|లక్షలు|లక్షల|లాఖ్|லட்சம்|லட்சங்கள்|ലക്ഷം|ലാഖ്|লাখ|লক্ষ|ಲಕ್ಷ|ಲಕ್ಷಗಳು)/i);
  if (lakhMatch) return Math.round(parseFloat(lakhMatch[1]) * 100000);

  // 2. Thousands multiplier
  const kMatch = normalizedDigits.match(/(\d+(?:\.\d+)?)\s*(?:k|thousand|हजार|हज़ार|వేలు|వేల|ஆயிரம்|ஆயிரங்கள்|ஆയിരം|ഹাজার|হাজ়ার|ಸಾಫಿರ|ಸಾವಿರ)/i)
              || cleaned.match(/(\d+(?:\.\d+)?)\s*(?:k|thousand|हजार|हज़ार|వేలు|వేల|ஆயிரம்|ஆயிரங்கள்|ஆയിരം|ഹাজার|হাজ়ার|ಸಾಫಿರ|ಸಾವಿರ)/i);
  if (kMatch) return Math.round(parseFloat(kMatch[1]) * 1000);

  // 3. Crores multiplier
  const croreMatch = normalizedDigits.match(/(\d+(?:\.\d+)?)\s*(?:cr|crore|crores|करोड़|करोड|కోటి|కోట్లు|గోడి|கோடிகள்|കോടി|കോട്ടി|ಕೋಟಿ)/i)
                  || cleaned.match(/(\d+(?:\.\d+)?)\s*(?:cr|crore|crores|करोड़|करोड|కోటి|కోట్లు|గోడి|கோடிகள்|കോടി|കോട്ടി|ಕೋಟಿ)/i);
  if (croreMatch) return Math.round(parseFloat(croreMatch[1]) * 10000000);

  // 4. Large plain numbers (e.g. 500000)
  const plainNum = normalizedDigits.match(/\b\d{4,9}\b/) || cleaned.match(/\b\d{4,9}\b/);
  if (plainNum) return Math.round(parseFloat(plainNum[0]));

  // 5. Fallback plain numbers
  const plain = normalizedDigits.match(/\d+(?:\.\d+)?/) || cleaned.match(/\d+(?:\.\d+)?/);
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
