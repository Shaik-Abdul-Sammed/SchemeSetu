const express = require('express');
const router = express.Router();
const userController = require('../../controllers/userController');
const { authenticateToken } = require('../../middleware/auth');
const { loginLimiter, registerLimiter } = require('../../middleware/rateLimiter');

// User registration with bcrypt hashing and rate limiting
router.post('/register', registerLimiter, userController.registerUser);

// User login with credential validation, rate limiting, and JWT issuance
router.post('/login', loginLimiter, userController.loginUser);

// Get authenticated user profile
router.get('/me', authenticateToken, userController.getMe);

// Get verified SIH26092 demo accounts for judges and evaluators
router.get('/demo-accounts', userController.getDemoAccounts);

module.exports = router;

