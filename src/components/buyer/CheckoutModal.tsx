import React, { useState } from 'react';
import type { 
  CartItem, 
  AddressDetails, 
  Order 
} from '../../types';
import { 
  X, 
  MapPin, 
  ShieldCheck, 
  Truck, 
  Phone, 
  User, 
  CheckCircle2,
  CreditCard,
  Banknote
} from 'lucide-react';
import { RazorpaySimulationModal } from './RazorpaySimulationModal';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  address: AddressDetails;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  address,
  onOrderSuccess,
}) => {
  const [deliveryAddress, setDeliveryAddress] = useState<AddressDetails>({ ...address });
  const [paymentMethod, setPaymentMethod] = useState<'Razorpay' | 'COD'>('Razorpay');
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const deliveryFee = Math.round(30 + deliveryAddress.estimatedDistanceKm * 5);
  const grandTotal = subtotal + deliveryFee;

  const generateOrderId = (): string => {
    return 'ORD-' + Math.floor(10000 + Math.random() * 90000);
  };

  const handlePlaceOrder = (paymentId: string, isPaid: boolean) => {
    setIsSubmitting(true);
    const newOrder: Order = {
      id: generateOrderId(),
      items: [...cart],
      subtotal,
      deliveryFee,
      grandTotal,
      address: { ...deliveryAddress },
      status: 'Pending',
      paymentMethod,
      paymentId: paymentId || 'COD_' + Date.now(),
      isPaid,
      createdAt: new Date().toISOString(),
      statusTimeline: [
        {
          status: 'Pending',
          timestamp: new Date().toISOString(),
          note: isPaid ? 'Payment verified via Razorpay' : 'Cash on Delivery order created',
        },
      ],
    };

    setTimeout(() => {
      setIsSubmitting(false);
      onOrderSuccess(newOrder);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-emerald-950 border border-emerald-700/80 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl text-emerald-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-teal-900 p-5 border-b border-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-800/60 rounded-xl border border-emerald-700">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg text-white">Checkout & Delivery Details</h2>
              <p className="text-xs text-emerald-300">Review your order & select payment method</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-emerald-400 hover:text-white rounded-lg hover:bg-emerald-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* Order Summary Box */}
          <div className="bg-emerald-900/40 p-4 rounded-2xl border border-emerald-800 space-y-2 text-xs">
            <h4 className="font-bold text-amber-300 uppercase tracking-wider flex items-center justify-between">
              <span>Order Summary ({cart.length} items)</span>
              <span className="text-emerald-400 font-normal">Distance: {deliveryAddress.estimatedDistanceKm} km</span>
            </h4>
            <div className="divide-y divide-emerald-800/60 max-h-32 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.product.id} className="py-1.5 flex justify-between">
                  <span className="text-white line-clamp-1">{item.product.name} × {item.quantity}</span>
                  <span className="font-bold text-amber-200">₹{item.product.price * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address & Contact Edit */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-xs text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4" /> Delivery Address & Contact
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-emerald-300 mb-1 font-semibold flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-emerald-400" /> Customer Name
                </label>
                <input
                  type="text"
                  value={deliveryAddress.fullName}
                  onChange={(e) => setDeliveryAddress({ ...deliveryAddress, fullName: e.target.value })}
                  className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-emerald-300 mb-1 font-semibold flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-amber-400" /> Contact Number
                </label>
                <input
                  type="text"
                  value={deliveryAddress.phone}
                  onChange={(e) => setDeliveryAddress({ ...deliveryAddress, phone: e.target.value })}
                  className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-emerald-300 mb-1 font-semibold">Street Address</label>
                <input
                  type="text"
                  value={deliveryAddress.streetAddress}
                  onChange={(e) => setDeliveryAddress({ ...deliveryAddress, streetAddress: e.target.value })}
                  className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-emerald-300 mb-1 font-semibold">Pincode</label>
                <input
                  type="text"
                  value={deliveryAddress.pincode}
                  onChange={(e) => setDeliveryAddress({ ...deliveryAddress, pincode: e.target.value })}
                  className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-xs text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-4 h-4" /> Select Payment Method
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('Razorpay')}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  paymentMethod === 'Razorpay'
                    ? 'bg-emerald-800/80 border-amber-400 text-white shadow-md ring-1 ring-amber-400'
                    : 'bg-emerald-900/30 border-emerald-800 text-emerald-300 hover:bg-emerald-900/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">Razorpay Online</span>
                  <span className="bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                    RECOMMENDED
                  </span>
                </div>
                <p className="text-[11px] text-emerald-300 mt-1">UPI, Cards, Netbanking with instant refund guarantee</p>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('COD')}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  paymentMethod === 'COD'
                    ? 'bg-emerald-800/80 border-amber-400 text-white shadow-md ring-1 ring-amber-400'
                    : 'bg-emerald-900/30 border-emerald-800 text-emerald-300 hover:bg-emerald-900/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">Cash on Delivery</span>
                  <Banknote className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-[11px] text-emerald-300 mt-1">Pay with cash or UPI at the time of delivery</p>
              </button>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="bg-emerald-900/60 p-4 rounded-2xl border border-emerald-800 space-y-2 text-xs">
            <div className="flex justify-between text-emerald-300">
              <span>Items Total</span>
              <span className="font-bold text-white">₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-emerald-300">
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-amber-400" /> Distance Transit Fee ({deliveryAddress.estimatedDistanceKm} km)
              </span>
              <span className="font-bold text-white">₹{deliveryFee}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-emerald-800">
              <span>Amount Payable</span>
              <span className="text-amber-300">₹{grandTotal}</span>
            </div>
          </div>

        </div>

        {/* Modal Action Footer */}
        <div className="p-5 bg-gradient-to-t from-emerald-950 to-emerald-900 border-t border-emerald-800 flex items-center justify-between">
          <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-emerald-300 hover:text-white">
            Cancel
          </button>

          {paymentMethod === 'Razorpay' ? (
            <button
              onClick={() => setShowRazorpayModal(true)}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-emerald-950 font-extrabold px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm transition-all transform active:scale-95"
            >
              <CreditCard className="w-4 h-4" />
              <span>Proceed to Razorpay (₹{grandTotal})</span>
            </button>
          ) : (
            <button
              disabled={isSubmitting}
              onClick={() => handlePlaceOrder('', false)}
              className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-extrabold px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Order (COD)</span>
            </button>
          )}
        </div>

        {/* Razorpay Simulation Modal */}
        {showRazorpayModal && (
          <RazorpaySimulationModal
            amount={grandTotal}
            customerName={deliveryAddress.fullName}
            customerPhone={deliveryAddress.phone}
            onSuccess={(paymentId) => {
              setShowRazorpayModal(false);
              handlePlaceOrder(paymentId, true);
            }}
            onClose={() => setShowRazorpayModal(false)}
          />
        )}

      </div>
    </div>
  );
};
