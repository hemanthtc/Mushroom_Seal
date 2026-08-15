import type { Product, Order, CartItem, AddressDetails, UserProfile, SellerProfile, DeliveryAgent } from '../types';
import { INITIAL_PRODUCTS, INITIAL_ORDERS } from '../data/mockData';

const PRODUCTS_KEY = 'mushroom_veggies_products';
const ORDERS_KEY = 'mushroom_veggies_orders';
const CART_KEY = 'mushroom_veggies_cart';
const ADDRESS_KEY = 'mushroom_veggies_address';
const ROLE_KEY = 'mushroom_veggies_role';
const USER_PROFILE_KEY = 'mushroom_veggies_user_profile';
const SELLER_PROFILE_KEY = 'mushroom_veggies_seller_profile';
const CUSTOMER_SESSION_EXPIRY_KEY = 'mushroom_veggies_customer_expiry';
const SELLER_SESSION_KEY = 'mushroom_veggies_seller_session';
const DELIVERY_SESSION_KEY = 'mushroom_veggies_delivery_session';
const DELIVERY_TOKEN_KEY = 'delivery_token';
const CUSTOMER_TOKEN_KEY = 'customer_token';
const SELLER_TOKEN_KEY = 'seller_token';
const ACTIVE_CUST_PHONE_KEY = 'mushroom_veggies_active_cust_phone';

export const sanitizePhone = (phone?: string): string => {
  if (!phone) return 'guest';
  return phone.replace(/\D/g, '') || 'guest';
};

export const getActiveCustomerPhone = (): string => {
  return localStorage.getItem(ACTIVE_CUST_PHONE_KEY) || '';
};

export const setActiveCustomerPhone = (phone: string): void => {
  localStorage.setItem(ACTIVE_CUST_PHONE_KEY, phone);
};

export const DEFAULT_ADDRESS: AddressDetails = {
  fullName: 'Vikram Sethi',
  phone: '+91 98450 12345',
  streetAddress: 'Flat 102, Laurel Springs Apt, Koramangala 4th Block',
  city: 'Bengaluru',
  pincode: '560034',
  landmark: 'Opposite Sony World Junction',
  estimatedDistanceKm: 4.5,
  latitude: 12.9352,
  longitude: 77.6245,
};

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Vikram Sethi',
  phone: '+91 98450 12345',
  email: 'vikram.sethi@example.com',
  savedAddresses: [
    DEFAULT_ADDRESS,
    {
      fullName: 'Vikram Sethi (Office)',
      phone: '+91 98450 12345',
      streetAddress: 'TechPark Tower B, Outer Ring Road',
      city: 'Bengaluru',
      pincode: '560103',
      estimatedDistanceKm: 9.8,
      latitude: 12.9260,
      longitude: 77.6762,
    }
  ],
  defaultAddressIndex: 0,
};

export const DEFAULT_SELLER_PROFILE: SellerProfile = {
  sellerId: 'FARM-8821',
  farmName: 'ShroomValley Organic & Agro Farm',
  ownerName: 'Ramesh Patel',
  phone: '+91 94480 99887',
  email: 'ramesh.patel@shroomvalley.org',
  farmAddress: 'Survey #42, Organic Agro Belt, Sarjapur Road, Bengaluru',
  latitude: 12.9716,
  longitude: 77.5946,
  organicCertNo: 'IND-ORG-2024-88192',
  rating: 4.9,
  establishedYear: 2018,
};

const PREBUILT_PRODUCT_IDS = ['prod-1', 'prod-2', 'prod-3', 'prod-4', 'prod-5', 'prod-6', 'prod-7', 'prod-8'];
const PREBUILT_ORDER_IDS = ['ORD-79102', 'ORD-68214', 'ORD-54190'];

// Initialize default storage if empty
export const initializeStorage = (): void => {
  if (!localStorage.getItem(PRODUCTS_KEY)) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
  } else {
    const existing = getProducts();
    const filtered = existing.filter((p) => !PREBUILT_PRODUCT_IDS.includes(p.id));
    if (filtered.length !== existing.length) {
      saveProducts(filtered);
    }
  }
  if (!localStorage.getItem(ORDERS_KEY)) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(INITIAL_ORDERS));
  } else {
    const existingOrders = getOrders();
    const filteredOrders = existingOrders.filter((o) => !PREBUILT_ORDER_IDS.includes(o.id));
    if (filteredOrders.length !== existingOrders.length) {
      saveOrders(filteredOrders);
    }
  }
  if (!localStorage.getItem(ROLE_KEY)) {
    localStorage.setItem(ROLE_KEY, 'buyer');
  }
  if (!localStorage.getItem(SELLER_PROFILE_KEY)) {
    localStorage.setItem(SELLER_PROFILE_KEY, JSON.stringify(DEFAULT_SELLER_PROFILE));
  }
};

// --- SESSION STORAGE HELPERS ---

export const saveCustomerSession = (profile: UserProfile, token = 'cust_jwt_token_active'): void => {
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  const expiryTime = Date.now() + SEVEN_DAYS_MS;
  localStorage.setItem(CUSTOMER_TOKEN_KEY, token);
  localStorage.setItem(CUSTOMER_SESSION_EXPIRY_KEY, expiryTime.toString());
  setActiveCustomerPhone(profile.phone);
  saveUserProfile(profile, profile.phone);
};

export const getCustomerSession = (): UserProfile | null => {
  const token = localStorage.getItem(CUSTOMER_TOKEN_KEY);
  const expiryStr = localStorage.getItem(CUSTOMER_SESSION_EXPIRY_KEY);
  const activePhone = getActiveCustomerPhone();

  if (!token || !expiryStr || !activePhone) return null;

  const expiry = parseInt(expiryStr, 10);
  if (isNaN(expiry) || Date.now() > expiry) {
    clearCustomerSession();
    return null;
  }

  return getUserProfile(activePhone);
};

export const clearCustomerSession = (): void => {
  localStorage.removeItem(CUSTOMER_TOKEN_KEY);
  localStorage.removeItem(CUSTOMER_SESSION_EXPIRY_KEY);
  localStorage.removeItem(ACTIVE_CUST_PHONE_KEY);
};

export const saveSellerSession = (profile: SellerProfile, token = 'seller_jwt_token_active'): void => {
  sessionStorage.setItem(SELLER_TOKEN_KEY, token);
  sessionStorage.setItem(SELLER_SESSION_KEY, JSON.stringify(profile));
  saveSellerProfile(profile);
};

export const getSellerSession = (): SellerProfile | null => {
  const token = sessionStorage.getItem(SELLER_TOKEN_KEY);
  const sessionData = sessionStorage.getItem(SELLER_SESSION_KEY);

  if (!token || !sessionData) return null;

  try {
    return JSON.parse(sessionData) as SellerProfile;
  } catch {
    return getSellerProfile();
  }
};

export const clearSellerSession = (): void => {
  sessionStorage.removeItem(SELLER_TOKEN_KEY);
  sessionStorage.removeItem(SELLER_SESSION_KEY);
};

// --- DELIVERY AGENT DIRECTORY & SESSION ---
export const DEFAULT_DELIVERY_AGENTS: DeliveryAgent[] = [
  {
    agentId: 'RIDER-001',
    name: 'Arjun Kumar',
    phone: '+91 90080 11223',
    vehicle: 'Electric Scooter',
    vehicleNumber: 'KA-05-EG-4412',
    rating: 4.8,
    zone: 'South Bengaluru',
  },
  {
    agentId: 'RIDER-002',
    name: 'Priya Nair',
    phone: '+91 90080 55667',
    vehicle: 'Insulated Cold-Box Bike',
    vehicleNumber: 'KA-03-HH-9021',
    rating: 4.9,
    zone: 'East Bengaluru',
  },
];

const DELIVERY_AGENTS_KEY = 'mushroom_veggies_delivery_agents';

export const getDeliveryAgents = (): DeliveryAgent[] => {
  try {
    const data = localStorage.getItem(DELIVERY_AGENTS_KEY);
    return data ? JSON.parse(data) : DEFAULT_DELIVERY_AGENTS;
  } catch {
    return DEFAULT_DELIVERY_AGENTS;
  }
};

export const saveDeliveryAgents = (agents: DeliveryAgent[]): void => {
  localStorage.setItem(DELIVERY_AGENTS_KEY, JSON.stringify(agents));
};

export const findDeliveryAgent = (agentId: string): DeliveryAgent | undefined => {
  const clean = agentId.trim().toUpperCase();
  return getDeliveryAgents().find((a) => a.agentId.toUpperCase() === clean);
};

export const saveDeliverySession = (agent: DeliveryAgent, token = 'delivery_jwt_token_active'): void => {
  sessionStorage.setItem(DELIVERY_TOKEN_KEY, token);
  sessionStorage.setItem(DELIVERY_SESSION_KEY, JSON.stringify(agent));
};

export const getDeliverySession = (): DeliveryAgent | null => {
  const token = sessionStorage.getItem(DELIVERY_TOKEN_KEY);
  const data = sessionStorage.getItem(DELIVERY_SESSION_KEY);
  if (!token || !data) return null;
  try {
    return JSON.parse(data) as DeliveryAgent;
  } catch {
    return null;
  }
};

export const clearDeliverySession = (): void => {
  sessionStorage.removeItem(DELIVERY_TOKEN_KEY);
  sessionStorage.removeItem(DELIVERY_SESSION_KEY);
};

export const clearAllSessions = (): void => {
  clearCustomerSession();
  clearSellerSession();
  clearDeliverySession();
};

// User Profile CRUD (Isolated per phone)
export const getUserProfile = (phone?: string): UserProfile => {
  try {
    const targetPhone = phone || getActiveCustomerPhone();
    const key = targetPhone ? `mushroom_veggies_user_profile_${sanitizePhone(targetPhone)}` : USER_PROFILE_KEY;
    const data = localStorage.getItem(key);
    if (data) return JSON.parse(data);
    
    // Check fallback legacy key
    const legacy = localStorage.getItem(USER_PROFILE_KEY);
    return legacy ? JSON.parse(legacy) : DEFAULT_USER_PROFILE;
  } catch {
    return DEFAULT_USER_PROFILE;
  }
};

export const saveUserProfile = (profile: UserProfile, phone?: string): void => {
  const targetPhone = phone || profile.phone || getActiveCustomerPhone();
  const key = targetPhone ? `mushroom_veggies_user_profile_${sanitizePhone(targetPhone)}` : USER_PROFILE_KEY;
  localStorage.setItem(key, JSON.stringify(profile));
  if (targetPhone) {
    setActiveCustomerPhone(targetPhone);
  }
};

// Seller Profile CRUD
export const getSellerProfile = (): SellerProfile => {
  try {
    const data = localStorage.getItem(SELLER_PROFILE_KEY);
    return data ? JSON.parse(data) : DEFAULT_SELLER_PROFILE;
  } catch {
    return DEFAULT_SELLER_PROFILE;
  }
};

export const saveSellerProfile = (profile: SellerProfile): void => {
  localStorage.setItem(SELLER_PROFILE_KEY, JSON.stringify(profile));
};

// Product CRUD
export const getProducts = (): Product[] => {
  try {
    const data = localStorage.getItem(PRODUCTS_KEY);
    const parsed: Product[] = data ? JSON.parse(data) : INITIAL_PRODUCTS;
    return parsed.filter((p) => !PREBUILT_PRODUCT_IDS.includes(p.id));
  } catch {
    return INITIAL_PRODUCTS;
  }
};

export const saveProducts = (products: Product[]): void => {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
};

export const addProduct = (product: Product): void => {
  const products = getProducts();
  products.unshift(product);
  saveProducts(products);
};

export const updateProduct = (updatedProduct: Product): void => {
  const products = getProducts().map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
  saveProducts(products);
};

export const deleteProduct = (id: string): void => {
  const products = getProducts().filter((p) => p.id !== id);
  saveProducts(products);
};

// Order CRUD (Filtered by user phone for buyers, all for seller)
export const getOrders = (userPhone?: string): Order[] => {
  try {
    const data = localStorage.getItem(ORDERS_KEY);
    const parsed: Order[] = data ? JSON.parse(data) : INITIAL_ORDERS;
    const all = parsed.filter((o) => !PREBUILT_ORDER_IDS.includes(o.id));

    if (!userPhone) {
      return all; // Seller sees all orders
    }

    const cleanTarget = sanitizePhone(userPhone);
    return all.filter((o) => {
      const orderPhone = sanitizePhone(o.address.phone);
      return orderPhone === cleanTarget;
    });
  } catch {
    return INITIAL_ORDERS;
  }
};

export const saveOrders = (orders: Order[]): void => {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
};

export const createOrder = (newOrder: Order): void => {
  const orders = getOrders();
  orders.unshift(newOrder);
  saveOrders(orders);

  // Reduce product stock
  const products = getProducts();
  newOrder.items.forEach((item) => {
    const target = products.find((p) => p.id === item.product.id);
    if (target) {
      target.stock = Math.max(0, target.stock - item.quantity);
    }
  });
  saveProducts(products);
};

export const updateOrder = (updatedOrder: Order): void => {
  const orders = getOrders().map((o) => (o.id === updatedOrder.id ? updatedOrder : o));
  saveOrders(orders);
};

// Cart CRUD (Isolated per phone)
export const getCart = (phone?: string): CartItem[] => {
  try {
    const targetPhone = phone || getActiveCustomerPhone();
    const key = targetPhone ? `mushroom_veggies_cart_${sanitizePhone(targetPhone)}` : CART_KEY;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveCart = (cart: CartItem[], phone?: string): void => {
  const targetPhone = phone || getActiveCustomerPhone();
  const key = targetPhone ? `mushroom_veggies_cart_${sanitizePhone(targetPhone)}` : CART_KEY;
  localStorage.setItem(key, JSON.stringify(cart));
};

// Address Details (Isolated per phone)
export const getDynamicDistanceForAddress = (address: AddressDetails): number => {
  const seller = getSellerProfile();
  if (address.latitude && address.longitude) {
    return calculateKmDistance(address.latitude, address.longitude, seller.latitude, seller.longitude);
  }
  // No precise coordinates: respect a manually-entered custom distance first
  if (address.estimatedDistanceKm && address.estimatedDistanceKm > 0) {
    return address.estimatedDistanceKm;
  }
  // Pincode based lookup fallback if lat/lng missing
  const pincodeMap: Record<string, number> = {
    '560034': 4.5,
    '560079': 6.5,
    '560103': 9.8,
    '560066': 18.5,
    '560099': 24.0,
    '560300': 30.0,
    '562157': 35.0,
  };
  return pincodeMap[address.pincode] || 30.0;
};

export const getUserAddress = (phone?: string): AddressDetails => {
  try {
    const targetPhone = phone || getActiveCustomerPhone();
    const key = targetPhone ? `mushroom_veggies_address_${sanitizePhone(targetPhone)}` : ADDRESS_KEY;
    const data = localStorage.getItem(key);
    let addr: AddressDetails = DEFAULT_ADDRESS;
    if (data) {
      addr = JSON.parse(data);
    } else {
      const profile = getUserProfile(targetPhone);
      if (profile && profile.savedAddresses && profile.savedAddresses.length > 0) {
        const idx = profile.defaultAddressIndex >= 0 ? profile.defaultAddressIndex : 0;
        addr = profile.savedAddresses[idx] || DEFAULT_ADDRESS;
      }
    }
    addr.estimatedDistanceKm = getDynamicDistanceForAddress(addr);
    return addr;
  } catch {
    return DEFAULT_ADDRESS;
  }
};

export const saveUserAddress = (address: AddressDetails, phone?: string): void => {
  const targetPhone = phone || address.phone || getActiveCustomerPhone();
  address.estimatedDistanceKm = getDynamicDistanceForAddress(address);
  const key = targetPhone ? `mushroom_veggies_address_${sanitizePhone(targetPhone)}` : ADDRESS_KEY;
  localStorage.setItem(key, JSON.stringify(address));
};

// Role
export const getUserRole = (): 'buyer' | 'seller' => {
  return (localStorage.getItem(ROLE_KEY) as 'buyer' | 'seller') || 'buyer';
};

export const saveUserRole = (role: 'buyer' | 'seller'): void => {
  localStorage.setItem(ROLE_KEY, role);
};

// Calculate distance from lat/lng based on active seller farm location
export const calculateKmDistance = (lat1: number, lon1: number, lat2?: number, lon2?: number): number => {
  const seller = getSellerProfile();
  const targetLat = lat2 !== undefined ? lat2 : (seller.latitude || 12.9716);
  const targetLng = lon2 !== undefined ? lon2 : (seller.longitude || 77.5946);

  const R = 6371; // Radius of earth in km
  const dLat = (targetLat - lat1) * (Math.PI / 180);
  const dLon = (targetLng - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(targetLat * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
};

// Calculate max quantity allowed for a product based on user distance
export const getMaxAllowedQuantityForDistance = (product: Product, distanceKm: number): number => {
  if (distanceKm <= 5) {
    return product.distanceRules.maxQtyKm5;
  } else if (distanceKm <= 15) {
    return product.distanceRules.maxQtyKm15;
  } else {
    return product.distanceRules.maxQtyKmBeyond;
  }
};
