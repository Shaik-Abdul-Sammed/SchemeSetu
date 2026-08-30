/**
 * Agent Mode Validation & Scheme Matching Engine for SchemeSetu
 * Enforces strict validation gates before running recommendations, financial evaluations, or report generation.
 */

import { validateAndParseNumber, formatIndianCurrency } from './numberValidator';
import { mockSchemes } from '../data/mock/schemes';

export function validateAgentProfile(formData) {
  const errors = [];
  const normalized = {};

  // 1. Name validation
  if (!formData.name || !String(formData.name).trim()) {
    errors.push('Beneficiary full name is required.');
  } else if (String(formData.name).trim().length < 2) {
    errors.push('Beneficiary name must be at least 2 characters.');
  } else {
    normalized.name = String(formData.name).trim();
  }

  // 2. Age validation
  const ageRes = validateAndParseNumber(formData.age, 'age');
  if (!ageRes.isValid) {
    errors.push(ageRes.error || 'Enter a valid age between 18 and 100 years.');
  } else {
    normalized.age = ageRes.value;
  }

  // 3. Category validation
  const validCategories = ['SC', 'ST', 'OBC', 'General', 'EWS', 'Minority', 'Special Category'];
  const cat = String(formData.casteCategory || formData.category || 'SC').trim();
  if (!cat) {
    errors.push('Social Category / Caste is required.');
  } else {
    normalized.casteCategory = cat;
  }

  // 4. Annual Income validation
  const incomeRes = validateAndParseNumber(formData.income, 'income');
  if (!incomeRes.isValid) {
    errors.push(incomeRes.error || 'Enter a valid annual household income between ₹0 and ₹1,00,00,000.');
  } else {
    normalized.annualIncome = incomeRes.value;
  }

  // 5. Project Cost validation
  const costRes = validateAndParseNumber(formData.cost || formData.projectCost, 'cost');
  if (!costRes.isValid) {
    errors.push(costRes.error || 'Enter a valid project cost between ₹1,000 and ₹5,00,00,000.');
  } else {
    normalized.projectCost = costRes.value;
  }

  // 6. Loan Requirement validation
  const loanInput = formData.loanRequirement !== undefined ? formData.loanRequirement : (formData.cost || formData.projectCost);
  const loanRes = validateAndParseNumber(loanInput, 'loanRequirement');
  if (!loanRes.isValid) {
    errors.push(loanRes.error || 'Enter a valid loan requirement between ₹1,000 and ₹5,00,00,000.');
  } else {
    normalized.loanRequirement = loanRes.value;
  }

  // 7. Cross-field Project Cost vs Loan consistency
  if (costRes.isValid && loanRes.isValid) {
    if (normalized.loanRequirement > normalized.projectCost) {
      errors.push(`Requested loan amount (${formatIndianCurrency(normalized.loanRequirement)}) cannot exceed the total project cost (${formatIndianCurrency(normalized.projectCost)}).`);
    }
  }

  // 8. Other attributes
  normalized.gender = formData.gender || 'Male';
  normalized.occupation = formData.occupation || 'Business';
  normalized.businessType = formData.businessType || formData.projectType || 'Manufacturing';
  normalized.location = formData.location || 'Hyderabad, Telangana';
  normalized.state = formData.state || 'Telangana';

  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? normalized : null
  };
}

/**
 * Runs eligibility matching strictly on validated profile data.
 * @param {object} profile Validated citizen profile
 * @returns {{ topSchemes: array, rejectedSchemes: array, totalEvaluated: number }}
 */
export function evaluateAgentSchemes(profile) {
  if (!profile) return { topSchemes: [], rejectedSchemes: [], totalEvaluated: 0 };

  const evaluated = [];
  const rejected = [];

  mockSchemes.forEach(scheme => {
    let score = 50; // baseline
    const reasons = [];
    const missing = [];
    let isEligible = true;

    // Age Check
    if (profile.age < scheme.minAge || profile.age > scheme.maxAge) {
      isEligible = false;
      missing.push(`Age ${profile.age} is outside eligibility range (${scheme.minAge}-${scheme.maxAge} yrs)`);
    } else {
      reasons.push(`Age criteria met (${scheme.minAge}-${scheme.maxAge} yrs)`);
      score += 10;
    }

    // Income Check
    if (scheme.maxIncome && profile.annualIncome > scheme.maxIncome) {
      isEligible = false;
      missing.push(`Annual income ${formatIndianCurrency(profile.annualIncome)} exceeds scheme ceiling of ${formatIndianCurrency(scheme.maxIncome)}`);
    } else if (scheme.maxIncome) {
      reasons.push(`Income within ceiling (${formatIndianCurrency(scheme.maxIncome)})`);
      score += 15;
    }

    // Category / Caste Priority
    const isSC = profile.casteCategory === 'SC' || String(profile.casteCategory).toUpperCase().includes('SC');
    if (scheme.id === 'dalit-bandhu') {
      if (isSC && (profile.state === 'Telangana' || profile.location.includes('Telangana'))) {
        score += 25;
        reasons.push('100% Non-repayable welfare grant for SC entrepreneurs in Telangana');
      } else {
        isEligible = false;
        missing.push('Restricted to SC community residents of Telangana');
      }
    } else if (scheme.id === 'stand-up-india') {
      if (isSC || profile.gender === 'Female') {
        score += 20;
        reasons.push('Special SC/ST/Women enterprise greenfield credit');
      }
    } else if (scheme.id === 'pmegp') {
      if (isSC) {
        score += 20;
        reasons.push('35% Special category margin money subsidy for SC applicants');
      }
    }

    // Financial Fit Check
    let financialFit = 'Limit not specified in available data';
    let isFinancialMatch = true;

    if (scheme.maxLoan) {
      if (profile.loanRequirement <= scheme.maxLoan) {
        financialFit = `Within Limit (${formatIndianCurrency(profile.loanRequirement)} / Max ${formatIndianCurrency(scheme.maxLoan)})`;
        score += 15;
      } else {
        isFinancialMatch = false;
        financialFit = `Exceeds Cap (${formatIndianCurrency(profile.loanRequirement)} > Max ${formatIndianCurrency(scheme.maxLoan)})`;
        missing.push(`Requested loan (${formatIndianCurrency(profile.loanRequirement)}) exceeds scheme cap (${formatIndianCurrency(scheme.maxLoan)})`);
      }
    }

    if (isEligible && isFinancialMatch) {
      evaluated.push({
        scheme,
        matchScore: Math.min(score, 98),
        financialFit,
        reasons,
        missing: missing.length > 0 ? missing : ['None — All primary criteria verified']
      });
    } else {
      rejected.push({
        scheme,
        reason: missing.join(', ') || 'Demographic or financial mismatch'
      });
    }
  });

  // Sort by matchScore descending
  evaluated.sort((a, b) => b.matchScore - a.matchScore);

  return {
    topSchemes: evaluated.slice(0, 3),
    rejectedSchemes: rejected,
    totalEvaluated: mockSchemes.length
  };
}
