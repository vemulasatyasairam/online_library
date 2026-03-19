const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Memory storage for small files like avatars/covers.
const storage = multer.memoryStorage();

// Disk storage for potentially large PDF uploads to avoid high RAM usage.
const tempUploadDir = path.join(process.cwd(), 'uploads', 'temp');
fs.mkdirSync(tempUploadDir, { recursive: true });
const pdfDiskStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tempUploadDir),
  filename: (req, file, cb) => {
    const safeName = String(file.originalname || 'upload.pdf')
      .replace(/[^a-zA-Z0-9\s._-]/g, '')
      .replace(/\s+/g, '_');
    cb(null, `${Date.now()}_${safeName}`);
  }
});

// File filter to only accept PDF files
const fileFilter = (req, file, cb) => {
  // Accept PDFs only
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

// File filter to only accept image files for covers
const coverImageFilter = (req, file, cb) => {
  if ((file.mimetype || '').startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed for cover upload!'), false);
  }
};

// Mixed filter for upload endpoint: allow PDF for pdf field and images for cover field
const mixedUploadFilter = (req, file, cb) => {
  if (file.fieldname === 'pdf') {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
      return;
    }
    cb(new Error('PDF field accepts only PDF files!'), false);
    return;
  }

  if (file.fieldname === 'cover') {
    if ((file.mimetype || '').startsWith('image/')) {
      cb(null, true);
      return;
    }
    cb(new Error('Cover field accepts only image files!'), false);
    return;
  }

  cb(new Error('Unsupported upload field'), false);
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter
});

const uploadBookFiles = multer({
  storage: pdfDiskStorage,
  fileFilter: mixedUploadFilter
});

const uploadCover = multer({
  storage,
  fileFilter: coverImageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max for cover image
  }
});

// Multer error handler middleware
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        ok: false,
        error: 'File is too large'
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

module.exports = { upload, uploadBookFiles, uploadCover, handleMulterError };
