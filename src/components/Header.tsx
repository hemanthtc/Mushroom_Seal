import React from 'react';
import { 
  Sprout, 
  ShoppingBag, 
  MapPin, 
  Search, 
  Store, 
  Package, 
  Sparkles,
  User,
  LogOut,
  Lock,
  UserPlus,
  Home
} from 'lucide-react';
import type { AddressDetails, UserProfile, SellerProfile, TabType } from '../types';

interface HeaderProps {
  authMode: 'guest' | 'customer' | 'seller';
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onLogout: () => void;
  
  cartCount: number;
  address: AddressDetails;
  
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeOrdersCount: number;
  
  userProfile?: UserProfile;
  sellerProfile?: SellerProfile;
  openAccountModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  authMode,
  onOpenLogin,
  onOpenRegister,
  onLogout,
  cartCount,
  address,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  activeOrdersCount,
  userProfile,
  sellerProfile,
  openAccountModal
}) => {
  return (
    <header className="sticky top-0 z-40 bg-emerald-950/90 backdrop-blur-md border-b border-emerald-800/40 text-emerald-50 shadow-xl">
      
      {/* TOP ANNOUNCEMENT BAR */}
      <div className="bg-emerald-950 text-emerald-200 text-xs px-4 py-1 border-b border-emerald-800/60 flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
          <span className="bg-amber-400/20 text-amber-300 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-amber-400/30 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Local Farm Direct
          </span>
          <span className="hidden sm:inline text-emerald-300/80">• 100% Certified Organic Harvests</span>
        </div>

        <div 
          className="flex items-center gap-1.5 bg-emerald-900/80 px-2.5 py-0.5 rounded-full border border-emerald-700/60 text-[11px]"
          title="Farm delivery distance calculated automatically based on active delivery location"
        >
          <MapPin className="w-3.5 h-3.5 text-amber-400" />
          <span>Location: <strong className="text-white">{address.pincode}</strong></span>
          <span className="text-emerald-400 font-semibold">({address.estimatedDistanceKm} km)</span>
        </div>
      </div>

      {/* MAIN NAVIGATION HEADER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div 
              onClick={() => setActiveTab(authMode === 'seller' ? 'dashboard' : 'store')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-emerald-950 font-black shadow-lg border border-emerald-300/40 group-hover:scale-105 transition-transform">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-extrabold text-base tracking-tight text-white group-hover:text-amber-300 transition-colors">
                    Shroom & Veggies
                  </span>
                  <span className="bg-amber-400 text-emerald-950 font-black text-[9px] px-1.5 py-0.2 rounded uppercase tracking-wider">
                    Farm
                  </span>
                </div>
                <p className="text-[10px] text-emerald-300 font-medium -mt-0.5">
                  {authMode === 'seller' ? 'Seller Vendor Hub' : 'Customer Storefront'}
                </p>
              </div>
            </div>

            {/* Location Delivery Indicator (Customer mode - Read Only) */}
            {authMode === 'customer' && (
              <div
                className="hidden lg:flex items-center gap-1.5 bg-emerald-900/40 px-3 py-1.5 rounded-xl border border-emerald-700/60 text-xs text-emerald-200 shadow-inner"
                title="Seller-configured farm delivery distance"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Location: <strong className="text-white">{address.pincode}</strong> ({address.estimatedDistanceKm} km)</span>
              </div>
            )}
          </div>

          {/* Search Bar (Shown only in Customer mode) */}
          {authMode === 'customer' && (
            <div className="hidden md:flex flex-1 max-w-md mx-4 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-emerald-400" />
              <input
                type="text"
                placeholder="Search fresh oysters, button shrooms, spinach..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-emerald-900/60 text-emerald-100 text-sm pl-10 pr-4 py-2 rounded-xl border border-emerald-700/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent placeholder-emerald-400/70 shadow-inner"
              />
            </div>
          )}

          {/* RIGHT ACTION CONTROLS */}
          <div className="flex items-center gap-3">
            
            {/* 1. GUEST MODE: Show Login and Register buttons ONLY in right corner */}
            {authMode === 'guest' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenLogin}
                  className="flex items-center gap-1.5 bg-emerald-900/90 hover:bg-emerald-800 text-amber-300 font-bold px-3.5 py-2 rounded-xl border border-emerald-700 text-xs transition-all shadow-md"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Login</span>
                </button>

                <button
                  onClick={onOpenRegister}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-emerald-950 font-black px-4 py-2 rounded-xl text-xs transition-all shadow-lg transform hover:-translate-y-0.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </button>
              </div>
            )}

            {/* 2. CUSTOMER MODE CONTROLS */}
            {authMode === 'customer' && (
              <div className="flex items-center gap-2">
                {/* HOME BUTTON */}
                <button
                  onClick={() => setActiveTab('store')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                    activeTab === 'store'
                      ? 'bg-emerald-800 border-amber-400 text-amber-300 font-bold'
                      : 'bg-emerald-900/60 border-emerald-800 text-emerald-200 hover:bg-emerald-800'
                  }`}
                >
                  <Home className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Home</span>
                </button>

                <button
                  onClick={() => setActiveTab('orders')}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                    activeTab === 'orders'
                      ? 'bg-emerald-800 border-amber-400 text-amber-300 font-bold'
                      : 'bg-emerald-900/60 border-emerald-800 text-emerald-200 hover:bg-emerald-800'
                  }`}
                >
                  <Package className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">My Orders</span>
                  {activeOrdersCount > 0 && (
                    <span className="bg-amber-400 text-emerald-950 font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                      {activeOrdersCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('cart')}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl shadow-lg text-xs font-bold transition-all transform active:scale-95 ${
                    activeTab === 'cart'
                      ? 'bg-amber-400 text-emerald-950 font-black ring-2 ring-amber-400/50'
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-emerald-950'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span className="hidden sm:inline">Cart</span>
                  {cartCount > 0 && (
                    <span className="bg-emerald-950 text-amber-300 font-extrabold px-1.5 py-0.5 rounded-full text-[11px]">
                      {cartCount}
                    </span>
                  )}
                </button>

                {/* Consumer/Buyer Profile Icon Button (Right Side - Full View) */}
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs transition-all shadow-md group ${
                    activeTab === 'profile'
                      ? 'bg-emerald-800 border-amber-400 text-amber-300 font-bold'
                      : 'bg-emerald-900/90 hover:bg-emerald-800 border-emerald-700/80 text-amber-300'
                  }`}
                  title={userProfile?.name ? `${userProfile.name} - My Profile & Address Book` : 'My Profile & Address Book'}
                >
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 group-hover:bg-amber-400 group-hover:text-emerald-950 transition-colors shrink-0">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span className="hidden sm:inline font-semibold text-white group-hover:text-amber-300">
                    My Profile
                  </span>
                </button>

                {/* Logout Button */}
                <button
                  onClick={onLogout}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-950/60 rounded-xl border border-emerald-800/60 transition-colors"
                  title="Log Out"
                >
                  <LogOut className="w-4 h-4 text-red-400" />
                </button>
              </div>
            )}

            {/* 3. SELLER MODE CONTROLS */}
            {authMode === 'seller' && (
              <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-1">
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      activeTab === 'dashboard' ? 'bg-emerald-800 text-amber-300 font-bold' : 'text-emerald-300 hover:text-white'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('products')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      activeTab === 'products' ? 'bg-emerald-800 text-amber-300 font-bold' : 'text-emerald-300 hover:text-white'
                    }`}
                  >
                    Products
                  </button>
                  <button
                    onClick={() => setActiveTab('fulfillment')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      activeTab === 'fulfillment' ? 'bg-emerald-800 text-amber-300 font-bold' : 'text-emerald-300 hover:text-white'
                    }`}
                  >
                    Orders & Refunds
                  </button>
                </div>

                {/* Seller Profile Pill & Logout */}
                <div className="flex items-center gap-1.5 bg-emerald-900/80 rounded-xl border border-emerald-700/80 p-1">
                  <button
                    onClick={openAccountModal}
                    className="flex items-center gap-1.5 text-xs font-bold text-emerald-100 hover:text-amber-300 px-2 py-1"
                    title="Seller Account"
                  >
                    <Store className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden lg:inline">{sellerProfile?.farmName || 'Seller Hub'}</span>
                  </button>

                  <button
                    onClick={onLogout}
                    className="p-1 text-red-400 hover:text-red-300 hover:bg-red-950/60 rounded-lg transition-colors"
                    title="Log Out Seller Session"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
