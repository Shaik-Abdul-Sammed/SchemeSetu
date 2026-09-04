/**
 * useLanguageDetection.js — React hook for runtime language detection
 * ─────────────────────────────────────────────────────────────────────
 * Maintains the full language priority chain:
 *   1. explicitLang (user picks from selector → 'AUTO' means auto)
 *   2. detectedLang (from last transcript via detectLanguage())
 *   3. stateDefaultLang (from LocationContext → stateLanguageMap)
 *   4. 'EN' fallback
 *
 * Also provides the correct BCP-47 locale for Web Speech API
 * and the Google Translate code for backend calls.
 */
import { useState, useCallback, useRef } from 'react';
import { detectLanguage, resolveEffectiveLang, getMixedLanguageLabel } from '../utils/languageDetector';
import { getDefaultLangForState, SUPPORTED_LANGUAGES } from '../data/stateLanguageMap';

const CONFIDENCE_THRESHOLD = 0.65; // Minimum confidence to trust detection

/**
 * @param {object} options
 * @param {string}      options.stateName       - Current state from LocationContext (e.g. 'Andhra Pradesh')
 * @param {string|null} [options.initialExplicit] - Pre-set user choice from localStorage
 */
export default function useLanguageDetection({ stateName, initialExplicit = null } = {}) {
  // Tier 1: Explicit user preference ('AUTO' = let system decide)
  const [explicitLang, setExplicitLang] = useState(
    () => initialExplicit || localStorage.getItem('schemesetu_lang_pref') || 'AUTO'
  );

  // Tier 2: Detection result from last transcript
  const [detectionResult, setDetectionResult] = useState(null);
  // { detectedLang, confidence, script, isMixed, mixedLangs, method }

  // History of per-turn language switches for context
  const langHistoryRef = useRef([]);

  // ── Computed: state default ──────────────────────────────────────────
  const stateDefault = getDefaultLangForState(stateName);
  const stateDefaultLang = stateDefault?.languageCode || 'EN';

  // ── Computed: effective language ──────────────────────────────────────
  const effectiveLang = resolveEffectiveLang({
    explicitLang: explicitLang === 'AUTO' ? null : explicitLang,
    detectedLang: detectionResult?.detectedLang || null,
    detectedConfidence: detectionResult?.confidence || 0,
    stateDefaultLang,
    confidenceThreshold: CONFIDENCE_THRESHOLD,
  });

  // ── Computed: BCP-47 locale for recognition.lang ──────────────────────
  const effectiveBcp47 = SUPPORTED_LANGUAGES[effectiveLang]?.bcp47 || 'en-IN';

  // ── Computed: Google Translate code ──────────────────────────────────
  const effectiveGoogleCode = SUPPORTED_LANGUAGES[effectiveLang]?.googleCode || 'en';

  // ── Computed: display label ───────────────────────────────────────────
  const displayLabel = (() => {
    if (detectionResult?.isMixed && detectionResult?.mixedLangs?.length > 1) {
      return getMixedLanguageLabel(detectionResult.mixedLangs);
    }
    return SUPPORTED_LANGUAGES[effectiveLang]?.displayName || 'English';
  })();

  // ── Actions ───────────────────────────────────────────────────────────

  /**
   * Run language detection on a new transcript.
   * Called by InputHub after each STT result.
   */
  const analyzeTranscript = useCallback((transcript) => {
    if (!transcript || transcript.trim().length < 2) return;

    const result = detectLanguage(transcript, stateDefaultLang);
    setDetectionResult(result);

    // Record in history
    langHistoryRef.current.push({
      transcript: transcript.substring(0, 50),
      result,
      timestamp: Date.now(),
    });

    // Keep only last 10 turns
    if (langHistoryRef.current.length > 10) {
      langHistoryRef.current = langHistoryRef.current.slice(-10);
    }

    return result;
  }, [stateDefaultLang]);

  /**
   * User explicitly selects a language.
   * Pass 'AUTO' to return to auto-detect mode.
   */
  const setUserLanguage = useCallback((langCode) => {
    setExplicitLang(langCode);
    // Persist across sessions
    if (langCode === 'AUTO') {
      localStorage.removeItem('schemesetu_lang_pref');
    } else {
      localStorage.setItem('schemesetu_lang_pref', langCode);
    }
    // Clear detection so explicit takes over immediately
    setDetectionResult(null);
  }, []);

  /**
   * Reset detection state (e.g. when conversation resets).
   */
  const reset = useCallback(() => {
    setDetectionResult(null);
    langHistoryRef.current = [];
  }, []);

  /**
   * Returns whether a language switch occurred since last call.
   * Used to decide whether to re-initialize the STT recognizer.
   */
  const lastEffectiveLangRef = useRef(effectiveLang);
  const didLanguageSwitch = effectiveLang !== lastEffectiveLangRef.current;
  lastEffectiveLangRef.current = effectiveLang;

  return {
    // State
    explicitLang,            // 'AUTO' | 'EN' | 'HI' | 'TE' | ...
    detectionResult,         // full detection object from detectLanguage()
    stateDefaultLang,        // from state name
    effectiveLang,           // resolved app lang code
    effectiveBcp47,          // for recognition.lang (e.g. 'te-IN')
    effectiveGoogleCode,     // for /api/v1/translate (e.g. 'te')
    displayLabel,            // human-readable (e.g. 'Telugu-English')
    confidence: detectionResult?.confidence || 0,
    isMixed: detectionResult?.isMixed || false,
    mixedLangs: detectionResult?.mixedLangs || [],
    didLanguageSwitch,

    // Actions
    analyzeTranscript,
    setUserLanguage,
    reset,
  };
}
