const express = require('express');
const router = express.Router();
const calculatorController = require('../../controllers/calculatorController');

// Calculate loan EMI with moratorium interest capitalization
router.post('/emi', calculatorController.calculateEmi);

module.exports = router;
