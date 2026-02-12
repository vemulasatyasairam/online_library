# 🚨 OTP Email Not Working - Quick Fix Guide

## The Problem
Your `.env` file still has **placeholder values** instead of actual Gmail credentials.

```env
EMAIL_USER=your-email@gmail.com          ❌ PLACEHOLDER
EMAIL_PASSWORD=your-app-password-16-chars ❌ PLACEHOLDER
```

## ✅ Quick Fix (3 Steps)

### Step 1: Get Gmail App Password (5 minutes)
1. Open: https://myaccount.google.com
2. Click **"Security"** (left sidebar)
3. **Enable 2-Step Verification** (if not already done)
4. Find **"App passwords"** option
5. Select: **Mail** → **Windows Computer**
6. Google generates a **16-character password** - **COPY IT**

Example: `abcd efgh ijkl mnop`

### Step 2: Update .env File
Option A: **Automatic Setup** (Recommended)
```bash
cd backend
node setup-email.js
```
Follow the prompts and enter your email and App Password

Option B: **Manual Edit**
Open `backend/.env` and replace:
```env
EMAIL_USER=your-actual-email@gmail.com
EMAIL_PASSWORD=abcd-efgh-ijkl-mnop
```

### Step 3: Restart Server
```bash
cd backend
npm start
```

## ✅ Verify It's Working
```bash
node check-email.js
```

You should see:
```
✅ EMAIL_USER is set: your-email@gmail.com
✅ EMAIL_PASSWORD is set (length: 16 chars)
✅ Email connection successful!
```

## 🧪 Test OTP Sending
1. Go to login page
2. Click "Forgot Password"
3. Enter your email
4. Click "Send OTP"
5. You should see: **"OTP sent to your email"**
6. Check your inbox for the email!

## 🆘 Still Not Working?

### Issue: "Email sending failed" message
**Solution:** Check that you're using the **16-character App Password**, not your Gmail password

### Issue: OTP arrives but in spam folder
**Solution:** This is normal for first emails. Mark it as "Not Spam" and it should arrive in inbox next time

### Issue: "Email service not configured"
**Solution:** Restart the server after updating .env
```bash
npm start
```

### Issue: "2-Step Verification" option not showing
**Solution:** You may be using an older Gmail account. Follow these steps:
1. Go to https://myaccount.google.com/security
2. Scroll to "How you sign in to Google"
3. Click "2-Step Verification"
4. Complete the setup

### Issue: Can't find "App passwords" option
**Solution:** Must enable 2-Step Verification first!
Without 2-Step Verification, App passwords won't appear

## 📚 Files for Help
- `check-email.js` - Diagnose email issues
- `setup-email.js` - Interactive setup guide
- `EMAIL_SETUP.md` - Detailed documentation

## 🔒 Security Notes
✅ Never share your `.env` file  
✅ App Password is different from Gmail password  
✅ .env is in `.gitignore` (never committed)  
✅ Create new App Password if suspect compromise  

## ✨ Success Checklist
- [ ] Generated Gmail App Password
- [ ] Updated EMAIL_USER in .env
- [ ] Updated EMAIL_PASSWORD in .env
- [ ] Restarted backend server
- [ ] Ran check-email.js - all checks passed
- [ ] Tested OTP sending - email received

Once all items are checked, OTP emails will work! 🎉
