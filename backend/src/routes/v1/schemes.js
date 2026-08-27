const express = require('express');
const router = express.Router();
const schemeController = require('../../controllers/schemeController');

// Scheme recommendation engine
router.post('/recommend', schemeController.recommendSchemes);

// List schemes with query filters and pagination
router.get('/', schemeController.getSchemes);

// Get single scheme by ID
router.get('/:id', schemeController.getSchemeById);

module.exports = router;
