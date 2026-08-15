import type { Product, AddressDetails, UserProfile, SellerProfile, CartItem } from '../types';

const CART_KEY = 'sv_cart';
const ADDRESS_KEY = 'sv_address';
const USER_PROFILE_KEY = 'sv_user_profile';
const SELLER_PROFILE_KEY = 'sv_seller_profile';

// Platform reference farm coordinates (Bengaluru center) used for a baseline distance
// when a specific seller's coordinates are not in context.
const REF_LAT = 12.9716;
const REF_LNG = 77.5946;

export const sanitizePhone = (phone?: string): string => {
  if (!phone) return 'guest';
  return phone.replace(/\D/g, '') || 'guest';
};

export const DEFAULT_ADDRESS: AddressDetails = {
  fullName: '',
  phone: '',
  streetAddress: '',
  city: 'Bengaluru',
  pincode: '560034',
  estimatedDistanceKm: 4.5,
  latitude: 12.9352,
  longitude: 77.6245,
};

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: '',
  phone: '',
  email: '',
  savedAddresses: [],
  defaultAddressIndex: 0,
};

export const DEFAULT_SELLER_PROFILE: SellerProfile = {
  sellerId: '',
  farmName: '',
  ownerName: '',
  phone: '',
  email: '',
  farmAddress: '',
  latitude: REF_LAT,
  longitude: REF_LNG,
  organicCertNo: '',
  rating: 5.0,
  establishedYear: new Date().getFullYear(),
};

// ---- Haversine distance (pure). Defaults target to platform reference farm. ----
export const calculateKmDistance = (lat1: number, lon1: number, lat2?: number, lon2?: number): number => {
  const targetLat = lat2 !== undefined ? lat2 : REF_LAT;
  const targetLng = lon2 !== undefined ? lon2 : REF_LNG;
  const R = 6371;
  const dLat = (targetLat - lat1) * (Math.PI / 180);
  const dLon = (targetLng - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(targetLat * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

export const getDynamicDistanceForAddress = (address: AddressDetails): number => {
  if (address.latitude && address.longitude) {
    return calculateKmDistance(address.latitude, address.longitude);
  }
  if (address.estimatedDistanceKm && address.estimatedDistanceKm > 0) {
    return address.estimatedDistanceKm;
  }
  const pincodeMap: Record<string, number> = {
    '560034': 4.5, '560079': 6.5, '560103': 9.8, '560066': 18.5,
    '560099': 24.0, '560300': 30.0, '562157': 35.0,
  };
  return pincodeMap[address.pincode] || 8.0;
};

// Distance from a customer address to a specific product's seller farm.
export const distanceForProduct = (address: AddressDetails, product: Product): number => {
  if (address.latitude && address.longitude && product.sellerLat && product.sellerLng) {
    return calculateKmDistance(address.latitude, address.longitude, product.sellerLat, product.sellerLng);
  }
  return getDynamicDistanceForAddress(address);
};

export const getMaxAllowedQuantityForDistance = (product: Product, distanceKm: number): number => {
  const rules = product.distanceRules;
  if (!rules) return 99;
  if (distanceKm <= 5) return rules.maxQtyKm5 ?? 99;
  if (distanceKm <= 15) return rules.maxQtyKm15 ?? 99;
  return rules.maxQtyKmBeyond ?? 99;
};

// ---- Cart (local, per phone) ----
export const getCart = (phone?: string): CartItem[] => {
  try {
    const key = `${CART_KEY}_${sanitizePhone(phone)}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveCart = (cart: CartItem[], phone?: string): void => {
  localStorage.setItem(`${CART_KEY}_${sanitizePhone(phone)}`, JSON.stringify(cart));
};

// ---- Active delivery address (local cache) ----
export const getUserAddress = (phone?: string): AddressDetails => {
  try {
    const data = localStorage.getItem(`${ADDRESS_KEY}_${sanitizePhone(phone)}`);
    if (data) {
      const addr = JSON.parse(data);
      addr.estimatedDistanceKm = getDynamicDistanceForAddress(addr);
      return addr;
    }
  } catch {
    /* noop */
  }
  return { ...DEFAULT_ADDRESS };
};

export const saveUserAddress = (address: AddressDetails, phone?: string): void => {
  address.estimatedDistanceKm = getDynamicDistanceForAddress(address);
  localStorage.setItem(`${ADDRESS_KEY}_${sanitizePhone(phone)}`, JSON.stringify(address));
};

// ---- Profile caches (used by MapLocationPicker defaults / seller settings) ----
export const getUserProfile = (): UserProfile => {
  try {
    const data = localStorage.getItem(USER_PROFILE_KEY);
    return data ? JSON.parse(data) : { ...DEFAULT_USER_PROFILE };
  } catch {
    return { ...DEFAULT_USER_PROFILE };
  }
};

export const saveUserProfile = (profile: UserProfile): void => {
  localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
};

export const getSellerProfile = (): SellerProfile => {
  try {
    const data = localStorage.getItem(SELLER_PROFILE_KEY);
    return data ? JSON.parse(data) : { ...DEFAULT_SELLER_PROFILE };
  } catch {
    return { ...DEFAULT_SELLER_PROFILE };
  }
};

export const saveSellerProfile = (profile: SellerProfile): void => {
  localStorage.setItem(SELLER_PROFILE_KEY, JSON.stringify(profile));
};
