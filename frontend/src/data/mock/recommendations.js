/**
 * SchemeSetu Centralized Mock Dataset - Recommendations with Match Scores
 * Prototype / Demo Dataset for SIH 2026
 */

import { MOCK_SCHEMES } from './schemes';

export const MOCK_RECOMMENDATIONS = [
  {
    ...MOCK_SCHEMES[1], // PMMY Kishore
    matchScore: 96,
    eligibilityStatus: 'Highly Eligible',
    isEligible: true,
    matchReasons: [
      'Your annual household income (₹2,40,000) is well below the ₹6,00,000 ceiling.',
      'Required loan cost fits within the Kishore credit bracket (₹50,000 to ₹5,00,000).',
      'SC Beneficiary priority access applied with margin money subsidy support.',
      'Education qualification (10th pass) meets non-farm micro-business criteria.'
    ],
    disqualifyReasons: []
  },
  {
    ...MOCK_SCHEMES[3], // PMEGP
    matchScore: 92,
    eligibilityStatus: 'Eligible with 35% Subsidy',
    isEligible: true,
    matchReasons: [
      'Eligible for 35% rural margin money capital subsidy under Special Category (SC/ST).',
      'Education qualification (10th pass) exceeds minimum 8th standard requirement.',
      'Project sector (manufacturing / services) is in national priority list.'
    ],
    disqualifyReasons: []
  },
  {
    ...MOCK_SCHEMES[7], // PM Vishwakarma
    matchScore: 88,
    eligibilityStatus: 'Eligible for Modern Toolkit',
    isEligible: true,
    matchReasons: [
      'Eligible for ₹15,000 modern toolkit e-voucher grant.',
      'Subsidized 5% interest rate collateral-free loan up to ₹3,00,000.',
      'Free skill training stipend of ₹500/day during certification.'
    ],
    disqualifyReasons: []
  },
  {
    ...MOCK_SCHEMES[0], // PMMY Tarun
    matchScore: 82,
    eligibilityStatus: 'Eligible for Business Expansion',
    isEligible: true,
    matchReasons: [
      'Eligible for loans between ₹5 Lakhs and ₹10 Lakhs.',
      '60-month repayment tenure with 6-month moratorium.'
    ],
    disqualifyReasons: [
      'Higher project cost tier may require business turnover documentation.'
    ]
  }
];

export default MOCK_RECOMMENDATIONS;
