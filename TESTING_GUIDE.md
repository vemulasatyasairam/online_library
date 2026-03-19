# Testing Guide for Authentication System

## System Status ✅
- MongoDB: **Connected**
- Backend: **Running on port 3000**
- Email Service: **Working** (OTP emails configured)
- Frontend: **Fixed error handling** for connection failures

---

## Test User Available
An automated test has created a user in your database:
- **Email:** `test@example.com`
- **Password:** `TestPassword123` (or check test-registration.js for exact password)

---

## Testing Flows

### Flow 1: Test with Existing User (Fastest)
1. Go to: http://127.0.0.1:5500/pages/login.html
2. Click "Forgot Password"
3. Enter: `test@example.com`
4. Click "Send OTP"
5. Check the backend console for the OTP code
6. Enter the OTP and new password
7. Click "Verify & Reset Password"

### Flow 2: Complete Registration Test
1. Go to: http://127.0.0.1:5500/pages/login.html
2. Fill in registration form with:
   - Name: Any name
   - Email: Any email address
   - Password: At least 6 characters
3. Click "Register"
4. Once registered, you can use "Forgot Password" with that email

### Flow 3: Basic Login Test
1. Register first (Flow 2)
2. Login with the registered email and password
3. You should be redirected to the main page

---

## Troubleshooting

### Error: "Failed to connect to server"
- Make sure backend is running: `npm start` or `node server.js` in the backend folder
- Check that port 3000 is available

### Error: "User not found"
- This is correct - you can only reset password for registered users
- Register first, then use forgot password

### OTP not received
- Check the backend console for the OTP code (it prints there in test mode)
- Email service is configured with credentials from .env

---

## Backend Verification

To verify everything is running:
```bash
# Terminal 1: Start backend
cd backend
node server.js

# Terminal 2: Verify system
cd backend
node test-registration.js
```

All ✅ indicators mean your system is ready.
