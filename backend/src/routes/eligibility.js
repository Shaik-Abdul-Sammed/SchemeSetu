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

      if (casteCategory && (casteCategory === 'SC' || casteCategory === 'ST' || casteCategory === 'OBC') && scheme.tags.includes('sc st obc')) {
        score += 15;
        matchReasons.push(`Social category '${casteCategory}' matches scholarship/reservation criteria.`);
      }

      if (landOwner === 'Yes' && scheme.id === 'pm-kisan') {
        score += 15;
        matchReasons.push(`Land ownership confirmed for agricultural grant eligibility.`);
      }

      // Normalize score between 0 and 100
      const finalScore = Math.max(0, Math.min(100, score));
      const isEligible = finalScore >= 60 && disqualifyReasons.length === 0;

      let statusText = "High Match - Highly Recommended";
      if (finalScore >= 80) statusText = "Highly Recommended";
      else if (finalScore >= 60) statusText = "Potentially Eligible";
      else if (finalScore >= 40) statusText = "Moderate Match";
      else statusText = "Low Match / Criteria Mismatch";

      return {
        scheme,
        isEligible,
        matchScore: finalScore,
        eligibilityStatus: statusText,
        disclaimer: "Based on the information provided, you may be eligible.",
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
      recommendations: results
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
