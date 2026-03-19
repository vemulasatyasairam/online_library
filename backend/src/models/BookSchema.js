const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true,
    minlength: [2, 'Title must be at least 2 characters long']
  },
  author: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true
  },
  category: {
    type: String,
    trim: true,
    default: 'General'
  },
  subject: {
    type: String,
    trim: true
  },
  branch: {
    type: String,
    trim: true
  },
  year: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  isbn: {
    type: String,
    trim: true,
    unique: true,
    sparse: true // Allows multiple null values
  },
  publishedYear: {
    type: Number,
    min: [1000, 'Published year must be valid'],
    max: [new Date().getFullYear() + 1, 'Published year cannot be in the future']
  },
  pageCount: {
    type: Number,
    min: [1, 'Page count must be at least 1']
  },
  language: {
    type: String,
    default: 'English',
    trim: true
  },
  // PDF file information
  pdf: {
    filename: {
      type: String,
      required: false
    },
    originalname: {
      type: String,
      required: false
    },
    mimetype: {
      type: String,
      required: false
    },
    size: {
      type: Number,
      required: false
    },
    url: {
      type: String,
      required: false
    },
    publicId: {
      type: String,
      required: false
    },
    localPath: {
      type: String,
      required: false
    },
    data: {
      type: Buffer,
      required: false
    },
    uploadDate: {
      type: Date,
      default: Date.now
    }
  },
  // Cover image
  coverImage: {
    filename: {
      type: String
    },
    url: {
      type: String
    },
    localPath: {
      type: String
    },
    data: {
      type: Buffer
    },
    mimetype: {
      type: String
    }
  },
  // Metadata
  uploadedBy: {
    type: String,
    trim: true
  },
  downloads: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0,
      min: 0
    },
    total: {
      type: Number,
      default: 0,
      min: 0
    },
    users: [{
      userId: {
        type: String,
        trim: true
      },
      value: {
        type: Number,
        min: 1,
        max: 5
      },
      updatedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  tags: [{
    type: String,
    trim: true
  }],
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
bookSchema.index({ title: 'text', author: 'text', subject: 'text' });
bookSchema.index({ branch: 1 });
bookSchema.index({ createdAt: -1 });

// Instance method to increment downloads
bookSchema.methods.incrementDownloads = function() {
  this.downloads += 1;
  return this.save();
};

// Instance method to increment views
bookSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

bookSchema.methods.applyRating = function(value, userId) {
  const score = Number(value);
  if (!Number.isFinite(score) || score < 1 || score > 5) {
    throw new Error('Rating must be between 1 and 5');
  }

  if (!this.rating) {
    this.rating = { average: 0, count: 0, total: 0, users: [] };
  }

  const normalizedUserId = (userId || '').trim();
  if (!Array.isArray(this.rating.users)) {
    this.rating.users = [];
  }

  if (normalizedUserId) {
    const existing = this.rating.users.find((entry) => entry.userId === normalizedUserId);
    if (existing) {
      this.rating.total = Math.max(0, (this.rating.total || 0) - Number(existing.value || 0) + score);
      existing.value = score;
      existing.updatedAt = new Date();
    } else {
      this.rating.users.push({ userId: normalizedUserId, value: score, updatedAt: new Date() });
      this.rating.count = (this.rating.count || 0) + 1;
      this.rating.total = (this.rating.total || 0) + score;
    }
  } else {
    // Anonymous fallback: treat each request as a new rating.
    this.rating.count = (this.rating.count || 0) + 1;
    this.rating.total = (this.rating.total || 0) + score;
  }

  if (this.rating.count > 0) {
    this.rating.average = Number((this.rating.total / this.rating.count).toFixed(2));
  } else {
    this.rating.average = 0;
  }

  return this.save();
};

// Static method to find books by branch
bookSchema.statics.findByBranch = function(branch) {
  return this.find({ branch: branch }).sort({ createdAt: -1 });
};

// Static method to search books
bookSchema.statics.searchBooks = function(query) {
  return this.find({
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { author: { $regex: query, $options: 'i' } },
      { subject: { $regex: query, $options: 'i' } },
      { tags: { $regex: query, $options: 'i' } }
    ]
  }).sort({ createdAt: -1 });
};

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
