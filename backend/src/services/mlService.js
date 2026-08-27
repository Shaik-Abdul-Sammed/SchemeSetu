/**
 * ML Ranking Service
 * Communicates with external ML service if configured,
 * or gracefully falls back to deterministic multi-attribute sorting.
 */

/**
 * Deterministic fallback ranking:
 * 1. Lower interest rate first (ascending)
 * 2. Higher match score second (descending)
 * 3. Lower minimum loan third (ascending)
 */
function deterministicRank(schemes) {
  return [...schemes].sort((a, b) => {
    const rateA = Number(a.interestRate) || 0;
    const rateB = Number(b.interestRate) || 0;
    if (rateA !== rateB) {
      return rateA - rateB;
    }

    const scoreA = Number(a.matchScore) || 0;
    const scoreB = Number(b.matchScore) || 0;
    if (scoreA !== scoreB) {
      return scoreB - scoreA;
    }

    const minLoanA = Number(a.minLoan) || 0;
    const minLoanB = Number(b.minLoan) || 0;
    return minLoanA - minLoanB;
  });
}

/**
 * Ranks eligible schemes using ML ranking service or fallback.
 * @param {Array<Object>} schemes - List of eligible schemes with matchScore
 * @param {Object} userInput - User parameters (projectType, cost, income, education, location)
 * @returns {Promise<Array<Object>>} Ranked schemes
 */
async function rankSchemes(schemes, userInput) {
  if (!Array.isArray(schemes) || schemes.length <= 1) {
    return schemes || [];
  }

  const mlServiceUrl = process.env.ML_SERVICE_URL;

  if (mlServiceUrl && mlServiceUrl.trim() !== '') {
    try {
      const endpoint = `${mlServiceUrl.replace(/\/+$/, '')}/api/rank`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schemes, userInput }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.rankedSchemes) && data.rankedSchemes.length > 0) {
          return data.rankedSchemes;
        }
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch (err) {
      // ML Service unreachable or timed out - graceful fallback
      // Log info once without crashing
      // console.warn(`[MLService] External ML service at ${mlServiceUrl} unavailable: ${err.message}. Using deterministic ranking fallback.`);
    }
  }

  // Fallback to deterministic sorting
  return deterministicRank(schemes);
}

module.exports = {
  rankSchemes,
  deterministicRank
};
