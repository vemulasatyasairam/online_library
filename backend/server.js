const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB Connection
const connectDB = require('./src/config/database');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_RETRY_INTERVAL_MS = parseInt(process.env.DB_RETRY_INTERVAL_MS || '15000', 10);

// Middleware - CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like file:// or null)
    if (!origin || origin === 'null') return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5000',
      'http://localhost:5051',
      'http://localhost:5500',
      'http://127.0.0.1:5051',
      'http://127.0.0.1:5500',
      'http://localhost:8000',
      'http://localhost:8080',
      'https://online-library-y85q.onrender.com'
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins for development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Handle preflight requests
app.options('*', cors());

// Serve uploaded files
app.use('/uploads', express.static('uploads'));
app.use('/books', express.static(path.join(__dirname, 'books')));

// Return a clear 503 when MongoDB is unavailable instead of query buffering timeouts
app.use('/api', (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      ok: false,
      error: 'Database is not connected. Please try again in a few seconds.'
    });
  }

  next();
});

// Routes
const authRoutes = require('./src/routes/auth');
const adminRoutes = require('./src/routes/admin');
const userRoutes = require('./src/routes/users');
const savedRoutes = require('./src/routes/saved');
const bookRoutes = require('./src/routes/books');
const pdfRoutes = require('./src/routes/pdf');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/saved', savedRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/pdf', pdfRoutes);

// Legacy endpoints for compatibility
app.use('/api/login', (req, res) => authRoutes.handle(req, res, 'login'));
app.use('/api/send-otp', (req, res) => authRoutes.handle(req, res, 'send-otp'));
app.use('/api/verify-otp', (req, res) => authRoutes.handle(req, res, 'verify-otp'));

// Health check
app.get('/health', (req, res) => {
  const stateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  const dbState = mongoose.connection.readyState;

  res.json({
    status: dbState === 1 ? 'ok' : 'degraded',
    message: 'Online Library API is running',
    database: {
      state: stateMap[dbState] || 'unknown',
      name: mongoose.connection.name || null,
      host: mongoose.connection.host || null
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    ok: false,
    error: err.message || 'Internal server error'
  });
});

const ensureDatabaseConnection = async () => {
  if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
    return;
  }

  try {
    await connectDB();
  } catch (error) {
    console.warn(`[DB RETRY] MongoDB unavailable: ${error.message}`);
  }
};

// Start server immediately; DB reconnects happen in background when needed
const startServer = async () => {
  await ensureDatabaseConnection();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`CORS enabled for:`);
    console.log(`  - http://127.0.0.1:5051 (Live Server)`);
    console.log(`  - http://127.0.0.1:5500 (Live Server)`);
    console.log(`  - http://localhost:5051, 5500`);
    console.log(`  - http://localhost:3000, 5000, 8000, 8080`);
    console.log(`  - file:// protocol`);
  });

  const retryTimer = setInterval(ensureDatabaseConnection, DB_RETRY_INTERVAL_MS);
  retryTimer.unref();
};

startServer();

module.exports = app;
