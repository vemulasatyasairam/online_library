# Quick Start Guide - Online Library Authentication

## 🚀 Getting Started (5 minutes)

### Step 1: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 2: Start the Backend Server
```bash
npm start
```

You should see:
```
Server running on http://localhost:3000
CORS enabled for localhost:3000 and file:// protocol
```

### Step 3: Open Frontend in Browser

Navigate to:
```
file:///c:/sai%20ram%20html/Online%20Library%20project/pages/login.html
```

Or better, use VS Code Live Server extension.

### Step 4: Test the Flow

#### Register a New Account
1. Click "Register" tab
2. Enter:
   - Email: `test@example.com`
   - Password: `password123`
   - Name: `Test User` (optional)
3. Click "Create Account"
4. Should redirect to explorer.html

#### Test Protected Pages
1. Visit `explorer.html` or `personal.html` directly
2. If not logged in, automatically redirects to login
3. After login, access is granted

#### Test Password Reset
1. On login page, click "Forgot Password"
2. Enter email: `test@example.com`
3. Copy the OTP from the success message (dev mode)
4. Enter OTP and new password
5. Login with new password

#### Save Books
1. On explorer.html, click "Save" button on any book
2. Books are now saved to user's profile

## 📁 File Structure

```
backend/
├── server.js                    # Main server
├── package.json                 # Dependencies
├── .env                         # Configuration
├── data/users.json              # User database
├── data/saved.json              # Saved books
└── src/                         # API code

pages/
├── auth-service.js              # Authentication service
├── login.html                   # Login/Register page
├── explorer.html                # Books browser
├── personal.html                # My Books page
└── script.js                    # Shared logic
```

## 🔑 Key Features

✅ User registration with email and password  
✅ Secure login with JWT tokens  
✅ OTP-based password reset  
✅ Protected pages (auto-redirect to login)  
✅ Save books per user  
✅ Persistent sessions with localStorage  

## 🧪 Test Credentials

After registration:
```
Email: test@example.com
Password: password123
```

## 🔧 Configuration

Edit `backend/.env`:
```env
PORT=3000
JWT_SECRET=change_this_in_production
NODE_ENV=development
```

## 📊 API Endpoints

- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register new user
- `POST /api/auth/send-otp` - Send OTP for password reset
- `POST /api/auth/verify-otp` - Verify OTP and reset password
- `GET /api/users/profile` - Get user profile (protected)
- `PUT /api/users/profile` - Update profile (protected)
- `GET /api/saved` - Get saved books (protected)
- `POST /api/saved` - Save a book (protected)
- `DELETE /api/saved/:bookId` - Remove saved book (protected)

## ⚠️ Common Issues

### "Failed to fetch" or CORS error
- Backend not running on `http://localhost:3000`
- Solution: Run `npm start` in backend folder

### Login not working
- Check browser console (F12 > Console tab)
- Verify email and password are correct
- Try clearing localStorage: `localStorage.clear()`

### OTP not showing up
- In dev mode, OTP appears in the success message
- Copy it from the browser and paste back

### Files not loading
- Use Live Server or serve files via HTTP (not file://)
- Backend CORS is configured for file:// but HTTP is better

## 📚 Full Documentation

See [AUTHENTICATION_GUIDE.md](AUTHENTICATION_GUIDE.md) for:
- Complete API documentation
- Security notes
- Production deployment guide
- Architecture details
- Troubleshooting guide

## 🎯 Next Steps

1. ✅ Verify everything is working with test account
2. ✅ Create real user accounts
3. ⏭️ Move to database (MongoDB, PostgreSQL)
4. ⏭️ Implement email sending for OTPs
5. ⏭️ Deploy to production server

## 💡 Tips

- Use browser DevTools (F12) to inspect localStorage
- Check Network tab to see API requests/responses
- Backend console shows detailed logs of all requests
- OTP in dev mode is useful for testing without email

---

**Ready to go!** Start the backend server and open login.html in your browser. 🎉
