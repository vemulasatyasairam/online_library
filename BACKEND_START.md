# Quick Start Guide

## Starting the Backend Server

### Option 1: Using Batch File (Easiest - Windows)
Double-click the `start-backend.bat` file in the project root.

### Option 2: Manual Start
```bash
# Navigate to backend folder
cd backend

# Install dependencies (first time only)
npm install

# Start the server
npm start
```

The server will run on: http://localhost:3000

## Features Requiring Backend

The following features need the backend server running:
- ✅ **Password Change** - Update your password
- ✅ **Profile Update** - Change your name
- ✅ **Avatar Upload** - Upload profile pictures
- ✅ **Full Authentication** - Login/Register with database

## Features Working Without Backend

These features work offline with localStorage:
- ✅ **View Profile** - See your basic info
- ✅ **Save Books** - Bookmark your favorite books
- ✅ **Browse Books** - Explore the library

## Troubleshooting

### "Failed to fetch" Error
This means the backend server is not running. Start it using one of the options above.

### "Not authenticated" Error  
Make sure you're logged in. The system stores your auth token as `auth_token` in localStorage.

### Port Already in Use
If port 3000 is busy, you can change it in `backend/.env`:
```
PORT=3001
```

## Backend Requirements
- Node.js (v14 or higher)
- MongoDB (for database features)
- npm or yarn

## First Time Setup
1. Navigate to backend folder: `cd backend`
2. Install dependencies: `npm install`
3. Create `.env` file (copy from `.env.example` if available)
4. Start MongoDB service (if using database)
5. Run: `npm start`

## Environment Variables
Create a `.env` file in the `backend` folder with:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/online-library
JWT_SECRET=your-secret-key-here
```

## Support
If you encounter issues, check:
- Console errors in browser (F12)
- Backend terminal for server errors
- Network tab in DevTools for API responses
