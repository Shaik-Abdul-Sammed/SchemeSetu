/**
 * useVoiceLanguageDetection — Automatic Spoken Language Detection for SchemeSetu
 * ─────────────────────────────────────────────────────────────────────────────
 * Detects spoken language from Web Speech API transcript or browser lang tag,
 * using Unicode script range analysis across all supported Indian languages:
 *   - Devanagari (\u0900-\u097F) -> HI (Hindi / Marathi)
 *   - Telugu (\u0C00-\u0C7F)     -> TE (Telugu)
 *   - Tamil (\u0B80-\u0BFF)      -> TA (Tamil)
 *   - Kannada (\u0C80-\u0CFF)    -> KN (Kannada)
 *   - Malayalam (\u0D00-\u0D7F)  -> ML (Malayalam)
 *   - Bengali (\u0980-\u09FF)    -> BN (Bengali)
 *   - Gujarati (\u0A80-\u0AFF)   -> GU (Gujarati)
 *   - Gurmukhi (\u0A00-\u0A7F)   -> PA (Punjabi)
 *   - Odia (\u0B00-\u0B7F)       -> OR (Odia)
 *   - Latin ([a-zA-Z])          -> EN (English)
 */

import { useState, useCallback } from 'react';

export const LANGUAGE_DISPLAY_NAMES = {
  EN: 'English',
  HI: 'Hindi (हिंदी)',
  TE: 'Telugu (తెలుగు)',
  TA: 'Tamil (தமிழ்)',
  KN: 'Kannada (ಕನ್ನಡ)',
  ML: 'Malayalam (മലയാളം)',
  BN: 'Bengali (বাংলা)',
  MR: 'Marathi (मराठी)',
  GU: 'Gujarati (ગુજરાતી)',
  PA: 'Punjabi (ਪੰਜਾਬੀ)',
  OR: 'Odia (ଓଡ଼ିଆ)',
  GON: 'Gondi (गोंडी)',
  BHI: 'Bhili (भीली)'
};

/**
 * Pure script-range language detector based on Unicode block analysis.
 * Can be tested directly in unit tests without browser runtime dependencies.
 * 
 * @param {string} text - Spoken transcript
 * @returns {string} Two-letter uppercase language code ('HI', 'TE', 'EN', etc.)
 */
export function detectLanguageFromScript(text) {
  if (!text || typeof text !== 'string') return 'EN';

  let devanagariCount = 0;
  let teluguCount = 0;
  let tamilCount = 0;
  let kannadaCount = 0;
  let malayalamCount = 0;
  let bengaliCount = 0;
  let gujaratiCount = 0;
  let punjabiCount = 0;
  let odiaCount = 0;
  let latinCount = 0;

  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    // Devanagari: 0x0900 - 0x097F
    if (code >= 0x0900 && code <= 0x097F) devanagariCount++;
    // Telugu: 0x0C00 - 0x0C7F
    else if (code >= 0x0C00 && code <= 0x0C7F) teluguCount++;
    // Tamil: 0x0B80 - 0x0BFF
    else if (code >= 0x0B80 && code <= 0x0BFF) tamilCount++;
    // Kannada: 0x0C80 - 0x0CFF
    else if (code >= 0x0C80 && code <= 0x0CFF) kannadaCount++;
    // Malayalam: 0x0D00 - 0x0D7F
    else if (code >= 0x0D00 && code <= 0x0D7F) malayalamCount++;
    // Bengali: 0x0980 - 0x09FF
    else if (code >= 0x0980 && code <= 0x09FF) bengaliCount++;
    // Gujarati: 0x0A80 - 0x0AFF
    else if (code >= 0x0A80 && code <= 0x0AFF) gujaratiCount++;
    // Gurmukhi / Punjabi: 0x0A00 - 0x0A7F
    else if (code >= 0x0A00 && code <= 0x0A7F) punjabiCount++;
    // Odia: 0x0B00 - 0x0B7F
    else if (code >= 0x0B00 && code <= 0x0B7F) odiaCount++;
    // Latin: a-z, A-Z
    else if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) latinCount++;
  }

  const counts = [
    { lang: 'TE', count: teluguCount },
    { lang: 'HI', count: devanagariCount },
    { lang: 'TA', count: tamilCount },
    { lang: 'KN', count: kannadaCount },
    { lang: 'ML', count: malayalamCount },
    { lang: 'BN', count: bengaliCount },
    { lang: 'GU', count: gujaratiCount },
    { lang: 'PA', count: punjabiCount },
    { lang: 'OR', count: odiaCount },
    { lang: 'EN', count: latinCount },
  ];

  counts.sort((a, b) => b.count - a.count);

  if (counts[0].count > 0) {
    return counts[0].lang;
  }

  return 'EN';
}

/**
 * React Hook for automatic voice language detection and live switching.
 */
export default function useVoiceLanguageDetection({ currentLang, changeLanguage, onToast } = {}) {
  const [toastMessage, setToastMessage] = useState(null);

  const detectAndSwitch = useCallback((transcript, browserLang = null) => {
    if (!transcript && !browserLang) return currentLang || 'EN';

    let detected = null;

    // 1. Inspect SpeechRecognitionResult.lang if available
    if (browserLang && typeof browserLang === 'string') {
      const norm = browserLang.toLowerCase();
      if (norm.startsWith('te')) detected = 'TE';
      else if (norm.startsWith('hi')) detected = 'HI';
      else if (norm.startsWith('ta')) detected = 'TA';
      else if (norm.startsWith('kn')) detected = 'KN';
      else if (norm.startsWith('ml')) detected = 'ML';
      else if (norm.startsWith('bn')) detected = 'BN';
      else if (norm.startsWith('mr')) detected = 'MR';
      else if (norm.startsWith('gu')) detected = 'GU';
      else if (norm.startsWith('pa')) detected = 'PA';
      else if (norm.startsWith('or')) detected = 'OR';
      else if (norm.startsWith('en')) detected = 'EN';
    }

    // 2. Fall back to robust script-range Unicode analysis
    if (!detected && transcript) {
      detected = detectLanguageFromScript(transcript);
    }

    const currentUpper = (typeof currentLang === 'string' ? currentLang : currentLang?.code || 'EN').toUpperCase();

    // 3. If detected differs from current locale, switch language and persist
    if (detected && detected !== currentUpper) {
      if (changeLanguage) {
        changeLanguage(detected);
      }

      try {
        localStorage.setItem('schemesetu_lang', detected);
        localStorage.setItem('schemesetu_lang_pref', detected);
      } catch (e) {}

      const name = LANGUAGE_DISPLAY_NAMES[detected] || detected;
      const msg = `Language switched to ${name} based on your voice`;
      setToastMessage(msg);
      if (onToast) onToast(msg);
      setTimeout(() => setToastMessage(null), 4000);

      return detected;
    }

    return currentUpper;
  }, [currentLang, changeLanguage, onToast]);

  return {
    detectLanguageFromScript,
    detectAndSwitch,
    toastMessage,
    clearToast: () => setToastMessage(null)
  };
}
