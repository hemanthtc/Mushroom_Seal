export type CategoryType = 
  | 'All' 
  | 'Fresh Mushrooms' 
  | 'Leafy Greens' 
  | 'Root & Bulb Veggies' 
  | 'Exotic & Herbs' 
  | 'Farm Combos';

export type TabType = 
  | 'store' 
  | 'cart'
  | 'orders' 
  | 'dashboard' 
  | 'products' 
  | 'fulfillment' 
  | 'policy' 
  | 'profile';

export interface DistanceRules {
  maxQtyKm5: number;   // Within 5 km
  maxQtyKm15: number;  // 5 to 15 km
  maxQtyKmBeyond: number; // Beyond 15 km
}

export interface Product {
  id: string;
  name: string;
  category: CategoryType;
  price: number; // in INR ₹
  unit: 'kg' | 'pack' | '500g' | '250g' | '200g';
  stock: number;
  description: string;
  image: string;
  farmName: string;
  isOrganic: boolean;
  harvestedDate: string;
  distanceRules: DistanceRules;
  badge?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface AddressDetails {
  fullName: string;
  phone: string;
  streetAddress: string;
  city: string;
  pincode: string;
  landmark?: string;
  houseNo?: string;
  areaName?: string;
  deliveryInstructions?: string;
  addressTag?: 'Home' | 'Work' | 'Other';
  fullGoogleAddress?: string;
  estimatedDistanceKm: number;
  latitude?: number;
  longitude?: number;
}

export type OrderStatus = 
  | 'Pending' 
  | 'Packing' 
  | 'Out for Delivery' 
  | 'Delivered' 
  | 'Cancelled' 
  | 'Return Requested' 
  | 'Refunded';

export interface StatusTimeline {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  grandTotal: number;
  address: AddressDetails;
  status: OrderStatus;
  paymentMethod: 'Razorpay' | 'COD';
  paymentId: string;
  isPaid: boolean;
  createdAt: string;
  statusTimeline: StatusTimeline[];
  cancellationReason?: string;
  returnReason?: string;
  returnStatus?: 'Pending Review' | 'Approved' | 'Rejected' | 'Refund Issued';
  cancellationRequestedAt?: string;
  returnRequestedAt?: string;
  refundAmount?: number;
  refundType?: 'Online Razorpay Refund' | 'COD No Refund';
  refundId?: string;
}

export interface UserProfile {
  name: string;
  phone: string;
  email: string;
  savedAddresses: AddressDetails[];
  defaultAddressIndex: number;
}

export interface SellerProfile {
  sellerId: string;
  farmName: string;
  ownerName: string;
  phone: string;
  email: string;
  farmAddress: string;
  latitude: number;
  longitude: number;
  organicCertNo: string;
  rating: number;
  establishedYear: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  text: string;
}
