/**
 * Saved Books MongoDB Schema
 */

const mongoose = require('mongoose');

const savedBookSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  bookId: {
    type: String,
    required: true
  },
  book: {
    id: { type: String, required: true },
    title: { type: String, required: true },
    author: { type: String },
    subject: { type: String },
    pdf: { type: String },
    branch: { type: String },
    coverImage: { type: String },
    description: { type: String },
    isbn: { type: String },
    publishedYear: { type: Number },
    pageCount: { type: Number },
    language: { type: String }
  },
  notes: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  isRead: {
    type: Boolean,
    default: false
  },
  savedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for faster queries
savedBookSchema.index({ email: 1, bookId: 1 }, { unique: true });

// Static method to get all saved books for a user
savedBookSchema.statics.findByEmail = function(email) {
  return this.find({ email: email.toLowerCase() });
};

// Static method to check if book is already saved
savedBookSchema.statics.isBookSaved = function(email, bookId) {
  return this.findOne({ email: email.toLowerCase(), bookId });
};

// Static method to remove saved book
savedBookSchema.statics.removeBook = function(email, bookId) {
  return this.deleteOne({ email: email.toLowerCase(), bookId });
};

const SavedBookModel = mongoose.model('SavedBook', savedBookSchema);

module.exports = SavedBookModel;
