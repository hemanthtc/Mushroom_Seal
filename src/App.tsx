import { useState, useEffect } from 'react';
import type { 
  Product, 
  Order, 
  CartItem, 
  AddressDetails, 
  CategoryType, 
  ToastMessage,
  UserProfile,
  SellerProfile
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
  getUserRole, 
  saveUserRole,
  getUserProfile,
  saveUserProfile,
  getSellerProfile,
  saveSellerProfile,
  getMaxAllowedQuantityForDistance
} from './services/storage';

import { Header } from './components/Header';
import { ProductCatalog } from './components/buyer/ProductCatalog';
import { DistanceSelectorModal } from './components/buyer/DistanceSelectorModal';
import { CartDrawer } from './components/buyer/CartDrawer';
import { CheckoutModal } from './components/buyer/CheckoutModal';
import { OrderTracker } from './components/buyer/OrderTracker';
import { BuyerAccountModal } from './components/buyer/BuyerAccountModal';

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
  const [role, setRoleState] = useState<'buyer' | 'seller'>('buyer');
  const [activeTab, setActiveTab] = useState<'store' | 'orders' | 'dashboard' | 'products' | 'fulfillment' | 'policy'>('store');
  
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

  // Load initial data
  useEffect(() => {
    initializeStorage();
    setProducts(getProducts());
    setOrders(getOrders());
    setCart(getCart());
    setAddress(getUserAddress());
    setUserProfile(getUserProfile());
    setSellerProfile(getSellerProfile());
    const storedRole = getUserRole();
    setRoleState(storedRole);
    if (storedRole === 'seller') {
      setActiveTab('dashboard');
    }
  }, []);

  const handleRoleChange = (newRole: 'buyer' | 'seller') => {
    setRoleState(newRole);
    saveUserRole(newRole);
    if (newRole === 'seller') {
      setActiveTab('dashboard');
    } else {
      setActiveTab('store');
    }
  };

  const handleOpenAccountModal = () => {
    if (role === 'buyer') {
      setIsBuyerAccountOpen(true);
    } else {
      setIsSellerAccountOpen(true);
    }
  };

  // Cart Functions
  const handleAddToCart = (product: Product, quantityToAdd = 1) => {
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
    addToast('success', `Added ${product.name} to cart!`);
  };

  const handleUpdateCartQuantity = (productId: string, delta: number) => {
    const updatedCart = cart
      .map((item) => {
        if (item.product.id === productId) {
          const maxAllowed = getMaxAllowedQuantityForDistance(item.product, address.estimatedDistanceKm);
          const newQty = item.quantity + delta;
          if (newQty > maxAllowed && delta > 0) {
            addToast('warning', `Maximum allowed quantity for this distance is ${maxAllowed}.`);
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      })
      .filter((item) => item.quantity > 0);

    setCart(updatedCart);
    saveCart(updatedCart);
  };

  const handleRemoveFromCart = (productId: string) => {
    const updatedCart = cart.filter((item) => item.product.id !== productId);
    setCart(updatedCart);
    saveCart(updatedCart);
  };

  // Order Handlers
  const handleOrderSuccess = (newOrder: Order) => {
    createOrder(newOrder);
    setOrders(getOrders());
    setProducts(getProducts()); // refresh stock
    setCart([]);
    saveCart([]);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setActiveTab('orders');
    addToast('success', `Order ${newOrder.id} placed successfully!`);
  };

  const handleUpdateOrder = (updatedOrder: Order) => {
    updateOrder(updatedOrder);
    setOrders(getOrders());
    addToast('info', `Order ${updatedOrder.id} status updated.`);
  };

  // Product Manager Handlers
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

  // Save address from modal
  const handleSaveAddress = (newAddress: AddressDetails) => {
    setAddress(newAddress);
    saveUserAddress(newAddress);
    addToast('info', `Location updated: ${newAddress.pincode} (${newAddress.estimatedDistanceKm} km from farm)`);
  };

  // Profile Save Handlers
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
    <div className="min-h-screen bg-gradient-to-b from-emerald-950 via-slate-950 to-emerald-950 text-emerald-50 flex flex-col font-sans selection:bg-amber-400 selection:text-emerald-950">
      
      {/* Header Bar */}
      <Header
        role={role}
        setRole={handleRoleChange}
        cartCount={totalCartCount}
        openCart={() => setIsCartOpen(true)}
        address={address}
        openDistanceModal={() => setIsDistanceModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeOrdersCount={activeOrdersCount}
        openAccountModal={handleOpenAccountModal}
      />

      {/* Toast Notifications Overlay */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-2xl border flex items-center justify-between gap-3 text-xs font-bold transition-all animate-bounce-short ${
              t.type === 'success'
                ? 'bg-emerald-900 border-emerald-500 text-white'
                : t.type === 'warning'
                ? 'bg-amber-950 border-amber-500 text-amber-200'
                : 'bg-emerald-950 border-emerald-700 text-emerald-100'
            }`}
          >
            <div className="flex items-center gap-2">
              {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              {t.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
              {t.type === 'info' && <Info className="w-4 h-4 text-blue-400" />}
              <span>{t.text}</span>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
              className="text-emerald-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* BUYER PORTAL VIEWS */}
        {role === 'buyer' && (
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
                openDistanceModal={() => setIsDistanceModalOpen(true)}
              />
            )}

            {activeTab === 'orders' && (
              <OrderTracker
                orders={orders}
                onUpdateOrder={handleUpdateOrder}
              />
            )}
          </>
        )}

        {/* SELLER PORTAL VIEWS */}
        {role === 'seller' && (
          <>
            {(activeTab === 'dashboard' || activeTab === 'store') && (
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
              <div className="space-y-6 pb-12">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-extrabold text-white">Harvest Inventory Catalog</h2>
                    <p className="text-xs text-emerald-300">Manage items, pricing, and distance limits</p>
                  </div>
                  <button
                    onClick={() => {
                      setProductToEdit(null);
                      setIsProductManagerOpen(true);
                    }}
                    className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold px-4 py-2.5 rounded-2xl text-xs shadow-lg"
                  >
                    + Add New Produce
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((p) => (
                    <div key={p.id} className="bg-emerald-950/60 p-4 rounded-3xl border border-emerald-800 flex flex-col justify-between space-y-3">
                      <div className="flex gap-3">
                        <img src={p.image} alt={p.name} className="w-16 h-16 object-cover rounded-2xl border border-emerald-700" />
                        <div>
                          <h4 className="font-bold text-white text-sm">{p.name}</h4>
                          <span className="text-xs text-emerald-400">₹{p.price} / {p.unit} • Stock: {p.stock}</span>
                          <span className="block text-[10px] text-amber-300">Limits: 5km ({p.distanceRules.maxQtyKm5}), 15km ({p.distanceRules.maxQtyKm15}), Far ({p.distanceRules.maxQtyKmBeyond})</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setProductToEdit(p);
                          setIsProductManagerOpen(true);
                        }}
                        className="w-full py-2 bg-emerald-900 hover:bg-emerald-800 border border-emerald-700 rounded-xl text-xs font-bold text-emerald-200"
                      >
                        Edit Product & Distance Rules
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'fulfillment' && (
              <SellerOrders
                orders={orders}
                onUpdateOrder={handleUpdateOrder}
              />
            )}

            {activeTab === 'policy' && (
              <DistancePolicyConfig />
            )}
          </>
        )}

      </main>

      {/* Cart Slide-over Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        updateQuantity={handleUpdateCartQuantity}
        removeFromCart={handleRemoveFromCart}
        address={address}
        proceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        openDistanceModal={() => setIsDistanceModalOpen(true)}
      />

      {/* Checkout & Razorpay Modal */}
      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          cart={cart}
          address={address}
          onOrderSuccess={handleOrderSuccess}
        />
      )}

      {/* Distance Selector Modal */}
      {isDistanceModalOpen && (
        <DistanceSelectorModal
          address={address}
          onSave={handleSaveAddress}
          onClose={() => setIsDistanceModalOpen(false)}
        />
      )}

      {/* Product Manager Modal */}
      {isProductManagerOpen && (
        <ProductManagerModal
          isOpen={isProductManagerOpen}
          onClose={() => setIsProductManagerOpen(false)}
          productToEdit={productToEdit}
          onSaveProduct={handleSaveProduct}
          onDeleteProduct={handleDeleteProduct}
        />
      )}

      {/* Buyer My Account Modal */}
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
        />
      )}

      {/* Seller My Account Modal */}
      {isSellerAccountOpen && (
        <SellerAccountModal
          isOpen={isSellerAccountOpen}
          onClose={() => setIsSellerAccountOpen(false)}
          sellerProfile={sellerProfile}
          onSaveSellerProfile={handleSaveSellerProfile}
          products={products}
          orders={orders}
        />
      )}

      {/* Footer */}
      <footer className="bg-emerald-950/90 border-t border-emerald-800/50 py-6 text-center text-xs text-emerald-400/80">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-between items-center gap-2">
          <span>© 2026 Shroom & Veggies Farm Market • Pure TypeScript React WebApp</span>
          <span className="text-amber-400 font-medium">Razorpay Online Refunds • Interactive Map Location Picker</span>
        </div>
      </footer>

    </div>
  );
}

export default App;
