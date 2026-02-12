const AuthService = require('../services/authServiceMongo');
const { validateRegistrationData, validateLoginData, validateOTPData, sanitizeEmail } = require('../validators/authValidator');

/**
 * Login endpoint
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    const validation = validateLoginData({ email, password });
    if (!validation.isValid) {
      return res.status(400).json({
        ok: false,
        error: validation.errors.join(', ')
      });
    }

    // Call auth service
    const result = await AuthService.login(email, password);

    if (!result.ok) {
      return res.status(result.statusCode || 401).json({
        ok: false,
        error: result.error
      });
    }

    res.json(result.toJSON());
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      ok: false,
      error: 'Server error'
    });
  }
};

/**
 * Register endpoint
 */
const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validate input
    const validation = validateRegistrationData({ email, password, name });
    if (!validation.isValid) {
      return res.status(400).json({
        ok: false,
        error: validation.errors.join(', ')
      });
    }

    // Call auth service
    const result = await AuthService.register(email, password, name);

    if (!result.ok) {
      return res.status(result.statusCode || 400).json({
        ok: false,
        error: result.error
      });
    }

    res.status(201).json(result.toJSON());
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({
      ok: false,
      error: 'Server error'
    });
  }
};

/**
 * Send OTP endpoint
 */
const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        ok: false,
        error: 'Email is required'
      });
    }

    // Call auth service
    const result = await AuthService.sendOTP(email);

    if (!result.ok) {
      return res.status(result.statusCode || 400).json({
        ok: false,
        error: result.error
      });
    }

    res.json(result.toJSON());
  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({
      ok: false,
      error: 'Server error'
    });
  }
};

/**
 * Verify OTP endpoint
 */
const verifyOTP = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    // Validate input
    const validation = validateOTPData({ email, code, newPassword });
    if (!validation.isValid) {
      return res.status(400).json({
        ok: false,
        error: validation.errors.join(', ')
      });
    }

    // Call auth service
    const result = await AuthService.verifyOTP(email, code, newPassword);

    if (!result.ok) {
      return res.status(result.statusCode || 400).json({
        ok: false,
        error: result.error
      });
    }

    res.json(result.toJSON());
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({
      ok: false,
      error: 'Server error'
    });
  }
};

/**
 * Change password endpoint
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const email = req.user.email;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        ok: false,
        error: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        ok: false,
        error: 'New password must be at least 6 characters'
      });
    }

    // Verify current password by attempting login
    const loginResult = await AuthService.login(email, currentPassword);
    
    if (!loginResult.ok) {
      return res.status(401).json({
        ok: false,
        error: 'Current password is incorrect'
      });
    }

    // Change password
    const result = await AuthService.changePassword(email, newPassword);

    if (!result.ok) {
      return res.status(400).json({
        ok: false,
        error: result.error
      });
    }

    res.json({
      ok: true,
      message: 'Password changed successfully'
    });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({
      ok: false,
      error: 'Server error'
    });
  }
};

module.exports = {
  login,
  register,
  sendOTP,
  verifyOTP,
  changePassword
};
