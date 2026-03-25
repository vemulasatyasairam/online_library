const mongoose = require('mongoose');


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


});

adminSchema.methods.comparePassword = async function(candidatePassword) {
  if (!candidatePassword) {
    return false;
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
