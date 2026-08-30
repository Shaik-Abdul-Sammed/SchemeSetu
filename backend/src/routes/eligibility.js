const express = require('express');
const router = express.Router();
const { matchAllSchemes, evaluateSchemeForApplicant } = require('../services/matchingEngine');
const schemesData = require('../data/schemesData');

// POST /api/v1/eligibility/check - Calculate scheme match & recommendations
router.post('/check', (req, res) => {
  try {
    const {
      age,
      gender,
      casteCategory,
      disability,
      maritalStatus,
      annualIncome,
      bplStatus,
      occupation,
      state,
      areaType,
      education,
      projectCost,
      loanRequirement
    } = req.body;

    // Validation
    if (age === undefined || annualIncome === undefined || (!occupation && !casteCategory)) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields for eligibility check: 'age' and 'annualIncome' are required."
      });
    }

    const ageNum = Number(age);
    const incomeNum = Number(annualIncome);

    if (isNaN(ageNum) || ageNum < 0 || ageNum > 120) {
      return res.status(400).json({
        success: false,
        error: "Invalid age value provided."
      });
    }

    if (isNaN(incomeNum) || incomeNum < 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid annual income value provided."
      });
    }

    const matched = matchAllSchemes(req.body);

    // Provide complete dual format for seamless backward compatibility and modern explainability
    const results = matched.recommendations.map(rec => {
      const scheme = schemesData.find(s => s.id === rec.schemeId) || {};
      return {
        schemeId: rec.schemeId,
        schemeName: rec.schemeName,
        shortName: rec.shortName,
        category: rec.category,
        department: rec.department,
        matchScore: rec.matchScore,
        eligibilityStatus: rec.eligibilityStatus,
        financialStatus: rec.eligibilityStatus,
        isEligible: rec.eligibilityStatus === 'Eligible' || rec.eligibilityStatus === 'Potentially Eligible',
        matchReasons: rec.matchedCriteria,
        disqualifyReasons: rec.failedCriteria,
        whyRecommended: rec.whyRecommended,
        nextAction: rec.nextAction,
        benefits: scheme.benefits,
        summary: scheme.summary,
        officialUrl: scheme.officialSourceUrl,
        officialApplicationPortal: scheme.officialApplicationPortal,
        dataStatus: scheme.dataStatus,
        scheme: {
          id: rec.schemeId,
          name: rec.schemeName,
          category: rec.category,
          department: rec.department,
          maxLoan: scheme.maxLoan,
          subsidy: scheme.scSubsidyPercentage || scheme.subsidyPercentage || 0,
          benefits: scheme.benefits,
          summary: scheme.summary
        },
        breakdown: rec.breakdown
      };
    });

    return res.status(200).json({
      success: true,
      count: results.length,
      totalEvaluated: schemesData.length,
      eligibleCount: matched.eligibleCount,
      eligibleSchemesCount: matched.eligibleCount,
      applicantSummary: matched.applicantSummary,
      results,
      recommendations: results,
      disclaimer: matched.disclaimer
    });
  } catch (err) {
    console.error("Eligibility check error:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error during eligibility calculation."
    });
  }
});

// GET /api/v1/eligibility/scheme/:id - Check single scheme eligibility
router.post('/scheme/:id', (req, res) => {
  try {
    const scheme = schemesData.find(s => s.id === req.params.id);
    if (!scheme) {
      return res.status(404).json({ success: false, error: 'Scheme not found.' });
    }
    const evaluation = evaluateSchemeForApplicant(scheme, req.body || {});
    return res.status(200).json({ success: true, evaluation });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Internal error evaluating scheme.' });
  }
});

module.exports = router;
