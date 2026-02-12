# Online Library Backend

Express.js backend for the Online Library project with JWT authentication.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

Or with auto-reload:
```bash
npm run dev
```

Server runs on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register new user
- `POST /api/auth/send-otp` - Send OTP for password reset
- `POST /api/auth/verify-otp` - Verify OTP and reset password

### Users (Protected)
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Saved Books (Protected)
- `GET /api/saved` - Get saved books
- `POST /api/saved` - Save a book
- `DELETE /api/saved/:bookId` - Remove saved book

## Environment Variables

Create a `.env` file:
```
PORT=3000
JWT_SECRET=your_jwt_secret_key_change_in_production
NODE_ENV=development
```

## Data Storage

User data and saved books are stored in JSON files in the `data/` directory:
- `data/users.json` - User accounts
- `data/saved.json` - Saved books per user
