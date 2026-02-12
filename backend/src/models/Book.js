/**
 * Book Model
 * Represents a book in the library
 */

class Book {
  constructor(data = {}) {
    this.id = data.id || null;
    this.title = data.title || null;
    this.author = data.author || null;
    this.subject = data.subject || null;
    this.pdf = data.pdf || null;
    this.branch = data.branch || null;
    this.coverImage = data.coverImage || null;
    this.description = data.description || null;
    this.isbn = data.isbn || null;
    this.publishedYear = data.publishedYear || null;
    this.pageCount = data.pageCount || null;
    this.language = data.language || 'English';
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  /**
   * Validate book data
   */
  validate() {
    const errors = [];

    if (!this.id) {
      errors.push('Book ID is required');
    }

    if (!this.title) {
      errors.push('Title is required');
    } else if (this.title.length < 2) {
      errors.push('Title must be at least 2 characters');
    }

    if (!this.author) {
      errors.push('Author is required');
    }

    if (!this.branch) {
      errors.push('Branch/Category is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if book has required fields for display
   */
  isComplete() {
    return this.id && this.title && this.author && this.branch;
  }

  /**
   * Get book object for JSON response
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      author: this.author,
      subject: this.subject,
      pdf: this.pdf,
      branch: this.branch,
      coverImage: this.coverImage,
      description: this.description,
      isbn: this.isbn,
      publishedYear: this.publishedYear,
      pageCount: this.pageCount,
      language: this.language,
      createdAt: this.createdAt
    };
  }

  /**
   * Get minimal book object
   */
  toMinimalJSON() {
    return {
      id: this.id,
      title: this.title,
      author: this.author,
      branch: this.branch,
      pdf: this.pdf
    };
  }

  /**
   * Create Book instance from plain object
   */
  static fromJSON(data) {
    return new Book(data);
  }

  /**
   * Create multiple Book instances from array
   */
  static fromJSONArray(dataArray) {
    return (dataArray || []).map(data => new Book(data));
  }
}

module.exports = Book;
