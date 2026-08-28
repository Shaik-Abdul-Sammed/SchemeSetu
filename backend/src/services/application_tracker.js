/**
 * Mock Application Tracker Service
 */
function createApplication({ schemeId, applicantName, loanAmount }) {
  return {
    applicationId: `APP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    schemeId,
    applicantName,
    loanAmount,
    status: 'Under Review',
    estimatedProcessingDays: 3,
    nextVerificationStep: 'Bank Field Verification'
  };
}

module.exports = {
  createApplication
};
