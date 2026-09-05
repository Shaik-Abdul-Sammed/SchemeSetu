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
  mediaAnalysisTitle: {
    EN: "Media & Document Intake Hub",
    HI: "मीडिया और दस्तावेज़ विश्लेषण केंद्र",
    TE: "మీడియా & పత్రాల విశ్లేషణ కేంద్రం",
    TA: "ஊடக மற்றும் ஆவண பகுப்பாய்வு மையம்",
    KN: "ಮಾಧ್ಯಮ ಮತ್ತು ದಾಖಲೆ ವಿಶ್ಲೇಷಣಾ ಕೇಂದ್ರ",
    ML: "മീഡിയ & രേഖ വിശകലന കേന്ദ്രം",
    BN: "মিডিয়া এবং নথি বিশ্লেষণ কেন্দ্র",
    MR: "मीडिया आणि दस्तऐवज विश्लेषण केंद्र",
    GON: "कागज-पत्तर अउर आवाज विश्लेषण केंद्र",
    BHI: "कागळिया अणे आवाज तपासणी केंद्र"
  },
  mediaAnalysisSub: {
    EN: "Upload supporting documents, certificates, project invoices, or record a voice note for local rule-based eligibility extraction.",
    HI: "स्थानीय नियम-आधारित पात्रता निष्कर्षण के लिए प्रमाण पत्र, जाति प्रमाण पत्र, परियोजना चालान अपलोड करें या वॉयस नोट रिकॉर्ड करें।",
    TE: "స్థానిక అర్హత నిర్ధారణ కోసం కుల ధృవీకరణ పత్రాలు, ఆదాయ ధృవపత్రాలు అప్‌లోడ్ చేయండి లేదా వాయిస్ రికార్డ్ చేయండి.",
    TA: "உள்ளூர் தகுதி சரிபார்ப்பிற்காக சாதி சான்றிதழ்கள், திட்ட அறிக்கைகள் அல்லது குரல் பதிவை பதிவேற்றவும்.",
    KN: "ಸ್ಥಳೀಯ ಅರ್ಹತಾ ಪರಿಶೀಲನೆಗಾಗಿ ಜಾತಿ ಪ್ರಮಾಣಪತ್ರಗಳು, ಆದಾಯ ಪತ್ರಗಳು ಅಥವಾ ಧ್ವನಿ ವಿವರಣೆಯನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.",
    ML: "പ്രാദേശിക യോഗ്യത പരിശോധനയ്ക്കായി സർട്ടിഫിക്കറ്റുകൾ അല്ലെങ്കിൽ വോയ്‌സ് നോട്ട് അപ്‌ലോഡ് ചെയ്യുക.",
    BN: "স্থানীয় যোগ্যতার জন্য জাতি শংসাপত্র, আয় শংসাপত্র বা ভয়েস নোট আপলোড করুন।",
    MR: "स्थानिक नियम-आधारित पात्रतेसाठी जात प्रमाणपत्र, प्रकल्प अहवाल अपलोड करा किंवा व्हॉइस नोट रेकॉर्ड करा.",
    GON: "स्थानिक पात्रता जाँचे बर जाति प्रमाण पत्र, कमाई रसीद या आवाज संदेश अपलोड कीम।",
    BHI: "पात्रता तपासवा माटे जाति दाखलो, आवक दाखलो अथवा आवाज रेकॉर्ड करीने अपलोड करो।"
  },
  tabDocUpload: {
    EN: "Document / Certificate (PDF/Image)",
    HI: "दस्तावेज़ / प्रमाण पत्र (PDF/Image)",
    TE: "పత్రం / ధృవీకరణ పత్రం (PDF/Image)",
    TA: "ஆவணம் / சான்றிதழ் (PDF/Image)",
    KN: "ದಾಖಲೆ / ಪ್ರಮಾಣಪತ್ರ (PDF/ಚಿತ್ರ)",
    ML: "രേഖ / സർട്ടിഫിക്കറ്റ് (PDF/Image)",
    BN: "নথি / শংসাপত্র (PDF/ছবি)",
    MR: "दस्तऐवज / प्रमाणपत्र (PDF/चित्र)",
    GON: "कागज / प्रमाण पत्र (PDF/फोटो)",
    BHI: "कागळिया / दाखलो (PDF/फोटो)"
  },
  tabAudioUpload: {
    EN: "Voice Note / Audio Description",
    HI: "वॉयस नोट / बोलकर बताएं",
    TE: "వాయిస్ నోట్ / ఆడియో వివరణ",
    TA: "குரல் பதிவு / ஆடியோ விளக்கம்",
    KN: "ಧ್ವನಿ ಟಿಪ್ಪಣಿ / ಆಡಿಯೋ ವಿವರಣೆ",
    ML: "വോയ്‌സ് നോട്ട് / ഓഡിയോ വിവരണം",
    BN: "ভয়েস নোট / অডিও বিবরণ",
    MR: "व्हॉइस नोट / ऑडिओ वर्णन",
    GON: "आवाज संदेश / बोल के बतावा",
    BHI: "आवाज संदेश / बोली ने समजावो"
  },
  stepwiseWizard: {
    EN: "Step-by-Step Wizard",
    HI: "चरण-दर-चरण प्रश्नावली",
    TE: "దశలవారీ ప్రశ్నావళి",
    TA: "படி படியான வழிகாட்டி",
    KN: "ಹಂತ ಹಂತದ ಮಾದರಿ",
    ML: "ഘട്ടം ഘട്ടമായുള്ള വിവരണം",
    BN: "ধাপে ধাপে প্রশ্নাবলী",
    MR: "टप्प्याटप्प्याने प्रश्नमंजुषा",
    GON: "कदम दर कदम सवाल",
    BHI: "पगले पगले सवाल"
  },
  mediaDocAnalysis: {
    EN: "Media & Document Intake",
    HI: "मीडिया और दस्तावेज़ विश्लेषण",
    TE: "మీడియా & పత్రాల విశ్లేషణ",
    TA: "ஊடக மற்றும் ஆவண உள்ளீடு",
    KN: "ಮಾಧ್ಯಮ ಮತ್ತು ದಾಖಲೆ ಪರಿಶೀಲನೆ",
    ML: "മീഡിയ & രേഖ ഇൻടേക്ക്",
    BN: "মিডিয়া এবং নথি ইনপুট",
    MR: "मीडिया आणि दस्तऐवज तपासणी",
    GON: "कागज अउर आवाज जांच",
    BHI: "कागळिया अणे आवाज तपास"
  },
  demoPersonUpload: {
    EN: "Upload Demo Person Profile",
    HI: "डेमो व्यक्ति प्रोफ़ाइल अपलोड करें",
    TE: "డెమో ప్రొఫైల్ అప్‌లోడ్ చేయండి",
    TA: "மாதிரி நபர் சுயவிவர பதிவேற்றம்",
    KN: "ಡೆಮೊ ಪ್ರೊಫೈಲ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    ML: "ഡെമോ പ്രൊഫൈൽ അപ്‌ലോഡ് ചെയ്യുക",
    BN: "ডেমো ব্যক্তি প্রোফাইল আপলোড",
    MR: "डेमो प्रोफाइल अपलोड करा",
    GON: "डेमो नागरिक प्रोफाइल अपलोड कीम",
    BHI: "डेमो नागरिक प्रोफाइल अपलोड करो"
  },
  assessmentComplete: {
    EN: "Eligibility Assessment Complete",
    HI: "पात्रता मूल्यांकन पूर्ण हुआ",
    TE: "అర్హత అంచనా పూర్తయింది",
    TA: "தகுதி மதிப்பீடு முடிந்தது",
    KN: "ಅರ್ಹತಾ ಮೌಲ್ಯಮಾಪನ ಪೂರ್ಣಗೊಂಡಿದೆ",
    ML: "യോഗ്യതാ വിലയിരുത്തൽ പൂർത്തിയായി",
    BN: "যোগ্যতা মূল্যায়ন সম্পন্ন হয়েছে",
    MR: "पात्रता मूल्यमापन पूर्ण झाले",
    GON: "पात्रता जांच पूरा भइल",
    BHI: "पात्रता तपासणी पूरी थई"
  },
  assessmentSummary: {
    EN: "Based on the information provided, you may be eligible for",
    HI: "दी गई जानकारी के आधार पर, आप पात्र हो सकते हैं",
    TE: "అందించిన సమాచారం ఆధారంగా, మీరు అర్హులు కావచ్చు",
    TA: "வழங்கப்பட்ட தகவலின் அடிப்படையில், நீங்கள் தகுதியுடையவராக இருக்கலாம்",
    KN: "ನೀಡಿದ ಮಾಹಿತಿಯ ಆಧಾರದ ಮೇಲೆ, ನೀವು ಅರ್ಹರಾಗಿರಬಹುದು",
    ML: "നൽകിയ വിവരങ്ങളുടെ അടിസ്ഥാനത്തിൽ, നിങ്ങൾ അർഹരായേക്കാം",
    BN: "প্রদত্ত তথ্যের ভিত্তিতে, আপনি যোগ্য হতে পারেন",
    MR: "दिलेल्या माहितीच्या आधारे, आपण पात्र असू शकता",
    GON: "देल जानकारी अनुसार, तुमाले मिल सकत आय",
    BHI: "आपेली विगत मुजब, तमार लायक योजना छे"
  },
  recommendedForYou: {
    EN: "Recommended Schemes for You",
    HI: "आपके लिए अनुशंसित सरकारी योजनाएं",
    TE: "మీ కోసం సిఫార్సు చేయబడిన పథకాలు",
    TA: "உங்களுக்காக பரிந்துரைக்கப்பட்ட திட்டங்கள்",
    KN: "ನಿಮಗಾಗಿ ಶಿಫಾರಸು ಮಾಡಿದ ಯೋಜನೆಗಳು",
    ML: "നിങ്ങൾക്കായി ശുപാർശ ചെയ്ത പദ്ധതികൾ",
    BN: "আপনার জন্য প্রস্তাবিত প্রকল্প",
    MR: "आपल्यासाठी शिफारस केलेल्या योजना",
    GON: "तुमाना बर अनुशंसित सरकारी योजना",
    BHI: "तमार माटे खास सरकारी योजनाओ"
  },
  matchScore: {
    EN: "Match Score",
    HI: "मैच स्कोर",
    TE: "మ్యాచ్ స్కోర్",
    TA: "பொருத்த மதிப்பெண்",
    KN: "ಹೊಂದಾಣಿಕೆ ಅಂಕ",
    ML: "മാച്ച് സ്കോർ",
    BN: "ম্যাচ স্কোর",
    MR: "मॅच स्कोअर",
    GON: "मैच स्कोर",
    BHI: "મેચ સ્કોર"
  },
  keyBenefits: {
    EN: "Key Benefit",
    HI: "मुख्य लाभ",
    TE: "ముఖ్య ప్రయోజనాలు",
    TA: "முக்கிய நன்மைகள்",
    KN: "ಪ್ರಮುಖ ಪ್ರಯೋಜನ",
    ML: "പ്രധാന നേട്ടം",
    BN: "প্রধান সুবিধা",
    MR: "मुख्य लाभ",
    GON: "मुख्य फायदा",
    BHI: "मुख्य फायदो"
  },
  whyEligible: {
    EN: "Why You Are Eligible (Explainable AI Breakdown)",
    HI: "आप क्यों पात्र हैं (पारदर्शी एआई विवरण)",
    TE: "మీరు ఎందుకు అర్హులు (వివరణాత్మక AI విశ్లేషణ)",
    TA: "நீங்கள் ஏன் தகுதியுடையவர் (விளக்கக்கூடிய AI விவரம்)",
    KN: "ನೀವು ಏಕೆ ಅರ್ಹರು (ವಿವರಣಾತ್ಮಕ AI ವಿವರ)",
    ML: "നിങ്ങൾ എന്തുകൊണ്ട് അർഹനാണ് (AI വിവരണം)",
    BN: "আপনি কেন যোগ্য (ব্যাখ্যামূলক এআই বিশ্লেষণ)",
    MR: "आपण का पात्र आहात (स्पष्टीकरणात्मक AI विश्लेषण)",
    GON: "तुमाले काबर मिलत आय (कारण सूची)",
    BHI: "तमे केम लायक छो (तपासणी कारणो)"
  },
  reEvaluateDifferent: {
    EN: "Re-evaluate Eligibility with Different Profile",
    HI: "दूसरे प्रोफ़ाइल के साथ पुनः जांचें",
    TE: "మరొక ప్రొఫైల్‌తో మళ్లీ అంచనా వేయండి",
    TA: "வேறொரு சுயவிவரத்துடன் மீண்டும் மதிப்பிடுங்கள்",
    KN: "ಬೇರೆ ಪ್ರೊಫೈಲ್‌ನೊಂದಿಗೆ ಮರು ಮೌಲ್ಯಮಾಪನ ಮಾಡಿ",
    ML: "മറ്റൊരു പ്രൊഫൈൽ ഉപയോഗിച്ച് വീണ്ടും പരിശോധിക്കുക",
    BN: "অন্য প্রোফাইল দিয়ে পুনরায় মূল্যায়ন করুন",
    MR: "दुसऱ्या प्रोफाइलसह पुन्हा तपासा",
    GON: "दुसरा प्रोफाइल से फिर से जाँचा",
    BHI: "बीजा प्रोफाइल थी फरी तपाशो"
  },
  ageValidationError: {
    EN: "Please enter a valid age between 18 and 100 years.",
    HI: "कृपया 18 से 100 वर्ष के बीच एक मान्य आयु दर्ज करें।",
    TE: "దయచేసి 18 నుండి 100 సంవత్సరాల మధ్య సరైన వయస్సును నమోదు చేయండి.",
    TA: "தயவுசெய்து 18 முதல் 100 வயது வரை சரியான வயதை உள்ளிடவும்.",
    KN: "ದಯವಿಟ್ಟು 18 ರಿಂದ 100 ವರ್ಷಗಳ ನಡುವಿನ ಮಾನ್ಯ ವಯಸ್ಸನ್ನು ನಮೂದಿಸಿ.",
    ML: "ദയവായി 18 നും 100 നും ഇടയിൽ സാധുവായ പ്രായം നൽകുക.",
    BN: "অনুগ্রহ করে ১৮ থেকে ১০০ বছরের মধ্যে একটি সঠিক বয়স লিখুন।",
    MR: "कृपया १८ ते १०० वर्षे दरम्यानचे वैध वय प्रविष्ट करा.",
    GON: "18 से 100 साल बीचना सही उमर लिखा।",
    BHI: "18 थी 100 वर्ष वच्चे नी साची उमर लखो।"
  },
  incomeValidationError: {
    EN: "Please enter an annual family income between ₹0 and ₹1,00,00,000.",
    HI: "कृपया ₹0 और ₹1,00,00,000 के बीच पारिवारिक वार्षिक आय दर्ज करें।",
    TE: "దయచేసి ₹0 నుండి ₹1,00,00,000 మధ్య వార్షిక కుటుంబ ఆదాయాన్ని నమోదు చేయండి.",
    TA: "தயவுசெய்து ₹0 முதல் ₹1,00,00,000 வரை ஆண்டு குடும்ப வருமானத்தை உள்ளிடவும்.",
    KN: "ದಯವಿಟ್ಟು ₹0 ಮತ್ತು ₹1,00,00,000 ನಡುವೆ ವಾರ್ಷಿಕ ಕುಟುಂಬ ಆದಾಯವನ್ನು ನಮೂದಿಸಿ.",
    ML: "ദയവായി ₹0 നും ₹1,00,00,000 നും ഇടയിൽ വാർഷിക വരുമാനം നൽകുക.",
    BN: "অনুগ্রহ করে ₹০ থেকে ₹১,০০,০০,০০০ এর মধ্যে বার্ষিক পারিবারিক আয় লিখুন।",
    MR: "कृपया ₹० ते ₹१,००,००,००० दरम्यान वार्षिक कौटुंबिक उत्पन्न प्रविष्ट करा.",
    GON: "₹0 से ₹1,00,00,000 बीचना सालाना परिवार कमाई लिखा।",
    BHI: "₹0 थी ₹1,00,00,000 वच्चे नी कौटुंबिक वार्षिक आवक लखो।"
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
console.log(`✅ Successfully updated languageStore.js with new keys across all 10 languages!`);
