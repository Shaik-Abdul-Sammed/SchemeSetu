/**
 * languageDetector.js — Script & Dialect Auto-Detection Engine
 * ─────────────────────────────────────────────────────────────────────────────
 * Detects script type and language family from raw transcript text:
 *   - Devanagari (\u0900-\u097F) -> Hindi
 *   - Telugu (\u0C00-\u0C7F) -> Telugu
 *   - Tamil (\u0B80-\u0BFF) -> Tamil
 *   - Latin Script -> English / Hinglish / Telugish
 */
'use strict';

export function detectLanguageFromText(text = '') {
  if (!text || typeof text !== 'string') return 'en-IN';
  if (/[\u0900-\u097F]/.test(text)) return 'hi-IN';
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te-IN';
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta-IN';
  const lower = text.toLowerCase();
  if (/\b(kavali|ekkada|pathakam|pathakalu|kante|dagarina|rendu|moodu)\b/.test(lower)) return 'te-IN';
  if (/\b(chahiye|yojana|karz|rin|kheti|vyapar|dhundho|nazdeeki|paas)\b/.test(lower)) return 'hi-IN';
  return 'en-IN';
}

export function detectLanguage(text = '', stateDefault = 'EN') {
  const bcp = detectLanguageFromText(text);
  let langCode = 'EN';
  if (bcp.startsWith('hi')) langCode = 'HI';
  else if (bcp.startsWith('te')) langCode = 'TE';
  else if (bcp.startsWith('ta')) langCode = 'TA';

  return {
    detectedLang: langCode,
    confidence: 0.85,
    bcp47: bcp,
    isMixed: false,
    mixedLangs: [langCode],
  };
}

export function resolveEffectiveLang({ explicitLang, detectedLang, detectedConfidence, stateDefaultLang, confidenceThreshold = 0.65 }) {
  if (explicitLang) return explicitLang;
  if (detectedLang && detectedConfidence >= confidenceThreshold) return detectedLang;
  if (stateDefaultLang) return stateDefaultLang;
  return 'EN';
}

export function getMixedLanguageLabel(mixedLangs = []) {
  if (!mixedLangs || mixedLangs.length === 0) return 'English';
  return mixedLangs.join('-') + ' Code-Mixed';
}
