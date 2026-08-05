import mongoose from 'mongoose';

/**
 * Address Schema subdocument for Customer default addresses.
 */
const AddressSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  street: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  pincode: { type: String, required: true, trim: true },
  landmark: { type: String, trim: true },
  isDefault: { type: Boolean, default: false }
}, { _id: true });

/**
 * Customer Schema:
 * Phone-first authentication model.
 * Primary Identifier: phoneNumber (E.164 format, e.g., +919876543210, UNIQUE, INDEXED).
 */
const CustomerSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    index: true,
    trim: true,
    validate: {
      validator: function(v) {
        // E.164 format validation (specifically tailored for international/Indian numbers: +91XXXXXXXXXX)
        return /^\+[1-9]\d{10,14}$/.test(v);
      },
      message: props => `${props.value} is not a valid E.164 phone number! Example format: +919876543210`
    }
  },
  name: {
    type: String,
    trim: true,
    default: 'Valued Customer'
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  defaultAddresses: [AddressSchema],
  role: {
    type: String,
    enum: ['CUSTOMER'],
    default: 'CUSTOMER',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// JSON output transformation to clean internal fields if needed
CustomerSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
    return ret;
  }
});

const Customer = mongoose.model('Customer', CustomerSchema);

export default Customer;
