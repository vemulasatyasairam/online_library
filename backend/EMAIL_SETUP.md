# Email Setup for OTP Service

## How to Configure Email for OTP

The application now sends OTP codes via email using Gmail's SMTP service. Follow these steps to set it up:

### 1. Enable Gmail App Passwords

1. Go to https://myaccount.google.com (sign in with your Gmail account)
2. Click on **"Security"** in the left sidebar
3. Enable **"2-Step Verification"** if not already enabled
4. After enabling 2-Step Verification, you'll see a new option: **"App passwords"**
5. Select **"Mail"** and **"Windows Computer"** (or your device type)
6. Google will generate a **16-character password**
7. Copy this password - you'll need it in the next step

### 2. Update Environment Variables

1. Open `backend/.env` file
2. Update these lines with your Gmail credentials:

```env
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx
```

Replace:
- `your-gmail-address@gmail.com` with your actual Gmail address
- `xxxx-xxxx-xxxx-xxxx` with the 16-character App Password you generated

### 3. Important Security Notes

⚠️ **NEVER share your App Password or .env file**

- The `.env` file contains sensitive information and should NEVER be committed to Git
- Add `.env` to `.gitignore` (already done in this project)
- For production, use environment variables from your hosting platform instead
- Change the App Password if you suspect it's been compromised

### 4. Test Email Sending

Make an OTP request to test if emails are being sent:

```bash
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

Check your inbox for the OTP email!

### 5. Alternative Email Services

The email service is configured for Gmail, but you can modify `src/services/emailService.js` to use other providers:

#### Outlook.com:
```javascript
service: 'outlook',
auth: {
  user: 'your-email@outlook.com',
  pass: 'your-password'
}
```

#### Custom SMTP Server:
```javascript
host: 'your-smtp-server.com',
port: 587,
secure: false,
auth: {
  user: 'your-email',
  pass: 'your-password'
}
```

### 6. In Development Mode

In development mode, the API still returns the OTP code in the response:
```json
{
  "ok": true,
  "message": "OTP sent to your email",
  "code": "123456"
}
```

This allows you to test without actually needing to receive emails. In production, the `code` field will be omitted from the response.

## Troubleshooting

### "Email sending failed" error

1. **Check email credentials** - Ensure EMAIL_USER and EMAIL_PASSWORD are correct in .env
2. **Check 2-Step Verification** - Must be enabled for Gmail
3. **Use App Password** - Don't use your regular Gmail password
4. **Allow Less Secure Apps** - Some Gmail accounts may require this (older accounts)
5. **Check SMTP settings** - Ensure port 587 is not blocked by your firewall

### OTP not arriving

1. Check your spam/junk folder
2. Verify the email address is correct
3. Check backend logs for any error messages
4. Try sending a test email using a mail client

## Email Template

The OTP email is beautifully formatted with:
- Dark theme matching the app design
- Clear OTP code display with 10-minute validity
- Professional branding
- Security warning

All emails are sent from the configured EMAIL_USER address.
