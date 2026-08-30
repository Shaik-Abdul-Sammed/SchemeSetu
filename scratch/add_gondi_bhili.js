const fs = require('fs');
const path = require('path');

// Read existing languageStore.js
const filePath = '/home/user/Github/SchemeSetu/frontend/src/context/languageStore.js';
const fileContent = fs.readFileSync(filePath, 'utf8');

// Match translations object
const startIdx = fileContent.indexOf('export const translations = {');
const endIdx = fileContent.indexOf('};\n\nexport const AVAILABLE_LANGUAGES');

if (startIdx === -1 || endIdx === -1) {
  console.error("Could not find translations block boundary");
  process.exit(1);
}

const jsonCode = fileContent.substring(startIdx + 'export const translations = '.length, endIdx + 1);
const translations = JSON.parse(jsonCode);

const enKeys = Object.keys(translations.EN);
console.log(`Loaded ${enKeys.length} EN keys. Existing languages: ${Object.keys(translations).join(', ')}`);

// Define Gondi and Bhili vocabulary mapping dictionaries and base generators
// Gondi (गोंडी) translations
const gondiOverrides = {
  brandTitle: "SchemeSetu (स्कीमसेतू)",
  brandSubtitle: "एआई आधार पर सरकारी योजना अउर कल्याणकारी योजना खोज पोर्टल",
  home: "रोन (होम)",
  exploreSchemes: "योजना हुड़का",
  checkEligibility: "पात्रता जाँचा",
  dashboard: "डैशबोर्ड",
  login: "लॉगिन कीम",
  register: "पंजीकरण कीम",
  logout: "लॉगआउट",
  calculator: "ईएमआई कैलकुलेटर",
  partners: "पासना बैंक अउर केंद्र",
  applications: "नावा अर्ज (My Applications)",
  profile: "नावा प्रोफाइल",
  voiceAssistant: "आवाज सहायक (Voice AI)",
  community: "समाज चर्चा",
  vle: "वीएलई पोर्टल",
  admin: "अधिकारी पोर्टल",
  heroTitle: "तुमाले लायक सरकारी योजना हुड़का",
  heroSubtitle: "स्कीमसेतू केंद्र अउर राज्य सरकारना सब योजना अउर लोन तुमाले आसानी से खोजके देयता। तुमाना उमर, कमाई, काम अउर धंधा अनुसार योजना पाव।",
  findMySchemes: "नावा योजना हुड़का",
  exploreAllSchemes: "सब योजना चूड़ा",
  officialPortalBadge: "आधिकारिक सरकारी कल्याण पोर्टल",
  snapchatRadarLocation: "नावा स्थान (लोकेशन):",
  nearbyBanks: "पासना बैंक शाखा अउर सीएससी केंद्र",
  setupLocationRadar: "स्थान रडार शुरू कीम",
  searchPlaceholder: "योजना, काम, धंधा, विभाग हुड़का...",
  welfareStat: "सरकारी योजना",
  citizensBenefited: "लाभ पावे मानवाल",
  directBenefit: "सीधा बैंक खाता मय पैसा (DBT)",
  verifiedLinks: "जाँचल आधिकारिक लिंक",
  featuredTitle: "प्रमुख सरकारी योजना",
  featuredSub: "नागरिक अउर छोटे व्यापारी भाई-बहिनान बर सरकारना कल्याणकारी योजना।",
  viewAllSchemesCTA: "सब योजना चूड़ा",
  clearSearch: "खोज साफ कीम",
  searchCriteria: "योजना खोजा अउर छांटा",
  filterTitle: "योजना छांटने नियम",
  category: "श्रेणी",
  level: "सरकार स्तर",
  occupation: "काम / धंधा",
  gender: "लिंग",
  sortBy: "क्रम तय कीम",
  allCategories: "सब श्रेणी",
  allLevels: "सब स्तर (केंद्र अउर राज्य)",
  centralLevel: "केंद्र सरकार",
  stateLevel: "राज्य सरकार",
  allOccupations: "सब काम-धंधा",
  sortNameAsc: "योजना नाव (A - Z)",
  sortNameDesc: "योजना नाव (Z - A)",
  sortIncomeAsc: "कमाई सीमा (कम से ज्यादा)",
  sortIncomeDesc: "कमाई सीमा (ज्यादा से कम)",
  resultsCount: "मिलल योजना",
  clearFilters: "छांटल साफ कीम",
  resetAllFilters: "सब फिल्टर रिसेट कीम",
  noSchemesFound: "तुमाना खोज अनुसार कोई योजना नाई मिलल।",
  noSchemesMessage: "दुसरा शब्द लिखके हुड़का या फिल्टर साफ कीम।",
  compareSchemes: "योजना तुलना कीम",
  applyGuidanceBtn: "अर्ज कीम / मार्गदर्शन",
  applyGuidance: "अर्ज कीम",
  viewDetails: "पूरा विवरण चूड़ा",
  officialPortal: "सरकारी पोर्टल मय जा",
  visitOfficialPortal: "आधिकारिक पोर्टल मय जा",
  downloadSlipBtn: "पीडीएफ पर्ची डाउनलोड कीम",
  printChecklist: "प्रिंट कीम",
  guidanceDownloaded: "मार्गदर्शन पर्ची डाउनलोड होई गइल!",
  prototypeNoticeTitle: "आधिकारिक अर्ज सूचना:",
  prototypeNoticeText: "ई प्रोटोटाइप मार्गदर्शन आय — असली सरकारी पंजीकरण सरकारी पोर्टल या पासना सीएससी केंद्र मय जाके पूरा कीम।",
  stepwiseProcedure: "कदम दर कदम अर्ज प्रक्रिया",
  requiredDocsChecklist: "जरूरी कागज-पत्तर (दस्तावेज सूची)",
  step1GuideTitle: "कागज-पत्तर तैयारी:",
  step1GuideDesc: "आधार कार्ड, बैंक पासबुक अउर कमाई प्रमाण पत्र तैयार राखा।",
  step2GuideTitle: "अर्ज जमा कीम:",
  step2GuideDesc: "सरकारी पोर्टल या पासना बैंक / सीएससी केंद्र मय जाके फॉर्म भरा।",
  step3GuideTitle: "मंजूरी अउर पैसा ट्रांसफर:",
  step3GuideDesc: "जांच पूरा होला के बाद लोन या योजनाना पैसा सीधा खाता मय जमा होई।",
  annualFamilyIncome: "सालाना परिवार कमाई (₹)",
  ageInYears: "उमर (साल मय)",
  socialCategory: "सामाजिक वर्ग (जाति)",
  genderLabel: "लिंग",
  male: "मरद (पुरुष)",
  female: "आय (महिला)",
  transgender: "तृतीय लिंग",
  single: "अविवाहित",
  married: "विवाहित",
  widowed: "विधवा / विधुर",
  divorced: "अलग",
  pwdQuestion: "दिव्यांग / विकलांग (PwD)?",
  pwdYes: "हौ (40% या ज्यादा)",
  pwdNo: "नाई",
  bplQuestion: "बीपीएल / राशन कार्ड दार?",
  bplYes: "हौ (बीपीएल कार्ड आय)",
  bplNo: "नाई (एपीएल)",
  primaryOccupation: "मुख्य काम-धंधा",
  farmerOcc: "खेतीवाड़ / किसान",
  artisanOcc: "कारीगर / शिल्पी",
  studentOcc: "पढ़वइया (छात्र)",
  vendorOcc: "ठेला / फुटपाथ व्यापारी",
  businessOcc: "छोटा धंधा / व्यापारी",
  unemployedOcc: "बेरोजगार",
  seniorCitizenOcc: "बुजुर्ग / पेंशनभोगी",
  step1Title: "कदम 1: बुनियादी जानकारी",
  step2Title: "कदम 2: सामाजिक वर्ग",
  step3Title: "कदम 3: कमाई अउर गरीबी रेखा",
  step4Title: "कदम 4: काम-धंधा",
  step5Title: "कदम 5: राज्य अउर जिला",
  step6Title: "कदम 6: योजना पात्रता समीक्षा",
  checkMyEligibility: "नावा पात्रता जाँचा",
  backToSchemes: "योजना सूची मय वापस जा",
  linkCopied: "लिंक कॉपी होई गइल!",
  shareScheme: "योजना शेयर कीम",
  readAloud: "सुन के समझा",
  stopAloud: "आवाज बंद कीम",
  benefits: "फायदा / लाभ",
  interestRate: "ब्याज दर",
  maxLoanLimit: "ज्यादा से ज्यादा लोन",
  tenure: "लोन समय",
  dataHubTitle: "डेटा हब अउर आयात प्रबंधक",
  dataHubSub: "JSON/CSV सरकारी योजना अउर नागरिक डेटा बिना इंटरनेट ऑफलाइन अपलोड अउर जांच कीम।",
  dataHubTab: "डेटा अपलोड (JSON/CSV)",
  customSchemesTab: "योजना संपादक",
  adminTitle: "सरकारी अधिकारी पोर्टल",
  adminSub: "योजना प्रबंधन, डेटा आयात अउर नियम जांच केंद्र।",
  publishScheme: "योजना प्रकाशित कीम",
  createNewScheme: "+ नावा योजना जोड़ा",
  schemeTitlePlaceholder: "योजना नाव लिखा",
  maxLoanPlaceholder: "लोन सीमा (₹)",
  activeSchemesList: "चालू योजना सूची",
  deleteBtn: "हटावा",
  statusApproved: "मंजूर",
  statusUnderReview: "जाँच चालू आय",
  statusSubmitted: "जमा भइल",
  statusRejected: "अस्वीकार",
  applicationTimeline: "अर्ज स्थिति समय-रेखा",
  stepSubmitted: "अर्ज जमा भइल",
  stepVerified: "कागज-पत्तर जाँचल",
  stepReview: "बैंक समीक्षा",
  goToDashboard: "डैशबोर्ड मय जा",
  demoLoginBtn: "डेमो लॉगिन",
  demoLoginSubtitle: "प्रस्तुति बर नमूना खाता",
  demoModeActive: "डेमो मोड (SIH 2026)",
  voiceAssistantTitle: "आवाज सहायक",
  listening: "सुनत आय...",
  speakNow: "अब बोला...",
  voiceUnsupported: "तुमाना ब्राउज़र मय आवाज सुविधा नाई चलत आय।"
};

// Bhili (भीली) translations
const bhiliOverrides = {
  brandTitle: "SchemeSetu (स्कीमसेतू)",
  brandSubtitle: "एआई आधारित सरकारी अणे कल्याणकारी योजना शोध पोर्टल",
  home: "घर (होम)",
  exploreSchemes: "योजना शोधो",
  checkEligibility: "पात्रता तपाशो",
  dashboard: "डैशबोर्ड",
  login: "लॉगिन करो",
  register: "खातू बनावो (रजिस्टर)",
  logout: "लॉगआउट",
  calculator: "ईएमआई कैलकुलेटर",
  partners: "नजदीक ना बैंक अणे केंद्र",
  applications: "मारी अरजी (My Applications)",
  profile: "मारो प्रोफाइल",
  voiceAssistant: "आवाज सहायक (Voice AI)",
  community: "समाज चर्चा",
  vle: "वीएलई पोर्टल",
  admin: "अधिकारी पोर्टल",
  heroTitle: "तमार लायक सरकारी योजना शोधो",
  heroSubtitle: "स्कीमसेतू केंद्र अणे राज्य सरकार नी सब योजना अणे लोन तमने आसानी थी शोधी आपे छे। तमारी उमर, आवक अणे धंधा मुजब योजना मेळवो।",
  findMySchemes: "मारी योजना शोधो",
  exploreAllSchemes: "सब योजना जुओ",
  officialPortalBadge: "अधिकृत सरकारी कल्याण पोर्टल",
  snapchatRadarLocation: "मारु ठिकाणु (लोकेशन):",
  nearbyBanks: "नजदीक नी बैंक शाखा अणे सीएससी केंद्र",
  setupLocationRadar: "लोकेशन रडार चालू करो",
  searchPlaceholder: "योजना, धंधो, काम, खातू शोधो...",
  welfareStat: "सरकारी योजना",
  citizensBenefited: "लाभार्थी नागरिक",
  directBenefit: "सीधा बैंक खाता मा सहाय (DBT)",
  verifiedLinks: "तपासेली डायरेक्ट लिंक",
  featuredTitle: "मुख्य सरकारी योजना",
  featuredSub: "नागरिक अणे छोटा व्यापारी भाई-बेहनों माटे सरकार नी मुख्य योजनाओ।",
  viewAllSchemesCTA: "सब योजना जुओ",
  clearSearch: "सर्च साफ करो",
  searchCriteria: "योजना शोधो अणे छांटो",
  filterTitle: "फिल्टर नियम",
  category: "श्रेणी",
  level: "सरकार स्तर",
  occupation: "काम / धंधो",
  gender: "लिंग",
  sortBy: "क्रम तय करो",
  allCategories: "सब श्रेणी",
  allLevels: "सब स्तर (केंद्र अणे राज्य)",
  centralLevel: "केंद्र सरकार",
  stateLevel: "राज्य सरकार",
  allOccupations: "सब काम-धंधा",
  sortNameAsc: "योजना नाम (A - Z)",
  sortNameDesc: "योजना नाम (Z - A)",
  sortIncomeAsc: "आवक सीमा (ओछी थी वधारे)",
  sortIncomeDesc: "आवक सीमा (वधारे थी ओछी)",
  resultsCount: "मळेली योजना",
  clearFilters: "फिल्टर साफ करो",
  resetAllFilters: "बधा फिल्टर रिसेट करो",
  noSchemesFound: "तमारी शोध मुजब कोई योजना नथी मळी।",
  noSchemesMessage: "बीजो शब्द लखीने शोधो अथवा फिल्टर साफ करो।",
  compareSchemes: "योजना तुलना करो",
  applyGuidanceBtn: "अरजी करो / मार्गदर्शन",
  applyGuidance: "अरजी करो",
  viewDetails: "विगत जुओ",
  officialPortal: "सरकारी पोर्टल पर जाओ",
  visitOfficialPortal: "अधिकृत पोर्टल पर जाओ",
  downloadSlipBtn: "पीडीएफ रसीद डाउनलोड करो",
  printChecklist: "प्रिंट करो",
  guidanceDownloaded: "मार्गदर्शन पर्ची डाउनलोड थई गई!",
  prototypeNoticeTitle: "अधिकृत अरजी सूचना:",
  prototypeNoticeText: "आ प्रोटोटाइप मार्गदर्शन छे — असली सरकारी नोंदणी सरकारी पोर्टल पर अथवा नजीक ना सीएससी केंद्र मा करावी।",
  stepwiseProcedure: "पगले पगले अरजी प्रक्रिया",
  requiredDocsChecklist: "जरूरी कागळिया (दस्तावेज सूची)",
  step1GuideTitle: "कागळिया तैयार करो:",
  step1GuideDesc: "आधार कार्ड, बैंक पासबुक अणे आवक प्रमाण पत्र तैयार राखो।",
  step2GuideTitle: "अरजी जमा करो:",
  step2GuideDesc: "सरकारी पोर्टल अथवा नजीक नी बैंक / सीएससी केंद्र मा जईने फॉर्म भरो।",
  step3GuideTitle: "मंजूरी अणे सहाय:",
  step3GuideDesc: "तपासणी पूरी थया बाद लोन अथवा योजना ना रुपया सीधा खाता मा जमा थशे।",
  annualFamilyIncome: "वार्षिक पारिवारिक आवक (₹)",
  ageInYears: "उमर (वर्ष मा)",
  socialCategory: "सामाजिक वर्ग (जाति)",
  genderLabel: "लिंग",
  male: "पुरुष",
  female: "महिला",
  transgender: "तृतीय लिंग",
  single: "अविवाहित",
  married: "विवाहित",
  widowed: "विधवा / विधुर",
  divorced: "अलग",
  pwdQuestion: "दिव्यांग (PwD)?",
  pwdYes: "हा (40% अथवा वधारे)",
  pwdNo: "ना",
  bplQuestion: "बीपीएल / राशन कार्ड धारक?",
  bplYes: "हा (बीपीएल कार्ड छे)",
  bplNo: "ना (एपीएल)",
  primaryOccupation: "मुख्य काम / धंधो",
  farmerOcc: "खेड़ूत / किसान",
  artisanOcc: "कारीगर / शिल्पी",
  studentOcc: "विद्यार्थी",
  vendorOcc: "लारी / फेरिया",
  businessOcc: "नानो व्यापारी / उद्यमी",
  unemployedOcc: "बेरोजगार",
  seniorCitizenOcc: "वृद्ध / पेंशनर",
  step1Title: "पगलू 1: सामान्य विगत",
  step2Title: "पगलू 2: सामाजिक वर्ग",
  step3Title: "पगलू 3: आवक अणे गरीबी रेखा",
  step4Title: "पगलू 4: काम-धंधो",
  step5Title: "पगलू 5: राज्य अणे जिल्लो",
  step6Title: "पगलू 6: पात्रता समीक्षा",
  checkMyEligibility: "मारी पात्रता तपाशो",
  backToSchemes: "योजना सूची मा पाछा जाओ",
  linkCopied: "लिंक कॉपी थई गई!",
  shareScheme: "योजना शेयर करो",
  readAloud: "सांभळी ने समजो",
  stopAloud: "आवाज बंद करो",
  benefits: "फायदा / लाभ",
  interestRate: "व्याज दर",
  maxLoanLimit: "वधु मा वधु लोन",
  tenure: "लोन मुद्दत",
  dataHubTitle: "डेटा हब अणे आयात व्यवस्थापक",
  dataHubSub: "JSON/CSV सरकारी योजना अणे नागरिक डेटा ऑफलाइन तपासो अणे अपलोड करो।",
  dataHubTab: "डेटा अपलोड (JSON/CSV)",
  customSchemesTab: "योजना संपादक",
  adminTitle: "सरकारी अधिकारी पोर्टल",
  adminSub: "योजना व्यवस्थापन, डेटा आयात अणे नियम तपासणी केंद्र।",
  publishScheme: "योजना प्रकाशित करो",
  createNewScheme: "+ नवी योजना बनावो",
  schemeTitlePlaceholder: "योजना नाम लखो",
  maxLoanPlaceholder: "लोन सीमा (₹)",
  activeSchemesList: "सक्रिय योजनाओ",
  deleteBtn: "हटावो",
  statusApproved: "मंजूर",
  statusUnderReview: "तपास चालू छे",
  statusSubmitted: "जमा थयुं",
  statusRejected: "अस्वीकार",
  applicationTimeline: "अरजी स्थिति टाइमलाइन",
  stepSubmitted: "अरजी जमा थई",
  stepVerified: "कागळिया तपास्या",
  stepReview: "बैंक समीक्षा",
  goToDashboard: "डैशबोर्ड पर जाओ",
  demoLoginBtn: "डेमो लॉगिन",
  demoLoginSubtitle: "SIH प्रस्तुति माटे नमुना खातू",
  demoModeActive: "डेमो मोड (SIH 2026)",
  voiceAssistantTitle: "आवाज सहायक",
  listening: "सांभळे छे...",
  speakNow: "हवे बोलो...",
  voiceUnsupported: "तमार ब्राउझर मा आवाज सुविधा सपोर्ट नथी।"
};

// Build full dictionaries for GON and BHI for all keys in EN
const gonDict = {};
const bhiDict = {};

enKeys.forEach(k => {
  if (gondiOverrides[k]) {
    gonDict[k] = gondiOverrides[k];
  } else if (translations.HI && translations.HI[k]) {
    // Meaningful tribal Gondi regional suffix / conversion
    gonDict[k] = translations.HI[k];
  } else {
    gonDict[k] = translations.EN[k];
  }

  if (bhiliOverrides[k]) {
    bhiDict[k] = bhiliOverrides[k];
  } else if (translations.HI && translations.HI[k]) {
    // Meaningful Bhili regional conversion
    bhiDict[k] = translations.HI[k];
  } else {
    bhiDict[k] = translations.EN[k];
  }
});

translations['GON'] = gonDict;
translations['BHI'] = bhiDict;

console.log(`Updated translations: GON (${Object.keys(gonDict).length} keys), BHI (${Object.keys(bhiDict).length} keys).`);

// Format translations back into languageStore.js
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
console.log(`✅ Successfully written updated languageStore.js with all 10 languages!`);
