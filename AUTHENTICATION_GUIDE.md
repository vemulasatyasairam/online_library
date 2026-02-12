# Online Library - Authentication Integration Guide

## Overview

Your frontend authentication has been integrated with a complete Express.js backend API. The system supports:
- User registration and login with JWT tokens
- OTP-based password reset
- Secure token-based session management
- Book saving functionality per user

## Backend Setup

### Installation

1. Navigate to the backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

### Running the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server runs on `http://localhost:3000`

### Environment Variables (.env)

```
PORT=3000
JWT_SECRET=your_jwt_secret_key_change_in_production
NODE_ENV=development
```

For production, make sure to:
- Change `JWT_SECRET` to a strong random string
- Set `NODE_ENV=production`
- Configure CORS origins properly

## Backend API Endpoints

### Authentication Routes

#### Login
```
POST /api/auth/login
Headers: Content-Type: application/json

Body:
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "ok": true,
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": {
    "email": "user@example.com",
    "name": null
  }
}
```

#### Register
```
POST /api/auth/register
Headers: Content-Type: application/json

Body:
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "John Doe"  // optional
}

Response:
{
  "ok": true,
  "message": "User registered successfully",
  "token": "eyJhbGc...",
  "user": {
    "email": "newuser@example.com",
    "name": "John Doe"
  }
}
```

#### Send OTP
```
POST /api/auth/send-otp
Headers: Content-Type: application/json

Body:
{
  "email": "user@example.com"
}

Response:
{
  "ok": true,
  "message": "OTP sent to email",
  "code": "123456"  // Only in dev mode
}
```

#### Verify OTP & Reset Password
```
POST /api/auth/verify-otp
Headers: Content-Type: application/json

Body:
{
  "email": "user@example.com",
  "code": "123456",
  "newPassword": "newpassword123"
}

Response:
{
  "ok": true,
  "message": "Password reset successful",
  "token": "eyJhbGc...",
  "user": {
    "email": "user@example.com",
    "name": null
  }
}
```

### User Routes (Protected)

All these routes require `Authorization: Bearer <token>` header

#### Get User Profile
```
GET /api/users/profile
Headers: Authorization: Bearer <token>

Response:
{
  "ok": true,
  "user": {
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-29T10:30:00.000Z"
  }
}
```

#### Update User Profile
```
PUT /api/users/profile
Headers: 
  Content-Type: application/json
  Authorization: Bearer <token>

Body:
{
  "name": "Jane Doe"
}

Response:
{
  "ok": true,
  "message": "Profile updated",
  "user": {
    "email": "user@example.com",
    "name": "Jane Doe"
  }
}
```

### Saved Books Routes (Protected)

#### Get Saved Books
```
GET /api/saved
Headers: Authorization: Bearer <token>

Response:
{
  "ok": true,
  "books": [
    {
      "id": "book1",
      "title": "IAS",
      "author": "A. Sharma",
      ...
    }
  ]
}
```

#### Save a Book
```
POST /api/saved
Headers: 
  Content-Type: application/json
  Authorization: Bearer <token>

Body:
{
  "book": {
    "id": "book1",
    "title": "IAS",
    "author": "A. Sharma",
    "subject": "General Studies",
    "pdf": "pdfs/ias.pdf",
    "branch": "Knowledge"
  }
}

Response:
{
  "ok": true,
  "message": "Book saved"
}
```

#### Remove Saved Book
```
DELETE /api/saved/:bookId
Headers: Authorization: Bearer <token>

Response:
{
  "ok": true,
  "message": "Book removed"
}
```

## Frontend Integration

### AuthService Module

The `auth-service.js` file provides a complete authentication service interface:

```javascript
// Check if user is logged in
if (AuthService.isLoggedIn()) {
  console.log('User is logged in');
}

// Get current user email
const email = AuthService.getCurrentUser();

// Login
const loginResult = await AuthService.login(email, password);
if (loginResult.ok) {
  console.log('Login successful');
}

// Register
const regResult = await AuthService.register(email, password, name);

// Send OTP
const otpResult = await AuthService.sendOTP(email);
if (otpResult.ok) {
  console.log('OTP sent');
}

// Verify OTP and reset password
const resetResult = await AuthService.verifyOTP(email, otpCode, newPassword);

// Get user profile
const profile = await AuthService.getProfile();

// Update profile
const updateResult = await AuthService.updateProfile(newName);

// Get saved books
const savedBooks = await AuthService.getSavedBooks();

// Save a book
await AuthService.saveBook(bookObject);

// Remove a saved book
await AuthService.removeBook(bookId);

// Logout
AuthService.logout();
```

### Updated HTML Files

1. **login.html** - Complete rewrite with:
   - Login form
   - Registration form (new)
   - OTP-based password reset
   - Tab switching between login/register

2. **main.html, personal.html** - Updated to:
   - Include `auth-service.js` before `script.js`
   - Use `AuthService.logout()` in logout handler

3. **script.js** - Updated to:
   - Detect and use `AuthService` if available
   - Fall back to localStorage if not
   - Removed duplicate login/OTP logic (moved to login.html)

## Data Storage

User data and saved books are stored in JSON files:

- `backend/data/users.json` - User accounts with hashed passwords
- `backend/data/saved.json` - Books saved by each user

For production, migrate to a database (MongoDB, PostgreSQL, etc.)

## Security Notes

1. **Passwords** - All passwords are hashed using bcryptjs with 10-round salt
2. **Tokens** - JWT tokens expire in 24 hours
3. **OTP** - OTPs expire in 10 minutes and allow 5 failed attempts
4. **CORS** - Currently allows localhost. Update for production

### For Production

1. Update `JWT_SECRET` to a long random string
2. Set `NODE_ENV=production`
3. Configure CORS origins in `server.js`
4. Implement email sending for OTPs (currently returns OTP in dev mode)
5. Move to a real database instead of JSON files
6. Add rate limiting and input validation
7. Use HTTPS only
8. Add CSRF protection
9. Implement refresh tokens

## Testing

### Manual Testing

1. **Register a new user**:
   - Navigate to login.html
   - Click "Register" tab
   - Fill in email, password, name (optional)
   - Click "Create Account"

2. **Login**:
   - Enter email and password
   - Click "Login"
   - Check browser console - token should be stored in localStorage

3. **Test Protected Pages**:
   - Try accessing `explorer.html` without logging in
   - Should redirect to `login.html`
   - After login, should access the page

4. **Save Books**:
   - After login, navigate to explorer
   - Click "Save" button on any book
   - Check `backend/data/saved.json` to see saved books

5. **Password Reset**:
   - Click "Forgot Password" in login
   - Enter email
   - Copy OTP from dev mode response
   - Enter OTP and new password
   - Login with new password

## Architecture

### Backend Structure
```
backend/
├── server.js                 # Main server file
├── package.json             # Dependencies
├── .env                      # Environment variables
├── data/
│   ├── users.json           # User accounts
│   └── saved.json           # Saved books
└── src/
    ├── controllers/
    │   ├── authController.js    # Login, register, OTP
    │   ├── userController.js    # User profile
    │   └── savedController.js   # Book saving
    ├── routes/
    │   ├── auth.js          # Auth endpoints
    │   ├── users.js         # User endpoints
    │   └── saved.js         # Saved books endpoints
    ├── middleware/
    │   └── auth.js          # JWT authentication middleware
    └── utils/
        ├── fileStore.js     # JSON file storage
        └── jwt.js           # JWT and password utilities
```

### Frontend Structure
```
legacy_html/
├── auth-service.js          # Authentication service module
├── script.js                # General page logic
├── style.css                # Styles
├── login.html               # Login/Register/OTP page
├── explorer.html            # Book browser (protected)
├── personal.html            # Saved books (protected)
└── other pages...
```

## Troubleshooting

### Token not being saved
- Check browser console for errors
- Verify `AuthService` is loaded before other scripts
- Check localStorage in browser DevTools

### CORS errors
- Make sure backend is running on `localhost:3000`
- Update CORS origins in `backend/server.js` if needed

### OTP not sending
- In dev mode, OTP is returned in response
- For production, implement real email sending

### Users.json permission errors
- Make sure `backend/data/` directory is writable
- Check file permissions on your system

## Next Steps

1. ✅ Backend API created with all endpoints
2. ✅ Frontend authentication integrated
3. ⚠️ TODO: Move from JSON to real database
4. ⚠️ TODO: Implement email sending for OTPs
5. ⚠️ TODO: Add input validation and rate limiting
6. ⚠️ TODO: Deploy to production server

## Support

For issues or questions:
1. Check the browser console for JavaScript errors
2. Check the backend console for API errors
3. Verify all required fields are being sent
4. Check that `localhost:3000` is accessible
