import type { Product, Order, CartItem, AddressDetails, UserProfile, SellerProfile } from '../types';
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
const CUSTOMER_TOKEN_KEY = 'customer_token';
const SELLER_TOKEN_KEY = 'seller_token';

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
    // Purge any legacy prebuilt products stored in localStorage
    const existing = getProducts();
    const filtered = existing.filter((p) => !PREBUILT_PRODUCT_IDS.includes(p.id));
    if (filtered.length !== existing.length) {
      saveProducts(filtered);
    }
  }
  if (!localStorage.getItem(ORDERS_KEY)) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(INITIAL_ORDERS));
  } else {
    // Purge any legacy prebuilt orders stored in localStorage
    const existingOrders = getOrders();
    const filteredOrders = existingOrders.filter((o) => !PREBUILT_ORDER_IDS.includes(o.id));
    if (filteredOrders.length !== existingOrders.length) {
      saveOrders(filteredOrders);
    }
  }
  if (!localStorage.getItem(ADDRESS_KEY)) {
    localStorage.setItem(ADDRESS_KEY, JSON.stringify(DEFAULT_ADDRESS));
  }
  if (!localStorage.getItem(ROLE_KEY)) {
    localStorage.setItem(ROLE_KEY, 'buyer');
  }
  if (!localStorage.getItem(USER_PROFILE_KEY)) {
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(DEFAULT_USER_PROFILE));
  }
  if (!localStorage.getItem(SELLER_PROFILE_KEY)) {
    localStorage.setItem(SELLER_PROFILE_KEY, JSON.stringify(DEFAULT_SELLER_PROFILE));
  }
};

// --- SESSION STORAGE HELPERS ---

/**
 * Customer 7-Day Session Persistence:
 * Stores token & profile in localStorage with a 7-day expiration timestamp.
 * Customer stays logged in across browser closes until 7 days elapse.
 */
export const saveCustomerSession = (profile: UserProfile, token = 'cust_jwt_token_active'): void => {
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  const expiryTime = Date.now() + SEVEN_DAYS_MS;
  localStorage.setItem(CUSTOMER_TOKEN_KEY, token);
  localStorage.setItem(CUSTOMER_SESSION_EXPIRY_KEY, expiryTime.toString());
  saveUserProfile(profile);
};

export const getCustomerSession = (): UserProfile | null => {
  const token = localStorage.getItem(CUSTOMER_TOKEN_KEY);
  const expiryStr = localStorage.getItem(CUSTOMER_SESSION_EXPIRY_KEY);

  if (!token || !expiryStr) return null;

  const expiry = parseInt(expiryStr, 10);
  if (isNaN(expiry) || Date.now() > expiry) {
    // Session expired (> 7 days)
    clearCustomerSession();
    return null;
  }

  return getUserProfile();
};

export const clearCustomerSession = (): void => {
  localStorage.removeItem(CUSTOMER_TOKEN_KEY);
  localStorage.removeItem(CUSTOMER_SESSION_EXPIRY_KEY);
};

/**
 * Seller High-Security Session Storage:
 * Stores token & profile in sessionStorage.
 * Automatically cleared when the browser tab or window is closed.
 */
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

export const clearAllSessions = (): void => {
  clearCustomerSession();
  clearSellerSession();
};

// User Profile CRUD
export const getUserProfile = (): UserProfile => {
  try {
    const data = localStorage.getItem(USER_PROFILE_KEY);
    return data ? JSON.parse(data) : DEFAULT_USER_PROFILE;
  } catch {
    return DEFAULT_USER_PROFILE;
  }
};

export const saveUserProfile = (profile: UserProfile): void => {
  localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
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

// Order CRUD
export const getOrders = (): Order[] => {
  try {
    const data = localStorage.getItem(ORDERS_KEY);
    const parsed: Order[] = data ? JSON.parse(data) : INITIAL_ORDERS;
    return parsed.filter((o) => !PREBUILT_ORDER_IDS.includes(o.id));
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

// Cart CRUD
export const getCart = (): CartItem[] => {
  try {
    const data = localStorage.getItem(CART_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveCart = (cart: CartItem[]): void => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
};

// Address Details
export const getUserAddress = (): AddressDetails => {
  try {
    const data = localStorage.getItem(ADDRESS_KEY);
    return data ? JSON.parse(data) : DEFAULT_ADDRESS;
  } catch {
    return DEFAULT_ADDRESS;
  }
};

export const saveUserAddress = (address: AddressDetails): void => {
  localStorage.setItem(ADDRESS_KEY, JSON.stringify(address));
};

// Role
export const getUserRole = (): 'buyer' | 'seller' => {
  return (localStorage.getItem(ROLE_KEY) as 'buyer' | 'seller') || 'buyer';
};

export const saveUserRole = (role: 'buyer' | 'seller'): void => {
  localStorage.setItem(ROLE_KEY, role);
};

// Calculate distance from lat/lng or default rule
export const calculateKmDistance = (lat1: number, lon1: number, lat2 = 12.9716, lon2 = 77.5946): number => {
  const R = 6371; // Radius of earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
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
