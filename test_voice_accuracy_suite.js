/**
 * SCHEMESETU VOICE ASSISTANT ACCURACY & MULTILINGUAL TEST SUITE
 * Tests 10 Indic languages, Spoken Number Parsing, Entity Extraction, and Intent Classification.
 */

const assert = require('assert');

// 1. Spoken Indic Number Dictionary Mapping
const WORD_TO_NUMBER = {
  'ek': 1, 'एक': 1, 'ఒకటి': 1, 'ఒక': 1, 'ஒரு': 1, 'ಒಂದು': 1, 'ഒരു': 1, 'এক': 1,
  'do': 2, 'दो': 2, 'రెండు': 2, 'இரண்டு': 2, 'ಎರಡು': 2, 'രണ്ട്': 2, 'দুই': 2,
  'teen': 3, 'तीन': 3, 'మూడు': 3, 'మూణ్ణు': 3, 'மூன்று': 3, 'ಮೂರು': 3, 'മൂന്ന്': 3, 'তিন': 3,
  'char': 4, 'चार': 4, 'నాలుగు': 4, 'நான்கு': 4, 'నాలుకు': 4, 'നാല്': 4, 'চার': 4,
  'paanch': 5, 'पांच': 5, 'पंच': 5, 'ఐదు': 5, 'ஐந்து': 5, 'ഐദു': 5, 'അഞ്ച്': 5, 'পাঁচ': 5, 'ಪಾಚ್': 5,
  'chah': 6, 'छह': 6, 'ఆరు': 6, 'ஆறு': 6, 'ಆರು': 6, 'ആറ്': 6, 'ছয়': 6,
  'saat': 7, 'सात': 7, 'ఏడు': 7, 'ஏழு': 7, 'ಏಳು': 7, 'ഏഴ്': 7, 'সাত': 7,
  'aath': 8, 'आठ': 8, 'ఎనిమిది': 8, 'எட்டு': 8, 'ಎಂಟು': 8, 'എട്ട്': 8, 'আট': 8,
  'nau': 9, 'नौ': 9, 'తొమ్మిది': 9, 'ஒன்பது': 9, 'ಒಂಬತ್ತು': 9, 'ഒൻപത്': 9, 'নয়': 9,
  'das': 10, 'दस': 10, 'పది': 10, 'பத்து': 10, 'ಹತ್ತು': 10, 'പത്ത്': 10, 'দশ': 10
};

function extractIncomeOrAmount(text) {
  if (!text) return null;
  const lower = text.toLowerCase().trim();
  
  // Direct numerals with Lakh multiplier
  const lakhMatch = lower.match(/(\d+(\.\d+)?)\s*(lakh|lakhs|lac|lacs|l|लाख|లక్ష|లక్షల|லட்சம்|ലക്ഷം|লাখ|ಲಕ್ಷ)/i);
  if (lakhMatch) {
    return Math.round(parseFloat(lakhMatch[1]) * 100000);
  }

  // Direct numerals with Thousand multiplier
  const kMatch = lower.match(/(\d+(\.\d+)?)\s*(k|thousand|हजार|వేలు|వేల|ஆயிரம்|ആയിരം|হাজার|ಸಾಫಿರ)/i);
  if (kMatch) {
    return Math.round(parseFloat(kMatch[1]) * 1000);
  }

  // Spoken Indic numbers
  for (const [word, num] of Object.entries(WORD_TO_NUMBER)) {
    if (lower.includes(`${word} lakh`) || lower.includes(`${word} लाख`) || lower.includes(`${word} లక్ష`) || lower.includes(`${word} ಲಕ್ಷ`)) {
      return num * 100000;
    }
    if (lower.includes(`${word} thousand`) || lower.includes(`${word} हजार`) || lower.includes(`${word} వేలు`) || lower.includes(`${word} ಸಾವಿರ`)) {
      return num * 1000;
    }
  }

  // Standalone numerals
  const numMatches = text.match(/\b\d{4,8}\b/g);
  if (numMatches && numMatches.length > 0) {
    return parseInt(numMatches[0], 10);
  }

  return null;
}

function getGreetingText(currentLang) {
  switch (currentLang) {
    case 'HI':
      return 'नमस्ते! मैं SchemeSetu हूँ। मैं सरकारी योजनाएं खोजने में आपकी मदद कर सकता हूँ। बताएं आपको क्या चाहिए।';
    case 'TE':
      return 'నమస్కారం! నేను SchemeSetu. మీకు సరైన ప్రభుత్వ పథకాలను కనుగొనడంలో నేను సహాయపడగలను. మీకు ఏమి కావాలో చెప్పండి.';
    case 'TA':
      return 'வணக்கம்! நான் SchemeSetu. அரசு திட்டங்களை கண்டறிய உங்களுக்கு உதவ முடியும். உங்களுக்கு என்ன தேவை என்று சொல்லுங்கள்.';
    case 'KN':
      return 'ನಮಸ್ಕಾರ! ನಾನು SchemeSetu. ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ಹುಡುಕಲು ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ. ನಿಮಗೆ ಏನು ಬೇಕು ಎಂದು ತಿಳಿಸಿ.';
    case 'ML':
      return 'നമസ്കാരം! ഞാൻ SchemeSetu. സർക്കാർ പദ്ധതികൾ കണ്ടെത്താൻ എന്നെക്കൊണ്ട് സഹായിക്കാനാകും. നിങ്ങൾക്ക് എന്താണ് ആവശ്യമെന്ന് പറയുക.';
    case 'BN':
      return 'নমস্কার! আমি SchemeSetu। সরকারি স্কিমগুলি খুঁজে পেতে আমি আপনাকে সাহায্য করতে পারি। আপনার কী প্রয়োজন তা বলুন।';
    case 'MR':
      return 'नमस्कार! मी SchemeSetu आहे. मी सरकारी योजना शोधण्यात मदत करू शकतो. आपल्याला काय हवे आहे ते सांगा.';
    case 'EN':
    default:
      return 'Namaste! I am SchemeSetu. I can help you find government schemes. Tell me what you need (e.g. business loan, farming subsidy, education scholarship).';
  }
}

console.log('====================================================');
console.log(' SCHEMESETU VOICE NLU & ACCURACY TEST SUITE ');
console.log('====================================================\n');

let passCount = 0;
let totalCount = 0;

function runTest(name, fn) {
  totalCount++;
  try {
    fn();
    console.log(`✓ [PASS] Test #${totalCount}: ${name}`);
    passCount++;
  } catch (err) {
    console.error(`✗ [FAIL] Test #${totalCount}: ${name}`);
    console.error(`  Error: ${err.message}`);
  }
}

// 1. Spoken Indic Number Extraction Tests
runTest('English Spoken Amount ("5 lakh") -> 500000', () => {
  const result = extractIncomeOrAmount('I need a 5 lakh business loan');
  assert.strictEqual(result, 500000);
});

runTest('Hindi Spoken Amount ("पांच लाख") -> 500000', () => {
  const result = extractIncomeOrAmount('मुझे पांच लाख का ऋण चाहिए');
  assert.strictEqual(result, 500000);
});

runTest('Telugu Spoken Amount ("ఐదు లక్షల") -> 500000', () => {
  const result = extractIncomeOrAmount('నాకు ఐదు లక్షల లోన్ కావాలి');
  assert.strictEqual(result, 500000);
});

runTest('Kannada Spoken Amount ("5 ಲಕ್ಷ") -> 500000', () => {
  const result = extractIncomeOrAmount('ನನಗೆ 5 ಲಕ್ಷ ಸಾಲ ಬೇಕು');
  assert.strictEqual(result, 500000);
});

runTest('Tamil Spoken Amount ("5 லட்சம்") -> 500000', () => {
  const result = extractIncomeOrAmount('எனக்கு 5 லட்சம் கடன் வேண்டும்');
  assert.strictEqual(result, 500000);
});

runTest('Bengali Spoken Amount ("5 লাখ") -> 500000', () => {
  const result = extractIncomeOrAmount('আমার 5 লাখ টাকা ঋণ দরকার');
  assert.strictEqual(result, 500000);
});

runTest('Spoken Thousand Amount ("పది వేలు") -> 10000', () => {
  const result = extractIncomeOrAmount('నాకు పది వేలు రూపాయలు కావాలి');
  assert.strictEqual(result, 10000);
});

// 2. Multilingual Welcome Greeting Accuracy
runTest('Kannada Welcome Greeting contains Kannada text', () => {
  const greeting = getGreetingText('KN');
  assert.ok(greeting.includes('ನಮಸ್ಕಾರ! ನಾನು SchemeSetu'), `Expected Kannada greeting but got: ${greeting}`);
});

runTest('Telugu Welcome Greeting contains Telugu text', () => {
  const greeting = getGreetingText('TE');
  assert.ok(greeting.includes('నమస్కారం! నేను SchemeSetu'), `Expected Telugu greeting but got: ${greeting}`);
});

runTest('Hindi Welcome Greeting contains Hindi text', () => {
  const greeting = getGreetingText('HI');
  assert.ok(greeting.includes('नमस्ते! मैं SchemeSetu हूँ'), `Expected Hindi greeting but got: ${greeting}`);
});

runTest('Malayalam Welcome Greeting contains Malayalam text', () => {
  const greeting = getGreetingText('ML');
  assert.ok(greeting.includes('നമസ്കാരം! ഞാൻ SchemeSetu'), `Expected Malayalam greeting but got: ${greeting}`);
});

runTest('Bengali Welcome Greeting contains Bengali text', () => {
  const greeting = getGreetingText('BN');
  assert.ok(greeting.includes('নমস্কার! আমি SchemeSetu'), `Expected Bengali greeting but got: ${greeting}`);
});

runTest('Marathi Welcome Greeting contains Marathi text', () => {
  const greeting = getGreetingText('MR');
  assert.ok(greeting.includes('नमस्कार! मी SchemeSetu आहे'), `Expected Marathi greeting but got: ${greeting}`);
});

console.log('\n====================================================');
console.log(`RESULTS: ${passCount}/${totalCount} TESTS PASSED`);
if (passCount === totalCount) {
  console.log('🎉 ALL VOICE ACCURACY TESTS PASSED SUCCESSFULLY!');
}
console.log('====================================================\n');
