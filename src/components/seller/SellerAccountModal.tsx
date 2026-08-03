import React, { useState } from 'react';
import type { SellerProfile, Product, Order } from '../../types';
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
  DollarSign
} from 'lucide-react';

interface SellerAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellerProfile: SellerProfile;
  onSaveSellerProfile: (profile: SellerProfile) => void;
  products: Product[];
  orders: Order[];
}

export const SellerAccountModal: React.FC<SellerAccountModalProps> = ({
  isOpen,
  onClose,
  sellerProfile,
  onSaveSellerProfile,
  products,
  orders,
}) => {
  const [formData, setFormData] = useState<SellerProfile>({ ...sellerProfile });
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const totalRevenue = orders.filter((o) => o.status !== 'Cancelled').reduce((sum, o) => sum + o.grandTotal, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSellerProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
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
              <p className="text-xs text-emerald-300">Owner: {formData.ownerName} • Est. {formData.establishedYear}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-emerald-400 hover:text-white rounded-lg hover:bg-emerald-800">
            <X className="w-5 h-5" />
          </button>
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

          <div className="space-y-3 pt-2">
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

            <div>
              <label className="block text-emerald-300 font-bold mb-1">Farm Location Address</label>
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

          <div className="flex items-center justify-between pt-3 border-t border-emerald-800">
            {savedSuccess ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> Farm Profile Saved!
              </span>
            ) : <div />}

            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold px-6 py-2.5 rounded-xl shadow-lg"
            >
              Save Seller Profile
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
