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
  Compass,
  DollarSign,
  LogOut,
  Sparkles,
  ShieldCheck,
  Building,
  CheckCircle2,
  Edit3,
  Lock
} from 'lucide-react';
import { MapLocationPicker } from '../common/MapLocationPicker';

interface BuyerProfileViewProps {
  userProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  orders: Order[];
  onSelectActiveAddress: (address: AddressDetails) => void;
  onLogout?: () => void;
}

export const BuyerProfileView: React.FC<BuyerProfileViewProps> = ({
  userProfile,
  onSaveProfile,
  orders,
  onSelectActiveAddress,
  onLogout,
}) => {
  const [profileData, setProfileData] = useState<UserProfile>({ ...userProfile });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'addresses' | 'stats'>('profile');
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const totalSpent = orders.filter((o) => o.status !== 'Cancelled').reduce((sum, o) => sum + o.grandTotal, 0);

  const handleSaveProfileForm = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(profileData);
    setIsEditingProfile(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleCancelEdit = () => {
    setProfileData({ ...userProfile });
    setIsEditingProfile(false);
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
    <div className="space-y-6 pb-16 animate-fade-in max-w-6xl mx-auto">
      
      {/* FULL INTERFACE PROFILE HEADER HERO */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white p-6 sm:p-8 shadow-2xl border border-emerald-800/80">
        <div className="absolute -right-12 -bottom-12 opacity-10 pointer-events-none">
          <User className="w-80 h-80 text-emerald-400" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-emerald-950 font-black text-2xl shadow-xl border-2 border-emerald-400/50 shrink-0">
              <User className="w-9 h-9 sm:w-11 sm:h-11" />
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {profileData.name}
                </h1>
                <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-amber-400/40">
                  <Sparkles className="w-3 h-3 text-amber-400" /> Customer Account
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-emerald-200">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-amber-400" /> {profileData.phone}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-emerald-400" /> {profileData.email}
                </span>
              </div>
            </div>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-2 bg-red-950/80 hover:bg-red-900 text-red-300 hover:text-red-100 font-bold px-4 py-2.5 rounded-2xl border border-red-800/80 text-xs transition-all shadow-lg"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              <span>Log Out Account</span>
            </button>
          )}
        </div>
      </div>

      {/* NAVIGATION TABS FOR FULL INTERFACE */}
      <div className="flex items-center gap-2 border-b border-emerald-800/60 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('profile')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold transition-all shadow-md ${
            activeSubTab === 'profile'
              ? 'bg-amber-500 text-emerald-950 ring-2 ring-amber-300'
              : 'bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/60 border border-emerald-800/60'
          }`}
        >
          <User className="w-4 h-4" /> Personal Information
        </button>

        <button
          onClick={() => setActiveSubTab('addresses')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold transition-all shadow-md ${
            activeSubTab === 'addresses'
              ? 'bg-amber-500 text-emerald-950 ring-2 ring-amber-300'
              : 'bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/60 border border-emerald-800/60'
          }`}
        >
          <MapPin className="w-4 h-4" /> Saved Delivery Addresses ({profileData.savedAddresses.length})
        </button>

        <button
          onClick={() => setActiveSubTab('stats')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold transition-all shadow-md ${
            activeSubTab === 'stats'
              ? 'bg-amber-500 text-emerald-950 ring-2 ring-amber-300'
              : 'bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/60 border border-emerald-800/60'
          }`}
        >
          <Package className="w-4 h-4" /> Order History & Stats
        </button>
      </div>

      {/* FULL PAGE SUBTAB CONTENTS */}
      
      {/* 1. PROFILE INFORMATION TAB */}
      {activeSubTab === 'profile' && (
        <div className="bg-emerald-950/60 border border-emerald-800/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          
          {/* Header with Edit Button */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-emerald-800/60 pb-4">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <User className="w-5 h-5 text-amber-400" /> Account Details & Preferences
              </h2>
              <p className="text-xs text-emerald-300 mt-1">
                {isEditingProfile
                  ? 'Editing account details. Note: Mobile number is locked as your primary OTP login credential.'
                  : 'View account details. Click Edit Profile to modify full name or email.'}
              </p>
            </div>

            {!isEditingProfile ? (
              <button
                type="button"
                onClick={() => setIsEditingProfile(true)}
                className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black px-4 py-2 rounded-2xl flex items-center gap-2 text-xs shadow-lg transition-all transform hover:-translate-y-0.5"
              >
                <Edit3 className="w-4 h-4" /> Edit Profile
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="bg-emerald-900 hover:bg-emerald-800 text-emerald-200 font-bold px-3.5 py-2 rounded-2xl border border-emerald-700 text-xs transition-colors"
              >
                Cancel Editing
              </button>
            )}
          </div>

          <form onSubmit={handleSaveProfileForm} className="space-y-6 max-w-2xl">
            
            {/* Full Name */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-emerald-300 font-bold text-xs">Full Name</label>
                {!isEditingProfile && (
                  <span className="text-[11px] text-emerald-400/70 italic flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-500" /> Read Only
                  </span>
                )}
              </div>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400" />
                <input
                  type="text"
                  required
                  disabled={!isEditingProfile}
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className={`w-full rounded-2xl pl-10 pr-4 py-3 font-medium text-sm transition-colors ${
                    isEditingProfile
                      ? 'bg-emerald-900/80 border-2 border-amber-400 text-white focus:outline-none'
                      : 'bg-emerald-900/30 border border-emerald-800/60 text-emerald-200/90 cursor-not-allowed'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Phone Number (ALWAYS LOCKED / READ-ONLY) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-emerald-300 font-bold text-xs">Phone Number (1-Click Login)</label>
                  <span className="text-[10px] bg-emerald-900/80 text-amber-300 font-extrabold px-2 py-0.5 rounded-full border border-emerald-700 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-400" /> Locked ID
                  </span>
                </div>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400" />
                  <input
                    type="text"
                    required
                    disabled={true}
                    value={profileData.phone}
                    className="w-full bg-emerald-900/30 border border-emerald-800/60 rounded-2xl pl-10 pr-4 py-3 text-emerald-300 font-medium text-sm cursor-not-allowed opacity-90"
                    title="Mobile number cannot be edited as it is bound to your OTP authentication"
                  />
                </div>
                <p className="text-[10px] text-emerald-400/80 mt-1">
                  Primary mobile number linked to OTP authentication. Cannot be modified.
                </p>
              </div>

              {/* Email Address */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-emerald-300 font-bold text-xs">Email Address</label>
                  {!isEditingProfile && (
                    <span className="text-[11px] text-emerald-400/70 italic flex items-center gap-1">
                      <Lock className="w-3 h-3 text-emerald-500" /> Read Only
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400" />
                  <input
                    type="email"
                    required
                    disabled={!isEditingProfile}
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className={`w-full rounded-2xl pl-10 pr-4 py-3 font-medium text-sm transition-colors ${
                      isEditingProfile
                        ? 'bg-emerald-900/80 border-2 border-amber-400 text-white focus:outline-none'
                        : 'bg-emerald-900/30 border border-emerald-800/60 text-emerald-200/90 cursor-not-allowed'
                    }`}
                  />
                </div>
              </div>

            </div>

            {/* Bottom Actions Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-emerald-800/80">
              {savedSuccess ? (
                <span className="text-emerald-400 font-extrabold flex items-center gap-1.5 text-xs animate-bounce">
                  <Check className="w-4 h-4 text-amber-400" /> Profile Changes Saved Successfully!
                </span>
              ) : (
                <span className="text-xs text-emerald-400/80">
                  {isEditingProfile ? 'Click Save to apply changes.' : 'Click "Edit Profile" above to modify details.'}
                </span>
              )}

              {isEditingProfile && (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-4 py-2.5 font-bold text-emerald-300 hover:text-white text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-emerald-950 font-black px-6 py-3 rounded-2xl shadow-xl text-sm transition-all transform hover:-translate-y-0.5"
                  >
                    Save Profile Changes
                  </button>
                </div>
              )}
            </div>

          </form>
        </div>
      )}

      {/* 2. SAVED ADDRESSES TAB */}
      {activeSubTab === 'addresses' && (
        <div className="bg-emerald-950/60 border border-emerald-800/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-emerald-800/60 pb-4">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-400" /> Saved Locations & Distance Calculation
              </h2>
              <p className="text-xs text-emerald-300 mt-1">
                Manage your delivery addresses and set your default location for real-time farm distance rules.
              </p>
            </div>

            <button
              onClick={() => setIsMapPickerOpen(true)}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-emerald-950 font-black px-4 py-2.5 rounded-2xl flex items-center gap-2 text-xs shadow-lg transform hover:-translate-y-0.5"
            >
              <Compass className="w-4 h-4" /> + Add New Address via Map Picker
            </button>
          </div>

          {profileData.savedAddresses.length === 0 ? (
            <div className="text-center py-12 bg-emerald-900/30 rounded-3xl border border-emerald-800/60 p-6">
              <MapPin className="w-12 h-12 text-amber-400 mx-auto mb-2 opacity-80" />
              <h3 className="text-base font-bold text-white">No saved delivery addresses</h3>
              <p className="text-xs text-emerald-300 mt-1">Use the interactive map picker above to pin your delivery spot!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profileData.savedAddresses.map((addr, idx) => (
                <div
                  key={idx}
                  className="bg-emerald-900/50 hover:bg-emerald-900/70 p-5 rounded-3xl border border-emerald-800/80 flex flex-col justify-between space-y-4 transition-all shadow-md"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <strong className="text-white text-base font-extrabold flex items-center gap-2">
                        <Building className="w-4 h-4 text-emerald-400" /> {addr.fullName}
                      </strong>
                      <span className="bg-emerald-950 text-amber-300 text-xs font-black px-2.5 py-1 rounded-full border border-emerald-700">
                        {addr.estimatedDistanceKm} km to Farm
                      </span>
                    </div>

                    <p className="text-xs text-emerald-200 leading-relaxed">
                      {addr.streetAddress}, {addr.city} - <strong className="text-white">{addr.pincode}</strong>
                    </p>
                    {addr.landmark && (
                      <p className="text-[11px] text-emerald-400 italic">Landmark: {addr.landmark}</p>
                    )}
                    <p className="text-xs text-amber-300 font-bold">{addr.phone}</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-emerald-800/60">
                    <button
                      onClick={() => onSelectActiveAddress(addr)}
                      className="bg-emerald-800 hover:bg-emerald-700 text-amber-300 hover:text-white font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Set Active Delivery Location
                    </button>

                    <button
                      onClick={() => handleDeleteAddress(idx)}
                      className="text-red-400 hover:text-red-300 p-2 hover:bg-red-950/60 rounded-xl transition-colors"
                      title="Remove Address"
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

      {/* 3. ORDER HISTORY & STATS TAB */}
      {activeSubTab === 'stats' && (
        <div className="bg-emerald-950/60 border border-emerald-800/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="border-b border-emerald-800/60 pb-4">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-400" /> Activity Metrics & Benefits
            </h2>
            <p className="text-xs text-emerald-300 mt-1">
              Overview of your customer account statistics and active organic farm membership perks.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-emerald-900/50 p-6 rounded-3xl border border-emerald-800/80 space-y-2 text-center">
              <Package className="w-8 h-8 text-amber-400 mx-auto" />
              <span className="text-xs text-emerald-300 font-bold block uppercase tracking-wider">Total Orders</span>
              <strong className="text-3xl text-white font-black">{orders.length}</strong>
            </div>

            <div className="bg-emerald-900/50 p-6 rounded-3xl border border-emerald-800/80 space-y-2 text-center">
              <DollarSign className="w-8 h-8 text-emerald-400 mx-auto" />
              <span className="text-xs text-emerald-300 font-bold block uppercase tracking-wider">Total Amount Spent</span>
              <strong className="text-3xl text-amber-300 font-black">₹{totalSpent}</strong>
            </div>

            <div className="bg-emerald-900/50 p-6 rounded-3xl border border-emerald-800/80 space-y-2 text-center">
              <MapPin className="w-8 h-8 text-purple-400 mx-auto" />
              <span className="text-xs text-emerald-300 font-bold block uppercase tracking-wider">Default Pincode</span>
              <strong className="text-xl text-white font-bold block">{profileData.savedAddresses[0]?.pincode || '560034'}</strong>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-900/80 to-teal-900/80 p-6 rounded-3xl border border-emerald-700/80 space-y-3">
            <h3 className="font-extrabold text-amber-300 text-sm uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Buyer Security & Freshness Guarantee
            </h3>
            <ul className="space-y-2 text-xs text-emerald-100">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Hyper-local cold-chain delivery calculated dynamically from Sarjapur Agro Belt.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Instant 100% Razorpay refund simulation when orders are cancelled before dispatch.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>7-Day persistent session storage across browser tabs for hassle-free shopping.</span>
              </li>
            </ul>
          </div>
        </div>
      )}

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
  );
};
