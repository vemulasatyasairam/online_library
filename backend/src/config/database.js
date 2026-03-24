/**
 * MongoDB Database Connection
 */

const mongoose = require('mongoose');

mongoose.set('bufferCommands', false);

let listenersAttached = false;
let sigintHandlerAttached = false;

const getMongoURI = () => {
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI;
  if (process.env.MONGO_URI) return process.env.MONGO_URI;
  if (process.env.MONGODB_URL) return process.env.MONGODB_URL;

  // Keep localhost fallback only for local development.
  if (process.env.NODE_ENV !== 'production') {
    return 'mongodb://localhost:27017/online-library';
  }

  return null;
};

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return true;
    }

    const mongoURI = getMongoURI();

    if (!mongoURI) {
      throw new Error('MongoDB URI is not configured. Set MONGODB_URI (or MONGO_URI/MONGODB_URL).');
    }
    
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000
    });

    console.log('✓ MongoDB connected successfully');
    console.log(`  Database: ${mongoose.connection.name}`);
    console.log(`  Host: ${mongoose.connection.host}`);
    
    if (!listenersAttached) {
      // Handle connection events
      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected');
      });

      listenersAttached = true;
    }

    if (!sigintHandlerAttached) {
      // Graceful shutdown
      process.on('SIGINT', async () => {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
      });

      sigintHandlerAttached = true;
    }

    return true;

  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    throw err;
  }
};

module.exports = connectDB;
