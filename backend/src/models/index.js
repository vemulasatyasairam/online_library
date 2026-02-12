/**
 * Index file for all models
 * Exports all model classes for easy importing
 */

const User = require('./User');
const Book = require('./Book');
const SavedBook = require('./SavedBook');
const OTP = require('./OTP');
const AuthResponse = require('./AuthResponse');

module.exports = {
  User,
  Book,
  SavedBook,
  OTP,
  AuthResponse
};
