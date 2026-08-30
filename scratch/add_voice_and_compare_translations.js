const fs = require('fs');
const path = require('path');

const filePath = '/home/user/Github/SchemeSetu/frontend/src/context/languageStore.js';
const fileContent = fs.readFileSync(filePath, 'utf8');

const startIdx = fileContent.indexOf('export const translations = {');
const endIdx = fileContent.indexOf('};\n\nexport const AVAILABLE_LANGUAGES');

if (startIdx === -1 || endIdx === -1) {
  console.error("Could not find translations block boundary");
  process.exit(1);
}

const jsonCode = fileContent.substring(startIdx + 'export const translations = '.length, endIdx + 1);
const translations = JSON.parse(jsonCode);

const newKeys = {
  compare: {
    EN: "Compare",
    HI: "तुलना करें",
    TE: "పోల్చండి",
    TA: "ஒப்பிடுங்கள்",
    KN: "ಹೋಲಿಕೆ ಮಾಡಿ",
    ML: "താരതമ്യം ചെയ്യുക",
    BN: "তুলনা করুন",
    MR: "तुलना करा",
    GON: "तुलना कीम",
    BHI: "तुलना करो"
  },
  schemeComparison: {
    EN: "Government Scheme Comparator",
    HI: "सरकारी योजना तुलना केंद्र",
    TE: "ప్రభుత్వ పథకాల పోలిక",
    TA: "அரசு திட்ட ஒப்பீட்டாளர்",
    KN: "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಹೋಲಿಕೆ",
    ML: "സർക്കാർ പദ്ധതി താരതമ്യം",
    BN: "সরকারী প্রকল্প তুলনাকারী",
    MR: "सरकारी योजना तुलना",
    GON: "सरकारी योजना तुलना केंद्र",
    BHI: "सरकारी योजना तुलना केंद्र"
  },
  compareSchemesTitle: {
    EN: "Side-by-Side Scheme Comparison",
    HI: "योजनाओं की आमने-सामने तुलना",
    TE: "పథకాల ముఖాముఖి పోలిక",
    TA: "திட்டங்களின் ஒப்பீடு",
    KN: "ಯೋಜನೆಗಳ ಮುಖಾಮುಖಿ ಹೋಲಿಕೆ",
    ML: "പദ്ധതികളുടെ താരതമ്യം",
    BN: "প্রকল্পের পাশাপাশি তুলনা",
    MR: "योजनांची समोरासमोर तुलना",
    GON: "योजनाना सीधा तुलना",
    BHI: "योजना नी सामे सामी तुलना"
  },
  compareSchemesSubtitle: {
    EN: "Compare official financial caps, SC subsidies, interest rates, eligibility criteria, and required documents across government welfare initiatives.",
    HI: "सरकारी योजनाओं में लोन सीमा, अनुसूचित जाति (SC) सब्सिडी, ब्याज दर, पात्रता और आवश्यक दस्तावेजों की विस्तृत तुलना करें।",
    TE: "ప్రభుత్వ సంక్షేమ పథకాలలో గరిష్ట రుణాలు, SC సబ్సిడీలు, వడ్డీ రేట్లు మరియు పత్రాలను పోల్చండి.",
    TA: "அரசு திட்டங்களில் கடன் வரம்புகள், எஸ்சி மானியங்கள் மற்றும் ஆவணங்களை ஒப்பிடுங்கள்.",
    KN: "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳಲ್ಲಿ ಸಾಲ ಮಿತಿಗಳು, ಎಸ್‌ಸಿ ಸಬ್ಸಿಡಿಗಳು ಮತ್ತು ದಾಖಲೆಗಳನ್ನು ಹೋಲಿಸಿ.",
    ML: "സർക്കാർ പദ്ധതികളിലെ വായ്പാ പരിധികൾ, സബ്‌സിഡികൾ, രേഖകൾ എന്നിവ താരതമ്യം ചെയ്യുക.",
    BN: "সরকারী প্রকল্পে ঋণের সীমা, এসসি ভর্তুকি, সুদের হার এবং নথি তুলনা করুন।",
    MR: "सरकारी योजनांमध्ये कर्ज मर्यादा, एससी सबसिडी, व्याजदर आणि कागदपत्रांची तुलना करा.",
    GON: "सरकारी योजना मय लोन सीमा, एससी सब्सिडी, ब्याज दर अउर कागज-पत्तरना तुलना कीम।",
    BHI: "सरकारी योजना मा लोन सीमा, एससी सब्सिडी, व्याज दर अणे कागळिया नी तुलना करो।"
  },
  stopListening: {
    EN: "Stop Listening",
    HI: "सुनना बंद करें",
    TE: "వినడం ఆపండి",
    TA: "கேட்பதை நிறுத்து",
    KN: "ಕೇಳುವುದನ್ನು ನಿಲ್ಲಿಸಿ",
    ML: "കേൾക്കുന്നത് നിർത്തുക",
    BN: "শোনা বন্ধ করুন",
    MR: "ऐकणे थांबवा",
    GON: "सुनल बंद कीम",
    BHI: "सांभळवुं बंध करो"
  },
  startListening: {
    EN: "Speak Query",
    HI: "बोलकर पूछें",
    TE: "మాట్లాడి అడగండి",
    TA: "பேசி கேளுங்கள்",
    KN: "ಮಾತನಾಡಿ ಕೇಳಿ",
    ML: "സംസാരിച്ച് ചോദിക്കുക",
    BN: "বলে জিজ্ঞাসা করুন",
    MR: "बोलून विचारा",
    GON: "बोल के पूछा",
    BHI: "बोली ने पूछो"
  },
  stopSpeaking: {
    EN: "Stop Voice",
    HI: "आवाज़ बंद करें",
    TE: "వాయిస్ ఆపండి",
    TA: "குரலை நிறுத்து",
    KN: "ಧ್ವನಿ ನಿಲ್ಲಿಸಿ",
    ML: "ശബ്ദം നിർത്തുക",
    BN: "ভয়েস বন্ধ করুন",
    MR: "आवाज थांबवा",
    GON: "आवाज बंद कीम",
    BHI: "आवाज बंध करो"
  },
  replayAudio: {
    EN: "Replay Voice",
    HI: "दोबारा सुनें",
    TE: "మళ్లీ వినండి",
    TA: "மீண்டும் கேளுங்கள்",
    KN: "ಮತ್ತೆ ಕೇಳಿ",
    ML: "വീണ്ടും കേൾക്കുക",
    BN: "আবার শুনুন",
    MR: "पुन्हा ऐका",
    GON: "फिर से सुना",
    BHI: "फरी सांभळो"
  },
  speechNotSupported: {
    EN: "Browser speech recognition not available. Please type your query below.",
    HI: "ब्राउज़र में वॉयस इनपुट उपलब्ध नहीं है। कृपया नीचे लिखकर पूछें।",
    TE: "బ్రౌజర్‌లో వాయిస్ గుర్తింపు అందుబాటులో లేదు. దయచేసి క్రింద టైప్ చేయండి.",
    TA: "குரல் அறிதல் கிடைக்கவில்லை. கீழே தட்டச்சு செய்யவும்.",
    KN: "ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ಕೆಳಗೆ ಟೈಪ್ ಮಾಡಿ.",
    ML: "വോയ്‌സ് റെക്കഗ്നിഷൻ ലഭ്യമല്ല. ദയവായി താഴെ ടൈപ്പ് ചെയ്യുക.",
    BN: "ভয়েস রিকগনিশন উপলব্ধ নেই। অনুগ্রহ করে নিচে টাইপ করুন।",
    MR: "ब्राउझरमध्ये व्हॉइस इनपुट उपलब्ध नाही. कृपया खाली टाइप करा.",
    GON: "ब्राउज़र मय आवाज सुविधा नाई चलत। नीचे लिख के पूछा।",
    BHI: "ब्राउझर मा आवाज सुविधा नथी। नीचे लखीने पूछो।"
  }
};

const allLangs = Object.keys(translations);

Object.entries(newKeys).forEach(([key, langMap]) => {
  allLangs.forEach(l => {
    translations[l][key] = langMap[l] || langMap['EN'];
  });
});

const enKeys = Object.keys(translations.EN);
console.log(`Total keys in EN now: ${enKeys.length}`);

// Verify all 10 languages have 100% key parity
allLangs.forEach(l => {
  const missing = enKeys.filter(k => !translations[l][k]);
  if (missing.length > 0) {
    console.error(`Language ${l} missing keys:`, missing);
  }
});

const newFileContent = `import { translateText, translateBatch } from '../services/translateService';

export const translations = ${JSON.stringify(translations, null, 2)};

export const AVAILABLE_LANGUAGES = Object.keys(translations);

export function getTranslation(lang, key, fallback) {
  if (!key) return fallback || '';
  const current = translations[lang] || translations.EN;
  if (current && current[key] !== undefined && current[key] !== '') {
    return current[key];
  }
  const en = translations.EN;
  if (en && en[key] !== undefined && en[key] !== '') {
    return en[key];
  }
  return fallback !== undefined ? fallback : key;
}
`;

fs.writeFileSync(filePath, newFileContent, 'utf8');
console.log(`✅ Successfully updated languageStore.js with Voice & Compare keys across all 10 languages!`);
