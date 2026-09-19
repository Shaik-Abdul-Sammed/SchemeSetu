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
export function calculateAmortizationSchedule({ 
  principal = 100000, 
  projectCost = 0,
  fundingCoveragePct = 90,
  rate = 6.5, 
  tenureMonths = 60, 
  moratoriumMonths = 0,
  moratoriumMode = 'INTEREST_PAID_DURING_MORATORIUM' 
}) {
  const rawCost = Number(projectCost || principal);
  const coverage = Number(fundingCoveragePct || 90);
  const financedAmount = projectCost > 0 ? Math.round((rawCost * coverage) / 100) : Number(principal);
  const promoterContribution = projectCost > 0 ? Math.round(rawCost - financedAmount) : 0;
  
  const p = financedAmount;
  const r = Number(rate) / 12 / 100;
  const totalN = Number(tenureMonths);
  const morN = Number(moratoriumMonths);
  const activeRepaymentMonths = Math.max(1, totalN - morN);

  const monthlyMoratoriumInterest = Math.round(p * r);
  const accruedMoratoriumInterest = Math.round(p * r * morN);

  let effectivePrincipal = p;
  if (moratoriumMode === 'INTEREST_CAPITALIZED' && morN > 0) {
    effectivePrincipal = p + accruedMoratoriumInterest;
  }

  // EMI formula: P * r * (1+r)^n / ((1+r)^n - 1)
  let emi = 0;
  if (r > 0) {
    emi = (effectivePrincipal * r * Math.pow(1 + r, activeRepaymentMonths)) / (Math.pow(1 + r, activeRepaymentMonths) - 1);
  } else {
    emi = effectivePrincipal / activeRepaymentMonths;
  }

  const schedule = [];
  let balance = effectivePrincipal;
  let totalInterest = 0;

  for (let month = 1; month <= totalN; month++) {
    let interestPayment = balance * r;

    if (month <= morN) {
      // Moratorium period
      totalInterest += interestPayment;
      const paymentThisMonth = moratoriumMode === 'INTEREST_PAID_DURING_MORATORIUM' ? interestPayment : 0;
      schedule.push({
        month,
        isMoratorium: true,
        principalPayment: 0,
        interestPayment: Math.round(interestPayment),
        totalPayment: Math.round(paymentThisMonth),
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
    projectCost: rawCost,
    fundingCoveragePct: coverage,
    financedAmount,
    promoterContribution,
    principal: p,
    effectivePrincipal,
    monthlyMoratoriumInterest,
    accruedMoratoriumInterest,
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

/**
 * Calculate Debt-To-Income (DTI) ratio & evaluate repayment capacity for concessional loans.
 * @param {number} annualIncome Annual family income in INR
 * @param {number} proposedEmi Proposed monthly EMI in INR
 * @param {number} existingMonthlyEmi Existing monthly loan obligations in INR
 * @returns {object} DTI analysis result
 */
export function calculateRepaymentCapacity(annualIncome = 300000, proposedEmi = 5000, existingMonthlyEmi = 0) {
  const grossMonthlyIncome = Math.max(1, Math.round(Number(annualIncome || 0) / 12));
  const totalMonthlyObligations = Math.round(Number(proposedEmi || 0) + Number(existingMonthlyEmi || 0));
  const dtiRatioPct = Number(((totalMonthlyObligations / grossMonthlyIncome) * 100).toFixed(1));
  const isSufficient = dtiRatioPct <= 50;

  return {
    grossMonthlyIncome,
    proposedEmi: Math.round(Number(proposedEmi || 0)),
    existingMonthlyEmi: Math.round(Number(existingMonthlyEmi || 0)),
    totalMonthlyObligations,
    dtiRatioPct,
    maxRecommendedObligation: Math.round(grossMonthlyIncome * 0.5),
    isSufficient,
    status: isSufficient ? 'SUFFICIENT_CAPACITY' : 'HIGH_DTI_WARNING',
    summary: isSufficient
      ? `Repayment capacity verified. Debt ratio (${dtiRatioPct}%) is within safe limit (<=50% of monthly income).`
      : `High DTI warning (${dtiRatioPct}%). Total monthly obligations exceed 50% of monthly family income.`
  };
}
