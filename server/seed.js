import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Customer from './models/Customer.js';
import Seller from './models/Seller.js';
import Order from './models/Order.js';
import AccountingLedger from './models/AccountingLedger.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await connectDB();

    // Clear existing collection records
    console.log('[Seed] Cleaning existing test collections...');
    await Customer.deleteMany({});
    await Seller.deleteMany({});
    await Order.deleteMany({});
    await AccountingLedger.deleteMany({});

    // 1. Seed Customer
    console.log('[Seed] Seeding Customer...');
    const customer = await Customer.create({
      phoneNumber: '+919876543210',
      name: 'Anish Sharma',
      email: 'anish@example.com',
      defaultAddresses: [
        {
          name: 'Home',
          street: '123 Green Park Avenue',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560001',
          isDefault: true
        }
      ],
      role: 'CUSTOMER'
    });

    // 2. Seed Approved Seller
    console.log('[Seed] Seeding Approved Seller...');
    const approvedSeller = new Seller({
      sellerId: 'SEL-APPROVED-001',
      email: 'seller.approved@example.com',
      password: 'SellerPassword123', // Will be hashed via pre-save hook
      businessName: 'ShroomCraft Organic Farms',
      gstinTaxId: '29ABCDE1234F1Z5',
      phone: '+919123456789',
      status: 'APPROVED',
      role: 'SELLER'
    });
    await approvedSeller.save();

    // 3. Seed Pending Seller
    console.log('[Seed] Seeding Pending Seller...');
    const pendingSeller = new Seller({
      sellerId: 'SEL-PENDING-002',
      email: 'seller.pending@example.com',
      password: 'SellerPassword123',
      businessName: 'Fungi World Ltd',
      gstinTaxId: '27XYZAB9876C1Z3',
      phone: '+919988776655',
      status: 'PENDING',
      role: 'SELLER'
    });
    await pendingSeller.save();

    // 4. Seed Order
    console.log('[Seed] Seeding Sample Order...');
    const sampleOrder = await Order.create({
      orderId: 'ORD-2026-88001',
      phoneNumber: customer.phoneNumber,
      sellerId: approvedSeller.sellerId,
      items: [],
      totalAmount: 0,
      shippingAddress: {
        name: 'Anish Sharma',
        street: '123 Green Park Avenue',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001'
      },
      orderStatus: 'CONFIRMED',
      paymentStatus: 'PAID',
      paymentMethod: 'ONLINE'
    });

    // 5. Seed Accounting Ledger Entry
    console.log('[Seed] Seeding Accounting Ledger Entry...');
    await AccountingLedger.create({
      ledgerId: 'LDG-2026-90001',
      sellerId: approvedSeller.sellerId,
      phoneNumber: customer.phoneNumber,
      orderId: sampleOrder.orderId,
      type: 'SALE',
      amount: 610,
      platformCommission: 61, // 10% platform commission
      vendorPayoutAmount: 549, // 90% payout
      status: 'PENDING',
      notes: 'Sale transaction for ORD-2026-88001'
    });

    console.log('\n====================================================');
    console.log(' SEED DATA GENERATED SUCCESSFULLY!');
    console.log('====================================================');
    console.log(' Customer Phone:     +919876543210');
    console.log(' Approved Seller:     seller.approved@example.com / SellerPassword123');
    console.log(' Pending Seller:      seller.pending@example.com / SellerPassword123');
    console.log(' Sample Order ID:     ORD-2026-88001');
    console.log(' Approved Seller ID:  SEL-APPROVED-001');
    console.log('====================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedDatabase();
