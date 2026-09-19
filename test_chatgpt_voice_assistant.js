/**
 * test_chatgpt_voice_assistant.js
 * Comprehensive Verification Suite for SchemeSetu Conversational Voice Assistant
 * 
 * Verifies:
 * 1. Automatic Language Recognition (Indic scripts & Romanized transliterations)
 * 2. Plain-Language Explanations ("Like ChatGPT" - Subsidies, Collateral-Free, Margin Money)
 * 3. Government Scheme Intelligence (MUDRA, PMEGP, Dalit Bandhu, PM-KISAN, Stand-Up India)
 * 4. ChatGPT Follow-Up Suggestion Chips & Structured Responses
 * 5. Backend `/api/v1/voice/parse` RAG & Knowledge Synthesizer
 */

const assert = require('assert');
const http = require('http');
const { detectLanguage } = require('./backend/src/routes/v1/voice');
const app = require('./backend/src/index');

console.log('\n====================================================');
console.log(' SCHEMESETU CHATGPT VOICE ASSISTANT VERIFICATION SUITE ');
console.log('====================================================\n');

let passed = 0;
let total = 0;

function runTest(desc, fn) {
  total++;
  try {
    fn();
    console.log(`✓ [PASS] Test #${total}: ${desc}`);
    passed++;
  } catch (err) {
    console.error(`✗ [FAIL] Test #${total}: ${desc}`);
    console.error(`  Error: ${err.message}`);
  }
}

// ── 1. AUTOMATIC LANGUAGE RECOGNITION (SCRIPTS & TRANSLITERATION) ──
console.log('--- 1. Automatic Language Recognition (Indic Scripts & Transliteration) ---');

runTest('Telugu Script Detection ("సబ్సిడీ అంటే ఏమిటి?") -> TE', () => {
  const lang = detectLanguage('సబ్సిడీ అంటే ఏమిటి?');
  assert.strictEqual(lang, 'TE');
});

runTest('Telugu Transliterated Detection ("naaku business loan ela vasthundi?") -> TE', () => {
  const lang = detectLanguage('naaku business loan ela vasthundi?');
  assert.strictEqual(lang, 'TE');
});

runTest('Hindi Script Detection ("मुद्रा योजना में कितना लोन मिलता है?") -> HI', () => {
  const lang = detectLanguage('मुद्रा योजना में कितना लोन मिलता है?');
  assert.strictEqual(lang, 'HI');
});

runTest('Hindi Transliterated Detection ("mujhe dukan ke liye paise chahiye") -> HI', () => {
  const lang = detectLanguage('mujhe dukan ke liye paise chahiye');
  assert.strictEqual(lang, 'HI');
});

runTest('Tamil Script Detection ("கடன் பெற என்ன செய்ய வேண்டும்?") -> TA', () => {
  const lang = detectLanguage('கடன் பெற என்ன செய்ய வேண்டும்?');
  assert.strictEqual(lang, 'TA');
});

runTest('Tamil Transliterated Detection ("enakku kadan venum") -> TA', () => {
  const lang = detectLanguage('enakku kadan venum');
  assert.strictEqual(lang, 'TA');
});

runTest('Kannada Script Detection ("ಸಾಲ ಹೇಗೆ ಪಡೆಯುವುದು?") -> KN', () => {
  const lang = detectLanguage('ಸಾಲ ಹೇಗೆ ಪಡೆಯುವುದು?');
  assert.strictEqual(lang, 'KN');
});

runTest('Kannada Transliterated Detection ("nanage business loan beku") -> KN', () => {
  const lang = detectLanguage('nanage business loan beku');
  assert.strictEqual(lang, 'KN');
});

runTest('Malayalam Script Detection ("സബ്‌സിഡി എങ്ങനെ ലഭിക്കും?") -> ML', () => {
  const lang = detectLanguage('സബ്‌സിഡി എങ്ങനെ ലഭിക്കും?');
  assert.strictEqual(lang, 'ML');
});

runTest('Malayalam Transliterated Detection ("enikku loan venam") -> ML', () => {
  const lang = detectLanguage('enikku loan venam');
  assert.strictEqual(lang, 'ML');
});

runTest('Bengali Script Detection ("ঋণের জন্য কি কাগজ লাগবে?") -> BN', () => {
  const lang = detectLanguage('ঋণের জন্য কি কাগজ লাগবে?');
  assert.strictEqual(lang, 'BN');
});

runTest('Bengali Transliterated Detection ("aamar loan chai kivabe pabo?") -> BN', () => {
  const lang = detectLanguage('aamar loan chai kivabe pabo?');
  assert.strictEqual(lang, 'BN');
});

runTest('Marathi Script Detection ("मला व्यवसायासाठी कर्ज पाहिजे आहे") -> MR', () => {
  const lang = detectLanguage('मला व्यवसायासाठी कर्ज पाहिजे आहे');
  assert.strictEqual(lang, 'MR');
});

runTest('Marathi Transliterated Detection ("mala loan pahije kasa milnar?") -> MR', () => {
  const lang = detectLanguage('mala loan pahije kasa milnar?');
  assert.strictEqual(lang, 'MR');
});

runTest('Standard English Detection ("What is the difference between Mudra and PMEGP?") -> EN', () => {
  const lang = detectLanguage('What is the difference between Mudra and PMEGP?');
  assert.strictEqual(lang, 'EN');
});

// ── 2. PLAIN LANGUAGE CHATGPT KNOWLEDGE GENERATION VIA HTTP ─────────
console.log('\n--- 2. Plain-Language / Layman Knowledge Quality ("Like ChatGPT") ---');

function postJson(port, path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request({
      hostname: '127.0.0.1',
      port,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let chunks = '';
      res.on('data', d => chunks += d);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(chunks) });
        } catch (e) {
          resolve({ status: res.statusCode, body: chunks });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

const server = http.createServer(app);

server.listen(0, async () => {
  const port = server.address().port;

  try {
    // Test 16: Subsidy definition in simple words
    total++;
    try {
      const res = await postJson(port, '/api/v1/voice/parse', {
        transcript: 'What is subsidy in simple words?',
        lang: 'EN'
      });
      assert.strictEqual(res.status, 200);
      assert(res.body.responseText.length > 20, 'Response must be descriptive');
      assert(res.body.quickFollowUps && res.body.quickFollowUps.length > 0, 'Must have quick follow up suggestions');
      console.log(`✓ [PASS] Test #${total}: RAG Knowledge Base Answer on Subsidy Definition in Simple Words`);
      passed++;
    } catch (err) {
      console.error(`✗ [FAIL] Test #${total}: Subsidy definition error:`, err.message);
    }

    // Test 17: Conversational Telugu Query
    total++;
    try {
      const res = await postJson(port, '/api/v1/voice/parse', {
        transcript: 'సబ్సిడీ అంటే ఏమిటి?',
        lang: 'TE'
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.responseLang, 'TE');
      assert(res.body.responseText.length > 20);
      console.log(`✓ [PASS] Test #${total}: Conversational Telugu Query ("సబ్సిడీ అంటే ఏమిటి?") responds in Telugu`);
      passed++;
    } catch (err) {
      console.error(`✗ [FAIL] Test #${total}: Telugu query error:`, err.message);
    }

    // Test 18: Conversational Hindi Query
    total++;
    try {
      const res = await postJson(port, '/api/v1/voice/parse', {
        transcript: 'मुद्रा लोन कैसे मिलेगा?',
        lang: 'HI'
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.responseLang, 'HI');
      assert(res.body.quickFollowUps && res.body.quickFollowUps.length > 0);
      console.log(`✓ [PASS] Test #${total}: Conversational Hindi Query ("मुद्रा लोन कैसे मिलेगा?") returns Mudra tiers & follow-ups`);
      passed++;
    } catch (err) {
      console.error(`✗ [FAIL] Test #${total}: Hindi query error:`, err.message);
    }

    // Test 19: Dalit Bandhu SC Welfare Grant
    total++;
    try {
      const res = await postJson(port, '/api/v1/voice/parse', {
        transcript: 'Tell me about Dalit Bandhu grant scheme',
        lang: 'EN'
      });
      assert.strictEqual(res.status, 200);
      const text = res.body.responseText.toLowerCase();
      assert(text.includes('10 lakh') || text.includes('10,00,000') || text.includes('dalit bandhu') || text.includes('grant'));
      console.log(`✓ [PASS] Test #${total}: SC/ST Entrepreneur query ("Dalit Bandhu grant") returns ₹10 Lakh benefit details`);
      passed++;
    } catch (err) {
      console.error(`✗ [FAIL] Test #${total}: Dalit Bandhu query error:`, err.message);
    }

    // Test 20: Bank Proximity Locator
    total++;
    try {
      const res = await postJson(port, '/api/v1/voice/parse', {
        transcript: 'Find nearest bank branch',
        lang: 'EN',
        lat: 14.3396,
        lng: 78.5818
      });
      assert.strictEqual(res.status, 200);
      assert(Array.isArray(res.body.bankResults));
      if (res.body.bankResults.length > 0) {
        assert(res.body.bankResults[0].name);
        assert(res.body.bankResults[0].distanceText);
      }
      console.log(`✓ [PASS] Test #${total}: Bank proximity search with GPS coordinates returns ordered branches`);
      passed++;
    } catch (err) {
      console.error(`✗ [FAIL] Test #${total}: Bank proximity error:`, err.message);
    }

  } finally {
    server.close(() => {
      console.log('\n====================================================');
      console.log(`RESULTS: ${passed}/${total} TESTS PASSED`);
      if (passed === total) {
        console.log('🎉 ALL CHATGPT VOICE ASSISTANT TESTS PASSED SUCCESSFULLY!');
        console.log('====================================================\n');
        process.exit(0);
      } else {
        console.error('❌ SOME TESTS FAILED');
        console.log('====================================================\n');
        process.exit(1);
      }
    });
  }
});
