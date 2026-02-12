const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const savedController = require('../controllers/savedController');

// Protect all saved routes
router.use(authMiddleware);

// Get saved books
router.get('/', savedController.getSavedBooks);

// Save a book
router.post('/', savedController.saveBook);

// Remove a book
router.delete('/:bookId', savedController.removeBook);

module.exports = router;
