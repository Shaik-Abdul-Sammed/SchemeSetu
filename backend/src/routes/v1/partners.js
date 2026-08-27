const express = require('express');
const router = express.Router();
const partnerController = require('../../controllers/partnerController');

// Find nearest eligible partners within radius
router.post('/nearest', partnerController.getNearestPartners);

// List partners with filtering and pagination
router.get('/', partnerController.getPartners);

// Register a new partner
router.post('/register', partnerController.registerPartner);

// Get single partner by ID
router.get('/:id', partnerController.getPartnerById);

module.exports = router;
