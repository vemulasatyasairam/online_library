const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  password: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  collection: 'admin'
});

adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  // Keep already-hashed passwords untouched for migration/manual insert scenarios.
  if (typeof this.password === 'string' && this.password.startsWith('$2')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

adminSchema.methods.comparePassword = async function(candidatePassword) {
  if (!candidatePassword) {
    return false;
  }

  // Support both bcrypt-hashed and plain-text stored passwords.
  if (typeof this.password === 'string' && this.password.startsWith('$2')) {
    return bcrypt.compare(candidatePassword, this.password);
  }

  return candidatePassword === this.password;
};

adminSchema.methods.toPublicJSON = function() {
  return {
    id: this._id,
    email: this.email,
    isActive: this.isActive,
    lastLogin: this.lastLogin,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

adminSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: String(email || '').toLowerCase().trim() });
};

const AdminModel = mongoose.model('Admin', adminSchema);

module.exports = AdminModel;
