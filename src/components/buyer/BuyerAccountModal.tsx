import React, { useState } from 'react';
import type { UserProfile, AddressDetails, Order } from '../../types';
import { 
  User, 
  MapPin, 
  Package, 
  Phone, 
  Mail, 
  Trash2, 
  Check, 
  X, 
  Compass,
  DollarSign
} from 'lucide-react';
import { MapLocationPicker } from '../common/MapLocationPicker';

interface BuyerAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  orders: Order[];
  onSelectActiveAddress: (address: AddressDetails) => void;
}

export const BuyerAccountModal: React.FC<BuyerAccountModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSaveProfile,
  orders,
  onSelectActiveAddress,
}) => {
  const [profileData, setProfileData] = useState<UserProfile>({ ...userProfile });
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'addresses' | 'stats'>('profile');
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const totalSpent = orders.filter((o) => o.status !== 'Cancelled').reduce((sum, o) => sum + o.grandTotal, 0);

  const handleSaveProfileForm = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(profileData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleAddMapAddress = (newAddress: AddressDetails) => {
    const updatedAddresses = [...profileData.savedAddresses, newAddress];
    const updatedProfile = { ...profileData, savedAddresses: updatedAddresses };
    setProfileData(updatedProfile);
    onSaveProfile(updatedProfile);
    onSelectActiveAddress(newAddress);
  };

  const handleDeleteAddress = (index: number) => {
    const updated = profileData.savedAddresses.filter((_, i) => i !== index);
    const updatedProfile = {
      ...profileData,
      savedAddresses: updated,
      defaultAddressIndex: Math.max(0, profileData.defaultAddressIndex - 1),
    };
    setProfileData(updatedProfile);
    onSaveProfile(updatedProfile);
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
          <button onClick={onClose} className="p-1.5 text-emerald-400 hover:text-white rounded-lg hover:bg-emerald-800">
            <X className="w-5 h-5" />
          </button>
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

              <div className="flex items-center justify-between pt-2">
                {savedSuccess ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-4 h-4" /> Profile Updated!
                  </span>
                ) : <div />}

                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold px-5 py-2.5 rounded-xl shadow-lg"
                >
                  Save Profile
                </button>
              </div>
            </form>
          )}

          {/* ADDRESSES SUBTAB */}
          {activeSubTab === 'addresses' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-amber-300 uppercase tracking-wider">Saved Addresses</h4>
                <button
                  onClick={() => setIsMapPickerOpen(true)}
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
                      className="bg-emerald-900/40 p-3.5 rounded-2xl border border-emerald-800 flex justify-between items-center gap-3"
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
                        <button
                          onClick={() => {
                            onSelectActiveAddress(addr);
                            onClose();
                          }}
                          className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-[11px]"
                        >
                          Use This
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(idx)}
                          className="text-emerald-400 hover:text-red-400 p-1.5"
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
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-emerald-900/40 p-4 rounded-2xl border border-emerald-800 space-y-1">
                  <Package className="w-5 h-5 text-amber-400 mx-auto" />
                  <span className="text-[10px] text-emerald-300 block">Total Orders</span>
                  <strong className="text-xl text-white font-black">{orders.length}</strong>
                </div>

                <div className="bg-emerald-900/40 p-4 rounded-2xl border border-emerald-800 space-y-1">
                  <DollarSign className="w-5 h-5 text-emerald-400 mx-auto" />
                  <span className="text-[10px] text-emerald-300 block">Total Spent</span>
                  <strong className="text-xl text-amber-300 font-black">₹{totalSpent}</strong>
                </div>

                <div className="bg-emerald-900/40 p-4 rounded-2xl border border-emerald-800 space-y-1">
                  <MapPin className="w-5 h-5 text-purple-400 mx-auto" />
                  <span className="text-[10px] text-emerald-300 block">Active Address</span>
                  <strong className="text-xs text-white font-bold block truncate">{profileData.savedAddresses[0]?.pincode || '560034'}</strong>
                </div>
              </div>

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
            initialAddress={{
              fullName: profileData.name,
              phone: profileData.phone,
              streetAddress: 'Koramangala 4th Block',
              city: 'Bengaluru',
              pincode: '560034',
              estimatedDistanceKm: 3.5,
            }}
            onSelectLocation={handleAddMapAddress}
            onClose={() => setIsMapPickerOpen(false)}
          />
        )}

      </div>
    </div>
  );
};
