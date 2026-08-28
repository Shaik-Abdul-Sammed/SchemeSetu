const dataService = require('../services/dataService');
const mlService = require('../services/mlService');
const { isNonEmptyString, isPositiveNumber, isNonNegativeNumber } = require('../utils/validators');

/**
 * Calculates a deterministic match score (0-100) for an eligible scheme against user criteria.
 */
function calculateMatchScore(scheme, criteria) {
  let score = 0;
  const userIncome = Number(criteria.income);
  const userCost = Number(criteria.cost);
  const userEdu = String(criteria.education || '').toLowerCase().trim();
  const userProjectType = String(criteria.projectType || '').toLowerCase().trim();
  const userLocation = String(criteria.location || '').toLowerCase().trim();

  // 1. Income match: 20 points max
  const maxIncome = scheme.eligibility && scheme.eligibility.maxIncome ? scheme.eligibility.maxIncome : 500000;
  if (userIncome <= maxIncome) {
    const incomeRatio = maxIncome > 0 ? (maxIncome - userIncome) / maxIncome : 1;
    score += Math.round(15 + (incomeRatio * 5));
  } else {
    score += 5;
  }

  // 2. Loan amount fit: 25 points max
  const minL = Number(scheme.minLoan) || 0;
  const maxL = Number(scheme.maxLoan) || 1000000;
  if (userCost >= minL && userCost <= maxL) {
    const midPoint = (minL + maxL) / 2;
    const distanceRatio = maxL > minL ? 1 - (Math.abs(userCost - midPoint) / (maxL - minL)) : 1;
    score += Math.round(20 + (distanceRatio * 5));
  } else {
    score += 5;
  }

  // 3. Education match: 20 points max
  const schemeEdu = (scheme.eligibility && Array.isArray(scheme.eligibility.education))
    ? scheme.eligibility.education
    : [];
  if (schemeEdu.length === 0 || schemeEdu.includes('any') || schemeEdu.includes('all') || schemeEdu.includes('none')) {
    score += 20;
  } else if (schemeEdu.some(e => e.includes(userEdu) || userEdu.includes(e))) {
    score += 20;
  } else {
    score += 10;
  }

  // 4. Project Type match: 20 points max
  const schemeProjectTypes = Array.isArray(scheme.projectTypes) ? scheme.projectTypes : [];
  if (schemeProjectTypes.length === 0 || schemeProjectTypes.includes('all') || schemeProjectTypes.includes('any')) {
    score += 20;
  } else if (schemeProjectTypes.some(pt => pt.includes(userProjectType) || userProjectType.includes(pt))) {
    score += 20;
  } else {
    score += 8;
  }

  // 5. Location match: 15 points max
  const schemeLocations = (scheme.eligibility && Array.isArray(scheme.eligibility.locations))
    ? scheme.eligibility.locations.map(l => l.toLowerCase())
    : ['all india'];
  if (schemeLocations.includes('all india') || schemeLocations.includes('national') || schemeLocations.length === 0) {
    score += 15;
  } else if (schemeLocations.some(loc => loc.includes(userLocation) || userLocation.includes(loc))) {
    score += 15;
  } else {
    score += 5;
  }

  return Math.min(100, Math.max(0, score));
}

function isSchemeEligible(scheme, criteria) {
  const userIncome = Number(criteria.income);
  const userCost = Number(criteria.cost);

  const maxIncome = scheme.eligibility && typeof scheme.eligibility.maxIncome === 'number'
    ? scheme.eligibility.maxIncome
    : 500000;
  if (userIncome > maxIncome) {
    return false;
  }

  const minL = Number(scheme.minLoan) || 0;
  const maxL = Number(scheme.maxLoan) || Infinity;
  if (userCost < minL || userCost > maxL) {
    return false;
  }

  return true;
}

/**
 * POST /api/v1/schemes/recommend
 */
async function recommendSchemes(req, res, next) {
  try {
    const { projectType, cost, income, education, location } = req.body || {};

    if (!isNonEmptyString(projectType)) {
      return res.status(400).json({ success: false, error: 'Validation failed: projectType is required and must be a non-empty string.' });
    }
    if (!isPositiveNumber(cost)) {
      return res.status(400).json({ success: false, error: 'Validation failed: cost is required and must be a positive number greater than 0.' });
    }
    if (!isNonNegativeNumber(income)) {
      return res.status(400).json({ success: false, error: 'Validation failed: income is required and must be a non-negative number.' });
    }

    const userInput = {
      projectType: String(projectType).trim(),
      cost: Number(cost),
      income: Number(income),
      education: String(education || 'graduate').trim(),
      location: String(location || 'Telangana').trim()
    };

    const allSchemes = dataService.getSchemes();
    const eligibleSchemes = allSchemes.filter(scheme => isSchemeEligible(scheme, userInput));

    if (eligibleSchemes.length === 0) {
      return res.status(200).json({
        recommendations: [],
        totalEligible: 0,
        message: 'No eligible schemes found for the provided criteria'
      });
    }

    const scoredSchemes = eligibleSchemes.map(scheme => ({
      ...scheme,
      matchScore: calculateMatchScore(scheme, userInput)
    }));

    const rankedSchemes = await mlService.rankSchemes(scoredSchemes, userInput);
    const top3 = rankedSchemes.slice(0, 3);

    return res.status(200).json({
      recommendations: top3,
      totalEligible: scoredSchemes.length,
      message: 'Eligible schemes found successfully'
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/schemes
 */
function getSchemes(req, res, next) {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      projectType,
      location,
      minLoan,
      maxLoan,
      education,
      search,
      sort
    } = req.query;

    let schemes = dataService.getSchemes();

    if (category) {
      const catLower = String(category).toLowerCase();
      schemes = schemes.filter(s => s.category && s.category.toLowerCase().includes(catLower));
    }

    if (projectType) {
      const ptLower = String(projectType).toLowerCase();
      schemes = schemes.filter(s =>
        s.projectTypes && s.projectTypes.some(pt => pt.toLowerCase().includes(ptLower))
      );
    }

    if (location) {
      const locLower = String(location).toLowerCase();
      schemes = schemes.filter(s =>
        s.eligibility && s.eligibility.locations &&
        s.eligibility.locations.some(l => l.toLowerCase().includes(locLower) || l.toLowerCase() === 'all india')
      );
    }

    if (minLoan !== undefined && !isNaN(Number(minLoan))) {
      const minL = Number(minLoan);
      schemes = schemes.filter(s => s.maxLoan >= minL);
    }

    if (maxLoan !== undefined && !isNaN(Number(maxLoan))) {
      const maxL = Number(maxLoan);
      schemes = schemes.filter(s => s.minLoan <= maxL);
    }

    if (search) {
      const searchLower = String(search).toLowerCase();
      schemes = schemes.filter(s =>
        (s.name && s.name.toLowerCase().includes(searchLower)) ||
        (s.description && s.description.toLowerCase().includes(searchLower)) ||
        (s.category && s.category.toLowerCase().includes(searchLower))
      );
    }

    if (sort === 'name_asc') {
      schemes.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'name_desc') {
      schemes.sort((a, b) => b.name.localeCompare(a.name));
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const total = schemes.length;
    const totalPages = Math.ceil(total / limitNum) || 1;
    const offset = (pageNum - 1) * limitNum;
    const paginated = schemes.slice(offset, offset + limitNum);

    return res.status(200).json({
      schemes: paginated,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/schemes/:id
 */
function getSchemeById(req, res, next) {
  try {
    const { id } = req.params;
    const scheme = dataService.getSchemeById(id);

    if (!scheme) {
      return res.status(404).json({
        success: false,
        error: `Scheme with ID '${id}' not found`
      });
    }

    return res.status(200).json(scheme);
  } catch (err) {
    next(err);
  }
}

function compareSchemes(req, res, next) {
  try {
    const { ids } = req.query;
    if (!ids || !ids.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter "ids" comma-separated list is required.'
      });
    }

    const idList = ids.split(',').map(i => i.trim().toLowerCase());
    const allResult = dataService.getSchemes();
    const list = Array.isArray(allResult) ? allResult : (allResult.schemes || allResult.data || []);
    const matched = list.filter(s => idList.includes(String(s.id).toLowerCase()));

    return res.status(200).json({
      success: true,
      count: matched.length,
      schemes: matched
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  recommendSchemes,
  getSchemes,
  getSchemeById,
  compareSchemes
};
