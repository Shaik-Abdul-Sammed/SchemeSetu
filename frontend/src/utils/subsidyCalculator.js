/**
 * subsidyCalculator.js — Government Subsidy & Capital Grant Deduction Math
 * ─────────────────────────────────────────────────────────────────────────────
 * Calculates net borrower liability after deducting Central/State capital grants:
 *   - PMEGP: 15% to 35% capital subsidy based on category (Urban/Rural/SC/ST)
 *   - PM Vishwakarma: ₹15,000 digital toolkit voucher
 *   - PM SVANidhi: 7% interest subsidy cashback
 */
'use strict';

export function calculatePmegpSubsidy({ projectCost = 1000000, category = 'General', location = 'Urban' }) {
  const cost = Number(projectCost);
  let subsidyPct = 15; // General Urban default

  if (category !== 'General') {
    subsidyPct = location === 'Rural' ? 35 : 25;
  } else {
    subsidyPct = location === 'Rural' ? 25 : 15;
  }

  const subsidyAmount = Math.round((cost * subsidyPct) / 100);
  const ownContributionPct = category !== 'General' ? 5 : 10;
  const ownContributionAmount = Math.round((cost * ownContributionPct) / 100);
  const netBankLoanRequired = Math.max(0, cost - subsidyAmount - ownContributionAmount);

  return {
    projectCost: cost,
    subsidyPct,
    subsidyAmount,
    ownContributionPct,
    ownContributionAmount,
    netBankLoanRequired,
  };
}
