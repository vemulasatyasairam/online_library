const Book = require('../models/BookSchema');
const User = require('../models/UserSchema');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');
const fs = require('fs');
const path = require('path');

const BRANCH_BOOKS_CATEGORY = 'Branch Books';
const HTML_CATEGORY_PATH_MAP = {
  'course_books.html': 'Course Books',
  'knowledgebooks.html': 'Knowledge Books',
  'english_stories.html': 'English Stories',
  'telugu_novels.html': 'Telugu Novels',
  'devotional.html': 'Devotional',
  'branch_books.html': BRANCH_BOOKS_CATEGORY
};
const CATEGORY_CANONICAL_MAP = {
  'branch books': BRANCH_BOOKS_CATEGORY,
  'branchbooks': BRANCH_BOOKS_CATEGORY,
  'course books': 'Course Books',
  'coursebooks': 'Course Books',
  'knowledge books': 'Knowledge Books',
  'knowledgebooks': 'Knowledge Books',
  devotional: 'Devotional',
  'english stories': 'English Stories',
  'englishstories': 'English Stories',
  'telugu novels': 'Telugu Novels',
  'telugunovels': 'Telugu Novels'
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeCategoryLabel = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return '';

  const key = raw
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const compactKey = key.replace(/\s+/g, '');
  return CATEGORY_CANONICAL_MAP[key] || CATEGORY_CANONICAL_MAP[compactKey] || raw;
};

const buildFlexibleCategoryRegex = (value) => {
  const normalized = normalizeCategoryLabel(value);
  const parts = normalized
    .split(/\s+/)
    .map((part) => escapeRegex(part))
    .filter(Boolean);

  if (!parts.length) return null;
  return new RegExp(`^${parts.join('[-_\\s]*')}$`, 'i');
};

const buildCategoryPathRegex = (value) => {
  const normalized = normalizeCategoryLabel(value);
  const parts = normalized
    .split(/\s+/)
    .map((part) => escapeRegex(part))
    .filter(Boolean);

  if (!parts.length) return null;
  const flexibleSegment = parts.join('[-_\\s]*');
  return new RegExp(`(^|/)${flexibleSegment}(/|$)`, 'i');
};

const normalizeAndSplitPath = (inputPath) => {
  const normalized = (inputPath || '').trim().replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
  if (!normalized) return [];

  return normalized
    .split('/')
    .map((segment) => segment.trim())
    .filter(Boolean);
};

const parseTargetPath = (targetPath) => {
  const rawSegments = normalizeAndSplitPath(targetPath);
  if (!rawSegments.length) return null;

  if (rawSegments.length === 1) {
    const htmlKey = String(rawSegments[0] || '').toLowerCase();
    const mappedCategory = HTML_CATEGORY_PATH_MAP[htmlKey];
    if (mappedCategory) {
      return {
        folderSegments: [mappedCategory],
        category: mappedCategory,
        branch: '',
        year: ''
      };
    }
  }

  const startsWithBooks = rawSegments[0].toLowerCase() === 'books';
  const withoutRoot = startsWithBooks ? rawSegments.slice(1) : rawSegments;

  if (!withoutRoot.length) {
    throw new Error('Target path must include at least a category folder');
  }

  const hasFileName = /\.pdf$/i.test(withoutRoot[withoutRoot.length - 1]);
  const folderSegments = hasFileName ? withoutRoot.slice(0, -1) : withoutRoot;

  if (!folderSegments.length) {
    throw new Error('Target path must include at least a category folder');
  }

  if (folderSegments.some((segment) => segment === '.' || segment === '..')) {
    throw new Error('Target path cannot contain . or .. segments');
  }

  const derivedCategory = folderSegments[0] || '';
  const derivedBranch = derivedCategory === BRANCH_BOOKS_CATEGORY ? (folderSegments[1] || '') : '';
  const derivedYear = derivedCategory === BRANCH_BOOKS_CATEGORY ? (folderSegments[2] || '') : '';

  if (derivedCategory === BRANCH_BOOKS_CATEGORY && (!derivedBranch || !derivedYear)) {
    throw new Error('Branch Books path must include branch and year folders');
  }

  return {
    folderSegments,
    category: derivedCategory,
    branch: derivedBranch,
    year: derivedYear
  };
};

const getApiBaseUrl = (req) => {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const host = req.get('host') || 'localhost:3000';
  return `${protocol}://${host}`;
};

const getCloudinaryPrivateDownloadUrl = (book, attachment = false) => {
  const publicId = (book?.pdf?.publicId || '').trim();
  if (!publicId) return null;

  const isPdfPublicId = /\.pdf$/i.test(publicId);
  const normalizedPublicId = isPdfPublicId ? publicId.replace(/\.pdf$/i, '') : publicId;
  const format = isPdfPublicId ? 'pdf' : undefined;

  try {
    return cloudinary.utils.private_download_url(normalizedPublicId, format, {
      resource_type: 'raw',
      type: 'upload',
      attachment
    });
  } catch (error) {
    console.warn('[getCloudinaryPrivateDownloadUrl] Failed:', error.message);
    return null;
  }
};

const resolveBookPdfUrl = (book, req) => {
  const baseUrl = getApiBaseUrl(req);
  const localPath = (book?.pdf?.localPath || '').trim();

  if (localPath) {
    const normalized = localPath.replace(/\\/g, '/').replace(/^\/+/, '');
    return `${baseUrl}/${normalized}`;
  }

  const rawUrl = (book?.pdf?.url || '').trim();

  if (rawUrl) {
    if (/res\.cloudinary\.com/i.test(rawUrl) && book?.pdf?.publicId) {
      try {
        return cloudinary.url(book.pdf.publicId, {
          resource_type: 'raw',
          type: 'authenticated',
          secure: true,
          sign_url: true
        });
      } catch (error) {
        console.warn('[resolveBookPdfUrl] Cloudinary signed URL generation failed, using raw URL:', error.message);
      }
    }

    if (/^https?:\/\//i.test(rawUrl)) {
      return rawUrl;
    }

    if (rawUrl.startsWith('/')) {
      return `${baseUrl}${rawUrl}`;
    }

    return `${baseUrl}/${rawUrl.replace(/^\/+/, '')}`;
  }
  return null;
};

const resolveBookCoverUrl = (book, req) => {
  const baseUrl = getApiBaseUrl(req);
  const localPath = (book?.coverImage?.localPath || '').trim();

  if (localPath) {
    const normalized = localPath.replace(/\\/g, '/').replace(/^\/+/, '');
    return `${baseUrl}/${normalized}`;
  }

  const rawUrl = (book?.coverImage?.url || '').trim();
  if (!rawUrl) return null;

  if (/^https?:\/\//i.test(rawUrl)) {
    return rawUrl;
  }

  if (rawUrl.startsWith('/')) {
    return `${baseUrl}${rawUrl}`;
  }

  return `${baseUrl}/${rawUrl.replace(/^\/+/, '')}`;
};

const readUploadedFileBuffer = (file) => {
  if (!file) return null;
  if (file.buffer) return file.buffer;
  if (file.path && fs.existsSync(file.path)) {
    return fs.readFileSync(file.path);
  }
  return null;
};

const cleanupUploadedTempFile = (file) => {
  try {
    if (file?.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
  } catch (cleanupError) {
    console.warn('[cleanupUploadedTempFile] Failed:', cleanupError.message);
  }
};

/**
 * Upload a new book with PDF to Cloudinary
 */
const uploadBook = async (req, res) => {
  let pdfFile = null;
  let coverFile = null;

  try {
    pdfFile = req.file || req.files?.pdf?.[0];

    // Check if file was uploaded
    if (!pdfFile) {
      return res.status(400).json({
        ok: false,
        error: 'No PDF file uploaded'
      });
    }

    // Extract book data from request body
    const {
      title,
      author,
      category,
      year,
      targetPath,
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

    let parsedTargetPath = null;
    if (targetPath) {
      try {
        parsedTargetPath = parseTargetPath(targetPath);
      } catch (pathError) {
        return res.status(400).json({
          ok: false,
          error: pathError.message
        });
      }
    }

    const normalizedCategory = normalizeCategoryLabel(parsedTargetPath?.category || category || branch || '');
    const normalizedBranch = (parsedTargetPath?.branch || branch || '').trim();
    const normalizedYear = (parsedTargetPath?.year || year || '').trim();

    // Validate required fields
    if (!title || !author || !normalizedCategory) {
      return res.status(400).json({
        ok: false,
        error: 'Book name, author name, and category are required'
      });
    }

    if (normalizedCategory === BRANCH_BOOKS_CATEGORY) {
      if (!normalizedBranch || !normalizedYear) {
        return res.status(400).json({
          ok: false,
          error: 'Branch and year are required when category is Branch Books'
        });
      }
    }

    const resolvedFolderSegments = parsedTargetPath
      ? parsedTargetPath.folderSegments
      : [
          normalizedCategory,
          normalizedCategory === BRANCH_BOOKS_CATEGORY ? normalizedBranch : null,
          normalizedCategory === BRANCH_BOOKS_CATEGORY ? normalizedYear : null
        ].filter(Boolean);

    const folderParts = [
      'online-library',
      ...resolvedFolderSegments
    ].filter(Boolean).map(value =>
      value
        .toString()
        .trim()
        .replace(/[^a-zA-Z0-9\s-_]/g, '')
        .replace(/\s+/g, '-')
    );

    const safeOriginalFilename = pdfFile.originalname
      .replace(/[^a-zA-Z0-9\s._-]/g, '')
      .replace(/\s+/g, '_');
    const localFileName = `${Date.now()}_${safeOriginalFilename}`;
    const localFolderSegments = parsedTargetPath
      ? ['books', ...parsedTargetPath.folderSegments]
      : [
          'books',
          normalizedCategory,
          normalizedCategory === BRANCH_BOOKS_CATEGORY ? normalizedBranch : null,
          normalizedCategory === BRANCH_BOOKS_CATEGORY ? normalizedYear : null
        ].filter(Boolean);
    const localDirectory = path.join(process.cwd(), ...localFolderSegments);
    const localRelativePath = [...localFolderSegments, localFileName].join('/');

    const pdfBuffer = readUploadedFileBuffer(pdfFile);
    if (!pdfBuffer) {
      return res.status(400).json({
        ok: false,
        error: 'Unable to read uploaded PDF file'
      });
    }

    fs.mkdirSync(localDirectory, { recursive: true });
    fs.writeFileSync(path.join(localDirectory, localFileName), pdfBuffer);

    coverFile = req.files?.cover?.[0] || null;
    const coverBuffer = readUploadedFileBuffer(coverFile);
    let coverData = null;
    if (coverFile) {
      const safeCoverName = coverFile.originalname
        .replace(/[^a-zA-Z0-9\s._-]/g, '')
        .replace(/\s+/g, '_');
      const coverFileName = `${Date.now()}_${safeCoverName}`;
      const coverDirectory = path.join(process.cwd(), 'uploads', 'covers');
      const coverLocalRelativePath = ['uploads', 'covers', coverFileName].join('/');

      if (!coverBuffer) {
        return res.status(400).json({
          ok: false,
          error: 'Unable to read uploaded cover image'
        });
      }

      fs.mkdirSync(coverDirectory, { recursive: true });
      fs.writeFileSync(path.join(coverDirectory, coverFileName), coverBuffer);

      coverData = {
        filename: coverFileName,
        mimetype: coverFile.mimetype,
        localPath: coverLocalRelativePath,
        url: `/${coverLocalRelativePath}`
      };
    }

    let uploadResult = null;
    let uploadWarning = '';
    try {
      uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'raw',
            folder: folderParts.join('/'),
            public_id: `${Date.now()}-${pdfFile.originalname.replace(/\.pdf$/i, '').replace(/[^a-zA-Z0-9\s-_]/g, '').replace(/\s+/g, '-')}`,
            format: 'pdf'
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );

        streamifier.createReadStream(pdfBuffer).pipe(uploadStream);
      });
    } catch (cloudinaryError) {
      const cloudinaryMessage = String(cloudinaryError?.message || '');
      const cloudinarySizeLimitHit =
        /file size too large/i.test(cloudinaryMessage) ||
        (cloudinaryError?.http_code === 400 && /maximum is/i.test(cloudinaryMessage));

      if (!cloudinarySizeLimitHit) {
        throw cloudinaryError;
      }

      uploadWarning = 'Cloudinary file-size limit reached. Saved using local storage path only.';
      console.warn('[uploadBook] Cloudinary size limit hit, falling back to local storage only');
    }

    // Create new book document with Cloudinary URL
    const bookData = {
      title,
      author,
      category: normalizedCategory,
      year: normalizedYear || null,
      subject,
      branch: normalizedCategory === BRANCH_BOOKS_CATEGORY ? normalizedBranch : null,
      description,
      isbn,
      publishedYear: publishedYear ? parseInt(publishedYear) : undefined,
      pageCount: pageCount ? parseInt(pageCount) : undefined,
      language: language || 'English',
      uploadDate: new Date(),
      uploadedBy,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
      pdf: {
        filename: localFileName,
        originalname: pdfFile.originalname,
        mimetype: pdfFile.mimetype,
        size: pdfFile.size,
        url: uploadResult?.secure_url || `/${localRelativePath}`,
        localPath: localRelativePath,
        publicId: uploadResult?.public_id || null,
        uploadDate: new Date()
      },
      coverImage: coverData || undefined
    };

    const book = new Book(bookData);
    await book.save();

    console.log('Book saved to database:', book._id);

    res.status(201).json({
      ok: true,
      message: uploadWarning || 'Book uploaded successfully',
      book: book.toObject()
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
  } finally {
    cleanupUploadedTempFile(pdfFile);
    cleanupUploadedTempFile(coverFile);
  }
};

/**
 * Get all books (without PDF data)
 */
const getAllBooks = async (req, res) => {
  try {
    const { branch, category, year, search, page = 1, limit = 20 } = req.query;
    
    let query = {};
    
    // Filter by branch if provided
    if (branch) {
      query.branch = { $regex: `^${escapeRegex(branch)}$`, $options: 'i' };
    }

    const andClauses = [];

    if (category) {
      const categoryRegex = buildFlexibleCategoryRegex(category);
      const categoryPathRegex = buildCategoryPathRegex(category);
      const categoryOr = [];

      if (categoryRegex) {
        categoryOr.push({ category: categoryRegex });
      }

      if (categoryPathRegex) {
        categoryOr.push({ 'pdf.localPath': categoryPathRegex });
      }

      if (categoryOr.length === 1) {
        andClauses.push(categoryOr[0]);
      } else if (categoryOr.length > 1) {
        andClauses.push({ $or: categoryOr });
      }
    }

    if (year) {
      query.year = { $regex: `^${escapeRegex(year)}$`, $options: 'i' };
    }
    
    // Search if query provided
    if (search) {
      andClauses.push({
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ]
      });
    }

    if (andClauses.length === 1) {
      Object.assign(query, andClauses[0]);
    } else if (andClauses.length > 1) {
      query.$and = andClauses;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const books = await Book.find(query)
      .select('-pdf.data -coverImage.data') // Exclude large data fields
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Book.countDocuments(query);

    const booksWithResolvedPdf = books.map((bookDoc) => {
      const book = bookDoc.toObject();
      const resolvedPdfUrl = resolveBookPdfUrl(bookDoc, req);
      const resolvedCoverUrl = resolveBookCoverUrl(bookDoc, req);

      if (!book.pdf) {
        book.pdf = {};
      }

      book.viewUrl = `${getApiBaseUrl(req)}/api/books/${book._id}/view`;
      book.downloadUrl = `${getApiBaseUrl(req)}/api/books/${book._id}/download`;
      book.pdfUrl = book.viewUrl;

      if (resolvedPdfUrl) {
        book.pdf.url = resolvedPdfUrl;
      }

      if (resolvedCoverUrl) {
        book.book_cover = resolvedCoverUrl;
        book.coverImage = resolvedCoverUrl;
      }

      return book;
    });

    console.log(`[API GET /books] Query:`, query);
    console.log(`[API GET /books] Found ${booksWithResolvedPdf.length} books`);
    if (booksWithResolvedPdf.length > 0) {
      console.log(`[API GET /books] Sample book PDF object:`, {
        url: booksWithResolvedPdf[0]?.pdf?.url ? '✓ Present' : '✗ Missing',
        publicId: booksWithResolvedPdf[0]?.pdf?.publicId ? '✓ Present' : '✗ Missing',
        filename: booksWithResolvedPdf[0]?.pdf?.filename ? '✓ Present' : '✗ Missing'
      });
    }

    res.json({
      ok: true,
      books: booksWithResolvedPdf,
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
    
    const book = await Book.findById(id).select('-pdf.data -coverImage.data');
    
    if (!book) {
      return res.status(404).json({
        ok: false,
        error: 'Book not found'
      });
    }

    // Increment views
    await book.incrementViews();

    const bookPayload = book.toObject();
    const resolvedCoverUrl = resolveBookCoverUrl(book, req);
    if (resolvedCoverUrl) {
      bookPayload.book_cover = resolvedCoverUrl;
      bookPayload.coverImage = resolvedCoverUrl;
    }

    res.json({
      ok: true,
      book: bookPayload
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
 * Update a specific book cover image
 * POST /api/books/:id/cover
 */
const updateBookCover = async (req, res) => {
  try {
    const { id } = req.params;
    const coverFile = req.file;

    if (!coverFile) {
      return res.status(400).json({
        ok: false,
        error: 'No cover image uploaded'
      });
    }

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({
        ok: false,
        error: 'Book not found'
      });
    }

    const safeCoverName = coverFile.originalname
      .replace(/[^a-zA-Z0-9\s._-]/g, '')
      .replace(/\s+/g, '_');
    const coverFileName = `${Date.now()}_${safeCoverName}`;
    const coverDirectory = path.join(process.cwd(), 'uploads', 'covers');
    const coverLocalRelativePath = ['uploads', 'covers', coverFileName].join('/');

    fs.mkdirSync(coverDirectory, { recursive: true });
    fs.writeFileSync(path.join(coverDirectory, coverFileName), coverFile.buffer);

    book.coverImage = {
      filename: coverFileName,
      mimetype: coverFile.mimetype,
      localPath: coverLocalRelativePath,
      url: `/${coverLocalRelativePath}`
    };
    await book.save();

    const coverUrl = resolveBookCoverUrl(book, req);
    return res.json({
      ok: true,
      message: 'Book cover updated successfully',
      bookId: book._id,
      coverImage: coverUrl
    });
  } catch (error) {
    console.error('Error updating book cover:', error);
    return res.status(500).json({
      ok: false,
      error: error.message || 'Error updating book cover'
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

    if (!book.pdf) {
      return res.status(404).json({
        ok: false,
        error: 'PDF file not found for this book'
      });
    }

    // Increment downloads
    await book.incrementDownloads();

    if (book.pdf?.localPath) {
      const normalized = book.pdf.localPath.replace(/\\/g, '/').replace(/^\/+/, '');
      return res.redirect(`${getApiBaseUrl(req)}/${normalized}`);
    }

    const privateDownloadUrl = getCloudinaryPrivateDownloadUrl(book, true);
    if (privateDownloadUrl) {
      return res.redirect(privateDownloadUrl);
    }

    const resolvedPdfUrl = resolveBookPdfUrl(book, req);
    if (resolvedPdfUrl) {
      return res.redirect(resolvedPdfUrl);
    }

    return res.status(404).json({
      ok: false,
      error: 'PDF file not found for this book'
    });

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
      return res.status(404).json({ ok: false, error: 'Book not found' });
    }

    if (!book.pdf) {
      return res.status(404).json({ ok: false, error: 'PDF file not found for this book' });
    }

    // Increment views
    await book.incrementViews();

    // Set headers so browser renders inline (no forced download)
    const safeTitle = (book.title || 'book').replace(/[^a-zA-Z0-9 _-]/g, '').replace(/\s+/g, '_') + '.pdf';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${safeTitle}"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Serve local files directly
    if (book.pdf?.localPath) {
      const path = require('path');
      const fs = require('fs');
      const absPath = path.resolve(book.pdf.localPath.replace(/\\/g, '/'));
      if (!fs.existsSync(absPath)) {
        return res.status(404).json({ ok: false, error: 'Local PDF file not found' });
      }
      return res.sendFile(absPath);
    }

    // Proxy remote (Cloudinary) PDF so #toolbar=0 fragment works in iframe
    const https = require('https');
    const http = require('http');

    const privateViewUrl = getCloudinaryPrivateDownloadUrl(book, false);
    const resolvedPdfUrl = privateViewUrl || resolveBookPdfUrl(book, req);

    if (!resolvedPdfUrl) {
      return res.status(404).json({ ok: false, error: 'PDF URL could not be resolved' });
    }

    const client = resolvedPdfUrl.startsWith('https') ? https : http;
    client.get(resolvedPdfUrl, (upstream) => {
      if (upstream.statusCode >= 300 && upstream.statusCode < 400 && upstream.headers.location) {
        // Follow one redirect
        const loc = upstream.headers.location;
        const redirClient = loc.startsWith('https') ? https : http;
        redirClient.get(loc, (redirected) => {
          redirected.pipe(res);
        }).on('error', (err) => {
          console.error('PDF proxy redirect error:', err.message);
          if (!res.headersSent) res.status(502).json({ ok: false, error: 'Failed to fetch PDF' });
        });
        return;
      }
      upstream.pipe(res);
    }).on('error', (err) => {
      console.error('PDF proxy error:', err.message);
      if (!res.headersSent) res.status(502).json({ ok: false, error: 'Failed to fetch PDF' });
    });

  } catch (error) {
    console.error('Error viewing PDF:', error);
    res.status(500).json({ ok: false, error: error.message || 'Error viewing PDF' });
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

    const book = await Book.findById(id);
    
    if (!book) {
      return res.status(404).json({
        ok: false,
        error: 'Book not found'
      });
    }

    if (book.pdf && book.pdf.publicId) {
      try {
        await cloudinary.uploader.destroy(book.pdf.publicId, {
          resource_type: 'raw'
        });
      } catch (cloudinaryDeleteError) {
        console.error('Cloudinary delete failed:', cloudinaryDeleteError.message);
      }
    }

    await book.deleteOne();

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

/**
 * Track book view (increment view count)
 */
const trackBookView = async (req, res) => {
  try {
    const { id } = req.params;
    
    const book = await Book.findById(id);
    
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
      message: 'Book view tracked successfully',
      views: book.views
    });

  } catch (error) {
    console.error('Error tracking book view:', error);
    res.status(500).json({
      ok: false,
      error: error.message || 'Error tracking book view'
    });
  }
};

/**
 * Get most viewed books
 */
const getMostViewedBooks = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const books = await Book.find()
      .select('-pdf.data')
      .sort({ views: -1 })
      .limit(parseInt(limit));

    res.json({
      ok: true,
      books,
      count: books.length
    });

  } catch (error) {
    console.error('Error getting most viewed books:', error);
    res.status(500).json({
      ok: false,
      error: error.message || 'Error fetching most viewed books'
    });
  }
};

/**
 * Rate a book
 * POST /api/books/:id/rate
 * Body: { rating: 1..5, userId?: string }
 */
const rateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, userId } = req.body || {};

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({
        ok: false,
        error: 'Book not found'
      });
    }

    await book.applyRating(rating, userId);

    return res.json({
      ok: true,
      message: 'Rating submitted successfully',
      rating: {
        average: book.rating?.average || 0,
        count: book.rating?.count || 0
      }
    });
  } catch (error) {
    console.error('Error rating book:', error);
    return res.status(400).json({
      ok: false,
      error: error.message || 'Error submitting rating'
    });
  }
};

/**
 * Get top rated books
 * GET /api/books/top-rated?limit=8
 */
const getTopRatedBooks = async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    const max = Math.max(1, Math.min(parseInt(limit, 10) || 8, 50));

    const books = await Book.find({ 'rating.count': { $gt: 0 } })
      .select('-pdf.data -coverImage.data')
      .sort({ 'rating.average': -1, 'rating.count': -1, views: -1 })
      .limit(max);

    res.json({
      ok: true,
      books,
      count: books.length
    });
  } catch (error) {
    console.error('Error getting top rated books:', error);
    res.status(500).json({
      ok: false,
      error: error.message || 'Error fetching top rated books'
    });
  }
};

/**
 * Get automatically recommended books for a user based on rating history
 * GET /api/books/recommended?userId=email_or_id&limit=8
 */
const getRecommendedBooks = async (req, res) => {
  try {
    const {
      userId = '',
      limit = 8,
      preferredBranch = '',
      preferredYear = '',
      preferredCategory = ''
    } = req.query;
    const normalizedUserId = String(userId || '').trim();
    const normalizedPreferredBranch = String(preferredBranch || '').trim();
    const normalizedPreferredYear = String(preferredYear || '').trim();
    const normalizedPreferredCategory = String(preferredCategory || '').trim();
    const max = Math.max(1, Math.min(parseInt(limit, 10) || 8, 50));

    const buildColdStartQuery = () => {
      const query = { 'rating.count': { $gt: 0 } };
      if (normalizedPreferredCategory) {
        query.category = { $regex: `^${escapeRegex(normalizedPreferredCategory)}$`, $options: 'i' };
      }
      if (normalizedPreferredBranch) {
        query.branch = { $regex: `^${escapeRegex(normalizedPreferredBranch)}$`, $options: 'i' };
      }
      if (normalizedPreferredYear) {
        query.year = { $regex: `^${escapeRegex(normalizedPreferredYear)}$`, $options: 'i' };
      }
      return query;
    };

    const fetchTopRated = async (query = { 'rating.count': { $gt: 0 } }) => {
      return Book.find(query)
        .select('-pdf.data -coverImage.data')
        .sort({ 'rating.average': -1, 'rating.count': -1, views: -1 })
        .limit(max);
    };

    // If user id is missing, fall back to global top-rated books.
    if (!normalizedUserId) {
      let books = await fetchTopRated(buildColdStartQuery());
      if (!books.length) {
        books = await fetchTopRated();
      }

      return res.json({
        ok: true,
        personalized: false,
        source: (normalizedPreferredBranch || normalizedPreferredYear || normalizedPreferredCategory)
          ? 'cold-start-preferences'
          : 'top-rated',
        books,
        count: books.length
      });
    }

    // Read books this user has rated and infer preferences from high ratings.
    const ratedBooks = await Book.find({ 'rating.users.userId': normalizedUserId })
      .select('category branch rating.users');

    if (!ratedBooks.length) {
      let books = await fetchTopRated(buildColdStartQuery());
      if (!books.length) {
        books = await fetchTopRated();
      }

      return res.json({
        ok: true,
        personalized: false,
        source: (normalizedPreferredBranch || normalizedPreferredYear || normalizedPreferredCategory)
          ? 'cold-start-preferences'
          : 'top-rated',
        books,
        count: books.length
      });
    }

    const ratedBookIds = [];
    const categoryWeight = Object.create(null);
    const branchWeight = Object.create(null);

    ratedBooks.forEach((book) => {
      ratedBookIds.push(book._id);
      const userRating = (book.rating?.users || []).find((entry) => entry.userId === normalizedUserId);
      const score = Number(userRating?.value || 0);
      if (score < 4) return;

      if (book.category) {
        categoryWeight[book.category] = (categoryWeight[book.category] || 0) + score;
      }
      if (book.branch) {
        branchWeight[book.branch] = (branchWeight[book.branch] || 0) + score;
      }
    });

    // Candidate pool: rated books with social proof, excluding already rated by this user.
    const candidates = await Book.find({
      'rating.count': { $gt: 0 },
      _id: { $nin: ratedBookIds }
    })
      .select('-pdf.data -coverImage.data')
      .limit(150);

    // If user gave no high ratings yet, use top-rated fallback.
    const hasPreferenceSignals = Object.keys(categoryWeight).length > 0 || Object.keys(branchWeight).length > 0;
    if (!hasPreferenceSignals) {
      const books = candidates
        .sort((a, b) => {
          const ar = Number(a.rating?.average || 0);
          const br = Number(b.rating?.average || 0);
          if (br !== ar) return br - ar;
          const ac = Number(a.rating?.count || 0);
          const bc = Number(b.rating?.count || 0);
          if (bc !== ac) return bc - ac;
          return Number(b.views || 0) - Number(a.views || 0);
        })
        .slice(0, max);

      return res.json({
        ok: true,
        personalized: false,
        source: 'top-rated',
        books,
        count: books.length
      });
    }

    const scored = candidates.map((book) => {
      const quality =
        Number(book.rating?.average || 0) * 2 +
        Math.log10(Number(book.rating?.count || 0) + 1) +
        Number(book.views || 0) / 500;

      const preference =
        (categoryWeight[book.category] || 0) * 0.25 +
        (branchWeight[book.branch] || 0) * 0.2;

      return {
        book,
        score: quality + preference
      };
    });

    const books = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, max)
      .map((item) => item.book);

    return res.json({
      ok: true,
      personalized: true,
      source: 'ratings-based',
      books,
      count: books.length
    });
  } catch (error) {
    console.error('Error getting recommended books:', error);
    return res.status(500).json({
      ok: false,
      error: error.message || 'Error fetching recommended books'
    });
  }
};

/**
 * Get ratings report for admin dashboard
 * GET /api/books/reports/ratings?limit=10
 */
const getRatingsReport = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const max = Math.max(1, Math.min(parseInt(limit, 10) || 10, 100));

    const topRatedBooks = await Book.find({ 'rating.count': { $gt: 0 } })
      .select('title author category branch year rating views')
      .sort({ 'rating.average': -1, 'rating.count': -1, views: -1 })
      .limit(max);

    const activeRaters = await Book.aggregate([
      { $unwind: '$rating.users' },
      {
        $group: {
          _id: '$rating.users.userId',
          ratingsCount: { $sum: 1 },
          averageGiven: { $avg: '$rating.users.value' },
          lastRatedAt: { $max: '$rating.users.updatedAt' }
        }
      },
      { $sort: { ratingsCount: -1, averageGiven: -1 } },
      { $limit: max },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          ratingsCount: 1,
          averageGiven: { $round: ['$averageGiven', 2] },
          lastRatedAt: 1
        }
      }
    ]);

    const totalRatings = topRatedBooks.reduce((sum, book) => sum + Number(book?.rating?.count || 0), 0);

    return res.json({
      ok: true,
      summary: {
        ratedBooks: topRatedBooks.length,
        activeRaters: activeRaters.length,
        totalRatings
      },
      topRatedBooks,
      activeRaters
    });
  } catch (error) {
    console.error('Error getting ratings report:', error);
    return res.status(500).json({
      ok: false,
      error: error.message || 'Error fetching ratings report'
    });
  }
};

/**
 * Get user activity report for admin dashboard charts
 * GET /api/books/reports/user-activity?days=14&limit=8
 */
const getUserActivityReport = async (req, res) => {
  try {
    const { days = 14, limit = 8 } = req.query;
    const trendDays = Math.max(7, Math.min(parseInt(days, 10) || 14, 60));
    const max = Math.max(3, Math.min(parseInt(limit, 10) || 8, 20));

    const now = new Date();
    const startDate = new Date(now);
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() - (trendDays - 1));

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalUsers,
      activeUsers7d,
      newUsers30d,
      totalBooks,
      booksSummary,
      ratingsByDay,
      uploadsByDay,
      usersByDay,
      topActiveUsers,
      categoryEngagement
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ lastLogin: { $gte: sevenDaysAgo } }),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Book.countDocuments({}),
      Book.aggregate([
        {
          $group: {
            _id: null,
            totalViews: { $sum: '$views' },
            totalDownloads: { $sum: '$downloads' },
            totalRatings: { $sum: { $ifNull: ['$rating.count', 0] } }
          }
        }
      ]),
      Book.aggregate([
        { $unwind: '$rating.users' },
        { $match: { 'rating.users.updatedAt': { $gte: startDate } } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$rating.users.updatedAt'
              }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Book.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt'
              }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      User.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt'
              }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Book.aggregate([
        { $unwind: '$rating.users' },
        {
          $group: {
            _id: '$rating.users.userId',
            ratingsCount: { $sum: 1 },
            averageGiven: { $avg: '$rating.users.value' },
            lastRatedAt: { $max: '$rating.users.updatedAt' }
          }
        },
        { $sort: { ratingsCount: -1, averageGiven: -1 } },
        { $limit: max },
        {
          $project: {
            _id: 0,
            userId: '$_id',
            ratingsCount: 1,
            averageGiven: { $round: ['$averageGiven', 2] },
            lastRatedAt: 1
          }
        }
      ]),
      Book.aggregate([
        {
          $group: {
            _id: {
              $ifNull: [
                {
                  $cond: [
                    { $eq: [{ $ifNull: ['$category', ''] }, ''] },
                    '$branch',
                    '$category'
                  ]
                },
                'General'
              ]
            },
            books: { $sum: 1 },
            views: { $sum: { $ifNull: ['$views', 0] } },
            downloads: { $sum: { $ifNull: ['$downloads', 0] } },
            ratings: { $sum: { $ifNull: ['$rating.count', 0] } }
          }
        },
        { $sort: { views: -1, downloads: -1, ratings: -1 } },
        { $limit: max },
        {
          $project: {
            _id: 0,
            category: '$_id',
            books: 1,
            views: 1,
            downloads: 1,
            ratings: 1
          }
        }
      ])
    ]);

    const formatDateKey = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const dailyKeys = [];
    for (let i = 0; i < trendDays; i += 1) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      dailyKeys.push(formatDateKey(d));
    }

    const toCountMap = (items) => {
      const map = new Map();
      (items || []).forEach((item) => {
        map.set(item._id, Number(item.count || 0));
      });
      return map;
    };

    const ratingsMap = toCountMap(ratingsByDay);
    const uploadsMap = toCountMap(uploadsByDay);
    const usersMap = toCountMap(usersByDay);

    const trend = dailyKeys.map((key) => ({
      date: key,
      ratings: ratingsMap.get(key) || 0,
      uploads: uploadsMap.get(key) || 0,
      newUsers: usersMap.get(key) || 0
    }));

    const totals = booksSummary[0] || { totalViews: 0, totalDownloads: 0, totalRatings: 0 };

    return res.json({
      ok: true,
      summary: {
        totalUsers,
        activeUsers7d,
        newUsers30d,
        totalBooks,
        totalViews: Number(totals.totalViews || 0),
        totalDownloads: Number(totals.totalDownloads || 0),
        totalRatings: Number(totals.totalRatings || 0)
      },
      trend,
      topActiveUsers,
      categoryEngagement
    });
  } catch (error) {
    console.error('Error getting user activity report:', error);
    return res.status(500).json({
      ok: false,
      error: error.message || 'Error fetching user activity report'
    });
  }
};

/**
 * Register a local file (without Cloudinary upload)
 */
const registerLocalBook = async (req, res) => {
  try {
    const { title, author, category, branch, year, filePath } = req.body;
    const normalizedFilePath = String(filePath || '').trim();
    const isExternalPdfUrl = /^https?:\/\//i.test(normalizedFilePath);
    let parsedLocalPath = null;

    // Validate required fields
    if (!title || !author || !category || !normalizedFilePath) {
      return res.status(400).json({
        ok: false,
        error: 'Book name, author, category, and file path are required'
      });
    }

    if (!isExternalPdfUrl && !normalizedFilePath.toLowerCase().endsWith('.pdf')) {
      return res.status(400).json({
        ok: false,
        error: 'File path must end with .pdf (or provide a full Cloudinary/HTTP PDF URL)'
      });
    }

    if (!isExternalPdfUrl) {
      try {
        parsedLocalPath = parseTargetPath(normalizedFilePath);
      } catch (pathError) {
        return res.status(400).json({
          ok: false,
          error: `${pathError.message}. Use HTML path format like books/Category/filename.pdf`
        });
      }
    }

    const normalizedCategory = normalizeCategoryLabel(parsedLocalPath?.category || category || '');
    const normalizedBranch = (parsedLocalPath?.branch || branch || '').trim();
    const normalizedYear = (parsedLocalPath?.year || year || '').trim();

    if (normalizedCategory === BRANCH_BOOKS_CATEGORY) {
      if (!normalizedBranch || !normalizedYear) {
        return res.status(400).json({
          ok: false,
          error: 'Branch and year are required when category is Branch Books'
        });
      }
    }

    // Extract filename from path
    const pathParts = normalizedFilePath.replace(/\\/g, '/').split('/');
    const filename = pathParts[pathParts.length - 1];

    // Create book data
    const bookData = {
      title,
      author,
      category: normalizedCategory,
      year: normalizedYear || null,
      branch: normalizedCategory === BRANCH_BOOKS_CATEGORY ? normalizedBranch : null,
      description: null,
      language: 'English',
      uploadDate: new Date(),
      uploadedBy: 'admin',
      tags: [],
      pdf: {
        filename: filename,
        originalname: filename,
        mimetype: 'application/pdf',
        size: 0,
        url: isExternalPdfUrl ? normalizedFilePath : null,
        localPath: isExternalPdfUrl ? null : normalizedFilePath,
        publicId: null,
        uploadDate: new Date()
      }
    };

    const book = new Book(bookData);
    await book.save();

    console.log('[REGISTER-LOCAL] Book saved to database:', book._id);
    console.log('[REGISTER-LOCAL] File path:', normalizedFilePath);

    // Resolve the URL for response
    const resolvedUrl = resolveBookPdfUrl(book, req);

    const responseBook = book.toObject();
    if (responseBook.pdf) {
      responseBook.pdf.url = resolvedUrl;
    }
    responseBook.pdfUrl = resolvedUrl;
    responseBook.viewUrl = `${getApiBaseUrl(req)}/api/books/${responseBook._id}/view`;
    responseBook.downloadUrl = `${getApiBaseUrl(req)}/api/books/${responseBook._id}/download`;

    res.status(201).json({
      ok: true,
      message: 'Book registered successfully',
      book: responseBook
    });

  } catch (error) {
    console.error('Error registering local book:', error);

    if (error.code === 11000 && error.keyPattern?.isbn) {
      return res.status(400).json({
        ok: false,
        error: 'A book with this ISBN already exists'
      });
    }

    res.status(500).json({
      ok: false,
      error: error.message || 'Error registering book'
    });
  }
};

module.exports = {
  uploadBook,
  registerLocalBook,
  getAllBooks,
  getBookById,
  downloadPDF,
  viewPDF,
  updateBook,
  deleteBook,
  getBooksByBranch,
  searchBooks,
  trackBookView,
  getMostViewedBooks,
  updateBookCover,
  rateBook,
  getTopRatedBooks,
  getRecommendedBooks,
  getRatingsReport,
  getUserActivityReport
};
