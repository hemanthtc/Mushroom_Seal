import React, { useState } from 'react';
import type { SellerProfile, Product, Order, AddressDetails } from '../../types';
import { 
  Store, 
  MapPin, 
  ShieldCheck, 
  Phone, 
  Mail, 
  Star, 
  Check, 
  X,
  PackageCheck,
  DollarSign,
  LogOut,
  Compass,
  CheckCircle2,
  Sliders,
  AlertTriangle
} from 'lucide-react';
import { MapLocationPicker } from '../common/MapLocationPicker';

interface SellerAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellerProfile: SellerProfile;
  onSaveSellerProfile: (profile: SellerProfile) => void;
  products: Product[];
  orders: Order[];
  onLogout?: () => void;
  onDeleteAccount?: () => void;
}

export const SellerAccountModal: React.FC<SellerAccountModalProps> = ({
  isOpen,
  onClose,
  sellerProfile,
  onSaveSellerProfile,
  products,
  orders,
  onLogout,
  onDeleteAccount,
}) => {
  const [formData, setFormData] = useState<SellerProfile>({ ...sellerProfile });
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [maxDeliveryRadius, setMaxDeliveryRadius] = useState<number>(25);

  if (!isOpen) return null;

  const totalRevenue = orders.filter((o) => o.status !== 'Cancelled').reduce((sum, o) => sum + o.grandTotal, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSellerProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleSelectMapLocation = (updatedAddress: AddressDetails) => {
    setFormData((prev) => ({
      ...prev,
      farmAddress: updatedAddress.fullGoogleAddress || updatedAddress.streetAddress || prev.farmAddress,
      latitude: updatedAddress.latitude || prev.latitude || 12.9716,
      longitude: updatedAddress.longitude || prev.longitude || 77.5946,
    }));
    setIsMapPickerOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-emerald-950 border border-emerald-700/80 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl text-emerald-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 p-5 border-b border-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-800/80 rounded-2xl border border-emerald-700 text-amber-400">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-lg text-white">{formData.farmName}</h2>
                <span className="bg-amber-500 text-emerald-950 text-[10px] font-black px-2 py-0.5 rounded-full font-mono">
                  {formData.sellerId}
                </span>
              </div>
              <p className="text-xs text-emerald-300">Farmer Vendor Account • Farm Distance & Location Setup</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onLogout && (
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="flex items-center gap-1.5 bg-red-950/80 hover:bg-red-900 text-red-300 hover:text-red-100 font-bold px-3 py-1.5 rounded-xl border border-red-800/80 text-xs transition-colors shadow-sm"
                title="Log out of seller account"
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

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          
          {/* Key Metrics Header */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-emerald-900/40 p-3 rounded-2xl border border-emerald-800 space-y-0.5">
              <DollarSign className="w-4 h-4 text-amber-400 mx-auto" />
              <span className="text-[10px] text-emerald-300 block">Total Revenue</span>
              <strong className="text-sm text-white font-extrabold">₹{totalRevenue.toLocaleString()}</strong>
            </div>

            <div className="bg-emerald-900/40 p-3 rounded-2xl border border-emerald-800 space-y-0.5">
              <PackageCheck className="w-4 h-4 text-emerald-400 mx-auto" />
              <span className="text-[10px] text-emerald-300 block">Active Listings</span>
              <strong className="text-sm text-white font-extrabold">{products.length} Products</strong>
            </div>

            <div className="bg-emerald-900/40 p-3 rounded-2xl border border-emerald-800 space-y-0.5">
              <Star className="w-4 h-4 text-amber-400 mx-auto fill-amber-400" />
              <span className="text-[10px] text-emerald-300 block">Farm Rating</span>
              <strong className="text-sm text-amber-300 font-extrabold">{formData.rating} / 5.0</strong>
            </div>
          </div>

          {/* 1. OPEN GOOGLE MAPS PRECISE LOCATION PICKER BUTTON */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsMapPickerOpen(true)}
              className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-emerald-950 font-black py-3 px-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 text-xs transition-all transform hover:-translate-y-0.5"
            >
              <Compass className="w-4 h-4 text-emerald-950 animate-spin-slow" />
              <span>Open Google Maps Precise Location Picker</span>
            </button>
          </div>

          {/* 3. FARM & OWNER DETAILS */}
          <div className="space-y-3 pt-2 border-t border-emerald-800/80">
            <div>
              <label className="block text-emerald-300 font-bold mb-1">Farm Name</label>
              <input
                type="text"
                required
                value={formData.farmName}
                onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
                className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl px-3 py-2 text-white font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-emerald-300 font-bold mb-1">Owner Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl px-3 py-2 text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-emerald-300 font-bold mb-1">Merchant ID</label>
                <input
                  type="text"
                  readOnly
                  value={formData.sellerId}
                  className="w-full bg-emerald-950 border border-emerald-800 rounded-xl px-3 py-2 text-amber-300 font-mono font-bold cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-emerald-300 font-bold mb-1">Contact Phone</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl pl-9 pr-3 py-2 text-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-emerald-300 mb-1 font-bold">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl pl-9 pr-3 py-2 text-white font-medium"
                  />
                </div>
              </div>
            </div>

            {/* 4. FARM LOCATION STREET ADDRESS */}
            <div>
              <label className="block text-emerald-300 font-bold mb-1">Farm Location Address (Google Auto-Filled)</label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
                <input
                  type="text"
                  required
                  value={formData.farmAddress}
                  onChange={(e) => setFormData({ ...formData, farmAddress: e.target.value })}
                  className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl pl-9 pr-3 py-2 text-white font-medium"
                />
              </div>
            </div>

            {/* 5. CUSTOM DISTANCE SLIDER */}
            <div>
              <div className="flex justify-between items-center mb-1 font-bold">
                <label className="text-emerald-300 flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" /> Max Delivery Distance Coverage (km)
                </label>
                <span className="text-amber-300 font-extrabold text-xs">{maxDeliveryRadius} km</span>
              </div>
              <input
                type="range"
                min={1}
                max={50}
                value={maxDeliveryRadius}
                onChange={(e) => setMaxDeliveryRadius(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer h-2 bg-emerald-900 rounded-lg"
              />
            </div>

            <div className="bg-emerald-900/40 p-3.5 rounded-2xl border border-emerald-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-300 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> Organic Certification Number
                </span>
                <span className="bg-emerald-800 text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-600">
                  VERIFIED
                </span>
              </div>
              <input
                type="text"
                required
                value={formData.organicCertNo}
                onChange={(e) => setFormData({ ...formData, organicCertNo: e.target.value })}
                className="w-full bg-emerald-950 border border-emerald-700 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
          </div>

          {/* Danger Zone: Delete Seller Account */}
          {onDeleteAccount && (
            <div className="pt-3 border-t border-red-900/60 space-y-2">
              <label className="block text-red-400 font-extrabold uppercase tracking-wider text-[11px] flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" /> Danger Zone
              </label>
              <div className="bg-red-950/40 p-3 rounded-2xl border border-red-800/80 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-xs text-white">Delete Seller Account</h4>
                  <p className="text-[10px] text-red-300">Permanently delete your farm profile, listings, and rider assignments.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="bg-red-600 hover:bg-red-500 text-white font-extrabold px-3.5 py-1.5 rounded-xl text-xs shadow transition-all"
                >
                  Delete Account
                </button>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-emerald-800">
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
                <span>Log Out Vendor</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-3">
              {savedSuccess && (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Check className="w-4 h-4" /> Farm Profile Saved!
                </span>
              )}

              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold px-6 py-2.5 rounded-xl shadow-lg flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Save Address & Distance
              </button>
            </div>
          </div>

        </form>

        {/* Map Location Picker Submodal for Sellers */}
        {isMapPickerOpen && (
          <MapLocationPicker
            initialAddress={{
              fullName: formData.ownerName,
              phone: formData.phone,
              streetAddress: formData.farmAddress,
              city: 'Bengaluru',
              pincode: '560035',
              estimatedDistanceKm: 0,
              latitude: formData.latitude || 12.9716,
              longitude: formData.longitude || 77.53732,
            }}
            onSelectLocation={handleSelectMapLocation}
            onClose={() => setIsMapPickerOpen(false)}
          />
        )}

        {/* DELETE ACCOUNT CONFIRMATION MODAL */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-emerald-950 border border-red-700/80 rounded-3xl max-w-md w-full p-6 text-emerald-100 space-y-4 shadow-2xl">
              <div className="flex items-center gap-3 text-red-400">
                <div className="p-3 bg-red-950 rounded-2xl border border-red-800">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-white">Delete Seller Account Permanently?</h3>
                  <p className="text-xs text-red-300">This action cannot be undone.</p>
                </div>
              </div>

              <p className="text-xs text-emerald-200 leading-relaxed bg-emerald-900/40 p-3.5 rounded-2xl border border-emerald-800">
                Deleting your vendor account will permanently erase your farm profile, products, delivery riders, and terminate your active seller session.
              </p>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2.5 font-bold text-emerald-300 hover:text-white text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    if (onDeleteAccount) onDeleteAccount();
                  }}
                  className="bg-red-600 hover:bg-red-500 text-white font-extrabold px-5 py-2.5 rounded-2xl text-xs shadow-lg transition-all"
                >
                  Confirm Delete Seller Account
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
