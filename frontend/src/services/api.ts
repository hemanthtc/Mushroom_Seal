import type { Product, Order, UserProfile, SellerProfile, DeliveryAgent, SellerDirectoryEntry } from '../types';

// Frontend and backend share the same preview origin; ingress routes /api to the backend.
const API = '/api';

const TOKEN_KEY = 'sv_auth_token';
const ROLE_KEY = 'sv_auth_role';

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const getRole = (): string | null => localStorage.getItem(ROLE_KEY);
export const setAuth = (token: string, role: string) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ROLE_KEY, role);
};
export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
};

async function req(path: string, options: RequestInit = {}): Promise<any> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(options.headers as any) };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const res = await fetch(`${API}${path}`, { ...options, headers });
  
  if (!res.ok) {
    if (res.status === 401) {
      window.dispatchEvent(new Event('auth-unauthorized'));
    }
    
    if (res.status >= 502 && res.status <= 504) {
      throw new Error(`Gateway Error (${res.status}): The backend server is unreachable or crashed.`);
    }

    const text = await res.text().catch(() => '');
    let detail = '';
    try {
      const data = text ? JSON.parse(text) : null;
      const rawDetail = data ? (data.detail || data.error) : null;
      detail = rawDetail
        ? (typeof rawDetail === 'string' ? rawDetail : JSON.stringify(rawDetail))
        : '';
    } catch {
      // Fallback if parsing fails
    }
    
    if (!detail) {
      detail = text ? text.substring(0, 100) : `Request failed (${res.status})`;
    }
    throw new Error(detail);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export const getAppVersion = (): Promise<{ version: string }> => req('/version');

// ---- AUTH ----
export const sellerRegister = (body: any): Promise<{ token: string; seller: SellerProfile }> =>
  req('/auth/seller/register', { method: 'POST', body: JSON.stringify(body) });
export const sellerLogin = (email: string, password: string): Promise<{ token: string; seller: SellerProfile }> =>
  req('/auth/seller/login', { method: 'POST', body: JSON.stringify({ email, password }) });
export const sellerForgotPassword = (email: string): Promise<{ success: boolean; message: string }> =>
  req('/auth/seller/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
export const sellerResetPassword = (token: string, password: string): Promise<{ success: boolean; message: string }> =>
  req('/auth/seller/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) });
export const customerSendOtp = (phone: string): Promise<{ sent: boolean; otp: string }> =>
  req('/auth/customer/send-otp', { method: 'POST', body: JSON.stringify({ phone }) });
export const customerVerifyOtp = (phone: string, otp: string, name?: string, email?: string, password?: string): Promise<{ token: string; customer: UserProfile }> =>
  req('/auth/customer/verify-otp', { method: 'POST', body: JSON.stringify({ phone, otp, name, email, password }) });
export const customerPasswordLogin = (phone: string, password: string): Promise<{ token: string; customer: UserProfile }> =>
  req('/auth/customer/login', { method: 'POST', body: JSON.stringify({ phone, password }) });
export const customerResetPassword = (phone: string, otp: string, newPassword: string): Promise<{ success: boolean; message: string }> =>
  req('/auth/customer/reset-password', { method: 'POST', body: JSON.stringify({ phone, otp, newPassword }) });
export const riderLogin = (agentId: string, password: string): Promise<{ token: string; rider: DeliveryAgent }> =>
  req('/auth/rider/login', { method: 'POST', body: JSON.stringify({ agentId, password }) });
export const getMe = (): Promise<{ role: string; profile: any }> => req('/auth/me');
export const updateCustomerProfile = (body: Partial<UserProfile>): Promise<UserProfile> =>
  req('/customer/profile', { method: 'PUT', body: JSON.stringify(body) });
export const deleteCustomerProfile = (): Promise<any> =>
  req('/customer', { method: 'DELETE' });
export const deleteSellerProfile = (): Promise<any> =>
  req('/sellers/me', { method: 'DELETE' });

// ---- SELLERS ----
export const getSellers = (): Promise<SellerDirectoryEntry[]> => req('/sellers');

// ---- PRODUCTS ----
export const getProducts = (sellerId?: string): Promise<Product[]> =>
  req(`/products${sellerId ? `?sellerId=${sellerId}` : ''}`);
export const createProduct = (p: Partial<Product>): Promise<Product> =>
  req('/products', { method: 'POST', body: JSON.stringify(p) });
export const updateProductApi = (id: string, p: Partial<Product>): Promise<Product> =>
  req(`/products/${id}`, { method: 'PUT', body: JSON.stringify(p) });
export const deleteProductApi = (id: string): Promise<any> =>
  req(`/products/${id}`, { method: 'DELETE' });

// ---- ORDERS ----
export const getOrders = (): Promise<Order[]> => req('/orders');
export const createOrder = (o: Partial<Order>): Promise<Order> =>
  req('/orders', { method: 'POST', body: JSON.stringify(o) });
export const updateOrderApi = (id: string, o: Partial<Order>): Promise<Order> =>
  req(`/orders/${id}`, { method: 'PUT', body: JSON.stringify(o) });
export const postRiderLocation = (id: string, lat: number, lng: number): Promise<any> =>
  req(`/orders/${id}/location`, { method: 'POST', body: JSON.stringify({ lat, lng }) });

// ---- RIDERS ----
export const getRiders = (): Promise<DeliveryAgent[]> => req('/riders');
export const createRider = (body: any): Promise<DeliveryAgent> =>
  req('/riders', { method: 'POST', body: JSON.stringify(body) });
export const deleteRider = (id: string): Promise<any> =>
  req(`/riders/${id}`, { method: 'DELETE' });
