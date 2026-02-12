/**
 * SavedBook Model
 * Represents a book saved by a user
 */

class SavedBook {
  constructor(data = {}) {
    this.email = data.email || null;
    this.book = data.book || null;
    this.bookId = data.bookId || (data.book ? data.book.id : null);
    this.savedAt = data.savedAt || new Date().toISOString();
    this.notes = data.notes || null;
    this.rating = data.rating || null;
    this.isRead = data.isRead || false;
  }

  /**
   * Validate saved book data
   */
  validate() {
    const errors = [];

    if (!this.email) {
      errors.push('Email is required');
    }

    if (!this.bookId && (!this.book || !this.book.id)) {
      errors.push('Book or book ID is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Update book notes
   */
  updateNotes(notes) {
    this.notes = notes;
    return this;
  }

  /**
   * Update rating (1-5)
   */
  updateRating(rating) {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }
    this.rating = rating;
    return this;
  }

  /**
   * Mark as read
   */
  markAsRead() {
    this.isRead = true;
    return this;
  }

  /**
   * Mark as unread
   */
  markAsUnread() {
    this.isRead = false;
    return this;
  }

  /**
   * Get saved book object for JSON response
   */
  toJSON() {
    return {
      email: this.email,
      book: this.book,
      bookId: this.bookId,
      savedAt: this.savedAt,
      notes: this.notes,
      rating: this.rating,
      isRead: this.isRead
    };
  }

  /**
   * Get minimal saved book object
   */
  toMinimalJSON() {
    return {
      bookId: this.bookId,
      savedAt: this.savedAt,
      isRead: this.isRead
    };
  }

  /**
   * Create SavedBook instance from plain object
   */
  static fromJSON(data) {
    return new SavedBook(data);
  }

  /**
   * Create multiple SavedBook instances from array
   */
  static fromJSONArray(dataArray) {
    return (dataArray || []).map(data => new SavedBook(data));
  }
}

module.exports = SavedBook;
