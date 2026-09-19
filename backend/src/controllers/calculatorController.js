const { isPositiveNumber, isNonNegativeNumber } = require('../utils/validators');

/**
 * Calculates loan EMI with moratorium interest capitalization.
 * POST /api/v1/calculator/emi
 */
function calculateEmi(req, res, next) {
  try {
    const body = req.body || {};
    const principal = body.principal;
    const annualRate = body.annualRate !== undefined ? body.annualRate : (body.annualInterestRate !== undefined ? body.annualInterestRate : body.interestRate);
    const tenureMonths = body.tenureMonths;
    const moratoriumMonths = body.moratoriumMonths !== undefined ? body.moratoriumMonths : 0;

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
        error: 'Validation failed: annualRate (or annualInterestRate / interestRate) is required and must be a non-negative number.'
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

    const moratoriumMode = (body.moratoriumMode || 'INTEREST_PAID_DURING_MORATORIUM').toUpperCase();
    const monthlyRate = nAnnualRate > 0 ? (nAnnualRate / 12 / 100) : 0;
    const repaymentMonths = nTenureMonths - nMoratoriumMonths;

    // Moratorium interest calculation based on explicit scheme rule
    const monthlyMoratoriumInterest = Math.round(nPrincipal * monthlyRate * 100) / 100;
    const accruedInterest = Math.round(nPrincipal * monthlyRate * nMoratoriumMonths * 100) / 100;

    let loanAmount = nPrincipal;
    if (moratoriumMode === 'INTEREST_CAPITALIZED') {
      loanAmount = nPrincipal + accruedInterest;
    }

    let emi = 0;
    if (nAnnualRate === 0 || monthlyRate === 0) {
      emi = loanAmount / repaymentMonths;
    } else {
      const compoundFactor = Math.pow(1 + monthlyRate, repaymentMonths);
      emi = loanAmount * ((monthlyRate * compoundFactor) / (compoundFactor - 1));
    }

    emi = Math.round(emi * 100) / 100;
    
    let totalPayment = 0;
    let totalInterest = 0;

    if (moratoriumMode === 'INTEREST_PAID_DURING_MORATORIUM') {
      totalPayment = Math.round(((emi * repaymentMonths) + accruedInterest) * 100) / 100;
      totalInterest = Math.round((totalPayment - nPrincipal) * 100) / 100;
    } else {
      totalPayment = Math.round((emi * repaymentMonths) * 100) / 100;
      totalInterest = Math.round((totalPayment - nPrincipal) * 100) / 100;
    }

    return res.status(200).json({
      principal: Math.round(nPrincipal * 100) / 100,
      monthlyMoratoriumInterest,
      accruedInterest,
      loanAmount: Math.round(loanAmount * 100) / 100,
      annualRate: nAnnualRate,
      tenureMonths: nTenureMonths,
      moratoriumMonths: nMoratoriumMonths,
      moratoriumMode,
      repaymentMonths,
      monthlyRate: Math.round(monthlyRate * 100000000) / 100000000,
      emi,
      totalPayment,
      totalInterest,
      currency: 'INR',
      moratoriumAssumption: moratoriumMode === 'INTEREST_PAID_DURING_MORATORIUM'
        ? 'Beneficiary pays simple monthly interest during moratorium period; EMI applies strictly to original principal across remaining tenure.'
        : 'Simple monthly interest accrued during moratorium is capitalized into principal prior to standard EMI calculation.'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  calculateEmi
};
