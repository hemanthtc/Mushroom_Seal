import express from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import Customer from '../models/Customer.js';
import Order from '../models/Order.js';
import OtpStore from '../models/OtpStore.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Rate limiter for send-otp endpoint: Max 5 requests per 5 minutes per IP
const otpRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    error: 'Too many OTP requests. Please wait 5 minutes before requesting again.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Utility: Compute SHA-256 hash for OTP string
 */
const hashOtp = (otp) => {
  return crypto.createHash('sha256').update(String(otp)).digest('hex');
};

/**
 * Utility: Validate E.164 phone number format (+919876543210)
 */
const isValidE164 = (phone) => {
  return typeof phone === 'string' && /^\+[1-9]\d{10,14}$/.test(phone);
};

/**
 * POST /api/customer/auth/send-otp
 * Generates 6-digit numeric OTP, computes SHA-256 hash, and stores in OtpStore with 5-min TTL.
 */
router.post('/auth/send-otp', otpRateLimiter, async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber || !isValidE164(phoneNumber)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number format. Must be in E.164 format (e.g., +919876543210)'
      });
    }

    // Generate secure 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = hashOtp(generatedOtp);

    // Delete any existing active OTPs for this phone number
    await OtpStore.deleteMany({ phoneNumber });

    // Store new OTP hash with 5-min TTL
    await OtpStore.create({
      phoneNumber,
      otpHash,
      attempts: 0
    });

    console.log(`[SMS Gateway Mock] Sent OTP ${generatedOtp} to ${phoneNumber}`);

    return res.status(200).json({
      success: true,
      message: `OTP sent successfully to ${phoneNumber}`,
      // Return simulated OTP in dev mode for convenient testing
      debugOtp: process.env.NODE_ENV !== 'production' ? generatedOtp : undefined
    });
  } catch (error) {
    console.error('[Customer send-otp Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to send OTP. Internal server error.'
    });
  }
});

/**
 * POST /api/customer/auth/verify-otp
 * Validates OTP, performs upsert (findOneAndUpdate with upsert: true) for phone number with role 'CUSTOMER',
 * and issues a 30-day JWT.
 */
router.post('/auth/verify-otp', async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Both phoneNumber and otp are required'
      });
    }

    if (!isValidE164(phoneNumber)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number format. Must be E.164 (e.g., +919876543210)'
      });
    }

    // Find active OTP record
    const otpRecord = await OtpStore.findOne({ phoneNumber });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        error: 'OTP expired or not found. Please request a new OTP.'
      });
    }

    // Check rate limit on verification attempts (max 5 failed attempts)
    if (otpRecord.attempts >= 5) {
      await OtpStore.deleteOne({ _id: otpRecord._id });
      return res.status(429).json({
        success: false,
        error: 'Maximum verification attempts exceeded. Please request a new OTP.'
      });
    }

    // Verify OTP hash
    const inputHash = hashOtp(otp);
    if (inputHash !== otpRecord.otpHash) {
      // Increment attempt counter
      otpRecord.attempts += 1;
      await otpRecord.save();

      return res.status(400).json({
        success: false,
        error: `Invalid OTP. ${5 - otpRecord.attempts} attempts remaining.`
      });
    }

    // OTP Verified! Consume and remove the OTP record
    await OtpStore.deleteOne({ _id: otpRecord._id });

    // Upsert Customer record (findOneAndUpdate with upsert: true)
    const customer = await Customer.findOneAndUpdate(
      { phoneNumber },
      {
        $setOnInsert: {
          phoneNumber,
          role: 'CUSTOMER',
          name: 'Valued Customer'
        }
      },
      { upsert: true, new: true, runValidators: true }
    );

    // Issue 30-Day JWT containing { phoneNumber: "+91...", role: "CUSTOMER" }
    const secret = process.env.JWT_SECRET || 'dev_jwt_secret_mushroom_seal_key_2026_super_secure';
    const token = jwt.sign(
      {
        phoneNumber: customer.phoneNumber,
        role: 'CUSTOMER',
        customerId: customer._id
      },
      secret,
      { expiresIn: '30d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Authentication successful',
      token,
      customer: {
        phoneNumber: customer.phoneNumber,
        name: customer.name,
        role: customer.role
      }
    });
  } catch (error) {
    console.error('[Customer verify-otp Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to verify OTP. Internal server error.'
    });
  }
});

/**
 * GET /api/customer/orders
 * Protected route returning order history queried exclusively by phoneNumber.
 */
router.get('/orders', authenticateToken, requireRole('CUSTOMER'), async (req, res) => {
  try {
    const phoneNumber = req.user.phoneNumber;

    const orders = await Order.find({ phoneNumber })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('[Customer GET /orders Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve order history.'
    });
  }
});

/**
 * DELETE /api/customer/profile
 * Delete customer profile from MongoDB
 */
router.delete('/profile', authenticateToken, requireRole('CUSTOMER'), async (req, res) => {
  try {
    const customerId = req.user.customerId || req.user.id;
    await Customer.findByIdAndDelete(customerId);
    return res.status(200).json({
      success: true,
      message: 'Customer account deleted successfully.'
    });
  } catch (error) {
    console.error('[Customer DELETE /profile Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete customer account.'
    });
  }
});

export default router;
