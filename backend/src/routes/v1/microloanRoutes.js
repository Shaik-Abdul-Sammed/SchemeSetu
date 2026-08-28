const express = require('express');
const router = express.Router();

/**
 * POST /api/v1/microloan/approve
 * Instant Approval micro-loan simulation (₹5,000 - ₹15,000)
 */
router.post('/approve', (req, res) => {
  const { amount = 10000, applicantName = 'Citizen Applicant' } = req.body;

  res.json({
    success: true,
    loanId: `MICRO-2026-${Math.floor(10000 + Math.random() * 90000)}`,
    approvedAmount: Number(amount),
    interestRate: 6.5,
    tenureMonths: 12,
    monthlyEmi: Math.round((Number(amount) * 1.065) / 12),
    disbursementStatus: 'APPROVED_INSTANT',
    message: 'Instant micro-credit approved via automated risk scoring engine.'
  });
});

module.exports = router;
