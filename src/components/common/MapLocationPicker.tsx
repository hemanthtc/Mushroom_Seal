import React, { useState } from 'react';
import type { AddressDetails } from '../../types';
import { MapPin, Navigation, CheckCircle, Compass, Info } from 'lucide-react';
import { calculateKmDistance } from '../../services/storage';

interface MapLocationPickerProps {
  initialAddress: AddressDetails;
  onSelectLocation: (updatedAddress: AddressDetails) => void;
  onClose: () => void;
}

// Preset map landmark pin locations
const PRESET_MAP_LOCATIONS = [
  { name: 'Koramangala 4th Block', pincode: '560034', lat: 12.9352, lng: 77.6245, zone: 'Zone A (3.5 km)' },
  { name: 'HSR Layout Sector 1', pincode: '560102', lat: 12.9121, lng: 77.6445, zone: 'Zone B (7.8 km)' },
  { name: 'Whitefield Main Rd', pincode: '560066', lat: 12.9698, lng: 77.7499, zone: 'Zone C (16.4 km)' },
  { name: 'Indiranagar 100ft Rd', pincode: '560038', lat: 12.9784, lng: 77.6408, zone: 'Zone A (4.8 km)' },
];

export const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
  initialAddress,
  onSelectLocation,
  onClose,
}) => {
  const [pinPosition, setPinPosition] = useState<{ lat: number; lng: number }>({
    lat: initialAddress.latitude || 12.9352,
    lng: initialAddress.longitude || 77.6245,
  });

  const [addressData, setAddressData] = useState<AddressDetails>({ ...initialAddress });

  // Calculate distance whenever pin position updates
  const distanceKm = calculateKmDistance(pinPosition.lat, pinPosition.lng);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert pixel click (0..400) to latitude/longitude offsets around Bengaluru
    const newLat = 12.9716 - (y - 200) * 0.0008;
    const newLng = 77.5946 + (x - 200) * 0.0008;

    const newDist = calculateKmDistance(newLat, newLng);

    let estimatedPincode = '560034';
    if (newDist > 15) estimatedPincode = '560066';
    else if (newDist > 5) estimatedPincode = '560102';

    setPinPosition({ lat: newLat, lng: newLng });
    setAddressData((prev) => ({
      ...prev,
      latitude: newLat,
      longitude: newLng,
      estimatedDistanceKm: newDist,
      pincode: estimatedPincode,
    }));
  };

  const handleSelectPreset = (preset: typeof PRESET_MAP_LOCATIONS[0]) => {
    const newDist = calculateKmDistance(preset.lat, preset.lng);
    setPinPosition({ lat: preset.lat, lng: preset.lng });
    setAddressData((prev) => ({
      ...prev,
      streetAddress: preset.name,
      pincode: preset.pincode,
      estimatedDistanceKm: newDist,
      latitude: preset.lat,
      longitude: preset.lng,
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSelectLocation({
      ...addressData,
      latitude: pinPosition.lat,
      longitude: pinPosition.lng,
      estimatedDistanceKm: distanceKm,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-emerald-950 border border-emerald-700/80 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl text-emerald-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 p-5 border-b border-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-800/60 rounded-2xl border border-emerald-700">
              <Compass className="w-6 h-6 text-amber-400 animate-spin-slow" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white">Interactive Map Location Selector</h3>
              <p className="text-xs text-emerald-300">Click anywhere on the map to place pin & calculate farm distance</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-emerald-400 hover:text-white rounded-lg hover:bg-emerald-800">
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-xs">
          
          {/* Interactive Map Visual Area */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-amber-300 flex items-center gap-1">
                <MapPin className="w-4 h-4 text-amber-400" /> Click on Map to Drop Delivery Pin
              </span>
              <span className="bg-emerald-900 text-amber-300 font-extrabold px-3 py-1 rounded-full border border-emerald-700">
                Farm Distance: {distanceKm} km
              </span>
            </div>

            {/* Map Canvas Visual Simulation */}
            <div
              onClick={handleMapClick}
              className="relative h-64 w-full rounded-2xl overflow-hidden border-2 border-emerald-700/80 cursor-crosshair shadow-inner select-none bg-slate-900"
              style={{
                backgroundImage: `radial-gradient(circle, rgba(16,185,129,0.15) 1px, transparent 1px)`,
                backgroundSize: '24px 24px',
              }}
            >
              {/* Map background map grid styling */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/90 via-slate-900/95 to-teal-950/90" />

              {/* Local Farm Origin Pin */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-10">
                <div className="bg-amber-500 text-emerald-950 font-black text-[9px] px-2 py-0.5 rounded-full shadow-lg border border-white animate-pulse">
                  🌱 ShroomValley Farm Origin
                </div>
                <div className="w-3 h-3 bg-amber-400 rounded-full border-2 border-white shadow-md mt-0.5" />
              </div>

              {/* Concentric Distance Rings */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-emerald-500/30 pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-amber-500/20 pointer-events-none" />

              {/* User Selected Pin */}
              <div
                className="absolute flex flex-col items-center transition-all duration-300 transform -translate-x-1/2 -translate-y-full z-20"
                style={{
                  top: `${Math.min(90, Math.max(10, 50 + (12.9716 - pinPosition.lat) * 1250))}%`,
                  left: `${Math.min(90, Math.max(10, 50 + (pinPosition.lng - 77.5946) * 1250))}%`,
                }}
              >
                <div className="bg-emerald-600 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full shadow-2xl border border-amber-400 whitespace-nowrap flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-300" /> Delivery Target ({distanceKm} km)
                </div>
                <div className="w-4 h-4 bg-amber-400 rotate-45 transform border-2 border-emerald-950 -mt-1 shadow-md" />
              </div>

              <div className="absolute bottom-3 left-3 bg-emerald-950/90 text-emerald-300 text-[10px] px-2.5 py-1 rounded-lg border border-emerald-800 backdrop-blur-md">
                Coordinates: {pinPosition.lat.toFixed(4)}, {pinPosition.lng.toFixed(4)}
              </div>
            </div>
          </div>

          {/* Quick Landmark Presets */}
          <div className="space-y-2">
            <label className="block font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
              <Navigation className="w-3.5 h-3.5" /> Popular Bengaluru Delivery Landmarks
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRESET_MAP_LOCATIONS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className="bg-emerald-900/40 hover:bg-emerald-800 p-2.5 rounded-xl border border-emerald-800 text-left transition-all"
                >
                  <strong className="text-white block text-[11px] truncate">{preset.name}</strong>
                  <span className="text-[10px] text-amber-300 font-medium block">{preset.zone}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Location Fields */}
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-emerald-300 mb-1 font-bold">Receiver Name</label>
                <input
                  type="text"
                  required
                  value={addressData.fullName}
                  onChange={(e) => setAddressData({ ...addressData, fullName: e.target.value })}
                  className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl px-3 py-2 text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-emerald-300 mb-1 font-bold">Contact Phone</label>
                <input
                  type="text"
                  required
                  value={addressData.phone}
                  onChange={(e) => setAddressData({ ...addressData, phone: e.target.value })}
                  className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl px-3 py-2 text-white font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-emerald-300 mb-1 font-bold">Street Address (Auto-Filled from Map)</label>
              <input
                type="text"
                required
                value={addressData.streetAddress}
                onChange={(e) => setAddressData({ ...addressData, streetAddress: e.target.value })}
                className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl px-3 py-2 text-white font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-emerald-300 mb-1 font-bold">City</label>
                <input
                  type="text"
                  required
                  value={addressData.city}
                  onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                  className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl px-3 py-2 text-white font-medium"
                />
              </div>
              <div>
                <label className="block text-emerald-300 mb-1 font-bold">Pincode</label>
                <input
                  type="text"
                  required
                  value={addressData.pincode}
                  onChange={(e) => setAddressData({ ...addressData, pincode: e.target.value })}
                  className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
            </div>
          </div>

          <div className="bg-emerald-900/60 p-3 rounded-xl border border-emerald-800 flex items-start gap-2 text-[11px] text-emerald-300">
            <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p>
              Map coordinates pinpoint exact distance ({distanceKm} km) to enforce cold-chain farm delivery limits.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-bold text-emerald-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" /> Save Map Location
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
