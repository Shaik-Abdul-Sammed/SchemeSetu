/**
 * SchemeSetu Voice & Conversational Assistant Intelligence Engine
 * Handles Entity Extraction, Sequential Missing Field Prompts, and Multilingual Natural Responses
 */

export const REQUIRED_ELIGIBILITY_FIELDS = [
  'projectType',
  'state',
  'income',
  'occupation',
  'age',
  'education'
];

export const FIELD_LABELS = {
  projectType: {
    EN: 'purpose / scheme category (business, farming, education, health)',
    HI: 'उद्देश्य / योजना श्रेणी (व्यवसाय, कृषि, शिक्षा, स्वास्थ्य)',
    TE: 'పథకం వర్గం (వ్యాపారం, వ్యవసాయం, విద్య, ఆరోగ్యం)',
    TA: 'திட்ட வகை (வணிகம், விவசாயம், கல்வி, சுகாதாரம்)',
    KN: 'ಯೋಜನೆಯ ವರ್ಗ (ವ್ಯವಹಾರ, ಕೃಷಿ, ಶಿಕ್ಷಣ, ಆರೋಗ್ಯ)',
    ML: 'പദ്ധതി വിഭാഗം (ബിസിനസ്സ്, കൃഷി, വിദ്യാഭ്യാസം, ആരോഗ്യം)',
    BN: 'প্রকল্পের ধরন (ব্যবসা, কৃষি, শিক্ষা, স্বাস্থ্য)',
    MR: 'योजनेचा प्रकार (व्यवसाय, शेती, शिक्षण, आरोग्य)'
  },
  state: {
    EN: 'state of residence',
    HI: 'निवास का राज्य',
    TE: 'నివాస రాష్ట్రం',
    TA: 'வசிக்கும் மாநிலம்',
    KN: 'ವಾಸಿಸುವ ರಾಜ್ಯ',
    ML: 'താമസിക്കുന്ന സംസ്ഥാനം',
    BN: 'বসবাসের রাজ্য',
    MR: 'रहिवासी राज्य'
  },
  income: {
    EN: 'annual household income',
    HI: 'वार्षिक पारिवारिक आय',
    TE: 'వార్షిక కుటుంబ ఆదాయం',
    TA: 'ஆண்டு குடும்ப வருமானம்',
    KN: 'ವಾರ್ಷಿಕ ಕುಟುಂಬ ಆದಾಯ',
    ML: 'വാർഷിക കുടുംബ വരുമാനം',
    BN: 'বার্ষিক পারিবারিক আয়',
    MR: 'वार्षिक कौटुंबिक उत्पन्न'
  },
  occupation: {
    EN: 'primary occupation',
    HI: 'मुख्य व्यवसाय',
    TE: 'ప్రధాన వృత్తి',
    TA: 'முதன்மை தொழில்',
    KN: 'ಮುಖ್ಯ ಉದ್ಯೋಗ',
    ML: 'പ്രധാന തൊഴിൽ',
    BN: 'প্রধান পেশা',
    MR: 'मुख्य व्यवसाय'
  },
  age: {
    EN: 'age in years',
    HI: 'आयु (वर्षों में)',
    TE: 'వయస్సు',
    TA: 'வயது',
    KN: 'ವಯಸ್ಸು',
    ML: 'വയസ്സ്',
    BN: 'বয়স',
    MR: 'वय'
  },
  education: {
    EN: 'education level',
    HI: 'शिक्षा का स्तर',
    TE: 'విద్యార్హత',
    TA: 'கல்வி தகுதி',
    KN: 'ಶಿಕ್ಷಣ ಮಟ್ಟ',
    ML: 'വിദ്യാഭ്യാസ യോഗ്യത',
    BN: 'শিক্ষাগত যোগ্যতা',
    MR: 'शिक्षणाचा स्तर'
  }
};

/**
 * Sequential single-question prompts for missing fields in 8 languages
 */
export const SEQUENTIAL_FIELD_PROMPTS = {
  projectType: {
    EN: "What type of government scheme or assistance are you looking for? (e.g. business loan, farming subsidy, education scholarship, healthcare)",
    HI: "आप किस प्रकार की सरकारी योजना या सहायता की तलाश कर रहे हैं? (उदा. व्यवसाय ऋण, कृषि सब्सिडी, छात्रवृत्ति, स्वास्थ्य)",
    TE: "మీరు ఏ రకమైన ప్రభుత్వ పథకం లేదా సహాయం కోసం చూస్తున్నారు? (ఉదా. వ్యాపార రుణం, వ్యవసాయ రాయితీ, విద్యా స్కాలర్‌షిప్, ఆరోగ్యం)",
    TA: "நீங்கள் எந்த வகையான அரசு திட்டம் அல்லது உதவியை எதிர்பார்க்கிறீர்கள்? (எ.கா. தொழில் கடன், விவசாய மானியம், கல்வி உதவித்தொகை)",
    KN: "ನೀವು ಯಾವ ರೀತಿಯ ಸರ್ಕಾರಿ ಯೋಜನೆ ಅಥವಾ ಸಹಾಯವನ್ನು ಹುಡುಕುತ್ತಿದ್ದೀರಿ? (ಉದಾ. ವ್ಯಾಪಾರ ಸಾಲ, ಕೃಷಿ ಸಬ್ಸಿಡಿ, ಶಿಕ್ಷಣ ವಿದ್ಯಾರ್ಥಿವೇತನ)",
    ML: "നിങ്ങൾ ഏത് തരത്തിലുള്ള സർക്കാർ പദ്ധതിയാണ് അന്വേഷിക്കുന്നത്? (ഉദാ. ബിസിനസ് വായ്പ, കാർഷിക സബ്സിഡി, സ്കോളർഷിപ്പ്)",
    BN: "আপনি কী ধরণের সরকারি স্কিম বা সহায়তা খুঁজছেন? (যেমন ব্যবসা ঋণ, কৃষি ভর্তুকি, শিক্ষা বৃত্তি, স্বাস্থ্য)",
    MR: "तुम्ही कोणत्या प्रकारची सरकारी योजना किंवा मदत शोधत आहात? (उदा. व्यवसाय कर्ज, कृषी अनुदान, शिष्यवृत्ती)"
  },
  state: {
    EN: "Which state or union territory do you live in?",
    HI: "आप किस राज्य या केंद्र शासित प्रदेश में रहते हैं?",
    TE: "మీరు ఏ రాష్ట్రం లేదా కేంద్రపాలిత ప్రాంతంలో నివసిస్తున్నారు?",
    TA: "நீங்கள் எந்த மாநிலத்தில் வசிக்கிறீர்கள்?",
    KN: "ನೀವು ಯಾವ ರಾಜ್ಯದಲ್ಲಿ ವಾಸಿಸುತ್ತಿದ್ದೀರಿ?",
    ML: "നിങ്ങൾ ഏത് സംസ്ഥാനത്താണ് താമസിക്കുന്നത്?",
    BN: "আপনি কোন রাজ্যে বসবাস করেন?",
    MR: "तुम्ही कोणत्या राज्यात राहता?"
  },
  income: {
    EN: "What is your approximate annual household income?",
    HI: "आपकी अनुमानित वार्षिक पारिवारिक आय कितनी है?",
    TE: "మీ వార్షిక కుటుంబ ఆదాయం సుమారు ఎంత?",
    TA: "உங்கள் தோராயமான ஆண்டு குடும்ப வருமானம் எவ்வளவு?",
    KN: "ನಿಮ್ಮ ಅಂದಾಜು ವಾರ್ಷಿಕ ಕುಟುಂಬ ಆದಾಯ ಎಷ್ಟು?",
    ML: "നിങ്ങളുടെ ഏകദേശ വാർഷിക കുടുംബ വരുമാനം എത്രയാണ്?",
    BN: "আপনার আনুমানিক বার্ষিক পারিবারিক আয় কত?",
    MR: "तुमचे अंदाजे वार्षिक कौटुंबिक उत्पन्न किती आहे?"
  },
  occupation: {
    EN: "What is your primary occupation? (e.g. farmer, artisan, street vendor, shopkeeper, student)",
    HI: "आपका मुख्य व्यवसाय क्या है? (उदा. किसान, कारीगर, स्ट्रीट वेंडर, दुकानदार, छात्र)",
    TE: "మీ ప్రధాన వృత్తి ఏమిటి? (ఉదా. రైతు, చేతివృత్తిదారుడు, వీధి వ్యాపారి, దుకాణదారుడు, విద్యార్థి)",
    TA: "உங்கள் முதன்மை தொழில் என்ன? (எ.கா. விவசாயி, கைவினைஞர், கடைக்காரர், மாணவர்)",
    KN: "ನಿಮ್ಮ ಮುಖ್ಯ ಉದ್ಯೋಗ ಏನು? (ಉದಾ. ರೈತ, ಕುಶಲಕರ್ಮಿ, ಬೀದಿ ವ್ಯಾಪಾರಿ, ಅಂಗಡಿಕಾರ, ವಿದ್ಯಾರ್ಥಿ)",
    ML: "നിങ്ങളുടെ പ്രധാന തൊഴിൽ എന്താണ്? (ഉദാ. കർഷകൻ, കരകൗശല വിദഗ്ദ്ധൻ, വഴിയോര കച്ചവടക്കാരൻ, വിദ്യാർത്ഥി)",
    BN: "আপনার প্রধান পেশা কী? (যেমন কৃষক, কারিগর, হকার, দোকানদার, ছাত্র)",
    MR: "तुमचा मुख्य व्यवसाय कोणता आहे? (उदा. शेतकरी, कारागीर, दुकानदार, विद्यार्थी)"
  },
  age: {
    EN: "What is your age in years?",
    HI: "आपकी आयु (वर्षों में) कितनी है?",
    TE: "మీ వయస్సు (సంవత్సరాలలో) ఎంత?",
    TA: "உங்கள் வயது என்ன?",
    KN: "ನಿಮ್ಮ ವಯಸ್ಸು ಎಷ್ಟು?",
    ML: "നിങ്ങളുടെ വയസ്സ് എത്രയാണ്?",
    BN: "আপনার বয়স কত?",
    MR: "तुमचे वय किती आहे?"
  },
  education: {
    EN: "What is your highest educational qualification?",
    HI: "आपकी उच्चतम शैक्षणिक योग्यता क्या है?",
    TE: "మీ అత్యధిక విద్యార్హత ఏమిటి?",
    TA: "உங்கள் கல்வி தகுதி என்ன?",
    KN: "ನಿಮ್ಮ ಶಿಕ್ಷಣ ಮಟ್ಟ ಏನು?",
    ML: "നിങ്ങളുടെ വിദ്യാഭ്യാസ യോഗ്യത എന്താണ്?",
    BN: "আপনার সর্বোচ্চ শিক্ষাগত যোগ্যতা কী?",
    MR: "तुमची सर्वोच्च शैक्षणिक पात्रता काय आहे?"
  }
};

/**
 * Extract numerical value for money (handling lakhs, thousands, numerals in English & Indian languages)
 */
export function extractIncomeOrAmount(text) {
  const lower = text.toLowerCase();
  
  const lakhMatch = lower.match(/(\d+(\.\d+)?)\s*(lakh|lakhs|lac|lacs|l|लाख|లక్ష|లక్షల|ലക്ഷം|লাখ)/i);
  if (lakhMatch) {
    return Math.round(parseFloat(lakhMatch[1]) * 100000);
  }

  const kMatch = lower.match(/(\d+(\.\d+)?)\s*(k|thousand|हजार|వేలు|వేల|ആയിരം|হাজার)/i);
  if (kMatch) {
    return Math.round(parseFloat(kMatch[1]) * 1000);
  }

  const numMatches = text.match(/\b\d{4,8}\b/g);
  if (numMatches && numMatches.length > 0) {
    return parseInt(numMatches[0], 10);
  }

  return null;
}

/**
 * Extract age from speech or text input
 */
export function extractAge(text) {
  const ageMatch = text.match(/(?:age|aged|am|years?\s*old|साल|वर्ष|సంవత్సరాల|సంవత్సరాలు|വയസ്സ്)\s*[:=]?\s*(\d{1,3})/i) ||
                   text.match(/(\d{1,3})\s*(?:years?\s*old|yrs|years|साल|वर्ष|సంవత్సరాలు|വയസ്സ്)/i);
  if (ageMatch) {
    const ageVal = parseInt(ageMatch[1], 10);
    if (ageVal >= 16 && ageVal <= 100) return ageVal;
  }
  return null;
}

/**
 * Extract state / location
 */
export function extractState(text) {
  const states = [
    'Telangana', 'Andhra Pradesh', 'Tamil Nadu', 'Karnataka', 'Kerala', 
    'Maharashtra', 'West Bengal', 'Uttar Pradesh', 'Gujarat', 'Rajasthan', 
    'Delhi', 'Bihar', 'Madhya Pradesh', 'Punjab', 'Haryana', 'Odisha', 'Assam'
  ];
  const lower = text.toLowerCase();
  for (const s of states) {
    if (lower.includes(s.toLowerCase())) return s;
  }
  if (lower.includes('hyderabad') || lower.includes('warangal') || lower.includes('తెలంగాణ')) return 'Telangana';
  if (lower.includes('amaravati') || lower.includes('vijayawada') || lower.includes('ఆంధ్ర')) return 'Andhra Pradesh';
  if (lower.includes('bangalore') || lower.includes('bengaluru') || lower.includes('కర్ణాటక')) return 'Karnataka';
  if (lower.includes('chennai') || lower.includes('தமிழ்நாடு')) return 'Tamil Nadu';
  if (lower.includes('mumbai') || lower.includes('pune') || lower.includes('महाराष्ट्र')) return 'Maharashtra';
  if (lower.includes('kolkata') || lower.includes('বাংলা')) return 'West Bengal';
  if (lower.includes('delhi') || lower.includes('दिल्ली')) return 'Delhi';
  return null;
}

/**
 * Extract occupation
 */
export function extractOccupation(text) {
  const lower = text.toLowerCase();
  if (lower.includes('farm') || lower.includes('kisan') || lower.includes('crop') || lower.includes('రైతు') || lower.includes('किसान') || lower.includes('విவசாயி')) {
    return 'Farmer';
  }
  if (lower.includes('vendor') || lower.includes('street') || lower.includes('cart') || lower.includes('ठेला') || lower.includes('दुकान') || lower.includes('వీధి వ్యాపారి')) {
    return 'Street Vendor';
  }
  if (lower.includes('weaver') || lower.includes('artisan') || lower.includes('handicraft') || lower.includes('बुनकर') || lower.includes('చేనేత')) {
    return 'Artisan / Weaver';
  }
  if (lower.includes('shop') || lower.includes('business') || lower.includes('retail') || lower.includes('व्यापारी') || lower.includes('వ్యాపారం') || lower.includes('தொழில்')) {
    return 'Self Employed / Shopkeeper';
  }
  if (lower.includes('student') || lower.includes('study') || lower.includes('छात्र') || lower.includes('విద్యార్థి') || lower.includes('மாணவர்')) {
    return 'Student';
  }
  return null;
}

/**
 * Extract education
 */
export function extractEducation(text) {
  const lower = text.toLowerCase();
  if (lower.includes('post grad') || lower.includes('master') || lower.includes('m.tech') || lower.includes('mba')) return 'Post Graduate';
  if (lower.includes('grad') || lower.includes('degree') || lower.includes('b.tech') || lower.includes('b.sc') || lower.includes('b.com') || lower.includes('स्नातक') || lower.includes('డిగ్రీ')) return 'Graduate';
  if (lower.includes('diploma') || lower.includes('polytechnic') || lower.includes('iti')) return 'Diploma';
  if (lower.includes('12th') || lower.includes('inter') || lower.includes('intermediate') || lower.includes('12वीं') || lower.includes('ఇంటర్')) return '12th pass';
  if (lower.includes('10th') || lower.includes('ssc') || lower.includes('matric') || lower.includes('10वीं') || lower.includes('10వ')) return '10th pass';
  if (lower.includes('8th') || lower.includes('primary') || lower.includes('8वीं')) return '8th pass';
  return null;
}

/**
 * Extract project type / purpose
 */
export function extractProjectType(text) {
  const lower = text.toLowerCase();
  if (lower.includes('farm') || lower.includes('agri') || lower.includes('crop') || lower.includes('kisan') || lower.includes('खेती') || lower.includes('వ్యవసాయం')) {
    return 'agriculture';
  }
  if (lower.includes('edu') || lower.includes('scholarship') || lower.includes('study') || lower.includes('college') || lower.includes('school') || lower.includes('पढ़ाई') || lower.includes('చదువు')) {
    return 'education';
  }
  if (lower.includes('health') || lower.includes('hospital') || lower.includes('medical') || lower.includes('medicine') || lower.includes('treatment') || lower.includes('दवा') || lower.includes('చికిత్స')) {
    return 'healthcare';
  }
  if (lower.includes('loan') || lower.includes('business') || lower.includes('shop') || lower.includes('store') || lower.includes('manufacturing') || lower.includes('startup') || lower.includes('काम') || lower.includes('ఉపాధి') || lower.includes('రుణం')) {
    return 'business';
  }
  return null;
}

/**
 * Master parser: Extracts all entities from text and merges with existing criteria
 */
export function parseUserInput(text, existingCriteria = {}) {
  const updated = { ...existingCriteria };

  const pType = extractProjectType(text);
  if (pType && !updated.projectType) updated.projectType = pType;

  const inc = extractIncomeOrAmount(text);
  if (inc) {
    if (!updated.income) {
      updated.income = inc;
    } else if (!updated.cost) {
      updated.cost = inc;
    }
  }

  const age = extractAge(text);
  if (age && !updated.age) updated.age = age;

  const st = extractState(text);
  if (st && !updated.state) updated.state = st;

  const occ = extractOccupation(text);
  if (occ && !updated.occupation) updated.occupation = occ;

  const edu = extractEducation(text);
  if (edu && !updated.education) updated.education = edu;

  return updated;
}

/**
 * Detect missing fields for scheme recommendation in prioritized order
 */
export function getMissingFields(criteria) {
  const missing = [];
  if (!criteria.projectType) missing.push('projectType');
  if (!criteria.state) missing.push('state');
  if (!criteria.income) missing.push('income');
  if (!criteria.occupation) missing.push('occupation');
  if (!criteria.age) missing.push('age');
  if (!criteria.education) missing.push('education');
  return missing;
}

/**
 * Generate intelligent sequential missing-information question in the selected language
 */
export function generateAssistantResponse(criteria, lang = 'EN') {
  const missing = getMissingFields(criteria);

  if (missing.length === 0) {
    const successMessages = {
      EN: "Thank you! I have gathered all necessary information. SchemeSetu is now finding your matched government schemes...",
      HI: "धन्यवाद! मैंने आपकी सभी आवश्यक जानकारी एकत्र कर ली है। SchemeSetu अब आपके लिए उपयुक्त सरकारी योजनाएं खोज रहा है...",
      TE: "ధన్యవాదాలు! మీ వివరాలు పూర్తయ్యాయి. SchemeSetu ఇప్పుడు మీ అర్హత గల ప్రభుత్వ పథకాలను సిఫార్సు చేస్తోంది...",
      TA: "நன்றி! தேவையான அனைத்து தகவல்களும் பெறப்பட்டன. SchemeSetu இப்போது உங்களுக்கான அரசு திட்டங்களை மதிப்பீடு செய்கிறது...",
      KN: "ಧನ್ಯವಾದಗಳು! ಅಗತ್ಯವಿರುವ ಎಲ್ಲಾ ವಿವರಗಳನ್ನು ಸಂಗ್ರಹಿಸಲಾಗಿದೆ. SchemeSetu ಈಗ ನಿಮ್ಮ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ಹುಡುಕುತ್ತಿದೆ...",
      ML: "നന്ദി! ആവശ്യമായ വിവരങ്ങൾ ശേഖരിച്ചു കഴിഞ്ഞു. SchemeSetu ഇപ്പോൾ നിങ്ങൾക്കുള്ള സർക്കാർ പദ്ധതികൾ കണ്ടെത്തുന്നു...",
      BN: "ধন্যবাদ! প্রয়োজনীয় সমস্ত তথ্য সংগ্রহ করা হয়েছে। SchemeSetu এখন আপনার জন্য সরকারি স্কিমগুলি খুঁজছে...",
      MR: "धन्यवाद! आवश्यक सर्व माहिती गोळा केली आहे. SchemeSetu आता तुमच्यासाठी सरकारी योजना शोधत आहे..."
    };
    return {
      isComplete: true,
      text: successMessages[lang] || successMessages.EN,
      nextField: null,
      missingFields: []
    };
  }

  // Ask the NEXT single most important missing field
  const nextField = missing[0];
  const promptMap = SEQUENTIAL_FIELD_PROMPTS[nextField] || {};
  const questionText = promptMap[lang] || promptMap.EN || `Please provide your ${nextField}.`;

  return {
    isComplete: false,
    text: questionText,
    nextField,
    missingFields: missing
  };
}
