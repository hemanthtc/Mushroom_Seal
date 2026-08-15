import React, { useState } from 'react';
import type { Order, OrderStatus } from '../../types';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  MapPin, 
  Phone, 
  Search
} from 'lucide-react';

interface SellerOrdersProps {
  orders: Order[];
  onUpdateOrder: (updatedOrder: Order) => void;
}

export const SellerOrders: React.FC<SellerOrdersProps> = ({
  orders,
  onUpdateOrder,
}) => {
  const [filterTab, setFilterTab] = useState<'All' | 'Pending' | 'Packing' | 'Out for Delivery' | 'Delivered' | 'Refunds'>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = orders.filter((order) => {
    let matchesTab = true;
    if (filterTab === 'Pending') matchesTab = order.status === 'Pending';
    else if (filterTab === 'Packing') matchesTab = order.status === 'Packing';
    else if (filterTab === 'Out for Delivery') matchesTab = order.status === 'Out for Delivery';
    else if (filterTab === 'Delivered') matchesTab = order.status === 'Delivered';
    else if (filterTab === 'Refunds') matchesTab = ['Cancelled', 'Return Requested', 'Refunded'].includes(order.status);

    const matchesSearch = searchTerm === '' || 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      order.address.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.address.phone.includes(searchTerm);

    return matchesTab && matchesSearch;
  });

  // Action helper: Advance order status
  const handleAdvanceStatus = (order: Order, nextStatus: OrderStatus) => {
    const updated: Order = {
      ...order,
      status: nextStatus,
      statusTimeline: [
        ...order.statusTimeline,
        {
          status: nextStatus,
          timestamp: new Date().toISOString(),
          note: `Status updated to ${nextStatus} by Farmer/Seller.`,
        },
      ],
    };
    onUpdateOrder(updated);
  };

  // Action helper: Approve return and issue instant refund
  const handleApproveReturn = (order: Order) => {
    const updated: Order = {
      ...order,
      status: 'Refunded',
      returnStatus: 'Refund Issued',
      refundAmount: order.grandTotal,
      statusTimeline: [
        ...order.statusTimeline,
        {
          status: 'Refunded',
          timestamp: new Date().toISOString(),
          note: `Return approved by farmer. Instant refund of ₹${order.grandTotal} released to buyer.`,
        },
      ],
    };
    onUpdateOrder(updated);
  };

  // Action helper: Reject return
  const handleRejectReturn = (order: Order) => {
    const updated: Order = {
      ...order,
      returnStatus: 'Rejected',
      statusTimeline: [
        ...order.statusTimeline,
        {
          status: order.status,
          timestamp: new Date().toISOString(),
          note: `Return request reviewed and rejected by farmer. Produce was delivered fresh.`,
        },
      ],
    };
    onUpdateOrder(updated);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-amber-400" /> Order Fulfillment & Refund Operations
          </h2>
          <p className="text-xs text-emerald-300 mt-0.5">
            Process buyer orders, update shipment statuses, and manage cancellations or return refunds.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
          <input
            type="text"
            placeholder="Search Order ID, Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-emerald-950/70 border border-emerald-800 rounded-xl text-xs pl-9 pr-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {(['All', 'Pending', 'Packing', 'Out for Delivery', 'Delivered', 'Refunds'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterTab(tab)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterTab === tab
                ? 'bg-emerald-700 text-white ring-2 ring-emerald-400 shadow-md'
                : 'bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900 border border-emerald-800/60'
            }`}
          >
            {tab === 'Refunds' ? 'Cancellations & Refunds' : tab}
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-emerald-950/20 rounded-3xl border border-emerald-800/40 p-8">
          <Package className="w-12 h-12 text-emerald-700 mx-auto mb-2" />
          <h3 className="text-lg font-bold text-white">No orders in this category</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-emerald-950/60 border border-emerald-800/80 rounded-3xl p-5 space-y-4 shadow-xl"
            >
              {/* Order Top Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-800/60 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-lg text-white">{order.id}</span>
                  <span className="bg-emerald-900 text-amber-300 font-mono text-xs px-2.5 py-0.5 rounded-full border border-emerald-700">
                    {order.paymentMethod} • {order.isPaid ? 'PAID' : 'COD'}
                  </span>
                  <span className="text-xs text-emerald-400">
                    {new Date(order.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-emerald-300">Distance: <strong>{order.address.estimatedDistanceKm} km</strong></span>
                  <SellerStatusBadge status={order.status} />
                </div>
              </div>

              {/* Grid Content */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                
                {/* Items */}
                <div className="space-y-2">
                  <strong className="text-amber-300 uppercase tracking-wider block">Items Harvested ({order.items.length})</strong>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {order.items.map((item) => (
                      <div key={item.product.id} className="flex justify-between bg-emerald-900/40 p-2 rounded-xl border border-emerald-800">
                        <span className="text-white line-clamp-1">{item.product.name} × {item.quantity}</span>
                        <strong className="text-amber-200">₹{item.product.price * item.quantity}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Buyer Details */}
                <div className="space-y-1.5 bg-emerald-900/30 p-3 rounded-2xl border border-emerald-800">
                  <strong className="text-amber-300 uppercase tracking-wider block flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> Buyer Address & Contact
                  </strong>
                  <p className="text-white font-bold">{order.address.fullName}</p>
                  <p className="text-emerald-200">{order.address.streetAddress}, {order.address.pincode}</p>
                  <p className="text-amber-400 font-semibold flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {order.address.phone}
                  </p>
                </div>

                {/* Fulfillment Actions */}
                <div className="bg-emerald-900/30 p-3 rounded-2xl border border-emerald-800 flex flex-col justify-between space-y-2">
                  <div>
                    <strong className="text-amber-300 uppercase tracking-wider block">Status Management</strong>
                    <div className="mt-1 text-emerald-200">
                      Total Order Amount: <strong className="text-white text-sm">₹{order.grandTotal}</strong>
                    </div>
                  </div>

                  {/* Dynamic Seller Action Buttons */}
                  <div className="space-y-1.5">
                    {order.status === 'Pending' && (
                      <button
                        onClick={() => handleAdvanceStatus(order, 'Packing')}
                        className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md"
                      >
                        <Package className="w-4 h-4" /> Start Packing Harvest
                      </button>
                    )}

                    {order.status === 'Packing' && (
                      <button
                        onClick={() => handleAdvanceStatus(order, 'Out for Delivery')}
                        className="w-full bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md"
                      >
                        <Truck className="w-4 h-4" /> Hand to Delivery (Publish Job)
                      </button>
                    )}

                    {order.status === 'Out for Delivery' && (
                      <div className="space-y-1.5">
                        {order.assignedAgentName ? (
                          <div className="bg-emerald-900/60 border border-emerald-700 rounded-xl p-2.5 text-[11px] space-y-0.5">
                            <div className="flex items-center justify-between">
                              <span className="text-emerald-300 font-bold">Rider Assigned</span>
                              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
                                {order.deliveryStage || 'Assigned'}
                              </span>
                            </div>
                            <p className="text-white font-semibold">{order.assignedAgentName}</p>
                            <p className="text-amber-400">{order.assignedAgentPhone}</p>
                          </div>
                        ) : (
                          <div className="bg-amber-950/50 border border-amber-800/60 rounded-xl p-2 text-[11px] text-amber-200">
                            Waiting for a delivery partner to accept this job — or mark delivered yourself.
                          </div>
                        )}
                        {!order.assignedAgentId && (
                          <button
                            onClick={() => handleAdvanceStatus(order, 'Delivered')}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md"
                          >
                            <CheckCircle className="w-4 h-4" /> Mark Delivered (Self-Delivery)
                          </button>
                        )}
                      </div>
                    )}

                    {/* Return Request Approval / Rejection */}
                    {order.status === 'Return Requested' && (
                      <div className="space-y-1">
                        <div className="text-[11px] text-amber-300 font-medium">Reason: {order.returnReason}</div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApproveReturn(order)}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 px-2 rounded-xl text-[11px]"
                          >
                            Approve & Refund
                          </button>
                          <button
                            onClick={() => handleRejectReturn(order)}
                            className="flex-1 bg-red-950 hover:bg-red-900 text-red-300 font-bold py-1.5 px-2 rounded-xl text-[11px]"
                          >
                            Reject Request
                          </button>
                        </div>
                      </div>
                    )}

                    {order.status === 'Cancelled' && (
                      <div className="text-[11px] text-red-300 bg-red-950/80 p-2 rounded-xl border border-red-700">
                        Cancelled by Buyer: {order.cancellationReason || 'N/A'}
                      </div>
                    )}

                    {order.status === 'Refunded' && (
                      <div className="text-[11px] text-emerald-300 bg-emerald-900/80 p-2 rounded-xl border border-emerald-700 font-bold text-center">
                        ✓ Refund of ₹{order.grandTotal} Processed
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SellerStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case 'Pending':
      return <span className="bg-blue-900 text-blue-300 border border-blue-700 px-3 py-0.5 rounded-full text-xs font-bold">New Order</span>;
    case 'Packing':
      return <span className="bg-purple-900 text-purple-300 border border-purple-700 px-3 py-0.5 rounded-full text-xs font-bold">Packing</span>;
    case 'Out for Delivery':
      return <span className="bg-amber-900 text-amber-300 border border-amber-700 px-3 py-0.5 rounded-full text-xs font-bold">In Transit</span>;
    case 'Delivered':
      return <span className="bg-emerald-800 text-white border border-emerald-600 px-3 py-0.5 rounded-full text-xs font-bold">Delivered</span>;
    case 'Cancelled':
      return <span className="bg-red-950 text-red-300 border border-red-700 px-3 py-0.5 rounded-full text-xs font-bold">Cancelled</span>;
    case 'Return Requested':
      return <span className="bg-amber-950 text-amber-300 border border-amber-600 px-3 py-0.5 rounded-full text-xs font-bold animate-pulse">Return Requested</span>;
    case 'Refunded':
      return <span className="bg-emerald-900 text-emerald-300 border border-emerald-600 px-3 py-0.5 rounded-full text-xs font-bold">Refunded</span>;
    default:
      return <span className="bg-gray-800 text-gray-300 px-3 py-0.5 rounded-full text-xs font-bold">{status}</span>;
  }
};
