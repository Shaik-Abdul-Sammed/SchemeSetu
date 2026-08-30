const express = require('express');
const router = express.Router();
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
      landOwner
    } = req.body;

    // Validation
    if (age === undefined || annualIncome === undefined || !occupation) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields for eligibility check: 'age', 'annualIncome', and 'occupation' are required."
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

    const results = schemesData.map(scheme => {
      let score = 50; // base score
      const matchReasons = [];
      const disqualifyReasons = [];

      // Age criteria
      if (ageNum >= scheme.minAge && ageNum <= scheme.maxAge) {
        score += 15;
        matchReasons.push(`Age ${ageNum} is within eligible age bracket (${scheme.minAge} - ${scheme.maxAge} years).`);
      } else {
        score -= 30;
        disqualifyReasons.push(`Age ${ageNum} is outside required age bracket (${scheme.minAge} - ${scheme.maxAge} years).`);
      }

      // Income criteria
      if (incomeNum <= scheme.maxIncome) {
        score += 20;
        matchReasons.push(`Annual income ₹${incomeNum.toLocaleString('en-IN')} is within maximum income ceiling of ₹${scheme.maxIncome.toLocaleString('en-IN')}.`);
      } else {
        score -= 35;
        disqualifyReasons.push(`Annual income ₹${incomeNum.toLocaleString('en-IN')} exceeds maximum income ceiling of ₹${scheme.maxIncome.toLocaleString('en-IN')}.`);
      }

      // Gender criteria
      if (scheme.gender === 'All') {
        score += 10;
        matchReasons.push(`Scheme is open to all genders.`);
      } else if (gender && scheme.gender.toLowerCase() === gender.toLowerCase()) {
        score += 15;
        matchReasons.push(`Gender '${gender}' matches scheme beneficiary requirements.`);
      } else if (gender && scheme.gender.toLowerCase() !== gender.toLowerCase()) {
        score -= 40;
        disqualifyReasons.push(`Scheme is exclusively for ${scheme.gender} beneficiaries.`);
      }

      // Occupation criteria
      if (scheme.occupation === 'Any') {
        score += 10;
        matchReasons.push(`Scheme is open to all occupations.`);
      } else if (occupation && scheme.occupation.toLowerCase() === occupation.toLowerCase()) {
        score += 20;
        matchReasons.push(`Occupation '${occupation}' directly matches scheme target group.`);
      } else if (occupation && scheme.occupation.toLowerCase() !== occupation.toLowerCase()) {
        score -= 15;
        disqualifyReasons.push(`Scheme specifically targets '${scheme.occupation}' occupation.`);
      }

      // BPL / Social Category Boosts
      if (bplStatus === 'Yes' && (scheme.beneficiary.toLowerCase().includes('bpl') || scheme.beneficiary.toLowerCase().includes('low income') || scheme.beneficiary.toLowerCase().includes('homeless'))) {
        score += 15;
        matchReasons.push(`BPL Status confirmed, matching low-income target criteria.`);
      }

      // Social Category & SC Priority Boosts
      if (casteCategory) {
        const catUpper = String(casteCategory).toUpperCase();
        if (catUpper === 'SC') {
          if (scheme.id === 'dalit-bandhu' || scheme.id === 'stand-up-india' || (scheme.tags && scheme.tags.includes('sc st obc'))) {
            score += 25;
            matchReasons.push(`Scheduled Caste (SC) priority category directly matches specialized welfare grant/credit provisions.`);
          }
        } else if (catUpper === 'ST') {
          if (scheme.id === 'pm-vishwakarma' || scheme.id === 'stand-up-india' || (scheme.tags && scheme.tags.includes('sc st obc'))) {
            score += 20;
            matchReasons.push(`Scheduled Tribe (ST) category matches specialized target subsidy criteria.`);
          }
        }
      }

      // Financial Limits (Loan / Project Cost) - Data Driven
      const reqCost = Number(req.body.projectCost || req.body.loanRequirement || req.body.cost || 0);
      let financialStatus = "Within Supported Range";
      let financialDetails = {
        requestedAmount: reqCost > 0 ? reqCost : null,
        schemeMinLimit: scheme.minLoan !== undefined ? Number(scheme.minLoan) : null,
        schemeMaxLimit: scheme.maxLoan !== undefined ? Number(scheme.maxLoan) : (scheme.maxBenefit || null)
      };

      if (reqCost > 0) {
        const minL = financialDetails.schemeMinLimit !== null ? financialDetails.schemeMinLimit : 0;
        const maxL = financialDetails.schemeMaxLimit !== null ? financialDetails.schemeMaxLimit : null;

        if (maxL !== null && reqCost > maxL) {
          financialStatus = "Exceeds Scheme Limit";
          disqualifyReasons.push(`Requested amount ₹${reqCost.toLocaleString('en-IN')} exceeds the maximum scheme financial ceiling of ₹${maxL.toLocaleString('en-IN')}.`);
          score -= 20;
        } else if (minL > 0 && reqCost < minL) {
          financialStatus = "Below Minimum Limit";
          disqualifyReasons.push(`Requested amount ₹${reqCost.toLocaleString('en-IN')} is below the minimum required project size of ₹${minL.toLocaleString('en-IN')}.`);
          score -= 15;
        } else if (maxL !== null) {
          financialStatus = "Eligible - Within Supported Range";
          matchReasons.push(`Requested capital ₹${reqCost.toLocaleString('en-IN')} is within scheme limits (₹${minL.toLocaleString('en-IN')} to ₹${maxL.toLocaleString('en-IN')}).`);
          score += 15;
        } else {
          financialStatus = "Limit not specified in available scheme data";
        }
      } else {
        financialStatus = "No specific loan limit requested";
      }

      if (landOwner === 'Yes' && scheme.id === 'pm-kisan') {
        score += 15;
        matchReasons.push(`Land ownership confirmed for agricultural grant eligibility.`);
      }

      // Normalize score between 0 and 100
      const finalScore = Math.max(0, Math.min(100, score));
      const isEligible = finalScore >= 55 && (disqualifyReasons.length === 0 || (disqualifyReasons.length === 1 && financialStatus === 'Exceeds Scheme Limit'));

      let statusText = "Highly Recommended";
      if (financialStatus === "Exceeds Scheme Limit") {
        statusText = "Partially Eligible (Amount Exceeds Scheme Cap)";
      } else if (finalScore >= 80) {
        statusText = "Highly Recommended";
      } else if (finalScore >= 60) {
        statusText = "Potentially Eligible";
      } else if (finalScore >= 40) {
        statusText = "Moderate Match";
      } else {
        statusText = "Low Match / Criteria Mismatch";
      }

      return {
        scheme,
        isEligible,
        matchScore: finalScore,
        eligibilityStatus: statusText,
        financialStatus,
        financialDetails,
        disclaimer: "Based on the official scheme criteria, you may be eligible.",
        matchReasons,
        disqualifyReasons
      };
    });

    // Sort by match score descending
    results.sort((a, b) => b.matchScore - a.matchScore);

    const eligibleSchemes = results.filter(r => r.isEligible);

    return res.status(200).json({
      success: true,
      profile: {
        age: ageNum,
        gender,
        casteCategory,
        annualIncome: incomeNum,
        occupation,
        state: state || 'Pan-India',
        bplStatus
      },
      totalEvaluated: schemesData.length,
      recommendationsCount: eligibleSchemes.length,
      eligibleSchemesCount: eligibleSchemes.length,
      recommendations: results,
      results: results
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Error processing eligibility checks.",
      message: error.message
    });
  }
});

module.exports = router;
