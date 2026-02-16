const express = require('express');
const multer = require('multer');
const path = require('path');
const { uploadPdfFile, getPdfFile, deletePdfFile } = require('../controllers/pdfController');

const router = express.Router();

// Configure multer for PDF uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/temp/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});

// Routes
router.post('/upload', upload.single('pdf'), uploadPdfFile);
router.get('/:publicId', getPdfFile);
router.delete('/:publicId', deletePdfFile);

module.exports = router;
