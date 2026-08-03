import type { Product, Order } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Fresh Organic Oyster Mushrooms',
    category: 'Fresh Mushrooms',
    price: 180,
    unit: '250g',
    stock: 45,
    description: 'Directly harvested white & pearl oyster mushrooms grown on organic paddy straw substrate. High protein & meaty texture.',
    image: 'https://images.unsplash.com/photo-1504470695779-75300268aa0e?auto=format&fit=crop&w=800&q=80',
    farmName: 'ShroomValley Organic Farm',
    isOrganic: true,
    harvestedDate: 'Today 5:30 AM',
    badge: 'Bestseller',
    distanceRules: {
      maxQtyKm5: 10,
      maxQtyKm15: 5,
      maxQtyKmBeyond: 2,
    },
  },
  {
    id: 'prod-2',
    name: 'Premium Button Mushrooms (Button)',
    category: 'Fresh Mushrooms',
    price: 120,
    unit: '250g',
    stock: 60,
    description: 'Crisp, snow-white button mushrooms rich in vitamin D and antioxidants. Great for curries, sautés, and pizzas.',
    image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80',
    farmName: 'ShroomValley Organic Farm',
    isOrganic: true,
    harvestedDate: 'Today 6:00 AM',
    badge: 'Farm Fresh',
    distanceRules: {
      maxQtyKm5: 12,
      maxQtyKm15: 6,
      maxQtyKmBeyond: 3,
    },
  },
  {
    id: 'prod-3',
    name: 'Exotic Shiitake Mushrooms',
    category: 'Fresh Mushrooms',
    price: 320,
    unit: '200g',
    stock: 25,
    description: 'Rich umami gourmet Shiitake mushrooms, cultivated in climate-controlled wood log units. Ideal for soups & stir-fries.',
    image: 'https://images.unsplash.com/photo-1627443834164-98eb82c16137?auto=format&fit=crop&w=800&q=80',
    farmName: 'GreenCap Alpine Shrooms',
    isOrganic: true,
    harvestedDate: 'Yesterday 4:00 PM',
    badge: 'Exotic',
    distanceRules: {
      maxQtyKm5: 8,
      maxQtyKm15: 4,
      maxQtyKmBeyond: 1,
    },
  },
  {
    id: 'prod-4',
    name: 'Farm Hydroponic Spinach (Palak)',
    category: 'Leafy Greens',
    price: 45,
    unit: '500g',
    stock: 80,
    description: 'Pesticide-free hydroponic spinach leaves packed with iron and calcium. Thoroughly washed and bundle packed.',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80',
    farmName: 'SunGlow Farmstead',
    isOrganic: true,
    harvestedDate: 'Today 5:00 AM',
    distanceRules: {
      maxQtyKm5: 15,
      maxQtyKm15: 8,
      maxQtyKmBeyond: 4,
    },
  },
  {
    id: 'prod-5',
    name: 'Red Country Tomatoes (Desi)',
    category: 'Root & Bulb Veggies',
    price: 60,
    unit: 'kg',
    stock: 120,
    description: 'Tangy and juicy naturally ripened vine tomatoes. Perfect for rich Indian curries and gravy bases.',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
    farmName: 'SunGlow Farmstead',
    isOrganic: false,
    harvestedDate: 'Today 6:15 AM',
    badge: 'Hot Deal',
    distanceRules: {
      maxQtyKm5: 20,
      maxQtyKm15: 10,
      maxQtyKmBeyond: 5,
    },
  },
  {
    id: 'prod-6',
    name: 'Fresh Crunchy Orange Carrots',
    category: 'Root & Bulb Veggies',
    price: 70,
    unit: 'kg',
    stock: 75,
    description: 'Farm-picked sweet orange carrots, washed and graded for supreme freshness. High in beta-carotene.',
    image: 'https://images.unsplash.com/photo-1598170845058-12ef4a457939?auto=format&fit=crop&w=800&q=80',
    farmName: 'RootHaven Agro',
    isOrganic: true,
    harvestedDate: 'Yesterday 6:00 PM',
    distanceRules: {
      maxQtyKm5: 15,
      maxQtyKm15: 10,
      maxQtyKmBeyond: 4,
    },
  },
  {
    id: 'prod-7',
    name: 'King Oyster Mushrooms (Eryngii)',
    category: 'Fresh Mushrooms',
    price: 290,
    unit: '250g',
    stock: 20,
    description: 'Thick, chewy mushroom stems with subtle savory flavor. Slices cook into mushroom steaks.',
    image: 'https://images.unsplash.com/photo-1565689871330-80c10c1448dd?auto=format&fit=crop&w=800&q=80',
    farmName: 'ShroomValley Organic Farm',
    isOrganic: true,
    harvestedDate: 'Today 5:30 AM',
    badge: 'Gourmet',
    distanceRules: {
      maxQtyKm5: 6,
      maxQtyKm15: 3,
      maxQtyKmBeyond: 1,
    },
  },
  {
    id: 'prod-8',
    name: 'Immunity Farm Veggie Basket',
    category: 'Farm Combos',
    price: 499,
    unit: 'pack',
    stock: 30,
    description: 'Curated combo box containing 250g Oyster Shrooms, 500g Palak, 1kg Tomatoes, 1kg Carrots & Fresh Rosemary.',
    image: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=800&q=80',
    farmName: 'ShroomValley & Co',
    isOrganic: true,
    harvestedDate: 'Today 6:00 AM',
    badge: 'Best Value',
    distanceRules: {
      maxQtyKm5: 5,
      maxQtyKm15: 3,
      maxQtyKmBeyond: 1,
    },
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-79102',
    items: [
      {
        product: INITIAL_PRODUCTS[0],
        quantity: 2
      },
      {
        product: INITIAL_PRODUCTS[3],
        quantity: 1
      }
    ],
    subtotal: 405,
    deliveryFee: 40,
    grandTotal: 445,
    address: {
      fullName: 'Ananya Sharma',
      phone: '+91 98765 43210',
      streetAddress: 'Flat 402, Green Meadows, Sector 14',
      city: 'Bengaluru',
      pincode: '560034',
      landmark: 'Near HDFC Bank ATM',
      estimatedDistanceKm: 3.5,
    },
    status: 'Packing',
    paymentMethod: 'Razorpay',
    paymentId: 'pay_Nz92810Xkz81',
    isPaid: true,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    statusTimeline: [
      { status: 'Pending', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), note: 'Order placed & payment verified' },
      { status: 'Packing', timestamp: new Date(Date.now() - 3600000 * 1).toISOString(), note: 'Seller is packing fresh mushrooms' }
    ]
  },
  {
    id: 'ORD-68214',
    items: [
      {
        product: INITIAL_PRODUCTS[1],
        quantity: 3
      },
      {
        product: INITIAL_PRODUCTS[4],
        quantity: 2
      }
    ],
    subtotal: 480,
    deliveryFee: 60,
    grandTotal: 540,
    address: {
      fullName: 'Rahul Verma',
      phone: '+91 91234 56789',
      streetAddress: 'House #88, Palm Tree Lane',
      city: 'Bengaluru',
      pincode: '560102',
      estimatedDistanceKm: 8.2,
    },
    status: 'Out for Delivery',
    paymentMethod: 'Razorpay',
    paymentId: 'pay_Mj78192Aps02',
    isPaid: true,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    statusTimeline: [
      { status: 'Pending', timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), note: 'Order confirmed' },
      { status: 'Packing', timestamp: new Date(Date.now() - 3600000 * 3.5).toISOString(), note: 'Harvested & insulated package ready' },
      { status: 'Out for Delivery', timestamp: new Date(Date.now() - 3600000 * 1).toISOString(), note: 'Rider on the way with temperature control box' }
    ]
  },
  {
    id: 'ORD-54190',
    items: [
      {
        product: INITIAL_PRODUCTS[7],
        quantity: 1
      }
    ],
    subtotal: 499,
    deliveryFee: 40,
    grandTotal: 539,
    address: {
      fullName: 'Priya Nair',
      phone: '+91 99887 76655',
      streetAddress: 'Villa 12, Lakeside Enclave',
      city: 'Bengaluru',
      pincode: '560066',
      estimatedDistanceKm: 4.0,
    },
    status: 'Delivered',
    paymentMethod: 'Razorpay',
    paymentId: 'pay_Kq12903Bxc44',
    isPaid: true,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    statusTimeline: [
      { status: 'Pending', timestamp: new Date(Date.now() - 3600000 * 24).toISOString() },
      { status: 'Packing', timestamp: new Date(Date.now() - 3600000 * 20).toISOString() },
      { status: 'Out for Delivery', timestamp: new Date(Date.now() - 3600000 * 18).toISOString() },
      { status: 'Delivered', timestamp: new Date(Date.now() - 3600000 * 16).toISOString(), note: 'Handed over to customer' }
    ]
  }
];
