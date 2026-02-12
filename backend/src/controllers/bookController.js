const Book = require('../models/BookSchema');

/**
 * Upload a new book with PDF
 */
const uploadBook = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        ok: false,
        error: 'No PDF file uploaded'
      });
    }

    // Extract book data from request body
    const {
      title,
      author,
      subject,
      branch,
      description,
      isbn,
      publishedYear,
      pageCount,
      language,
      uploadedBy,
      tags
    } = req.body;

    // Validate required fields
    if (!title || !author || !branch) {
      return res.status(400).json({
        ok: false,
        error: 'Title, author, and branch are required'
      });
    }

    // Create new book document
    const bookData = {
      title,
      author,
      subject,
      branch,
      description,
      isbn,
      publishedYear: publishedYear ? parseInt(publishedYear) : undefined,
      pageCount: pageCount ? parseInt(pageCount) : undefined,
      language: language || 'English',
      uploadedBy,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
      pdf: {
        filename: req.file.filename || `${Date.now()}-${req.file.originalname}`,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        data: req.file.buffer,
        uploadDate: new Date()
      }
    };

    const book = new Book(bookData);
    await book.save();

    // Return book data without the PDF buffer to reduce response size
    const bookResponse = book.toObject();
    delete bookResponse.pdf.data;

    res.status(201).json({
      ok: true,
      message: 'Book uploaded successfully',
      book: bookResponse
    });

  } catch (error) {
    console.error('Error uploading book:', error);
    
    // Handle duplicate ISBN error
    if (error.code === 11000 && error.keyPattern?.isbn) {
      return res.status(400).json({
        ok: false,
        error: 'A book with this ISBN already exists'
      });
    }

    res.status(500).json({
      ok: false,
      error: error.message || 'Error uploading book'
    });
  }
};

/**
 * Get all books (without PDF data)
 */
const getAllBooks = async (req, res) => {
  try {
    const { branch, search, page = 1, limit = 20 } = req.query;
    
    let query = {};
    
    // Filter by branch if provided
    if (branch) {
      query.branch = branch;
    }
    
    // Search if query provided
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const books = await Book.find(query)
      .select('-pdf.data') // Exclude PDF data from response
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Book.countDocuments(query);

    res.json({
      ok: true,
      books,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error getting books:', error);
    res.status(500).json({
      ok: false,
      error: error.message || 'Error fetching books'
    });
  }
};

/**
 * Get a single book by ID (without PDF data)
 */
const getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const book = await Book.findById(id).select('-pdf.data');
    
    if (!book) {
      return res.status(404).json({
        ok: false,
        error: 'Book not found'
      });
    }

    // Increment views
    await book.incrementViews();

    res.json({
      ok: true,
      book
    });

  } catch (error) {
    console.error('Error getting book:', error);
    res.status(500).json({
      ok: false,
      error: error.message || 'Error fetching book'
    });
  }
};

/**
 * Download PDF file
 */
const downloadPDF = async (req, res) => {
  try {
    const { id } = req.params;
    
    const book = await Book.findById(id);
    
    if (!book) {
      return res.status(404).json({
        ok: false,
        error: 'Book not found'
      });
    }

    if (!book.pdf || !book.pdf.data) {
      return res.status(404).json({
        ok: false,
        error: 'PDF file not found for this book'
      });
    }

    // Increment downloads
    await book.incrementDownloads();

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${book.pdf.originalname}"`);
    res.setHeader('Content-Length', book.pdf.size);

    // Send PDF buffer
    res.send(book.pdf.data);

  } catch (error) {
    console.error('Error downloading PDF:', error);
    res.status(500).json({
      ok: false,
      error: error.message || 'Error downloading PDF'
    });
  }
};

/**
 * View PDF in browser (inline)
 */
const viewPDF = async (req, res) => {
  try {
    const { id } = req.params;
    
    const book = await Book.findById(id);
    
    if (!book) {
      return res.status(404).json({
        ok: false,
        error: 'Book not found'
      });
    }

    if (!book.pdf || !book.pdf.data) {
      return res.status(404).json({
        ok: false,
        error: 'PDF file not found for this book'
      });
    }

    // Increment views
    await book.incrementViews();

    // Set headers for PDF viewing
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${book.pdf.originalname}"`);
    res.setHeader('Content-Length', book.pdf.size);

    // Send PDF buffer
    res.send(book.pdf.data);

  } catch (error) {
    console.error('Error viewing PDF:', error);
    res.status(500).json({
      ok: false,
      error: error.message || 'Error viewing PDF'
    });
  }
};

/**
 * Update book details (not the PDF)
 */
const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      author,
      subject,
      branch,
      description,
      isbn,
      publishedYear,
      pageCount,
      language,
      tags
    } = req.body;

    const book = await Book.findById(id);
    
    if (!book) {
      return res.status(404).json({
        ok: false,
        error: 'Book not found'
      });
    }

    // Update fields
    if (title) book.title = title;
    if (author) book.author = author;
    if (subject !== undefined) book.subject = subject;
    if (branch) book.branch = branch;
    if (description !== undefined) book.description = description;
    if (isbn !== undefined) book.isbn = isbn;
    if (publishedYear !== undefined) book.publishedYear = publishedYear;
    if (pageCount !== undefined) book.pageCount = pageCount;
    if (language) book.language = language;
    if (tags) book.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());

    await book.save();

    // Return without PDF data
    const bookResponse = book.toObject();
    delete bookResponse.pdf.data;

    res.json({
      ok: true,
      message: 'Book updated successfully',
      book: bookResponse
    });

  } catch (error) {
    console.error('Error updating book:', error);
    
    if (error.code === 11000 && error.keyPattern?.isbn) {
      return res.status(400).json({
        ok: false,
        error: 'A book with this ISBN already exists'
      });
    }

    res.status(500).json({
      ok: false,
      error: error.message || 'Error updating book'
    });
  }
};

/**
 * Delete a book
 */
const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    
    const book = await Book.findByIdAndDelete(id);
    
    if (!book) {
      return res.status(404).json({
        ok: false,
        error: 'Book not found'
      });
    }

    res.json({
      ok: true,
      message: 'Book deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({
      ok: false,
      error: error.message || 'Error deleting book'
    });
  }
};

/**
 * Get books by branch
 */
const getBooksByBranch = async (req, res) => {
  try {
    const { branch } = req.params;
    
    const books = await Book.findByBranch(branch).select('-pdf.data');

    res.json({
      ok: true,
      books,
      count: books.length
    });

  } catch (error) {
    console.error('Error getting books by branch:', error);
    res.status(500).json({
      ok: false,
      error: error.message || 'Error fetching books'
    });
  }
};

/**
 * Search books
 */
const searchBooks = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        ok: false,
        error: 'Search query is required'
      });
    }

    const books = await Book.searchBooks(q).select('-pdf.data');

    res.json({
      ok: true,
      books,
      count: books.length,
      query: q
    });

  } catch (error) {
    console.error('Error searching books:', error);
    res.status(500).json({
      ok: false,
      error: error.message || 'Error searching books'
    });
  }
};

module.exports = {
  uploadBook,
  getAllBooks,
  getBookById,
  downloadPDF,
  viewPDF,
  updateBook,
  deleteBook,
  getBooksByBranch,
  searchBooks
};
