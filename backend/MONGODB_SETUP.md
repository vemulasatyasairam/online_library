# MongoDB Setup Instructions

## Prerequisites
Make sure MongoDB is installed and running on your system.

### Windows
1. Download MongoDB from https://www.mongodb.com/try/download/community
2. Install MongoDB Community Edition
3. Start MongoDB service:
   ```bash
   net start MongoDB
   ```

### Check if MongoDB is running:
```bash
mongosh
```

If it connects, MongoDB is running!

## Environment Variables
Update `.env` file:
```
MONGODB_URI=mongodb://localhost:27017/online-library
```

## Start the Server
```bash
cd backend
node server.js
```

## What's Changed
- ✅ User authentication now uses MongoDB
- ✅ Saved books stored in MongoDB
- ✅ OTP system uses MongoDB with auto-expiry
- ✅ All user data is persisted in database
- ✅ Password hashing with bcrypt
- ✅ Automatic timestamps (createdAt, updatedAt)

## Collections
- **users** - User accounts with authentication
- **savedbooks** - User's saved books
- **otps** - One-time passwords (auto-delete after 10 min)

## Migration from JSON
Your old JSON data is preserved. New registrations will use MongoDB.
To migrate existing users, manually copy data or re-register.
