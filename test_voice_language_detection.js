/**
 * Unit Test Suite for Script-Range Voice Language Detection
 * Validates Unicode range detection for Devanagari, Telugu, Latin, etc.
 */

const assert = require('assert');

// Pure script detector logic mirror (matches frontend/src/hooks/useVoiceLanguageDetection.js)
function detectLanguageFromScript(text) {
  if (!text || typeof text !== 'string') return 'EN';

  let devanagariCount = 0;
  let teluguCount = 0;
  let tamilCount = 0;
  let kannadaCount = 0;
  let malayalamCount = 0;
  let bengaliCount = 0;
  let gujaratiCount = 0;
  let punjabiCount = 0;
  let odiaCount = 0;
  let latinCount = 0;

  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code >= 0x0900 && code <= 0x097F) devanagariCount++;
    else if (code >= 0x0C00 && code <= 0x0C7F) teluguCount++;
    else if (code >= 0x0B80 && code <= 0x0BFF) tamilCount++;
    else if (code >= 0x0C80 && code <= 0x0CFF) kannadaCount++;
    else if (code >= 0x0D00 && code <= 0x0D7F) malayalamCount++;
    else if (code >= 0x0980 && code <= 0x09FF) bengaliCount++;
    else if (code >= 0x0A80 && code <= 0x0AFF) gujaratiCount++;
    else if (code >= 0x0A00 && code <= 0x0A7F) punjabiCount++;
    else if (code >= 0x0B00 && code <= 0x0B7F) odiaCount++;
    else if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) latinCount++;
  }

  const counts = [
    { lang: 'TE', count: teluguCount },
    { lang: 'HI', count: devanagariCount },
    { lang: 'TA', count: tamilCount },
    { lang: 'KN', count: kannadaCount },
    { lang: 'ML', count: malayalamCount },
    { lang: 'BN', count: bengaliCount },
    { lang: 'GU', count: gujaratiCount },
    { lang: 'PA', count: punjabiCount },
    { lang: 'OR', count: odiaCount },
    { lang: 'EN', count: latinCount },
  ];

  counts.sort((a, b) => b.count - a.count);

  if (counts[0].count > 0) {
    return counts[0].lang;
  }

  return 'EN';
}

console.log('=== Running Voice Language Detection Unit Tests ===\n');

// 1. Devanagari (Hindi)
const hindiText = 'नमस्ते मुझे नया बिजनेस शुरू करने के लिए लोन चाहिए';
const hindiResult = detectLanguageFromScript(hindiText);
assert.strictEqual(hindiResult, 'HI', `Expected HI for Devanagari text, got ${hindiResult}`);
console.log('✅ Test 1: Devanagari detection -> HI (Passed)');

// 2. Telugu
const teluguText = 'నమస్కారం నాకు వ్యవసాయ రుణం మరియు సబ్సిడీ వివరాలు కావాలి';
const teluguResult = detectLanguageFromScript(teluguText);
assert.strictEqual(teluguResult, 'TE', `Expected TE for Telugu text, got ${teluguResult}`);
console.log('✅ Test 2: Telugu script detection -> TE (Passed)');

// 3. Latin (English)
const englishText = 'I need a concessional microloan for my dairy enterprise';
const englishResult = detectLanguageFromScript(englishText);
assert.strictEqual(englishResult, 'EN', `Expected EN for Latin text, got ${englishResult}`);
console.log('✅ Test 3: Latin script detection -> EN (Passed)');

// 4. Tamil
const tamilText = 'வணக்கம் எனக்கு வணிக கடன் தேவைப்படுகிறது';
const tamilResult = detectLanguageFromScript(tamilText);
assert.strictEqual(tamilResult, 'TA', `Expected TA for Tamil text, got ${tamilResult}`);
console.log('✅ Test 4: Tamil script detection -> TA (Passed)');

// 5. Kannada
const kannadaText = 'ನಮಸ್ಕಾರ ನನಗೆ ವ್ಯಾಪಾರ ಸಾಲ ಬೇಕು';
const kannadaResult = detectLanguageFromScript(kannadaText);
assert.strictEqual(kannadaResult, 'KN', `Expected KN for Kannada text, got ${kannadaResult}`);
console.log('✅ Test 5: Kannada script detection -> KN (Passed)');

// 6. Bengali
const bengaliText = 'নমস্কার আমি নতুন ব্যবসার জন্য ঋণ নিতে চাই';
const bengaliResult = detectLanguageFromScript(bengaliText);
assert.strictEqual(bengaliResult, 'BN', `Expected BN for Bengali text, got ${bengaliResult}`);
console.log('✅ Test 6: Bengali script detection -> BN (Passed)');

// 7. Edge cases
assert.strictEqual(detectLanguageFromScript(''), 'EN', 'Expected default EN for empty string');
assert.strictEqual(detectLanguageFromScript('1234567890'), 'EN', 'Expected default EN for numbers');
assert.strictEqual(detectLanguageFromScript(null), 'EN', 'Expected default EN for null');
console.log('✅ Test 7: Edge cases (empty, numeric, null) -> EN (Passed)');

console.log('\n🎉 ALL 7 VOICE LANGUAGE DETECTION TESTS PASSED!\n');
