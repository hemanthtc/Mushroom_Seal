import express from 'express';
import jwt from 'jsonwebtoken';
import Seller from '../models/Seller.js';
import Order from '../models/Order.js';
import AccountingLedger from '../models/AccountingLedger.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/seller/auth/register
 * Creates seller document with hashed password (bcrypt) and status 'PENDING'.
 */
router.post('/auth/register', async (req, res) => {
  try {
    const { email, password, businessName, gstinTaxId, phone } = req.body;

    if (!email || !password || !businessName || !gstinTaxId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: email, password, businessName, and gstinTaxId are mandatory'
      });
    }

    // Check if seller already exists
    const existingSeller = await Seller.findOne({ email: email.toLowerCase() });
    if (existingSeller) {
      return res.status(400).json({
        success: false,
        error: 'A seller account with this email address already exists'
      });
    }

    // Create seller instance (password will be hashed via pre-save hook in Seller schema)
    const newSeller = new Seller({
      email,
      password,
      businessName,
      gstinTaxId,
      phone,
      status: 'PENDING',
      role: 'SELLER'
    });

    await newSeller.save();

    return res.status(201).json({
      success: true,
      message: 'Seller registration submitted successfully. Your account is PENDING approval by site administrator.',
      seller: {
        sellerId: newSeller.sellerId,
        email: newSeller.email,
        businessName: newSeller.businessName,
        status: newSeller.status
      }
    });
  } catch (error) {
    console.error('[Seller Register Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Registration failed due to a server error.'
    });
  }
});

/**
 * POST /api/seller/auth/login
 * Verifies password and checks if status === 'APPROVED'. Issues a 12-hour JWT with role 'SELLER'.
 */
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Query seller with explicit password inclusion
    const seller = await Seller.findOne({ email: email.toLowerCase() }).select('+password');

    if (!seller) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials: Email not registered'
      });
    }

    // Verify password via bcrypt comparison
    const isMatch = await seller.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials: Password incorrect'
      });
    }

    // Check vendor account approval status
    if (seller.status !== 'APPROVED') {
      return res.status(403).json({
        success: false,
        error: `Access Denied: Your seller account status is '${seller.status}'. Only APPROVED sellers may log in.`,
        status: seller.status
      });
    }

    // Issue 12-Hour JWT containing { sellerId: "SEL-...", role: "SELLER" }
    const secret = process.env.JWT_SECRET || 'dev_jwt_secret_mushroom_seal_key_2026_super_secure';
    const token = jwt.sign(
      {
        sellerId: seller.sellerId,
        email: seller.email,
        role: 'SELLER'
      },
      secret,
      { expiresIn: '12h' }
    );

    return res.status(200).json({
      success: true,
      message: 'Seller login successful',
      token,
      seller: {
        sellerId: seller.sellerId,
        email: seller.email,
        businessName: seller.businessName,
        gstinTaxId: seller.gstinTaxId,
        role: seller.role
      }
    });
  } catch (error) {
    console.error('[Seller Login Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Login failed due to an internal server error.'
    });
  }
});

/**
 * GET /api/seller/dashboard
 * Protected route (requireRole('SELLER')) returning orders and sales ledger aggregated and filtered exclusively by sellerId.
 */
router.get('/dashboard', authenticateToken, requireRole('SELLER'), async (req, res) => {
  try {
    const sellerId = req.user.sellerId;

    if (!sellerId) {
      return res.status(400).json({
        success: false,
        error: 'Seller ID missing from token payload'
      });
    }

    // 1. Query orders filtered exclusively by sellerId
    const orders = await Order.find({ sellerId })
      .sort({ createdAt: -1 })
      .lean();

    // 2. Query accounting ledger filtered exclusively by sellerId
    const ledgerEntries = await AccountingLedger.find({ sellerId })
      .sort({ createdAt: -1 })
      .lean();

    // 3. Compute aggregate metrics
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.orderStatus === 'PENDING').length;
    const shippedOrders = orders.filter(o => o.orderStatus === 'SHIPPED').length;
    const deliveredOrders = orders.filter(o => o.orderStatus === 'DELIVERED').length;

    const totalSalesVolume = orders
      .filter(o => o.paymentStatus === 'PAID')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const totalCommissions = ledgerEntries
      .reduce((sum, entry) => sum + (entry.platformCommission || 0), 0);

    const netPayoutEarnings = ledgerEntries
      .reduce((sum, entry) => sum + (entry.vendorPayoutAmount || 0), 0);

    const pendingPayoutBalance = ledgerEntries
      .filter(entry => entry.status === 'PENDING')
      .reduce((sum, entry) => sum + (entry.vendorPayoutAmount || 0), 0);

    return res.status(200).json({
      success: true,
      sellerId,
      metrics: {
        totalOrders,
        pendingOrders,
        shippedOrders,
        deliveredOrders,
        totalSalesVolume,
        totalCommissions,
        netPayoutEarnings,
        pendingPayoutBalance
      },
      orders,
      ledger: ledgerEntries
    });
  } catch (error) {
    console.error('[Seller Dashboard Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate seller dashboard metrics.'
    });
  }
});

/**
 * DELETE /api/seller/profile
 * Delete seller profile from MongoDB
 */
router.delete('/profile', authenticateToken, requireRole('SELLER'), async (req, res) => {
  try {
    const sellerId = req.user.sellerId;
    await Seller.findOneAndDelete({ sellerId });
    return res.status(200).json({
      success: true,
      message: 'Seller account deleted successfully.'
    });
  } catch (error) {
    console.error('[Seller DELETE /profile Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete seller account.'
    });
  }
});

export default router;
