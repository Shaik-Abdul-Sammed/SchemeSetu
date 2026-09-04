/**
 * POST /api/v1/voice/parse
 * ─────────────────────────────────────────────────────────────────────────────
 * Unified voice processing endpoint.
 *
 * Request body:
 *   { transcript, lang, lat?, lng?, schemeContext? }
 *
 * Response:
 *   {
 *     intent, confidence, action, slots,
 *     bankResults?,      // populated when intent === FIND_NEAREST_BANK
 *     responseText,      // English default (translate if lang !== 'EN')
 *     responseLang,      // final language of responseText
 *     detectedSlots,     // extracted amounts, occupation, projectType
 *   }
 * ─────────────────────────────────────────────────────────────────────────────
 */
'use strict';

const express = require('express');
const router = express.Router();
const { parseVoiceIntent, extractSlots, normalizeTranscript } = require('../../services/voice_intent_parser');
const dataService = require('../../services/dataService');
const { haversineDistance, isValidCoordinate } = require('../../utils/haversine');

// ── Language → Google Translate code ────────────────────────────────────────
const LANG_TO_GOOGLE = {
  EN: 'en', HI: 'hi', TE: 'te', TA: 'ta',
  KN: 'kn', ML: 'ml', BN: 'bn', MR: 'mr',
};

// ── Multilingual response templates ─────────────────────────────────────────
// Keeps frequently-used short strings out of the translate API to reduce
// latency. The translate fallback handles anything not listed here.
const BANK_RESPONSES = {
  EN: (banks) => banks.length > 0
    ? `The nearest relevant bank is ${banks[0].name}, approximately ${banks[0].distanceText} away at ${banks[0].address || 'nearby'}. ${banks.length > 1 ? `${banks.length - 1} more option${banks.length > 2 ? 's' : ''} found nearby.` : ''}`
    : 'No banks found within 50 km. Please enter your city or PIN code to search again.',
  HI: (banks) => banks.length > 0
    ? `सबसे नज़दीकी बैंक ${banks[0].name} है, जो लगभग ${banks[0].distanceText} दूर है।`
    : 'आपके 50 किमी के दायरे में कोई बैंक नहीं मिला। कृपया अपना शहर या पिन कोड दर्ज करें।',
  TE: (banks) => banks.length > 0
    ? `మీకు సమీపంలో ఉన్న బ్యాంక్ ${banks[0].name}, దాదాపు ${banks[0].distanceText} దూరంలో ఉంది.`
    : '50 కి.మీ. దూరంలో బ్యాంక్ దొరకలేదు. మీ నగరం లేదా పిన్ కోడ్ నమోదు చేయండి.',
};

// ── Helper: translate via internal route (same process) ──────────────────────
// This avoids an extra HTTP hop by requiring the translate service directly.
let _translateFn = null;
function getTranslateFn() {
  if (!_translateFn) {
    try {
      const translate = require('google-translate-api');
      _translateFn = async (text, googleLang) => {
        if (googleLang === 'en' || !text) return text;
        try {
          const result = await translate(text, { to: googleLang });
          return result?.text || text;
        } catch {
          return text; // fallback: return English
        }
      };
    } catch {
      _translateFn = async (text) => text; // module not available
    }
  }
  return _translateFn;
}

// ── POST /api/v1/voice/parse ─────────────────────────────────────────────────
router.post('/parse', async (req, res) => {
  try {
    const { transcript, lang = 'EN', lat, lng, schemeContext } = req.body || {};

    // Validate transcript
    if (!transcript || typeof transcript !== 'string' || transcript.trim().length === 0) {
      return res.status(400).json({ error: 'transcript is required and must be a non-empty string.' });
    }
    if (transcript.length > 500) {
      return res.status(400).json({ error: 'transcript must not exceed 500 characters.' });
    }

    const appLang = (String(lang).toUpperCase().trim().slice(0, 2)) || 'EN';
    const googleLang = LANG_TO_GOOGLE[appLang] || 'en';

    // ── 1. Parse intent ──────────────────────────────────────────────────
    const parsed = parseVoiceIntent(transcript);
    const slots = extractSlots ? extractSlots(parsed.normalized || normalizeTranscript(transcript)) : {};

    // ── 2. Handle FIND_NEAREST_BANK ──────────────────────────────────────
    let bankResults = null;
    let responseText = null;

    if (parsed.intent === 'FIND_NEAREST_BANK') {
      const hasCoords = lat !== undefined && lng !== undefined &&
        isValidCoordinate(Number(lat), Number(lng));

      if (hasCoords) {
        const userLat = Number(lat);
        const userLng = Number(lng);

        // Get all partners from data service
        const allPartners = dataService.getPartners();
        const eligible = allPartners.filter((p) => p.fundAvailable === true);

        // Filter by scheme if slot says so
        const schemeFilter = schemeContext || slots.projectType;
        const filtered = schemeFilter
          ? eligible.filter((p) =>
              Array.isArray(p.schemes) &&
              p.schemes.some((s) => s.toLowerCase().includes(schemeFilter.toLowerCase()))
            )
          : eligible;

        // Compute distances and sort
        const withDist = filtered
          .map((p) => {
            const pLat = p.coordinates?.lat;
            const pLng = p.coordinates?.lng;
            if (!isValidCoordinate(pLat, pLng)) return null;
            const distance = haversineDistance(userLat, userLng, pLat, pLng);
            return { ...p, distance, distanceText: `${distance.toFixed(1)} km` };
          })
          .filter(Boolean)
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 5);

        bankResults = withDist;

        // Build voice response in user's language
        const templateFn = BANK_RESPONSES[appLang] || BANK_RESPONSES.EN;
        responseText = templateFn(withDist);

      } else {
        // No coordinates — ask for location
        const locationPrompts = {
          EN: 'To find nearby banks, I need your location. Please allow location access or type your city name.',
          HI: 'नज़दीकी बैंक खोजने के लिए मुझे आपका स्थान चाहिए। कृपया लोकेशन एक्सेस दें या अपना शहर टाइप करें।',
          TE: 'దగ్గరలోని బ్యాంకులను కనుగొనడానికి మీ లొకేషన్ అవసరం. దయచేసి లొకేషన్ అనుమతి ఇవ్వండి లేదా మీ నగరం టైప్ చేయండి.',
        };
        responseText = locationPrompts[appLang] || locationPrompts.EN;
        bankResults = [];
      }
    }

    // ── 3. Generic response for other intents (translate if non-EN) ──────
    if (!responseText) {
      const genericResponses = {
        NAVIGATE_SCHEMES: {
          EN: 'Opening the schemes list for you.',
          HI: 'आपके लिए योजनाओं की सूची खोल रहा हूँ।',
          TE: 'మీ కోసం పథకాల జాబితా తెరుస్తున్నాను.',
        },
        DISCOVER_SCHEMES: {
          EN: 'Let me find the best matching schemes for you.',
          HI: 'मैं आपके लिए सबसे उपयुक्त योजनाएं खोज रहा हूँ।',
          TE: 'మీకు సరిపోయే పథకాలను కనుగొంటున్నాను.',
        },
        CHECK_STATUS: {
          EN: 'Opening your application status.',
          HI: 'आपके आवेदन की स्थिति देख रहा हूँ।',
          TE: 'మీ దరఖాస్తు స్థితిని చూపిస్తున్నాను.',
        },
        CHECK_ELIGIBILITY: {
          EN: 'Let me check which schemes you qualify for.',
          HI: 'देखते हैं आप किन योजनाओं के योग्य हैं।',
          TE: 'మీకు ఏ పథకాలు వర్తిస్తాయో చూద్దాం.',
        },
      };

      const intentResponses = genericResponses[parsed.intent];
      if (intentResponses) {
        responseText = intentResponses[appLang] || intentResponses.EN;
      } else if (googleLang !== 'en') {
        // Fallback: translate English placeholder
        const translateFn = getTranslateFn();
        responseText = await translateFn(
          `I understood you want to: ${parsed.intent.replace(/_/g, ' ').toLowerCase()}. Processing your request.`,
          googleLang
        );
      } else {
        responseText = `Processing: ${parsed.intent.replace(/_/g, ' ').toLowerCase()}.`;
      }
    }

    return res.status(200).json({
      intent: parsed.intent,
      confidence: parsed.confidence,
      action: parsed.action,
      targetPage: parsed.targetPage,
      slots: {
        ...slots,
        amount: slots.amount || parsed.slots?.amount || null,
        projectType: slots.projectType || parsed.slots?.projectType || null,
        occupation: slots.occupation || parsed.slots?.occupation || null,
      },
      bankResults,
      responseText,
      responseLang: appLang,
      normalized: parsed.normalized,
    });

  } catch (err) {
    console.error('[voice/parse]', err.message);
    return res.status(500).json({ error: 'Voice processing failed. Please try again.' });
  }
});

// ── GET /api/v1/voice/health ─────────────────────────────────────────────────
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', version: '3.0', supportedLangs: ['EN', 'HI', 'TE', 'TA', 'KN', 'ML', 'BN', 'MR'] });
});

module.exports = router;
