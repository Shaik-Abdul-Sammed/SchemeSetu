/**
 * recommender.js — Scheme Recommendation Engine for Marginalized SC Entrepreneurs
 * SIH26092: Micro Finance (<= 1.4L), Term Loan (<= 50L), Educational Loan (<= 20L/30L)
 */

export const CONCESSIONAL_INCOME_LIMIT = 500000;
export const MICRO_FINANCE_MAX_COST = 140000;
export const TERM_LOAN_MAX_COST = 5000000;

export function recommendScheme({
  income = 0,
  cost = 0,
  projectCost = 0,
  education = false,
  projectType = 'business'
} = {}) {
  const annualIncome = Number(income);
  const totalCost = Number(projectCost || cost || 0);
  const isEducation = Boolean(education) || String(projectType).toLowerCase().includes('education');

  // Concessional limit check
  if (annualIncome > CONCESSIONAL_INCOME_LIMIT) {
    return {
      eligible: false,
      schemeName: null,
      reason: 'Annual family income exceeds concessional limit of ₹5.00 Lakhs'
    };
  }

  if (totalCost > TERM_LOAN_MAX_COST) {
    return {
      eligible: false,
      schemeName: null,
      reason: 'Project cost exceeds maximum Term Loan limit of ₹50.00 Lakhs'
    };
  }

  if (isEducation) {
    return {
      eligible: true,
      schemeName: 'Educational Loan',
      schemeCode: 'NSFDC_EDU',
      maxLimit: 2000000,
      interestRate: 4.0
    };
  }

  if (totalCost <= MICRO_FINANCE_MAX_COST) {
    return {
      eligible: true,
      schemeName: 'Micro Finance',
      schemeCode: 'NSFDC_MICRO',
      maxLimit: MICRO_FINANCE_MAX_COST,
      interestRate: 6.5
    };
  }

  return {
    eligible: true,
    schemeName: 'Term Loan',
    schemeCode: 'NSFDC_TERM',
    maxLimit: TERM_LOAN_MAX_COST,
    interestRate: 7.5
  };
}
