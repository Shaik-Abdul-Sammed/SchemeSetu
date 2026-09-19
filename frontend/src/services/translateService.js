/**
 * SchemeSetu — Frontend Translation Service
 *
 * Calls the SchemeSetu backend POST /api/v1/translate endpoint.
 * Uses google-translate-api on the backend (no API key required).
 *
 * Usage:
 *   import { translateText, translateBatch } from '../services/translateService';
 *
 *   const hindi = await translateText('Hello', 'HI');
 *   const batch = await translateBatch(['Apply Now', 'Check Status'], 'TE');
 */

import { getApiBaseUrl } from './api';

const API_BASE = getApiBaseUrl();

/** In-memory client-side cache to avoid redundant network requests */
const clientCache = new Map();
const MAX_CLIENT_CACHE = 1000;

function cacheKey(text, lang) {
  return `${lang}::${text}`;
}

function setCache(key, value) {
  if (clientCache.size >= MAX_CLIENT_CACHE) {
    clientCache.delete(clientCache.keys().next().value);
  }
  clientCache.set(key, value);
}

/**
 * Translate a single text string.
 * @param {string} text - Text to translate
 * @param {string} targetLang - Language code: EN | HI | TE | TA | KN | ML | BN | MR
 * @returns {Promise<string>} Translated text (returns original on failure)
 */
export async function translateText(text, targetLang) {
  if (!text || !targetLang) return text;
  if (targetLang === 'EN') return text;

  const key = cacheKey(text, targetLang);
  if (clientCache.has(key)) return clientCache.get(key);

  try {
    const res = await fetch(`${API_BASE}/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetLang }),
    });

    if (!res.ok) return text;

    const data = await res.json();
    const translated = data?.translated || text;
    setCache(key, translated);
    return translated;
  } catch {
    return text; // graceful degradation
  }
}

/**
 * Translate an array of texts in a single batch request.
 * @param {string[]} texts - Array of strings to translate
 * @param {string} targetLang - Language code: EN | HI | TE | TA | KN | ML | BN | MR
 * @returns {Promise<string[]>} Array of translated strings
 */
export async function translateBatch(texts, targetLang) {
  if (!Array.isArray(texts) || texts.length === 0) return texts;
  if (targetLang === 'EN') return texts;

  // Check which texts are already cached
  const uncachedIndices = [];
  const results = texts.map((text, i) => {
    const key = cacheKey(text, targetLang);
    if (clientCache.has(key)) return clientCache.get(key);
    uncachedIndices.push(i);
    return null;
  });

  if (uncachedIndices.length === 0) return results;

  try {
    const uncachedTexts = uncachedIndices.map(i => texts[i]);
    const res = await fetch(`${API_BASE}/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts: uncachedTexts, targetLang }),
    });

    if (!res.ok) return texts;

    const data = await res.json();
    const translated = data?.translated || uncachedTexts;

    // Fill in results and update cache
    uncachedIndices.forEach((origIdx, i) => {
      const t = translated[i] || texts[origIdx];
      results[origIdx] = t;
      setCache(cacheKey(texts[origIdx], targetLang), t);
    });

    return results;
  } catch {
    return texts; // graceful degradation
  }
}

/**
 * Hook-friendly: translate an object of key→string values.
 * @param {Record<string, string>} obj
 * @param {string} targetLang
 * @returns {Promise<Record<string, string>>}
 */
export async function translateObject(obj, targetLang) {
  if (targetLang === 'EN') return obj;
  const keys = Object.keys(obj);
  const values = Object.values(obj);
  const translated = await translateBatch(values, targetLang);
  return Object.fromEntries(keys.map((k, i) => [k, translated[i]]));
}
