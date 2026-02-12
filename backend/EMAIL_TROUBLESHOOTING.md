# Email OTP Troubleshooting Guide

## ✅ Email Service Status
**Email is configured and working correctly!**
- Sender: onlinelibrary033@gmail.com
- Status: Successfully sending emails to Gmail servers

## 🔍 If OTP Email Not Arriving

### 1. Check Spam/Junk Folder
Gmail's spam filter might catch OTP emails. Check:
- Spam folder in your inbox
- Promotions tab (if using Gmail)
- Updates tab

### 2. Wait 1-2 Minutes
Email delivery can have delays. Wait a bit before requesting a new OTP.

### 3. Mark as "Not Spam"
If found in spam:
- Mark the email as "Not Spam"
- Add onlinelibrary033@gmail.com to your contacts
- Future emails will arrive in inbox

### 4. Check Correct Email
Make sure you're:
- Entering the correct email address on login page
- Checking the inbox for that same email
- Using an email that's registered in the system

### 5. Verify User Registration
Only registered users can receive OTP. To check registered users:
```bash
cd backend
node check-users.js
```

## 🧪 Testing Email Delivery

Test if emails are reaching a specific address:
```bash
cd backend
# Edit test-email.js to change test email
node test-email.js
```

## 📋 Server Logs
When requesting OTP, check backend console for:
- ✅ "Email sent successfully" - email was sent
- ⚠️ "Email service not available" - configuration issue
- ❌ Error messages - delivery problem

## 🔧 Current Configuration
```
Sender Email: onlinelibrary033@gmail.com
Email Service: Gmail SMTP
Status: Active ✅
```

## 💡 How to Request OTP

1. Go to login page
2. Click "Forgot Password"
3. Enter your registered email
4. Click "Send OTP"
5. Check inbox (and spam folder)
6. Enter the 6-digit code
7. Set new password

**OTP is valid for 10 minutes only!**
