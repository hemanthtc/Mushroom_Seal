import { useState, useEffect } from 'react';
import type { 
  Product, 
  Order, 
  CartItem, 
  AddressDetails, 
  CategoryType, 
  ToastMessage,
  UserProfile,
  SellerProfile,
  TabType
} from './types';
import { 
  initializeStorage, 
  getProducts, 
  addProduct, 
  updateProduct, 
  deleteProduct,
  getOrders, 
  createOrder, 
  updateOrder, 
  getCart, 
  saveCart, 
  getUserAddress, 
  saveUserAddress, 
  getUserProfile,
  saveUserProfile,
  getSellerProfile,
  saveSellerProfile,
  getMaxAllowedQuantityForDistance,
  saveCustomerSession,
  getCustomerSession,
  saveSellerSession,
  getSellerSession,
  clearAllSessions
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
  // Authentication & Session State
  const [authMode, setAuthMode] = useState<'guest' | 'customer' | 'seller'>('guest');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [authModalRole, setAuthModalRole] = useState<'customer' | 'seller'>('customer');

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<TabType>('store');
  
  // App Data
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [address, setAddress] = useState<AddressDetails>(getUserAddress());
  const [userProfile, setUserProfile] = useState<UserProfile>(getUserProfile());
  const [sellerProfile, setSellerProfile] = useState<SellerProfile>(getSellerProfile());
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isDistanceModalOpen, setIsDistanceModalOpen] = useState(false);
  const [isProductManagerOpen, setIsProductManagerOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isBuyerAccountOpen, setIsBuyerAccountOpen] = useState(false);
  const [isSellerAccountOpen, setIsSellerAccountOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: ToastMessage['type'], text: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Load initial data and restore sessions
  useEffect(() => {
    initializeStorage();
    setProducts(getProducts());

    // 1. Check Seller Session (sessionStorage - cleared on tab close)
    const activeSeller = getSellerSession();
    if (activeSeller) {
      setSellerProfile(activeSeller);
      setAuthMode('seller');
      setActiveTab('dashboard');
      setOrders(getOrders());
      return;
    }

    // 2. Check Customer Session (localStorage - 7 day expiration)
    const activeCustomer = getCustomerSession();
    if (activeCustomer) {
      setUserProfile(activeCustomer);
      setAuthMode('customer');
      setActiveTab('store');
      setCart(getCart(activeCustomer.phone));
      setAddress(getUserAddress(activeCustomer.phone));
      setOrders(getOrders(activeCustomer.phone));
      return;
    }

    // 3. Fallback to Guest Promotional View
    setAuthMode('guest');
    setOrders([]);
    setCart([]);
  }, []);

  // --- AUTHENTICATION HANDLERS ---
  const handleOpenLogin = (role: 'customer' | 'seller' = 'customer') => {
    setAuthModalTab('login');
    setAuthModalRole(role);
    setIsAuthModalOpen(true);
  };

  const handleOpenRegister = (role: 'customer' | 'seller' = 'customer') => {
    setAuthModalTab('register');
    setAuthModalRole(role);
    setIsAuthModalOpen(true);
  };

  const handleCustomerLoginSuccess = (profile: UserProfile) => {
    saveCustomerSession(profile);
    setUserProfile(profile);
    setAuthMode('customer');
    setActiveTab('store');
    setCart(getCart(profile.phone));
    setAddress(getUserAddress(profile.phone));
    setOrders(getOrders(profile.phone));
    addToast('success', `Welcome back, ${profile.name}! 7-Day Customer Session Active.`);
  };

  const handleSellerLoginSuccess = (profile: SellerProfile) => {
    saveSellerSession(profile);
    setSellerProfile(profile);
    setAuthMode('seller');
    setActiveTab('dashboard');
    setOrders(getOrders());
    addToast('success', `Seller Authenticated! Active session bound to current browser tab.`);
  };

  const handleLogout = () => {
    clearAllSessions();
    setAuthMode('guest');
    setCart([]);
    setOrders([]);
    setIsBuyerAccountOpen(false);
    setIsSellerAccountOpen(false);
    addToast('info', 'Logged out successfully. Returned to promotional view.');
  };

  const handleDeleteCustomerAccount = () => {
    clearAllSessions();
    const emptyProfile: UserProfile = {
      name: '',
      phone: '',
      email: '',
      savedAddresses: [],
      defaultAddressIndex: 0,
    };
    setUserProfile(emptyProfile);
    saveUserProfile(emptyProfile);
    setAuthMode('guest');
    setActiveTab('store');
    setIsBuyerAccountOpen(false);
    addToast('warning', 'Customer account permanently deleted. Returned to promotional view.');
  };

  // --- CART FUNCTIONS ---
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
      const currentQty = cart[existingIndex].quantity;
      const newQty = currentQty + quantityToAdd;

      if (newQty > maxAllowed) {
        addToast('warning', `Limit reached! Maximum allowed quantity for ${product.name} at ${address.estimatedDistanceKm}km is ${maxAllowed} ${product.unit}s.`);
        return;
      }

      updatedCart = cart.map((item, idx) =>
        idx === existingIndex ? { ...item, quantity: newQty } : item
      );
    } else {
      if (quantityToAdd > maxAllowed) {
        addToast('warning', `Maximum allowed quantity for ${product.name} at ${address.estimatedDistanceKm}km is ${maxAllowed} ${product.unit}s.`);
        return;
      }

      updatedCart = [...cart, { product, quantity: quantityToAdd }];
    }

    setCart(updatedCart);
    saveCart(updatedCart);
    addToast('success', `Added ${quantityToAdd} ${product.unit} of ${product.name} to cart.`);
  };

  const handleUpdateCartQuantity = (productId: string, newQuantity: number) => {
    const targetItem = cart.find((item) => item.product.id === productId);
    if (!targetItem) return;

    if (newQuantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }

    const maxAllowed = getMaxAllowedQuantityForDistance(targetItem.product, address.estimatedDistanceKm);
    if (newQuantity > maxAllowed) {
      addToast('warning', `Maximum allowed quantity for ${targetItem.product.name} at ${address.estimatedDistanceKm}km is ${maxAllowed} ${targetItem.product.unit}s.`);
      return;
    }

    const updatedCart = cart.map((item) =>
      item.product.id === productId ? { ...item, quantity: newQuantity } : item
    );
    setCart(updatedCart);
    saveCart(updatedCart);
  };

  const handleRemoveFromCart = (productId: string) => {
    const updatedCart = cart.filter((item) => item.product.id !== productId);
    setCart(updatedCart);
    saveCart(updatedCart);
    addToast('info', 'Item removed from cart.');
  };

  const handleClearCart = () => {
    setCart([]);
    saveCart([]);
  };

  // --- ORDER HANDLERS ---
  const handlePlaceOrder = (newOrder: Order) => {
    createOrder(newOrder);
    setOrders(getOrders(userProfile.phone));
    setProducts(getProducts());
    handleClearCart();
    setIsCheckoutOpen(false);
    setActiveTab('orders');
    addToast('success', `Order ${newOrder.id} placed successfully!`);
  };

  const handleUpdateOrderStatus = (updatedOrder: Order) => {
    updateOrder(updatedOrder);
    if (authMode === 'seller') {
      setOrders(getOrders());
    } else {
      setOrders(getOrders(userProfile.phone));
    }
    addToast('info', `Order ${updatedOrder.id} status updated.`);
  };

  // --- SELLER PRODUCT MANAGER HANDLERS ---
  const handleSaveProduct = (product: Product) => {
    if (products.some((p) => p.id === product.id)) {
      updateProduct(product);
      addToast('success', `Updated ${product.name}!`);
    } else {
      addProduct(product);
      addToast('success', `Added new product ${product.name}!`);
    }
    setProducts(getProducts());
  };

  const handleDeleteProduct = (id: string) => {
    deleteProduct(id);
    setProducts(getProducts());
    addToast('info', 'Product removed from catalog.');
  };

  // --- LOCATION & PROFILE HANDLERS ---
  const handleSaveAddress = (newAddress: AddressDetails) => {
    setAddress(newAddress);
    saveUserAddress(newAddress);
    addToast('info', `Location updated: ${newAddress.pincode} (${newAddress.estimatedDistanceKm} km from farm)`);
  };

  const handleSaveUserProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    saveUserProfile(profile);
    addToast('success', 'User Profile updated successfully!');
  };

  const handleSaveSellerProfile = (profile: SellerProfile) => {
    setSellerProfile(profile);
    saveSellerProfile(profile);
    addToast('success', 'Farm Profile updated successfully!');
  };

  const activeOrdersCount = orders.filter((o) => ['Pending', 'Packing', 'Out for Delivery'].includes(o.status)).length;
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-emerald-950 text-emerald-100 flex flex-col font-sans selection:bg-amber-400 selection:text-emerald-950">
      
      {/* TOAST NOTIFICATION CONTAINER */}
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
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-emerald-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* HEADER COMPONENT */}
      <Header
        authMode={authMode}
        onOpenLogin={() => handleOpenLogin('customer')}
        onOpenRegister={() => handleOpenRegister('customer')}
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
        openAccountModal={() => {
          if (authMode === 'customer') setActiveTab('profile');
          if (authMode === 'seller') setIsSellerAccountOpen(true);
        }}
      />

      {/* MAIN APPLICATION BODY */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* 1. GUEST PROMOTIONAL HERO HOME SCREEN */}
        {authMode === 'guest' && (
          <PromotionalHero
            products={products}
            onOpenLogin={() => handleOpenLogin('customer')}
            onOpenRegister={() => handleOpenRegister('customer')}
          />
        )}

        {/* 2. CUSTOMER STOREFRONT INTERFACE */}
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
              <OrderTracker
                orders={orders}
                onUpdateOrder={handleUpdateOrderStatus}
                onBackToStore={() => setActiveTab('store')}
              />
            )}

            {activeTab === 'cart' && (
              <CartView
                cart={cart}
                updateQuantity={handleUpdateCartQuantity}
                removeFromCart={handleRemoveFromCart}
                address={address}
                proceedToCheckout={() => {
                  setIsCheckoutOpen(true);
                }}
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
                  saveUserAddress(selectedAddr);
                }}
                onLogout={handleLogout}
                onDeleteAccount={handleDeleteCustomerAccount}
              />
            )}
          </>
        )}

        {/* 3. SELLER PORTAL INTERFACE */}
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
                    <h2 className="font-black text-xl text-white">Vendor Product Management</h2>
                    <p className="text-xs text-emerald-300">Add, edit pricing, or toggle stock levels for catalog listings.</p>
                  </div>
                  <button
                    onClick={() => {
                      setProductToEdit(null);
                      setIsProductManagerOpen(true);
                    }}
                    className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold px-4 py-2 rounded-xl text-xs shadow-md"
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
                  addToCart={handleAddToCart}
                />
              </div>
            )}

            {activeTab === 'fulfillment' && (
              <SellerOrders
                orders={orders}
                onUpdateOrder={handleUpdateOrderStatus}
              />
            )}

            {activeTab === 'policy' && (
              <DistancePolicyConfig />
            )}
          </>
        )}

      </main>

      {/* AUTH MODAL (LOGIN & REGISTRATION) */}
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
            addToast('success', 'Customer account registered successfully!');
          }}
          onSellerRegisterSuccess={(msg) => {
            addToast('info', msg);
          }}
        />
      )}

      {/* LOCATION SELECTOR MODAL */}
      {isDistanceModalOpen && (
        <DistanceSelectorModal
          address={address}
          onSave={handleSaveAddress}
          onClose={() => setIsDistanceModalOpen(false)}
        />
      )}

      {/* CART DRAWER (SUPPRESSED WHEN IN DEDICATED CART VIEW) */}
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

      {/* CHECKOUT MODAL */}
      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          cart={cart}
          address={address}
          onOrderSuccess={handlePlaceOrder}
        />
      )}

      {/* PRODUCT MANAGER MODAL */}
      {isProductManagerOpen && (
        <ProductManagerModal
          isOpen={isProductManagerOpen}
          onClose={() => setIsProductManagerOpen(false)}
          productToEdit={productToEdit}
          onSaveProduct={handleSaveProduct}
          onDeleteProduct={handleDeleteProduct}
        />
      )}

      {/* BUYER ACCOUNT MODAL */}
      {isBuyerAccountOpen && (
        <BuyerAccountModal
          isOpen={isBuyerAccountOpen}
          onClose={() => setIsBuyerAccountOpen(false)}
          userProfile={userProfile}
          onSaveProfile={handleSaveUserProfile}
          orders={orders}
          onSelectActiveAddress={(selectedAddr) => {
            setAddress(selectedAddr);
            saveUserAddress(selectedAddr);
          }}
          onLogout={handleLogout}
        />
      )}

      {/* SELLER ACCOUNT MODAL */}
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

      {/* FOOTER */}
      <footer className="bg-emerald-950/90 border-t border-emerald-800/50 py-6 text-center text-xs text-emerald-400/80">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-between items-center gap-2">
          <span>© 2026 Shroom & Veggies Farm Market • Dual-Interface React Application</span>
          <span className="text-amber-400 font-medium">Customer 7-Day Auto-Session • Seller Tab Session Security</span>
        </div>
      </footer>

    </div>
  );
}

export default App;
