const express = require('express');
const path = require('path');
const cors = require('cors');

const booksRouter = require('./routes/books');
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');

const app = express();

app.use(express.json());

// Configure CORS to allow frontend requests
const corsOptions = {
  origin: [
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'file://',
    'http://localhost:3000',
    'http://localhost:8000',
    'http://localhost:8080'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// Serve static frontend (parent of backend folder)
const frontendRoot = path.join(__dirname, '..', '..');
app.use(express.static(frontendRoot));

// API routes
app.use('/api/books', booksRouter);
app.use('/api', authRouter);
app.use('/api/users', usersRouter);

// Fallback to main.html for client-side pages
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendRoot, 'main.html'));
});

module.exports = app;
