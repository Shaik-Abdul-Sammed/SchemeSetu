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
const { queryKnowledgeBase } = require('../../services/ragService');

// ── Language → Google Translate code ────────────────────────────────────────
const LANG_TO_GOOGLE = {
  EN: 'en', HI: 'hi', TE: 'te', TA: 'ta',
  KN: 'kn', ML: 'ml', BN: 'bn', MR: 'mr',
};

/**
 * Detect language from script or transliteration keywords
 */
function detectLanguage(text = '', defaultLang = 'EN') {
  if (!text || typeof text !== 'string') return defaultLang || 'EN';
  const trimmed = text.trim();
  if (!trimmed) return defaultLang || 'EN';

  // 1. Script-based detection
  if (/[\u0C00-\u0C7F]/.test(trimmed)) return 'TE';
  if (/[\u0B80-\u0BFF]/.test(trimmed)) return 'TA';
  if (/[\u0C80-\u0CFF]/.test(trimmed)) return 'KN';
  if (/[\u0D00-\u0D7F]/.test(trimmed)) return 'ML';
  if (/[\u0980-\u09FF]/.test(trimmed)) return 'BN';
  if (/[\u0900-\u097F]/.test(trimmed)) {
    if (/(?:^|\s|[.,!?।])(आहे|कशी|सांगा|माझे|मला|नाही|काय|करावे|पाहिजे|मिळेल)(?:$|\s|[.,!?।])/u.test(trimmed)) return 'MR';
    return 'HI';
  }

  // 2. Romanized keywords
  const lower = trimmed.toLowerCase();
  if (/\b(naaku|ela|kavali|cheppandi|pathakam|dharakhasthu|daggara|namaskaram|undi|raaledu|chudandi|ayithe|enti|edhi|sahayam)\b/.test(lower)) return 'TE';
  if (/\b(mujhe|kya|kaise|karo|batao|chahiye|yojana|yojna|paise|kisan|dastavej|aavedan|shuru|kitna|milega|samjhao|bataiye|namaste)\b/.test(lower)) return 'HI';
  if (/\b(enakku|eppadi|venum|thittam|solunga|kadan|vanakkam|illai|evvalavu)\b/.test(lower)) return 'TA';
  if (/\b(nanage|hege|beku|yojane|heli|namaskara|sallisi)\b/.test(lower)) return 'KN';
  if (/\b(enikku|enganeya|venam|padhathi|parayu|namaskaram)\b/.test(lower)) return 'ML';
  if (/\b(aamar|kivabe|chai|prokolpo|bolun|nomoshkar|taka)\b/.test(lower)) return 'BN';
  if (/\b(mala|kasa|pahije|yojana|saanga|namaskar|ahe)\b/.test(lower)) return 'MR';

  return defaultLang || 'EN';
}

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
  if (!process.env.XDG_CONFIG_HOME) process.env.XDG_CONFIG_HOME = '/tmp';
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

    // Auto-detect language from transcript if different from passed lang
    const detectedLang = detectLanguage(transcript, String(lang).toUpperCase().trim().slice(0, 2) || 'EN');
    const appLang = detectedLang;
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
    let quickFollowUps = ['Find Nearest Bank', 'Required Documents', 'Check Eligibility'];
    let matchedSchemes = [];

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
        quickFollowUps = ['Required Documents for Bank', '₹5L MUDRA Loan', 'Apply Online'];
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

    // ── 4. Conversational Knowledge & RAG-Backed ChatGPT Answering ────────
    if (!responseText) {
      const qLower = transcript.toLowerCase();
      let rawEnResponse = '';

      // Check RAG Knowledge Base first
      let ragResult = null;
      try {
        ragResult = queryKnowledgeBase(transcript, 2, 0.18);
      } catch (e) {
        // RAG optional
      }

      // Greetings
      if (/^(hi|hello|hey|namaste|vanakkam|namaskaram|nomoshkar|pranam)\b/i.test(qLower) || qLower === 'hi' || qLower === 'hello') {
        rawEnResponse = "Hello! I am SchemeSetu AI Assistant, here to answer your welfare questions in simple words just like ChatGPT. Ask me about loans, subsidies, eligibility, or how to apply for schemes!";
        quickFollowUps = ['₹5L MUDRA Loan', 'What is Subsidy?', 'SC Dalit Bandhu Grant', 'Find Nearest Bank'];
      }
      // Explanation: What is subsidy?
      else if (qLower.includes('what is subsidy') || qLower.includes('subsidy kya') || qLower.includes('subsidy ante') || qLower.includes('subsidy')) {
        rawEnResponse = "In simple words: A subsidy is free financial grant money from the government that you NEVER have to pay back! For example, under PMEGP, if you start a business with ₹10 Lakhs, the government provides up to 35% (₹3.5 Lakh) as a grant, and you only borrow ₹6.5 Lakh from the bank.";
        quickFollowUps = ['PMEGP 35% Subsidy', 'Collateral-free Loan', 'Required Documents'];
      }
      // Explanation: What is collateral-free?
      else if (qLower.includes('collateral') || qLower.includes('guarantee') || qLower.includes('girvi') || qLower.includes('bina guarantee')) {
        rawEnResponse = "A collateral-free loan means you do NOT need to mortgage your house, land, or gold. Under government credit guarantee funds (like CGTMSE & CGFMU), the Government of India acts as your guarantor for loans up to ₹20 Lakhs in MUDRA and ₹50 Lakhs in PMEGP.";
        quickFollowUps = ['Apply for MUDRA', 'PMEGP Subsidy', 'Required Documents'];
      }
      // Specific scheme verification fact matched
      else if (verifiedFact && verifiedFact.verificationStatus !== 'uncertain') {
        const greetingPrefix = mergedProfile.name ? `Hello ${mergedProfile.name}! ` : '';
        const stateNote = mergedProfile.state ? `Based on guidelines for ${mergedProfile.state}, ` : '';
        rawEnResponse = `${greetingPrefix}${stateNote}${verifiedFact.schemeName}: ${verifiedFact.structuredFacts.benefitText} Verified via ${verifiedFact.source.title}.`;
        quickFollowUps = ['What documents are required?', 'Find Nearest Bank', 'Check My Eligibility'];
      }
      // RAG Knowledge Base match
      else if (ragResult && ragResult.found && ragResult.results.length > 0) {
        const topChunk = ragResult.results[0];
        const cleanContent = topChunk.excerpt.replace(/\s+/g, ' ').slice(0, 320);
        rawEnResponse = `Based on verified official guidelines from ${topChunk.docTitle}: ${cleanContent}.`;
        quickFollowUps = ['How do I apply?', 'Find Nearest Bank', 'Check My Eligibility'];
      }
      // Generic Intent responses fallback
      else {
        const genericResponses = {
          NAVIGATE_SCHEMES: 'Opening the government schemes portal for you. You can explore Central and State welfare initiatives matching your goals.',
          DISCOVER_SCHEMES: 'Finding verified government schemes matching your profile and business category.',
          CHECK_STATUS: 'Opening your application tracking status to check live progress.',
          CHECK_ELIGIBILITY: 'Evaluating verified eligibility rules and subsidy entitlement for your profile.',
        };

        const intentResp = genericResponses[parsed.intent];
        if (intentResp) {
          rawEnResponse = intentResp;
        } else {
          rawEnResponse = `SchemeSetu can assist you with government loans up to ₹20 Lakhs without collateral, subsidies up to 35%, and welfare schemes for entrepreneurs, artisans, farmers, and citizens. What specific assistance would you like to explore?`;
        }
      }

      // Check for matching schemes in database
      const allSchemes = dataService.getSchemes ? dataService.getSchemes() : [];
      matchedSchemes = allSchemes.filter(s => {
        const sName = (s.name || '').toLowerCase();
        const sDesc = (s.description || s.summary || '').toLowerCase();
        return qLower.split(' ').some(w => w.length > 3 && (sName.includes(w) || sDesc.includes(w)));
      }).slice(0, 3);

      // Translate response to target language if not English
      if (googleLang !== 'en' && rawEnResponse) {
        try {
          const translateFn = getTranslateFn();
          responseText = await translateFn(rawEnResponse, googleLang);
        } catch (e) {
          responseText = rawEnResponse;
        }
      } else {
        responseText = rawEnResponse;
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
      matchedSchemes,
      quickFollowUps,
      responseText,
      responseLang: appLang,
      detectedLang: appLang,
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
module.exports.detectLanguage = detectLanguage;
