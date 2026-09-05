/**
 * schemeStacker.js — Scheme Stacking & Combination Advisory Engine
 * ─────────────────────────────────────────────────────────────────────────────
 * Analyzes citizen profile and identifies complementary scheme combinations:
 *   - Farmers: PM-KISAN (Income support) + PM Kisan Credit Card (Subsidized Loan) + PMFBY (Crop Insurance)
 *   - Artisans: PM Vishwakarma (Skill & Toolkit) + PMMY Mudra (Expansion Loan)
 *   - Street Vendors: PM SVANidhi (Working Capital) + Ayushman Bharat (Health Cover)
 *   - Women Entrepreneurs: Stand-Up India (Greenfield Loan) + Mudra Tarun
 */
'use strict';

const dataService = require('./dataService');

const STACK_TEMPLATES = [
  {
    stackId: 'farmer-triple-pack',
    title: '🌾 Complete Farmers Protection & Credit Stack',
    targetOccupation: 'farmer',
    schemeIds: ['pm-kisan', 'scheme-001'],
    totalPotentialBenefit: '₹6,000/yr Direct Income + Up to ₹10 Lakh Concessional Loan',
    description: 'Combine annual direct cash support with working capital loans for seeds, fertilizers & machinery.',
  },
  {
    stackId: 'artisan-growth-stack',
    title: '🎨 Artisan Skills & Capital Package',
    targetOccupation: 'artisan',
    schemeIds: ['pm-vishwakarma', 'scheme-002'],
    totalPotentialBenefit: '₹15,000 Toolkit Incentive + 5% Collateral-Free Credit up to ₹3 Lakh',
    description: 'Get free toolkits and skill certification paired with collateral-free business expansion loans.',
  },
  {
    stackId: 'vendor-livelihood-stack',
    title: '🛒 Micro-Vendor Capital & Health Security Stack',
    targetOccupation: 'vendor',
    schemeIds: ['pm-svanidhi', 'ayushman-bharat'],
    totalPotentialBenefit: 'Up to ₹50,000 Micro-Credit + ₹5 Lakh Health Coverage',
    description: 'Zero-collateral working capital credit paired with free cashless hospitalization cover for your family.',
  },
  {
    stackId: 'women-entrepreneur-stack',
    title: '👩‍💼 Women & SC/ST Enterprise Launchpad',
    targetOccupation: 'business',
    schemeIds: ['stand-up-india', 'pm-mudra-yojana'],
    totalPotentialBenefit: '₹10 Lakh to ₹1 Crore Greenfield Capital',
    description: 'High-capacity bank loans backed by Credit Guarantee Fund for first-time business owners.',
  }
];

/**
 * Get recommended scheme stacks tailored to user profile.
 */
function getRecommendedSchemeStacks(userProfile = {}) {
  const occ = (userProfile.occupation || '').toLowerCase();

  let matchedStacks = STACK_TEMPLATES.filter(stack => {
    if (!occ) return true; // Return all if no occupation specified
    return occ.includes(stack.targetOccupation) || stack.targetOccupation.includes(occ);
  });

  if (matchedStacks.length === 0) {
    matchedStacks = STACK_TEMPLATES.slice(0, 2); // Default fallback
  }

  const allSchemes = dataService.getSchemes();

  return matchedStacks.map(stack => {
    const includedSchemes = stack.schemeIds
      .map(id => allSchemes.find(s => s.id === id))
      .filter(Boolean);

    return {
      ...stack,
      schemes: includedSchemes,
    };
  });
}

module.exports = {
  getRecommendedSchemeStacks,
  STACK_TEMPLATES,
};
