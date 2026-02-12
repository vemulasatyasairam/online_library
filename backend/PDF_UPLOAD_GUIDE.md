# PDF Upload API Documentation

## Overview
This backend now supports PDF upload functionality using the Multer package. PDFs are stored directly in MongoDB as binary data (Buffer).

## Installation
The following package has been installed:
```bash
npm install multer
```

## API Endpoints

### 1. Upload a Book with PDF
**POST** `/api/books/upload`

Upload a new book along with its PDF file.

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `pdf` (file, required): PDF file (max 50MB)
  - `title` (string, required): Book title
  - `author` (string, required): Author name
  - `branch` (string, required): Category/Branch (e.g., "Computer Science", "Mathematics")
  - `subject` (string, optional): Subject
  - `description` (string, optional): Book description
  - `isbn` (string, optional): ISBN number (must be unique)
  - `publishedYear` (number, optional): Year of publication
  - `pageCount` (number, optional): Number of pages
  - `language` (string, optional): Language (default: "English")
  - `uploadedBy` (string, optional): Uploader name/ID
  - `tags` (string or array, optional): Tags (comma-separated or array)

**Example using cURL:**
```bash
curl -X POST http://localhost:3000/api/books/upload \
  -F "pdf=@/path/to/book.pdf" \
  -F "title=Data Structures" \
  -F "author=John Doe" \
  -F "branch=Computer Science" \
  -F "description=A comprehensive guide" \
  -F "isbn=978-1234567890" \
  -F "publishedYear=2024" \
  -F "language=English" \
  -F "tags=algorithms,data-structures"
```

**Response:**
```json
{
  "ok": true,
  "message": "Book uploaded successfully",
  "book": {
    "_id": "65abc123...",
    "title": "Data Structures",
    "author": "John Doe",
    "branch": "Computer Science",
    "pdf": {
      "filename": "1234567890-book.pdf",
      "originalname": "book.pdf",
      "mimetype": "application/pdf",
      "size": 2048576,
      "uploadDate": "2024-01-01T00:00:00.000Z"
    },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 2. Get All Books
**GET** `/api/books`

Get all books with pagination and filtering.

**Query Parameters:**
- `branch` (optional): Filter by branch
- `search` (optional): Search in title, author, subject, tags
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 20): Items per page

**Example:**
```
GET /api/books?branch=Computer Science&search=algorithm&page=1&limit=10
```

**Response:**
```json
{
  "ok": true,
  "books": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

---

### 3. Get Book by ID
**GET** `/api/books/:id`

Get details of a specific book (without PDF data).

**Example:**
```
GET /api/books/65abc123...
```

**Response:**
```json
{
  "ok": true,
  "book": {
    "_id": "65abc123...",
    "title": "Data Structures",
    "author": "John Doe",
    "views": 10,
    "downloads": 5,
    ...
  }
}
```

---

### 4. Download PDF
**GET** `/api/books/:id/download`

Download the PDF file as an attachment.

**Example:**
```
GET /api/books/65abc123.../download
```

**Response:** PDF file download

---

### 5. View PDF in Browser
**GET** `/api/books/:id/view`

View the PDF file inline in the browser.

**Example:**
```
GET /api/books/65abc123.../view
```

**Response:** PDF file displayed in browser

---

### 6. Update Book
**PUT** `/api/books/:id`

Update book details (not the PDF file).

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "tags": ["new-tag1", "new-tag2"]
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Book updated successfully",
  "book": {...}
}
```

---

### 7. Delete Book
**DELETE** `/api/books/:id`

Delete a book and its PDF file.

**Response:**
```json
{
  "ok": true,
  "message": "Book deleted successfully"
}
```

---

### 8. Get Books by Branch
**GET** `/api/books/branch/:branch`

Get all books in a specific branch.

**Example:**
```
GET /api/books/branch/Computer Science
```

---

### 9. Search Books
**GET** `/api/books/search`

Search books by query string.

**Query Parameters:**
- `q` (required): Search query

**Example:**
```
GET /api/books/search?q=algorithms
```

---

## Frontend Integration Example

### HTML Form for Upload
```html
<form id="uploadForm" enctype="multipart/form-data">
  <input type="text" name="title" placeholder="Book Title" required>
  <input type="text" name="author" placeholder="Author" required>
  <input type="text" name="branch" placeholder="Branch" required>
  <textarea name="description" placeholder="Description"></textarea>
  <input type="file" name="pdf" accept=".pdf" required>
  <button type="submit">Upload Book</button>
</form>
```

### JavaScript for Upload
```javascript
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  
  try {
    const response = await fetch('http://localhost:3000/api/books/upload', {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    
    if (data.ok) {
      alert('Book uploaded successfully!');
      console.log(data.book);
    } else {
      alert('Error: ' + data.error);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Upload failed');
  }
});
```

### Fetch and Display Books
```javascript
async function loadBooks() {
  try {
    const response = await fetch('http://localhost:3000/api/books');
    const data = await response.json();
    
    if (data.ok) {
      displayBooks(data.books);
    }
  } catch (error) {
    console.error('Error loading books:', error);
  }
}

function displayBooks(books) {
  const container = document.getElementById('books-container');
  
  books.forEach(book => {
    const bookCard = `
      <div class="book-card">
        <h3>${book.title}</h3>
        <p>Author: ${book.author}</p>
        <p>Branch: ${book.branch}</p>
        <button onclick="viewPDF('${book._id}')">View PDF</button>
        <button onclick="downloadPDF('${book._id}')">Download PDF</button>
      </div>
    `;
    container.innerHTML += bookCard;
  });
}

function viewPDF(bookId) {
  window.open(`http://localhost:3000/api/books/${bookId}/view`, '_blank');
}

function downloadPDF(bookId) {
  window.location.href = `http://localhost:3000/api/books/${bookId}/download`;
}
```

## Database Schema

Books are stored in MongoDB with the following structure:

```javascript
{
  title: String (required),
  author: String (required),
  branch: String (required),
  subject: String,
  description: String,
  isbn: String (unique),
  publishedYear: Number,
  pageCount: Number,
  language: String (default: "English"),
  pdf: {
    filename: String,
    originalname: String,
    mimetype: String,
    size: Number,
    data: Buffer,  // PDF stored as binary data
    uploadDate: Date
  },
  uploadedBy: String,
  downloads: Number (default: 0),
  views: Number (default: 0),
  tags: [String],
  createdAt: Date,
  updatedAt: Date
}
```

## Configuration

The multer configuration is in [src/config/multer.js](backend/src/config/multer.js):
- **Storage:** Memory storage (files stored in memory as Buffer)
- **File Filter:** Only PDF files allowed
- **Size Limit:** 50MB per file

To change the file size limit, edit the `limits` in `multer.js`:
```javascript
limits: {
  fileSize: 50 * 1024 * 1024 // 50MB - adjust as needed
}
```

## Authentication (Optional)

To enable authentication for upload, update, and delete operations, uncomment the `auth` middleware in [src/routes/books.js](backend/src/routes/books.js):

```javascript
router.post('/upload', auth, upload.single('pdf'), handleMulterError, bookController.uploadBook);
```

## Error Handling

Common errors:
- **400**: Invalid request (missing fields, wrong file type)
- **404**: Book or PDF not found
- **413**: File too large (exceeds 50MB)
- **500**: Server error

## Notes

- PDFs are stored as Buffer in MongoDB (binary data)
- When fetching book lists, PDF data is excluded to reduce response size
- PDF data is only sent when explicitly requesting download/view
- The system automatically tracks views and downloads
- ISBNs must be unique across all books

## Testing

Start the server:
```bash
cd backend
npm start
```

The server will run on `http://localhost:3000`.

Test the health endpoint:
```
GET http://localhost:3000/health
```
