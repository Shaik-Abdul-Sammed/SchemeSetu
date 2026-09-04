/**
 * test_v4_assistant.js — SchemeSetu V4 Automated Verification Test Suite
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates:
 *   1. Progressive profile slot extraction (Name, State, Occupation)
 *   2. Knowledge Source Hierarchy ranking & domain validation (.gov.in)
 *   3. Structured fact model output consistency
 *   4. Hallucination prevention (rejecting unverified/fake scheme queries)
 *   5. Nearest Bank search integration
 */
'use strict';

const { parseVoiceIntent, extractSlots } = require('./backend/src/services/voice_intent_parser');
const { verifySchemeFact, verifyClaimText } = require('./backend/src/services/verificationEngine');

console.log('====================================================');
console.log('  SCHEMESETU V4 AI ASSISTANT VERIFICATION SUITE    ');
console.log('====================================================\n');

let totalTests = 0;
let passedTests = 0;

function assertTest(name, condition, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`✓ [PASS] Test #${totalTests}: ${name}`);
  } else {
    console.error(`❌ [FAIL] Test #${totalTests}: ${name}`);
    if (details) console.error(`       Details: ${details}`);
  }
}

// ── TEST 1: Progressive Profile Slot Extraction ─────────────────────────────
console.log('--- 1. Progressive Profile Extraction ---');

const t1Slots = extractSlots('my name is Ravi and I am from Andhra Pradesh');
assertTest(
  'Name slot extraction ("Ravi")',
  t1Slots.name === 'Ravi',
  `Got ${t1Slots.name}`
);
assertTest(
  'State slot extraction ("Andhra Pradesh")',
  t1Slots.state === 'Andhra Pradesh',
  `Got ${t1Slots.state}`
);

const t2Slots = extractSlots('నా పేరు రవి నేను తెలంగాణ నుంచి');
assertTest(
  'Telugu Name slot extraction ("రవి")',
  t2Slots.name === 'రవి',
  `Got ${t2Slots.name}`
);

// ── TEST 2: Knowledge Source Hierarchy & Verification Engine ─────────────
console.log('\n--- 2. Knowledge Source Hierarchy & Verification Engine ---');

const pmkisanFact = verifySchemeFact({
  schemeId: 'pm-kisan',
  userProfile: { name: 'Ravi', state: 'Andhra Pradesh', occupation: 'Farmer' }
});

assertTest(
  'PM-KISAN verification status is verified',
  pmkisanFact.verificationStatus === 'verified',
  `Status: ${pmkisanFact.verificationStatus}`
);
assertTest(
  'Official government domain identified (.gov.in)',
  pmkisanFact.source.isGovernmentDomain === true && pmkisanFact.source.authorityScore === 1.0,
  `Authority score: ${pmkisanFact.source.authorityScore}, URL: ${pmkisanFact.source.url}`
);
assertTest(
  'Matched eligibility criteria generated',
  pmkisanFact.eligibilitySummary.matchedCriteria.length > 0,
  `Matched criteria count: ${pmkisanFact.eligibilitySummary.matchedCriteria.length}`
);

// ── TEST 3: Hallucination Prevention (Fake / Unverified Scheme) ───────────
console.log('\n--- 3. Hallucination Prevention ---');

const fakeFact = verifySchemeFact({
  query: 'Free 100 Lakh Unconditional Cash Gift Scheme 2026',
  userProfile: { name: 'Test' }
});

assertTest(
  'Fake/Unverified scheme classified as uncertain',
  fakeFact.verificationStatus === 'uncertain',
  `Status: ${fakeFact.verificationStatus}`
);
assertTest(
  'Authority score is low for unverified scheme',
  fakeFact.source.authorityScore < 0.5,
  `Score: ${fakeFact.source.authorityScore}`
);
assertTest(
  'Unverified claim text correctly flagged by claim verifier',
  verifyClaimText('Get 100% subsidy zero interest free guaranteed approval loan').isVerified === false,
  'Claim text not flagged'
);

// ── TEST 4: Multilingual NLU Intent Parsing ─────────────────────────────────
console.log('\n--- 4. Multilingual Intent Parsing ---');

const bankIntent = parseVoiceIntent('నా దగ్గర బ్యాంక్ ఎక్కడ ఉంది');
assertTest(
  'Telugu bank search intent (FIND_NEAREST_BANK)',
  bankIntent.intent === 'FIND_NEAREST_BANK',
  `Got ${bankIntent.intent}`
);

const hindiStatusIntent = parseVoiceIntent('मेरे आवेदन की स्थिति बताइए');
assertTest(
  'Hindi status search intent (CHECK_STATUS)',
  hindiStatusIntent.intent === 'CHECK_STATUS',
  `Got ${hindiStatusIntent.intent}`
);

// ── SUMMARY ─────────────────────────────────────────────────────────────────
console.log('\n====================================================');
console.log(`RESULTS: ${passedTests}/${totalTests} TESTS PASSED`);
if (passedTests === totalTests) {
  console.log('🎉 ALL V4 ASSISTANT VERIFICATION TESTS PASSED SUCCESSFULLY!');
  process.exit(0);
} else {
  console.error('❌ SOME TESTS FAILED');
  process.exit(1);
}
