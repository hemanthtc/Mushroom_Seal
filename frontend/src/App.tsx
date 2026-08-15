import { useState, useEffect, useRef } from 'react';
import type {
  Product,
  Order,
  CartItem,
  AddressDetails,
  CategoryType,
  ToastMessage,
  UserProfile,
  SellerProfile,
  DeliveryAgent,
  TabType,
} from './types';
import {
  getProducts as apiGetProducts,
  createProduct as apiCreateProduct,
  updateProductApi,
  deleteProductApi,
  getOrders as apiGetOrders,
  createOrder as apiCreateOrder,
  updateOrderApi,
  updateCustomerProfile,
  getMe,
  getToken,
  clearAuth,
} from './services/api';
import {
  getCart,
  saveCart,
  getUserAddress,
  saveUserAddress,
  saveUserProfile,
  saveSellerProfile,
  getMaxAllowedQuantityForDistance,
  calculateKmDistance,
  DEFAULT_ADDRESS,
  DEFAULT_USER_PROFILE,
  DEFAULT_SELLER_PROFILE,
} from './services/storage';

import { Header } from './components/Header';
import { PromotionalHero } from './components/landing/PromotionalHero';
import { AuthModal } from './components/auth/AuthModal';

import { ProductCatalog } from './components/buyer/ProductCatalog';
import { DistanceSelectorModal } from './components/buyer/DistanceSelectorModal';
import { CartDrawer } from './components/buyer/CartDrawer';
import { CartView } from './components/buyer/CartView';
import { CheckoutModal } from './components/buyer/CheckoutModal';
import { OrderTracker } from './components/buyer/OrderTracker';
import { BuyerAccountModal } from './components/buyer/BuyerAccountModal';
import { BuyerProfileView } from './components/buyer/BuyerProfileView';

import { SellerDashboard } from './components/seller/SellerDashboard';
import { ProductManagerModal } from './components/seller/ProductManagerModal';
import { SellerOrders } from './components/seller/SellerOrders';
import { DistancePolicyConfig } from './components/seller/DistancePolicyConfig';
import { SellerAccountModal } from './components/seller/SellerAccountModal';
import { RiderManager } from './components/seller/RiderManager';

import { DeliveryPortal } from './components/delivery/DeliveryPortal';

import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import '../Mushroom.css';

const CATEGORIES: CategoryType[] = [
  'All',
  'Fresh Mushrooms',
  'Leafy Greens',
  'Root & Bulb Veggies',
  'Exotic & Herbs',
  'Farm Combos',
];

export function App() {
  const [authMode, setAuthMode] = useState<'guest' | 'customer' | 'seller' | 'delivery'>('guest');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [authModalRole, setAuthModalRole] = useState<'customer' | 'seller' | 'delivery'>('customer');
  const [deliveryAgent, setDeliveryAgent] = useState<DeliveryAgent | null>(null);

  const [activeTab, setActiveTab] = useState<TabType>('store');

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [address, setAddress] = useState<AddressDetails>(DEFAULT_ADDRESS);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [sellerProfile, setSellerProfile] = useState<SellerProfile>(DEFAULT_SELLER_PROFILE);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isDistanceModalOpen, setIsDistanceModalOpen] = useState(false);
  const [isProductManagerOpen, setIsProductManagerOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isBuyerAccountOpen, setIsBuyerAccountOpen] = useState(false);
  const [isSellerAccountOpen, setIsSellerAccountOpen] = useState(false);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const authModeRef = useRef(authMode);
  authModeRef.current = authMode;

  const addToast = (type: ToastMessage['type'], text: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  // ---- data loaders ----
  const refreshOrders = async () => {
    try {
      setOrders(await apiGetOrders());
    } catch {
      /* ignore */
    }
  };

  const loadStorefront = async () => {
    try {
      setProducts(await apiGetProducts());
    } catch {
      /* ignore */
    }
  };

  const loadSellerProducts = async (sellerDbId: string) => {
    try {
      setProducts(await apiGetProducts(sellerDbId));
    } catch {
      /* ignore */
    }
  };

  // ---- initial session restore ----
  useEffect(() => {
    (async () => {
      const token = getToken();
      if (token) {
        try {
          const me = await getMe();
          if (me.role === 'seller') {
            setSellerProfile(me.profile);
            saveSellerProfile(me.profile);
            setAuthMode('seller');
            setActiveTab('dashboard');
            await loadSellerProducts(me.profile.id);
            await refreshOrders();
            return;
          }
          if (me.role === 'customer') {
            setUserProfile(me.profile);
            saveUserProfile(me.profile);
            setAuthMode('customer');
            setActiveTab('store');
            setCart(getCart(me.profile.phone));
            setAddress(getUserAddress(me.profile.phone));
            await loadStorefront();
            await refreshOrders();
            return;
          }
          if (me.role === 'rider') {
            setDeliveryAgent(me.profile);
            setAuthMode('delivery');
            setActiveTab('delivery');
            await refreshOrders();
            return;
          }
        } catch {
          clearAuth();
        }
      }
      await loadStorefront();
    })();
  }, []);

  // ---- live polling of orders (status + rider location sync) ----
  useEffect(() => {
    if (authMode === 'guest') return;
    const interval = setInterval(() => {
      refreshOrders();
    }, 7000);
    return () => clearInterval(interval);
  }, [authMode]);

  // ---- auth handlers ----
  const handleOpenLogin = (role: 'customer' | 'seller' | 'delivery' = 'customer') => {
    setAuthModalTab('login');
    setAuthModalRole(role);
    setIsAuthModalOpen(true);
  };
  const handleOpenRegister = (role: 'customer' | 'seller' = 'customer') => {
    setAuthModalTab('register');
    setAuthModalRole(role);
    setIsAuthModalOpen(true);
  };

  const handleCustomerLoginSuccess = async (profile: UserProfile) => {
    saveUserProfile(profile);
    setUserProfile(profile);
    setAuthMode('customer');
    setActiveTab('store');
    setCart(getCart(profile.phone));
    setAddress(getUserAddress(profile.phone));
    await loadStorefront();
    await refreshOrders();
    addToast('success', `Welcome, ${profile.name || 'friend'}! You're signed in.`);
  };

  const handleSellerLoginSuccess = async (profile: SellerProfile) => {
    saveSellerProfile(profile);
    setSellerProfile(profile);
    setAuthMode('seller');
    setActiveTab('dashboard');
    await loadSellerProducts((profile as any).id);
    await refreshOrders();
    addToast('success', `Seller signed in — ${profile.farmName}.`);
  };

  const handleDeliveryLoginSuccess = async (agent: DeliveryAgent) => {
    setDeliveryAgent(agent);
    setAuthMode('delivery');
    setActiveTab('delivery');
    await refreshOrders();
    addToast('success', `Welcome ${agent.name}! Delivery partner session active.`);
  };

  const handleLogout = async () => {
    clearAuth();
    setAuthMode('guest');
    setDeliveryAgent(null);
    setUserProfile(DEFAULT_USER_PROFILE);
    setSellerProfile(DEFAULT_SELLER_PROFILE);
    setCart([]);
    setOrders([]);
    setIsBuyerAccountOpen(false);
    setIsSellerAccountOpen(false);
    setActiveTab('store');
    await loadStorefront();
    addToast('info', 'Logged out successfully.');
  };

  const handleDeleteCustomerAccount = () => {
    clearAuth();
    setUserProfile(DEFAULT_USER_PROFILE);
    setAuthMode('guest');
    setActiveTab('store');
    setIsBuyerAccountOpen(false);
    loadStorefront();
    addToast('warning', 'Signed out. (Account data remains on the server.)');
  };

  // ---- cart ----
  const handleAddToCart = (product: Product, quantityToAdd = 1) => {
    if (authMode !== 'customer') {
      handleOpenLogin('customer');
      addToast('info', 'Please log in as a customer to add items to your cart.');
      return;
    }
    const maxAllowed = getMaxAllowedQuantityForDistance(product, address.estimatedDistanceKm);
    const existingIndex = cart.findIndex((item) => item.product.id === product.id);
    let updatedCart: CartItem[];
    if (existingIndex > -1) {
      const newQty = cart[existingIndex].quantity + quantityToAdd;
      if (newQty > maxAllowed) {
        addToast('warning', `Limit reached! Max ${maxAllowed} ${product.unit}s of ${product.name} at ${address.estimatedDistanceKm}km.`);
        return;
      }
      updatedCart = cart.map((item, idx) => (idx === existingIndex ? { ...item, quantity: newQty } : item));
    } else {
      if (quantityToAdd > maxAllowed) {
        addToast('warning', `Max ${maxAllowed} ${product.unit}s of ${product.name} at ${address.estimatedDistanceKm}km.`);
        return;
      }
      updatedCart = [...cart, { product, quantity: quantityToAdd }];
    }
    setCart(updatedCart);
    saveCart(updatedCart, userProfile.phone);
    addToast('success', `Added ${quantityToAdd} ${product.unit} of ${product.name} to cart.`);
  };

  const handleUpdateCartQuantity = (productId: string, newQuantity: number) => {
    const targetItem = cart.find((item) => item.product.id === productId);
    if (!targetItem) return;
    if (newQuantity <= 0) return handleRemoveFromCart(productId);
    const maxAllowed = getMaxAllowedQuantityForDistance(targetItem.product, address.estimatedDistanceKm);
    if (newQuantity > maxAllowed) {
      addToast('warning', `Max ${maxAllowed} ${targetItem.product.unit}s allowed at ${address.estimatedDistanceKm}km.`);
      return;
    }
    const updatedCart = cart.map((item) => (item.product.id === productId ? { ...item, quantity: newQuantity } : item));
    setCart(updatedCart);
    saveCart(updatedCart, userProfile.phone);
  };

  const handleRemoveFromCart = (productId: string) => {
    const updatedCart = cart.filter((item) => item.product.id !== productId);
    setCart(updatedCart);
    saveCart(updatedCart, userProfile.phone);
    addToast('info', 'Item removed from cart.');
  };

  const handleClearCart = () => {
    setCart([]);
    saveCart([], userProfile.phone);
  };

  // ---- orders ----
  const handlePlaceOrder = async (draft: Order) => {
    const orderAddress = draft.address || address;
    // group cart by seller for multi-seller checkout
    const groups: Record<string, CartItem[]> = {};
    (draft.items || cart).forEach((it) => {
      const sid = it.product.sellerId || 'unknown';
      (groups[sid] ||= []).push(it);
    });
    try {
      for (const [sid, items] of Object.entries(groups)) {
        const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
        const sample = items[0].product;
        const dist =
          orderAddress.latitude && sample.sellerLat
            ? calculateKmDistance(orderAddress.latitude, orderAddress.longitude!, sample.sellerLat, sample.sellerLng)
            : orderAddress.estimatedDistanceKm;
        const deliveryFee = Math.round(30 + dist * 5);
        await apiCreateOrder({
          items,
          subtotal,
          deliveryFee,
          grandTotal: subtotal + deliveryFee,
          address: orderAddress,
          paymentMethod: draft.paymentMethod,
          isPaid: draft.isPaid,
          paymentId: draft.paymentId,
          sellerId: sid !== 'unknown' ? sid : undefined,
          sellerName: sample.sellerName,
        } as Partial<Order>);
      }
      handleClearCart();
      setIsCheckoutOpen(false);
      setActiveTab('orders');
      await refreshOrders();
      await loadStorefront();
      const shops = Object.keys(groups).length;
      addToast('success', shops > 1 ? `Order placed across ${shops} shops!` : 'Order placed successfully!');
    } catch (e: any) {
      addToast('warning', e.message || 'Could not place order.');
    }
  };

  const handleUpdateOrderStatus = async (updatedOrder: Order) => {
    try {
      await updateOrderApi(updatedOrder.id, updatedOrder);
      await refreshOrders();
      if (authModeRef.current !== 'delivery') addToast('info', `Order ${updatedOrder.id} updated.`);
    } catch (e: any) {
      addToast('warning', e.message || 'Update failed.');
    }
  };

  // ---- seller product management ----
  const handleSaveProduct = async (product: Product) => {
    try {
      const payload = { ...product, farmName: sellerProfile.farmName || product.farmName };
      const exists = products.some((p) => p.id === product.id);
      if (exists) {
        await updateProductApi(product.id, payload);
        addToast('success', `Updated ${product.name}!`);
      } else {
        await apiCreateProduct(payload);
        addToast('success', `Added new product ${product.name}!`);
      }
      await loadSellerProducts((sellerProfile as any).id);
    } catch (e: any) {
      addToast('warning', e.message || 'Could not save product.');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProductApi(id);
      await loadSellerProducts((sellerProfile as any).id);
      addToast('info', 'Product removed from catalog.');
    } catch (e: any) {
      addToast('warning', e.message || 'Could not delete product.');
    }
  };

  // ---- location & profile ----
  const handleSaveAddress = (newAddress: AddressDetails) => {
    setAddress(newAddress);
    saveUserAddress(newAddress, userProfile.phone);
    const updated = {
      ...userProfile,
      savedAddresses: [newAddress, ...(userProfile.savedAddresses || []).filter((a) => a.streetAddress !== newAddress.streetAddress)],
      defaultAddressIndex: 0,
    };
    setUserProfile(updated);
    saveUserProfile(updated);
    updateCustomerProfile({ savedAddresses: updated.savedAddresses, defaultAddressIndex: 0 }).catch(() => {});
    addToast('info', `Location updated: ${newAddress.pincode} (${newAddress.estimatedDistanceKm} km)`);
  };

  const handleSaveUserProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    saveUserProfile(profile);
    updateCustomerProfile({ name: profile.name, email: profile.email, savedAddresses: profile.savedAddresses }).catch(() => {});
    addToast('success', 'Profile updated successfully!');
  };

  const handleSaveSellerProfile = (profile: SellerProfile) => {
    setSellerProfile(profile);
    saveSellerProfile(profile);
    addToast('success', 'Farm Profile updated!');
  };

  const activeOrdersCount = orders.filter((o) => ['Pending', 'Packing', 'Out for Delivery'].includes(o.status)).length;
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-emerald-950 text-emerald-100 flex flex-col font-sans selection:bg-amber-400 selection:text-emerald-950">
      {/* TOASTS */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-2xl border shadow-xl flex items-center justify-between gap-3 text-xs font-semibold animate-slide-in ${
              toast.type === 'success'
                ? 'bg-emerald-900 border-emerald-500 text-emerald-100'
                : toast.type === 'warning'
                ? 'bg-amber-950 border-amber-500 text-amber-100'
                : 'bg-teal-950 border-teal-600 text-teal-100'
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />}
              {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-teal-400 shrink-0" />}
              <span>{toast.text}</span>
            </div>
            <button onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))} className="text-emerald-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <Header
        authMode={authMode}
        onOpenLogin={() => handleOpenLogin('customer')}
        onOpenRegister={() => handleOpenRegister('customer')}
        onOpenDeliveryLogin={() => handleOpenLogin('delivery')}
        onOpenLocationPicker={() => setIsDistanceModalOpen(true)}
        onLogout={handleLogout}
        cartCount={totalCartCount}
        address={address}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeOrdersCount={activeOrdersCount}
        userProfile={userProfile}
        sellerProfile={sellerProfile}
        deliveryAgent={deliveryAgent || undefined}
        openAccountModal={() => {
          if (authMode === 'customer') setActiveTab('profile');
          if (authMode === 'seller') setIsSellerAccountOpen(true);
        }}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {authMode === 'guest' && (
          <PromotionalHero
            products={products}
            onOpenLogin={() => handleOpenLogin('customer')}
            onOpenRegister={() => handleOpenRegister('customer')}
          />
        )}

        {authMode === 'customer' && (
          <>
            {activeTab === 'store' && (
              <ProductCatalog
                products={products}
                categories={CATEGORIES}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                searchQuery={searchQuery}
                address={address}
                addToCart={handleAddToCart}
              />
            )}
            {activeTab === 'orders' && (
              <OrderTracker orders={orders} onUpdateOrder={handleUpdateOrderStatus} onBackToStore={() => setActiveTab('store')} />
            )}
            {activeTab === 'cart' && (
              <CartView
                cart={cart}
                updateQuantity={handleUpdateCartQuantity}
                removeFromCart={handleRemoveFromCart}
                address={address}
                proceedToCheckout={() => setIsCheckoutOpen(true)}
                onBackToStore={() => setActiveTab('store')}
              />
            )}
            {activeTab === 'profile' && (
              <BuyerProfileView
                userProfile={userProfile}
                onSaveProfile={handleSaveUserProfile}
                orders={orders}
                onSelectActiveAddress={(selectedAddr) => {
                  setAddress(selectedAddr);
                  saveUserAddress(selectedAddr, userProfile.phone);
                }}
                onLogout={handleLogout}
                onDeleteAccount={handleDeleteCustomerAccount}
              />
            )}
          </>
        )}

        {authMode === 'seller' && (
          <>
            {activeTab === 'dashboard' && (
              <SellerDashboard
                products={products}
                orders={orders}
                openAddProduct={() => {
                  setProductToEdit(null);
                  setIsProductManagerOpen(true);
                }}
                setActiveTab={setActiveTab}
              />
            )}
            {activeTab === 'products' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-emerald-900/40 p-4 rounded-2xl border border-emerald-800">
                  <div>
                    <h2 className="font-black text-xl text-white">My Product Catalog</h2>
                    <p className="text-xs text-emerald-300">Add, edit pricing, or update stock for your storefront listings.</p>
                  </div>
                  <button
                    onClick={() => {
                      setProductToEdit(null);
                      setIsProductManagerOpen(true);
                    }}
                    className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold px-4 py-2 rounded-xl text-xs shadow-md"
                    data-testid="seller-add-product-btn"
                  >
                    + Add New Product
                  </button>
                </div>
                <ProductCatalog
                  products={products}
                  categories={CATEGORIES}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  searchQuery={searchQuery}
                  address={address}
                  addToCart={(p) => {
                    setProductToEdit(p);
                    setIsProductManagerOpen(true);
                  }}
                />
              </div>
            )}
            {activeTab === 'fulfillment' && <SellerOrders orders={orders} onUpdateOrder={handleUpdateOrderStatus} />}
            {activeTab === 'riders' && <RiderManager addToast={addToast} />}
            {activeTab === 'policy' && <DistancePolicyConfig />}
          </>
        )}

        {authMode === 'delivery' && deliveryAgent && (
          <DeliveryPortal view={activeTab} agent={deliveryAgent} orders={orders} onUpdateOrder={handleUpdateOrderStatus} addToast={addToast} />
        )}
      </main>

      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialTab={authModalTab}
          initialRole={authModalRole}
          onCustomerLoginSuccess={handleCustomerLoginSuccess}
          onSellerLoginSuccess={handleSellerLoginSuccess}
          onCustomerRegisterSuccess={(profile) => {
            handleCustomerLoginSuccess(profile);
            addToast('success', 'Customer account created!');
          }}
          onSellerRegisterSuccess={(msg) => addToast('info', msg)}
          onDeliveryLoginSuccess={handleDeliveryLoginSuccess}
        />
      )}

      {isDistanceModalOpen && (
        <DistanceSelectorModal address={address} onSave={handleSaveAddress} onClose={() => setIsDistanceModalOpen(false)} />
      )}

      {isCartOpen && (activeTab as string) !== 'cart' && (
        <CartDrawer
          isOpen={isCartOpen && (activeTab as string) !== 'cart'}
          onClose={() => setIsCartOpen(false)}
          cart={cart}
          updateQuantity={handleUpdateCartQuantity}
          removeFromCart={handleRemoveFromCart}
          address={address}
          proceedToCheckout={() => {
            setIsCartOpen(false);
            setIsCheckoutOpen(true);
          }}
        />
      )}

      {isCheckoutOpen && (
        <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} cart={cart} address={address} onOrderSuccess={handlePlaceOrder} />
      )}

      {isProductManagerOpen && (
        <ProductManagerModal
          isOpen={isProductManagerOpen}
          onClose={() => setIsProductManagerOpen(false)}
          productToEdit={productToEdit}
          onSaveProduct={handleSaveProduct}
          onDeleteProduct={handleDeleteProduct}
        />
      )}

      {isBuyerAccountOpen && (
        <BuyerAccountModal
          isOpen={isBuyerAccountOpen}
          onClose={() => setIsBuyerAccountOpen(false)}
          userProfile={userProfile}
          onSaveProfile={handleSaveUserProfile}
          orders={orders}
          onSelectActiveAddress={(selectedAddr) => {
            setAddress(selectedAddr);
            saveUserAddress(selectedAddr, userProfile.phone);
          }}
          onLogout={handleLogout}
        />
      )}

      {isSellerAccountOpen && (
        <SellerAccountModal
          isOpen={isSellerAccountOpen}
          onClose={() => setIsSellerAccountOpen(false)}
          sellerProfile={sellerProfile}
          onSaveSellerProfile={handleSaveSellerProfile}
          products={products}
          orders={orders}
          onLogout={handleLogout}
        />
      )}

      <footer className="bg-emerald-950/90 border-t border-emerald-800/50 py-6 text-center text-xs text-emerald-400/80">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-between items-center gap-2">
          <span>© 2026 Shroom & Veggies Farm Market • Multi-Seller Marketplace</span>
          <span className="text-amber-400 font-medium">Cloud-synced • Customer · Seller · Delivery</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
