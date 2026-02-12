/**
 * Validation utilities
 * Helper functions for data validation
 */

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

const validateRegistrationData = (data) => {
  const errors = [];

  if (!data.email || !validateEmail(data.email)) {
    errors.push('Valid email is required');
  }

  if (!data.password || !validatePassword(data.password)) {
    errors.push('Password must be at least 6 characters');
  }

  if (data.name && data.name.length < 2) {
    errors.push('Name must be at least 2 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateLoginData = (data) => {
  const errors = [];

  if (!data.email || !validateEmail(data.email)) {
    errors.push('Valid email is required');
  }

  if (!data.password) {
    errors.push('Password is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateOTPData = (data) => {
  const errors = [];

  if (!data.email || !validateEmail(data.email)) {
    errors.push('Valid email is required');
  }

  if (!data.code) {
    errors.push('OTP code is required');
  }

  if (!data.newPassword || !validatePassword(data.newPassword)) {
    errors.push('New password must be at least 6 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const sanitizeEmail = (email) => {
  return (email || '').trim().toLowerCase();
};

const sanitizePassword = (password) => {
  return (password || '').trim();
};

module.exports = {
  validateEmail,
  validatePassword,
  validateRegistrationData,
  validateLoginData,
  validateOTPData,
  sanitizeEmail,
  sanitizePassword
};
