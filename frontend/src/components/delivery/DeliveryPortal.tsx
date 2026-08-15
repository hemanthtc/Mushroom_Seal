import React, { useState } from 'react';
import type { Order, DeliveryAgent, TabType } from '../../types';
import {
  Bike,
  Package,
  MapPin,
  Phone,
  Navigation,
  CheckCircle2,
  Truck,
  Banknote,
  ShieldCheck,
  Wallet,
  Star,
  Clock,
  X,
  QrCode,
  KeyRound,
  IndianRupee,
  ScanLine,
} from 'lucide-react';

interface DeliveryPortalProps {
  view: TabType;
  agent: DeliveryAgent;
  orders: Order[];
  onUpdateOrder: (order: Order) => void;
  addToast: (type: 'success' | 'error' | 'info' | 'warning', text: string) => void;
}

export const DeliveryPortal: React.FC<DeliveryPortalProps> = ({
  view,
  agent,
  orders,
  onUpdateOrder,
  addToast,
}) => {
  const [verifyingOrder, setVerifyingOrder] = useState<Order | null>(null);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');

  // Available jobs: dispatched by seller, not yet accepted by any rider
  const availableJobs = orders.filter(
    (o) => o.status === 'Out for Delivery' && (o.deliveryStage === 'Unassigned' || !o.deliveryStage) && !o.assignedAgentId
  );

  // My active deliveries
  const activeDeliveries = orders.filter(
    (o) => o.assignedAgentId === agent.agentId && o.status === 'Out for Delivery'
  );

  // My completed deliveries
  const history = orders.filter(
    (o) => o.assignedAgentId === agent.agentId && o.status === 'Delivered'
  );

  const todayEarnings = history.reduce((sum, o) => sum + o.deliveryFee, 0);
  const codToCollect = activeDeliveries
    .filter((o) => o.paymentMethod === 'COD')
    .reduce((sum, o) => sum + o.grandTotal, 0);

  const pushTimeline = (order: Order, note: string, extra: Partial<Order> = {}): Order => ({
    ...order,
    ...extra,
    statusTimeline: [
      ...order.statusTimeline,
      { status: order.status, timestamp: new Date().toISOString(), note },
    ],
  });

  const handleAcceptJob = (order: Order) => {
    const updated = pushTimeline(
      order,
      `Delivery accepted by ${agent.name} (${agent.agentId}).`,
      {
        assignedAgentId: agent.agentId,
        assignedAgentName: agent.name,
        assignedAgentPhone: agent.phone,
        deliveryStage: 'Assigned',
      }
    );
    onUpdateOrder(updated);
    addToast('success', `You accepted delivery ${order.id}. Head to the farm for pickup.`);
  };

  const handlePickedUp = (order: Order) => {
    onUpdateOrder(pushTimeline(order, `Parcel picked up from farm by ${agent.name}.`, { deliveryStage: 'Picked Up' }));
    addToast('info', `Picked up ${order.id}. Drive safe!`);
  };

  const handleArrived = (order: Order) => {
    onUpdateOrder(pushTimeline(order, `Rider arrived at customer location.`, { deliveryStage: 'Arrived' }));
    addToast('info', `Marked arrived for ${order.id}. Ask customer for their QR / OTP.`);
  };

  const openVerify = (order: Order) => {
    setVerifyingOrder(order);
    setOtpInput('');
    setOtpError('');
  };

  const handleVerifyComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyingOrder) return;
    if (otpInput.trim() !== (verifyingOrder.deliveryOtp || '')) {
      setOtpError('Incorrect code. Ask the customer to read their 6-digit delivery OTP or scan their QR.');
      return;
    }
    const isCod = verifyingOrder.paymentMethod === 'COD';
    const updated = pushTimeline(
      verifyingOrder,
      isCod
        ? `Handover verified via OTP. ₹${verifyingOrder.grandTotal} cash/UPI collected by ${agent.name}.`
        : `Handover verified via OTP. Prepaid order delivered by ${agent.name}.`,
      {
        status: 'Delivered',
        deliveryStage: 'Delivered',
        codCollected: isCod ? true : verifyingOrder.codCollected,
        isPaid: isCod ? true : verifyingOrder.isPaid,
      }
    );
    onUpdateOrder(updated);
    addToast('success', `${verifyingOrder.id} delivered & verified successfully!`);
    setVerifyingOrder(null);
  };

  const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; accent?: string }> = ({
    icon,
    label,
    value,
    accent = 'text-amber-300',
  }) => (
    <div className="bg-emerald-900/40 border border-emerald-800 rounded-2xl p-4 flex items-center gap-3 shadow-lg">
      <div className="p-2.5 rounded-xl bg-emerald-800/70 border border-emerald-700 text-amber-400">{icon}</div>
      <div>
        <p className="text-[11px] text-emerald-300 font-semibold uppercase tracking-wider">{label}</p>
        <p className={`text-xl font-black ${accent}`}>{value}</p>
      </div>
    </div>
  );

  const stageBadge = (order: Order) => {
    const stage = order.deliveryStage || 'Assigned';
    const map: Record<string, string> = {
      Assigned: 'bg-blue-900/70 text-blue-300 border-blue-700',
      'Picked Up': 'bg-purple-900/70 text-purple-300 border-purple-700',
      Arrived: 'bg-amber-900/70 text-amber-300 border-amber-700 animate-pulse',
      Delivered: 'bg-emerald-800 text-white border-emerald-600',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${map[stage] || map.Assigned}`}>
        {stage}
      </span>
    );
  };

  const OrderCard: React.FC<{ order: Order; children?: React.ReactNode }> = ({ order, children }) => (
    <div
      className="bg-emerald-950/60 border border-emerald-800/80 rounded-3xl p-5 space-y-4 shadow-xl"
      data-testid={`delivery-order-${order.id}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-800/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-800 text-amber-400 border border-emerald-700">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <strong className="text-white font-extrabold text-sm block">{order.id}</strong>
            <span className="text-[11px] text-emerald-300">
              {order.items.length} item(s) • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-black border ${
              order.paymentMethod === 'COD'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            }`}
          >
            {order.paymentMethod === 'COD' ? `COD ₹${order.grandTotal}` : 'PREPAID'}
          </span>
          {order.status === 'Out for Delivery' && order.assignedAgentId && stageBadge(order)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="bg-emerald-900/30 p-3 rounded-2xl border border-emerald-800 space-y-1">
          <strong className="text-amber-300 uppercase tracking-wider flex items-center gap-1 text-[11px]">
            <MapPin className="w-3.5 h-3.5" /> Drop Location ({order.address.estimatedDistanceKm} km)
          </strong>
          <p className="text-white font-bold">{order.address.fullName}</p>
          <p className="text-emerald-200">{order.address.streetAddress}, {order.address.city} - {order.address.pincode}</p>
          {order.address.landmark && <p className="text-emerald-400">Landmark: {order.address.landmark}</p>}
          <p className="text-amber-400 font-semibold flex items-center gap-1">
            <Phone className="w-3 h-3" /> {order.address.phone}
          </p>
        </div>
        <div className="bg-emerald-900/30 p-3 rounded-2xl border border-emerald-800 space-y-1.5">
          <strong className="text-amber-300 uppercase tracking-wider block text-[11px]">Parcel</strong>
          <div className="max-h-24 overflow-y-auto pr-1 space-y-1">
            {order.items.map((it) => (
              <div key={it.product.id} className="flex justify-between text-emerald-200">
                <span className="line-clamp-1">{it.product.name} × {it.quantity}</span>
                <span className="text-amber-200 font-bold">₹{it.product.price * it.quantity}</span>
              </div>
            ))}
          </div>
          <a
            href={`https://maps.google.com/maps?q=${order.address.latitude || ''},${order.address.longitude || ''}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-amber-200 bg-emerald-950/70 px-2.5 py-1 rounded-lg border border-emerald-700"
            data-testid={`navigate-${order.id}`}
          >
            <Navigation className="w-3.5 h-3.5" /> Navigate on Map
          </a>
        </div>
      </div>

      {children}
    </div>
  );

  // ---------- RENDER SECTIONS ----------
  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Rider header */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 border border-emerald-800 rounded-3xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-emerald-950 flex items-center justify-center shadow-lg">
            <Bike className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              {agent.name}
              <span className="text-[10px] bg-emerald-800 text-amber-300 px-2 py-0.5 rounded-full border border-emerald-700 font-mono">
                {agent.agentId}
              </span>
            </h2>
            <p className="text-xs text-emerald-300 flex items-center gap-2">
              <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400" /> {agent.rating}</span>
              • {agent.vehicle} ({agent.vehicleNumber}) • {agent.zone}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={<Truck className="w-5 h-5" />} label="Active Jobs" value={String(activeDeliveries.length)} />
        <StatCard icon={<Package className="w-5 h-5" />} label="Available" value={String(availableJobs.length)} />
        <StatCard icon={<Wallet className="w-5 h-5" />} label="Earned Today" value={`₹${todayEarnings}`} accent="text-emerald-300" />
        <StatCard icon={<Banknote className="w-5 h-5" />} label="COD to Collect" value={`₹${codToCollect}`} accent="text-amber-300" />
      </div>

      {/* AVAILABLE JOBS */}
      {view === 'delivery-jobs' && (
        <div className="space-y-4">
          <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-400" /> Available Pickup Jobs
          </h3>
          {availableJobs.length === 0 ? (
            <EmptyState text="No pickup jobs right now. New dispatched orders from sellers will appear here." />
          ) : (
            availableJobs.map((order) => (
              <OrderCard key={order.id} order={order}>
                <button
                  onClick={() => handleAcceptJob(order)}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-emerald-950 font-black py-2.5 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-lg transition-all active:scale-95"
                  data-testid={`accept-job-${order.id}`}
                >
                  <CheckCircle2 className="w-4 h-4" /> Accept This Delivery
                </button>
              </OrderCard>
            ))
          )}
        </div>
      )}

      {/* ACTIVE DELIVERIES (overview default) */}
      {view === 'delivery' && (
        <div className="space-y-4">
          <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-amber-400" /> My Active Deliveries
          </h3>
          {activeDeliveries.length === 0 ? (
            <EmptyState text="No active deliveries. Grab a job from the 'Available Jobs' tab to get started." />
          ) : (
            activeDeliveries.map((order) => (
              <OrderCard key={order.id} order={order}>
                <div className="flex flex-wrap gap-2">
                  {order.deliveryStage === 'Assigned' && (
                    <button
                      onClick={() => handlePickedUp(order)}
                      className="flex-1 min-w-[140px] bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-md"
                      data-testid={`pickup-${order.id}`}
                    >
                      <Package className="w-4 h-4" /> Picked Up from Farm
                    </button>
                  )}
                  {order.deliveryStage === 'Picked Up' && (
                    <button
                      onClick={() => handleArrived(order)}
                      className="flex-1 min-w-[140px] bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold py-2.5 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-md"
                      data-testid={`arrived-${order.id}`}
                    >
                      <Navigation className="w-4 h-4" /> Arrived at Customer
                    </button>
                  )}
                  {order.deliveryStage === 'Arrived' && (
                    <button
                      onClick={() => openVerify(order)}
                      className="flex-1 min-w-[140px] bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black py-2.5 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-md"
                      data-testid={`verify-${order.id}`}
                    >
                      <ScanLine className="w-4 h-4" />
                      {order.paymentMethod === 'COD' ? `Collect ₹${order.grandTotal} & Verify` : 'Verify Handover OTP'}
                    </button>
                  )}
                </div>
                {order.paymentMethod === 'COD' && (
                  <div className="bg-amber-950/50 border border-amber-800/60 rounded-2xl p-3 text-[11px] text-amber-200 flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-amber-400 shrink-0" />
                    Cash on Delivery — collect <strong className="text-white">₹{order.grandTotal}</strong>. Ask customer to show their QR/OTP; enter it to confirm both delivery and payment.
                  </div>
                )}
              </OrderCard>
            ))
          )}
        </div>
      )}

      {/* HISTORY */}
      {view === 'delivery-history' && (
        <div className="space-y-4">
          <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" /> Completed Deliveries
          </h3>
          {history.length === 0 ? (
            <EmptyState text="No completed deliveries yet." />
          ) : (
            history.map((order) => (
              <OrderCard key={order.id} order={order}>
                <div className="bg-emerald-900/60 border border-emerald-700 rounded-2xl p-3 text-xs text-emerald-200 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Delivered & Verified
                  </span>
                  <span className="font-bold text-white">
                    {order.paymentMethod === 'COD' ? `₹${order.grandTotal} collected` : 'Prepaid'}
                  </span>
                </div>
              </OrderCard>
            ))
          )}
        </div>
      )}

      {/* OTP VERIFICATION MODAL */}
      {verifyingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-emerald-950 border border-emerald-700/80 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl text-emerald-100">
            <div className="bg-gradient-to-r from-emerald-900 to-teal-900 p-5 border-b border-emerald-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/20 rounded-xl border border-amber-500/30 text-amber-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">Verify Handover • {verifyingOrder.id}</h3>
                  <p className="text-[11px] text-emerald-300">Enter the customer's 6-digit OTP to complete delivery</p>
                </div>
              </div>
              <button onClick={() => setVerifyingOrder(null)} className="p-1.5 text-emerald-400 hover:text-white rounded-lg hover:bg-emerald-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleVerifyComplete} className="p-6 space-y-4 text-xs">
              {verifyingOrder.paymentMethod === 'COD' && (
                <div className="bg-amber-950/60 border border-amber-700/60 rounded-2xl p-3 text-amber-200 flex items-center gap-2 text-[11px]">
                  <Banknote className="w-4 h-4 text-amber-400 shrink-0" />
                  Collect <strong className="text-white">₹{verifyingOrder.grandTotal}</strong> in cash/UPI before confirming.
                </div>
              )}

              <div className="text-center bg-emerald-900/40 border border-emerald-800 rounded-2xl p-3">
                <p className="text-[11px] text-emerald-300 mb-1 flex items-center justify-center gap-1">
                  <QrCode className="w-3.5 h-3.5 text-amber-400" /> Customer shows this — scan or read the code
                </p>
                <p className="text-[10px] text-emerald-400">The 6-digit OTP is embedded inside the QR</p>
              </div>

              {otpError && (
                <div className="bg-red-950/80 border border-red-800 text-red-200 p-2.5 rounded-xl text-[11px] font-semibold">
                  {otpError}
                </div>
              )}

              <div>
                <label className="block text-emerald-300 font-bold mb-1 flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" /> Delivery OTP
                </label>
                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  required
                  placeholder="6-digit code"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl px-3 py-3 text-white font-mono font-bold text-center tracking-[0.4em] text-lg focus:ring-2 focus:ring-amber-400"
                  data-testid="delivery-otp-input"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black py-3 rounded-2xl shadow-lg text-sm flex items-center justify-center gap-2"
                data-testid="confirm-delivery-btn"
              >
                <CheckCircle2 className="w-5 h-5" />
                {verifyingOrder.paymentMethod === 'COD' ? 'Confirm Payment & Delivery' : 'Confirm Delivery'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const EmptyState: React.FC<{ text: string }> = ({ text }) => (
  <div className="text-center py-16 bg-emerald-950/20 rounded-3xl border border-emerald-800/40 p-8">
    <Bike className="w-12 h-12 text-emerald-700 mx-auto mb-3" />
    <p className="text-emerald-300 text-sm max-w-md mx-auto">{text}</p>
  </div>
);
