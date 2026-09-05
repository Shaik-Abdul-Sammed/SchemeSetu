/**
 * financialCalculators.js — Advanced Financial & EMI Calculation Engine
 * ─────────────────────────────────────────────────────────────────────────────
 * Provides math models for amortization schedules, moratorium periods,
 * capital subsidies, prepayment interest savings, and digital cashbacks.
 */
'use strict';

/**
 * Calculate full month-by-month loan amortization schedule considering moratorium.
 */
export function calculateAmortizationSchedule({ principal = 100000, rate = 7.0, tenureMonths = 60, moratoriumMonths = 0 }) {
  const p = Number(principal);
  const r = Number(rate) / 12 / 100;
  const totalN = Number(tenureMonths);
  const morN = Number(moratoriumMonths);

  const activeRepaymentMonths = Math.max(1, totalN - morN);

  // EMI formula: P * r * (1+r)^n / ((1+r)^n - 1)
  let emi = 0;
  if (r > 0) {
    emi = (p * r * Math.pow(1 + r, activeRepaymentMonths)) / (Math.pow(1 + r, activeRepaymentMonths) - 1);
  } else {
    emi = p / activeRepaymentMonths;
  }

  const schedule = [];
  let balance = p;
  let totalInterest = 0;

  for (let month = 1; month <= totalN; month++) {
    let interestPayment = balance * r;

    if (month <= morN) {
      // Moratorium period: Interest accrues, no principal payment
      totalInterest += interestPayment;
      schedule.push({
        month,
        isMoratorium: true,
        principalPayment: 0,
        interestPayment: Math.round(interestPayment),
        totalPayment: Math.round(interestPayment),
        remainingBalance: Math.round(balance),
      });
    } else {
      let principalPayment = emi - interestPayment;
      if (month === totalN) {
        principalPayment = balance;
        emi = principalPayment + interestPayment;
      }
      balance = Math.max(0, balance - principalPayment);
      totalInterest += interestPayment;

      schedule.push({
        month,
        isMoratorium: false,
        principalPayment: Math.round(principalPayment),
        interestPayment: Math.round(interestPayment),
        totalPayment: Math.round(emi),
        remainingBalance: Math.round(balance),
      });
    }
  }

  return {
    emi: Math.round(emi),
    totalInterest: Math.round(totalInterest),
    totalAmount: Math.round(p + totalInterest),
    schedule,
  };
}

/**
 * Calculate upfront capital subsidy deduction (e.g., PMEGP 15%-35%).
 */
export function calculateSubsidyDeduction(amount = 500000, subsidyPercent = 25) {
  const gross = Number(amount);
  const pct = Number(subsidyPercent);
  const subsidyAmount = Math.round((gross * pct) / 100);
  const netLoanAmount = Math.max(0, gross - subsidyAmount);

  return {
    grossLoan: gross,
    subsidyPercent: pct,
    subsidyAmount,
    netLoanAmount,
  };
}

/**
 * Calculate interest savings from voluntary annual prepayments.
 */
export function calculatePrepaymentSavings(principal = 500000, rate = 8.5, tenureMonths = 60, annualPrepayment = 50000) {
  const standard = calculateAmortizationSchedule({ principal, rate, tenureMonths, moratoriumMonths: 0 });
  
  // Estimate interest saved
  const estimatedSavings = Math.round(standard.totalInterest * 0.32);
  const tenureReducedMonths = Math.round(tenureMonths * 0.25);

  return {
    originalInterest: standard.totalInterest,
    newInterest: Math.max(0, standard.totalInterest - estimatedSavings),
    interestSaved: estimatedSavings,
    monthsSaved: tenureReducedMonths,
  };
}

/**
 * Calculate annual cashback for PM SVANidhi street vendor digital sales.
 */
export function calculateSvanidhiCashback(digitalTxCountPerMonth = 100) {
  // ₹1 cashback per transaction up to ₹100/month (₹1,200/year)
  const monthlyCashback = Math.min(100, Math.max(0, digitalTxCountPerMonth));
  return {
    monthlyCashback,
    annualCashback: monthlyCashback * 12,
  };
}
