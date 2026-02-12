# Online Library - Entity Models Documentation

## Overview

All authentication and entity models are organized in the `backend/src/models/` folder using a clean, object-oriented architecture. This ensures maintainability, reusability, and proper separation of concerns.

## Models Folder Structure

```
backend/src/models/
├── index.js              # Main export file
├── User.js               # User authentication model
├── Book.js               # Book entity model
├── SavedBook.js          # User saved books model
├── OTP.js                # OTP for password reset
└── AuthResponse.js       # Standardized response format
```

---

## User Model

**File:** `User.js`

Represents a user in the authentication system with comprehensive validation and password management.

### Properties

```javascript
{
  email: string,              // User email (unique identifier)
  password: string,           // Hashed password
  name: string | null,        // User display name
  id: string,                 // User ID (same as email)
  createdAt: ISO8601,         // Account creation date
  updatedAt: ISO8601,         // Last update date
  isActive: boolean,          // Account status
  lastLogin: ISO8601 | null   // Last login timestamp
}
```

### Methods

#### Validation

```javascript
// Validate for registration
const validation = user.validateForRegistration();
// Returns: { isValid: boolean, errors: string[] }

// Validate for login
const validation = user.validateForLogin();
// Returns: { isValid: boolean, errors: string[] }
```

#### Password Management

```javascript
// Hash password using bcryptjs
await user.hashPassword();

// Compare plain password with stored hash
const matches = await user.comparePassword('plainPassword');
// Returns: boolean

// Update password
await user.updatePassword('newPassword');
```

#### Data Methods

```javascript
// Get user as JSON (all public fields)
const json = user.toJSON();

// Get minimal user data for responses
const publicJson = user.toPublicJSON();

// Create user from plain object
const user = User.fromJSON(data);

// Check if two users are the same
const same = user.isSameUser(otherUser);
```

#### State Management

```javascript
// Update last login timestamp
user.updateLastLogin();
```

### Usage Example

```javascript
const { User } = require('../models');

// Create new user
const user = new User({
  email: 'john@example.com',
  password: 'password123',
  name: 'John Doe'
});

// Validate
const validation = user.validateForRegistration();
if (!validation.isValid) {
  console.error('Validation errors:', validation.errors);
  return;
}

// Hash password
await user.hashPassword();

// Save to database
fileStore.saveUser(user);

// Later: Login
const existingUser = fileStore.findUserByEmail('john@example.com');
const passwordMatch = await existingUser.comparePassword('password123');
```

---

## Book Model

**File:** `Book.js`

Represents a book in the library catalog.

### Properties

```javascript
{
  id: string,                    // Unique book identifier
  title: string,                 // Book title
  author: string,                // Author name
  subject: string | null,        // Subject/Category
  pdf: string | null,            // PDF file path
  branch: string,                // Branch (Knowledge, Devotional, etc.)
  coverImage: string | null,     // Cover image URL
  description: string | null,    // Book description
  isbn: string | null,           // ISBN
  publishedYear: number | null,  // Publication year
  pageCount: number | null,      // Number of pages
  language: string,              // Language (default: 'English')
  createdAt: ISO8601             // Created date
}
```

### Methods

```javascript
// Validate book data
const validation = book.validate();
// Returns: { isValid: boolean, errors: string[] }

// Check if book has all required fields
const complete = book.isComplete();

// Get full book as JSON
const json = book.toJSON();

// Get minimal book data
const minimal = book.toMinimalJSON();

// Create from plain object
const book = Book.fromJSON(data);

// Create multiple books from array
const books = Book.fromJSONArray(dataArray);
```

### Usage Example

```javascript
const { Book } = require('../models');

const book = new Book({
  id: 'book1',
  title: 'IAS General Studies',
  author: 'A. Sharma',
  subject: 'Competitive Exams',
  branch: 'Knowledge',
  pdf: 'pdfs/ias.pdf'
});

const validation = book.validate();
if (validation.isValid) {
  console.log('Book is valid');
}
```

---

## SavedBook Model

**File:** `SavedBook.js`

Represents a book saved by a user with additional metadata like notes and rating.

### Properties

```javascript
{
  email: string,              // User email
  book: Book | null,          // Full book object
  bookId: string,             // Book ID reference
  savedAt: ISO8601,           // When book was saved
  notes: string | null,       // User notes about book
  rating: number 1-5 | null,  // User rating
  isRead: boolean             // Whether user has read it
}
```

### Methods

```javascript
// Validate saved book
const validation = savedBook.validate();

// Update notes
savedBook.updateNotes('Great book!');

// Update rating (1-5)
savedBook.updateRating(4);

// Mark as read
savedBook.markAsRead();

// Mark as unread
savedBook.markAsUnread();

// Get as JSON
const json = savedBook.toJSON();

// Get minimal data
const minimal = savedBook.toMinimalJSON();

// Create from object
const savedBook = SavedBook.fromJSON(data);

// Create multiple
const books = SavedBook.fromJSONArray(dataArray);
```

### Usage Example

```javascript
const { SavedBook } = require('../models');

const savedBook = new SavedBook({
  email: 'john@example.com',
  book: bookObject,
  bookId: 'book1'
});

savedBook.updateRating(5);
savedBook.markAsRead();
```

---

## OTP Model

**File:** `OTP.js`

Represents a One-Time Password for secure password reset.

### Properties

```javascript
{
  email: string,            // User email
  code: string,             // 6-digit OTP code
  createdAt: Date,          // Creation time
  expiresAt: Date,          // Expiration time (10 minutes)
  attempts: number,         // Failed verification attempts
  maxAttempts: number,      // Max allowed attempts (5)
  isUsed: boolean           // Whether OTP was used
}
```

### Methods

```javascript
// Check if OTP is expired
const expired = otp.isExpired();

// Check if OTP is valid
const valid = otp.isValid();

// Verify OTP code
const result = otp.verify('123456');
// Returns: { success: boolean, error?: string, attemptsRemaining?: number }

// Get remaining time in seconds
const seconds = otp.getTimeRemaining();

// Get OTP as JSON
const json = otp.toJSON();

// Create from object
const otp = OTP.fromJSON(data);

// Generate random OTP code
const code = OTP.generateCode();
```

### Usage Example

```javascript
const { OTP } = require('../models');

// Generate OTP
const code = OTP.generateCode();
const otp = new OTP({
  email: 'john@example.com',
  code
});

// Verify
const result = otp.verify('123456');
if (result.success) {
  console.log('OTP verified!');
} else {
  console.log('Invalid OTP:', result.error);
}
```

---

## AuthResponse Model

**File:** `AuthResponse.js`

Standardized response format for all authentication endpoints.

### Properties

```javascript
{
  ok: boolean,              // Success status
  message: string | null,   // Success message
  error: string | null,     // Error message
  token: string | null,     // JWT token (on success)
  user: Object | null,      // User data (on success)
  code: string | null,      // OTP code (dev mode only)
  data: any | null,         // Additional data
  timestamp: ISO8601        // Response timestamp
}
```

### Static Methods

```javascript
// Create success response
const response = AuthResponse.success('Login successful', {
  token: jwtToken,
  user: userData,
  code: otpCode
});

// Create error response
const response = AuthResponse.error('Invalid credentials', 401);
```

### Instance Methods

```javascript
// Get response for sending to client
const json = response.toJSON();
```

### Usage Example

```javascript
const { AuthResponse } = require('../models');

// In auth controller
const response = AuthResponse.success('Login successful', {
  token: jwtToken,
  user: userData
});

res.json(response.toJSON());
```

---

## Services

Services contain business logic and use models. Located in `backend/src/services/`:

### AuthService

```javascript
// Register new user
const result = await AuthService.register(email, password, name);

// Login user
const result = await AuthService.login(email, password);

// Send OTP
const result = await AuthService.sendOTP(email);

// Verify OTP and reset password
const result = await AuthService.verifyOTP(email, code, newPassword);

// Validate token
const decoded = AuthService.validateToken(token);
```

### UserService

```javascript
// Get user profile
const result = UserService.getProfile(email);

// Update profile
const result = UserService.updateProfile(email, updates);

// Get all users (admin)
const result = UserService.getAllUsers();

// Delete user
const result = UserService.deleteUser(email);

// Deactivate user
const result = UserService.deactivateUser(email);

// Activate user
const result = UserService.activateUser(email);
```

### SavedBooksService

```javascript
// Get saved books
const result = SavedBooksService.getSavedBooks(email);

// Save book
const result = SavedBooksService.saveBook(email, bookData);

// Remove book
const result = SavedBooksService.removeBook(email, bookId);

// Get saved count
const result = SavedBooksService.getSavedCount(email);

// Check if book is saved
const result = SavedBooksService.isBookSaved(email, bookId);

// Get specific saved book
const result = SavedBooksService.getSavedBookById(email, bookId);
```

---

## Validators

Input validation utilities in `backend/src/validators/`:

```javascript
const {
  validateEmail,
  validatePassword,
  validateRegistrationData,
  validateLoginData,
  validateOTPData,
  sanitizeEmail,
  sanitizePassword
} = require('../validators/authValidator');

// Validate email format
const isValid = validateEmail('user@example.com');

// Validate password strength
const isValid = validatePassword('password123');

// Validate registration form
const result = validateRegistrationData({ email, password, name });
// Returns: { isValid: boolean, errors: string[] }
```

---

## Data Flow

### Registration Flow

```
login.html (Register Tab)
    ↓
AuthService.register()
    ↓
User.validateForRegistration()
    ↓
User.hashPassword()
    ↓
fileStore.saveUser()
    ↓
JWT Token Generated
    ↓
Response sent to frontend
```

### Login Flow

```
login.html (Login Tab)
    ↓
AuthService.login()
    ↓
User.validateForLogin()
    ↓
fileStore.findUserByEmail()
    ↓
User.comparePassword()
    ↓
User.updateLastLogin()
    ↓
JWT Token Generated
    ↓
Response sent to frontend
```

### Password Reset Flow

```
login.html (OTP Reset)
    ↓
AuthService.sendOTP()
    ↓
OTP Model Created
    ↓
fileStore.saveOTP()
    ↓
OTP returned to frontend
    ↓
AuthService.verifyOTP()
    ↓
User.updatePassword()
    ↓
User.hashPassword()
    ↓
fileStore.saveUser()
    ↓
JWT Token Generated
```

---

## Best Practices

1. **Always validate input** - Use validators before creating models
2. **Use models for type safety** - Convert objects to model instances
3. **Hash passwords** - Never store plain passwords
4. **Use services** - Keep business logic in services, not controllers
5. **Sanitize data** - Clean user inputs (emails, passwords)
6. **Error handling** - Return standardized AuthResponse for errors
7. **Timestamps** - Track creation and modification times
8. **Immutability** - Don't modify models directly when not needed

---

## Next Steps

1. ✅ Models created and organized
2. ✅ Controllers refactored to use models
3. ✅ Services implemented with business logic
4. ⏭️ Test models with frontend integration
5. ⏭️ Add database layer (MongoDB/PostgreSQL)
6. ⏭️ Implement email sending for OTPs
