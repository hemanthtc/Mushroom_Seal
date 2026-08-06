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
  Banknote,
  CheckCircle2,
  Lock,
  ChevronDown,
  ChevronUp,
  X,
  ArrowLeft
} from 'lucide-react';

interface OrderTrackerProps {
  orders: Order[];
  onUpdateOrder: (updatedOrder: Order) => void;
  onBackToStore?: () => void;
}

export const OrderTracker: React.FC<OrderTrackerProps> = ({
  orders,
  onUpdateOrder,
  onBackToStore,
}) => {
  // 1. Right side details box appears ONLY when user clicks any order card (initially null)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  
  // 2. Items Ordered expand / collapse state (default collapsed)
  const [isItemsExpanded, setIsItemsExpanded] = useState<boolean>(false);

  // Edit Address state
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editAddressData, setEditAddressData] = useState<AddressDetails | null>(null);

  // Cancellation state
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('Changed my mind');

  // Return state
  const [returningOrder, setReturningOrder] = useState<Order | null>(null);
  const [returnReason, setReturnReason] = useState('Quality issue / Mushrooms damaged in transit');

  const selectedOrder = orders.find((o) => o.id === selectedOrderId) || null;

  const handleToggleSelectOrder = (id: string) => {
    if (selectedOrderId === id) {
      setSelectedOrderId(null);
    } else {
      setSelectedOrderId(id);
      setIsItemsExpanded(false); // default collapsed state when an order is clicked
    }
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

  // Handle Cancel Order Submit
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
      <div className="text-center py-20 bg-emerald-950/20 rounded-3xl border border-emerald-800/40 p-8 max-w-4xl mx-auto space-y-4">
        <Package className="w-16 h-16 text-emerald-700 mx-auto" />
        <div>
          <h3 className="text-xl font-bold text-white">No active orders found</h3>
          <p className="text-emerald-400 text-sm mt-1">Place an order from the Storefront to track real-time farm delivery!</p>
        </div>
        {onBackToStore && (
          <button
            onClick={onBackToStore}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold px-5 py-2.5 rounded-2xl text-xs shadow-lg transition-transform hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Storefront
          </button>
        )}
      </div>
    );
  }

  const canEditDetails = selectedOrder && (selectedOrder.status === 'Pending' || selectedOrder.status === 'Packing');
  const canCancel = selectedOrder && (selectedOrder.status === 'Pending' || selectedOrder.status === 'Packing');
  const canReturn = selectedOrder && selectedOrder.status === 'Delivered';

  return (
    <div className="bg-emerald-950/70 border border-emerald-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-w-6xl mx-auto pb-12 animate-fade-in">
      
      {/* MAIN CONTAINER HEADER WITH BACK BUTTON */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-800/60 pb-4">
        <div className="flex items-center gap-3">
          {onBackToStore && (
            <button
              onClick={onBackToStore}
              className="p-2 sm:px-3.5 sm:py-2 bg-emerald-900/90 hover:bg-emerald-800 text-amber-400 hover:text-amber-300 rounded-2xl border border-emerald-700/70 transition-all flex items-center gap-1.5 text-xs font-bold shadow-md hover:scale-105 active:scale-95 shrink-0"
              title="Back to Storefront"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
              <Package className="w-6 h-6 text-amber-400" /> Order Tracking & History
            </h2>
            <p className="text-xs text-emerald-300 mt-0.5">
              Click any order card on the left to view details on the right side box.
            </p>
          </div>
        </div>

        <span className="bg-emerald-900 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-700">
          {orders.length} Order(s)
        </span>
      </div>

      {/* MAIN BOX SPLIT: LEFT SIDE BOX (ONLY ORDER CARDS) & RIGHT SIDE BOX (ORDER DETAILS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT SIDE DISTINCT CONTAINER BOX (CONTAINER BOX AROUND ORDERS LIST AS MARKED IN RED) */}
        <div className={`${selectedOrderId ? 'lg:col-span-5' : 'lg:col-span-12 max-w-2xl mx-auto'} bg-emerald-900/40 border border-emerald-700/80 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 transition-all duration-300 w-full`}>
          <div className="flex items-center justify-between border-b border-emerald-800/80 pb-3">
            <h3 className="text-xs font-extrabold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Package className="w-4 h-4 text-amber-400" /> Your Active Orders List
            </h3>
            <span className="text-[10px] bg-emerald-950 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-800">
              {orders.length} Active
            </span>
          </div>

          <div className="space-y-3">
            {orders.map((order) => {
              const isSelected = selectedOrderId === order.id;
              return (
                <div
                  key={order.id}
                  onClick={() => handleToggleSelectOrder(order.id)}
                  className={`p-4 rounded-3xl border transition-all cursor-pointer select-none space-y-2 shadow-md ${
                    isSelected
                      ? 'bg-emerald-900 border-amber-400/90 ring-2 ring-amber-400/50 text-white shadow-xl transform scale-[1.01]'
                      : 'bg-emerald-950/70 hover:bg-emerald-900/60 border-emerald-800/80 text-emerald-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl border ${isSelected ? 'bg-amber-500 text-emerald-950 border-amber-400' : 'bg-emerald-800 text-amber-400 border-emerald-700'}`}>
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <strong className="text-sm font-extrabold block text-white">{order.id}</strong>
                        <span className="text-[11px] text-emerald-300 font-medium">
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {order.items.length} item(s)
                        </span>
                      </div>
                    </div>
                    <span className="text-amber-300 font-black text-sm">₹{order.grandTotal}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-emerald-800/60 text-xs">
                    <StatusBadge status={order.status} />
                    <span className="text-[11px] font-extrabold text-amber-400 flex items-center gap-1">
                      {isSelected ? 'Selected 👈' : 'View Details →'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT SIDE BOX: ORDER DETAILS (APPEARS ONLY WHEN USER CLICKS AN ORDER CARD ON THE LEFT) */}
        {selectedOrderId && selectedOrder && (
          <div className="lg:col-span-7 space-y-4 bg-emerald-900/50 border border-emerald-700/80 rounded-3xl p-6 shadow-2xl sticky top-20 animate-fade-in">
            <div className="space-y-6">
              
              {/* Right Box Header with Close Button */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-white">{selectedOrder.id}</h3>
                    <StatusBadge status={selectedOrder.status} />
                  </div>
                  <p className="text-xs text-emerald-300 mt-1">
                    Placed on {new Date(selectedOrder.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-emerald-300 block font-semibold">Grand Total</span>
                    <strong className="text-2xl text-amber-300 font-black">₹{selectedOrder.grandTotal}</strong>
                  </div>
                  
                  {/* Close Details Button */}
                  <button
                    onClick={() => setSelectedOrderId(null)}
                    className="p-1.5 text-emerald-400 hover:text-white bg-emerald-950 hover:bg-emerald-800 rounded-xl border border-emerald-700/60 transition-colors"
                    title="Close Order Details"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Real-Time Farm Order Timeline */}
              <div className="bg-emerald-950/80 p-4 rounded-2xl border border-emerald-800/80 space-y-3">
                <h4 className="text-xs font-extrabold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> Real-Time Farm Order Timeline
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center pt-2">
                  <TimelineStep 
                    label="Order Placed" 
                    active={true} 
                    current={selectedOrder.status === 'Pending'} 
                  />
                  <TimelineStep 
                    label="Packing Fresh" 
                    active={['Packing', 'Out for Delivery', 'Delivered'].includes(selectedOrder.status)} 
                    current={selectedOrder.status === 'Packing'} 
                  />
                  <TimelineStep 
                    label="Out for Delivery" 
                    active={['Out for Delivery', 'Delivered'].includes(selectedOrder.status)} 
                    current={selectedOrder.status === 'Out for Delivery'} 
                  />
                  <TimelineStep 
                    label="Delivered" 
                    active={selectedOrder.status === 'Delivered'} 
                    current={selectedOrder.status === 'Delivered'} 
                  />
                </div>

                {/* Cancellation & Refund Information Card */}
                {selectedOrder.status === 'Cancelled' && (
                  <div className="bg-red-950/80 p-3.5 rounded-2xl border border-red-700/60 text-red-200 text-xs space-y-1 mt-2">
                    <div className="flex justify-between items-center font-bold text-white">
                      <span>Order Cancelled</span>
                      <span className="text-amber-400 font-mono text-[11px]">{selectedOrder.refundType || 'Cancelled'}</span>
                    </div>
                    <p className="text-[11px] text-red-300">Reason: {selectedOrder.cancellationReason}</p>
                    
                    {selectedOrder.refundType === 'Online Razorpay Refund' ? (
                      <div className="bg-emerald-950 p-2.5 rounded-xl border border-emerald-600/60 text-emerald-300 text-[11px] font-bold mt-1.5 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> ₹{selectedOrder.refundAmount} Online Refund Processed to Source
                        </span>
                        <span className="font-mono text-amber-300 text-[10px]">Ref: {selectedOrder.refundId}</span>
                      </div>
                    ) : (
                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-700 text-slate-300 text-[11px] font-medium mt-1.5 flex items-center gap-1">
                        <Banknote className="w-4 h-4 text-amber-400" /> Cash on Delivery Order • No cash collected, ₹0 refund required.
                      </div>
                    )}
                  </div>
                )}

                {selectedOrder.status === 'Return Requested' && (
                  <div className="bg-amber-950/80 p-3 rounded-xl border border-amber-700/60 text-amber-200 text-xs mt-2">
                    <strong className="text-white">Return Request Status:</strong> {selectedOrder.returnStatus || 'Pending Review'}
                    <p className="text-[11px] mt-0.5 text-amber-300">Reason: {selectedOrder.returnReason}</p>
                  </div>
                )}

                {selectedOrder.status === 'Refunded' && (
                  <div className="bg-emerald-950/90 p-3 rounded-xl border border-emerald-500/60 text-emerald-200 text-xs mt-2">
                    <strong className="text-white">✓ Refund Processed:</strong> ₹{selectedOrder.grandTotal} credited back to online account.
                  </div>
                )}
              </div>

              {/* ITEMS ORDERED WITH COLLAPSE / EXPAND FEATURE */}
              <div className="bg-emerald-950/80 p-4 rounded-2xl border border-emerald-800/80 space-y-3">
                <div 
                  onClick={() => setIsItemsExpanded(!isItemsExpanded)}
                  className="flex items-center justify-between cursor-pointer select-none hover:text-amber-300 transition-colors"
                >
                  <h4 className="text-xs font-extrabold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-amber-400" /> Items Ordered ({selectedOrder.items.length})
                  </h4>
                  <button 
                    type="button"
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 bg-emerald-900 px-2.5 py-1 rounded-xl border border-emerald-700/60 flex items-center gap-1 transition-colors"
                  >
                    <span>{isItemsExpanded ? 'Collapse' : 'Expand'}</span>
                    {isItemsExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Collapsible Content */}
                {isItemsExpanded && (
                  <div className="space-y-2 pt-1 animate-fade-in">
                    {selectedOrder.items.map((item) => (
                      <div key={item.product.id} className="flex items-center justify-between bg-emerald-900/40 p-3 rounded-xl border border-emerald-800/50 text-xs">
                        <div className="flex items-center gap-3">
                          <img src={item.product.image} alt={item.product.name} className="w-10 h-10 object-cover rounded-lg border border-emerald-700" />
                          <div>
                            <strong className="text-white block font-bold">{item.product.name}</strong>
                            <span className="text-emerald-400">Qty: {item.quantity} × ₹{item.product.price} / {item.product.unit}</span>
                          </div>
                        </div>
                        <span className="font-extrabold text-white">₹{item.product.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Delivery Address & Payment Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                {/* Address Block */}
                <div className="bg-emerald-950/80 p-4 rounded-2xl border border-emerald-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> Delivery Address
                    </h4>
                    {canEditDetails && (
                      <button
                        onClick={() => {
                          setEditingOrder(selectedOrder);
                          setEditAddressData({ ...selectedOrder.address });
                        }}
                        className="text-amber-400 hover:underline font-bold flex items-center gap-1 text-[11px]"
                      >
                        <Edit3 className="w-3 h-3" /> Edit Details
                      </button>
                    )}
                  </div>
                  
                  <p className="text-white font-bold">{selectedOrder.address.fullName}</p>
                  <p className="text-emerald-200">{selectedOrder.address.streetAddress}, {selectedOrder.address.city} - {selectedOrder.address.pincode}</p>
                  <p className="text-emerald-300 font-semibold flex items-center gap-1">
                    <Phone className="w-3 h-3 text-amber-400" /> {selectedOrder.address.phone}
                  </p>
                  
                  {!canEditDetails && selectedOrder.status !== 'Cancelled' && (
                    <p className="text-[10px] text-amber-300 font-bold bg-amber-950/60 px-2.5 py-1 rounded-xl border border-amber-800/80 flex items-center gap-1 pt-1">
                      <Lock className="w-3 h-3 text-amber-400 shrink-0" /> Delivery address locked — Order has been shipped & cannot be modified.
                    </p>
                  )}
                </div>

                {/* Payment & Receipt Block */}
                <div className="bg-emerald-950/80 p-4 rounded-2xl border border-emerald-800 space-y-3 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5" /> Payment & Receipt
                    </h4>
                    <div className="flex justify-between text-emerald-200">
                      <span>Method:</span>
                      <strong className="text-white">{selectedOrder.paymentMethod}</strong>
                    </div>
                    <div className="flex justify-between text-emerald-200">
                      <span>Transaction Ref:</span>
                      <span className="font-mono text-amber-300 text-[11px]">{selectedOrder.paymentId}</span>
                    </div>
                    <div className="flex justify-between text-emerald-200">
                      <span>Payment Status:</span>
                      <span className={`font-bold ${selectedOrder.isPaid ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {selectedOrder.isPaid ? '✓ Paid Online (Razorpay)' : 'Cash on Delivery'}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons: Cancel & Return */}
                  <div className="pt-2 border-t border-emerald-800/60 flex items-center gap-2">
                    {canCancel ? (
                      <button
                        onClick={() => setCancellingOrder(selectedOrder)}
                        className="flex-1 bg-red-950/80 hover:bg-red-900 border border-red-700/70 text-red-200 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1 transition-colors"
                      >
                        <XCircle className="w-4 h-4 text-red-400" /> Cancel Order
                      </button>
                    ) : selectedOrder.status !== 'Cancelled' && selectedOrder.status !== 'Delivered' && selectedOrder.status !== 'Refunded' && selectedOrder.status !== 'Return Requested' ? (
                      <button
                        disabled
                        className="flex-1 bg-gray-900/60 border border-gray-700/60 text-gray-400 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-not-allowed opacity-75"
                        title="Order cancellation is disabled once the order is shipped / out for delivery."
                      >
                        <Lock className="w-3.5 h-3.5 text-gray-400" /> Cancel Disabled (Shipped)
                      </button>
                    ) : null}

                    {canReturn && (
                      <button
                        onClick={() => setReturningOrder(selectedOrder)}
                        className="flex-1 bg-amber-950/80 hover:bg-amber-900 border border-amber-700/70 text-amber-200 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1 transition-colors"
                      >
                        <RotateCcw className="w-4 h-4 text-amber-400" /> Request Return / Refund
                      </button>
                    )}
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

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
