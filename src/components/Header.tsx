import React from 'react';
import { 
  Sprout, 
  ShoppingBag, 
  MapPin, 
  Search, 
  Store, 
  UserCheck, 
  Package, 
  Sparkles,
  User
} from 'lucide-react';
import type { AddressDetails } from '../types';

interface HeaderProps {
  role: 'buyer' | 'seller';
  setRole: (role: 'buyer' | 'seller') => void;
  cartCount: number;
  openCart: () => void;
  address: AddressDetails;
  openDistanceModal: () => void;
  activeTab: string;
  setActiveTab: (tab: 'store' | 'orders' | 'dashboard' | 'products' | 'fulfillment' | 'policy') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeOrdersCount: number;
  openAccountModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  role,
  setRole,
  cartCount,
  openCart,
  address,
  openDistanceModal,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  activeOrdersCount,
  openAccountModal
}) => {
  return (
    <header className="sticky top-0 z-40 bg-emerald-950/90 backdrop-blur-md border-b border-emerald-800/40 text-emerald-50 shadow-xl">
      {/* Top Banner for Distance info */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 px-4 py-1.5 text-xs border-b border-emerald-800/30 flex justify-between items-center text-emerald-200">
        <div className="flex items-center gap-2 max-w-xl truncate">
          <span className="inline-flex items-center gap-1 bg-emerald-800/60 text-emerald-300 px-2 py-0.5 rounded-full font-medium text-[11px] border border-emerald-700/50">
            <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" /> Local Farm Direct
          </span>
          <span className="hidden sm:inline text-emerald-300/80">• Organic & Fresh Harvested Daily</span>
        </div>

        <button 
          onClick={openDistanceModal}
          className="flex items-center gap-1.5 hover:text-amber-300 transition-colors bg-emerald-900/80 px-2.5 py-0.5 rounded-full border border-emerald-700/60 text-[11px]"
          title="Change location and calculate distance to farm"
        >
          <MapPin className="w-3.5 h-3.5 text-amber-400" />
          <span>Location: <strong className="text-white">{address.pincode}</strong></span>
          <span className="text-emerald-400 font-semibold">({address.estimatedDistanceKm} km away)</span>
          <span className="text-amber-400 underline font-medium ml-1">Change Map</span>
        </button>
      </div>

      {/* Main Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => setActiveTab(role === 'buyer' ? 'store' : 'dashboard')}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-md shadow-emerald-900/50 text-white font-bold">
              <Sprout className="w-6 h-6 text-emerald-100 transform -rotate-12" />
              <div className="absolute -bottom-1 -right-1 bg-amber-500 text-emerald-950 font-black text-[9px] px-1 rounded-full border border-white">
                FARM
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-100 via-amber-100 to-emerald-200 bg-clip-text text-transparent">
                  Shroom & Veggies
                </h1>
              </div>
              <p className="text-[11px] text-emerald-400 font-medium tracking-wide">
                {role === 'buyer' ? 'Local Buyer Storefront' : 'Farmer Seller Portal'}
              </p>
            </div>
          </div>

          {/* Search Bar for Buyer */}
          {role === 'buyer' && (
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

          {/* Role Switcher & Action Controls */}
          <div className="flex items-center gap-3">
            
            {/* Dual Role Selector Switcher */}
            <div className="bg-emerald-900/90 p-1 rounded-xl border border-emerald-700/70 flex items-center shadow-inner">
              <button
                onClick={() => {
                  setRole('buyer');
                  setActiveTab('store');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  role === 'buyer'
                    ? 'bg-amber-500 text-emerald-950 shadow-md font-bold'
                    : 'text-emerald-300 hover:text-white hover:bg-emerald-800/50'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Buyer</span>
              </button>
              <button
                onClick={() => {
                  setRole('seller');
                  setActiveTab('dashboard');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  role === 'seller'
                    ? 'bg-emerald-500 text-emerald-950 shadow-md font-bold'
                    : 'text-emerald-300 hover:text-white hover:bg-emerald-800/50'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>Seller</span>
              </button>
            </div>

            {/* My Account Launcher Button */}
            <button
              onClick={openAccountModal}
              className="flex items-center gap-1.5 bg-emerald-900/80 hover:bg-emerald-800 text-amber-300 font-bold px-3 py-2 rounded-xl border border-emerald-700 text-xs shadow-md"
              title="View My Account & Saved Locations"
            >
              <User className="w-4 h-4 text-amber-400" />
              <span className="hidden lg:inline">My Account</span>
            </button>

            {/* Role specific Navigation Links */}
            {role === 'buyer' ? (
              <div className="flex items-center gap-2">
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
                  onClick={openCart}
                  className="relative flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-emerald-950 font-bold px-3.5 py-2 rounded-xl shadow-lg shadow-amber-950/40 text-xs transition-all transform active:scale-95"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span className="hidden sm:inline">Cart</span>
                  {cartCount > 0 && (
                    <span className="bg-emerald-950 text-amber-300 font-extrabold px-1.5 py-0.5 rounded-full text-[11px]">
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2">
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
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
