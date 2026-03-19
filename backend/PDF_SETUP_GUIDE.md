# Cloudinary PDF Storage Setup Guide

## Installation ✅
Cloudinary package has been installed:
```bash
npm i cloudinary
```

## Files Created

### Backend Files:
1. **src/config/cloudinary.js** - Cloudinary configuration
2. **src/services/pdfService.js** - PDF upload/download/delete services
3. **src/controllers/pdfController.js** - PDF API controllers
4. **src/routes/pdf.js** - PDF API routes

### Frontend Files:
1. **pages/pdf-manager.html** - PDF Manager UI
2. **pages/pdf-manager.js** - PDF Manager Functionality

## Integration Steps

### Step 1: Create temp uploads directory
```bash
# Run this in backend folder
mkdir -p uploads/temp
```

### Step 2: Update server.js
Add this to your **backend/server.js**:

```javascript
// Add near the top with other imports
import pdfRoutes from './src/routes/pdf.js';

// Add this after other routes (before or near app.use(error handling))
app.use('/api/pdf', pdfRoutes);

// Make sure CORS is configured to allow uploads
app.use(cors({
    origin: '*', // or specify your frontend URL
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Step 3: Configure Cloudinary API Secret
Update **src/config/cloudinary.js**:
```javascript
cloudinary.config({
    cloud_name: 'duqfurljh',
    api_key: '526758682396799',
    api_secret: 'YOUR_ACTUAL_API_SECRET' // Get from Cloudinary dashboard
});
```

### Step 4: Update API_BASE in frontend
In **pages/pdf-manager.js**, update:
```javascript
const API_BASE = 'http://localhost:5000/api/pdf'; // Change port if needed
```

## API Endpoints

### Upload PDF
```bash
POST /api/pdf/upload
Content-Type: multipart/form-data
Body: {pdf: <file>}

Response:
{
  "success": true,
  "data": {
    "publicId": "pdfs/1702123456789_document",
    "url": "https://res.cloudinary.com/...",
    "fileName": "document.pdf",
    "size": 250000,
    "uploadedAt": "2024-01-01T00:00:00Z"
  }
}
```

### Get PDF URL
```bash
GET /api/pdf/:publicId

Response:
{
  "success": true,
  "data": {
    "url": "https://res.cloudinary.com/..."
  }
}
```

### Delete PDF
```bash
DELETE /api/pdf/:publicId

Response:
{
  "success": true,
  "message": "PDF deleted successfully"
}
```

## Frontend Usage

### Access PDF Manager
Open in browser:
```
file:///c:/sai%20ram%20html/Online%20Library%20project/pages/pdf-manager.html
```

Or serve through your backend:
```
http://localhost:5000/pdf-manager.html
```

### Features
- ✅ Upload PDF files to Cloudinary
- ✅ Display PDFs in iframe viewer
- ✅ Download PDFs from Cloudinary
- ✅ Store upload history in localStorage
- ✅ View and manage uploaded PDFs
- ✅ Responsive design (mobile-friendly)

## Cloudinary Features

### Automatic Folder Organization
All PDFs are stored in the `pdfs/` folder on Cloudinary with naming:
```
pdfs/TIMESTAMP_FILENAME
```

### Download Improvements
PDFs are served with:
- Secure URLs (signed)
- Auto-quality optimization
- CDN distribution

### File Size Limits
- Default: 50MB per file
- Configurable in src/routes/pdf.js

## Troubleshooting

### "CORS" Error
- Ensure CORS is enabled in server.js
- Update frontend API_BASE URL to match backend

### "API Secret" Error
- Check your Cloudinary API secret in src/config/cloudinary.js
- Get secret from https://cloudinary.com/console

### File Upload Not Working
- Ensure `uploads/temp/` directory exists
- Check multer configuration in src/routes/pdf.js
- Verify file size doesn't exceed 50MB limit

### PDF Not Displaying
- Verify Cloudinary credentials are correct
- Check browser console for CORS errors
- Ensure publicId is correct format

## Security Notes

⚠️ **Important**: Never expose your API secret in frontend code!
- Keep API secret only in backend env variables
- The example uses frontend-only uploading (consider adding backend validation)
- Add authentication to upload endpoint in production

## Next Steps

1. ✅ Install cloudinary: `npm i cloudinary`
2. ✅ Files created in appropriate directories
3. 📝 Update server.js with PDF routes integration
4. 🔑 Add API secret from Cloudinary dashboard
5. 📂 Create uploads/temp directory
6. 🚀 Start backend server
7. 🌐 Test frontend at pdf-manager.html

## Environment Variables (Recommended)

Create **backend/.env**:
```
CLOUDINARY_CLOUD_NAME=duqfurljh
CLOUDINARY_API_KEY=526758682396799
CLOUDINARY_API_SECRET=your_actual_secret
```

Update **src/config/cloudinary.js**:
```javascript
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
```

Then install: `npm i dotenv`

---

**All files have been created in separate modules for easy maintenance and scalability!**
