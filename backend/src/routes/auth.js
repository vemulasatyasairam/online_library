const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Login
router.post('/login', authController.login);

// Register
router.post('/register', authController.register);

// OTP routes
router.post('/send-otp', authController.sendOTP);
router.post('/verify-otp', authController.verifyOTP);

// Change password (protected route)
router.post('/change-password', authMiddleware, authController.changePassword);

module.exports = router;
