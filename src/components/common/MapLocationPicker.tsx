import React, { useState } from 'react';
import type { AddressDetails } from '../../types';
import { MapPin, Navigation, CheckCircle, Compass, Info, Search, Crosshair, Loader2 } from 'lucide-react';
import { calculateKmDistance } from '../../services/storage';

interface MapLocationPickerProps {
  initialAddress: AddressDetails;
  onSelectLocation: (updatedAddress: AddressDetails) => void;
  onClose: () => void;
}

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
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isLocatingGPS, setIsLocatingGPS] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Calculate real-time distance from coordinates to farm origin (12.9716, 77.5946)
  const distanceKm = calculateKmDistance(pinPosition.lat, pinPosition.lng);

  // 1. Detect device GPS precise location
  const handleDetectGPSLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocatingGPS(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const dist = calculateKmDistance(lat, lng);

        setPinPosition({ lat, lng });

        // Reverse geocode via OpenStreetMap Nominatim for precise street address
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          const data = await res.json();
          if (data && data.address) {
            const road = data.address.road || data.address.suburb || data.address.neighbourhood || 'GPS Precise Location';
            const city = data.address.city || data.address.town || data.address.county || 'Bengaluru';
            const pincode = data.address.postcode || (dist > 15 ? '560066' : dist > 5 ? '560102' : '560034');

            setAddressData((prev) => ({
              ...prev,
              streetAddress: `${road}, ${data.address.suburb || ''}`.replace(/^, /, ''),
              city,
              pincode,
              latitude: lat,
              longitude: lng,
              estimatedDistanceKm: dist,
            }));
          }
        } catch {
          setAddressData((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            estimatedDistanceKm: dist,
          }));
        } finally {
          setIsLocatingGPS(false);
        }
      },
      (err) => {
        setIsLocatingGPS(false);
        setGpsError(err.message || 'Unable to retrieve GPS location. Please allow location permissions.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // 2. Google Maps Geocoding Search
  const handleSearchLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setGpsError(null);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', Bengaluru')}`
      );
      const data = await res.json();

      if (data && data.length > 0) {
        const first = data[0];
        const lat = parseFloat(first.lat);
        const lng = parseFloat(first.lon);
        const dist = calculateKmDistance(lat, lng);

        let estimatedPincode = '560034';
        if (dist > 15) estimatedPincode = '560066';
        else if (dist > 5) estimatedPincode = '560102';

        setPinPosition({ lat, lng });
        setAddressData((prev) => ({
          ...prev,
          streetAddress: first.display_name.split(',')[0] || searchQuery,
          pincode: estimatedPincode,
          latitude: lat,
          longitude: lng,
          estimatedDistanceKm: dist,
        }));
      } else {
        setGpsError('Location not found. Try searching with landmark or pincode.');
      }
    } catch {
      setGpsError('Failed to search location. Check network connection.');
    } finally {
      setIsSearching(false);
    }
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

  const googleMapsEmbedUrl = `https://maps.google.com/maps?q=${pinPosition.lat},${pinPosition.lng}&z=16&output=embed`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-emerald-950 border border-emerald-700/80 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl text-emerald-100 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 p-5 border-b border-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-800/80 rounded-2xl border border-emerald-700 text-amber-400">
              <Compass className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
                Google Maps Precise Location Picker
              </h3>
              <p className="text-xs text-emerald-300">Live GPS pinpointing & exact farm distance calculation</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-emerald-400 hover:text-white rounded-lg hover:bg-emerald-800 text-lg font-bold">
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-xs">
          
          {/* SEARCH BAR & GPS LOCATE BUTTON */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Search Box */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search address, landmark, or street in Google Maps..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-emerald-900/60 border border-emerald-700/80 rounded-2xl pl-10 pr-24 py-2.5 text-white font-medium text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none"
                />
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400" />
                <button
                  type="button"
                  onClick={handleSearchLocation}
                  disabled={isSearching}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black px-3 py-1.5 rounded-xl text-[11px] flex items-center gap-1 transition-colors"
                >
                  {isSearching ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Search'}
                </button>
              </div>

              {/* GPS Button */}
              <button
                type="button"
                onClick={handleDetectGPSLocation}
                disabled={isLocatingGPS}
                className="bg-emerald-800 hover:bg-emerald-700 text-amber-300 font-bold px-3.5 py-2.5 rounded-2xl border border-emerald-600 flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-md"
                title="Detect current device GPS coordinates"
              >
                {isLocatingGPS ? (
                  <>
                    <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                    <span>Locating GPS...</span>
                  </>
                ) : (
                  <>
                    <Crosshair className="w-4 h-4 text-amber-400" />
                    <span>Locate Me (GPS)</span>
                  </>
                )}
              </button>
            </div>

            {gpsError && (
              <p className="text-red-400 font-medium text-[11px] bg-red-950/60 p-2 rounded-xl border border-red-800">
                {gpsError}
              </p>
            )}
          </div>

          {/* GOOGLE MAPS EMBED CONTAINER */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-amber-300 flex items-center gap-1">
                <MapPin className="w-4 h-4 text-amber-400" /> Google Maps Location View
              </span>
              <span className="bg-emerald-900 text-amber-300 font-extrabold px-3 py-1 rounded-full border border-emerald-700 flex items-center gap-1">
                <Navigation className="w-3 h-3 text-emerald-400" /> Distance: <strong className="text-white">{distanceKm} km</strong>
              </span>
            </div>

            {/* Google Map iframe */}
            <div className="relative h-64 w-full rounded-2xl overflow-hidden border-2 border-emerald-700/80 shadow-2xl bg-slate-900">
              <iframe
                title="Google Maps Location View"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src={googleMapsEmbedUrl}
                className="w-full h-full filter saturate-[1.1]"
              />

              <div className="absolute top-2 left-2 bg-emerald-950/90 text-amber-300 text-[10px] font-black px-2.5 py-1 rounded-full border border-emerald-700 backdrop-blur-md">
                🎯 Coordinates: {pinPosition.lat.toFixed(5)}, {pinPosition.lng.toFixed(5)}
              </div>
            </div>
          </div>

          {/* RECEIVER ADDRESS FIELDS */}
          <div className="space-y-3 pt-2 border-t border-emerald-800/80">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-emerald-300 mb-1 font-bold">Receiver Name</label>
                <input
                  type="text"
                  required
                  value={addressData.fullName}
                  onChange={(e) => setAddressData({ ...addressData, fullName: e.target.value })}
                  className="w-full bg-emerald-900/60 border border-emerald-700/80 rounded-xl px-3 py-2 text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-emerald-300 mb-1 font-bold">Contact Phone</label>
                <input
                  type="text"
                  required
                  value={addressData.phone}
                  onChange={(e) => setAddressData({ ...addressData, phone: e.target.value })}
                  className="w-full bg-emerald-900/60 border border-emerald-700/80 rounded-xl px-3 py-2 text-white font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-emerald-300 mb-1 font-bold">Street Address (Google Maps Auto-Filled)</label>
              <input
                type="text"
                required
                value={addressData.streetAddress}
                onChange={(e) => setAddressData({ ...addressData, streetAddress: e.target.value })}
                className="w-full bg-emerald-900/60 border border-emerald-700/80 rounded-xl px-3 py-2 text-white font-medium"
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
                  className="w-full bg-emerald-900/60 border border-emerald-700/80 rounded-xl px-3 py-2 text-white font-medium"
                />
              </div>
              <div>
                <label className="block text-emerald-300 mb-1 font-bold">Pincode</label>
                <input
                  type="text"
                  required
                  value={addressData.pincode}
                  onChange={(e) => setAddressData({ ...addressData, pincode: e.target.value })}
                  className="w-full bg-emerald-900/60 border border-emerald-700/80 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
            </div>
          </div>

          <div className="bg-emerald-900/60 p-3 rounded-xl border border-emerald-800 flex items-start gap-2 text-[11px] text-emerald-300">
            <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p>
              Google Maps exact coordinates ({pinPosition.lat.toFixed(4)}, {pinPosition.lng.toFixed(4)}) pinpoint distance ({distanceKm} km) to enforce cold-chain farm delivery limits.
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
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-emerald-950 font-black px-6 py-2.5 rounded-xl shadow-lg flex items-center gap-1.5 text-xs transition-all"
            >
              <CheckCircle className="w-4 h-4" /> Confirm Google Maps Location
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
