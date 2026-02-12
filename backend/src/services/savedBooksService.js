/**
 * Saved Books Service
 * Handles saved books business logic
 */

const fileStore = require('../utils/fileStore');
const { Book, SavedBook } = require('../models');

class SavedBooksService {
  /**
   * Get all saved books for user
   */
  static getSavedBooks(email) {
    try {
      const books = fileStore.getSavedBooks(email);
      const bookInstances = books.map(b => 
        b instanceof Book ? b : Book.fromJSON(b)
      );
      return {
        ok: true,
        books: bookInstances.map(b => b.toJSON()),
        count: bookInstances.length
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
  static saveBook(email, bookData) {
    try {
      // Validate book data
      const book = new Book(bookData);
      const validation = book.validate();
      if (!validation.isValid) {
        return {
          ok: false,
          error: validation.errors.join(', ')
        };
      }

      // Check if book already saved
      const existingSavedBooks = fileStore.getSavedBooks(email);
      if (existingSavedBooks.find(b => {
        const bookInstance = b instanceof Book ? b : Book.fromJSON(b);
        return bookInstance.id === book.id;
      })) {
        return {
          ok: false,
          error: 'Book already saved'
        };
      }

      // Save book
      fileStore.addSavedBook(email, book);

      return {
        ok: true,
        message: 'Book saved successfully'
      };
    } catch (err) {
      console.error('Save book error:', err);
      return {
        ok: false,
        error: 'Failed to save book'
      };
    }
  }

  /**
   * Remove saved book
   */
  static removeBook(email, bookId) {
    try {
      fileStore.removeSavedBook(email, bookId);
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
  static getSavedCount(email) {
    try {
      const books = fileStore.getSavedBooks(email);
      return {
        ok: true,
        count: books.length
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
  static isBookSaved(email, bookId) {
    try {
      const books = fileStore.getSavedBooks(email);
      const isSaved = books.some(b => {
        const bookInstance = b instanceof Book ? b : Book.fromJSON(b);
        return bookInstance.id === bookId;
      });
      return {
        ok: true,
        isSaved
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
  static getSavedBookById(email, bookId) {
    try {
      const books = fileStore.getSavedBooks(email);
      const book = books.find(b => {
        const bookInstance = b instanceof Book ? b : Book.fromJSON(b);
        return bookInstance.id === bookId;
      });

      if (!book) {
        return {
          ok: false,
          error: 'Book not found'
        };
      }

      const bookInstance = book instanceof Book ? book : Book.fromJSON(book);
      return {
        ok: true,
        book: bookInstance.toJSON()
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
