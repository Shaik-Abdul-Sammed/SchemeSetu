const express = require('express');
const router = express.Router();
const agentController = require('../../controllers/agentController');

// Submit scheme application on behalf of applicant
router.post('/submit', agentController.submitApplication);

// Get users/applications associated with a specific agent
router.get('/users/:agentId', agentController.getAgentUsers);

module.exports = router;
