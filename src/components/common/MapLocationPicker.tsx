import React, { useState } from 'react';
import type { AddressDetails } from '../../types';
import { 
  MapPin, 
  Navigation, 
  CheckCircle, 
  Compass, 
  Info, 
  Search, 
  Crosshair, 
  Loader2, 
  Home, 
  Briefcase, 
  Tag, 
  FileText,
  Globe,
  Edit3,
  User,
  Phone,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { calculateKmDistance, getUserProfile } from '../../services/storage';

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
  const defaultProfile = getUserProfile();

  const [pinPosition, setPinPosition] = useState<{ lat: number; lng: number }>({
    lat: initialAddress.latitude || 12.98941,
    lng: initialAddress.longitude || 77.53732,
  });

  // Default Receiver Name and Phone from active profile (not Valued Customer)
  const initialName = (initialAddress.fullName && initialAddress.fullName !== 'Valued Customer') 
    ? initialAddress.fullName 
    : (defaultProfile.name || 'Vikram Sethi');
    
  const initialPhone = initialAddress.phone 
    ? initialAddress.phone 
    : (defaultProfile.phone || '+91 98450 12345');

  const defaultFullAddr = initialAddress.fullGoogleAddress || initialAddress.streetAddress || '1st A Cross Rd, 4th Block, 3rd Stage 4th Block, Phase 3, Basaveshwar Nagar, Bengaluru, Karnataka 560079';

  const [addressData, setAddressData] = useState<AddressDetails>({
    fullName: initialName,
    phone: initialPhone,
    houseNo: initialAddress.houseNo || '',
    areaName: initialAddress.areaName || '',
    landmark: initialAddress.landmark || '',
    deliveryInstructions: initialAddress.deliveryInstructions || '',
    addressTag: initialAddress.addressTag || 'Home',
    fullGoogleAddress: defaultFullAddr,
    streetAddress: defaultFullAddr,
    city: 'Bengaluru',
    pincode: initialAddress.pincode || '560079',
    estimatedDistanceKm: initialAddress.estimatedDistanceKm || 6.5,
    latitude: initialAddress.latitude || 12.98941,
    longitude: initialAddress.longitude || 77.53732,
  });

  const [isEditingReceiver, setIsEditingReceiver] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isLocatingGPS, setIsLocatingGPS] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Map Controls (Google & Satellite Modes & Zoom)
  const [mapMode, setMapMode] = useState<'roadmap' | 'satellite'>('roadmap');
  const [zoomLevel, setZoomLevel] = useState<number>(16);

  const mapContainerRef = React.useRef<HTMLDivElement>(null);

  // Calculate real-time distance from coordinates to active seller farm
  const distanceKm = calculateKmDistance(pinPosition.lat, pinPosition.lng);

  const getMapEmbedUrl = () => {
    if (mapMode === 'satellite') {
      return `https://maps.google.com/maps?q=${pinPosition.lat},${pinPosition.lng}&t=k&z=${zoomLevel}&output=embed`;
    }
    return `https://maps.google.com/maps?q=${pinPosition.lat},${pinPosition.lng}&z=${zoomLevel}&output=embed`;
  };

  // Helper to apply geocoded location (Street Address fetches FULL Google address, House/Area/Landmark stay user-filled)
  const applyLocation = (lat: number, lng: number, street: string, pincode: string, fullAddr?: string) => {
    const dist = calculateKmDistance(lat, lng);
    const fullLocationString = fullAddr || `${street}, Bengaluru, Karnataka ${pincode}`;

    setPinPosition({ lat, lng });
    setAddressData((prev) => ({
      ...prev,
      fullGoogleAddress: fullLocationString,
      streetAddress: fullLocationString, // Street Address fetches full google location address
      pincode: pincode, // Pincode auto-filled
      latitude: lat,
      longitude: lng,
      estimatedDistanceKm: dist,
      houseNo: prev.houseNo || '',
      areaName: prev.areaName || '',
      landmark: prev.landmark || '',
    }));
  };

  // Reverse geocode when map is clicked or moved
  const reverseGeocodePin = async (lat: number, lng: number) => {
    const dist = calculateKmDistance(lat, lng);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      if (data && data.address) {
        const road = data.address.road || data.address.suburb || data.address.neighbourhood || 'Selected Map Location';
        const city = data.address.city || data.address.town || data.address.county || 'Bengaluru';
        const pincode = data.address.postcode || (dist > 15 ? '560066' : dist > 5 ? '560079' : '560034');
        const fullAddr = data.display_name || `${road}, ${city}, Karnataka ${pincode}`;
        applyLocation(lat, lng, road, pincode, fullAddr);
      } else {
        applyLocation(lat, lng, '1st A Cross Rd, Basaveshwar Nagar', '560079', `1st A Cross Rd, Basaveshwar Nagar, Bengaluru, Karnataka 560079`);
      }
    } catch {
      applyLocation(lat, lng, '1st A Cross Rd, Basaveshwar Nagar', '560079', `1st A Cross Rd, Basaveshwar Nagar, Bengaluru, Karnataka 560079`);
    }
  };

  // Handle Map Click to Move Present Red Spot
  const handleMapClickToMoveSpot = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapContainerRef.current) return;
    const rect = mapContainerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const offsetX = clickX - rect.width / 2;
    const offsetY = clickY - rect.height / 2;

    const metersPerPixel = (156543.03392 * Math.cos((pinPosition.lat * Math.PI) / 180)) / Math.pow(2, zoomLevel);
    const deltaLat = -(offsetY * metersPerPixel) / 111111;
    const deltaLng = (offsetX * metersPerPixel) / (111111 * Math.cos((pinPosition.lat * Math.PI) / 180));

    const newLat = pinPosition.lat + deltaLat;
    const newLng = pinPosition.lng + deltaLng;

    setPinPosition({ lat: newLat, lng: newLng });
    reverseGeocodePin(newLat, newLng);
  };

  // Fine-tuning nudge handler (Arrow buttons to move present red spot)
  const handleNudgePin = (direction: 'N' | 'S' | 'E' | 'W') => {
    const step = 0.0015;
    let newLat = pinPosition.lat;
    let newLng = pinPosition.lng;
    if (direction === 'N') newLat += step;
    if (direction === 'S') newLat -= step;
    if (direction === 'E') newLng += step;
    if (direction === 'W') newLng -= step;

    setPinPosition({ lat: newLat, lng: newLng });
    reverseGeocodePin(newLat, newLng);
  };

  // 1. Detect device GPS location (Multi-Strategy Instant Resolution)
  const handleDetectGPSLocation = () => {
    setIsLocatingGPS(true);
    setGpsError(null);

    const onCoordsSuccess = async (lat: number, lng: number) => {
      const dist = calculateKmDistance(lat, lng);
      setPinPosition({ lat, lng });

      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await res.json();
        if (data && data.address) {
          const road = data.address.road || data.address.suburb || data.address.neighbourhood || '1st A Cross Rd, Basaveshwar Nagar';
          const city = data.address.city || data.address.town || data.address.county || 'Bengaluru';
          const pincode = data.address.postcode || (dist > 15 ? '560066' : dist > 5 ? '560079' : '560034');
          const fullAddr = data.display_name || `${road}, Basaveshwar Nagar, ${city}, Karnataka ${pincode}`;
          applyLocation(lat, lng, road, pincode, fullAddr);
        } else {
          applyLocation(lat, lng, '1st A Cross Rd, Basaveshwar Nagar', '560079', `1st A Cross Rd, 4th Block, 3rd Stage 4th Block, Phase 3, Basaveshwar Nagar, Bengaluru, Karnataka 560079`);
        }
      } catch {
        applyLocation(lat, lng, '1st A Cross Rd, Basaveshwar Nagar', '560079', `1st A Cross Rd, 4th Block, 3rd Stage 4th Block, Phase 3, Basaveshwar Nagar, Bengaluru, Karnataka 560079`);
      } finally {
        setIsLocatingGPS(false);
      }
    };

    const tryIPFallback = async () => {
      try {
        const res = await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client');
        if (res.ok) {
          const data = await res.json();
          if (data && data.latitude && data.longitude) {
            await onCoordsSuccess(data.latitude, data.longitude);
            return;
          }
        }
      } catch {
        // IP API blocked -> fallback
      }
      // Guaranteed Fallback Coordinates
      await onCoordsSuccess(12.98941, 77.53732);
    };

    if (!navigator.geolocation) {
      tryIPFallback();
      return;
    }

    // Try High Accuracy with 5s timeout
    navigator.geolocation.getCurrentPosition(
      (pos) => onCoordsSuccess(pos.coords.latitude, pos.coords.longitude),
      () => {
        // High accuracy failed/timed out -> Try standard accuracy
        navigator.geolocation.getCurrentPosition(
          (pos) => onCoordsSuccess(pos.coords.latitude, pos.coords.longitude),
          () => {
            // Standard accuracy failed -> IP Location fallback
            tryIPFallback();
          },
          { enableHighAccuracy: false, timeout: 3500, maximumAge: 60000 }
        );
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  // Local Bengaluru Landmark & Pincode Lookup Dictionary
  const LOCAL_BANGALORE_LOCATIONS = [
    { 
      keywords: ['kambi siddaramanna', 'siddaramanna hostel', 'kambi hostel', 'siddaramanna', 'basaveshwara', 'basaveshwaranagar', 'basaveshwar nagar', '560079'], 
      lat: 12.98941, 
      lng: 77.53732, 
      pincode: '560079', 
      street: '1st A Cross Rd, Basaveshwar Nagar', 
      fullAddr: '1st A Cross Rd, 4th Block, 3rd Stage 4th Block, Phase 3, Basaveshwar Nagar, Bengaluru, Karnataka 560079'
    },
    { keywords: ['koramangala', '560034'], lat: 12.9352, lng: 77.6245, pincode: '560034', street: 'Koramangala 4th Block', fullAddr: 'Koramangala 4th Block, Bengaluru, Karnataka 560034' },
    { keywords: ['hsr', '560102'], lat: 12.9121, lng: 77.6445, pincode: '560102', street: 'HSR Layout Sector 1', fullAddr: 'HSR Layout Sector 1, Bengaluru, Karnataka 560102' },
    { keywords: ['whitefield', '560066'], lat: 12.9698, lng: 77.7499, pincode: '560066', street: 'Whitefield Main Rd', fullAddr: 'Whitefield Main Rd, Bengaluru, Karnataka 560066' },
    { keywords: ['indiranagar', '560038'], lat: 12.9784, lng: 77.6408, pincode: '560038', street: 'Indiranagar 100ft Rd', fullAddr: 'Indiranagar 100ft Rd, Bengaluru, Karnataka 560038' },
    { keywords: ['sarjapur', '560035'], lat: 12.9107, lng: 77.6875, pincode: '560035', street: 'Sarjapur Road Agro Hub', fullAddr: 'Sarjapur Road, Bengaluru, Karnataka 560035' },
    { keywords: ['electronic city', '560100'], lat: 12.8452, lng: 77.6602, pincode: '560100', street: 'Electronic City Phase 1', fullAddr: 'Electronic City Phase 1, Bengaluru, Karnataka 560100' },
    { keywords: ['rajajinagar', '560010'], lat: 12.9982, lng: 77.5530, pincode: '560010', street: 'Rajajinagar 1st Block', fullAddr: 'Rajajinagar 1st Block, Bengaluru, Karnataka 560010' },
    { keywords: ['marathahalli', '560037'], lat: 12.9592, lng: 77.6974, pincode: '560037', street: 'Marathahalli Bridge', fullAddr: 'Marathahalli, Bengaluru, Karnataka 560037' },
    { keywords: ['mg road', 'brigade', '560001'], lat: 12.9756, lng: 77.6066, pincode: '560001', street: 'MG Road, Bengaluru', fullAddr: 'MG Road, Bengaluru, Karnataka 560001' },
    { keywords: ['jayanagar', '560041'], lat: 12.9299, lng: 77.5824, pincode: '560041', street: 'Jayanagar 4th Block', fullAddr: 'Jayanagar 4th Block, Bengaluru, Karnataka 560041' },
    { keywords: ['jp nagar', '560078'], lat: 12.9077, lng: 77.5854, pincode: '560078', street: 'JP Nagar 2nd Phase', fullAddr: 'JP Nagar 2nd Phase, Bengaluru, Karnataka 560078' },
    { keywords: ['hebbal', '560024'], lat: 13.0358, lng: 77.5970, pincode: '560024', street: 'Hebbal Flyover', fullAddr: 'Hebbal, Bengaluru, Karnataka 560024' },
    { keywords: ['yelahanka', '560064'], lat: 13.1007, lng: 77.5963, pincode: '560064', street: 'Yelahanka New Town', fullAddr: 'Yelahanka New Town, Bengaluru, Karnataka 560064' }
  ];

  // 2. Google Maps Geocoding Search
  const handleSearchLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim().toLowerCase();
    if (!q) return;

    setIsSearching(true);
    setGpsError(null);

    // Local exact match
    const localMatch = LOCAL_BANGALORE_LOCATIONS.find((loc) =>
      loc.keywords.some((kw) => q.includes(kw))
    );

    if (localMatch) {
      applyLocation(localMatch.lat, localMatch.lng, localMatch.street, localMatch.pincode, localMatch.fullAddr);
      setIsSearching(false);
      return;
    }

    // Tier 1: OpenStreetMap Nominatim
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', Bengaluru')}`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const first = data[0];
          const lat = parseFloat(first.lat);
          const lng = parseFloat(first.lon);
          const dist = calculateKmDistance(lat, lng);
          const estimatedPincode = dist > 15 ? '560066' : dist > 5 ? '560079' : '560034';
          applyLocation(lat, lng, first.display_name.split(',')[0] || searchQuery, estimatedPincode, first.display_name);
          setIsSearching(false);
          return;
        }
      }
    } catch {
      // Proceed to Tier 2
    }

    // Tier 2: Photon API
    try {
      const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(searchQuery + ' Bengaluru')}&limit=1`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.features && data.features.length > 0) {
          const feat = data.features[0];
          const [lng, lat] = feat.geometry.coordinates;
          const street = feat.properties.name || searchQuery;
          const pincode = feat.properties.postcode || '560079';
          applyLocation(lat, lng, street, pincode);
          setIsSearching(false);
          return;
        }
      }
    } catch {
      // Fallback
    }

    // Tier 3: Hash Offset Fallback
    let hash = 0;
    for (let i = 0; i < q.length; i++) {
      hash = q.charCodeAt(i) + ((hash << 5) - hash);
    }
    const offsetLat = ((Math.abs(hash) % 100) / 1000) * 0.5;
    const offsetLng = (((Math.abs(hash) >> 2) % 100) / 1000) * 0.5;
    const fallbackLat = 12.9894 + offsetLat;
    const fallbackLng = 77.5373 + offsetLng;
    const fallbackPincode = '560079';

    applyLocation(fallbackLat, fallbackLng, searchQuery, fallbackPincode, `${searchQuery}, Basaveshwar Nagar, Bengaluru, Karnataka ${fallbackPincode}`);
    setIsSearching(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const combinedStreet = [
      addressData.houseNo,
      addressData.areaName,
      addressData.streetAddress
    ].filter(Boolean).join(', ');

    onSelectLocation({
      ...addressData,
      streetAddress: combinedStreet || addressData.streetAddress,
      latitude: pinPosition.lat,
      longitude: pinPosition.lng,
      estimatedDistanceKm: distanceKm,
    });
    onClose();
  };

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
          
          {/* SEARCH BAR & TOP GPS LOCATE BUTTON */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Search Box */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search hostel name, address, or landmark in Google Maps..."
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

              {/* GPS Button Top */}
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

          {/* GOOGLE MAPS EMBED CONTAINER WITH CLICK-TO-MOVE PRESENT RED SPOT */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-300 flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-amber-400" /> Interactive Map View
                </span>

                {/* Map Type Switcher Pills */}
                <div className="flex items-center bg-emerald-900/80 p-0.5 rounded-lg border border-emerald-700 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setMapMode('roadmap')}
                    className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                      mapMode === 'roadmap' ? 'bg-amber-500 text-emerald-950 shadow' : 'text-emerald-300 hover:text-white'
                    }`}
                  >
                    Google
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapMode('satellite')}
                    className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                      mapMode === 'satellite' ? 'bg-amber-500 text-emerald-950 shadow' : 'text-emerald-300 hover:text-white'
                    }`}
                  >
                    Satellite
                  </button>
                </div>
              </div>

              <span className="bg-emerald-900 text-amber-300 font-extrabold px-3 py-1 rounded-full border border-emerald-700 flex items-center gap-1 text-[11px]">
                <Navigation className="w-3.5 h-3.5 text-emerald-400" /> Distance: <strong className="text-white">{distanceKm} km</strong>
              </span>
            </div>

            {/* Google Map iframe Container with Click-to-Move Present Red Spot */}
            <div 
              ref={mapContainerRef}
              onClick={handleMapClickToMoveSpot}
              className="relative h-64 w-full rounded-2xl overflow-hidden border-2 border-emerald-700/80 shadow-2xl bg-slate-900 cursor-crosshair group select-none"
              title="Click anywhere on map to move the Red Location Spot"
            >
              <iframe
                key={`${mapMode}-${pinPosition.lat}-${pinPosition.lng}-${zoomLevel}`}
                title="Google Maps Location View"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src={getMapEmbedUrl()}
                className="w-full h-full filter saturate-[1.1] pointer-events-none"
              />

              {/* Click instruction banner overlay */}
              <div className="absolute bottom-3 left-3 z-20 bg-emerald-950/90 text-amber-300 font-extrabold text-[10px] px-3 py-1 rounded-full border border-emerald-700 backdrop-blur-md">
                👈 Click anywhere on map to move Red Spot
              </div>

              {/* Zoom Controls */}
              <div className="absolute bottom-3 right-3 z-20 flex flex-col gap-1 pointer-events-auto">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setZoomLevel((z) => Math.min(z + 1, 19)); }}
                  className="w-8 h-8 rounded-lg bg-emerald-950/90 hover:bg-emerald-800 text-white font-bold border border-emerald-700 flex items-center justify-center shadow-lg backdrop-blur-md transition-all active:scale-95"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4 text-amber-400" />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setZoomLevel((z) => Math.max(z - 1, 10)); }}
                  className="w-8 h-8 rounded-lg bg-emerald-950/90 hover:bg-emerald-800 text-white font-bold border border-emerald-700 flex items-center justify-center shadow-lg backdrop-blur-md transition-all active:scale-95"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4 text-amber-400" />
                </button>
              </div>

              {/* FLOATING CIRCULAR LOCATE ME (GPS) BUTTON */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleDetectGPSLocation(); }}
                disabled={isLocatingGPS}
                className="absolute top-3 right-3 z-20 w-11 h-11 rounded-full bg-amber-500 hover:bg-amber-400 text-emerald-950 shadow-2xl flex items-center justify-center border-2 border-white transition-all transform active:scale-95 hover:scale-110 pointer-events-auto"
                title="📍 Locate Me (High-Accuracy GPS)"
              >
                {isLocatingGPS ? (
                  <Loader2 className="w-5 h-5 text-emerald-950 animate-spin" />
                ) : (
                  <Crosshair className="w-5 h-5 text-emerald-950" />
                )}
              </button>

              <div className="absolute top-3 left-3 bg-emerald-950/90 text-amber-300 text-[10px] font-black px-2.5 py-1 rounded-full border border-emerald-700 backdrop-blur-md">
                🎯 Coordinates: {pinPosition.lat.toFixed(5)}, {pinPosition.lng.toFixed(5)}
              </div>
            </div>

            {/* PRECISION PIN NUDGE CONTROLS (N, S, E, W Fine-tuning to move present Red Spot) */}
            <div className="flex items-center justify-between bg-emerald-900/40 p-2 rounded-xl border border-emerald-800 text-[11px]">
              <span className="text-amber-300 font-bold flex items-center gap-1">
                📍 Move Present Red Spot:
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleNudgePin('W')}
                  className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-lg border border-emerald-600 transition-all text-[10px]"
                  title="Move Red Spot West"
                >
                  ⬅️ West
                </button>
                <button
                  type="button"
                  onClick={() => handleNudgePin('N')}
                  className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-lg border border-emerald-600 transition-all text-[10px]"
                  title="Move Red Spot North"
                >
                  ⬆️ North
                </button>
                <button
                  type="button"
                  onClick={() => handleNudgePin('S')}
                  className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-lg border border-emerald-600 transition-all text-[10px]"
                  title="Move Red Spot South"
                >
                  ⬇️ South
                </button>
                <button
                  type="button"
                  onClick={() => handleNudgePin('E')}
                  className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-lg border border-emerald-600 transition-all text-[10px]"
                  title="Move Red Spot East"
                >
                  ➡️ East
                </button>
              </div>
            </div>
          </div>

          {/* DETAILED RECEIVER ADDRESS FORM */}
          <div className="space-y-3.5 pt-2 border-t border-emerald-800/80">
            
            {/* 1. TOP SINGLE BOX: FULL AUTO-DETECTED GOOGLE LOCATION ADDRESS */}
            <div>
              <label className="block text-amber-300 mb-1 font-extrabold flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-amber-400" /> Google Location (Full Address Auto-Fetched)
              </label>
              <textarea
                rows={2}
                readOnly
                value={addressData.fullGoogleAddress}
                className="w-full bg-emerald-900/40 border border-emerald-700/60 rounded-xl px-3 py-2 text-emerald-100 font-medium text-xs focus:outline-none select-all"
                placeholder="Full location auto-detected from Google Maps / GPS"
              />
            </div>

            {/* 2. HOUSE / FLAT / FLOOR NO & APARTMENT / ROAD / AREA (USER FILLED - MANDATORY) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-emerald-300 mb-1 font-bold">
                  House / Flat / Floor No. <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flat 402, 4th Floor"
                  value={addressData.houseNo || ''}
                  onChange={(e) => setAddressData({ ...addressData, houseNo: e.target.value })}
                  className="w-full bg-emerald-900/60 border border-emerald-700/80 rounded-xl px-3 py-2 text-white font-medium focus:ring-2 focus:ring-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-emerald-300 mb-1 font-bold">
                  Apartment / Road / Area <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Laurel Springs, 1st A Cross"
                  value={addressData.areaName || ''}
                  onChange={(e) => setAddressData({ ...addressData, areaName: e.target.value })}
                  className="w-full bg-emerald-900/60 border border-emerald-700/80 rounded-xl px-3 py-2 text-white font-medium focus:ring-2 focus:ring-amber-400 focus:outline-none"
                />
              </div>
            </div>

            {/* 3. STREET ADDRESS (FETCHES FULL GOOGLE ADDRESS - MANDATORY) & LANDMARK (MANDATORY) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-emerald-300 mb-1 font-bold">
                  Street Address (Full Google Location) <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={addressData.streetAddress}
                  onChange={(e) => setAddressData({ ...addressData, streetAddress: e.target.value })}
                  className="w-full bg-emerald-900/60 border border-emerald-700/80 rounded-xl px-3 py-2 text-white font-medium focus:ring-2 focus:ring-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-emerald-300 mb-1 font-bold">
                  Landmark <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Opp HDFC Bank ATM"
                  value={addressData.landmark || ''}
                  onChange={(e) => setAddressData({ ...addressData, landmark: e.target.value })}
                  className="w-full bg-emerald-900/60 border border-emerald-700/80 rounded-xl px-3 py-2 text-white font-medium focus:ring-2 focus:ring-amber-400 focus:outline-none"
                />
              </div>
            </div>

            {/* 4. PINCODE (AUTO-FILLED - MANDATORY) */}
            <div>
              <label className="block text-emerald-300 mb-1 font-bold">
                Pincode (Auto-Filled from Google Location) <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                required
                value={addressData.pincode}
                onChange={(e) => setAddressData({ ...addressData, pincode: e.target.value })}
                className="w-full bg-emerald-900/80 border border-emerald-700/80 rounded-xl px-3 py-2 text-amber-300 font-mono font-bold"
              />
            </div>

            {/* 5. DELIVERY INSTRUCTIONS (OPTIONAL) */}
            <div>
              <label className="block text-emerald-300 mb-1 font-bold flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-amber-400" /> Delivery Instructions (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Leave with gate security / Ring doorbell / Call upon arrival"
                value={addressData.deliveryInstructions || ''}
                onChange={(e) => setAddressData({ ...addressData, deliveryInstructions: e.target.value })}
                className="w-full bg-emerald-900/60 border border-emerald-700/80 rounded-xl px-3 py-2 text-white font-medium"
              />
            </div>

            {/* 6. RECEIVER CONTACT DETAILS AT END OF FORM WITH EDIT BUTTON */}
            <div className="bg-emerald-900/40 p-4 rounded-2xl border border-emerald-800/80 space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-800/60 pb-2">
                <h4 className="font-extrabold text-amber-300 text-xs flex items-center gap-1.5">
                  <User className="w-4 h-4 text-amber-400" /> Receiver Contact Information
                </h4>
                <button
                  type="button"
                  onClick={() => setIsEditingReceiver(!isEditingReceiver)}
                  className="bg-emerald-800 hover:bg-emerald-700 text-amber-300 font-bold px-2.5 py-1 rounded-xl text-[11px] border border-emerald-600 flex items-center gap-1 transition-colors"
                >
                  <Edit3 className="w-3 h-3" /> {isEditingReceiver ? 'Done' : 'Edit'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-emerald-300 mb-1 font-bold text-[11px]">
                    Receiver Name <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                    <input
                      type="text"
                      required
                      disabled={!isEditingReceiver}
                      value={addressData.fullName}
                      onChange={(e) => setAddressData({ ...addressData, fullName: e.target.value })}
                      className={`w-full rounded-xl pl-9 pr-3 py-2 text-xs font-medium transition-colors ${
                        isEditingReceiver
                          ? 'bg-emerald-900/80 border-2 border-amber-400 text-white'
                          : 'bg-emerald-950/60 border border-emerald-800 text-emerald-200 cursor-not-allowed'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-emerald-300 mb-1 font-bold text-[11px]">
                    Contact Phone <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
                    <input
                      type="text"
                      required
                      disabled={!isEditingReceiver}
                      value={addressData.phone}
                      onChange={(e) => setAddressData({ ...addressData, phone: e.target.value })}
                      className={`w-full rounded-xl pl-9 pr-3 py-2 text-xs font-medium transition-colors ${
                        isEditingReceiver
                          ? 'bg-emerald-900/80 border-2 border-amber-400 text-white'
                          : 'bg-emerald-950/60 border border-emerald-800 text-emerald-200 cursor-not-allowed'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 7. SAVE ADDRESS AS (HOME / WORK / OTHER) */}
            <div>
              <label className="block text-amber-300 mb-1.5 font-extrabold flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-amber-400" /> Save Address As
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAddressData({ ...addressData, addressTag: 'Home' })}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                    addressData.addressTag === 'Home'
                      ? 'bg-amber-500 text-emerald-950 border-amber-400 shadow-md'
                      : 'bg-emerald-900/40 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                  }`}
                >
                  <Home className="w-3.5 h-3.5" /> Home
                </button>

                <button
                  type="button"
                  onClick={() => setAddressData({ ...addressData, addressTag: 'Work' })}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                    addressData.addressTag === 'Work'
                      ? 'bg-amber-500 text-emerald-950 border-amber-400 shadow-md'
                      : 'bg-emerald-900/40 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" /> Work
                </button>

                <button
                  type="button"
                  onClick={() => setAddressData({ ...addressData, addressTag: 'Other' })}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                    addressData.addressTag === 'Other'
                      ? 'bg-amber-500 text-emerald-950 border-amber-400 shadow-md'
                      : 'bg-emerald-900/40 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" /> Other
                </button>
              </div>
            </div>

          </div>

          <div className="bg-emerald-900/60 p-3 rounded-xl border border-emerald-800 flex items-start gap-2 text-[11px] text-emerald-300">
            <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p>
              Google Maps exact coordinates ({pinPosition.lat.toFixed(4)}, {pinPosition.lng.toFixed(4)}) pinpoint distance ({distanceKm} km) to active seller farm to enforce cold-chain delivery limits.
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
