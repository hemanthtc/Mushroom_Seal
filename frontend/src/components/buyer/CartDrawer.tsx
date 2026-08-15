import React from 'react';
import type {
  CartItem,
  AddressDetails
} from '../../types';
import {
  ShoppingBag,
  X,
  Trash2,
  Plus,
  Minus,
  AlertOctagon,
  ArrowRight,
  Truck,
  MapPin
} from 'lucide-react';
import { getMaxAllowedQuantityForDistance } from '../../services/storage';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  updateQuantity: (productId: string, delta: number) => void;
  removeFromCart: (productId: string) => void;
  address: AddressDetails;
  proceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  updateQuantity,
  removeFromCart,
  address,
  proceedToCheckout,
}) => {
  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-emerald-950 border-l border-emerald-800/80 shadow-2xl flex flex-col justify-between text-emerald-100">

          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 border-b border-emerald-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-800/60 rounded-xl border border-emerald-700">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h2 className="font-extrabold text-lg text-white">Your Fresh Harvest Cart</h2>
                <p className="text-xs text-emerald-300">{cart.length} item(s) selected</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-emerald-400 hover:text-white rounded-xl hover:bg-emerald-800/50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Distance Indicator Pill */}
          <div className="bg-emerald-900/50 px-5 py-2.5 border-b border-emerald-800/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>Delivering to <strong>{address.pincode}</strong> ({address.estimatedDistanceKm} km away)</span>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <ShoppingBag className="w-16 h-16 text-emerald-700 mx-auto" />
                <h3 className="text-lg font-bold text-white">Your cart is empty</h3>
                <p className="text-xs text-emerald-400 max-w-xs mx-auto">
                  Explore fresh organic mushrooms, hydroponic spinach, Desi tomatoes, and farm veggies from local growers.
                </p>
              </div>
            ) : (
              <>
                {/* Distance violation warning banner */}
                {hasViolations && (
                  <div className="bg-amber-950/90 border border-amber-500/80 rounded-2xl p-3.5 text-amber-200 text-xs space-y-1 shadow-lg">
                    <div className="flex items-center gap-1.5 font-bold text-amber-400">
                      <AlertOctagon className="w-4 h-4 flex-shrink-0" />
                      <span>Distance Quantity Limitation Alert</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      Due to perishability over {address.estimatedDistanceKm} km, some items exceed the maximum order threshold allowed by the farmer. Please reduce quantity to proceed.
                    </p>
                  </div>
                )}

                {cart.map((item) => {
                  const maxAllowed = getMaxAllowedQuantityForDistance(item.product, address.estimatedDistanceKm);
                  const isExceeded = item.quantity > maxAllowed;

                  return (
                    <div
                      key={item.product.id}
                      className={`p-3.5 rounded-2xl border transition-all flex gap-3.5 ${isExceeded
                        ? 'bg-amber-950/30 border-amber-500/70'
                        : 'bg-emerald-900/40 border-emerald-800/80'
                        }`}
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-xl border border-emerald-700/60"
                      />

                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-sm text-white line-clamp-1">{item.product.name}</h4>
                            <span className="text-[11px] text-emerald-400">₹{item.product.price} / {item.product.unit}</span>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-emerald-400 hover:text-red-400 p-1"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Limit Badge */}
                        <div className="text-[11px] mt-1">
                          {isExceeded ? (
                            <span className="text-amber-400 font-extrabold flex items-center gap-1">
                              ⚠️ Max limit for {address.estimatedDistanceKm}km is {maxAllowed} {item.product.unit}s
                            </span>
                          ) : (
                            <span className="text-emerald-400 text-[10px]">
                              Max allowed: {maxAllowed} {item.product.unit}s
                            </span>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2 bg-emerald-950 px-2 py-1 rounded-xl border border-emerald-700">
                            <button
                              onClick={() => updateQuantity(item.product.id, -1)}
                              className="p-1 hover:text-amber-400 text-emerald-300"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-bold text-white min-w-[20px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product.id, 1)}
                              disabled={item.quantity >= maxAllowed || item.quantity >= item.product.stock}
                              className="p-1 hover:text-amber-400 text-emerald-300 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="font-extrabold text-sm text-white">
                            ₹{item.product.price * item.quantity}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* Footer Summary */}
          {cart.length > 0 && (
            <div className="p-5 bg-gradient-to-t from-emerald-950 via-emerald-950 to-emerald-900/90 border-t border-emerald-800 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-emerald-300">
                  <span>Subtotal</span>
                  <span className="font-bold text-white">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-emerald-300">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-amber-400" /> Distance Delivery Fee ({address.estimatedDistanceKm} km)
                  </span>
                  <span className="font-bold text-white">₹{deliveryFee}</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-emerald-800">
                  <span>Grand Total</span>
                  <span className="text-amber-300">₹{grandTotal}</span>
                </div>
              </div>

              <button
                disabled={hasViolations}
                onClick={proceedToCheckout}
                className={`w-full py-3.5 px-4 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl transition-all ${hasViolations
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-emerald-950 active:scale-95'
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
          )}

        </div>
      </div>
    </div>
  );
};
