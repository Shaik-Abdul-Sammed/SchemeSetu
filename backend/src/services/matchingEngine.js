/**
 * SchemeSetu Transparent Deterministic Eligibility & Matching Engine
 * Implements rule-based, explainable scoring for Indian welfare schemes and credit facilities.
 * Clearly separates verified government criteria from estimated user match scores.
 */

const schemesData = require('../data/schemesData');

/**
 * Evaluate single scheme against applicant profile
 */
function evaluateSchemeForApplicant(scheme, profile = {}) {
  const breakdown = [];
  const matchedCriteria = [];
  const failedCriteria = [];
  const missingInformation = [];
  
  let score = 0;
  let totalWeights = 0;
  let isDisqualified = false;

  const age = Number(profile.age);
  const income = Number(profile.annualIncome !== undefined ? profile.annualIncome : profile.income);
  const category = (profile.casteCategory || profile.category || 'General').trim();
  const gender = (profile.gender || 'All').trim();
  const state = (profile.state || 'Pan-India').trim();
  const occupation = (profile.occupation || 'Any').trim();
  const sector = (profile.businessType || profile.sector || profile.projectCategory || 'General').trim();
  const projectCost = Number(profile.projectCost || 0);
  const loanRequired = Number(profile.loanRequirement || profile.loanAmount || 0);

  // 1. Age Evaluation (Weight: 15)
  totalWeights += 15;
  if (!isNaN(age) && age >= (scheme.minAge || 18) && age <= (scheme.maxAge || 75)) {
    score += 15;
    matchedCriteria.push(`Age ${age} is within eligible range (${scheme.minAge || 18} - ${scheme.maxAge || 75} years).`);
    breakdown.push({
      factor: 'Age Eligibility',
      userValue: `${age} years`,
      schemeRequirement: `${scheme.minAge || 18} to ${scheme.maxAge || 75} years`,
      result: 'PASS'
    });
  } else if (!isNaN(age)) {
    isDisqualified = true;
    failedCriteria.push(`Age ${age} is outside eligible range (${scheme.minAge || 18} - ${scheme.maxAge || 75} years).`);
    breakdown.push({
      factor: 'Age Eligibility',
      userValue: `${age} years`,
      schemeRequirement: `${scheme.minAge || 18} to ${scheme.maxAge || 75} years`,
      result: 'FAIL'
    });
  } else {
    missingInformation.push('Age verification required.');
    breakdown.push({
      factor: 'Age Eligibility',
      userValue: 'Not specified',
      schemeRequirement: `${scheme.minAge || 18} to ${scheme.maxAge || 75} years`,
      result: 'WARN'
    });
  }

  // 2. Social Category / Caste Evaluation (Weight: 20)
  totalWeights += 20;
  const eligibleCastes = scheme.casteEligibility || ['General', 'OBC', 'SC', 'ST', 'Minority'];
  const isCasteMatch = eligibleCastes.some(c => c.toLowerCase() === category.toLowerCase() || eligibleCastes.includes('General') || eligibleCastes.includes('All'));
  
  if (isCasteMatch) {
    score += 20;
    const schemeCat = (scheme.category || '').toLowerCase();
    if (category.toLowerCase() === 'sc' && (scheme.scSubsidyPercentage > 0 || schemeCat.includes('sc') || scheme.id === 'dalit-bandhu' || scheme.id === 'cegssc' || scheme.id === 'vcf-sc' || scheme.id === 'nssh')) {
      matchedCriteria.push(`Special Category SC matched with maximum subsidy/grant preference.`);
    } else {
      matchedCriteria.push(`Category '${category}' is eligible under scheme guidelines.`);
    }
    breakdown.push({
      factor: 'Social Category / Caste',
      userValue: category,
      schemeRequirement: eligibleCastes.join(', '),
      result: 'PASS'
    });
  } else {
    isDisqualified = true;
    failedCriteria.push(`Category '${category}' is not eligible. Scheme is exclusively for: ${eligibleCastes.join(', ')}.`);
    breakdown.push({
      factor: 'Social Category / Caste',
      userValue: category,
      schemeRequirement: eligibleCastes.join(', '),
      result: 'FAIL'
    });
  }

  // 3. Annual Family Income Evaluation (Weight: 20)
  totalWeights += 20;
  const maxInc = scheme.maxIncome || 10000000;
  if (!isNaN(income) && income <= maxInc) {
    score += 20;
    matchedCriteria.push(`Annual income ₹${income.toLocaleString('en-IN')} is within maximum ceiling of ₹${maxInc.toLocaleString('en-IN')}.`);
    breakdown.push({
      factor: 'Annual Family Income',
      userValue: `₹${income.toLocaleString('en-IN')}`,
      schemeRequirement: maxInc >= 10000000 ? 'No Upper Limit' : `Up to ₹${maxInc.toLocaleString('en-IN')}`,
      result: 'PASS'
    });
  } else if (!isNaN(income)) {
    isDisqualified = true;
    failedCriteria.push(`Annual income ₹${income.toLocaleString('en-IN')} exceeds the scheme maximum limit of ₹${maxInc.toLocaleString('en-IN')}.`);
    breakdown.push({
      factor: 'Annual Family Income',
      userValue: `₹${income.toLocaleString('en-IN')}`,
      schemeRequirement: `Up to ₹${maxInc.toLocaleString('en-IN')}`,
      result: 'FAIL'
    });
  }

  // 4. Geographic Scope / State Evaluation (Weight: 15)
  totalWeights += 15;
  const schemeState = (scheme.state || 'Pan-India').toLowerCase();
  if (scheme.level === 'Central' || schemeState === 'pan-india' || schemeState === state.toLowerCase()) {
    score += 15;
    matchedCriteria.push(`State/UT '${state}' is covered under ${scheme.level || 'Central'} scheme jurisdiction.`);
    breakdown.push({
      factor: 'Geographic Jurisdiction',
      userValue: state,
      schemeRequirement: scheme.state || 'Pan-India',
      result: 'PASS'
    });
  } else {
    isDisqualified = true;
    failedCriteria.push(`State '${state}' is outside the scheme's active jurisdiction (${scheme.state || 'Pan-India'}).`);
    breakdown.push({
      factor: 'Geographic Jurisdiction',
      userValue: state,
      schemeRequirement: scheme.state || 'Pan-India',
      result: 'FAIL'
    });
  }

  // 5. Project Cost & Financial Range Evaluation (Weight: 15)
  totalWeights += 15;
  let maxLoan = scheme.maxLoan || 10000000;
  if (scheme.id === 'nsfdc-educational-loan' || (scheme.category || '').toLowerCase().includes('education')) {
    const isAbroad = String(profile.studyLocation || profile.locationType || '').toLowerCase().includes('abroad') || Boolean(profile.studyAbroad);
    maxLoan = isAbroad ? (scheme.maxLoanAbroad || 3000000) : (scheme.maxLoanIndia || 2000000);
  }
  const maxProject = scheme.maxProjectCost || maxLoan || 10000000;
  const minLoan = scheme.minLoan || 0;

  if (projectCost > 0 && maxProject > 0 && projectCost > maxProject) {
    isDisqualified = true;
    failedCriteria.push(`Project cost (₹${projectCost.toLocaleString('en-IN')}) exceeds maximum scheme ceiling of ₹${maxProject.toLocaleString('en-IN')}.`);
    breakdown.push({
      factor: 'Project Cost Fit',
      userValue: `₹${projectCost.toLocaleString('en-IN')}`,
      schemeRequirement: `Up to ₹${maxProject.toLocaleString('en-IN')}`,
      result: 'FAIL'
    });
  } else if (loanRequired > 0 && projectCost > 0 && loanRequired > projectCost) {
    isDisqualified = true;
    failedCriteria.push(`Requested loan amount (₹${loanRequired.toLocaleString('en-IN')}) cannot exceed the total project cost (₹${projectCost.toLocaleString('en-IN')}).`);
    breakdown.push({
      factor: 'Loan vs Project Cost Consistency',
      userValue: `Loan: ₹${loanRequired.toLocaleString('en-IN')} | Project: ₹${projectCost.toLocaleString('en-IN')}`,
      schemeRequirement: `Requested loan <= Project cost`,
      result: 'FAIL'
    });
  } else if (loanRequired > 0 && maxLoan > 0 && loanRequired > maxLoan) {
    isDisqualified = true;
    failedCriteria.push(`Requested loan (₹${loanRequired.toLocaleString('en-IN')}) exceeds scheme limit of ₹${maxLoan.toLocaleString('en-IN')}.`);
    breakdown.push({
      factor: 'Loan Requirement Fit',
      userValue: `₹${loanRequired.toLocaleString('en-IN')}`,
      schemeRequirement: `Up to ₹${maxLoan.toLocaleString('en-IN')}`,
      result: 'FAIL'
    });
  } else {
    score += 15;
    matchedCriteria.push(`Financial parameters are within acceptable limits.`);
    breakdown.push({
      factor: 'Financial Parameters',
      userValue: `Project: ₹${projectCost.toLocaleString('en-IN')} | Loan: ₹${loanRequired.toLocaleString('en-IN')}`,
      schemeRequirement: maxLoan > 0 ? `Max Loan ₹${maxLoan.toLocaleString('en-IN')}` : 'Direct Assistance',
      result: 'PASS'
    });
  }

  // 6. Sector & Activity Match (Weight: 15)
  totalWeights += 15;
  const eligibleSectors = scheme.eligibleSectors || ['All Sectors'];
  const isSectorMatch = eligibleSectors.some(s => s.toLowerCase() === 'all sectors' || s.toLowerCase() === sector.toLowerCase() || sector.toLowerCase().includes(s.toLowerCase()));

  if (isSectorMatch) {
    score += 15;
    matchedCriteria.push(`Business sector '${sector}' aligns with supported activities.`);
    breakdown.push({
      factor: 'Activity / Sector Fit',
      userValue: sector,
      schemeRequirement: eligibleSectors.join(', '),
      result: 'PASS'
    });
  } else {
    score += 5;
    matchedCriteria.push(`Sector '${sector}' can be considered under general enterprise provisions.`);
    breakdown.push({
      factor: 'Activity / Sector Fit',
      userValue: sector,
      schemeRequirement: eligibleSectors.join(', '),
      result: 'WARN'
    });
  }

  // Final Match Score Calculation
  const finalPercentage = Math.min(100, Math.max(10, Math.round((score / totalWeights) * 100)));
  
  let eligibilityStatus = 'Potentially Eligible';
  const hasExceeds = failedCriteria.some(f => f.toLowerCase().includes('exceeds'));
  const hasHardCategoryOrAgeFail = failedCriteria.some(f => f.toLowerCase().includes('outside') || f.toLowerCase().includes('exclusively') || f.toLowerCase().includes('jurisdiction'));

  if (hasExceeds && !hasHardCategoryOrAgeFail) {
    eligibilityStatus = 'Exceeds Scheme Limit';
  } else if (isDisqualified || failedCriteria.length >= 2) {
    eligibilityStatus = 'Ineligible';
  } else if (finalPercentage >= 75 && failedCriteria.length === 0) {
    eligibilityStatus = 'Eligible';
  }

  // Actionable plain-language explanations
  let whyRecommended = `Matched based on demographic, income (₹${income.toLocaleString('en-IN')}), and sector parameters.`;
  if (scheme.scSubsidyPercentage > 0 && category.toLowerCase() === 'sc') {
    whyRecommended = `High recommendation for ${category} applicant: provides ${scheme.scSubsidyPercentage}% margin subsidy / grant support.`;
  }

  const nextAction = scheme.officialApplicationPortal 
    ? `Submit project proposal and KYC documents via ${scheme.officialApplicationPortal} or nearest nodal branch.`
    : 'Contact nearest District Welfare Office / Lead Bank branch for physical verification.';

  const crypto = require('crypto');
  const evaluatedAt = new Date().toISOString();
  const auditHash = crypto.createHash('sha256').update(JSON.stringify(breakdown) + evaluatedAt + (isDisqualified ? 'DISQUALIFIED' : 'ELIGIBLE')).digest('hex');

  return {
    schemeId: scheme.id,
    schemeName: scheme.name,
    shortName: scheme.shortName,
    department: scheme.department || scheme.officialMinistry,
    officialMinistry: scheme.officialMinistry,
    category: scheme.category,
    level: scheme.level,
    state: scheme.state,
    matchScore: isDisqualified ? 0 : finalPercentage,
    eligibilityStatus,
    matchedCriteria,
    failedCriteria,
    missingInformation,
    whyRecommended,
    nextAction,
    maxLoan: scheme.maxLoan,
    fundingCoveragePct: scheme.fundingCoveragePct || 90,
    maxFinancedAmount: projectCost > 0 ? Math.min(scheme.maxLoan || 5000000, Math.round(projectCost * ((scheme.fundingCoveragePct || 90) / 100))) : scheme.maxLoan,
    promoterContribution: projectCost > 0 ? Math.round(projectCost * (1 - ((scheme.fundingCoveragePct || 90) / 100))) : 0,
    interestRate: scheme.interestRate || 6.5,
    moratoriumMonths: scheme.moratoriumMonths || 0,
    repaymentTenureMonths: scheme.repaymentTenureMonths || 60,
    subsidyPercentage: scheme.scSubsidyPercentage || scheme.subsidyPercentage || 0,
    grantAmount: scheme.grantAmount || 0,
    requiredDocuments: scheme.documentsRequired || [],
    officialSourceUrl: scheme.officialSourceUrl,
    officialApplicationPortal: scheme.officialApplicationPortal,
    dataStatus: scheme.dataStatus || 'VERIFIED',
    dataSource: scheme.dataStatus === 'VERIFIED' ? 'OFFICIAL_VERIFIED_SNAPSHOT' : 'DEMO_DATA',
    sourceOrg: scheme.officialMinistry || 'Government of India',
    ruleVersion: '2026.1.0',
    effectiveDate: '2026-01-01',
    evaluatedAt,
    auditHash,
    breakdown
  };
}

/**
 * Match all schemes against applicant profile and return ranked recommendations
 */
function matchAllSchemes(profile = {}) {
  const evaluations = schemesData.map(scheme => evaluateSchemeForApplicant(scheme, profile));
  
  // Sort descending by match score
  evaluations.sort((a, b) => b.matchScore - a.matchScore);
  
  return {
    applicantSummary: {
      name: profile.name || 'Citizen Beneficiary',
      age: profile.age,
      category: profile.casteCategory || profile.category || 'General',
      annualIncome: profile.annualIncome || profile.income || 0,
      projectCost: profile.projectCost || 0,
      loanRequirement: profile.loanRequirement || profile.loanAmount || 0,
      state: profile.state || 'Pan-India',
      district: profile.district || 'All Districts'
    },
    totalSchemesEvaluated: schemesData.length,
    eligibleCount: evaluations.filter(e => e.eligibilityStatus === 'Eligible' || e.eligibilityStatus === 'Potentially Eligible').length,
    recommendations: evaluations,
    timestamp: new Date().toISOString(),
    disclaimer: "Estimated suitability based on rule-based algorithmic matching. Official eligibility is subject to physical document verification by the sanctioning government authority or bank."
  };
}

module.exports = {
  evaluateSchemeForApplicant,
  matchAllSchemes
};
