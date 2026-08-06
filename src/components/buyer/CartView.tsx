import React from 'react';
import type { CartItem, AddressDetails } from '../../types';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  AlertOctagon,
  ArrowRight,
  Truck,
  MapPin,
  ArrowLeft
} from 'lucide-react';
import { getMaxAllowedQuantityForDistance } from '../../services/storage';

interface CartViewProps {
  cart: CartItem[];
  updateQuantity: (productId: string, delta: number) => void;
  removeFromCart: (productId: string) => void;
  address: AddressDetails;
  proceedToCheckout: () => void;
  onBackToStore: () => void;
}

export const CartView: React.FC<CartViewProps> = ({
  cart,
  updateQuantity,
  removeFromCart,
  address,
  proceedToCheckout,
  onBackToStore,
}) => {
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  // Calculate delivery fee based on distance (₹30 base + ₹5/km)
  const deliveryFee = cart.length > 0 ? Math.round(30 + address.estimatedDistanceKm * 5) : 0;
  const grandTotal = subtotal + deliveryFee;

  // Check if any cart item violates distance quantity rules
  const distanceViolations = cart.filter((item) => {
    const maxAllowed = getMaxAllowedQuantityForDistance(item.product, address.estimatedDistanceKm);
    return item.quantity > maxAllowed;
  });

  const hasViolations = distanceViolations.length > 0;

  if (cart.length === 0) {
    return (
      <div className="bg-emerald-950/70 border border-emerald-800/80 rounded-3xl p-8 sm:p-12 shadow-2xl max-w-4xl mx-auto text-center space-y-6 animate-fade-in">
        <div className="p-5 bg-emerald-900/60 rounded-full w-24 h-24 flex items-center justify-center mx-auto border border-emerald-700/60 shadow-inner">
          <ShoppingBag className="w-12 h-12 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-white">Your Fresh Harvest Cart is Empty</h2>
          <p className="text-xs sm:text-sm text-emerald-300 max-w-md mx-auto mt-1.5 leading-relaxed">
            Explore fresh organic mushrooms, hydroponic spinach, Desi tomatoes, and organic farm veggies directly from local growers.
          </p>
        </div>
        <button
          onClick={onBackToStore}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-emerald-950 font-extrabold px-6 py-3 rounded-2xl text-xs sm:text-sm shadow-xl transition-all hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" /> Explore Storefront Harvest
        </button>
      </div>
    );
  }

  return (
    <div className="bg-emerald-950/70 border border-emerald-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-w-6xl mx-auto pb-12 animate-fade-in">
      
      {/* HEADER SECTION */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-800/60 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToStore}
            className="p-2 sm:px-3.5 sm:py-2 bg-emerald-900/90 hover:bg-emerald-800 text-amber-400 hover:text-amber-300 rounded-2xl border border-emerald-700/70 transition-all flex items-center gap-1.5 text-xs font-bold shadow-md hover:scale-105 active:scale-95 shrink-0"
            title="Back to Storefront"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-amber-400" /> Dedicated Harvest Cart
            </h2>
            <p className="text-xs text-emerald-300 mt-0.5">
              Review selected items, check distance-based thresholds, and proceed to online checkout.
            </p>
          </div>
        </div>

        <span className="bg-emerald-900 text-amber-300 text-xs font-bold px-3.5 py-1 rounded-full border border-emerald-700">
          {cart.length} Item(s) Selected
        </span>
      </div>

      {/* DISTANCE DELIVERY LOCATION BAR (READ ONLY) */}
      <div className="bg-emerald-900/40 p-4 rounded-2xl border border-emerald-800/70 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-emerald-200">
            Delivering to <strong>{address.streetAddress || address.pincode}</strong> ({address.estimatedDistanceKm} km away from farm)
          </span>
        </div>
      </div>

      {/* DISTANCE VIOLATION WARNING BANNER */}
      {hasViolations && (
        <div className="bg-amber-950/90 border border-amber-500/80 rounded-2xl p-4 text-amber-200 text-xs space-y-1 shadow-lg">
          <div className="flex items-center gap-1.5 font-extrabold text-amber-400 text-sm">
            <AlertOctagon className="w-5 h-5 shrink-0" />
            <span>Distance Quantity Limitation Alert</span>
          </div>
          <p className="text-xs leading-relaxed text-amber-200">
            Due to perishability over {address.estimatedDistanceKm} km, some items exceed the maximum order threshold allowed by the farmer. Please adjust your quantities to proceed.
          </p>
        </div>
      )}

      {/* DEDICATED SPLIT GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: CART ITEMS LIST */}
        <div className="lg:col-span-7 bg-emerald-900/40 border border-emerald-700/80 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <h3 className="text-xs font-extrabold text-amber-300 uppercase tracking-wider border-b border-emerald-800/80 pb-2">
            Selected Farm Produce ({cart.length})
          </h3>

          <div className="space-y-3">
            {cart.map((item) => {
              const maxAllowed = getMaxAllowedQuantityForDistance(item.product, address.estimatedDistanceKm);
              const isExceeded = item.quantity > maxAllowed;

              return (
                <div
                  key={item.product.id}
                  className={`p-4 rounded-3xl border transition-all flex flex-wrap sm:flex-nowrap gap-4 items-center justify-between ${
                    isExceeded
                      ? 'bg-amber-950/40 border-amber-500/80 ring-1 ring-amber-500/40'
                      : 'bg-emerald-950/70 border-emerald-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-[200px]">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-2xl border border-emerald-700/70 shrink-0"
                    />
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-sm text-white">{item.product.name}</h4>
                      <div className="text-xs text-emerald-400">
                        ₹{item.product.price} / {item.product.unit}
                      </div>

                      <div className="text-[11px]">
                        {isExceeded ? (
                          <span className="text-amber-400 font-extrabold flex items-center gap-1">
                            ⚠️ Max limit for {address.estimatedDistanceKm}km is {maxAllowed} {item.product.unit}s
                          </span>
                        ) : (
                          <span className="text-emerald-400/80 text-[10px]">
                            Max allowed: {maxAllowed} {item.product.unit}s
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quantity Controls & Subtotal */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-emerald-800/60">
                    <div className="flex items-center gap-2 bg-emerald-900 px-3 py-1.5 rounded-2xl border border-emerald-700">
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="p-1 text-emerald-300 hover:text-amber-400 transition-colors"
                        title="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-extrabold text-white min-w-[24px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        disabled={item.quantity >= maxAllowed || item.quantity >= item.product.stock}
                        className="p-1 text-emerald-300 hover:text-amber-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-emerald-400 block font-medium">Total</span>
                      <strong className="font-extrabold text-base text-white">
                        ₹{item.product.price * item.quantity}
                      </strong>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-2 text-emerald-400 hover:text-red-400 hover:bg-red-950/60 rounded-xl border border-transparent hover:border-red-800 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: ORDER SUMMARY BOX */}
        <div className="lg:col-span-5 bg-emerald-900/50 border border-emerald-700/80 rounded-3xl p-6 shadow-2xl space-y-6 sticky top-20">
          <h3 className="text-xs font-extrabold text-amber-300 uppercase tracking-wider border-b border-emerald-800/80 pb-2">
            Payment & Order Summary
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-emerald-200">
              <span>Subtotal ({cart.length} items)</span>
              <strong className="text-white text-sm">₹{subtotal}</strong>
            </div>

            <div className="flex justify-between text-emerald-200">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-amber-400 shrink-0" /> Distance Delivery Fee ({address.estimatedDistanceKm} km)
              </span>
              <strong className="text-white text-sm">₹{deliveryFee}</strong>
            </div>

            <div className="pt-3 border-t border-emerald-800 flex justify-between items-center">
              <div>
                <span className="text-sm font-extrabold text-white block">Grand Total</span>
                <span className="text-[10px] text-emerald-400">Includes all applicable farm taxes</span>
              </div>
              <strong className="text-2xl text-amber-300 font-black">₹{grandTotal}</strong>
            </div>
          </div>

          <button
            disabled={hasViolations}
            onClick={proceedToCheckout}
            className={`w-full py-4 px-5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl transition-all ${
              hasViolations
                ? 'bg-gray-800 text-gray-400 cursor-not-allowed border border-gray-700'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-emerald-950 active:scale-95 hover:scale-[1.01]'
            }`}
          >
            {hasViolations ? (
              'Fix Quantity Limits to Proceed'
            ) : (
              <>
                <span>Proceed to Checkout & Razorpay</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
};
