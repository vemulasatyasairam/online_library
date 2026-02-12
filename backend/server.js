const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// MongoDB Connection
const connectDB = require('./src/config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5000',
    'http://localhost:5051',
    'http://localhost:5500',
    'http://127.0.0.1:5051',
    'http://127.0.0.1:5500',
    'http://localhost:8000',
    'http://localhost:8080',
    'file://'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Handle preflight requests
app.options('*', cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5000',
    'http://localhost:5051',
    'http://localhost:5500',
    'http://127.0.0.1:5051',
    'http://127.0.0.1:5500',
    'http://localhost:8000',
    'http://localhost:8080',
    'file://'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Routes
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const savedRoutes = require('./src/routes/saved');
const bookRoutes = require('./src/routes/books');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/saved', savedRoutes);
app.use('/api/books', bookRoutes);

// Legacy endpoints for compatibility
app.use('/api/login', (req, res) => authRoutes.handle(req, res, 'login'));
app.use('/api/send-otp', (req, res) => authRoutes.handle(req, res, 'send-otp'));
app.use('/api/verify-otp', (req, res) => authRoutes.handle(req, res, 'verify-otp'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Online Library API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    ok: false,
    error: err.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`CORS enabled for:`);
  console.log(`  - http://127.0.0.1:5051 (Live Server)`);
  console.log(`  - http://127.0.0.1:5500 (Live Server)`);
  console.log(`  - http://localhost:5051, 5500`);
  console.log(`  - http://localhost:3000, 5000, 8000, 8080`);
  console.log(`  - file:// protocol`);
});

module.exports = app;
