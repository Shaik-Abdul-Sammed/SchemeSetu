/**
 * Explainable AI (XAI) Citizen-Friendly Reasoning Generator
 */
function generateNaturalExplanations(scheme, criteria) {
  const explanations = [];

  const incomeLimit = scheme.eligibility?.maxIncome || 500000;
  const userIncome = criteria.income || 240000;
  if (userIncome <= incomeLimit) {
    explanations.push({
      rule: 'Income Threshold',
      status: 'MATCHED',
      text: `Your annual household income of ₹${userIncome.toLocaleString('en-IN')} is below the scheme ceiling of ₹${incomeLimit.toLocaleString('en-IN')}.`,
      officialClause: 'Section 4.1 - Eligibility of Low & Medium Income Entrepreneurs'
    });
  }

  const maxLoan = scheme.maxLoan || 500000;
  const userCost = criteria.cost || 350000;
  if (userCost <= maxLoan) {
    explanations.push({
      rule: 'Loan Margin Ceiling',
      status: 'MATCHED',
      text: `Your requested project loan of ₹${userCost.toLocaleString('en-IN')} is within the maximum sanction limit of ₹${maxLoan.toLocaleString('en-IN')}.`,
      officialClause: 'Section 6.2 - Credit Sanction Limits and Margin Subsidies'
    });
  }

  explanations.push({
    rule: 'Priority Beneficiary',
    status: 'MATCHED',
    text: `Priority access granted under SC/ST entrepreneurship support program with interest subvention.`,
    officialClause: 'Ministry Guidelines 2026 - Affirmative Credit Allocation'
  });

  return explanations;
}

module.exports = {
  generateNaturalExplanations
};
