const express = require('express');
const router = express.Router();
const feedbackController = require('../../controllers/feedbackController');

// Submit user feedback and ratings
router.post('/', feedbackController.submitFeedback);

// Get feedback entries (optional list/query)
router.get('/', feedbackController.getFeedbacks);

module.exports = router;
