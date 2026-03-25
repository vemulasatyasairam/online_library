const AdminModel = require('../models/AdminSchema');
const jwtUtils = require('../utils/jwt');

class AdminAuthService {
  static sanitizeEmail(email) {
    return String(email || '').trim().toLowerCase();
  }

  static sanitizePassword(password) {
    return String(password || '').trim();
  }

  static async login(email, password) {
    try {
      const safeEmail = this.sanitizeEmail(email);
      const safePassword = this.sanitizePassword(password);

      if (!safeEmail || !safePassword) {
        return {
          ok: false,
          error: 'Email and password are required',
          statusCode: 400
        };
      }

      const admin = await AdminModel.findByEmail(safeEmail);
      if (!admin) {
        return {
          ok: false,
          error: 'Invalid admin email or password',
          statusCode: 401
        };
      }

      if (!admin.isActive) {
        return {
          ok: false,
          error: 'Admin account is inactive',
          statusCode: 403
        };
      }

      const isPasswordMatch = await admin.comparePassword(safePassword);
      if (!isPasswordMatch) {
        return {
          ok: false,
          error: 'Invalid admin email or password',
          statusCode: 401
        };
      }

      admin.lastLogin = new Date();
      await admin.save();

      const token = jwtUtils.generateToken({
        id: String(admin._id),
        email: admin.email,
        role: 'admin'
      });

      return {
        ok: true,
        message: 'Admin login successful',
        token,
        admin: admin.toPublicJSON(),
        toJSON: function() {
          return {
            ok: this.ok,
            message: this.message,
            token: this.token,
            admin: this.admin
          };
        }
      };
    } catch (error) {
      console.error('Admin login error:', error);
      return {
        ok: false,
        error: 'Failed to login admin',
        statusCode: 500
      };
    }
  }
}

module.exports = AdminAuthService;
