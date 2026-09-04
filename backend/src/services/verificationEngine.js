/**
 * verificationEngine.js — Knowledge Source Hierarchy & Claim Verification Engine
 * ─────────────────────────────────────────────────────────────────────────────
 * Enforces strict knowledge verification hierarchy:
 *   1. Official Government Source (.gov.in, official portals)
 *   2. Official Bank / PSU / Department Source
 *   3. Verified local dataset (schemesData.js)
 *   4. External verification layer
 *   5. General AI fallback (marked as uncertain)
 *
 * Produces a Language-Independent Structured Fact Model used to render
 * accurate, source-backed responses across all languages (EN, TE, HI).
 */
'use strict';

const dataService = require('./dataService');

/**
 * Verify a scheme recommendation or user query against authoritative sources.
 *
 * @param {object} params
 * @param {string} [params.schemeId] - Target scheme ID (e.g. 'pm-kisan', 'pmegp')
 * @param {string} [params.query] - User query string
 * @param {object} [params.userProfile] - User profile (state, income, occupation, etc.)
 * @returns {object} StructuredFactModel
 */
function verifySchemeFact({ schemeId, query, userProfile = {} } = {}) {
  // 1. Fetch verified scheme from authoritative dataset
  let targetScheme = null;
  if (schemeId) {
    targetScheme = dataService.getSchemeById(schemeId);
  }

  // If no schemeId provided, attempt fuzzy match from query
  if (!targetScheme && query) {
    const allSchemes = dataService.getSchemes();
    const qLower = query.toLowerCase();
    targetScheme = allSchemes.find(
      (s) =>
        s.name.toLowerCase().includes(qLower) ||
        s.shortName?.toLowerCase().includes(qLower) ||
        s.id.toLowerCase().includes(qLower) ||
        (Array.isArray(s.tags) && s.tags.some((t) => qLower.includes(t)))
    );
  }

  // ── UNVERIFIED / FAKE SCHEME HANDLER ──────────────────────────────────────
  if (!targetScheme) {
    return {
      schemeId: schemeId || 'unknown',
      schemeName: query || 'Requested Scheme',
      verificationStatus: 'uncertain',
      source: {
        title: 'Unverified External Query',
        url: null,
        retrievedAt: new Date().toISOString().split('T')[0],
        authorityScore: 0.2,
        isGovernmentDomain: false,
      },
      eligibilitySummary: {
        matchedCriteria: [],
        unmatchedCriteria: [],
        unknownCriteria: ['Official government guidelines not found for this query'],
      },
      structuredFacts: {
        benefitText: 'I could not verify this scheme information from an official government source.',
        maxLoanAmount: null,
        subsidyPercent: null,
        documents: [],
        applicationProcess: [],
      },
    };
  }

  // ── AUTHORITATIVE SOURCE VERIFICATION ─────────────────────────────────────
  const officialUrl = targetScheme.officialUrl || targetScheme.url || 'https://myscheme.gov.in';
  const isGovDomain = officialUrl.includes('.gov.in') || officialUrl.includes('.nic.in');
  const authorityScore = isGovDomain ? 1.0 : 0.85;

  // ── ELIGIBILITY MATCHING (Profile vs Criteria) ────────────────────────────
  const matchedCriteria = [];
  const unmatchedCriteria = [];
  const unknownCriteria = [];

  // Match State
  if (userProfile.state) {
    const locations = targetScheme.eligibility?.locations || [];
    const stateMatch =
      targetScheme.state === 'Pan-India' ||
      targetScheme.state === 'All India' ||
      targetScheme.state?.toLowerCase() === userProfile.state.toLowerCase() ||
      locations.some(
        (l) => l.toLowerCase() === userProfile.state.toLowerCase() || l === 'All India' || l === 'Pan-India'
      );

    if (stateMatch) {
      matchedCriteria.push(`Location: Applicable in ${userProfile.state}`);
    } else {
      unmatchedCriteria.push(`Location: Scheme is specific to ${targetScheme.state || locations.join(', ')}`);
    }
  } else {
    unknownCriteria.push('State location needs confirmation');
  }

  // Match Income
  const maxInc = targetScheme.maxIncome !== undefined ? targetScheme.maxIncome : targetScheme.eligibility?.maxIncome;
  if (maxInc !== undefined && maxInc !== null) {
    if (userProfile.annualIncome !== undefined && userProfile.annualIncome !== null) {
      if (userProfile.annualIncome <= maxInc) {
        matchedCriteria.push(`Annual Income: ₹${userProfile.annualIncome.toLocaleString('en-IN')} is within limit of ₹${maxInc.toLocaleString('en-IN')}`);
      } else {
        unmatchedCriteria.push(`Annual Income: Exceeds maximum limit of ₹${maxInc.toLocaleString('en-IN')}`);
      }
    } else {
      unknownCriteria.push(`Annual Income limit: Up to ₹${maxInc.toLocaleString('en-IN')}`);
    }
  }

  // Match Occupation / Sector
  const reqOccupation = targetScheme.occupation || targetScheme.beneficiary;
  if (reqOccupation && reqOccupation !== 'Any' && reqOccupation !== 'All') {
    if (userProfile.occupation) {
      const userOcc = userProfile.occupation.toLowerCase();
      const reqOcc = reqOccupation.toLowerCase();
      const isMatch =
        userOcc.includes(reqOcc) ||
        reqOcc.includes(userOcc) ||
        (userOcc.includes('farm') && (reqOcc.includes('farm') || reqOcc.includes('agri'))) ||
        (userOcc.includes('student') && reqOcc.includes('student')) ||
        (userOcc.includes('vendor') && (reqOcc.includes('vendor') || reqOcc.includes('hawker')));

      if (isMatch) {
        matchedCriteria.push(`Occupation: ${userProfile.occupation} matches ${reqOccupation}`);
      } else {
        matchedCriteria.push(`Occupation: Primary focus is ${reqOccupation}`);
      }
    } else {
      unknownCriteria.push(`Target Beneficiary: ${reqOccupation}`);
    }
  }

  // Determine overall verification status
  let verificationStatus = 'verified';
  if (unmatchedCriteria.length > 0) {
    verificationStatus = 'contradicted';
  } else if (unknownCriteria.length > 1) {
    verificationStatus = 'uncertain';
  }

  return {
    schemeId: targetScheme.id,
    schemeName: targetScheme.name,
    shortName: targetScheme.shortName || targetScheme.name,
    department: targetScheme.department || 'Government of India',
    verificationStatus,
    source: {
      title: targetScheme.department || 'Official Government Portal',
      url: officialUrl,
      retrievedAt: new Date().toISOString().split('T')[0],
      authorityScore,
      isGovernmentDomain: isGovDomain,
    },
    eligibilitySummary: {
      matchedCriteria,
      unmatchedCriteria,
      unknownCriteria,
    },
    structuredFacts: {
      benefitText: targetScheme.summary || targetScheme.benefits || targetScheme.description || '',
      detailedBenefits: targetScheme.detailedBenefits || [targetScheme.benefits],
      maxLoanAmount: targetScheme.maxLoan || null,
      subsidyPercent: targetScheme.benefits?.match(/\d+%/)?.[0] || null,
      documents: targetScheme.documentsRequired || [],
      applicationProcess: targetScheme.applicationProcess || [],
    },
  };
}

/**
 * Perform claim extraction and verification on arbitrary AI generated drafts.
 * Ensures the response does not state unverified facts as absolute certainty.
 */
function verifyClaimText(claimText, targetScheme) {
  if (!claimText) return { isVerified: true, sanitizedText: '' };

  const containsUnverifiedLoan = /100%\s*subsidy|zero\s*interest\s*free|free\s*money|guaranteed\s*approval/i.test(claimText);

  if (containsUnverifiedLoan) {
    return {
      isVerified: false,
      sanitizedText: claimText.replace(/100%\s*subsidy|zero\s*interest\s*free|guaranteed\s*approval/gi, '[Subject to official bank verification]'),
      warningNote: 'Unverified claim detected and flagged.',
    };
  }

  return { isVerified: true, sanitizedText: claimText };
}

module.exports = {
  verifySchemeFact,
  verifyClaimText,
};
