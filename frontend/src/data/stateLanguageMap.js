/**
 * stateLanguageMap.js — Indian State → Default Language Configuration
 * ─────────────────────────────────────────────────────────────────────
 * Single source of truth used by:
 *   - useLanguageDetection hook
 *   - LocationContext (location → default language)
 *   - VoiceLanguageBar (display)
 *   - voice_intent_parser (expected language context)
 *
 * languageCode: app language code matching LanguageContext LANGUAGES
 * bcp47: BCP-47 locale for Web Speech API (recognition.lang)
 * googleCode: Google Translate API code (for /api/v1/translate)
 * script: Unicode script name for language detection
 */

export const STATE_LANGUAGE_MAP = {
  // ── South India ──────────────────────────────────────────────────────
  'Andhra Pradesh':    { languageCode: 'TE', bcp47: 'te-IN', googleCode: 'te', displayName: 'Telugu',    script: 'Telugu'     },
  'Telangana':         { languageCode: 'TE', bcp47: 'te-IN', googleCode: 'te', displayName: 'Telugu',    script: 'Telugu'     },
  'Karnataka':         { languageCode: 'KN', bcp47: 'kn-IN', googleCode: 'kn', displayName: 'Kannada',   script: 'Kannada'    },
  'Tamil Nadu':        { languageCode: 'TA', bcp47: 'ta-IN', googleCode: 'ta', displayName: 'Tamil',     script: 'Tamil'      },
  'Kerala':            { languageCode: 'ML', bcp47: 'ml-IN', googleCode: 'ml', displayName: 'Malayalam', script: 'Malayalam'  },

  // ── West India ───────────────────────────────────────────────────────
  'Maharashtra':       { languageCode: 'MR', bcp47: 'mr-IN', googleCode: 'mr', displayName: 'Marathi',   script: 'Devanagari' },
  'Goa':               { languageCode: 'MR', bcp47: 'mr-IN', googleCode: 'mr', displayName: 'Marathi',   script: 'Devanagari' },
  'Gujarat':           { languageCode: 'EN', bcp47: 'en-IN', googleCode: 'en', displayName: 'English',   script: 'Latin'      },

  // ── East India ───────────────────────────────────────────────────────
  'West Bengal':       { languageCode: 'BN', bcp47: 'bn-IN', googleCode: 'bn', displayName: 'Bengali',   script: 'Bengali'    },
  'Odisha':            { languageCode: 'EN', bcp47: 'en-IN', googleCode: 'en', displayName: 'English',   script: 'Latin'      },
  'Assam':             { languageCode: 'EN', bcp47: 'en-IN', googleCode: 'en', displayName: 'English',   script: 'Latin'      },

  // ── North India (Hindi belt) ──────────────────────────────────────────
  'Uttar Pradesh':     { languageCode: 'HI', bcp47: 'hi-IN', googleCode: 'hi', displayName: 'Hindi',     script: 'Devanagari' },
  'Bihar':             { languageCode: 'HI', bcp47: 'hi-IN', googleCode: 'hi', displayName: 'Hindi',     script: 'Devanagari' },
  'Madhya Pradesh':    { languageCode: 'HI', bcp47: 'hi-IN', googleCode: 'hi', displayName: 'Hindi',     script: 'Devanagari' },
  'Rajasthan':         { languageCode: 'HI', bcp47: 'hi-IN', googleCode: 'hi', displayName: 'Hindi',     script: 'Devanagari' },
  'Haryana':           { languageCode: 'HI', bcp47: 'hi-IN', googleCode: 'hi', displayName: 'Hindi',     script: 'Devanagari' },
  'Jharkhand':         { languageCode: 'HI', bcp47: 'hi-IN', googleCode: 'hi', displayName: 'Hindi',     script: 'Devanagari' },
  'Chhattisgarh':      { languageCode: 'HI', bcp47: 'hi-IN', googleCode: 'hi', displayName: 'Hindi',     script: 'Devanagari' },
  'Uttarakhand':       { languageCode: 'HI', bcp47: 'hi-IN', googleCode: 'hi', displayName: 'Hindi',     script: 'Devanagari' },
  'Himachal Pradesh':  { languageCode: 'HI', bcp47: 'hi-IN', googleCode: 'hi', displayName: 'Hindi',     script: 'Devanagari' },
  'Delhi':             { languageCode: 'HI', bcp47: 'hi-IN', googleCode: 'hi', displayName: 'Hindi',     script: 'Devanagari' },
  'Jammu & Kashmir':   { languageCode: 'HI', bcp47: 'hi-IN', googleCode: 'hi', displayName: 'Hindi',     script: 'Devanagari' },
  'Ladakh':            { languageCode: 'HI', bcp47: 'hi-IN', googleCode: 'hi', displayName: 'Hindi',     script: 'Devanagari' },

  // ── Punjab ───────────────────────────────────────────────────────────
  'Punjab':            { languageCode: 'HI', bcp47: 'hi-IN', googleCode: 'hi', displayName: 'Hindi',     script: 'Devanagari' },

  // ── Northeast ────────────────────────────────────────────────────────
  'Manipur':           { languageCode: 'EN', bcp47: 'en-IN', googleCode: 'en', displayName: 'English',   script: 'Latin'      },
  'Meghalaya':         { languageCode: 'EN', bcp47: 'en-IN', googleCode: 'en', displayName: 'English',   script: 'Latin'      },
  'Mizoram':           { languageCode: 'EN', bcp47: 'en-IN', googleCode: 'en', displayName: 'English',   script: 'Latin'      },
  'Nagaland':          { languageCode: 'EN', bcp47: 'en-IN', googleCode: 'en', displayName: 'English',   script: 'Latin'      },
  'Tripura':           { languageCode: 'BN', bcp47: 'bn-IN', googleCode: 'bn', displayName: 'Bengali',   script: 'Bengali'    },
  'Sikkim':            { languageCode: 'EN', bcp47: 'en-IN', googleCode: 'en', displayName: 'English',   script: 'Latin'      },
  'Arunachal Pradesh': { languageCode: 'EN', bcp47: 'en-IN', googleCode: 'en', displayName: 'English',   script: 'Latin'      },
};

/** English is always the universal fallback */
export const DEFAULT_LANGUAGE = {
  languageCode: 'EN', bcp47: 'en-IN', googleCode: 'en', displayName: 'English', script: 'Latin',
};

/**
 * Get the default language config for a given state name.
 * Falls back to English if state not found.
 */
export function getDefaultLangForState(stateName) {
  if (!stateName) return DEFAULT_LANGUAGE;
  // Try exact match first, then case-insensitive
  return (
    STATE_LANGUAGE_MAP[stateName] ||
    Object.entries(STATE_LANGUAGE_MAP).find(
      ([k]) => k.toLowerCase() === stateName.toLowerCase()
    )?.[1] ||
    DEFAULT_LANGUAGE
  );
}

/**
 * All supported language codes in this app.
 * Maps app code → full config including BCP-47 and Google code.
 */
export const SUPPORTED_LANGUAGES = {
  EN: { languageCode: 'EN', bcp47: 'en-IN', googleCode: 'en', displayName: 'English',    nativeName: 'English',    script: 'Latin'      },
  HI: { languageCode: 'HI', bcp47: 'hi-IN', googleCode: 'hi', displayName: 'Hindi',      nativeName: 'हिन्दी',     script: 'Devanagari' },
  TE: { languageCode: 'TE', bcp47: 'te-IN', googleCode: 'te', displayName: 'Telugu',     nativeName: 'తెలుగు',    script: 'Telugu'     },
  TA: { languageCode: 'TA', bcp47: 'ta-IN', googleCode: 'ta', displayName: 'Tamil',      nativeName: 'தமிழ்',     script: 'Tamil'      },
  KN: { languageCode: 'KN', bcp47: 'kn-IN', googleCode: 'kn', displayName: 'Kannada',    nativeName: 'ಕನ್ನಡ',     script: 'Kannada'    },
  ML: { languageCode: 'ML', bcp47: 'ml-IN', googleCode: 'ml', displayName: 'Malayalam',  nativeName: 'മലയാളം',   script: 'Malayalam'  },
  BN: { languageCode: 'BN', bcp47: 'bn-IN', googleCode: 'bn', displayName: 'Bengali',    nativeName: 'বাংলা',     script: 'Bengali'    },
  MR: { languageCode: 'MR', bcp47: 'mr-IN', googleCode: 'mr', displayName: 'Marathi',    nativeName: 'मराठी',     script: 'Devanagari' },
};
