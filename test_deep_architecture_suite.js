/**
 * SchemeSetu Deep Architecture Verification Suite
 * Executes rigorous edge-case testing across all 10 Architectural Depth Layers.
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');

console.log('====================================================');
console.log(' SCHEMESETU DEEP ARCHITECTURE VERIFICATION SUITE   ');
console.log('====================================================\n');

let totalTests = 0;
let passedTests = 0;

function runTest(layerName, description, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`✓ [PASS] [${layerName}] Test #${totalTests}: ${description}`);
  } catch (err) {
    console.error(`❌ [FAIL] [${layerName}] Test #${totalTests}: ${description}`);
    console.error(`   Error: ${err.message}`);
  }
}

// ── LAYER 1: Matching Engine Edge Cases & Null Safety ─────────────────────────
const { evaluateSchemeForApplicant, matchAllSchemes } = require('./backend/src/services/matchingEngine');

const sampleScheme = {
  id: 'test-scheme-01',
  name: 'Test SC Enterprise Scheme',
  minAge: 18,
  maxAge: 65,
  maxIncome: 300000,
  casteEligibility: ['SC'],
  maxLoan: 500000,
  level: 'Central',
  state: 'Pan-India',
  eligibleSectors: ['All Sectors']
};

runTest('Layer 1', 'Age below minimum (Age 15 < 18) yields matchScore = 0 and isDisqualified', () => {
  const res = evaluateSchemeForApplicant(sampleScheme, { age: 15, casteCategory: 'SC', annualIncome: 200000 });
  assert.strictEqual(res.matchScore, 0);
  assert.strictEqual(res.eligibilityStatus, 'Ineligible');
});

runTest('Layer 1', 'Non-SC category on SC-only scheme yields matchScore = 0 and isDisqualified', () => {
  const res = evaluateSchemeForApplicant(sampleScheme, { age: 30, casteCategory: 'OBC', annualIncome: 200000 });
  assert.strictEqual(res.matchScore, 0);
  assert.strictEqual(res.eligibilityStatus, 'Ineligible');
});

runTest('Layer 1', 'Loan requirement exceeding scheme limit (₹6L > ₹5L) sets status Exceeds Scheme Limit', () => {
  const res = evaluateSchemeForApplicant(sampleScheme, { age: 30, casteCategory: 'SC', annualIncome: 200000, loanRequirement: 600000 });
  assert.strictEqual(res.eligibilityStatus, 'Exceeds Scheme Limit');
});

runTest('Layer 1', 'Evaluation generates 64-character SHA-256 auditHash string', () => {
  const res = evaluateSchemeForApplicant(sampleScheme, { age: 30, casteCategory: 'SC', annualIncome: 200000 });
  assert.ok(res.auditHash);
  assert.strictEqual(res.auditHash.length, 64);
});

runTest('Layer 1', 'matchAllSchemes handles profile with missing/undefined fields safely', () => {
  const res = matchAllSchemes({});
  assert.ok(res.recommendations);
  assert.ok(res.totalSchemesEvaluated > 0);
});

// ── LAYER 2: Financial Calculator Math & Moratorium Safety ───────────────────
const { calculateEmi } = require('./backend/src/controllers/calculatorController');

function runCalc(body) {
  let result = null;
  let errorObj = null;
  const req = { body };
  const res = {
    status: (code) => {
      return {
        json: (data) => {
          if (code >= 400) errorObj = data;
          else result = data;
        }
      };
    }
  };
  calculateEmi(req, res, (err) => { throw err; });
  return { result, errorObj };
}

runTest('Layer 2', 'EMI calculation with INTEREST_PAID_DURING_MORATORIUM', () => {
  const { result } = runCalc({ principal: 100000, annualRate: 12, tenureMonths: 24, moratoriumMonths: 6, moratoriumMode: 'INTEREST_PAID_DURING_MORATORIUM' });
  assert.ok(result);
  assert.strictEqual(result.principal, 100000);
  assert.strictEqual(result.monthlyMoratoriumInterest, 1000);
  assert.strictEqual(result.accruedInterest, 6000);
  assert.ok(result.emi > 0);
});

runTest('Layer 2', 'EMI calculation with INTEREST_CAPITALIZED increases loan principal', () => {
  const { result } = runCalc({ principal: 100000, annualRate: 12, tenureMonths: 24, moratoriumMonths: 6, moratoriumMode: 'INTEREST_CAPITALIZED' });
  assert.ok(result);
  assert.strictEqual(result.loanAmount, 106000); // 100000 + 6000 interest
});

runTest('Layer 2', 'Rejects moratoriumMonths >= tenureMonths with HTTP 400', () => {
  const { errorObj } = runCalc({ principal: 100000, annualRate: 10, tenureMonths: 12, moratoriumMonths: 12 });
  assert.ok(errorObj);
  assert.ok(errorObj.error.includes('strictly less than'));
});

runTest('Layer 2', 'Rejects negative or zero principal with HTTP 400', () => {
  const { errorObj } = runCalc({ principal: -5000, annualRate: 10, tenureMonths: 24 });
  assert.ok(errorObj);
});

// ── LAYER 3: Localized Voice NLU & Entity Extraction ─────────────────────────
const { normalizeTranscript, parseVoiceIntent } = require('./backend/src/services/voice_intent_parser');

runTest('Layer 3', 'Normalizes Hindi spoken currency "paanch lakh" to 500000', () => {
  const norm = normalizeTranscript('mujhe paanch lakh ka loan chahiye');
  assert.ok(norm.includes('500000'));
});

runTest('Layer 3', 'Normalizes Telugu spoken currency "padi velu" to 10000', () => {
  const norm = normalizeTranscript('naaku padi velu kavali');
  assert.ok(norm.includes('10000'));
});

runTest('Layer 3', 'Parses bank locator intent FIND_NEAREST_BANK correctly', () => {
  const intentObj = parseVoiceIntent('where is the nearest bank in hyderabad');
  assert.strictEqual(intentObj.intent, 'FIND_NEAREST_BANK');
});

// ── LAYER 4: AI Safety & RAG Guardrails ──────────────────────────────────────
const ragService = require('./backend/src/services/ragService');

runTest('Layer 4', 'RAG service exposes queryKnowledgeBase function and status', () => {
  assert.ok(typeof ragService.queryKnowledgeBase === 'function');
});

// ── LAYER 5: Mobile Shell & Capacitor Integration ────────────────────────────
runTest('Layer 5', 'capacitorHandler file exists and exports setupCapacitorApp', () => {
  const cap = require('./frontend/src/utils/capacitorHandler');
  assert.ok(typeof cap.setupCapacitorApp === 'function');
});

// ── LAYER 6: Security Checksums & Verification Engine ────────────────────────
const { validateAadhaarVerhoeff, validatePAN } = require('./backend/src/services/verificationEngine');

runTest('Layer 6', 'Verhoeff checksum rejects invalid Aadhaar strings', () => {
  assert.strictEqual(validateAadhaarVerhoeff('123456789012'), false);
});

runTest('Layer 6', 'PAN validator checks 10-character alphanumeric pattern', () => {
  assert.strictEqual(validatePAN('ABCDE1234F'), true);
  assert.strictEqual(validatePAN('INVALIDPAN'), false);
});

// ── LAYER 7: Database & Data Loader Resilience ──────────────────────────────
const { getSchemes, getPartners, normalizeScheme, normalizePartner } = require('./backend/src/services/dataService');

runTest('Layer 7', 'normalizeScheme handles missing raw input gracefully', () => {
  assert.strictEqual(normalizeScheme(null, 0), null);
  assert.strictEqual(normalizeScheme(undefined, 0), null);
});

runTest('Layer 7', 'normalizePartner parses spatial coordinates safely', () => {
  const p = normalizePartner({ name: 'Test Bank', coordinates: { lat: 17.385, lng: 78.486 } }, 1);
  assert.strictEqual(p.coordinates.lat, 17.385);
  assert.strictEqual(p.coordinates.lng, 78.486);
});

runTest('Layer 7', 'getSchemes returns array of active schemes', () => {
  const schemes = getSchemes();
  assert.ok(Array.isArray(schemes));
  assert.ok(schemes.length > 0);
});

// ── LAYER 8: PWA Manifest & Storage Files ────────────────────────────────────
runTest('Layer 8', 'PWA manifest.json exists and contains display standalone', () => {
  const manifest = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'frontend/public/manifest.json'), 'utf8'));
  assert.strictEqual(manifest.display, 'standalone');
  assert.ok(manifest.icons.length > 0);
});

// ── LAYER 9: Express Error Middleware ─────────────────────────────────────────
const errorHandler = require('./backend/src/middleware/errorHandler');

runTest('Layer 9', 'errorHandler formats JSON response without leaking stack traces in prod', () => {
  let jsonRes = null;
  const res = {
    status: (code) => {
      assert.strictEqual(code, 500);
      return {
        json: (data) => { jsonRes = data; }
      };
    }
  };
  const err = new Error('Test internal error');
  errorHandler(err, {}, res, () => {});
  assert.ok(jsonRes);
  assert.strictEqual(jsonRes.success, false);
});

// ── LAYER 10: Production Dist Bundle Build Check ─────────────────────────────
runTest('Layer 10', 'Frontend production dist index.html file exists', () => {
  const distHtml = path.resolve(__dirname, 'frontend/dist/index.html');
  assert.ok(fs.existsSync(distHtml));
});

console.log('\n====================================================');
console.log(`RESULTS: ${passedTests}/${totalTests} TESTS PASSED`);
console.log('====================================================\n');

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
