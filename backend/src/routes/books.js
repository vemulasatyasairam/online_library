const express = require('express');
const router = express.Router();
const { upload, handleMulterError } = require('../config/multer');
const bookController = require('../controllers/bookController');
const auth = require('../middleware/auth');

/**
 * POST /api/books/upload
 * Upload a new book with PDF
 * Requires authentication (optional - you can add auth middleware)
 */
router.post(
  '/upload',
  // auth, // Uncomment to require authentication
  upload.single('pdf'), // 'pdf' is the field name for the file
  handleMulterError,
  bookController.uploadBook
);

/**
 * GET /api/books
 * Get all books (with pagination and filters)
 * Query params: ?branch=CS&search=algorithm&page=1&limit=20
 */
router.get('/', bookController.getAllBooks);

/**
 * GET /api/books/search
 * Search books by query
 * Query params: ?q=search_term
 */
router.get('/search', bookController.searchBooks);

/**
 * GET /api/books/branch/:branch
 * Get all books in a specific branch
 */
router.get('/branch/:branch', bookController.getBooksByBranch);

/**
 * GET /api/books/:id
 * Get a single book by ID (without PDF data)
 */
router.get('/:id', bookController.getBookById);

/**
 * GET /api/books/:id/download
 * Download PDF file
 */
router.get('/:id/download', bookController.downloadPDF);

/**
 * GET /api/books/:id/view
 * View PDF in browser
 */
router.get('/:id/view', bookController.viewPDF);

/**
 * PUT /api/books/:id
 * Update book details (not the PDF)
 * Requires authentication (optional)
 */
router.put(
  '/:id',
  // auth, // Uncomment to require authentication
  bookController.updateBook
);

/**
 * DELETE /api/books/:id
 * Delete a book
 * Requires authentication (optional)
 */
router.delete(
  '/:id',
  // auth, // Uncomment to require authentication
  bookController.deleteBook
);

module.exports = router;
