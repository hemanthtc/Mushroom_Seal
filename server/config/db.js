import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

// Force Node.js to use Google DNS to resolve MongoDB Atlas SRV records, bypassing local DNS/ISP issues
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config();

/**
 * Establishes and manages Mongoose connection to MongoDB Atlas.
 * Handles connection events, reconnection policies, and graceful teardown.
 */
const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb+srv://hemanthtc8296_db_user:z66UFk6gAbCZO8EZ@cluster0.akdqgek.mongodb.net/mushroom_seal?appName=Cluster0';

    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true, // Build indexes in production/dev
    });

    console.log(`[MongoDB Atlas] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB Atlas] Connection Error: ${error.message}`);
    // Do not exit process immediately if in development mode to allow fallback inspection
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

// Monitor connection events
mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB Atlas] Connection lost. Attempting to reconnect...');
});

mongoose.connection.on('error', (err) => {
  console.error(`[MongoDB Atlas] Runtime Connection Error: ${err.message}`);
});

// Handle graceful shutdown on process signals
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('[MongoDB Atlas] Connection closed due to application termination (SIGINT).');
  process.exit(0);
});

export default connectDB;
