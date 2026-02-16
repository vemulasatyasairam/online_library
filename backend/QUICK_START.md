# 🚀 Cloudinary PDF Setup - QUICK START

## 5-Minute Setup

### 1️⃣ Get Your API Secret (1 min)
- Go to: https://cloudinary.com/console
- Copy your **API Secret** from dashboard

### 2️⃣ Update Backend Config (1 min)
Edit: `backend/src/config/cloudinary.js`
```javascript
api_secret: 'PASTE_YOUR_SECRET_HERE'  // Line 6
```

### 3️⃣ Start Backend (1 min)
```bash
cd backend
npm start
```
✅ Server runs on http://localhost:3000

### 4️⃣ Open PDF Manager (1 min)
Open in browser:
```
http://localhost:3000/pdf-manager.html
```

### 5️⃣ Test Upload (1 min)
- Select a PDF file
- Click "Upload PDF"
- See your file in upload history!

---

## 📁 Check: Did Everything Install?

Run this in backend folder:
```bash
npm list cloudinary
```

Should output: `cloudinary@1.xx.xx`

---

## 🎯 Quick Test with cURL

```bash
# Upload a PDF
curl -X POST http://localhost:3000/api/pdf/upload \
  -F "pdf=@/path/to/file.pdf"

# Should return: publicId, url, fileName, etc.
```

---

## ⚡ All Files Created

✅ Backend:
- `src/config/cloudinary.js` - Configuration
- `src/services/pdfService.js` - PDF operations
- `src/controllers/pdfController.js` - Request handling
- `src/routes/pdf.js` - API endpoints

✅ Frontend:
- `legacy_html/pdf-manager.html` - UI
- `legacy_html/pdf-manager.js` - Functionality

✅ Server:
- `server.js` - Updated with PDF routes

✅ Documentation:
- `PDF_SETUP_GUIDE.md` - Detailed guide
- `CLOUDINARY_INTEGRATION.md` - Complete reference
- `QUICK_START.md` - This file!

---

## 🔍 Issue? Check These

```javascript
// In pdf-manager.js, make sure this matches your backend:
const API_BASE = 'http://localhost:3000/api/pdf';
                           ↑ Change if different port
```

---

## 📊 What Happens When You Upload

```
Browser (pdf-manager.html)
    ↓ [Upload file]
    ↓
Server (src/routes/pdf.js)
    ↓ [Validate file]
    ↓
Cloudinary (src/services/pdfService.js)
    ↓ [Store PDF]
    ↓ [Return URL]
    ↓
Browser [Display & Download]
```

---

**That's it! 🎉 Your PDF storage is ready to go!**

Need help? Check [CLOUDINARY_INTEGRATION.md](CLOUDINARY_INTEGRATION.md)
