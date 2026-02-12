/**
 * OTP Model
 * Represents an One-Time Password for password reset
 */

class OTP {
  constructor(data = {}) {
    this.email = data.email || null;
    this.code = data.code || null;
    this.createdAt = data.createdAt || new Date();
    this.expiresAt = data.expiresAt || new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    this.attempts = data.attempts || 0;
    this.maxAttempts = data.maxAttempts || 5;
    this.isUsed = data.isUsed || false;
  }

  /**
   * Check if OTP is expired
   */
  isExpired() {
    return new Date() > this.expiresAt;
  }

  /**
   * Check if OTP is valid
   */
  isValid() {
    return !this.isExpired() && !this.isUsed && this.attempts < this.maxAttempts;
  }

  /**
   * Verify OTP code
   */
  verify(code) {
    this.attempts++;

    if (this.isExpired()) {
      return {
        success: false,
        error: 'OTP has expired'
      };
    }

    if (this.isUsed) {
      return {
        success: false,
        error: 'OTP has already been used'
      };
    }

    if (this.attempts > this.maxAttempts) {
      return {
        success: false,
        error: 'Too many failed attempts'
      };
    }

    if (this.code !== code) {
      return {
        success: false,
        error: 'Invalid OTP code',
        attemptsRemaining: this.maxAttempts - this.attempts
      };
    }

    this.isUsed = true;
    return {
      success: true,
      message: 'OTP verified successfully'
    };
  }

  /**
   * Get time remaining in seconds
   */
  getTimeRemaining() {
    const remaining = this.expiresAt - new Date();
    return remaining > 0 ? Math.floor(remaining / 1000) : 0;
  }

  /**
   * Get OTP object for JSON response
   */
  toJSON() {
    return {
      email: this.email,
      createdAt: this.createdAt,
      expiresAt: this.expiresAt,
      attempts: this.attempts,
      maxAttempts: this.maxAttempts,
      isUsed: this.isUsed,
      isValid: this.isValid(),
      isExpired: this.isExpired(),
      timeRemaining: this.getTimeRemaining()
    };
  }

  /**
   * Create OTP instance from plain object
   */
  static fromJSON(data) {
    return new OTP(data);
  }

  /**
   * Generate random OTP code
   */
  static generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}

module.exports = OTP;
