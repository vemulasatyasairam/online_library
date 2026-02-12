# Online Library - Complete Architecture & Integration Guide

## 📋 Project Structure Overview

```
Online Library Project/
│
├── legacy_html/                           # Frontend - Pure HTML/CSS/JS
│   ├── auth-service.js                   # ✓ Authentication service
│   ├── FRONTEND_BACKEND_INTEGRATION.js   # ✓ Integration examples
│   ├── login.html                        # ✓ Login/Register page
│   ├── explorer.html                     # ✓ Book browser (protected)
│   ├── personal.html                     # ✓ Saved books (protected)
│   ├── main.html                         # ✓ Homepage
│   ├── script.js                         # ✓ General page logic
│   └── style.css                         # ✓ Styling
│
└── backend/                               # Express.js Backend - NEW!
    ├── server.js                         # ✓ Main server file
    ├── package.json                      # ✓ Dependencies
    ├── .env                              # ✓ Configuration
    ├── test-models.js                    # ✓ Model tests
    ├── setup.sh                          # ✓ Setup script
    ├── README.md                         # ✓ Backend readme
    ├── MODELS_GUIDE.md                   # ✓ Models documentation
    │
    ├── data/                             # JSON Data Storage
    │   ├── users.json                   # ✓ User accounts
    │   ├── saved.json                   # ✓ Saved books
    │   └── otp.json                     # ✓ OTP codes
    │
    └── src/                              # Source Code
        ├── models/                       # ✓ Entity Models (NEW!)
        │   ├── index.js                 # Exports all models
        │   ├── User.js                  # User authentication model
        │   ├── Book.js                  # Book entity model
        │   ├── SavedBook.js             # Saved book model
        │   ├── OTP.js                   # OTP model
        │   └── AuthResponse.js          # Standardized response model
        │
        ├── services/                    # ✓ Business Logic
        │   ├── authService.js           # Authentication logic
        │   ├── userService.js           # User profile logic
        │   └── savedBooksService.js     # Book saving logic
        │
        ├── controllers/                 # ✓ API Handlers
        │   ├── authController.js        # Auth endpoints
        │   ├── userController.js        # User endpoints
        │   └── savedController.js       # Book endpoints
        │
        ├── routes/                      # ✓ API Routes
        │   ├── auth.js                  # Auth routes
        │   ├── users.js                 # User routes
        │   └── saved.js                 # Book routes
        │
        ├── middleware/                  # ✓ Middleware
        │   └── auth.js                  # JWT authentication
        │
        ├── validators/                  # ✓ Input Validation
        │   └── authValidator.js         # Auth data validation
        │
        └── utils/                       # ✓ Utilities
            ├── fileStore.js             # File-based storage
            └── jwt.js                   # JWT & password utilities
```

---

## 🏗️ Architecture Layers

### Layer 1: Frontend (Browser)
- **login.html** - User authentication UI
- **explorer.html** - Book browsing interface
- **personal.html** - Saved books display
- **auth-service.js** - Client-side API client
- **script.js** - Page logic & navigation

### Layer 2: API Endpoints (Node.js/Express)
```
POST   /api/auth/login          - User login
POST   /api/auth/register       - User registration
POST   /api/auth/send-otp       - Send OTP for password reset
POST   /api/auth/verify-otp     - Verify OTP & reset password
GET    /api/users/profile       - Get user profile (protected)
PUT    /api/users/profile       - Update profile (protected)
GET    /api/saved               - Get saved books (protected)
POST   /api/saved               - Save book (protected)
DELETE /api/saved/:bookId       - Remove book (protected)
```

### Layer 3: Services (Business Logic)
- **AuthService** - Handles authentication logic
- **UserService** - Handles user profile management
- **SavedBooksService** - Handles book saving/retrieval

### Layer 4: Models (Data Entities) ⭐ NEW!
- **User** - User account representation
- **Book** - Book catalog representation
- **SavedBook** - User's saved books
- **OTP** - One-time password for password reset
- **AuthResponse** - Standardized API response

### Layer 5: Data Storage (Persistence)
- **users.json** - User accounts with hashed passwords
- **saved.json** - User's saved books
- **otp.json** - Temporary OTP codes

---

## 🔐 Authentication Flow

### Registration
```
User enters email/password
         ↓
AuthService.register()
         ↓
Validate input (validator)
         ↓
Create User model instance
         ↓
Hash password with bcryptjs
         ↓
Save to fileStore
         ↓
Generate JWT token
         ↓
Return AuthResponse
         ↓
Frontend stores token & user
         ↓
Redirect to explorer
```

### Login
```
User enters credentials
         ↓
AuthService.login()
         ↓
Validate input
         ↓
Find user in fileStore
         ↓
Compare passwords
         ↓
Update last login time
         ↓
Generate JWT token
         ↓
Return AuthResponse
         ↓
Frontend stores token
         ↓
Access protected pages
```

### Password Reset (OTP)
```
User clicks "Forgot Password"
         ↓
AuthService.sendOTP()
         ↓
Find user by email
         ↓
Generate 6-digit OTP
         ↓
Create OTP model (expires in 10 min)
         ↓
Save OTP to fileStore
         ↓
Return OTP (dev mode only)
         ↓
User enters OTP + new password
         ↓
AuthService.verifyOTP()
         ↓
Verify OTP code & check expiration
         ↓
Hash new password
         ↓
Update User model
         ↓
Save updated user
         ↓
Delete used OTP
         ↓
Generate JWT token
         ↓
Return AuthResponse
         ↓
Frontend stores token
         ↓
User is logged in
```

---

## 📦 Entity Models

### User Model
```javascript
{
  email: string,          // Unique user identifier
  password: string,       // Bcrypt hashed password
  name: string | null,    // Display name
  id: string,             // Same as email
  createdAt: ISO8601,     // Account creation time
  updatedAt: ISO8601,     // Last update time
  isActive: boolean,      // Account status
  lastLogin: ISO8601 | null
}

Methods:
- validateForRegistration()
- validateForLogin()
- hashPassword()
- comparePassword(rawPassword)
- updateLastLogin()
- updatePassword(newPassword)
- toJSON()
- toPublicJSON()
```

### Book Model
```javascript
{
  id: string,             // Unique book ID
  title: string,          // Book title
  author: string,         // Author name
  subject: string | null, // Subject/Category
  pdf: string | null,     // PDF file path
  branch: string,         // Branch (Knowledge, Devotional, etc.)
  coverImage: string | null,
  description: string | null,
  isbn: string | null,
  publishedYear: number | null,
  pageCount: number | null,
  language: string,       // Default: 'English'
  createdAt: ISO8601
}

Methods:
- validate()
- isComplete()
- toJSON()
- toMinimalJSON()
```

### SavedBook Model
```javascript
{
  email: string,          // User email
  book: Book | null,      // Full book object
  bookId: string,         // Book ID reference
  savedAt: ISO8601,       // When saved
  notes: string | null,   // User notes
  rating: number 1-5 | null,
  isRead: boolean
}

Methods:
- validate()
- updateNotes(notes)
- updateRating(rating)
- markAsRead()
- markAsUnread()
- toJSON()
- toMinimalJSON()
```

### OTP Model
```javascript
{
  email: string,
  code: string,           // 6-digit code
  createdAt: Date,
  expiresAt: Date,        // 10 minutes
  attempts: number,
  maxAttempts: number,    // 5
  isUsed: boolean
}

Methods:
- isExpired()
- isValid()
- verify(code)
- getTimeRemaining()
- toJSON()
```

### AuthResponse Model
```javascript
{
  ok: boolean,
  message: string | null,
  error: string | null,
  token: string | null,
  user: Object | null,
  code: string | null,    // OTP (dev mode)
  data: any | null,
  timestamp: ISO8601
}

Static Methods:
- AuthResponse.success(message, options)
- AuthResponse.error(message, statusCode)
```

---

## 🔌 Frontend Integration Points

### 1. Import AuthService
```html
<script src="auth-service.js"></script>
```

### 2. Check Login Status
```javascript
if (AuthService.isLoggedIn()) {
  console.log('User:', AuthService.getCurrentUser());
}
```

### 3. Handle Registration
```javascript
const result = await AuthService.register(email, password, name);
if (result.ok) {
  // Store token
  localStorage.setItem('auth_token', result.token);
  // Redirect
  location.href = 'explorer.html';
}
```

### 4. Handle Login
```javascript
const result = await AuthService.login(email, password);
if (result.ok) {
  localStorage.setItem('auth_token', result.token);
  location.href = 'explorer.html';
}
```

### 5. Handle Protected Pages
```javascript
if (!AuthService.isLoggedIn()) {
  location.href = 'login.html';
}
```

### 6. Save Books
```javascript
const result = await AuthService.saveBook(bookObject);
if (result.ok) {
  alert('Book saved!');
}
```

### 7. Get Saved Books
```javascript
const result = await AuthService.getSavedBooks();
if (result.ok) {
  const books = result.books;
  // Display books
}
```

### 8. Logout
```javascript
AuthService.logout();
localStorage.clear();
location.href = 'login.html';
```

---

## 🚀 Quick Start

### 1. Install Backend
```bash
cd backend
npm install
```

### 2. Start Server
```bash
npm start
# or for development
npm run dev
```

### 3. Test Models
```bash
node test-models.js
```

### 4. Open Frontend
```
file:///c:/sai%20ram%20html/Online%20Library%20project/legacy_html/login.html
```

### 5. Test Registration
- Click "Register" tab
- Enter email, password, name
- Click "Create Account"
- Should redirect to explorer

### 6. Test Login
- Enter email and password
- Click "Login"
- Should redirect to explorer

### 7. Test Save Books
- On explorer page, click "Save" on a book
- Check browser console for success

### 8. Test Password Reset
- Click "Forgot Password"
- Enter email
- Copy OTP from success message
- Enter OTP and new password
- Should reset password

---

## 📊 Data Flow Diagram

```
┌─────────────┐
│   User      │
│  Browser    │
└──────┬──────┘
       │
       │ HTTP Request
       ↓
┌─────────────────────────────┐
│   Frontend (login.html)     │
│   - Collects user input     │
│   - Calls AuthService       │
└──────┬──────────────────────┘
       │
       │ API Call
       ↓
┌──────────────────────────────────┐
│   Backend Server (server.js)     │
│   - Routes to controller         │
│   - Validates input              │
└──────┬───────────────────────────┘
       │
       │ Calls Service
       ↓
┌──────────────────────────────────┐
│   Service (authService.js)       │
│   - Business logic               │
│   - Uses models                  │
└──────┬───────────────────────────┘
       │
       │ Uses Models
       ↓
┌──────────────────────────────────┐
│   Models (User.js, etc.)         │
│   - Validation                   │
│   - Data transformation          │
│   - Password hashing             │
└──────┬───────────────────────────┘
       │
       │ Persists Data
       ↓
┌──────────────────────────────────┐
│   FileStore (fileStore.js)       │
│   - Reads/writes JSON files      │
└──────┬───────────────────────────┘
       │
       │ File System
       ↓
┌──────────────────────────────────┐
│   Data Files                     │
│   - users.json                   │
│   - saved.json                   │
│   - otp.json                     │
└──────────────────────────────────┘
```

---

## ✅ Features Implemented

### Authentication
- ✓ User registration with email/password
- ✓ Login with credential validation
- ✓ JWT token generation (24-hour expiry)
- ✓ OTP-based password reset
- ✓ Password hashing with bcryptjs
- ✓ Session management with localStorage

### User Management
- ✓ Get user profile
- ✓ Update user profile
- ✓ Track last login
- ✓ Account status (active/inactive)

### Books Management
- ✓ Save books to user's library
- ✓ Get saved books for user
- ✓ Remove books from saved
- ✓ Add notes to saved books
- ✓ Rate saved books
- ✓ Track read status

### Security
- ✓ Password hashing (bcryptjs with 10-round salt)
- ✓ JWT authentication on protected routes
- ✓ Input validation on all endpoints
- ✓ OTP expiration (10 minutes)
- ✓ Failed attempt tracking
- ✓ Email sanitization

### Error Handling
- ✓ Standardized error responses
- ✓ Detailed validation messages
- ✓ HTTP status codes
- ✓ Try-catch blocks in all endpoints

---

## 🔄 Next Steps

### Short Term
1. ✅ Models created and organized
2. ✅ Services implemented with business logic
3. ✅ Controllers refactored to use models
4. ✅ Frontend-backend integration ready
5. ⏭️ **Test all flows end-to-end**

### Medium Term
6. Move from JSON to real database (MongoDB/PostgreSQL)
7. Implement email sending for OTPs (SendGrid, Nodemailer)
8. Add rate limiting for security
9. Add CSRF protection
10. Implement refresh tokens

### Long Term
11. User roles and permissions
12. Book reviews and ratings
13. Social features (sharing, recommendations)
14. Search and filtering
15. Mobile app integration

---

## 📚 Documentation Files

- **AUTHENTICATION_GUIDE.md** - Complete API reference
- **MODELS_GUIDE.md** - Entity models documentation
- **QUICKSTART.md** - 5-minute setup guide
- **FRONTEND_BACKEND_INTEGRATION.js** - Integration examples
- **README.md** - Backend setup instructions

---

## 🎯 Testing Checklist

- [ ] Backend server starts without errors
- [ ] Models can be instantiated
- [ ] User can register
- [ ] User can login
- [ ] Token is stored in localStorage
- [ ] Protected pages redirect when not logged in
- [ ] Can save books
- [ ] Can retrieve saved books
- [ ] Can remove saved books
- [ ] Can update profile
- [ ] Can reset password with OTP
- [ ] Logout clears token

---

## 🛠️ Troubleshooting

**Problem:** "Cannot find module 'models'"
- **Solution:** Make sure you're importing from '../models' or '../models/index.js'

**Problem:** Token not being saved
- **Solution:** Check browser console, verify AuthService is loaded before other scripts

**Problem:** CORS errors
- **Solution:** Backend is on localhost:3000, frontend CORS configured

**Problem:** OTP not working
- **Solution:** In dev mode, OTP is returned in response. Copy and paste it.

**Problem:** Password not resetting
- **Solution:** Check OTP hasn't expired (10 minutes max)

---

## 📞 Support

For issues:
1. Check console errors (F12 → Console)
2. Check backend console for logs
3. Verify localhost:3000 is accessible
4. Check that npm dependencies are installed

---

## 📄 License

This project is part of the Online Library system.

---

**Last Updated:** January 29, 2026
**Version:** 2.0 (With Entity Models)
