/**
 * Auth Response Model
 * Standardized response format for authentication endpoints
 */

class AuthResponse {
  constructor(data = {}) {
    this.ok = data.ok !== undefined ? data.ok : false;
    this.message = data.message || null;
    this.error = data.error || null;
    this.token = data.token || null;
    this.user = data.user || null;
    this.code = data.code || null; // For dev mode OTP display
    this.data = data.data || null; // Additional data
    this.timestamp = data.timestamp || new Date().toISOString();
  }

  /**
   * Create success response
   */
  static success(message, options = {}) {
    return new AuthResponse({
      ok: true,
      message,
      token: options.token || null,
      user: options.user || null,
      code: options.code || null,
      data: options.data || null
    });
  }

  /**
   * Create error response
   */
  static error(message, statusCode = 400) {
    return new AuthResponse({
      ok: false,
      error: message,
      statusCode
    });
  }

  /**
   * Get response for sending to client
   */
  toJSON() {
    const response = {
      ok: this.ok,
      timestamp: this.timestamp
    };

    if (this.message) response.message = this.message;
    if (this.error) response.error = this.error;
    if (this.token) response.token = this.token;
    if (this.user) response.user = this.user;
    if (this.code) response.code = this.code;
    if (this.data) response.data = this.data;

    return response;
  }
}

module.exports = AuthResponse;
