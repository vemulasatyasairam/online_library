/**
 * User Model
 * Represents a user in the authentication system
 */

const bcrypt = require('bcryptjs');

class User {
  constructor(data = {}) {
    this.email = data.email || null;
    this.password = data.password || null;
    this.name = data.name || null;
    this.avatarUrl = data.avatarUrl || null;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.lastLogin = data.lastLogin || null;
    this.id = data.id || this.email; // Use email as ID
  }

  /**
   * Validate user data for registration
   */
  validateForRegistration() {
    const errors = [];

    // Email validation
    if (!this.email) {
      errors.push('Email is required');
    } else if (!this.isValidEmail(this.email)) {
      errors.push('Email format is invalid');
    }

    // Password validation
    if (!this.password) {
      errors.push('Password is required');
    } else if (this.password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }

    // Name validation (optional but if provided, must be valid)
    if (this.name && this.name.length < 2) {
      errors.push('Name must be at least 2 characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate user data for login
   */
  validateForLogin() {
    const errors = [];

    if (!this.email) {
      errors.push('Email is required');
    } else if (!this.isValidEmail(this.email)) {
      errors.push('Email format is invalid');
    }

    if (!this.password) {
      errors.push('Password is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate email format
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Hash the password using bcryptjs
   */
  async hashPassword() {
    if (!this.password) {
      throw new Error('Password must be set before hashing');
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return this.password;
  }

  /**
   * Compare password with hash
   */
  async comparePassword(rawPassword) {
    if (!this.password) {
      throw new Error('User password not found');
    }
    return await bcrypt.compare(rawPassword, this.password);
  }

  /**
   * Update last login timestamp
   */
  updateLastLogin() {
    this.lastLogin = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Update password
   */
  async updatePassword(newPassword) {
    if (newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters');
    }
    this.password = newPassword;
    await this.hashPassword();
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Get user object without sensitive data
   */
  toJSON() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      avatarUrl: this.avatarUrl,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isActive: this.isActive,
      lastLogin: this.lastLogin
    };
  }

  /**
   * Get user for public response (minimal data)
   */
  toPublicJSON() {
    return {
      email: this.email,
      name: this.name
    };
  }

  /**
   * Create User instance from plain object
   */
  static fromJSON(data) {
    return new User(data);
  }

  /**
   * Validate if two user instances represent same user
   */
  isSameUser(otherUser) {
    return this.email && otherUser.email && 
           this.email.toLowerCase() === otherUser.email.toLowerCase();
  }
}

module.exports = User;
