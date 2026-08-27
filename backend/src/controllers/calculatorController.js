const { isPositiveNumber, isNonNegativeNumber } = require('../utils/validators');

/**
 * Calculates loan EMI with moratorium interest capitalization.
 * POST /api/v1/calculator/emi
 */
function calculateEmi(req, res, next) {
  try {
    const { principal, annualRate, tenureMonths, moratoriumMonths = 0 } = req.body || {};

    // Validation
    if (principal === undefined || !isPositiveNumber(principal)) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed: principal is required and must be a positive number greater than 0.'
      });
    }

    if (annualRate === undefined || !isNonNegativeNumber(annualRate)) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed: annualRate is required and must be a non-negative number.'
      });
    }

    if (tenureMonths === undefined || !isPositiveNumber(tenureMonths) || !Number.isInteger(Number(tenureMonths))) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed: tenureMonths is required and must be a positive integer.'
      });
    }

    if (moratoriumMonths === undefined || !isNonNegativeNumber(moratoriumMonths) || !Number.isInteger(Number(moratoriumMonths))) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed: moratoriumMonths must be a non-negative integer.'
      });
    }

    const nPrincipal = Number(principal);
    const nAnnualRate = Number(annualRate);
    const nTenureMonths = Number(tenureMonths);
    const nMoratoriumMonths = Number(moratoriumMonths);

    if (nMoratoriumMonths >= nTenureMonths) {
      return res.status(400).json({
        success: false,
        error: `Validation failed: moratoriumMonths (${nMoratoriumMonths}) must be strictly less than tenureMonths (${nTenureMonths}).`
      });
    }

    const monthlyRate = nAnnualRate > 0 ? (nAnnualRate / 12 / 100) : 0;
    const repaymentMonths = nTenureMonths - nMoratoriumMonths;

    // During moratorium, accrue simple monthly interest on principal
    const accruedInterest = nPrincipal * monthlyRate * nMoratoriumMonths;
    const loanAmount = nPrincipal + accruedInterest;

    let emi = 0;
    if (nAnnualRate === 0 || monthlyRate === 0) {
      emi = loanAmount / repaymentMonths;
    } else {
      const compoundFactor = Math.pow(1 + monthlyRate, repaymentMonths);
      emi = loanAmount * ((monthlyRate * compoundFactor) / (compoundFactor - 1));
    }

    const totalPayment = emi * repaymentMonths;
    const totalInterest = totalPayment - nPrincipal;

    return res.status(200).json({
      principal: Math.round(nPrincipal * 100) / 100,
      accruedInterest: Math.round(accruedInterest * 100) / 100,
      loanAmount: Math.round(loanAmount * 100) / 100,
      annualRate: nAnnualRate,
      tenureMonths: nTenureMonths,
      moratoriumMonths: nMoratoriumMonths,
      repaymentMonths,
      monthlyRate: Math.round(monthlyRate * 100000000) / 100000000,
      emi: Math.round(emi * 100) / 100,
      totalPayment: Math.round(totalPayment * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      currency: 'INR',
      moratoriumAssumption: 'Simple monthly interest is accrued during the moratorium period on the principal and capitalized into the total loan amount before standard EMI calculation across the remaining repayment tenure.'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  calculateEmi
};
