/**
 * Authentication Service
 * Handles all authentication business logic
 */

const fileStore = require('../utils/fileStore');
const { User, OTP, AuthResponse } = require('../models');
const jwtUtils = require('../utils/jwt');
const { sanitizeEmail, sanitizePassword } = require('../validators/authValidator');

class AuthService {
  /**
   * Register a new user
   */
  static async register(email, password, name = null) {
    try {
      email = sanitizeEmail(email);
      password = sanitizePassword(password);

      // Check if user already exists
      const existingUser = fileStore.findUserByEmail(email);
      if (existingUser) {
        return AuthResponse.error('User already exists', 409);
      }

      // Create new user
      const user = new User({
        email,
        password,
        name
      });

      // Validate
      const validation = user.validateForRegistration();
      if (!validation.isValid) {
        return AuthResponse.error(validation.errors.join(', '), 400);
      }

      // Hash password
      await user.hashPassword();

      // Save user
      fileStore.saveUser(user);

      // Generate token
      const token = jwtUtils.generateToken(user);

      return AuthResponse.success('User registered successfully', {
        token,
        user: user.toPublicJSON()
      });
    } catch (err) {
      console.error('Register error:', err);
      return AuthResponse.error('Registration failed', 500);
    }
  }

  /**
   * Login user
   */
  static async login(email, password) {
    try {
      email = sanitizeEmail(email);
      password = sanitizePassword(password);

      // Validate input
      const user = new User({ email, password });
      const validation = user.validateForLogin();
      if (!validation.isValid) {
        return AuthResponse.error(validation.errors.join(', '), 400);
      }

      // Find user
      const dbUser = fileStore.findUserByEmail(email);
      if (!dbUser) {
        return AuthResponse.error('Invalid email or password', 401);
      }

      // Convert to User instance if not already
      const userInstance = dbUser instanceof User ? dbUser : User.fromJSON(dbUser);

      // Verify password
      const passwordMatch = await userInstance.comparePassword(password);
      if (!passwordMatch) {
        return AuthResponse.error('Invalid email or password', 401);
      }

      // Update last login
      userInstance.updateLastLogin();
      fileStore.saveUser(userInstance);

      // Generate token
      const token = jwtUtils.generateToken(userInstance);

      return AuthResponse.success('Login successful', {
        token,
        user: userInstance.toPublicJSON()
      });
    } catch (err) {
      console.error('Login error:', err);
      return AuthResponse.error('Login failed', 500);
    }
  }

  /**
   * Send OTP for password reset
   */
  static async sendOTP(email) {
    try {
      email = sanitizeEmail(email);

      // Check if user exists
      const user = fileStore.findUserByEmail(email);
      if (!user) {
        return AuthResponse.error('User not found', 404);
      }

      // Generate OTP
      const code = OTP.generateCode();
      const otp = new OTP({ email, code });

      // Store OTP (in production, send via email)
      fileStore.saveOTP(otp);

      // Log for debugging
      console.log(`OTP for ${email}: ${code}`);

      return AuthResponse.success('OTP sent to email', {
        code // Remove in production
      });
    } catch (err) {
      console.error('Send OTP error:', err);
      return AuthResponse.error('Failed to send OTP', 500);
    }
  }

  /**
   * Verify OTP and reset password
   */
  static async verifyOTP(email, code, newPassword) {
    try {
      email = sanitizeEmail(email);
      code = (code || '').trim();
      newPassword = sanitizePassword(newPassword);

      // Validate new password
      if (newPassword.length < 6) {
        return AuthResponse.error('New password must be at least 6 characters', 400);
      }

      // Get OTP
      const otp = fileStore.getOTP(email);
      if (!otp) {
        return AuthResponse.error('No OTP found for this email', 400);
      }

      // Convert to OTP instance if not already
      const otpInstance = otp instanceof OTP ? otp : OTP.fromJSON(otp);

      // Verify OTP
      const verification = otpInstance.verify(code);
      if (!verification.success) {
        fileStore.saveOTP(otpInstance);
        return AuthResponse.error(verification.error, 400);
      }

      // Get user
      const user = fileStore.findUserByEmail(email);
      if (!user) {
        return AuthResponse.error('User not found', 404);
      }

      // Convert to User instance if not already
      const userInstance = user instanceof User ? user : User.fromJSON(user);

      // Update password
      await userInstance.updatePassword(newPassword);

      // Save user
      fileStore.saveUser(userInstance);

      // Delete OTP
      fileStore.deleteOTP(email);

      // Generate token
      const token = jwtUtils.generateToken(userInstance);

      return AuthResponse.success('Password reset successful', {
        token,
        user: userInstance.toPublicJSON()
      });
    } catch (err) {
      console.error('Verify OTP error:', err);
      return AuthResponse.error('OTP verification failed', 500);
    }
  }

  /**
   * Validate token
   */
  static validateToken(token) {
    try {
      const decoded = jwtUtils.verifyToken(token);
      if (!decoded) {
        return null;
      }
      return decoded;
    } catch (err) {
      console.error('Token validation error:', err);
      return null;
    }
  }
}

module.exports = AuthService;
