/**
 * test_multilingual_v3.js — Verification test suite for NLU and language detection
 */
const { parseVoiceIntent } = require('./backend/src/services/voice_intent_parser');

const TEST_CASES = [
  // English
  { input: 'Show me farming schemes', expectedIntent: 'NAVIGATE_SCHEMES' },
  { input: 'Check my application status', expectedIntent: 'CHECK_STATUS' },
  { input: 'Find a bank near me', expectedIntent: 'FIND_NEAREST_BANK' },
  { input: 'I need a five lakh business loan', expectedIntent: 'DISCOVER_SCHEMES', expectedSlot: { amount: 500000 } },

  // Telugu
  { input: 'నాకు వ్యవసాయ పథకాలు చూపించండి', expectedIntent: 'NAVIGATE_SCHEMES' },
  { input: 'నా అప్లికేషన్ స్టేటస్ చెప్పండి', expectedIntent: 'CHECK_STATUS' },
  { input: 'నా దగ్గర బ్యాంక్ ఎక్కడ ఉంది', expectedIntent: 'FIND_NEAREST_BANK' },
  { input: 'నాకు ఐదు లక్షల బిజినెస్ లోన్ కావాలి', expectedIntent: 'DISCOVER_SCHEMES', expectedSlot: { amount: 500000 } },

  // Hindi
  { input: 'मुझे कृषि योजनाएं दिखाइए', expectedIntent: 'NAVIGATE_SCHEMES' },
  { input: 'मेरे आवेदन की स्थिति बताइए', expectedIntent: 'CHECK_STATUS' },
  { input: 'मेरे पास बैंक कहां है', expectedIntent: 'FIND_NEAREST_BANK' },
  { input: 'मुझे पांच लाख का बिजनेस लोन चाहिए', expectedIntent: 'DISCOVER_SCHEMES', expectedSlot: { amount: 500000 } },

  // Tanglish / Hinglish
  { input: 'Naaku farming loan kavali', expectedIntent: 'DISCOVER_SCHEMES' },
  { input: 'Mujhe business loan chahiye', expectedIntent: 'DISCOVER_SCHEMES' },
];

console.log('=== MULTILINGUAL VOICE NLU TEST SUITE V3 ===\n');
let passed = 0;
let total = TEST_CASES.length;

TEST_CASES.forEach(({ input, expectedIntent, expectedSlot }, idx) => {
  const result = parseVoiceIntent(input);
  const intentMatch = result.intent === expectedIntent;
  let slotMatch = true;
  if (expectedSlot) {
    for (const [k, v] of Object.entries(expectedSlot)) {
      if (result.slots[k] !== v) slotMatch = false;
    }
  }

  const ok = intentMatch && slotMatch;
  if (ok) passed++;

  console.log(`[${ok ? 'PASS' : 'FAIL'}] Test #${idx + 1}: "${input}"`);
  console.log(`       Got Intent: ${result.intent} (expected ${expectedIntent})`);
  if (expectedSlot) console.log(`       Got Slots: ${JSON.stringify(result.slots)}`);
  console.log('---');
});

console.log(`\nRESULTS: ${passed}/${total} tests passed.`);
if (passed === total) {
  console.log('🎉 ALL MULTILINGUAL NLU TESTS PASSED!');
  process.exit(0);
} else {
  console.error('❌ SOME TESTS FAILED');
  process.exit(1);
}
