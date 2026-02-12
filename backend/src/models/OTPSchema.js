/**
 * OTP MongoDB Schema
 */

const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true
  },
  code: {
    type: String,
    required: true
  },
  attempts: {
    type: Number,
    default: 0
  },
  maxAttempts: {
    type: Number,
    default: 5
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for email and auto-delete expired OTPs (TTL index)
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });

// Method to check if OTP is expired
otpSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

// Method to verify OTP
otpSchema.methods.verify = async function(code) {
  if (this.isExpired()) {
    return { success: false, error: 'OTP expired' };
  }
  
  if (this.isUsed) {
    return { success: false, error: 'OTP already used' };
  }
  
  if (this.attempts >= this.maxAttempts) {
    return { success: false, error: 'Maximum attempts exceeded' };
  }
  
  this.attempts += 1;
  await this.save();
  
  // Compare as strings, ensure both are trimmed
  const inputCode = String(code).trim();
  const storedCode = String(this.code).trim();
  
  if (storedCode !== inputCode) {
    return { success: false, error: 'Invalid OTP' };
  }
  
  this.isUsed = true;
  await this.save();
  
  return { success: true };
};

// Static method to generate and save OTP
otpSchema.statics.generateOTP = async function(email) {
  // Generate 6-digit OTP
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Remove any existing OTP for this email
  await this.deleteOne({ email: email.toLowerCase() });
  
  // Create new OTP with 10 minutes expiry
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  
  const otp = new this({
    email: email.toLowerCase(),
    code,
    expiresAt
  });
  
  await otp.save();
  return otp;
};

// Static method to find by email
otpSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

const OTPModel = mongoose.model('OTP', otpSchema);

module.exports = OTPModel;
