import React, { useState } from 'react';
import type { UserProfile, AddressDetails, Order } from '../../types';
import { 
  User, 
  Package, 
  Phone, 
  Mail, 
  Trash2, 
  Check, 
  X, 
  Compass,
  DollarSign,
  LogOut,
  Edit3,
  CheckCircle2
} from 'lucide-react';
import { MapLocationPicker } from '../common/MapLocationPicker';

interface BuyerAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  orders: Order[];
  onSelectActiveAddress: (address: AddressDetails) => void;
  onLogout?: () => void;
}

export const BuyerAccountModal: React.FC<BuyerAccountModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSaveProfile,
  orders,
  onSelectActiveAddress,
  onLogout,
}) => {
  const [profileData, setProfileData] = useState<UserProfile>({ ...userProfile });
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'addresses' | 'stats'>('profile');
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [editingAddressIndex, setEditingAddressIndex] = useState<number | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeDetailCard, setActiveDetailCard] = useState<'orders' | 'spend' | null>(null);

  if (!isOpen) return null;

  const totalSpent = orders.filter((o) => o.status !== 'Cancelled').reduce((sum, o) => sum + o.grandTotal, 0);

  // Active address index: If only 1 address exists, default to 0; otherwise use defaultAddressIndex or 0
  const activeAddressIndex = profileData.savedAddresses.length === 1 
    ? 0 
    : (profileData.defaultAddressIndex >= 0 && profileData.defaultAddressIndex < profileData.savedAddresses.length 
        ? profileData.defaultAddressIndex 
        : 0);

  const handleSaveProfileForm = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(profileData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleSetActiveAddress = (index: number) => {
    const targetAddr = profileData.savedAddresses[index];
    if (!targetAddr) return;

    const updatedProfile = {
      ...profileData,
      defaultAddressIndex: index,
    };
    setProfileData(updatedProfile);
    onSaveProfile(updatedProfile);
    onSelectActiveAddress(targetAddr);
  };

  const handleSaveMapAddress = (savedAddress: AddressDetails) => {
    let updatedAddresses: AddressDetails[];
    let newDefaultIndex = activeAddressIndex;

    if (editingAddressIndex !== null && editingAddressIndex < profileData.savedAddresses.length) {
      // Edit existing address
      updatedAddresses = [...profileData.savedAddresses];
      updatedAddresses[editingAddressIndex] = savedAddress;
    } else {
      // Add new address - automatically select newly added address as active!
      updatedAddresses = [...profileData.savedAddresses, savedAddress];
      newDefaultIndex = updatedAddresses.length - 1;
    }

    const updatedProfile = {
      ...profileData,
      savedAddresses: updatedAddresses,
      defaultAddressIndex: newDefaultIndex,
    };

    setProfileData(updatedProfile);
    onSaveProfile(updatedProfile);
    onSelectActiveAddress(savedAddress);
    setIsMapPickerOpen(false);
    setEditingAddressIndex(null);
  };

  const handleDeleteAddress = (index: number) => {
    const updated = profileData.savedAddresses.filter((_, i) => i !== index);
    const newDefaultIndex = updated.length <= 1 ? 0 : (index === activeAddressIndex ? 0 : (index < activeAddressIndex ? activeAddressIndex - 1 : activeAddressIndex));
    
    const updatedProfile = {
      ...profileData,
      savedAddresses: updated,
      defaultAddressIndex: newDefaultIndex,
    };
    setProfileData(updatedProfile);
    onSaveProfile(updatedProfile);

    if (updated.length > 0) {
      onSelectActiveAddress(updated[newDefaultIndex] || updated[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-emerald-950 border border-emerald-700/80 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl text-emerald-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 p-5 border-b border-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-800/80 rounded-2xl border border-emerald-700 text-amber-400">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg text-white">Buyer Account & Saved Locations</h2>
              <p className="text-xs text-emerald-300">{profileData.name} • {profileData.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onLogout && (
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="flex items-center gap-1.5 bg-red-950/80 hover:bg-red-900 text-red-300 hover:text-red-100 font-bold px-3 py-1.5 rounded-xl border border-red-800/80 text-xs transition-colors shadow-sm"
                title="Log out of buyer account"
              >
                <LogOut className="w-3.5 h-3.5 text-red-400" />
                <span>Log Out</span>
              </button>
            )}
            <button onClick={onClose} className="p-1.5 text-emerald-400 hover:text-white rounded-lg hover:bg-emerald-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-emerald-900/50 p-2 border-b border-emerald-800/60 flex items-center gap-2 text-xs">
          <button
            onClick={() => setActiveSubTab('profile')}
            className={`flex-1 py-2 rounded-xl font-bold transition-all ${
              activeSubTab === 'profile'
                ? 'bg-amber-500 text-emerald-950 shadow-md'
                : 'text-emerald-300 hover:text-white hover:bg-emerald-800/50'
            }`}
          >
            My Profile
          </button>

          <button
            onClick={() => setActiveSubTab('addresses')}
            className={`flex-1 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1 ${
              activeSubTab === 'addresses'
                ? 'bg-amber-500 text-emerald-950 shadow-md'
                : 'text-emerald-300 hover:text-white hover:bg-emerald-800/50'
            }`}
          >
            Saved Addresses ({profileData.savedAddresses.length})
          </button>

          <button
            onClick={() => setActiveSubTab('stats')}
            className={`flex-1 py-2 rounded-xl font-bold transition-all ${
              activeSubTab === 'stats'
                ? 'bg-amber-500 text-emerald-950 shadow-md'
                : 'text-emerald-300 hover:text-white hover:bg-emerald-800/50'
            }`}
          >
            Order Activity
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          
          {/* PROFILE SUBTAB */}
          {activeSubTab === 'profile' && (
            <form onSubmit={handleSaveProfileForm} className="space-y-4">
              <div>
                <label className="block text-emerald-300 font-bold mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                  <input
                    type="text"
                    required
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl pl-9 pr-3 py-2 text-white font-medium focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-emerald-300 font-bold mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
                    <input
                      type="text"
                      required
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl pl-9 pr-3 py-2 text-white font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-emerald-300 font-bold mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                    <input
                      type="email"
                      required
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl pl-9 pr-3 py-2 text-white font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-emerald-800/80">
                {onLogout ? (
                  <button
                    type="button"
                    onClick={() => {
                      onLogout();
                      onClose();
                    }}
                    className="flex items-center gap-1.5 bg-red-950/80 hover:bg-red-900 text-red-300 hover:text-red-100 font-bold px-4 py-2 rounded-xl border border-red-800 text-xs transition-colors shadow-md"
                  >
                    <LogOut className="w-4 h-4 text-red-400" />
                    <span>Log Out Account</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-3">
                  {savedSuccess && (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-4 h-4" /> Profile Updated!
                    </span>
                  )}

                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold px-5 py-2.5 rounded-xl shadow-lg"
                  >
                    Save Profile
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* ADDRESSES SUBTAB */}
          {activeSubTab === 'addresses' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-amber-300 uppercase tracking-wider">Saved Addresses</h4>
                <button
                  onClick={() => {
                    setEditingAddressIndex(null);
                    setIsMapPickerOpen(true);
                  }}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-emerald-950 font-extrabold px-3 py-1.5 rounded-xl flex items-center gap-1 text-xs shadow-md"
                >
                  <Compass className="w-3.5 h-3.5" /> + Add via Map Picker
                </button>
              </div>

              {profileData.savedAddresses.length === 0 ? (
                <p className="text-emerald-400 text-center py-6">No saved addresses. Add one via the Map Location Picker!</p>
              ) : (
                <div className="space-y-2">
                  {profileData.savedAddresses.map((addr, idx) => (
                    <div
                      key={idx}
                      className={`bg-emerald-900/40 p-3.5 rounded-2xl border flex justify-between items-center gap-3 transition-all ${
                        idx === activeAddressIndex
                          ? 'border-amber-400/90 ring-1 ring-amber-400/50'
                          : 'border-emerald-800'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <strong className="text-white text-sm">{addr.fullName}</strong>
                          <span className="bg-emerald-950 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-700">
                            {addr.estimatedDistanceKm} km to Farm
                          </span>
                        </div>
                        <p className="text-emerald-200">{addr.streetAddress}, {addr.city} - {addr.pincode}</p>
                        <p className="text-emerald-400 font-semibold">{addr.phone}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {idx === activeAddressIndex ? (
                          <div className="bg-amber-500 text-emerald-950 font-black px-3 py-1.5 rounded-xl text-[11px] flex items-center gap-1 shadow-sm">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-950" /> Active
                          </div>
                        ) : (
                          <button
                            onClick={() => handleSetActiveAddress(idx)}
                            className="bg-emerald-800 hover:bg-emerald-700 text-amber-300 font-bold px-3 py-1.5 rounded-xl text-[11px] flex items-center gap-1 transition-colors"
                          >
                            Set Active
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setEditingAddressIndex(idx);
                            setIsMapPickerOpen(true);
                          }}
                          className="text-amber-400 hover:text-amber-300 p-1.5 hover:bg-amber-950/60 rounded-xl transition-colors"
                          title="Edit Address"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteAddress(idx)}
                          className="text-red-400 hover:text-red-300 p-1.5 hover:bg-red-950/60 rounded-xl transition-colors"
                          title="Delete address"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STATS SUBTAB */}
          {activeSubTab === 'stats' && (
            <div className="space-y-4">
              {/* 2 CARDS GRID (DEFAULT PINCODE REMOVED) */}
              <div className="grid grid-cols-2 gap-3 text-center">
                
                {/* 1. TOTAL ORDERS CARD */}
                <div
                  onClick={() => setActiveDetailCard(activeDetailCard === 'orders' ? null : 'orders')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer select-none space-y-1 transform hover:-translate-y-0.5 shadow-md ${
                    activeDetailCard === 'orders'
                      ? 'bg-emerald-900 border-amber-400 ring-2 ring-amber-400/50'
                      : 'bg-emerald-900/40 hover:bg-emerald-900/60 border-emerald-800'
                  }`}
                >
                  <span className="text-[9px] bg-amber-500/20 text-amber-300 font-extrabold px-2 py-0.5 rounded-full border border-amber-400/40 inline-block mb-0.5">
                    💡 Click here for more details
                  </span>
                  <Package className="w-5 h-5 text-amber-400 mx-auto" />
                  <span className="text-[10px] text-emerald-300 font-bold block uppercase tracking-wider">Total Orders</span>
                  <strong className="text-xl text-white font-black">{orders.length}</strong>
                </div>

                {/* 2. TOTAL SPENT CARD */}
                <div
                  onClick={() => setActiveDetailCard(activeDetailCard === 'spend' ? null : 'spend')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer select-none space-y-1 transform hover:-translate-y-0.5 shadow-md ${
                    activeDetailCard === 'spend'
                      ? 'bg-emerald-900 border-amber-400 ring-2 ring-amber-400/50'
                      : 'bg-emerald-900/40 hover:bg-emerald-900/60 border-emerald-800'
                  }`}
                >
                  <span className="text-[9px] bg-amber-500/20 text-amber-300 font-extrabold px-2 py-0.5 rounded-full border border-amber-400/40 inline-block mb-0.5">
                    💡 Click here for more details
                  </span>
                  <DollarSign className="w-5 h-5 text-emerald-400 mx-auto" />
                  <span className="text-[10px] text-emerald-300 font-bold block uppercase tracking-wider">Total Spent</span>
                  <strong className="text-xl text-amber-300 font-black">₹{totalSpent}</strong>
                </div>

              </div>

              {/* DYNAMIC CARD DETAIL BREAKDOWN PANELS */}
              {activeDetailCard === 'orders' && (
                <div className="bg-emerald-900/40 p-4 rounded-2xl border border-emerald-800/90 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-emerald-800 pb-2">
                    <h4 className="font-extrabold text-amber-300 flex items-center gap-1.5 text-xs">
                      <Package className="w-4 h-4 text-amber-400" /> Order Tracking & History ({orders.length})
                    </h4>
                    <button 
                      onClick={() => setActiveDetailCard(null)}
                      className="text-[10px] bg-emerald-800 hover:bg-emerald-700 text-emerald-200 font-bold px-2 py-0.5 rounded-lg"
                    >
                      Close ✕
                    </button>
                  </div>

                  {orders.length === 0 ? (
                    <p className="text-emerald-300 text-xs text-center py-2">No order history available yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {orders.map((o) => (
                        <div key={o.id} className="bg-emerald-950/80 p-3 rounded-xl border border-emerald-800 flex justify-between items-center gap-2">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-white text-xs">Order #{o.id}</span>
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-emerald-900 text-emerald-300 border border-emerald-700">
                                {o.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-emerald-200">
                              {o.items.map(i => `${i.product.name} (x${i.quantity})`).join(', ')}
                            </p>
                          </div>
                          <span className="text-xs font-black text-amber-300 shrink-0">₹{o.grandTotal}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeDetailCard === 'spend' && (
                <div className="bg-emerald-900/40 p-4 rounded-2xl border border-emerald-800/90 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-emerald-800 pb-2">
                    <h4 className="font-extrabold text-amber-300 flex items-center gap-1.5 text-xs">
                      <DollarSign className="w-4 h-4 text-emerald-400" /> Monthly Spending Details
                    </h4>
                    <button 
                      onClick={() => setActiveDetailCard(null)}
                      className="text-[10px] bg-emerald-800 hover:bg-emerald-700 text-emerald-200 font-bold px-2 py-0.5 rounded-lg"
                    >
                      Close ✕
                    </button>
                  </div>

                  {orders.filter(o => o.status !== 'Cancelled').length === 0 ? (
                    <p className="text-emerald-300 text-xs text-center py-2">No spending data available yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {/* Monthly Summary Cards */}
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(
                          orders.filter(o => o.status !== 'Cancelled').reduce((acc, order) => {
                            const month = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                            acc[month] = (acc[month] || 0) + order.grandTotal;
                            return acc;
                          }, {} as Record<string, number>)
                        ).map(([monthName, monthTotal]) => (
                          <div key={monthName} className="bg-emerald-950 px-3 py-1 rounded-xl border border-emerald-700 text-[11px]">
                            <span className="text-emerald-300 font-bold">{monthName}: </span>
                            <strong className="text-amber-300 font-black">₹{monthTotal}</strong>
                          </div>
                        ))}
                      </div>

                      {/* Strict 3-Column Table: Order Name, Delivered Date, Amount */}
                      <div className="bg-emerald-950/80 rounded-xl border border-emerald-800 overflow-hidden">
                        <table className="w-full text-left text-[11px]">
                          <thead className="bg-emerald-900/80 text-amber-300 font-extrabold text-[9px] uppercase border-b border-emerald-800">
                            <tr>
                              <th className="px-3 py-2">Order Name</th>
                              <th className="px-3 py-2">Delivered Date</th>
                              <th className="px-3 py-2 text-right">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-emerald-800/60 text-emerald-100 font-medium">
                            {orders.filter(o => o.status !== 'Cancelled').map((o) => (
                              <tr key={o.id} className="hover:bg-emerald-900/40">
                                <td className="px-3 py-2 font-bold text-white">
                                  {o.items.map(i => i.product.name).join(', ')}
                                </td>
                                <td className="px-3 py-2 text-emerald-300">
                                  {new Date(o.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </td>
                                <td className="px-3 py-2 text-right font-black text-amber-300">
                                  ₹{o.grandTotal}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-emerald-900/30 p-4 rounded-2xl border border-emerald-800">
                <h4 className="font-bold text-amber-300 uppercase tracking-wider mb-2">Member Perks</h4>
                <ul className="space-y-1 text-emerald-200 text-xs list-disc list-inside">
                  <li>Direct cold-chain priority delivery from local organic growers.</li>
                  <li>Instant online Razorpay refund processing for order cancellations.</li>
                  <li>Dynamic distance-based quantity safeguards.</li>
                </ul>
              </div>
            </div>
          )}

        </div>

        {/* Map Location Picker Submodal */}
        {isMapPickerOpen && (
          <MapLocationPicker
            initialAddress={
              editingAddressIndex !== null && profileData.savedAddresses[editingAddressIndex]
                ? profileData.savedAddresses[editingAddressIndex]
                : {
                    fullName: profileData.name,
                    phone: profileData.phone,
                    streetAddress: '1st A Cross Rd, Basaveshwar Nagar',
                    city: 'Bengaluru',
                    pincode: '560079',
                    estimatedDistanceKm: 6.5,
                  }
            }
            onSelectLocation={handleSaveMapAddress}
            onClose={() => {
              setIsMapPickerOpen(false);
              setEditingAddressIndex(null);
            }}
          />
        )}

      </div>
    </div>
  );
};
