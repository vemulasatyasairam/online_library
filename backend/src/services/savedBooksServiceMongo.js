/**
 * Saved Books Service (MongoDB)
 * Handles saved books business logic using MongoDB
 */

const SavedBookModel = require('../models/SavedBookSchema');

class SavedBooksService {
  /**
   * Get all saved books for user
   */
  static async getSavedBooks(email) {
    try {
      const savedBooks = await SavedBookModel.findByEmail(email);
      
      return {
        ok: true,
        books: savedBooks.map(sb => sb.book),
        count: savedBooks.length
      };
    } catch (err) {
      console.error('Get saved books error:', err);
      return {
        ok: false,
        error: 'Failed to fetch saved books'
      };
    }
  }

  /**
   * Save a book
   */
  static async saveBook(email, bookData) {
    try {
      // Validate book data
      if (!bookData || !bookData.id || !bookData.title) {
        return {
          ok: false,
          error: 'Book ID and title are required'
        };
      }

      // Check if book already saved
      const existing = await SavedBookModel.isBookSaved(email, bookData.id);
      if (existing) {
        return {
          ok: false,
          error: 'Book already saved'
        };
      }

      // Create saved book
      const savedBook = new SavedBookModel({
        email: email.toLowerCase(),
        bookId: bookData.id,
        book: bookData
      });

      await savedBook.save();

      return {
        ok: true,
        message: 'Book saved successfully'
      };
    } catch (err) {
      console.error('Save book error:', err);
      return {
        ok: false,
        error: err.code === 11000 ? 'Book already saved' : 'Failed to save book'
      };
    }
  }

  /**
   * Remove saved book
   */
  static async removeBook(email, bookId) {
    try {
      const result = await SavedBookModel.removeBook(email, bookId);
      
      if (result.deletedCount === 0) {
        return {
          ok: false,
          error: 'Book not found'
        };
      }

      return {
        ok: true,
        message: 'Book removed'
      };
    } catch (err) {
      console.error('Remove book error:', err);
      return {
        ok: false,
        error: 'Failed to remove book'
      };
    }
  }

  /**
   * Get saved book count for user
   */
  static async getSavedCount(email) {
    try {
      const count = await SavedBookModel.countDocuments({ 
        email: email.toLowerCase() 
      });
      
      return {
        ok: true,
        count
      };
    } catch (err) {
      console.error('Get saved count error:', err);
      return {
        ok: false,
        error: 'Failed to get saved count'
      };
    }
  }

  /**
   * Check if book is saved
   */
  static async isBookSaved(email, bookId) {
    try {
      const saved = await SavedBookModel.isBookSaved(email, bookId);
      
      return {
        ok: true,
        isSaved: !!saved
      };
    } catch (err) {
      console.error('Check saved book error:', err);
      return {
        ok: false,
        error: 'Failed to check saved book'
      };
    }
  }

  /**
   * Get saved book by ID
   */
  static async getSavedBookById(email, bookId) {
    try {
      const savedBook = await SavedBookModel.isBookSaved(email, bookId);
      
      if (!savedBook) {
        return {
          ok: false,
          error: 'Book not found'
        };
      }

      return {
        ok: true,
        book: savedBook.book
      };
    } catch (err) {
      console.error('Get saved book error:', err);
      return {
        ok: false,
        error: 'Failed to fetch book'
      };
    }
  }
}

module.exports = SavedBooksService;
