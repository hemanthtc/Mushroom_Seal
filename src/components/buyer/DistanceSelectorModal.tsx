import React, { useState } from 'react';
import type { AddressDetails } from '../../types';
import { MapPin, Navigation, CheckCircle, Info, Compass } from 'lucide-react';
import { MapLocationPicker } from '../common/MapLocationPicker';

interface DistanceSelectorModalProps {
  address: AddressDetails;
  onSave: (address: AddressDetails) => void;
  onClose: () => void;
}

export const DistanceSelectorModal: React.FC<DistanceSelectorModalProps> = ({
  address,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState<AddressDetails>({ ...address });
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);

  const handleDistancePreset = (km: number, pincode: string) => {
    setFormData((prev) => ({
      ...prev,
      estimatedDistanceKm: km,
      pincode: pincode,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-emerald-950 border border-emerald-700/80 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-teal-900 p-6 border-b border-emerald-800 text-white flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-800/60 rounded-2xl border border-emerald-700">
              <MapPin className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-white">Delivery Distance & Address</h3>
              <p className="text-xs text-emerald-300">Set distance to calculate seller's quantity limits</p>
            </div>
          </div>
          <button onClick={onClose} className="text-emerald-400 hover:text-white font-bold text-lg">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-emerald-100">
          
          {/* Google Maps Interactive Picker Launcher Button */}
          <button
            type="button"
            onClick={() => setIsMapPickerOpen(true)}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-emerald-950 font-black p-3.5 rounded-2xl flex items-center justify-center gap-2 text-xs shadow-lg transition-all transform hover:-translate-y-0.5"
          >
            <Compass className="w-4 h-4" />
            <span>Open Google Maps Precise Location Picker</span>
          </button>

          {/* Quick Distance Presets */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
              <Navigation className="w-3.5 h-3.5" /> Quick Zone Presets (Simulation)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDistancePreset(3.2, '560034')}
                className={`p-3 rounded-2xl border text-center transition-all text-xs font-semibold ${
                  formData.estimatedDistanceKm <= 5
                    ? 'bg-emerald-800 border-amber-400 text-amber-300 shadow-md ring-1 ring-amber-400'
                    : 'bg-emerald-900/40 border-emerald-800 text-emerald-300 hover:bg-emerald-900'
                }`}
              >
                <span className="block font-black text-sm">Zone A</span>
                <span className="text-[11px]">3.2 km (Near)</span>
              </button>

              <button
                type="button"
                onClick={() => handleDistancePreset(9.5, '560102')}
                className={`p-3 rounded-2xl border text-center transition-all text-xs font-semibold ${
                  formData.estimatedDistanceKm > 5 && formData.estimatedDistanceKm <= 15
                    ? 'bg-emerald-800 border-amber-400 text-amber-300 shadow-md ring-1 ring-amber-400'
                    : 'bg-emerald-900/40 border-emerald-800 text-emerald-300 hover:bg-emerald-900'
                }`}
              >
                <span className="block font-black text-sm">Zone B</span>
                <span className="text-[11px]">9.5 km (Mid)</span>
              </button>

              <button
                type="button"
                onClick={() => handleDistancePreset(18.4, '560066')}
                className={`p-3 rounded-2xl border text-center transition-all text-xs font-semibold ${
                  formData.estimatedDistanceKm > 15
                    ? 'bg-emerald-800 border-amber-400 text-amber-300 shadow-md ring-1 ring-amber-400'
                    : 'bg-emerald-900/40 border-emerald-800 text-emerald-300 hover:bg-emerald-900'
                }`}
              >
                <span className="block font-black text-sm">Zone C</span>
                <span className="text-[11px]">18.4 km (Far)</span>
              </button>
            </div>
          </div>

          {/* Form fields */}
          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-emerald-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full bg-emerald-900/70 border border-emerald-700/60 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-emerald-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-emerald-900/70 border border-emerald-700/60 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-300 mb-1">Pincode</label>
                <input
                  type="text"
                  required
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full bg-emerald-900/70 border border-emerald-700/60 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-300 mb-1">Street Address</label>
              <input
                type="text"
                required
                value={formData.streetAddress}
                onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                className="w-full bg-emerald-900/70 border border-emerald-700/60 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-amber-300">Custom Distance (km)</label>
                <span className="text-xs text-amber-300 font-extrabold">{formData.estimatedDistanceKm} km</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="0.5"
                value={formData.estimatedDistanceKm}
                onChange={(e) => setFormData({ ...formData, estimatedDistanceKm: parseFloat(e.target.value) })}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>
          </div>

          <div className="bg-emerald-900/60 p-3 rounded-xl border border-emerald-800 flex items-start gap-2 text-[11px] text-emerald-300">
            <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p>
              Distance directly determines buying limit rules per perishable product set by local mushroom & veggie farmers.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-emerald-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold px-5 py-2.5 rounded-xl shadow-lg text-xs flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" /> Save Address & Distance
            </button>
          </div>
        </form>

        {/* Google Maps Location Picker Submodal */}
        {isMapPickerOpen && (
          <MapLocationPicker
            initialAddress={formData}
            onSelectLocation={(updated) => {
              setFormData(updated);
              onSave(updated);
              setIsMapPickerOpen(false);
              onClose();
            }}
            onClose={() => setIsMapPickerOpen(false)}
          />
        )}
      </div>
    </div>
  );
};
