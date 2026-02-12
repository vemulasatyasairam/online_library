/**
 * Authentication Service (MongoDB)
 * Handles all authentication business logic using MongoDB
 */

const UserModel = require('../models/UserSchema');
const OTPModel = require('../models/OTPSchema');
const jwtUtils = require('../utils/jwt');
const EmailService = require('./emailService');
const { sanitizeEmail, sanitizePassword } = require('../validators/authValidator');

class AuthService {
  /**
   * Register a new user
   */
  static async register(email, password, name = null) {
    try {
      email = sanitizeEmail(email);
      password = sanitizePassword(password);

      // Validate input
      if (!email || !password) {
        return {
          ok: false,
          error: 'Email and password are required',
          statusCode: 400
        };
      }

      if (password.length < 6) {
        return {
          ok: false,
          error: 'Password must be at least 6 characters',
          statusCode: 400
        };
      }

      // Check if user already exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return {
          ok: false,
          error: 'User already exists',
          statusCode: 409
        };
      }

      // Create new user (password will be hashed by pre-save hook)
      const user = new UserModel({
        email,
        password,
        name
      });

      await user.save();

      // Generate token
      const token = jwtUtils.generateToken({ email: user.email, id: user._id });

      return {
        ok: true,
        message: 'User registered successfully',
        token,
        user: user.toPublicJSON(),
        toJSON: function() {
          return {
            ok: this.ok,
            message: this.message,
            token: this.token,
            user: this.user
          };
        }
      };
    } catch (err) {
      console.error('Register error:', err);
      return {
        ok: false,
        error: err.code === 11000 ? 'User already exists' : 'Registration failed',
        statusCode: err.code === 11000 ? 409 : 500
      };
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
      if (!email || !password) {
        return {
          ok: false,
          error: 'Email and password are required',
          statusCode: 400
        };
      }

      // Find user
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return {
          ok: false,
          error: 'Invalid email or password',
          statusCode: 401
        };
      }

      // Check if user is active
      if (!user.isActive) {
        return {
          ok: false,
          error: 'Account is deactivated',
          statusCode: 403
        };
      }

      // Verify password
      const passwordMatch = await user.comparePassword(password);
      if (!passwordMatch) {
        return {
          ok: false,
          error: 'Invalid email or password',
          statusCode: 401
        };
      }

      // Update last login
      await user.updateLastLogin();

      // Generate token
      const token = jwtUtils.generateToken({ email: user.email, id: user._id });

      return {
        ok: true,
        message: 'Login successful',
        token,
        user: user.toPublicJSON(),
        toJSON: function() {
          return {
            ok: this.ok,
            message: this.message,
            token: this.token,
            user: this.user
          };
        }
      };
    } catch (err) {
      console.error('Login error:', err);
      return {
        ok: false,
        error: 'Login failed',
        statusCode: 500
      };
    }
  }

  /**
   * Send OTP for password reset
   */
  static async sendOTP(email) {
    try {
      email = sanitizeEmail(email);

      // Check if user exists
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return {
          ok: false,
          error: 'User not found',
          statusCode: 404
        };
      }

      // Generate OTP
      const otp = await OTPModel.generateOTP(email);

      // Send OTP via email
      const emailResult = await EmailService.sendOTPEmail(email, otp.code, user.name);
      console.log('📧 Email result:', emailResult);

      return {
        ok: true,
        message: emailResult.testMode
          ? 'OTP generated (test mode - check server logs)'
          : 'OTP sent to your email',
        code: emailResult.testMode ? emailResult.testOTP : undefined,
        toJSON: function() {
          return {
            ok: this.ok,
            message: this.message,
            code: this.code
          };
        }
      };
    } catch (err) {
      console.error('Send OTP error:', err);
      return {
        ok: false,
        error: 'Failed to send OTP',
        statusCode: 500
      };
    }
  }

  /**
   * Verify OTP and reset password
   */
  static async verifyOTP(email, code, newPassword) {
    try {
      email = sanitizeEmail(email);
      newPassword = sanitizePassword(newPassword);

      // Validate new password
      if (!newPassword || newPassword.length < 6) {
        return {
          ok: false,
          error: 'Password must be at least 6 characters',
          statusCode: 400
        };
      }

      // Find OTP
      const otp = await OTPModel.findByEmail(email);
      if (!otp) {
        return {
          ok: false,
          error: 'OTP not found or expired',
          statusCode: 404
        };
      }

      // Verify OTP
      const verification = await otp.verify(code);
      if (!verification.success) {
        return {
          ok: false,
          error: verification.error,
          statusCode: 400
        };
      }

      // Find user and update password
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return {
          ok: false,
          error: 'User not found',
          statusCode: 404
        };
      }

      // Update password (will be hashed by pre-save hook)
      user.password = newPassword;
      await user.save();

      // Delete OTP
      await OTPModel.deleteOne({ email: email.toLowerCase() });

      // Generate new token
      const token = jwtUtils.generateToken({ email: user.email, id: user._id });

      return {
        ok: true,
        message: 'Password reset successful',
        token,
        user: user.toPublicJSON(),
        toJSON: function() {
          return {
            ok: this.ok,
            message: this.message,
            token: this.token,
            user: this.user
          };
        }
      };
    } catch (err) {
      console.error('Verify OTP error:', err);
      return {
        ok: false,
        error: 'Failed to verify OTP',
        statusCode: 500
      };
    }
  }

  /**
   * Change user password
   */
  static async changePassword(email, newPassword) {
    try {
      email = sanitizeEmail(email);
      newPassword = sanitizePassword(newPassword);

      if (!email || !newPassword) {
        return {
          ok: false,
          error: 'Email and new password are required',
          statusCode: 400
        };
      }

      if (newPassword.length < 6) {
        return {
          ok: false,
          error: 'New password must be at least 6 characters',
          statusCode: 400
        };
      }

      const user = await UserModel.findByEmail(email);
      if (!user) {
        return {
          ok: false,
          error: 'User not found',
          statusCode: 404
        };
      }

      // Update password (will be hashed by pre-save hook)
      user.password = newPassword;
      user.updatedAt = new Date();
      await user.save();

      return {
        ok: true,
        message: 'Password changed successfully'
      };
    } catch (err) {
      console.error('Change password error:', err);
      return {
        ok: false,
        error: 'Failed to change password',
        statusCode: 500
      };
    }
  }

  /**
   * Validate JWT token
   */
  static validateToken(token) {
    try {
      return jwtUtils.verifyToken(token);
    } catch (err) {
      return null;
    }
  }
}

module.exports = AuthService;
