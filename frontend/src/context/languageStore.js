import en from '../locales/en.json';
import { SCHEME_PHRASE_TRANSLATIONS } from './schemeTranslations.js';
import { UI_ENRICHMENT_TRANSLATIONS } from './uiEnrichmentTranslations.js';

// Merge enrichment into English
if (typeof UI_ENRICHMENT_TRANSLATIONS !== 'undefined' && UI_ENRICHMENT_TRANSLATIONS.EN) {
  Object.assign(en, UI_ENRICHMENT_TRANSLATIONS.EN);
}

const cache = { en, EN: en };
const loaders = {
  hi: () => import('../locales/hi.json'),
  te: () => import('../locales/te.json'),
  ta: () => import('../locales/ta.json'),
  kn: () => import('../locales/kn.json'),
  ml: () => import('../locales/ml.json'),
  bn: () => import('../locales/bn.json'),
  mr: () => import('../locales/mr.json'),
  gon: () => import('../locales/gon.json'),
  bhi: () => import('../locales/bhi.json'),
  gu: () => import('../locales/gu.json'),
  pa: () => import('../locales/pa.json'),
  or: () => import('../locales/or.json'),
};

export const translations = {
  EN: en,
};

export async function loadLocale(code) {
  if (!code) return cache.en;
  const lower = String(code).toLowerCase();
  const upper = String(code).toUpperCase();
  if (cache[lower]) {
    translations[upper] = cache[lower];
    return cache[lower];
  }
  if (!loaders[lower]) {
    return cache.en;
  }
  try {
    const mod = await loaders[lower]();
    const data = mod.default || mod;
    if (typeof UI_ENRICHMENT_TRANSLATIONS !== 'undefined' && UI_ENRICHMENT_TRANSLATIONS[upper]) {
      Object.assign(data, UI_ENRICHMENT_TRANSLATIONS[upper]);
    }
    cache[lower] = data;
    cache[upper] = data;
    translations[upper] = data;
    translations[lower] = data;
    return data;
  } catch (err) {
    console.warn(`[LanguageStore] Failed to load locale ${code}:`, err);
    return cache.en;
  }
}

export function getLocaleSync(code) {
  if (!code) return cache.en;
  const lower = String(code).toLowerCase();
  const upper = String(code).toUpperCase();
  return cache[lower] || cache[upper] || cache.en;
}

export const AVAILABLE_LANGUAGES = [
  { code: 'EN', name: 'English', nativeName: 'English' },
  { code: 'HI', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'TE', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'TA', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'KN', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ML', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'BN', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'MR', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'GON', name: 'Gondi', nativeName: 'గోండీ' },
  { code: 'BHI', name: 'Bhili', nativeName: 'भीली' }
];

// Pre-index English values to keys for fast reverse lookup of English text phrases
const EN_VALUE_TO_KEY = new Map();
if (en) {
  for (const [k, v] of Object.entries(en)) {
    if (typeof v === 'string' && v.trim()) {
      const norm = v.trim().toLowerCase();
      if (!EN_VALUE_TO_KEY.has(norm)) {
        EN_VALUE_TO_KEY.set(norm, k);
      }
    }
  }
}

// Pre-index phrase translations lowercased
const PHRASE_LOWER_MAP = {};
if (typeof SCHEME_PHRASE_TRANSLATIONS !== 'undefined') {
  for (const [l, dict] of Object.entries(SCHEME_PHRASE_TRANSLATIONS)) {
    PHRASE_LOWER_MAP[l] = new Map();
    for (const [phrase, translated] of Object.entries(dict)) {
      if (typeof phrase === 'string') {
        PHRASE_LOWER_MAP[l].set(phrase.trim().toLowerCase(), translated);
      }
    }
  }
}

export function getTranslation(lang, key, fallback = '') {
  if (key === undefined || key === null || key === '') return fallback || '';
  const langKey = String(lang || 'EN').toUpperCase();
  const langDict = getLocaleSync(langKey);
  const searchStr = String(key).trim();
  const lowerSearch = searchStr.toLowerCase();

  // 1. Direct key match (e.g. 'brandTitle', 'exploreSchemes')
  if (langDict && langDict[key] !== undefined && langDict[key] !== null && langDict[key] !== '') {
    return langDict[key];
  }

  // 2. Direct match in Scheme Phrase Translations
  if (SCHEME_PHRASE_TRANSLATIONS && SCHEME_PHRASE_TRANSLATIONS[langKey]) {
    if (SCHEME_PHRASE_TRANSLATIONS[langKey][searchStr]) {
      return SCHEME_PHRASE_TRANSLATIONS[langKey][searchStr];
    }
  }

  // 3. Lowercase match in Scheme Phrase Translations
  if (PHRASE_LOWER_MAP[langKey] && PHRASE_LOWER_MAP[langKey].has(lowerSearch)) {
    return PHRASE_LOWER_MAP[langKey].get(lowerSearch);
  }

  // 4. Match against English translation values (reverse lookup)
  const resolvedKey = EN_VALUE_TO_KEY.get(lowerSearch);
  if (resolvedKey && langDict && langDict[resolvedKey]) {
    return langDict[resolvedKey];
  }

  // 4.5 Stripped punctuation / counter variants (e.g. 'Home:', 'Loading...', 'Explore (19)', 'Already registered?')
  if (langKey !== 'EN') {
    const parenMatch = searchStr.match(/^(.*?)(\s*\(\d+\))$/);
    if (parenMatch) {
      const core = parenMatch[1].trim();
      const suffix = parenMatch[2];
      const coreTrans = getTranslation(langKey, core);
      if (coreTrans && coreTrans !== core) {
        return coreTrans + suffix;
      }
    }

    const punctMatch = searchStr.match(/^(.+?)([:.?!]+|\.{3})$/);
    if (punctMatch) {
      const core = punctMatch[1].trim();
      const punct = punctMatch[2];
      const coreTrans = getTranslation(langKey, core);
      if (coreTrans && coreTrans !== core) {
        return coreTrans + punct;
      }
    }
  }

  // 5. Fallback phrase lookup
  if (fallback && fallback !== key) {
    const fallbackStr = String(fallback).trim();
    if (langDict && langDict[fallbackStr]) return langDict[fallbackStr];
    if (SCHEME_PHRASE_TRANSLATIONS && SCHEME_PHRASE_TRANSLATIONS[langKey]?.[fallbackStr]) {
      return SCHEME_PHRASE_TRANSLATIONS[langKey][fallbackStr];
    }
    const fallbackResolvedKey = EN_VALUE_TO_KEY.get(fallbackStr.toLowerCase());
    if (fallbackResolvedKey && langDict && langDict[fallbackResolvedKey]) {
      return langDict[fallbackResolvedKey];
    }
  }

  // 6. English dictionary fallback
  const enDict = cache.en || translations.EN;
  if (enDict && enDict[key] !== undefined && enDict[key] !== null && enDict[key] !== '') {
    return enDict[key];
  }

  return fallback || key;
}
