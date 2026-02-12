const SavedBooksService = require('../services/savedBooksServiceMongo');

/**
 * Get saved books for user
 */
const getSavedBooks = async (req, res) => {
  try {
    const email = req.user.email;
    const result = await SavedBooksService.getSavedBooks(email);

    if (!result.ok) {
      return res.status(500).json({
        ok: false,
        error: result.error
      });
    }

    res.json(result);
  } catch (err) {
    console.error('Get saved books error:', err);
    res.status(500).json({
      ok: false,
      error: 'Server error'
    });
  }
};

/**
 * Save a book
 */
const saveBook = async (req, res) => {
  try {
    const email = req.user.email;
    const { book } = req.body;

    if (!book) {
      return res.status(400).json({
        ok: false,
        error: 'Book data is required'
      });
    }

    const result = await SavedBooksService.saveBook(email, book);

    if (!result.ok) {
      return res.status(400).json({
        ok: false,
        error: result.error
      });
    }

    res.json(result);
  } catch (err) {
    console.error('Save book error:', err);
    res.status(500).json({
      ok: false,
      error: 'Server error'
    });
  }
};

/**
 * Remove saved book
 */
const removeBook = async (req, res) => {
  try {
    const email = req.user.email;
    const { bookId } = req.params;

    const result = await SavedBooksService.removeBook(email, bookId);

    if (!result.ok) {
      return res.status(400).json({
        ok: false,
        error: result.error
      });
    }

    res.json(result);
  } catch (err) {
    console.error('Remove book error:', err);
    res.status(500).json({
      ok: false,
      error: 'Server error'
    });
  }
};

module.exports = {
  getSavedBooks,
  saveBook,
  removeBook
};
