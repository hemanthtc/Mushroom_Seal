import mongoose from 'mongoose';

/**
 * OtpStore Schema:
 * Stores SHA-256 hashed OTPs for Customer authentication.
 * Automatically expires and drops records after 300 seconds (5 minutes) using MongoDB TTL Index.
 */
const OtpStoreSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    index: true
  },
  otpHash: {
    type: String,
    required: true
  },
  attempts: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 // TTL index: auto-deletes document 5 minutes after creation
  }
});

const OtpStore = mongoose.model('OtpStore', OtpStoreSchema);

export default OtpStore;
