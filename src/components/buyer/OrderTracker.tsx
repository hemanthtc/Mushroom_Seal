import React, { useState } from 'react';
import type { 
  Order, 
  AddressDetails 
} from '../../types';
import { 
  Package, 
  Clock, 
  XCircle, 
  Edit3, 
  MapPin, 
  Phone, 
  AlertTriangle,
  RotateCcw,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Banknote,
  CheckCircle2
} from 'lucide-react';

interface OrderTrackerProps {
  orders: Order[];
  onUpdateOrder: (updatedOrder: Order) => void;
}

export const OrderTracker: React.FC<OrderTrackerProps> = ({
  orders,
  onUpdateOrder,
}) => {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(orders[0]?.id || null);
  
  // Edit Address state
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editAddressData, setEditAddressData] = useState<AddressDetails | null>(null);

  // Cancellation state
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('Changed my mind');

  // Return state
  const [returningOrder, setReturningOrder] = useState<Order | null>(null);
  const [returnReason, setReturnReason] = useState('Quality issue / Mushrooms damaged in transit');

  const toggleExpand = (id: string) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  // Handle Edit Address Submit
  const handleSaveAddressEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder || !editAddressData) return;

    const updated: Order = {
      ...editingOrder,
      address: { ...editAddressData },
      statusTimeline: [
        ...editingOrder.statusTimeline,
        {
          status: editingOrder.status,
          timestamp: new Date().toISOString(),
          note: `Address/Phone updated by buyer to ${editAddressData.streetAddress}, ${editAddressData.phone}`,
        },
      ],
    };

    onUpdateOrder(updated);
    setEditingOrder(null);
    setEditAddressData(null);
  };

  // Handle Cancel Order Submit with distinct Online Refund vs COD logic
  const handleConfirmCancel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingOrder) return;

    const isOnlinePaid = cancellingOrder.isPaid && cancellingOrder.paymentMethod === 'Razorpay';
    const refundId = isOnlinePaid ? 'rfnd_rzp_' + Math.random().toString(36).substring(2, 12) : undefined;
    const refundType = isOnlinePaid ? 'Online Razorpay Refund' : 'COD No Refund';
    const refundAmount = isOnlinePaid ? cancellingOrder.grandTotal : 0;

    const updated: Order = {
      ...cancellingOrder,
      status: 'Cancelled',
      cancellationReason: cancelReason,
      cancellationRequestedAt: new Date().toISOString(),
      returnStatus: isOnlinePaid ? 'Refund Issued' : undefined,
      refundAmount,
      refundType,
      refundId,
      statusTimeline: [
        ...cancellingOrder.statusTimeline,
        {
          status: 'Cancelled',
          timestamp: new Date().toISOString(),
          note: isOnlinePaid 
            ? `Order cancelled. Automatic Online Razorpay Refund of ₹${refundAmount} issued (ID: ${refundId}).`
            : `Order cancelled. Cash on Delivery order - no cash collected, zero refund needed.`,
        },
      ],
    };

    onUpdateOrder(updated);
    setCancellingOrder(null);
  };

  // Handle Return / Refund Submit
  const handleConfirmReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returningOrder) return;

    const updated: Order = {
      ...returningOrder,
      status: 'Return Requested',
      returnReason: returnReason,
      returnRequestedAt: new Date().toISOString(),
      returnStatus: 'Pending Review',
      statusTimeline: [
        ...returningOrder.statusTimeline,
        {
          status: 'Return Requested',
          timestamp: new Date().toISOString(),
          note: `Return/Refund requested by buyer. Reason: ${returnReason}`,
        },
      ],
    };

    onUpdateOrder(updated);
    setReturningOrder(null);
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-20 bg-emerald-950/20 rounded-3xl border border-emerald-800/40 p-8">
        <Package className="w-16 h-16 text-emerald-700 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-white">No active orders found</h3>
        <p className="text-emerald-400 text-sm mt-1">Place an order from the Storefront to track real-time farm delivery!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-amber-400" /> Order Tracking & History
          </h2>
          <p className="text-xs text-emerald-300 mt-0.5">
            Track farm dispatch, update address before shipment, or request returns/refunds.
          </p>
        </div>
        <span className="bg-emerald-900 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-700">
          {orders.length} Order(s)
        </span>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => {
          const isExpanded = expandedOrderId === order.id;
          const canEditDetails = order.status === 'Pending' || order.status === 'Packing';
          const canCancel = order.status === 'Pending' || order.status === 'Packing';
          const canReturn = order.status === 'Delivered';

          return (
            <div
              key={order.id}
              className="bg-emerald-950/60 border border-emerald-800/80 rounded-3xl overflow-hidden shadow-xl transition-all"
            >
              {/* Order Row Header */}
              <div
                onClick={() => toggleExpand(order.id)}
                className="p-5 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-emerald-900/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-900 rounded-2xl border border-emerald-700/60 text-amber-400">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-base text-white">{order.id}</span>
                      <span className="text-xs text-emerald-400">• {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-xs text-emerald-300 font-medium">
                      {order.items.length} item(s) • Total: <strong className="text-amber-300 font-bold">₹{order.grandTotal}</strong>
                    </p>
                  </div>
                </div>

                {/* Status Pill */}
                <div className="flex items-center gap-3">
                  <StatusBadge status={order.status} />
                  <button className="text-emerald-400 p-1">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="p-6 border-t border-emerald-800/60 bg-emerald-950/90 space-y-6">
                  
                  {/* Status Timeline Stepper */}
                  <div className="bg-emerald-900/40 p-4 rounded-2xl border border-emerald-800/80 space-y-3">
                    <h4 className="text-xs font-extrabold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-4 h-4" /> Real-Time Farm Order Timeline
                    </h4>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center pt-2">
                      <TimelineStep 
                        label="Order Placed" 
                        active={true} 
                        current={order.status === 'Pending'} 
                      />
                      <TimelineStep 
                        label="Packing Fresh" 
                        active={['Packing', 'Out for Delivery', 'Delivered'].includes(order.status)} 
                        current={order.status === 'Packing'} 
                      />
                      <TimelineStep 
                        label="Out for Delivery" 
                        active={['Out for Delivery', 'Delivered'].includes(order.status)} 
                        current={order.status === 'Out for Delivery'} 
                      />
                      <TimelineStep 
                        label="Delivered" 
                        active={order.status === 'Delivered'} 
                        current={order.status === 'Delivered'} 
                      />
                    </div>

                    {/* Cancellation & Refund Information Card */}
                    {order.status === 'Cancelled' && (
                      <div className="bg-red-950/80 p-3.5 rounded-2xl border border-red-700/60 text-red-200 text-xs space-y-1 mt-2">
                        <div className="flex justify-between items-center font-bold text-white">
                          <span>Order Cancelled</span>
                          <span className="text-amber-400 font-mono text-[11px]">{order.refundType || 'Cancelled'}</span>
                        </div>
                        <p className="text-[11px] text-red-300">Reason: {order.cancellationReason}</p>
                        
                        {order.refundType === 'Online Razorpay Refund' ? (
                          <div className="bg-emerald-950 p-2.5 rounded-xl border border-emerald-600/60 text-emerald-300 text-[11px] font-bold mt-1.5 flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> ₹{order.refundAmount} Online Refund Processed to Razorpay Source
                            </span>
                            <span className="font-mono text-amber-300 text-[10px]">Ref: {order.refundId}</span>
                          </div>
                        ) : (
                          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-700 text-slate-300 text-[11px] font-medium mt-1.5 flex items-center gap-1">
                            <Banknote className="w-4 h-4 text-amber-400" /> Cash on Delivery Order • No cash collected, ₹0 refund required.
                          </div>
                        )}
                      </div>
                    )}

                    {order.status === 'Return Requested' && (
                      <div className="bg-amber-950/80 p-3 rounded-xl border border-amber-700/60 text-amber-200 text-xs mt-2">
                        <strong className="text-white">Return Request Status:</strong> {order.returnStatus || 'Pending Review'}
                        <p className="text-[11px] mt-0.5 text-amber-300">Reason: {order.returnReason}</p>
                      </div>
                    )}

                    {order.status === 'Refunded' && (
                      <div className="bg-emerald-950/90 p-3 rounded-xl border border-emerald-500/60 text-emerald-200 text-xs mt-2">
                        <strong className="text-white">✓ Refund Processed:</strong> ₹{order.grandTotal} credited back to online account.
                      </div>
                    )}
                  </div>

                  {/* Items List */}
                  <div>
                    <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">Items Ordered</h4>
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div key={item.product.id} className="flex items-center justify-between bg-emerald-900/40 p-3 rounded-xl border border-emerald-800/50 text-xs">
                          <div className="flex items-center gap-3">
                            <img src={item.product.image} alt={item.product.name} className="w-10 h-10 object-cover rounded-lg" />
                            <div>
                              <strong className="text-white block">{item.product.name}</strong>
                              <span className="text-emerald-400">Qty: {item.quantity} × ₹{item.product.price} / {item.product.unit}</span>
                            </div>
                          </div>
                          <span className="font-extrabold text-white">₹{item.product.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Address & Payment Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    
                    {/* Address Block */}
                    <div className="bg-emerald-900/30 p-4 rounded-2xl border border-emerald-800 space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> Delivery Address
                        </h4>
                        {canEditDetails && (
                          <button
                            onClick={() => {
                              setEditingOrder(order);
                              setEditAddressData({ ...order.address });
                            }}
                            className="text-amber-400 hover:underline font-bold flex items-center gap-1 text-[11px]"
                          >
                            <Edit3 className="w-3 h-3" /> Edit Details
                          </button>
                        )}
                      </div>
                      
                      <p className="text-white font-bold">{order.address.fullName}</p>
                      <p className="text-emerald-200">{order.address.streetAddress}, {order.address.city} - {order.address.pincode}</p>
                      <p className="text-emerald-300 font-semibold flex items-center gap-1">
                        <Phone className="w-3 h-3 text-amber-400" /> {order.address.phone}
                      </p>
                      
                      {!canEditDetails && (
                        <p className="text-[10px] text-emerald-400/70 italic pt-1">
                          Address modification locked after dispatch.
                        </p>
                      )}
                    </div>

                    {/* Payment & Action Block */}
                    <div className="bg-emerald-900/30 p-4 rounded-2xl border border-emerald-800 space-y-3 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <h4 className="font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                          <CreditCard className="w-3.5 h-3.5" /> Payment & Receipt
                        </h4>
                        <div className="flex justify-between text-emerald-200">
                          <span>Method:</span>
                          <strong className="text-white">{order.paymentMethod}</strong>
                        </div>
                        <div className="flex justify-between text-emerald-200">
                          <span>Transaction Ref:</span>
                          <span className="font-mono text-amber-300 text-[11px]">{order.paymentId}</span>
                        </div>
                        <div className="flex justify-between text-emerald-200">
                          <span>Payment Status:</span>
                          <span className={`font-bold ${order.isPaid ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {order.isPaid ? '✓ Paid Online (Razorpay)' : 'Cash on Delivery'}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons: Cancel & Return */}
                      <div className="pt-2 border-t border-emerald-800/60 flex items-center gap-2">
                        {canCancel && (
                          <button
                            onClick={() => setCancellingOrder(order)}
                            className="flex-1 bg-red-950/80 hover:bg-red-900 border border-red-700/70 text-red-200 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1 transition-colors"
                          >
                            <XCircle className="w-4 h-4 text-red-400" /> Cancel Order
                          </button>
                        )}

                        {canReturn && (
                          <button
                            onClick={() => setReturningOrder(order)}
                            className="flex-1 bg-amber-950/80 hover:bg-amber-900 border border-amber-700/70 text-amber-200 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1 transition-colors"
                          >
                            <RotateCcw className="w-4 h-4 text-amber-400" /> Request Return / Refund
                          </button>
                        )}
                      </div>
                    </div>

                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal: Edit Address & Phone before shipment */}
      {editingOrder && editAddressData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-emerald-950 border border-emerald-700 rounded-3xl max-w-md w-full p-6 text-emerald-100 space-y-4">
            <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-amber-400" /> Modify Delivery Details
            </h3>
            <p className="text-xs text-emerald-300">
              You can update your address or phone number before the seller dispatches the order ({editingOrder.id}).
            </p>

            <form onSubmit={handleSaveAddressEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-emerald-300 mb-1 font-bold">Contact Phone Number</label>
                <input
                  type="text"
                  required
                  value={editAddressData.phone}
                  onChange={(e) => setEditAddressData({ ...editAddressData, phone: e.target.value })}
                  className="w-full bg-emerald-900/70 border border-emerald-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-emerald-300 mb-1 font-bold">Street Address</label>
                <input
                  type="text"
                  required
                  value={editAddressData.streetAddress}
                  onChange={(e) => setEditAddressData({ ...editAddressData, streetAddress: e.target.value })}
                  className="w-full bg-emerald-900/70 border border-emerald-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-emerald-300 mb-1 font-bold">City</label>
                  <input
                    type="text"
                    required
                    value={editAddressData.city}
                    onChange={(e) => setEditAddressData({ ...editAddressData, city: e.target.value })}
                    className="w-full bg-emerald-900/70 border border-emerald-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-emerald-300 mb-1 font-bold">Pincode</label>
                  <input
                    type="text"
                    required
                    value={editAddressData.pincode}
                    onChange={(e) => setEditAddressData({ ...editAddressData, pincode: e.target.value })}
                    className="w-full bg-emerald-900/70 border border-emerald-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setEditingOrder(null); setEditAddressData(null); }}
                  className="px-4 py-2 font-bold text-emerald-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold px-4 py-2 rounded-xl text-xs"
                >
                  Save Modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Cancel Order prompt */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-emerald-950 border border-emerald-700 rounded-3xl max-w-md w-full p-6 text-emerald-100 space-y-4">
            <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" /> Confirm Order Cancellation
            </h3>
            <p className="text-xs text-emerald-300">
              Are you sure you want to cancel <strong className="text-white">{cancellingOrder.id}</strong>?
            </p>

            {cancellingOrder.isPaid && cancellingOrder.paymentMethod === 'Razorpay' ? (
              <div className="bg-emerald-900/60 p-3 rounded-2xl border border-emerald-700 text-xs text-emerald-200">
                <strong className="text-amber-300 block mb-0.5">Online Payment Refund:</strong>
                An automatic Razorpay refund of <strong className="text-white">₹{cancellingOrder.grandTotal}</strong> will be immediately credited back to your bank account / UPI VPA.
              </div>
            ) : (
              <div className="bg-slate-900 p-3 rounded-2xl border border-slate-700 text-xs text-slate-300">
                <strong className="text-amber-300 block mb-0.5">Cash on Delivery Order:</strong>
                This is a COD order. The order will be cancelled with no payment collected or refunded.
              </div>
            )}

            <form onSubmit={handleConfirmCancel} className="space-y-3 text-xs">
              <div>
                <label className="block text-emerald-300 mb-1 font-bold">Reason for Cancellation</label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full bg-emerald-900/70 border border-emerald-700 rounded-xl px-3 py-2 text-white font-sans"
                >
                  <option>Changed my mind</option>
                  <option>Accidentally ordered wrong item</option>
                  <option>Delivery time is longer than expected</option>
                  <option>Other reason</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCancellingOrder(null)}
                  className="px-4 py-2 font-bold text-emerald-300 hover:text-white"
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-500 text-white font-extrabold px-4 py-2 rounded-xl text-xs"
                >
                  Confirm Cancellation & Refund
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Return / Refund prompt */}
      {returningOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-emerald-950 border border-emerald-700 rounded-3xl max-w-md w-full p-6 text-emerald-100 space-y-4">
            <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-amber-400" /> Request Return or Refund
            </h3>
            <p className="text-xs text-emerald-300">
              Submit a return/refund request for delivered order <strong className="text-white">{returningOrder.id}</strong>.
            </p>

            <form onSubmit={handleConfirmReturn} className="space-y-3 text-xs">
              <div>
                <label className="block text-emerald-300 mb-1 font-bold">Select Reason</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full bg-emerald-900/70 border border-emerald-700 rounded-xl px-3 py-2 text-white font-sans"
                >
                  <option>Quality issue / Mushrooms damaged in transit</option>
                  <option>Incorrect veggie item received</option>
                  <option>Spoiled / Stale produce</option>
                  <option>Missing items in packet</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReturningOrder(null)}
                  className="px-4 py-2 font-bold text-emerald-300 hover:text-white"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold px-4 py-2 rounded-xl text-xs"
                >
                  Submit Return Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

// Helper Components
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case 'Pending':
      return <span className="bg-blue-900/80 text-blue-300 border border-blue-700/60 px-3 py-1 rounded-full text-xs font-bold">Pending Confirmation</span>;
    case 'Packing':
      return <span className="bg-purple-900/80 text-purple-300 border border-purple-700/60 px-3 py-1 rounded-full text-xs font-bold">Packing Harvest</span>;
    case 'Out for Delivery':
      return <span className="bg-amber-900/80 text-amber-300 border border-amber-700/60 px-3 py-1 rounded-full text-xs font-bold animate-pulse">Out for Delivery</span>;
    case 'Delivered':
      return <span className="bg-emerald-800 text-white border border-emerald-600 px-3 py-1 rounded-full text-xs font-bold">Delivered</span>;
    case 'Cancelled':
      return <span className="bg-red-950 text-red-300 border border-red-700 px-3 py-1 rounded-full text-xs font-bold">Cancelled</span>;
    case 'Return Requested':
      return <span className="bg-amber-950 text-amber-300 border border-amber-600 px-3 py-1 rounded-full text-xs font-bold">Return Requested</span>;
    case 'Refunded':
      return <span className="bg-emerald-900 text-emerald-300 border border-emerald-600 px-3 py-1 rounded-full text-xs font-bold">Refunded</span>;
    default:
      return <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-xs font-bold">{status}</span>;
  }
};

const TimelineStep: React.FC<{ label: string; active: boolean; current: boolean }> = ({ label, active, current }) => {
  return (
    <div className={`p-2 rounded-xl border text-[11px] font-semibold ${
      current 
        ? 'bg-amber-500 text-emerald-950 border-amber-400 font-extrabold shadow-md' 
        : active 
        ? 'bg-emerald-800/80 text-white border-emerald-600' 
        : 'bg-emerald-950/60 text-emerald-500 border-emerald-900'
    }`}>
      {label}
    </div>
  );
};
