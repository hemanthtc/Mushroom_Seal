import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import connectDB from './config/db.js';
import customerRoutes from './routes/customerRoutes.js';
import sellerRoutes from './routes/sellerRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas via Mongoose
connectDB();

// Global Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Healthcheck Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/customer', customerRoutes);
app.use('/api/seller', sellerRoutes);

// App version endpoint (for silent client-side update check)
app.get('/api/version', (req, res) => {
  res.status(200).json({ version: '1.1.0' });
});

// Static File Deployment & Dual SPA Fallback Routing
// --------------------------------------------------
// Customer portal build directory: client-dist (or fallback to dist)
const clientDistPath = fs.existsSync(path.join(projectRoot, 'client-dist'))
  ? path.join(projectRoot, 'client-dist')
  : path.join(projectRoot, 'dist');

// Seller portal build directory: seller-dist (or fallback to dist/seller)
const sellerDistPath = fs.existsSync(path.join(projectRoot, 'seller-dist'))
  ? path.join(projectRoot, 'seller-dist')
  : path.join(projectRoot, 'dist', 'seller');

// Helper: set no-cache headers on index.html to prevent stale deployments
const noCacheIndexHeaders = (res, filePath) => {
  if (path.basename(filePath) === 'index.html') {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
};

// Serve Seller static assets at /seller
if (fs.existsSync(sellerDistPath)) {
  app.use('/seller', express.static(sellerDistPath, { setHeaders: noCacheIndexHeaders }));
}

// Serve Customer static assets at /
if (fs.existsSync(clientDistPath)) {
  app.use('/', express.static(clientDistPath, { setHeaders: noCacheIndexHeaders }));
}

// SPA Routing Fallback for Seller Portal (/seller/*)
app.get('/seller/*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  
  const sellerIndexPath = path.join(sellerDistPath, 'index.html');
  if (fs.existsSync(sellerIndexPath)) {
    return res.sendFile(sellerIndexPath);
  }
  // Fallback to customer SPA if seller dist is not separately built
  const clientIndexPath = path.join(clientDistPath, 'index.html');
  if (fs.existsSync(clientIndexPath)) {
    return res.sendFile(clientIndexPath);
  }
  next();
});

// SPA Routing Fallback for Customer Portal (/*)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();

  const clientIndexPath = path.join(clientDistPath, 'index.html');
  if (fs.existsSync(clientIndexPath)) {
    return res.sendFile(clientIndexPath);
  }
  return res.status(404).json({
    error: 'Build output directories (client-dist/seller-dist) not found. Please run build scripts.'
  });
});

// Centralized 404 handler for unmatched /api routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `API route not found: ${req.method} ${req.originalUrl}`
  });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[Unhandled Global Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` Dual-Interface E-Commerce Server Running on Port ${PORT}`);
  console.log(` Customer Portal: http://localhost:${PORT}/`);
  console.log(` Seller Portal:   http://localhost:${PORT}/seller`);
  console.log(` Customer APIs:   http://localhost:${PORT}/api/customer/*`);
  console.log(` Seller APIs:     http://localhost:${PORT}/api/seller/*`);
  console.log(` Environment:     ${process.env.NODE_ENV || 'development'}`);
  console.log(`====================================================`);
});

export default app;
