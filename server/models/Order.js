import mongoose from 'mongoose';

/**
 * Order Item Subdocument Schema
 */
const OrderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  unit: { type: String, default: 'kg' }
}, { _id: false });

/**
 * Order Schema:
 * Cross-references Customer (by phoneNumber) and Seller (by sellerId).
 */
const OrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    default: function() {
      return `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    }
  },
  phoneNumber: {
    type: String,
    required: [true, 'Customer phone number is required'],
    index: true,
    ref: 'Customer'
  },
  sellerId: {
    type: String,
    required: [true, 'Seller ID is required'],
    index: true,
    ref: 'Seller'
  },
  items: {
    type: [OrderItemSchema],
    validate: [array => array.length > 0, 'Order must contain at least one item']
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  shippingAddress: {
    name: { type: String },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  orderStatus: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
    default: 'PENDING',
    index: true
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'PAID', 'FAILED'],
    default: 'PENDING'
  },
  paymentMethod: {
    type: String,
    enum: ['COD', 'ONLINE', 'UPI'],
    default: 'ONLINE'
  }
}, {
  timestamps: true
});

OrderSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
    return ret;
  }
});

const Order = mongoose.model('Order', OrderSchema);

export default Order;
