const express = require('express');
const router = express.Router();

/**
 * POST /api/v1/uli/apply
 * Simulates automated paperless credit assessment via RBI's Unified Lending Interface (ULI)
 */
router.post('/apply', (req, res) => {
  const { applicantName, aadhaarNumber, requestedAmount } = req.body;

  return res.json({
    success: true,
    uliReferenceNumber: `ULI-2026-${Math.floor(100000 + Math.random() * 900000)}`,
    preApprovedCreditLimit: requestedAmount || 350000,
    interestSubventionRate: 7.25,
    consentVerified: true,
    estimatedDisbursementTime: '15 Minutes (Paperless)',
    message: 'ULI Frictionless Credit Approval Granted via Digital Public Infrastructure.'
  });
});

module.exports = router;
