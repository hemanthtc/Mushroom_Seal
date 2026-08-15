import React, { useState } from 'react';
import { Truck, MapPin, CheckCircle, Compass, Save, AlertCircle } from 'lucide-react';
import { getSellerProfile, saveSellerProfile } from '../../services/storage';

export const DistancePolicyConfig: React.FC = () => {
  const seller = getSellerProfile();
  
  const [farmPincode, setFarmPincode] = useState('560079');
  const [farmAddress, setFarmAddress] = useState(seller.farmAddress || 'Survey #42, Organic Agro Belt, Sarjapur Road, Bengaluru');
  const [tier1Max, setTier1Max] = useState(5);
  const [tier2Max, setTier2Max] = useState(15);
  const [baseDeliveryFee, setBaseDeliveryFee] = useState(30);
  const [perKmFee, setPerKmFee] = useState(5);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save seller profile update
    const updatedSeller = {
      ...seller,
      farmAddress,
    };
    saveSellerProfile(updatedSeller);

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 animate-fade-in">
      
      {/* SELLER HERO BANNER */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 p-6 sm:p-8 rounded-3xl border border-emerald-800 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <Truck className="w-64 h-64 text-emerald-400" />
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="p-3.5 bg-emerald-800/80 rounded-2xl border border-emerald-700 text-amber-400 shrink-0 shadow-lg">
            <Truck className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Seller Distance & Pincode Policy Manager
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200 mt-1">
              Seller Exclusive Control Panel: Configure origin farm location, delivery radius tiers, and distance calculation parameters.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-emerald-950/60 p-6 sm:p-8 rounded-3xl border border-emerald-800/80 shadow-2xl space-y-6 text-emerald-100">
        
        {/* 1. SELLER FARM ORIGIN & PINCODE CONFIGURATION */}
        <div className="space-y-4">
          <h3 className="font-black text-base text-amber-300 uppercase tracking-wider flex items-center gap-2 border-b border-emerald-800/60 pb-3">
            <MapPin className="w-5 h-5 text-amber-400" /> 1. Origin Farm Location & Service Pincode
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="sm:col-span-1">
              <label className="block text-emerald-300 font-bold text-xs mb-1.5">Origin Farm Pincode</label>
              <input
                type="text"
                required
                value={farmPincode}
                onChange={(e) => setFarmPincode(e.target.value)}
                placeholder="e.g. 560079"
                className="w-full bg-emerald-900/60 border border-emerald-700 rounded-2xl px-4 py-2.5 text-white font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <p className="text-[10px] text-emerald-400/80 mt-1">Primary farm location dispatch pincode</p>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-emerald-300 font-bold text-xs mb-1.5">Full Origin Farm Address</label>
              <input
                type="text"
                required
                value={farmAddress}
                onChange={(e) => setFarmAddress(e.target.value)}
                placeholder="Farm Survey No., Street Address, City"
                className="w-full bg-emerald-900/60 border border-emerald-700 rounded-2xl px-4 py-2.5 text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <p className="text-[10px] text-emerald-400/80 mt-1">Used to compute GPS kilometer distance for buyer orders</p>
            </div>

          </div>
        </div>

        {/* 2. DISTANCE RADIUS TIERS */}
        <div className="space-y-4 pt-4 border-t border-emerald-800/60">
          <h3 className="font-black text-base text-amber-300 uppercase tracking-wider flex items-center gap-2 border-b border-emerald-800/60 pb-3">
            <Compass className="w-5 h-5 text-amber-400" /> 2. Distance Radius Tiers & Limits
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="bg-emerald-900/50 p-5 rounded-2xl border border-emerald-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-white font-bold text-sm">Zone 1 (Near Farm)</label>
                <span className="bg-emerald-950 text-amber-400 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border border-emerald-700">0 - {tier1Max} km</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={tier1Max}
                  onChange={(e) => setTier1Max(Number(e.target.value))}
                  className="bg-emerald-950 border border-emerald-700 rounded-xl px-3 py-2 text-white font-mono w-24 text-center font-bold text-sm"
                />
                <span className="text-xs text-emerald-200">km from farm origin</span>
              </div>
              <p className="text-[11px] text-emerald-400/90 leading-relaxed">
                Fresh un-insulated harvest allowed up to max catalog limits. Direct 1-hour fast dispatch.
              </p>
            </div>

            <div className="bg-emerald-900/50 p-5 rounded-2xl border border-emerald-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-white font-bold text-sm">Zone 2 (Mid-Range Transit)</label>
                <span className="bg-emerald-950 text-amber-400 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border border-emerald-700">{tier1Max} - {tier2Max} km</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="11"
                  max="30"
                  value={tier2Max}
                  onChange={(e) => setTier2Max(Number(e.target.value))}
                  className="bg-emerald-950 border border-emerald-700 rounded-xl px-3 py-2 text-white font-mono w-24 text-center font-bold text-sm"
                />
                <span className="text-xs text-emerald-200">km maximum outer boundary</span>
              </div>
              <p className="text-[11px] text-emerald-400/90 leading-relaxed">
                Requires insulated thermal cold-pack packaging to prevent moisture loss.
              </p>
            </div>

          </div>
        </div>

        {/* 3. DISTANCE DELIVERY FEE FORMULA */}
        <div className="space-y-4 pt-4 border-t border-emerald-800/60">
          <h3 className="font-black text-base text-amber-300 uppercase tracking-wider flex items-center gap-2 border-b border-emerald-800/60 pb-3">
            <Truck className="w-5 h-5 text-amber-400" /> 3. Distance Delivery Pricing Formula
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="bg-emerald-900/50 p-4 rounded-2xl border border-emerald-800 space-y-2">
              <label className="block text-emerald-200 font-bold text-xs">Base Delivery Charge (₹)</label>
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-bold">₹</span>
                <input
                  type="number"
                  value={baseDeliveryFee}
                  onChange={(e) => setBaseDeliveryFee(Number(e.target.value))}
                  className="bg-emerald-950 border border-emerald-700 rounded-xl px-3 py-2 text-white font-mono w-28 font-bold text-sm"
                />
              </div>
            </div>

            <div className="bg-emerald-900/50 p-4 rounded-2xl border border-emerald-800 space-y-2">
              <label className="block text-emerald-200 font-bold text-xs">Per Kilometer Surcharge (₹/km)</label>
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-bold">₹</span>
                <input
                  type="number"
                  value={perKmFee}
                  onChange={(e) => setPerKmFee(Number(e.target.value))}
                  className="bg-emerald-950 border border-emerald-700 rounded-xl px-3 py-2 text-white font-mono w-28 font-bold text-sm"
                />
                <span className="text-xs text-emerald-300">/ km</span>
              </div>
            </div>

          </div>
        </div>

        {/* 4. PERISHABILITY WARNING & SAVING */}
        <div className="space-y-4 pt-4 border-t border-emerald-800/60">
          <div className="bg-amber-950/60 border border-amber-500/50 p-4 rounded-2xl flex items-start gap-3 text-xs">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-amber-200/90 leading-relaxed">
              Note: Distance adjustments are exclusively configurable by the Seller. Buyers will view calculated distances and delivery fees, but cannot alter farm origin location or zone parameters.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-emerald-800">
          {savedSuccess ? (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 animate-bounce">
              <CheckCircle className="w-4 h-4 text-amber-400" /> Seller Distance Policy Updated Successfully!
            </span>
          ) : (
            <span className="text-xs text-emerald-400/80">Click Save to apply new farm distance & pincode policy.</span>
          )}

          <button
            type="submit"
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-emerald-950 font-black px-6 py-3 rounded-2xl shadow-xl text-xs flex items-center gap-2 transition-transform transform hover:-translate-y-0.5"
          >
            <Save className="w-4 h-4" /> Save Seller Distance Policy
          </button>
        </div>

      </form>
    </div>
  );
};
