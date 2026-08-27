const express = require('express');
const router = express.Router();
const userController = require('../../controllers/userController');
const { authenticateToken } = require('../../middleware/auth');

// User registration with bcrypt hashing and JWT issuance
router.post('/register', userController.registerUser);

// User login with credential validation and JWT issuance
router.post('/login', userController.loginUser);

// Get authenticated user profile
router.get('/me', authenticateToken, userController.getMe);

module.exports = router;
