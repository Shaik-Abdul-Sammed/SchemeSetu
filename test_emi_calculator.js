/**
 * Unit Test Suite for SIH26092 Concessional EMI Calculator
 * Formula: EMI = P * r * (1+r)^n / ((1+r)^n - 1)
 */

const assert = require('assert');

function calculateStandardEmi({ principal = 100000, rate = 8.0, tenureMonths = 36, moratoriumMonths = 6 } = {}) {
  const p = Math.max(0, Number(principal) || 0);
  const annualRate = Math.max(0, Number(rate) || 0);
  const totalMonths = Math.max(0, parseInt(tenureMonths, 10) || 0);
  const morMonths = Math.max(0, Math.min(totalMonths, parseInt(moratoriumMonths, 10) || 0));

  if (p === 0 || totalMonths === 0) {
    return {
      principal: p,
      rate: annualRate,
      tenureMonths: totalMonths,
      moratoriumMonths: morMonths,
      tenureAfterMoratorium: 0,
      emi: 0,
      monthlyMoratoriumInterest: 0,
      totalInterest: 0,
      totalAmount: p
    };
  }

  const n = Math.max(1, totalMonths - morMonths);
  const r = annualRate / 12 / 100;

  let emi = 0;
  if (r === 0) {
    emi = p / n;
  } else {
    emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }

  const monthlyMoratoriumInterest = p * r;
  const totalMoratoriumInterest = monthlyMoratoriumInterest * morMonths;
  const repaymentTotalPayment = emi * n;
  const totalInterest = Math.round((repaymentTotalPayment - p + totalMoratoriumInterest) * 100) / 100;
  const totalAmount = Math.round((p + totalInterest) * 100) / 100;

  return {
    principal: p,
    rate: annualRate,
    tenureMonths: totalMonths,
    moratoriumMonths: morMonths,
    tenureAfterMoratorium: n,
    emi: Math.round(emi * 100) / 100,
    monthlyMoratoriumInterest: Math.round(monthlyMoratoriumInterest * 100) / 100,
    totalInterest,
    totalAmount
  };
}

console.log('=== Running Concessional EMI Calculator Unit Tests ===\n');

// 1. Standard Case: ₹1,00,000 @ 8% for 36 months with 6 months moratorium
const res1 = calculateStandardEmi({ principal: 100000, rate: 8.0, tenureMonths: 36, moratoriumMonths: 6 });
console.log('Test 1 Result:', res1);
assert.strictEqual(res1.emi, 3688.83, `Expected EMI 3688.83, got ${res1.emi}`);
assert.strictEqual(res1.tenureAfterMoratorium, 30, `Expected 30 active repayment months, got ${res1.tenureAfterMoratorium}`);
console.log('✅ Test 1: Standard EMI calculation (₹1L @ 8%, 36m, 6m mor) -> ₹3,688.83 (Passed)');

// 2. Zero Principal
const res2 = calculateStandardEmi({ principal: 0, rate: 8.0, tenureMonths: 36, moratoriumMonths: 6 });
assert.strictEqual(res2.emi, 0);
console.log('✅ Test 2: Edge Case: Principal = 0 -> EMI 0 (Passed)');

// 3. Zero Tenure
const res3 = calculateStandardEmi({ principal: 100000, rate: 8.0, tenureMonths: 0, moratoriumMonths: 0 });
assert.strictEqual(res3.emi, 0);
console.log('✅ Test 3: Edge Case: Tenure = 0 -> EMI 0 (Passed)');

// 4. 0% Interest (Interest-Free Scheme)
const res4 = calculateStandardEmi({ principal: 60000, rate: 0, tenureMonths: 12, moratoriumMonths: 0 });
assert.strictEqual(res4.emi, 5000);
console.log('✅ Test 4: 0% Interest Scheme (₹60,000 / 12) -> ₹5,000 (Passed)');

// 5. Zero Moratorium Case
const res5 = calculateStandardEmi({ principal: 100000, rate: 8.0, tenureMonths: 36, moratoriumMonths: 0 });
assert.strictEqual(res5.tenureAfterMoratorium, 36);
assert.strictEqual(res5.emi, 3133.64);
console.log('✅ Test 5: Standard Zero Moratorium (₹1L @ 8%, 36m) -> ₹3,133.64 (Passed)');

console.log('\n🎉 ALL 5 FINANCIAL CALCULATOR TESTS PASSED!\n');
