const multer = require('multer');
const path = require('path');

// Configure storage - store PDF files in memory as Buffer
const storage = multer.memoryStorage();

// File filter to only accept PDF files
const fileFilter = (req, file, cb) => {
  // Accept PDFs only
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max file size
  }
});

// Multer error handler middleware
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        ok: false,
        error: 'File is too large. Maximum size is 50MB'
      });
    }
    return res.status(400).json({
      ok: false,
      error: err.message
    });
  } else if (err) {
    return res.status(400).json({
      ok: false,
      error: err.message
    });
  }
  next();
};

module.exports = { upload, handleMulterError };
