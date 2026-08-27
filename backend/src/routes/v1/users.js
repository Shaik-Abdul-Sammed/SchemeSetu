const express = require('express');
const router = express.Router();
const userController = require('../../controllers/userController');

// User registration with bcrypt hashing and JWT issuance
router.post('/register', userController.registerUser);

// User login with credential validation and JWT issuance
router.post('/login', userController.loginUser);

module.exports = router;
