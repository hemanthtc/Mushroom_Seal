import mongoose from 'mongoose';

/**
 * AccountingLedger Schema:
 * Financial ledger referencing sellerId and phoneNumber to track transactions,
 * platform commissions, payouts, and settlements.
 */
const AccountingLedgerSchema = new mongoose.Schema({
  ledgerId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    default: function() {
      return `LDG-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    }
  },
  sellerId: {
    type: String,
    required: [true, 'Seller ID is required'],
    index: true,
    ref: 'Seller'
  },
  phoneNumber: {
    type: String,
    index: true,
    ref: 'Customer'
  },
  orderId: {
    type: String,
    index: true,
    ref: 'Order'
  },
  type: {
    type: String,
    enum: ['SALE', 'COMMISSION', 'PAYOUT', 'REFUND'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  platformCommission: {
    type: Number,
    default: 0
  },
  vendorPayoutAmount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['PENDING', 'SETTLED'],
    default: 'PENDING',
    index: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

AccountingLedgerSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
    return ret;
  }
});

const AccountingLedger = mongoose.model('AccountingLedger', AccountingLedgerSchema);

export default AccountingLedger;
