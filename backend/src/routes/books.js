const express = require('express');
const router = express.Router();
const { uploadBookFiles, uploadCover, handleMulterError } = require('../config/multer');
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
  uploadBookFiles.fields([
    { name: 'pdf', maxCount: 1 },
    { name: 'cover', maxCount: 1 }
  ]),
  handleMulterError,
  bookController.uploadBook
);

/**
 * POST /api/books/:id/cover
 * Update only cover image for a specific book
 */
router.post(
  '/:id([0-9a-fA-F]{24})/cover',
  uploadCover.single('cover'),
  handleMulterError,
  bookController.updateBookCover
);

/**
 * POST /api/books/register-local
 * Register a local file without uploading to Cloudinary
 * Body: { title, author, category, filePath, branch?, year? }
 */
router.post('/register-local', bookController.registerLocalBook);

/**
 * GET /api/books/debug/check
 * Debug endpoint - Returns system diagnostics for PDF display troubleshooting
 */
router.get('/debug/check', async (req, res) => {
  try {
    const Book = require('../models/BookSchema');
    const cloudinary = require('../config/cloudinary');
    
    const totalBooks = await Book.countDocuments({});
    const booksWithPdf = await Book.countDocuments({ 'pdf.url': { $exists: true, $ne: null } });
    const sampleBook = await Book.findOne({ 'pdf.url': { $exists: true, $ne: null } }).select('-pdf.data -coverImage.data');
    
    res.json({
      ok: true,
      debug: {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        database: {
          totalBooks,
          booksWithPdfUrl: booksWithPdf,
          sampleBookStructure: sampleBook ? {
            _id: sampleBook._id,
            title: sampleBook.title,
            author: sampleBook.author,
            category: sampleBook.category,
            branch: sampleBook.branch,
            year: sampleBook.year,
            pdf: {
              url: sampleBook?.pdf?.url ? 'https://...' : 'MISSING',
              publicId: sampleBook?.pdf?.publicId ? '✓ Present' : 'MISSING',
              filename: sampleBook?.pdf?.filename || 'MISSING',
              uploadDate: sampleBook?.pdf?.uploadDate
            }
          } : null
        },
        cloudinary: {
          cloudName: process.env.CLOUDINARY_CLOUD_NAME ? '✓ Configured' : '✗ Missing',
          apiKey: process.env.CLOUDINARY_API_KEY ? '✓ Configured' : '✗ Missing',
          apiSecret: process.env.CLOUDINARY_API_SECRET ? '✓ Configured' : '✗ Missing'
        },
        recommendations: [
          booksWithPdf === 0 && '⚠️ No PDFs uploaded yet. Try uploading a book first.',
          !sampleBook && '⚠️ No PDF data in database. Check upload flow.',
          sampleBook && !sampleBook?.pdf?.url && '⚠️ PDF URL is missing in database. Check Cloudinary upload.',
          sampleBook && sampleBook?.pdf?.url && '✓ PDF URL present in database'
        ].filter(Boolean)
      }
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message,
      debug: 'Check backend console for details'
    });
  }
});

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
 * GET /api/books/most-viewed
 * Get most viewed books
 * Query params: ?limit=10
 */
router.get('/most-viewed', bookController.getMostViewedBooks);

/**
 * GET /api/books/top-rated
 * Get top rated books for recommendations
 */
router.get('/top-rated', bookController.getTopRatedBooks);

/**
 * GET /api/books/recommended
 * Auto-recommend books based on user ratings history
 * Query params: ?userId=email_or_id&limit=8
 */
router.get('/recommended', bookController.getRecommendedBooks);

/**
 * GET /api/books/reports/ratings
 * Ratings analytics report for admin dashboard
 */
router.get('/reports/ratings', bookController.getRatingsReport);

/**
 * GET /api/books/reports/user-activity
 * Users activity analytics report for admin dashboard charts
 */
router.get('/reports/user-activity', bookController.getUserActivityReport);

/**
 * GET /api/books/branch/:branch
 * Get all books in a specific branch
 */
router.get('/branch/:branch', bookController.getBooksByBranch);

/**
 * GET /api/books/:id
 * Get a single book by ID (without PDF data)
 */
router.get('/:id([0-9a-fA-F]{24})', bookController.getBookById);

/**
 * GET /api/books/:id/download
 * Download PDF file
 */
router.get('/:id([0-9a-fA-F]{24})/download', bookController.downloadPDF);

/**
 * GET /api/books/:id/view
 * View PDF in browser
 */
router.get('/:id([0-9a-fA-F]{24})/view', bookController.viewPDF);

/**
 * POST /api/books/:id/track-view
 * Track book view (increment view count)
 */
router.post('/:id([0-9a-fA-F]{24})/track-view', bookController.trackBookView);

/**
 * POST /api/books/:id/rate
 * Submit user rating (1 to 5)
 */
router.post('/:id([0-9a-fA-F]{24})/rate', bookController.rateBook);

/**
 * PUT /api/books/:id
 * Update book details (not the PDF)
 * Requires authentication (optional)
 */
router.put(
  '/:id([0-9a-fA-F]{24})',
  // auth, // Uncomment to require authentication
  bookController.updateBook
);

/**
 * DELETE /api/books/:id
 * Delete a book
 * Requires authentication (optional)
 */
router.delete(
  '/:id([0-9a-fA-F]{24})',
  // auth, // Uncomment to require authentication
  bookController.deleteBook
);

module.exports = router;
