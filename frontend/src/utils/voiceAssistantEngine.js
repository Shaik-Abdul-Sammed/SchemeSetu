/**
 * SchemeSetu Voice & Conversational Assistant Intelligence Engine
 * Handles Entity Extraction, Missing Field Detection, and Multilingual Natural Responses
 */

export const REQUIRED_ELIGIBILITY_FIELDS = [
  'projectType',
  'income',
  'age',
  'state',
  'occupation',
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
  income: {
    EN: 'annual family income',
    HI: 'वार्षिक पारिवारिक आय',
    TE: 'వార్షిక కుటుంబ ఆదాయం',
    TA: 'ஆண்டு குடும்ப வருமானம்',
    KN: 'ವಾರ್ಷಿಕ ಕುಟುಂಬ ಆದಾಯ',
    ML: 'വാർഷിക കുടുംബ വരുമാനം',
    BN: 'বার্ষিক পারিবারিক আয়',
    MR: 'वार्षिक कौटुंबिक उत्पन्न'
  },
  age: {
    EN: 'age in years',
    HI: 'आयु (वर्षों में)',
    TE: 'వయస్సు (సంవత్సరాలలో)',
    TA: 'வயது',
    KN: 'ವಯಸ್ಸು',
    ML: 'വയസ്സ്',
    BN: 'বয়স',
    MR: 'वय'
  },
  state: {
    EN: 'state or district location',
    HI: 'राज्य या जिला',
    TE: 'రాష్ట్రం లేదా జిల్లా',
    TA: 'மாநிலம் அல்லது மாவட்டம்',
    KN: 'ರಾಜ್ಯ ಅಥವಾ ಜಿಲ್ಲೆ',
    ML: 'സംസ്ഥാനം അല്ലെങ്കിൽ ജില്ല',
    BN: 'রাজ্য বা জেলা',
    MR: 'राज्य किंवा जिल्हा'
  },
  occupation: {
    EN: 'current occupation (e.g. farmer, artisan, self-employed)',
    HI: 'वर्तमान व्यवसाय (उदा. किसान, कारीगर, स्व-रोजगार)',
    TE: 'ప్రస్తుత వృత్తి (ఉదా. రైతు, చేతివృత్తిదారుడు, స్వయం ఉపాధి)',
    TA: 'தற்போதைய தொழில் (எ.கா. விவசாயி, கைவினைஞர், சுயதொழில்)',
    KN: 'ಪ್ರಸ್ತುತ ಉದ್ಯೋಗ (ಉದಾ. ರೈತ, ಕುಶಲಕರ್ಮಿ, ಸ್ವಯಂ ಉದ್ಯೋಗಿ)',
    ML: 'നിലവിലെ തൊഴിൽ (ഉദാ. കർഷകൻ, കരകൗശല വിദഗ്ദ്ധൻ, സ്വയംതൊഴിൽ)',
    BN: 'বর্তমান পেশা (যেমন কৃষক, কারিগর, স্ব-নিযুক্ত)',
    MR: 'सध्याचा व्यवसाय (उदा. शेतकरी, कारागीर, स्वयंरोजगार)'
  },
  education: {
    EN: 'education level (e.g. 10th pass, graduate, diploma)',
    HI: 'शिक्षा का स्तर (उदा. 10वीं पास, स्नातक, डिप्लोमा)',
    TE: 'విద్యార్హత (ఉదా. 10వ తరగతి, డిగ్రీ, డిప్లొమా)',
    TA: 'கல்வி தகுதி (எ.கா. 10ஆம் வகுப்பு, பட்டதாரி, டிப்ளமோ)',
    KN: 'ಶಿಕ್ಷಣ ಮಟ್ಟ (ಉದಾ. 10ನೇ ತರಗತಿ, ಪದವಿ, ಡಿಪ್ಲೊಮಾ)',
    ML: 'വിദ്യാഭ്യാസ യോഗ്യത (ഉദാ. 10-ാം ക്ലാസ്, ബിരുദം, ഡിപ്ലോമ)',
    BN: 'শিক্ষাগত যোগ্যতা (যেমন ১০ম পাস, স্নাতক, ডিপ্লোমা)',
    MR: 'शिक्षणाचा स्तर (उदा. १०वी उत्तीर्ण, पदवीधर, डिप्लोमा)'
  }
};

/**
 * Extract numerical value for money (handling lakhs, thousands, numerals)
 */
export function extractIncomeOrAmount(text) {
  const lower = text.toLowerCase();
  
  // Check for lakh / lacs / L (e.g. 2.5 lakh, 3lakh, 200000, २ लाख, 2 లక్షలు)
  const lakhMatch = lower.match(/(\d+(\.\d+)?)\s*(lakh|lakhs|lac|lacs|l|लाख|లక్ష|ലക്ഷം|লাখ)/i);
  if (lakhMatch) {
    return Math.round(parseFloat(lakhMatch[1]) * 100000);
  }

  const kMatch = lower.match(/(\d+(\.\d+)?)\s*(k|thousand|हजार|వేలు|ആയിരം|হাজার)/i);
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
  const ageMatch = text.match(/(?:age|aged|am|years?\s*old|साल|वर्ष|సంవత్సరాల|വയസ്സ്)\s*[:=]?\s*(\d{1,3})/i) ||
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
  if (lower.includes('hyderabad') || lower.includes('warangal')) return 'Telangana';
  if (lower.includes('bangalore') || lower.includes('mysore')) return 'Karnataka';
  if (lower.includes('chennai') || lower.includes('coimbatore')) return 'Tamil Nadu';
  if (lower.includes('mumbai') || lower.includes('pune')) return 'Maharashtra';
  if (lower.includes('kolkata')) return 'West Bengal';
  if (lower.includes('delhi')) return 'Delhi';
  return null;
}

/**
 * Extract occupation
 */
export function extractOccupation(text) {
  const lower = text.toLowerCase();
  if (lower.includes('farm') || lower.includes('kisan') || lower.includes('crop') || lower.includes('रैतु') || lower.includes('రైతు') || lower.includes('किसान')) {
    return 'Farmer';
  }
  if (lower.includes('vendor') || lower.includes('street') || lower.includes('cart') || lower.includes('ठेला') || lower.includes('दुकान')) {
    return 'Street Vendor';
  }
  if (lower.includes('weaver') || lower.includes('artisan') || lower.includes('handicraft') || lower.includes('बुनकर') || lower.includes('చేనేత')) {
    return 'Artisan / Weaver';
  }
  if (lower.includes('shop') || lower.includes('business') || lower.includes('retail') || lower.includes('व्यापारी') || lower.includes('వ్యాపారం')) {
    return 'Self Employed / Shopkeeper';
  }
  if (lower.includes('student') || lower.includes('study') || lower.includes('छात्र') || lower.includes('విద్యార్థి')) {
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
  if (lower.includes('loan') || lower.includes('business') || lower.includes('shop') || lower.includes('store') || lower.includes('manufacturing') || lower.includes('startup') || lower.includes('काम') || lower.includes('ఉపాధి')) {
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
 * Detect missing fields for scheme recommendation
 */
export function getMissingFields(criteria) {
  const missing = [];
  if (!criteria.projectType) missing.push('projectType');
  if (!criteria.income) missing.push('income');
  if (!criteria.age) missing.push('age');
  if (!criteria.state) missing.push('state');
  if (!criteria.occupation) missing.push('occupation');
  if (!criteria.education) missing.push('education');
  return missing;
}

/**
 * Generate intelligent missing-information response in the selected language
 */
export function generateAssistantResponse(criteria, lang = 'EN') {
  const missing = getMissingFields(criteria);

  if (missing.length === 0) {
    const successMessages = {
      EN: "Thank you! I have gathered your details. SchemeSetu is now evaluating suitable government schemes for your profile...",
      HI: "धन्यवाद! मैंने आपकी सभी जानकारी नोट कर ली है। SchemeSetu अब आपके लिए उपयुक्त सरकारी योजनाओं की जाँच कर रहा है...",
      TE: "ధన్యవాదాలు! మీ వివరాలు సేకరించబడ్డాయి. SchemeSetu ఇప్పుడు మీ ప్రొఫైల్ కోసం తగిన ప్రభుత్వ పథకాలను పరిశీలిస్తోంది...",
      TA: "நன்றி! உங்கள் தகவல்கள் சேகரிக்கப்பட்டன. SchemeSetu இப்போது உங்களுக்கான பொருத்தமான அரசு திட்டங்களை மதிப்பீடு செய்கிறது...",
      KN: "ಧನ್ಯವಾದಗಳು! ನಿಮ್ಮ ವಿವರಗಳನ್ನು ಸಂಗ್ರಹಿಸಲಾಗಿದೆ. SchemeSetu ಈಗ ನಿಮ್ಮ ಪ್ರೊಫೈಲ್‌ಗಾಗಿ ಸೂಕ್ತವಾದ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ಪರಿಶೀಲಿಸುತ್ತಿದೆ...",
      ML: "നന്ദി! നിങ്ങളുടെ വിവരങ്ങൾ ശേഖരിച്ചു. SchemeSetu ഇപ്പോൾ നിങ്ങളുടെ പ്രൊഫൈലിനായി അനുയോജ്യമായ സർക്കാർ പദ്ധതികൾ വിലയിരുത്തുന്നു...",
      BN: "ধন্যবাদ! আমি আপনার বিবরণ সংগ্রহ করেছি। SchemeSetu এখন আপনার জন্য উপযুক্ত সরকারি স্কিমগুলি মূল্যায়ন করছে...",
      MR: "धन्यवाद! मी तुमचे सर्व तपशील नोंदवले आहेत. SchemeSetu आता तुमच्यासाठी योग्य सरकारी योजना तपासत आहे..."
    };
    return {
      isComplete: true,
      text: successMessages[lang] || successMessages.EN,
      missingFields: []
    };
  }

  // Format missing field labels in current language
  const missingLabels = missing.map(m => FIELD_LABELS[m]?.[lang] || FIELD_LABELS[m]?.EN || m);
  const formattedList = missingLabels.join(', ');

  const templates = {
    EN: `I can help find suitable schemes. To check your eligibility, I still need your: ${formattedList}.`,
    HI: `मैं उपयुक्त योजनाएं खोजने में आपकी मदद कर सकता हूं। आपकी पात्रता की सटीक जांच के लिए, मुझे अभी भी आपकी: ${formattedList} चाहिए।`,
    TE: `నేను తగిన పథకాలను కనుగొనడంలో మీకు సహాయపడగలను. మీ అర్హతను ఖచ్చితంగా పరిశీలించడానికి, నాకు ఇంకా మీ: ${formattedList} అవసరం.`,
    TA: `பொருத்தமான திட்டங்களை கண்டறிய நான் உதவ முடியும். உங்கள் தகுதியை சரிபார்க்க, எனக்கு இன்னும் உங்கள்: ${formattedList} தேவை.`,
    KN: `ಸೂಕ್ತವಾದ ಯೋಜನೆಗಳನ್ನು ಹುಡುಕಲು ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ. ನಿಮ್ಮ ಅರ್హತೆಯನ್ನು ಪರಿಶೀಲಿಸಲು, ನನಗೆ ಇನ್ನೂ ನಿಮ್ಮ: ${formattedList} ಅಗತ್ಯವಿದೆ.`,
    ML: `അനുയോജ്യമായ പദ്ധതികൾ കണ്ടെത്താൻ എനിക്ക് സഹായിക്കാനാകും. നിങ്ങളുടെ യോഗ്യത പരിശോധിക്കാൻ, എനിക്ക് ഇനി നിങ്ങളുടെ: ${formattedList} ആവശ്യമാണ്.`,
    BN: `আমি উপযুক্ত স্কিম খুঁজে পেতে আপনাকে সাহায্য করতে পারি। আপনার যোগ্যতা পরীক্ষা করতে, আমার এখনও আপনার: ${formattedList} প্রয়োজন।`,
    MR: `मी योग्य योजना शोधण्यात मदत करू शकतो. तुमची पात्रता तपासण्यासाठी, मला अजूनही तुमचे: ${formattedList} हवे आहे.`
  };

  return {
    isComplete: false,
    text: templates[lang] || templates.EN,
    missingFields: missing
  };
}
