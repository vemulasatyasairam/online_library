# PDF Display Fix - Quick Reference

## Critical URLs for Testing

```
Admin Dashboard:     http://localhost:5500/pages/admin-dashboard.html
Books Display:       http://localhost:5500/pages/books-display.html
API Health Check:    http://localhost:3000/api/books/debug/check
API Get All Books:   http://localhost:3000/api/books
```

## 5-Minute Diagnostic Steps

### Step 1: Backend OK?
```bash
# Terminal: Check if backend is running
curl http://localhost:3000/api/books

# Should return JSON with "ok": true and "books": [...]
```

### Step 2: Books in Database?
```bash
# In browser console on any page:
fetch('http://localhost:3000/api/books')\
  .then(r=>r.json())\
  .then(d=>console.log('Total books:', d.books.length))
```

### Step 3: PDF URLs Present?
```bash
# In browser console:
fetch('http://localhost:3000/api/books')\
  .then(r=>r.json())\
  .then(d=>d.books[0]?.pdf?.url ? console.log('✓ URL:', d.books[0].pdf.url) : console.log('✗ No URL'))
```

### Step 4: Display Page Works?
```
1. Open: http://localhost:5500/pages/books-display.html
2. Open Console (F12)
3. Click "Fetch Books"
4. Check for [FETCH_BOOKS] logs
5. Should show books with View/Download buttons
```

### Step 5: Cloudinary OK?
```
1. Visit: https://api.cloudinary.com/v1_1/duqfurljh/resource_types
2. Or check console logs for [UPLOAD] messages
```

## What Logs Should Look Like

**✓ SUCCESSFUL UPLOAD:**
```
[UPLOAD] Sending to: http://localhost:3000/api/books/upload
[UPLOAD] Response OK: true
[UPLOAD] Book PDF URL: https://res.cloudinary.com/duqfurljh/raw/upload/v123/online-library/Branch%20Books/CSE/1st%20Year/book.pdf
```

**✓ SUCCESSFUL FETCH:**
```
[FETCH_BOOKS] URL: http://localhost:3000/api/books
[FETCH_BOOKS] Response OK: true
[FETCH_BOOKS] Data structure: {ok: true, booksCount: 5, firstBookKeys: [...]}
[FETCH_BOOKS] First book PDF object: {pdfObject: {url: 'https://...', ...}, pdfUrl: 'https://...'}
```

**✓ BOOK RENDERING:**
```
[RENDER_BOOK] Data Structures -> PDF URL: https://res.cloudinary.com/.../book.pdf
```

## Common Fixes

| Problem | Quick Fix |
|---------|-----------|
| Backend error 500 | Check `.env` Cloudinary credentials |
| No books showing | Upload a book first via admin dashboard |
| PDF URL is '#' | Check API response has pdf.url field |
| CORS error | Restart backend - CORS is pre-configured |
| Upload fails | Check file is PDF and size < 100MB |
| PDF doesn't download | Try opening in new tab first to test Cloudinary |

## Environment Check

**Required in `/backend/.env`:**
```
CLOUDINARY_CLOUD_NAME=duqfurljh
CLOUDINARY_API_KEY=526758682396799
CLOUDINARY_API_SECRET=<your-secret>
```

**Verify Config:**
```bash
# In backend directory:
cat .env | grep CLOUDINARY
```

## Key File Locations

- Backend API: `/backend/src/routes/books.js`
- Backend Logic: `/backend/src/controllers/bookController.js`
- Frontend Upload: `/pages/admin-dashboard.html`
- Frontend Display: `/pages/books-display.html`
- Database Schema: `/backend/src/models/BookSchema.js`

## Reset Data

If you want to start fresh:

```javascript
// Delete all books from MongoDB (browser console at backend):
fetch('http://localhost:3000/api/books', {
  method: 'DELETE',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({})
})
```

## Performance Notes

- PDFs at ~5-10MB: Upload ~2-5 seconds
- Fetching 100 books: ~500ms
- Frontend rendering: ~100-200ms
- Large PDFs (>50MB): May timeout

---

**Full Documentation:** See `PDF_DISPLAY_DEBUG_GUIDE.md`
