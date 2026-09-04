/**
 * languageDetector.js — Client-side language detection from STT transcripts
 * ─────────────────────────────────────────────────────────────────────────────
 * Approach:
 *   1. Unicode script character counting (most reliable for non-Latin scripts)
 *   2. Keyword vocabulary matching for English / transliterations
 *   3. Mixed-script detection (Tanglish, Hinglish, Tenglish)
 *
 * Returns:
 *   { detectedLang, confidence, script, isMixed, mixedLangs }
 *
 * detectedLang: app language code (EN | HI | TE | TA | KN | ML | BN | MR)
 * confidence: 0.0–1.0
 * script: dominant Unicode script name
 * isMixed: true when multiple scripts detected
 * mixedLangs: array of detected lang codes
 *
 * NOTE: This runs entirely client-side — no API calls. Lightweight and fast.
 */

// ── Unicode script ranges ─────────────────────────────────────────────────────
const SCRIPT_RANGES = [
  { name: 'Devanagari', start: 0x0900, end: 0x097F, langs: ['HI', 'MR'] },
  { name: 'Telugu',     start: 0x0C00, end: 0x0C7F, langs: ['TE'] },
  { name: 'Tamil',      start: 0x0B80, end: 0x0BFF, langs: ['TA'] },
  { name: 'Kannada',    start: 0x0C80, end: 0x0CFF, langs: ['KN'] },
  { name: 'Malayalam',  start: 0x0D00, end: 0x0D7F, langs: ['ML'] },
  { name: 'Bengali',    start: 0x0980, end: 0x09FF, langs: ['BN'] },
  { name: 'Gujarati',   start: 0x0A80, end: 0x0AFF, langs: ['EN'] }, // fallback EN
  { name: 'Gurmukhi',   start: 0x0A00, end: 0x0A7F, langs: ['EN'] }, // Punjabi → EN fallback
];

/**
 * Count Unicode characters belonging to each script in a string.
 * Returns Map<scriptName, count>
 */
function countScriptChars(text) {
  const counts = new Map();
  for (const ch of text) {
    const cp = ch.codePointAt(0);
    for (const range of SCRIPT_RANGES) {
      if (cp >= range.start && cp <= range.end) {
        counts.set(range.name, (counts.get(range.name) || 0) + 1);
        break;
      }
    }
  }
  return counts;
}

// ── Transliteration keyword dictionaries ──────────────────────────────────────
// Only words that strongly signal a specific language when in Latin script.
// These handle Tanglish/Hinglish/Tenglish mixing.

const TELUGU_TRANSLITERATION_KEYWORDS = new Set([
  'naaku', 'nenu', 'meeru', 'mee', 'idi', 'adi', 'okati', 'rendu', 'moodu',
  'kavali', 'cheppandi', 'chudandi', 'ichandi', 'cheyyandi',
  'pthakalu', 'pathakalu', 'rupayalu', 'lakshal', 'lakshalu',
  'vayasayam', 'vyavasayam', 'bank', 'lonu', 'runu',
  'telugu', 'andhra', 'telangana', 'hyderabad',
  'emi', 'ela', 'evaru', 'enduku', 'ekkada',
  'dargina', 'dagara', 'daggar',
]);

const HINDI_TRANSLITERATION_KEYWORDS = new Set([
  'mujhe', 'mera', 'meri', 'mere', 'aapko', 'aap',
  'chahiye', 'chahte', 'chahti', 'dikhao', 'dikhaye', 'batao', 'bataiye',
  'yojana', 'yojanaye', 'sarkar', 'sarkari',
  'rupaye', 'paisa', 'lakh', 'crore', 'hazar',
  'hindi', 'bihar', 'uttar', 'pradesh', 'rajasthan',
  'kahan', 'kya', 'kitna', 'kitni', 'kyun', 'kaise',
  'bank', 'karz', 'rin', 'mudra',
]);

const KANNADA_TRANSLITERATION_KEYWORDS = new Set([
  'naanu', 'nimma', 'namma', 'avara', 'illi', 'alli',
  'yojane', 'sevaigalu', 'saavira', 'laksha', 'crore',
  'bengaluru', 'karnataka', 'kannada',
]);

const TAMIL_TRANSLITERATION_KEYWORDS = new Set([
  'enakku', 'ungalukku', 'avan', 'aval', 'intha', 'antha',
  'thittam', 'vari', 'kadam', 'peRu',
  'tamil', 'chennai', 'tamilnadu',
]);

const TRANSLITERATION_MAPS = [
  { lang: 'TE', keywords: TELUGU_TRANSLITERATION_KEYWORDS },
  { lang: 'HI', keywords: HINDI_TRANSLITERATION_KEYWORDS },
  { lang: 'KN', keywords: KANNADA_TRANSLITERATION_KEYWORDS },
  { lang: 'TA', keywords: TAMIL_TRANSLITERATION_KEYWORDS },
];

/**
 * Score transliteration keywords in a Latin-script text.
 * Returns Map<lang, matchCount>
 */
function scoreTransliterations(text) {
  const words = text.toLowerCase().split(/\s+/);
  const scores = new Map();
  for (const { lang, keywords } of TRANSLITERATION_MAPS) {
    let count = 0;
    for (const word of words) {
      if (keywords.has(word)) count++;
    }
    if (count > 0) scores.set(lang, count);
  }
  return scores;
}

// ── Main detection function ───────────────────────────────────────────────────

/**
 * Detect the language of a transcript string.
 *
 * @param {string} transcript - Raw STT output (may contain Unicode + Latin)
 * @param {string} [fallbackLang='EN'] - App lang code to fall back to if uncertain
 * @returns {{
 *   detectedLang: string,
 *   confidence: number,
 *   script: string,
 *   isMixed: boolean,
 *   mixedLangs: string[],
 *   method: string
 * }}
 */
export function detectLanguage(transcript, fallbackLang = 'EN') {
  if (!transcript || typeof transcript !== 'string' || transcript.trim().length < 2) {
    return {
      detectedLang: fallbackLang,
      confidence: 0,
      script: 'Unknown',
      isMixed: false,
      mixedLangs: [],
      method: 'empty_fallback',
    };
  }

  const text = transcript.trim();
  const totalChars = text.replace(/\s/g, '').length || 1;

  // ── Step 1: Unicode script counting ──────────────────────────────────
  const scriptCounts = countScriptChars(text);

  // Sum all non-Latin script chars
  let dominantScript = null;
  let dominantCount = 0;
  let nonLatinTotal = 0;

  for (const [script, count] of scriptCounts.entries()) {
    nonLatinTotal += count;
    if (count > dominantCount) {
      dominantCount = count;
      dominantScript = script;
    }
  }

  const nonLatinRatio = nonLatinTotal / totalChars;

  // If >25% of characters are non-Latin, Unicode detection is primary
  if (nonLatinRatio > 0.25 && dominantScript) {
    const range = SCRIPT_RANGES.find((r) => r.name === dominantScript);
    const langs = range?.langs || ['EN'];
    const detectedLang = langs[0];
    const confidence = Math.min(0.98, 0.5 + nonLatinRatio * 0.6);

    // Check for mixing with another non-Latin script
    const otherScripts = [...scriptCounts.entries()].filter(([s]) => s !== dominantScript);
    const isMixed = otherScripts.some(([, c]) => c / totalChars > 0.15);
    const mixedLangs = isMixed
      ? [detectedLang, ...otherScripts.filter(([, c]) => c / totalChars > 0.15)
          .map(([s]) => SCRIPT_RANGES.find((r) => r.name === s)?.langs?.[0]).filter(Boolean)]
      : [detectedLang];

    return {
      detectedLang,
      confidence: isMixed ? confidence * 0.8 : confidence,
      script: dominantScript,
      isMixed,
      mixedLangs,
      method: 'unicode_script',
    };
  }

  // ── Step 2: Transliteration keyword matching ──────────────────────────
  // Text is mostly Latin — check for Tanglish / Hinglish keywords
  const translitScores = scoreTransliterations(text);

  if (translitScores.size > 0) {
    // Find top-scoring language
    let bestLang = null;
    let bestScore = 0;
    for (const [lang, score] of translitScores.entries()) {
      if (score > bestScore) { bestScore = score; bestLang = lang; }
    }

    const wordCount = text.split(/\s+/).filter(Boolean).length || 1;
    const confidence = Math.min(0.88, 0.40 + (bestScore / wordCount) * 1.5);
    const isMixed = translitScores.size > 1 || nonLatinRatio > 0.05;
    const mixedLangs = [...translitScores.keys()];
    if (!mixedLangs.includes('EN')) mixedLangs.push('EN'); // always mixed with English

    return {
      detectedLang: bestLang,
      confidence,
      script: 'Latin (transliteration)',
      isMixed,
      mixedLangs,
      method: 'transliteration_keywords',
    };
  }

  // ── Step 3: Pure Latin / English fallback ────────────────────────────
  return {
    detectedLang: 'EN',
    confidence: 0.70,
    script: 'Latin',
    isMixed: false,
    mixedLangs: ['EN'],
    method: 'latin_default',
  };
}

/**
 * Resolve effective language using the 4-tier priority chain:
 *   1. Explicit user preference (e.g. from language selector)
 *   2. Detected language from current transcript (if confidence ≥ threshold)
 *   3. State-based default language (from location)
 *   4. English fallback
 *
 * @param {object} params
 * @param {string|null} params.explicitLang - User's explicit choice (app lang code)
 * @param {string|null} params.detectedLang - detectLanguage() result
 * @param {number}      params.detectedConfidence - 0–1
 * @param {string|null} params.stateDefaultLang - from getDefaultLangForState()
 * @param {number}      [params.confidenceThreshold=0.65] - min confidence to trust detection
 * @returns {string} - App language code
 */
export function resolveEffectiveLang({
  explicitLang,
  detectedLang,
  detectedConfidence,
  stateDefaultLang,
  confidenceThreshold = 0.65,
}) {
  if (explicitLang && explicitLang !== 'AUTO') return explicitLang;
  if (detectedLang && detectedConfidence >= confidenceThreshold) return detectedLang;
  if (stateDefaultLang) return stateDefaultLang;
  return 'EN';
}

/**
 * Get a human-readable label for a mixed-language transcript.
 * e.g. ['TE', 'EN'] → "Telugu-English"
 */
export function getMixedLanguageLabel(mixedLangs) {
  const names = {
    EN: 'English', HI: 'Hindi', TE: 'Telugu', TA: 'Tamil',
    KN: 'Kannada', ML: 'Malayalam', BN: 'Bengali', MR: 'Marathi',
  };
  return mixedLangs.map((l) => names[l] || l).join('-');
}
