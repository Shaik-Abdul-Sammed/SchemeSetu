/**
 * POST /api/v1/voice/parse
 * ─────────────────────────────────────────────────────────────────────────────
 * SchemeSetu V4 Unified Voice & Verification Endpoint
 *
 * Request body:
 *   { transcript, lang, lat?, lng?, userProfile?, schemeContext? }
 *
 * Response:
 *   {
 *     intent, confidence, action, slots,
 *     userProfile,      // merged profile with newly extracted slots
 *     verifiedFact?,    // Language-Independent Structured Fact Model
 *     bankResults?,     // populated when intent === FIND_NEAREST_BANK
 *     responseText,     // verified, source-backed natural language response
 *     responseLang,     // language of responseText
 *   }
 * ─────────────────────────────────────────────────────────────────────────────
 */
'use strict';

const express = require('express');
const router = express.Router();
const { parseVoiceIntent, extractSlots, normalizeTranscript } = require('../../services/voice_intent_parser');
const dataService = require('../../services/dataService');
const { verifySchemeFact } = require('../../services/verificationEngine');
const { haversineDistance, isValidCoordinate } = require('../../utils/haversine');

// ── Language → Google Translate code ────────────────────────────────────────
const LANG_TO_GOOGLE = {
  EN: 'en', HI: 'hi', TE: 'te', TA: 'ta',
  KN: 'kn', ML: 'ml', BN: 'bn', MR: 'mr',
};

// ── Multilingual response templates ─────────────────────────────────────────
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

// ── Helper: translate via google-translate-api ──────────────────────────────
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
      _translateFn = async (text) => text;
    }
  }
  return _translateFn;
}

// ── POST /api/v1/voice/parse ─────────────────────────────────────────────────
router.post('/parse', async (req, res) => {
  try {
    const { transcript, lang = 'EN', lat, lng, userProfile = {}, schemeContext } = req.body || {};

    // Validate transcript
    if (!transcript || typeof transcript !== 'string' || transcript.trim().length === 0) {
      return res.status(400).json({ error: 'transcript is required and must be a non-empty string.' });
    }
    if (transcript.length > 500) {
      return res.status(400).json({ error: 'transcript must not exceed 500 characters.' });
    }

    const appLang = (String(lang).toUpperCase().trim().slice(0, 2)) || 'EN';
    const googleLang = LANG_TO_GOOGLE[appLang] || 'en';

    // ── 1. Parse intent & extract slots ──────────────────────────────────
    const parsed = parseVoiceIntent(transcript);
    const extractedSlots = extractSlots ? extractSlots(parsed.normalized || normalizeTranscript(transcript)) : {};

    // Merge extracted slots into profile context
    const mergedProfile = {
      ...userProfile,
      name: extractedSlots.name || userProfile.name || '',
      state: extractedSlots.state || userProfile.state || '',
      occupation: extractedSlots.occupation || userProfile.occupation || '',
      annualIncome: extractedSlots.income || userProfile.annualIncome || null,
      cost: extractedSlots.cost || extractedSlots.amount || userProfile.cost || null,
      projectType: extractedSlots.projectType || userProfile.projectType || '',
    };

    // ── 2. Run Verification Engine ───────────────────────────────────────
    const verifiedFact = verifySchemeFact({
      query: transcript,
      schemeId: schemeContext,
      userProfile: mergedProfile,
    });

    // ── 3. Handle FIND_NEAREST_BANK ──────────────────────────────────────
    let bankResults = null;
    let responseText = null;

    if (parsed.intent === 'FIND_NEAREST_BANK') {
      const hasCoords = lat !== undefined && lng !== undefined &&
        isValidCoordinate(Number(lat), Number(lng));

      if (hasCoords) {
        const userLat = Number(lat);
        const userLng = Number(lng);

        const allPartners = dataService.getPartners();
        const eligible = allPartners.filter((p) => p.fundAvailable === true);

        const schemeFilter = schemeContext || extractedSlots.projectType || mergedProfile.projectType;
        const filtered = schemeFilter
          ? eligible.filter((p) =>
              Array.isArray(p.schemes) &&
              p.schemes.some((s) => s.toLowerCase().includes(schemeFilter.toLowerCase()))
            )
          : eligible;

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

        const templateFn = BANK_RESPONSES[appLang] || BANK_RESPONSES.EN;
        responseText = templateFn(withDist);
      } else {
        const locationPrompts = {
          EN: 'To find nearby banks, I need your location. Please allow location access or type your city name.',
          HI: 'नज़दीकी बैंक खोजने के लिए मुझे आपका स्थान चाहिए। कृपया लोकेशन एक्सेस दें या अपना शहर टाइप करें।',
          TE: 'దగ్గరలోని బ్యాంకులను కనుగొనడానికి మీ లొకేషన్ అవసరం. దయచేసి లొకేషన్ అనుమతి ఇవ్వండి లేదా మీ నగరం టైప్ చేయండి.',
        };
        responseText = locationPrompts[appLang] || locationPrompts.EN;
        bankResults = [];
      }
    }

    // ── 4. Progressive Profile & Source-Backed Responses ────────────────
    if (!responseText) {
      // Check if verifiedFact matches a specific scheme
      if (verifiedFact && verifiedFact.verificationStatus !== 'uncertain') {
        const greetingPrefix = mergedProfile.name ? `Hello ${mergedProfile.name}! ` : '';
        const stateNote = mergedProfile.state ? `Based on guidelines for ${mergedProfile.state}, ` : '';
        const rawEnResponse = `${greetingPrefix}${stateNote}${verifiedFact.schemeName}: ${verifiedFact.structuredFacts.benefitText} Verified via ${verifiedFact.source.title}.`;

        if (googleLang !== 'en') {
          const translateFn = getTranslateFn();
          responseText = await translateFn(rawEnResponse, googleLang);
        } else {
          responseText = rawEnResponse;
        }
      } else {
        // Generic responses
        const genericResponses = {
          NAVIGATE_SCHEMES: {
            EN: 'Opening the government schemes portal for you.',
            HI: 'आपके लिए सरकारी योजनाओं का पोर्टल खोल रहा हूँ।',
            TE: 'మీ కోసం ప్రభుత్వ పథకాల పోర్టల్ తెరుస్తున్నాను.',
          },
          DISCOVER_SCHEMES: {
            EN: 'Finding verified government schemes matching your profile.',
            HI: 'आपकी प्रोफ़ाइल से मेल खाने वाली सत्यापित सरकारी योजनाएं खोज रहा हूँ।',
            TE: 'మీ ప్రొఫైల్‌కు సరిపోయే ధృవీకరించబడిన ప్రభుత్వ పథకాలను కనుగొంటున్నాను.',
          },
          CHECK_STATUS: {
            EN: 'Opening your application tracking status.',
            HI: 'आपके आवेदन की स्थिति देख रहा हूँ।',
            TE: 'మీ దరఖాస్తు స్థితిని చూపిస్తున్నాను.',
          },
          CHECK_ELIGIBILITY: {
            EN: 'Evaluating verified eligibility rules for your profile.',
            HI: 'आपकी प्रोफ़ाइल के लिए सत्यापित पात्रता नियमों का मूल्यांकन कर रहा हूँ।',
            TE: 'మీ ప్రొఫైల్ కోసం ధృవీకరించబడిన అర్హత నియమాలను పరిశీలిస్తున్నాను.',
          },
        };

        const intentResp = genericResponses[parsed.intent];
        if (intentResp) {
          responseText = intentResp[appLang] || intentResp.EN;
        } else if (googleLang !== 'en') {
          const translateFn = getTranslateFn();
          responseText = await translateFn(
            `Processing request for ${parsed.intent.replace(/_/g, ' ').toLowerCase()}.`,
            googleLang
          );
        } else {
          responseText = `Processing request for ${parsed.intent.replace(/_/g, ' ').toLowerCase()}.`;
        }
      }
    }

    return res.status(200).json({
      intent: parsed.intent,
      confidence: parsed.confidence,
      action: parsed.action,
      targetPage: parsed.targetPage,
      slots: {
        ...extractedSlots,
        amount: extractedSlots.amount || parsed.slots?.amount || null,
      },
      userProfile: mergedProfile,
      verifiedFact,
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
  res.json({ status: 'ok', version: '4.0', verificationEngine: true, supportedLangs: ['EN', 'HI', 'TE', 'TA', 'KN', 'ML', 'BN', 'MR'] });
});

module.exports = router;
