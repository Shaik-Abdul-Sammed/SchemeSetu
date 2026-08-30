/**
 * SchemeSetu — Translation Route
 * POST /api/v1/translate
 *
 * Uses google-translate-api (no Google Cloud API key required).
 * Supports: EN, HI, TE, TA, KN, ML, BN, MR
 *
 * Request body (single):   { text: string,   targetLang: string }
 * Request body (batch):    { texts: string[], targetLang: string }
 *
 * Response (single):  { translated: string }
 * Response (batch):   { translated: string[] }
 */

const express = require('express');
const router = express.Router();
const translate = require('google-translate-api');

// ── Language code map: app codes → Google Translate codes ──
const LANG_MAP = {
  EN: 'en',
  HI: 'hi',
  TE: 'te',
  TA: 'ta',
  KN: 'kn',
  ML: 'ml',
  BN: 'bn',
  MR: 'mr',
  GON: 'hi', // Gondi Devanagari regional base
  BHI: 'hi', // Bhili Devanagari regional base
};

// ── In-memory translation cache (prevents duplicate requests) ──
const cache = new Map();
const MAX_CACHE_SIZE = 2000;

function cacheKey(text, lang) {
  return `${lang}::${text}`;
}

function addToCache(key, value) {
  if (cache.size >= MAX_CACHE_SIZE) {
    // Evict oldest entry (Map preserves insertion order)
    cache.delete(cache.keys().next().value);
  }
  cache.set(key, value);
}

// ── Helper: translate a single string with cache ──
async function translateOne(text, googleLang) {
  if (!text || typeof text !== 'string') return text;
  const key = cacheKey(text, googleLang);
  if (cache.has(key)) return cache.get(key);
  try {
    const result = await translate(text, { to: googleLang });
    // google-translate-api returns { text: '...' }
    const translated = result && result.text ? result.text : text;
    addToCache(key, translated);
    return translated;
  } catch (err) {
    console.warn(`[translate] Failed for lang=${googleLang}: ${err.message}`);
    return text; // Graceful fallback: return original
  }
}

// ── POST /api/v1/translate ──
router.post('/', async (req, res) => {
  try {
    const { text, texts, targetLang } = req.body;

    if (!targetLang) {
      return res.status(400).json({ error: 'targetLang is required (e.g. "HI", "TE")' });
    }

    const googleLang = LANG_MAP[String(targetLang).toUpperCase()] || String(targetLang).toLowerCase();

    // If target is English — return as-is (no translation needed)
    if (googleLang === 'en') {
      if (Array.isArray(texts)) return res.json({ translated: texts });
      return res.json({ translated: text || '' });
    }

    // ── Batch mode ──
    if (Array.isArray(texts)) {
      if (texts.length === 0) return res.json({ translated: [] });
      if (texts.length > 50) {
        return res.status(400).json({ error: 'Maximum 50 texts per batch request.' });
      }
      const results = await Promise.all(texts.map(t => translateOne(t, googleLang)));
      return res.json({ translated: results });
    }

    // ── Single mode ──
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Provide "text" (string) or "texts" (string array).' });
    }

    const result = await translateOne(text, googleLang);
    return res.json({ translated: result });

  } catch (err) {
    console.error('[translate] Unexpected error:', err.message);
    // Graceful degradation — return original text
    const { text, texts } = req.body;
    if (Array.isArray(texts)) return res.json({ translated: texts });
    return res.json({ translated: text || '' });
  }
});

// ── GET /api/v1/translate/cache-stats ──
router.get('/cache-stats', (_req, res) => {
  res.json({ cacheSize: cache.size, maxCacheSize: MAX_CACHE_SIZE });
});

module.exports = router;
