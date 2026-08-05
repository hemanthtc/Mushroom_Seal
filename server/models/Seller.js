import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * Seller Schema:
 * Business Vendor Account model.
 * Authenticates via Email + Password with bcrypt hashing.
 * Requires admin approval (status === 'APPROVED') before login is permitted.
 */
const SellerSchema = new mongoose.Schema({
  sellerId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    default: function() {
      return `SEL-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    }
  },
  email: {
    type: String,
    required: [true, 'Business email is required'],
    unique: true,
    index: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/, 'Please fill a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Excluded from query results by default for security
  },
  businessName: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true
  },
  gstinTaxId: {
    type: String,
    required: [true, 'GSTIN / Tax ID is required'],
    trim: true,
    uppercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING',
    index: true
  },
  role: {
    type: String,
    enum: ['SELLER'],
    default: 'SELLER',
    required: true
  }
}, {
  timestamps: true
});

// Pre-save hook to hash password with bcrypt if modified
SellerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Instance method to compare password during login
SellerSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Transform output to remove sensitive fields
SellerSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.password;
    return ret;
  }
});

const Seller = mongoose.model('Seller', SellerSchema);

export default Seller;
