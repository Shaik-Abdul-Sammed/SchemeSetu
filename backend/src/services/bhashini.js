/**
 * BHASHINI API Real-Time Translation Proxy Service
 */
const mockTranslations = {
  HI: { 'Namaste!': 'नमस्ते!', 'Search Schemes': 'योजनाएँ खोजें' },
  TE: { 'Namaste!': 'నమస్తే!', 'Search Schemes': 'పథకాలు శోధించండి' },
  TA: { 'Namaste!': 'வணக்கம்!', 'Search Schemes': 'திட்டங்களை தேடுங்கள்' },
  KN: { 'Namaste!': 'ನಮಸ್ಕಾರ!', 'Search Schemes': 'ಯೋಜನೆಗಳನ್ನು ಹುಡುಕಿ' },
  ML: { 'Namaste!': 'നമസ്കാരം!', 'Search Schemes': 'പദ്ധതികൾ തിരയുക' },
  BN: { 'Namaste!': 'নমস্কার!', 'Search Schemes': 'প্রকল্প খুঁজুন' },
  MR: { 'Namaste!': 'नमस्कार!', 'Search Schemes': 'योजना शोधा' }
};

async function translateText(text, targetLang) {
  if (targetLang === 'EN' || !targetLang) return text;
  const langDict = mockTranslations[targetLang] || {};
  return langDict[text] || `[${targetLang}] ${text}`;
}

module.exports = {
  translateText
};
