/**
 * eligibilityScorer.js — Multi-Criteria Eligibility Scoring Engine
 * ─────────────────────────────────────────────────────────────────────────────
 * Calculates weighted match score (0–100%) for a given scheme against user profile:
 *   - State Location (Weight: 25%)
 *   - Occupation / Beneficiary (Weight: 30%)
 *   - Income Limits (Weight: 25%)
 *   - Age Boundaries (Weight: 20%)
 */
'use strict';

function calculateEligibilityScore(scheme, userProfile = {}) {
  if (!scheme) {
    return { score: 0, matchedCriteria: [], unmatchedCriteria: [], unknownCriteria: ['Scheme not found'] };
  }

  let totalWeight = 0;
  let earnedScore = 0;
  const matchedCriteria = [];
  const unmatchedCriteria = [];
  const unknownCriteria = [];

  // 1. State Location Match (25 Points)
  const locWeight = 25;
  totalWeight += locWeight;
  if (userProfile.state) {
    const locations = scheme.eligibility?.locations || [];
    const isPanIndia = scheme.state === 'Pan-India' || scheme.state === 'All India' || locations.includes('Pan-India') || locations.includes('All India');
    const isStateMatch = isPanIndia || scheme.state?.toLowerCase() === userProfile.state.toLowerCase() || locations.some(l => l.toLowerCase() === userProfile.state.toLowerCase());

    if (isStateMatch) {
      earnedScore += locWeight;
      matchedCriteria.push(`Location: Scheme covers ${userProfile.state}`);
    } else {
      unmatchedCriteria.push(`Location: Scheme is specific to ${scheme.state || locations.join(', ')}`);
    }
  } else {
    unknownCriteria.push('State location not specified');
  }

  // 2. Occupation Match (30 Points)
  const occWeight = 30;
  totalWeight += occWeight;
  const reqOccupation = scheme.occupation || scheme.beneficiary;
  if (userProfile.occupation) {
    if (!reqOccupation || reqOccupation === 'Any' || reqOccupation === 'All') {
      earnedScore += occWeight;
      matchedCriteria.push('Occupation: Open to all occupations');
    } else {
      const uOcc = userProfile.occupation.toLowerCase();
      const rOcc = reqOccupation.toLowerCase();
      const isMatch = uOcc.includes(rOcc) || rOcc.includes(uOcc) ||
                      (uOcc.includes('farm') && (rOcc.includes('farm') || rOcc.includes('agri'))) ||
                      (uOcc.includes('student') && rOcc.includes('student')) ||
                      (uOcc.includes('vendor') && (rOcc.includes('vendor') || rOcc.includes('hawker')));

      if (isMatch) {
        earnedScore += occWeight;
        matchedCriteria.push(`Occupation: ${userProfile.occupation} matches target ${reqOccupation}`);
      } else {
        unmatchedCriteria.push(`Occupation: Scheme specifically targets ${reqOccupation}`);
      }
    }
  } else {
    unknownCriteria.push(`Occupation: Needs confirmation for ${reqOccupation || 'target beneficiaries'}`);
  }

  // 3. Income Limit Match (25 Points)
  const incWeight = 25;
  totalWeight += incWeight;
  const maxIncome = scheme.maxIncome !== undefined ? scheme.maxIncome : scheme.eligibility?.maxIncome;
  if (userProfile.annualIncome !== undefined && userProfile.annualIncome !== null && userProfile.annualIncome > 0) {
    if (maxIncome !== undefined && maxIncome !== null) {
      if (userProfile.annualIncome <= maxIncome) {
        earnedScore += incWeight;
        matchedCriteria.push(`Annual Income: ₹${userProfile.annualIncome.toLocaleString('en-IN')} within ₹${maxIncome.toLocaleString('en-IN')} limit`);
      } else {
        unmatchedCriteria.push(`Annual Income: ₹${userProfile.annualIncome.toLocaleString('en-IN')} exceeds ₹${maxIncome.toLocaleString('en-IN')} limit`);
      }
    } else {
      earnedScore += incWeight; // No income cap
      matchedCriteria.push('Income: No ceiling limit');
    }
  } else {
    unknownCriteria.push(`Income Limit: Up to ₹${maxIncome ? maxIncome.toLocaleString('en-IN') : 'No Limit'}`);
  }

  // 4. Age Range Match (20 Points)
  const ageWeight = 20;
  totalWeight += ageWeight;
  const minAge = scheme.minAge || 18;
  const maxAge = scheme.maxAge || 75;
  if (userProfile.age) {
    if (userProfile.age >= minAge && userProfile.age <= maxAge) {
      earnedScore += ageWeight;
      matchedCriteria.push(`Age: ${userProfile.age} years fits inside ${minAge}-${maxAge} bracket`);
    } else {
      unmatchedCriteria.push(`Age: ${userProfile.age} years outside required ${minAge}-${maxAge} age bracket`);
    }
  } else {
    unknownCriteria.push(`Age Requirement: ${minAge} to ${maxAge} years`);
  }

  const matchPercentage = Math.round((earnedScore / totalWeight) * 100);

  return {
    schemeId: scheme.id,
    schemeName: scheme.name,
    matchPercentage,
    earnedScore,
    totalWeight,
    matchedCriteria,
    unmatchedCriteria,
    unknownCriteria,
  };
}

module.exports = {
  calculateEligibilityScore,
};
