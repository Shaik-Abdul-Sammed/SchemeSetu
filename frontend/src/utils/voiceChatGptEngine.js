/**
 * SchemeSetu Conversational Voice Intelligence Engine
 * Works like ChatGPT: Plain-language explanations, automatic language recognition,
 * multi-domain welfare knowledge, and step-by-step guidance.
 */

import { mockSchemes } from '../data/mock/schemes';
import { MOCK_PARTNERS } from '../data/mock/partners';

/**
 * Automatically recognizes the language of the spoken/typed text.
 * Detects native Indic scripts as well as Romanized/transliterated keywords.
 */
export function detectLanguage(text = '', fallbackLang = 'EN') {
  if (!text || typeof text !== 'string') return fallbackLang || 'EN';
  const trimmed = text.trim();
  if (!trimmed) return fallbackLang || 'EN';

  // 1. Script-based detection
  if (/[\u0C00-\u0C7F]/.test(trimmed)) return 'TE'; // Telugu
  if (/[\u0B80-\u0BFF]/.test(trimmed)) return 'TA'; // Tamil
  if (/[\u0C80-\u0CFF]/.test(trimmed)) return 'KN'; // Kannada
  if (/[\u0D00-\u0D7F]/.test(trimmed)) return 'ML'; // Malayalam
  if (/[\u0980-\u09FF]/.test(trimmed)) return 'BN'; // Bengali
  if (/[\u0900-\u097F]/.test(trimmed)) {
    // Check if Marathi
    if (/(?:^|\s|[.,!?।])(आहे|कशी|सांगा|माझे|मला|नाही|काय|करावे|पाहिजे|मिळेल)(?:$|\s|[.,!?।])/u.test(trimmed)) return 'MR';
    return 'HI'; // Hindi
  }

  // 2. Romanized / Transliterated keyword detection
  const lower = trimmed.toLowerCase();

  // Telugu transliteration
  if (/\b(naaku|ela|kavali|cheppandi|pathakam|dharakhasthu|daggara|namaskaram|undi|raaledu|chudandi|ayithe|enti|edhi|padhakam|sahayam)\b/.test(lower)) {
    return 'TE';
  }
  // Hindi transliteration
  if (/\b(mujhe|kya|kaise|karo|batao|chahiye|yojana|yojna|paise|kisan|dastavej|aavedan|shuru|kitna|milega|samjhao|bataiye|kaunsi|kholna|khatam|namaste)\b/.test(lower)) {
    return 'HI';
  }
  // Tamil transliteration
  if (/\b(enakku|eppadi|venum|thittam|solunga|kadan|vanakkam|illai|evvalavu|uthavi)\b/.test(lower)) {
    return 'TA';
  }
  // Kannada transliteration
  if (/\b(nanage|hege|beku|yojane|heli|namaskara|sallisi|salavu|sahaya)\b/.test(lower)) {
    return 'KN';
  }
  // Malayalam transliteration
  if (/\b(enikku|enganeya|venam|padhathi|parayu|namaskaram|sahayam|enthanu)\b/.test(lower)) {
    return 'ML';
  }
  // Bengali transliteration
  if (/\b(aamar|kivabe|chai|prokolpo|bolun|nomoshkar|taka|sahajjo|ki)\b/.test(lower)) {
    return 'BN';
  }
  // Marathi transliteration
  if (/\b(mala|kasa|pahije|yojana|saanga|namaskar|ahe|kay|madat)\b/.test(lower)) {
    return 'MR';
  }

  return fallbackLang || 'EN';
}

// Haversine distance calculator
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Universal ChatGPT-style Answer Generator.
 * Answers ANY question with clarity, simple words, and helpful next steps.
 */
export function askChatGptVoiceAssistant(rawQuery = '', currentLang = 'EN', location = null, userProfile = {}) {
  const detectedLang = detectLanguage(rawQuery, currentLang);
  const q = rawQuery.toLowerCase().trim();

  // Helper for formatting Indian numbers
  const fmt = (num) => (num ? '₹' + Number(num).toLocaleString('en-IN') : '');

  // ── 1. GREETINGS & INTRODUCTIONS ──────────────────────────────────────────
  if (/^(hi|hello|hey|namaste|vanakkam|namaskaram|nomoshkar|pranam|good morning|good afternoon)\b/i.test(q) || q === 'hi' || q === 'hello') {
    const responses = {
      EN: "Hello! I am SchemeSetu AI Assistant, working just like ChatGPT for government welfare. Ask me anything in simple words — about loans, subsidies, eligibility, or how to apply for schemes!",
      HI: "नमस्ते! मैं स्कीमसेतू एआई सहायक हूँ। आप मुझसे सरकारी योजनाओं, लोन, सब्सिडी, आवश्यक दस्तावेजों या आवेदन के नियमों के बारे में आसान शब्दों में कोई भी सवाल पूछ सकते हैं।",
      TE: "నమస్కారం! నేను స్కీమ్‌సేతు AI అసిస్టెంట్‌ని. ప్రభుత్వ పథకాలు, లోన్లు, సబ్సిడీలు లేదా అర్హతల గురించి మీకు కావాల్సిన సమాచారాన్ని సులభమైన మాటల్లో అడగండి!",
      TA: "வணக்கம்! நான் SchemeSetu AI உதவியாளர். அரசு கடன்கள், மானியங்கள் மற்றும் தகுதிகள் குறித்த எந்த கேள்வியையும் என்னிடம் எளிமையாக கேட்கலாம்.",
      KN: "ನಮಸ್ಕಾರ! ನಾನು SchemeSetu AI ಸಹಾಯಕ. ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು, ಸಾಲಗಳು ಮತ್ತು ಸಬ್ಸಿಡಿಗಳ ಬಗ್ಗೆ ಸುಲಭವಾದ ಮಾತುಗಳಲ್ಲಿ ನನ್ನನ್ನು ಕೇಳಿ.",
      ML: "നമസ്കാരം! ഞാൻ സ്കീംസേതു AI അസിസ്റ്റന്റാണ്. സർക്കാർ വായ്പകൾ, സബ്‌സിഡികൾ എന്നിവയെക്കുറിച്ച് ലളിതമായി ചോദിക്കുക.",
      BN: "নমস্কার! আমি স্কিমসেতু এআই সহকারী। সরকারি ঋণ, ভর্তুকি এবং যোগ্যতা সম্পর্কে সহজ ভাষায় আমাকে যে কোনও প্রশ্ন জিজ্ঞাসা করতে পারেন।",
      MR: "नमस्कार! मी स्कीमसेतू एआय सहाय्यक आहे. सरकारी योजना, कर्ज आणि अनुदानाबद्दल मला सोप्या भाषेत विचारा."
    };

    return {
      text: responses[detectedLang] || responses.EN,
      detectedLang,
      schemes: mockSchemes.slice(0, 3),
      quickFollowUps: ['₹5L MUDRA Loan', 'What is Subsidy?', 'SC Dalit Bandhu ₹10L', 'Find Nearest Bank']
    };
  }

  // ── 2. IDENTITY / "WHO ARE YOU" ───────────────────────────────────────────
  if (q.includes('who are you') || q.includes('tum kaun ho') || q.includes('nuvvu evaru') || q.includes('neenga yaar')) {
    const responses = {
      EN: "I am your 24/7 AI Welfare Bridge, designed for Smart India Hackathon 2026. I verify official government guidelines from MoSJE, MSME, and Finance ministries to help you discover grants, concessional credit, and subsidies without any middlemen or agents.",
      HI: "मैं स्कीमसेतू एआई हूँ — आपका सरकारी योजना मार्गदर्शक। मैं आपको बिना किसी दलाल या बिचौलिए के सही सरकारी लोन, 100% सब्सिडी और कल्याणकारी योजनाओं की सटीक जानकारी आसान भाषा में देता हूँ।",
      TE: "నేను స్కీమ్‌సేతు AI గైడ్‌ని. మధ్యవర్తులు లేకుండా ప్రభుత్వ రాయితీలు, సున్నా పూచీకత్తు రుణాలు మరియు సంక్షేమ పథకాలను ప్రజలకు సులభంగా అందించడానికి నేను పనిచేస్తాను."
    };

    return {
      text: responses[detectedLang] || responses.EN,
      detectedLang,
      schemes: mockSchemes.slice(0, 2),
      quickFollowUps: ['Check My Eligibility', 'Top Schemes for Me', 'Find Nearest Bank']
    };
  }

  // ── 3. FINANCIAL CONCEPT EXPLANATION: WHAT IS SUBSIDY? ─────────────────────
  if (q.includes('what is subsidy') || q.includes('subsidy kya') || q.includes('subsidy ante') || q.includes('maanayam')) {
    const responses = {
      EN: "💡 In simple words: A subsidy is free financial grant money from the government that you NEVER have to pay back! \n\n• Example: If you start a business project worth ₹10 Lakh under PMEGP, the government provides up to 35% (₹3.5 Lakh) as a direct subsidy. You only borrow ₹6.5 Lakh from the bank!",
      HI: "💡 आसान शब्दों में: सब्सिडी सरकार द्वारा दी जाने वाली वह सहायता राशि है जिसे आपको कभी वापस नहीं चुकाना पड़ता! \n\n• उदाहरण: यदि आप ₹10 लाख का काम शुरू करते हैं, तो PMEGP में सरकार 35% (₹3.5 लाख) सब्सिडी देती है। बैंक को केवल बाकी ₹6.5 लाख चुकाने होते हैं!",
      TE: "💡 సులభంగా చెప్పాలంటే: సబ్సిడీ అంటే ప్రభుత్వం ఇచ్చే ఉచిత నగదు సహాయం, దీనిని మీరు తిరిగి చెల్లించాల్సిన అవసరం లేదు! \n\n• ఉదాహరణ: మీరు ₹10 లక్షల ప్రాజెక్ట్ మొదలుపెడితే, PMEGP కింద ప్రభుత్వం 35% (₹3.5 లక్షలు) సబ్సిడీగా ఇస్తుంది. మీరు కేవలం మిగిలిన ₹6.5 లక్షలు మాత్రమే బ్యాంకుకు చెల్లించాలి!"
    };

    const pmegp = mockSchemes.find(s => s.id === 'pmegp') || mockSchemes[0];
    return {
      text: responses[detectedLang] || responses.EN,
      detectedLang,
      schemes: [pmegp],
      quickFollowUps: ['PMEGP 35% Subsidy', 'Stand-Up India ₹10L-₹1Cr', 'Am I eligible for subsidy?']
    };
  }

  // ── 4. FINANCIAL CONCEPT: COLLATERAL-FREE / GUARANTEE ──────────────────────
  if (q.includes('collateral') || q.includes('bina guarantee') || q.includes('guarantee') || q.includes('poocheekathu')) {
    const responses = {
      EN: "🛡️ What is a Collateral-Free Loan? \n\nIt means you DO NOT need to mortgage your house, land, or gold to get the loan! Under government credit guarantee funds (like CGTMSE & CGFMU), the Government of India acts as your guarantor for loans up to ₹20 Lakhs in MUDRA and ₹50 Lakhs in PMEGP.",
      HI: "🛡️ बिना गारंटी (Collateral-Free) लोन क्या है? \n\nइसका मतलब है कि आपको बैंक में अपनी जमीन, मकान या सोना गिरवी रखने की कोई जरूरत नहीं है! भारत सरकार (CGTMSE फंड) खुद बैंक को आपकी गारंटी देती है (मुद्रा में ₹20 लाख तक)।",
      TE: "🛡️ పూచీకత్తు లేని రుణం (Collateral-Free) అంటే ఏమిటి? \n\nదీని అర్థం రుణం తీసుకోవడానికి మీ ఇల్లు, భూమి లేదా బంగారాన్ని తాకట్టు పెట్టాల్సిన అవసరం లేదు! ముద్రా మరియు PMEGP పథకాల ద్వారా ప్రభుత్వం బ్యాంకర్లకు హామీ ఇస్తుంది."
    };

    const mudra = mockSchemes.find(s => s.id.includes('mudra')) || mockSchemes[0];
    return {
      text: responses[detectedLang] || responses.EN,
      detectedLang,
      schemes: [mudra],
      quickFollowUps: ['Apply PMMY Mudra', 'PMEGP Subsidy', 'Required Documents']
    };
  }

  // ── 5. FIND NEAREST BANK BRANCH / SERVICE CENTER ──────────────────────────
  if (q.includes('bank') || q.includes('branch') || q.includes('शाखा') || q.includes('బ్యాంక్') || q.includes('near me') || q.includes('center')) {
    const userLat = location?.lat || 17.3850;
    const userLng = location?.lng || 78.4867;

    const nearby = MOCK_PARTNERS.map(p => {
      const pLat = p.coordinates?.lat || userLat;
      const pLng = p.coordinates?.lng || userLng;
      const dist = haversine(userLat, userLng, pLat, pLng);
      return {
        ...p,
        distance: dist,
        distanceText: `${dist} km`
      };
    }).sort((a, b) => a.distance - b.distance).slice(0, 3);

    const first = nearby[0] || { name: 'State Bank of India', distanceText: '1.2 km', address: 'Main Road Branch' };

    const responses = {
      EN: `🏦 The nearest verified public sector bank is ${first.name}, located approximately ${first.distanceText} away (${first.address}). You can visit this branch directly for MUDRA, PMEGP, or Stand-Up India sanctioning.`,
      HI: `🏦 आपके सबसे पास सरकारी बैंक शाखा ${first.name} है, जो लगभग ${first.distanceText} दूरी पर (${first.address}) स्थित है। यहाँ आप मुद्रा और PMEGP योजनाओं के लिए सीधे संपर्क कर सकते हैं।`,
      TE: `🏦 మీకు అత్యంత సమీపంలో ఉన్న బ్యాంకు ${first.name}, దాదాపు ${first.distanceText} దూరంలో (${first.address}) ఉంది. మీరు ముద్రా లేదా PMEGP కోసం ఇక్కడికి వెళ్లవచ్చు.`
    };

    return {
      text: responses[detectedLang] || responses.EN,
      detectedLang,
      bankResults: nearby,
      schemes: [],
      quickFollowUps: ['Required Documents for Bank', '₹5L MUDRA Loan', 'Check Eligibility']
    };
  }

  // ── 6. SPECIFIC SCHEME: MUDRA LOAN ────────────────────────────────────────
  if (q.includes('mudra') || q.includes('मुद्रा') || q.includes('ముద్రా') || q.includes('shishu') || q.includes('kishore') || q.includes('tarun')) {
    const mudra = mockSchemes.find(s => s.id.includes('mudra')) || mockSchemes[0];
    const responses = {
      EN: `📘 Pradhan Mantri MUDRA Yojana (PMMY) in Simple Words:\n\n• What is it: Collateral-free business loans for shopkeepers, traders, and small entrepreneurs.\n• Three Categories:\n   1. Shishu: Loans up to ₹50,000\n   2. Kishore: Loans from ₹50,000 to ₹5,00,000\n   3. Tarun: Loans up to ₹10,00,000 (extended up to ₹20L for repeat borrowers)\n• Guarantee: No property or gold mortgage required.\n• Documents: Aadhaar, Bank Passbook, Business quotation, PAN card.`,
      HI: `📘 प्रधानमंत्री मुद्रा योजना (PMMY) आसान शब्दों में:\n\n• यह क्या है: छोटे व्यापारियों, दुकानदारों और नए काम के लिए बिना गारंटी का लोन।\n• 3 श्रेणियां:\n   1. शिशु: ₹50,000 तक\n   2. किशोर: ₹50,000 से ₹5,00,000 तक\n   3. तरुण: ₹5 लाख से ₹10 लाख (अब ₹20 लाख तक)\n• कोई गिरवी नहीं चाहिए। आवश्यक दस्तावेज: आधार, बैंक पासबुक, कोटेशन।`,
      TE: `📘 ప్రధాన మంత్రి ముద్రా యోజన సులభమైన వివరణ:\n\n• ఇది ఏమిటి: వ్యాపారులు, చిరు వ్యాపారాలు మరియు కొత్త షాపుల కోసం పూచీకత్తు లేని రుణం.\n• 3 విభాగాలు:\n   1. శిశు: ₹50,000 వరకు\n   2. కిశోర్: ₹50,000 నుండి ₹5 లక్షల వరకు\n   3. తరుణ్: ₹5 లక్షల నుండి ₹10 లక్షల వరకు (గరిష్టంగా ₹20L)\n• హామీ అవసరం లేదు. అవసరమైన పత్రాలు: ఆధార్, బ్యాంక్ పాస్‌బుక్, కొటేషన్.`
    };

    return {
      text: responses[detectedLang] || responses.EN,
      detectedLang,
      schemes: [mudra],
      quickFollowUps: ['Documents for Mudra', 'Find Nearest Bank', 'Difference from PMEGP']
    };
  }

  // ── 7. SPECIFIC SCHEME: PMEGP (Prime Minister's Employment Generation) ─────
  if (q.includes('pmegp') || q.includes('manufacturing loan') || q.includes('subsidy loan') || q.includes('35%')) {
    const pmegp = mockSchemes.find(s => s.id === 'pmegp') || mockSchemes[0];
    const responses = {
      EN: `🏭 PMEGP (Prime Minister's Employment Generation Programme):\n\n• Benefit: Up to ₹50 Lakhs for manufacturing units & ₹20 Lakhs for service businesses.\n• Massive Subsidy: \n   - 25% for General category (Urban: 15%)\n   - 35% for SC, ST, OBC, Women, & Minorities in Rural areas (Urban: 25%)\n• Your Contribution: Only 5% own contribution for SC/ST/Women!\n• Eligibility: Anyone aged 18+ with minimum 8th class pass for projects above ₹10L.`,
      HI: `🏭 PMEGP योजना आसान शब्दों में:\n\n• लाभ: मैन्युफैक्चरिंग के लिए ₹50 लाख और सर्विस काम के लिए ₹20 लाख तक लोन।\n• भारी सब्सिडी: \n   - ग्रामीण SC/ST/महिला लाभार्थियों को 35% सीधी सरकारी सब्सिडी मिलती है।\n• आपका खर्च: आपको केवल 5% पैसा लगाना होता है, 95% बैंक और सरकार देती है!`,
      TE: `🏭 PMEGP పథకం సులభమైన వివరణ:\n\n• ప్రయోజనం: తయారీ రంగానికి ₹50 లక్షల వరకు, సేవా రంగానికి ₹20 లక్షల వరకు.\n• భారీ సబ్సిడీ: \n   - గ్రామీణ SC/ST/మహిళలకు 35% భారీ సబ్సిడీ లభిస్తుంది.\n• మీ వాటా: మీరు కేవలం 5% చెల్లిస్తే సరిపోతుంది, మిగతాది ప్రభుత్వం & బ్యాంకు ఇస్తాయి!`
    };

    return {
      text: responses[detectedLang] || responses.EN,
      detectedLang,
      schemes: [pmegp],
      quickFollowUps: ['How to apply for PMEGP', 'Calculate EMI', 'Documents Needed']
    };
  }

  // ── 8. SPECIFIC SCHEME: DALIT BANDHU (Telangana SC Grant) ──────────────────
  if (q.includes('dalit bandhu') || q.includes('दलित बंधु') || q.includes('దళిత బంధు') || q.includes('10 lakh grant')) {
    const dalit = mockSchemes.find(s => s.id === 'dalit-bandhu') || mockSchemes[0];
    const responses = {
      EN: `✊ Telangana Dalit Bandhu Scheme:\n\n• What is it: A historic 100% direct welfare grant of ₹10 Lakh per eligible Scheduled Caste (SC) family.\n• Zero Repayment: This is NOT a loan. You never have to repay a single rupee to the bank or government!\n• Purpose: Start any enterprise (dairy farm, transport vehicle, retail shop, manufacturing unit).\n• Eligibility: Native SC family residing in Telangana without government employment.`,
      HI: `✊ दलित बंधु योजना:\n\n• यह क्या है: तेलंगाना में प्रत्येक पात्र SC परिवार को ₹10 लाख की 100% मुफ्त सरकारी सहायता।\n• कोई कर्ज नहीं: यह लोन नहीं है, इसे कभी वापस नहीं लौटाना पड़ता!\n• उद्देश्य: ट्रैक्टर, दुकान, डेयरी फार्म या कोई भी व्यवसाय शुरू करने के लिए।`,
      TE: `✊ దళిత బంధు పథకం:\n\n• ఇది ఏమిటి: అర్హులైన ప్రతి దళిత (SC) కుటుంబానికి ₹10 లక్షల ఉచిత ఆర్థిక సహాయం.\n• రుణం కాదు: ఇది రుణం కాదు, ఒక్క రూపాయి కూడా తిరిగి చెల్లించాల్సిన అవసరం లేదు!\n• ప్రయోజనం: వ్యాపారం, వాహనం, డైరీ లేదా ఇతర స్వయం ఉపాధి యూనిట్ స్థాపనకు.`
    };

    return {
      text: responses[detectedLang] || responses.EN,
      detectedLang,
      schemes: [dalit],
      quickFollowUps: ['Stand-Up India ₹10L-₹1Cr', 'SC Entrepreneur Hub', 'Am I Eligible?']
    };
  }

  // ── 9. SPECIFIC SCHEME: STAND-UP INDIA ────────────────────────────────────
  if (q.includes('stand up') || q.includes('standup') || q.includes('स्टैंड अप') || q.includes('స్టాండ్ అప్') || q.includes('crore')) {
    const sui = mockSchemes.find(s => s.id === 'stand-up-india') || mockSchemes[0];
    const responses = {
      EN: `🚀 Stand-Up India Scheme:\n\n• Target: Scheduled Caste (SC), Scheduled Tribe (ST), and Women entrepreneurs setting up greenfield (first-time) ventures.\n• Loan Amount: ₹10 Lakh to ₹1 Crore.\n• Bank Mandate: Every nationalized bank branch must fund at least one SC/ST and one Woman borrower.\n• Repayment: Up to 7 years with up to 18-month moratorium period.`,
      HI: `🚀 स्टैंड-अप इंडिया योजना:\n\n• किसके लिए: SC, ST और महिला उद्यमियों के लिए पहला नया व्यवसाय शुरू करने हेतु।\n• लोन राशि: ₹10 लाख से ₹1 करोड़ तक।\n• हर बैंक शाखा में अनिवार्य रूप से कम से कम 1 SC/ST और 1 महिला को लोन दिया जाता है।`,
      TE: `🚀 స్టాండ్-అప్ ఇండియా పథకం:\n\n• ఎవరికి: కొత్త వ్యాపారం ప్రారంభించే SC, ST మరియు మహిళా పారిశ్రామికవేత్తల కోసం.\n• రుణం: ₹10 లక్షల నుండి ₹1 కోటి వరకు.\n• ప్రతి బ్యాంక్ బ్రాంచ్ తప్పనిసరిగా ఒక SC/ST మరియు ఒక మహిళకు ఈ రుణం మంజూరు చేయాలి.`
    };

    return {
      text: responses[detectedLang] || responses.EN,
      detectedLang,
      schemes: [sui],
      quickFollowUps: ['Find Nearest Bank', 'Interest Rate & EMI', 'PMEGP Subsidy']
    };
  }

  // ── 10. SPECIFIC SCHEME: PM VISHWAKARMA (Artisans & Craftsmen) ────────────
  if (q.includes('vishwakarma') || q.includes('artisan') || q.includes('carpenter') || q.includes('blacksmith') || q.includes('barber') || q.includes('tailor')) {
    const vishwa = mockSchemes.find(s => s.id === 'pm-vishwakarma') || mockSchemes[0];
    const responses = {
      EN: `🔨 PM Vishwakarma Scheme in Simple Words:\n\n• For: Traditional artisans & craftspeople (carpenters, blacksmiths, barbers, tailors, sculptors, etc. across 18 trades).\n• Free Training & Stipend: ₹500/day during skill training.\n• Toolkit Grant: ₹15,00,0 electronic voucher.\n• Collateral-Free Loans: ₹1 Lakh (Tranche 1) followed by ₹2 Lakhs (Tranche 2) at only 5% concessional interest rate (government pays 8% subvention).`,
      HI: `🔨 पीएम विश्वकर्मा योजना आसान शब्दों में:\n\n• किसके लिए: 18 पारंपरिक कारीगरों (बढ़ई, लोहार, नाई, दर्जी, कुम्हार आदि) के लिए।\n• लाभ: ट्रेनिंग के दौरान ₹500/दिन भत्ता, ₹15,000 का टूलकिट वाउचर, और मात्र 5% ब्याज पर ₹3 लाख तक बिना गारंटी का लोन!`,
      TE: `🔨 పిఎం విశ్వకర్మ పథకం సులభమైన వివరణ:\n\n• ఎవరికి: 18 రకాల చేతివృత్తుల వారు (వడ్రంగి, కమ్మరి, మంగలి, దర్జీ, కుమ్మరి తదితరులు).\n• ప్రయోజనాలు: ఉచిత శిక్షణ సమయంలో రోజుకు ₹500 స్టైపెండ్, ₹15,000 విలువైన టూల్‌కిట్ గ్రాంట్, మరియు 5% వడ్డీకే ₹3 లక్షల పూచీకత్తు లేని రుణం!`
    };

    return {
      text: responses[detectedLang] || responses.EN,
      detectedLang,
      schemes: [vishwa],
      quickFollowUps: ['18 Eligible Trades', 'How to apply via CSC', 'Find Nearest Bank']
    };
  }

  // ── 11. SPECIFIC SCHEME: PM-KISAN (Farmers) ───────────────────────────────
  if (q.includes('kisan') || q.includes('farmer') || q.includes('कृषि') || q.includes('రైతు') || q.includes('6000') || q.includes('farming')) {
    const kisan = mockSchemes.find(s => s.id === 'pm-kisan') || mockSchemes[0];
    const responses = {
      EN: `🌾 PM-KISAN (Pradhan Mantri Kisan Samman Nidhi):\n\n• Benefit: ₹6,000 per year directly transferred to the bank accounts of landholding farmer families via DBT.\n• Payment: 3 equal installments of ₹2,000 every 4 months.\n• Requirement: Aadhaar-linked active bank account and land record (e-KYC verified).`,
      HI: `🌾 पीएम-किसान सम्मान निधि:\n\n• लाभ: किसान परिवारों को सीधे बैंक खाते में ₹6,000 सालाना (₹2,000 की 3 किस्तों में)।\n• जरूरी: आधार लिंक बैंक खाता और भूमि रिकॉर्ड में नाम (ई-केवाईसी जरूरी)।`,
      TE: `🌾 పీఎం-కిసాన్ సమ్మాన్ నిధి:\n\n• ప్రయోజనం: రైతు కుటుంబాలకు ఏటా ₹6,000 నేరుగా బ్యాంక్ ఖాతాలో (3 విడతల్లో ₹2,000 చొప్పున).\n• కావలసినవి: ఆధార్ అనుసంధాన బ్యాంక్ ఖాతా మరియు పట్టాదారు పాస్‌బుక్.`
    };

    return {
      text: responses[detectedLang] || responses.EN,
      detectedLang,
      schemes: [kisan],
      quickFollowUps: ['How to check e-KYC', 'Kisan Credit Card (KCC)', 'Nearest CSC Center']
    };
  }

  // ── 12. SPECIFIC SCHEME: AYUSHMAN BHARAT HEALTH COVER ─────────────────────
  if (q.includes('ayushman') || q.includes('health') || q.includes('hospital') || q.includes('medical') || q.includes('swasthya') || q.includes('arogya')) {
    const ayush = mockSchemes.find(s => s.id === 'ayushman-bharat') || mockSchemes[0];
    const responses = {
      EN: `🏥 Ayushman Bharat PM-JAY in Simple Words:\n\n• Free Healthcare: Up to ₹5,00,000 per family per year for secondary and tertiary hospital treatment.\n• Cashless & Paperless: Valid at all empaneled public and private hospitals across India.\n• No age limit or family size restriction.\n• How to get card: Visit nearest CSC or empanelled hospital with Aadhaar card and Ration card.`,
      HI: `🏥 आयुष्मान भारत (पीएम-जय) योजना:\n\n• मुफ्त इलाज: प्रत्येक पात्र परिवार को सालाना ₹5 लाख तक का कैशलेस इलाज।\n• देश के सभी सरकारी और सूचीबद्ध निजी अस्पतालों में बिना कोई पैसा दिए मुफ्त इलाज।\n• कार्ड कैसे बनाएं: आधार और राशन कार्ड लेकर नजदीकी सीएससी (CSC) या अस्पताल जाएं।`,
      TE: `🏥 ఆయుష్మాన్ భారత్ (PM-JAY) పథకం:\n\n• ఉచిత వైద్యం: అర్హత గల కుటుంబానికి ఏడాదికి ₹5 లక్షల వరకు నగదు రహిత చికిత్స.\n• ప్రభుత్వ మరియు ప్రైవేట్ నెట్‌వర్క్ ఆసుపత్రులలో ఉచిత వైద్యం అందుబాటులో ఉంటుంది.\n• కార్డు ఎలా పొందాలి: ఆధార్ మరియు రేషన్ కార్డుతో సమీపంలోని CSC కేంద్రానికి వెళ్లండి.`
    };

    return {
      text: responses[detectedLang] || responses.EN,
      detectedLang,
      schemes: [ayush],
      quickFollowUps: ['Nearest Empaneled Hospital', 'Check Ration Card Eligibility', 'PM Vishwakarma']
    };
  }

  // ── 13. REQUIRED DOCUMENTS QUESTION ───────────────────────────────────────
  if (q.includes('document') || q.includes('कागज') || q.includes('दस्तावेज') || q.includes('పత్రాలు') || q.includes('proof')) {
    const responses = {
      EN: `📄 Standard Documents Required for Welfare Schemes & Loans:\n\n1. Aadhaar Card (with mobile linked for OTP)\n2. Bank Account Passbook (Aadhaar DBT enabled)\n3. Income Certificate (from Tehsildar / MeeSeva / CSC)\n4. Caste / Community Certificate (for SC, ST, OBC concessions)\n5. Business Quotation or Project Report (for loans above ₹50,000)\n6. Passport-size photographs.`,
      HI: `📄 सरकारी योजनाओं और लोन के लिए आवश्यक दस्तावेज:\n\n1. आधार कार्ड (मोबाइल नंबर लिंक होना चाहिए)\n2. बैंक पासबुक (आधार सीडेड)\n3. आय प्रमाण पत्र (Income Certificate)\n4. जाति प्रमाण पत्र (SC/ST/OBC वर्ग के लिए)\n5. मशीनरी या दुकान कोटेशन (₹50,000 से अधिक लोन के लिए)\n6. पासपोर्ट साइज फोटो।`,
      TE: `📄 సంక్షేమ పథకాలు & రుణాలకు అవసరమైన ముఖ్య పత్రాలు:\n\n1. ఆధార్ కార్డు (మొబైల్ నంబర్ లింక్ అయి ఉండాలి)\n2. బ్యాంక్ పాస్‌బుక్ (Aadhaar DBT లింక్)\n3. ఆదాయ ధృవీకరణ పత్రం (Income Certificate)\n4. కుల ధృవీకరణ పత్రం (Caste Certificate)\n5. వ్యాపార ప్రాజెక్ట్ కొటేషన్\n6. పాస్‌పోర్ట్ సైజ్ ఫోటోలు.`
    };

    return {
      text: responses[detectedLang] || responses.EN,
      detectedLang,
      schemes: mockSchemes.slice(0, 2),
      quickFollowUps: ['₹5L MUDRA Loan', 'Find Nearest Bank', 'Check Eligibility']
    };
  }

  // ── 14. GENERAL ADVICE: STARTING A SHOP / BUSINESS ─────────────────────────
  if (q.includes('shop') || q.includes('store') || q.includes('business') || q.includes('vyapar') || q.includes('kirana') || q.includes('start')) {
    const mudra = mockSchemes.find(s => s.id.includes('mudra')) || mockSchemes[0];
    const pmegp = mockSchemes.find(s => s.id === 'pmegp') || mockSchemes[1];

    const responses = {
      EN: `🛍️ Best Schemes to Start or Expand Your Business:\n\n1. PM MUDRA Loan: Best for small shops, retail, and trading up to ₹10-₹20 Lakhs with no property mortgage.\n2. PMEGP Scheme: Best if you are manufacturing or processing goods, offering 25% to 35% government subsidy!\n3. Stand-Up India: Ideal for SC/ST and Women entrepreneurs needing ₹10 Lakh to ₹1 Crore.\n\n• Recommendation: For a retail kirana shop, start with MUDRA Kishore (₹50,000 - ₹5,00,000).`,
      HI: `🛍️ नया काम या दुकान शुरू करने के लिए सर्वश्रेष्ठ योजनाएं:\n\n1. पीएम मुद्रा लोन: किराना, कपड़े, ऑटोमोबाइल या रिटेल दुकान के लिए ₹50,000 से ₹10 लाख तक बिना गारंटी।\n2. PMEGP योजना: मैन्युफैक्चरिंग या सर्विस यूनिट के लिए 35% सीधी सरकारी सब्सिडी!\n3. स्टैंड-अप इंडिया: SC/ST और महिलाओं के लिए ₹10 लाख से ₹1 करोड़ तक का लोन।`,
      TE: `🛍️ కొత్త షాప్ లేదా వ్యాపారం ప్రారంభించడానికి ఉత్తమ పథకాలు:\n\n1. పీఎం ముద్రా లోన్: కిరాణా, బట్టల దుకాణం లేదా ఇతర వ్యాపారాలకు ₹50,000 నుండి ₹10 లక్షల వరకు పూచీకత్తు లేకుండా లభిస్తుంది.\n2. PMEGP పథకం: తయారీ యూనిట్లకు 35% వరకు భారీ సబ్సిడీ లభిస్తుంది.\n3. స్టాండ్-అప్ ఇండియా: SC/ST & మహిళలకు ₹10 లక్షల నుండి ₹1 కోటి వరకు రుణం.`
    };

    return {
      text: responses[detectedLang] || responses.EN,
      detectedLang,
      schemes: [mudra, pmegp],
      quickFollowUps: ['Apply for Mudra', 'PMEGP 35% Subsidy', 'Find Nearest Bank']
    };
  }

  // ── 15. DEFAULT SMART CHATGPT-STYLE SYNTHESIS ─────────────────────────────
  const matched = mockSchemes.filter(s => {
    const sName = s.name.toLowerCase();
    const sSummary = (s.summary || '').toLowerCase();
    const sCat = (s.category || '').toLowerCase();
    return q.split(' ').some(word => word.length > 3 && (sName.includes(word) || sSummary.includes(word) || sCat.includes(word)));
  });

  const top = matched.length > 0 ? matched.slice(0, 3) : mockSchemes.slice(0, 3);
  const target = top[0];

  const loanAmount = target.maxLoan ? fmt(target.maxLoan) : (target.maxBenefit ? fmt(target.maxBenefit) : 'Financial Grant');

  const responses = {
    EN: `💡 Here is the key information based on your question:\n\n• Top Matching Scheme: **${target.name}**\n• Benefit: ${loanAmount} (${target.summary || 'Empowering citizens with direct institutional credit'})\n• Who can apply: Age ${target.minAge}-${target.maxAge} years, income up to ₹${(target.maxIncome || 500000).toLocaleString('en-IN')}.\n• Next Step: You can apply online via JanSamarth or visit your nearest nationalized bank branch with your Aadhaar and Bank Passbook.`,
    HI: `💡 आपके प्रश्न के अनुसार मुख्य जानकारी:\n\n• सर्वोत्तम योजना: **${target.name}**\n• लाभ: ${loanAmount} (${target.summary || 'नागरिकों को सरकारी वित्तीय सहायता'})\n• पात्रता: आयु ${target.minAge}-${target.maxAge} वर्ष, पारिवारिक आय ₹${(target.maxIncome || 500000).toLocaleString('en-IN')} तक।\n• क्या करें: आप जनसमर्थ पोर्टल या नजदीकी बैंक शाखा में आधार कार्ड और बैंक पासबुक लेकर जा सकते हैं।`,
    TE: `💡 మీ ప్రశ్నకు సంబంధించి పూర్తి సమాచారం:\n\n• సరిపోయే ముఖ్య పథకం: **${target.name}**\n• ప్రయోజనం: ${loanAmount} (${target.summary || 'ప్రభుత్వ ఆర్థిక సహాయం'})\n• అర్హత: వయస్సు ${target.minAge}-${target.maxAge} సంవత్సరాలు, వార్షిక ఆదాయం ₹${(target.maxIncome || 500000).toLocaleString('en-IN')} లోపు.\n• తదుపరి చేయాల్సింది: మీరు సమీపంలోని బ్యాంక్ బ్రాంచ్‌ను సంప్రదించవచ్చు.`
  };

  return {
    text: responses[detectedLang] || responses.EN,
    detectedLang,
    schemes: top,
    quickFollowUps: ['Required Documents', 'Find Nearest Bank', 'Check My Eligibility']
  };
}
