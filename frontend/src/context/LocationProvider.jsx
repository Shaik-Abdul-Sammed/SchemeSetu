import React, { useState, useEffect, useCallback } from 'react';
import { LocationContext } from './useLocation';
import { MOCK_PARTNERS } from '../data/mock/partners';

/**
 * District-level centroids for offline reverse-geocoding fallback.
 * These are REFERENCE points only — when used, the UI clearly labels them
 * as "nearest reference centroid" rather than the user's actual address.
 * 
 * Coverage: Major districts across 15+ states to minimize centroid-to-actual distance.
 */
export const INDIAN_LOCATIONS = [
  // Telangana
  { state: 'Telangana', district: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
  { state: 'Telangana', district: 'Warangal', lat: 17.9689, lng: 79.5941 },
  { state: 'Telangana', district: 'Karimnagar', lat: 18.4386, lng: 79.1288 },
  { state: 'Telangana', district: 'Nizamabad', lat: 18.6725, lng: 78.0940 },
  { state: 'Telangana', district: 'Khammam', lat: 17.2473, lng: 80.1514 },
  { state: 'Telangana', district: 'Nalgonda', lat: 17.0583, lng: 79.2671 },
  { state: 'Telangana', district: 'Mahabubnagar', lat: 16.7488, lng: 77.9855 },
  // Andhra Pradesh — significantly expanded for Rayalaseema coverage
  { state: 'Andhra Pradesh', district: 'Vijayawada', lat: 16.5062, lng: 80.6480 },
  { state: 'Andhra Pradesh', district: 'Visakhapatnam', lat: 17.6868, lng: 83.2185 },
  { state: 'Andhra Pradesh', district: 'Guntur', lat: 16.3067, lng: 80.4365 },
  { state: 'Andhra Pradesh', district: 'Nellore', lat: 14.4426, lng: 79.9865 },
  { state: 'Andhra Pradesh', district: 'Kurnool', lat: 15.8281, lng: 78.0373 },
  { state: 'Andhra Pradesh', district: 'YSR Kadapa', lat: 14.4673, lng: 78.8242 },
  { state: 'Andhra Pradesh', district: 'Anantapur', lat: 14.6819, lng: 77.6006 },
  { state: 'Andhra Pradesh', district: 'Chittoor', lat: 13.2172, lng: 79.1003 },
  { state: 'Andhra Pradesh', district: 'Tirupati', lat: 13.6288, lng: 79.4192 },
  { state: 'Andhra Pradesh', district: 'Prakasam', lat: 15.3487, lng: 79.5607 },
  { state: 'Andhra Pradesh', district: 'East Godavari', lat: 17.3212, lng: 82.0834 },
  { state: 'Andhra Pradesh', district: 'West Godavari', lat: 16.9174, lng: 81.3399 },
  { state: 'Andhra Pradesh', district: 'Srikakulam', lat: 18.2949, lng: 83.8938 },
  // Tamil Nadu
  { state: 'Tamil Nadu', district: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { state: 'Tamil Nadu', district: 'Coimbatore', lat: 11.0168, lng: 76.9558 },
  { state: 'Tamil Nadu', district: 'Madurai', lat: 9.9252, lng: 78.1198 },
  { state: 'Tamil Nadu', district: 'Salem', lat: 11.6643, lng: 78.1460 },
  { state: 'Tamil Nadu', district: 'Tiruchirappalli', lat: 10.7905, lng: 78.7047 },
  // Karnataka
  { state: 'Karnataka', district: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
  { state: 'Karnataka', district: 'Mysuru', lat: 12.2958, lng: 76.6394 },
  { state: 'Karnataka', district: 'Hubli-Dharwad', lat: 15.3647, lng: 75.1240 },
  { state: 'Karnataka', district: 'Mangaluru', lat: 12.8714, lng: 74.8431 },
  { state: 'Karnataka', district: 'Belgaum', lat: 15.8497, lng: 74.4977 },
  // Maharashtra
  { state: 'Maharashtra', district: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  { state: 'Maharashtra', district: 'Pune', lat: 18.5204, lng: 73.8567 },
  { state: 'Maharashtra', district: 'Nagpur', lat: 21.1458, lng: 79.0882 },
  { state: 'Maharashtra', district: 'Nashik', lat: 19.9975, lng: 73.7898 },
  { state: 'Maharashtra', district: 'Aurangabad', lat: 19.8762, lng: 75.3433 },
  // Delhi
  { state: 'Delhi', district: 'New Delhi', lat: 28.6139, lng: 77.2090 },
  // Uttar Pradesh
  { state: 'Uttar Pradesh', district: 'Lucknow', lat: 26.8467, lng: 80.9462 },
  { state: 'Uttar Pradesh', district: 'Varanasi', lat: 25.3176, lng: 82.9739 },
  { state: 'Uttar Pradesh', district: 'Kanpur', lat: 26.4499, lng: 80.3319 },
  { state: 'Uttar Pradesh', district: 'Agra', lat: 27.1767, lng: 78.0081 },
  // West Bengal
  { state: 'West Bengal', district: 'Kolkata', lat: 22.5726, lng: 88.3639 },
  // Kerala
  { state: 'Kerala', district: 'Thiruvananthapuram', lat: 8.5241, lng: 76.9366 },
  { state: 'Kerala', district: 'Kochi', lat: 9.9312, lng: 76.2673 },
  // Gujarat
  { state: 'Gujarat', district: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
  { state: 'Gujarat', district: 'Surat', lat: 21.1702, lng: 72.8311 },
  // Rajasthan
  { state: 'Rajasthan', district: 'Jaipur', lat: 26.9124, lng: 75.7873 },
  { state: 'Rajasthan', district: 'Jodhpur', lat: 26.2389, lng: 73.0243 },
  // Bihar
  { state: 'Bihar', district: 'Patna', lat: 25.5941, lng: 85.1376 },
  // Madhya Pradesh
  { state: 'Madhya Pradesh', district: 'Bhopal', lat: 23.2599, lng: 77.4126 },
  { state: 'Madhya Pradesh', district: 'Indore', lat: 22.7196, lng: 75.8577 },
  // Punjab
  { state: 'Punjab', district: 'Chandigarh', lat: 30.7333, lng: 76.7794 },
  { state: 'Punjab', district: 'Amritsar', lat: 31.6340, lng: 74.8723 },
  // Odisha
  { state: 'Odisha', district: 'Bhubaneswar', lat: 20.2961, lng: 85.8245 }
];

/** Maximum acceptable distance (km) between GPS coords and nearest centroid
 *  before we flag the reverse-geocoded address as unverified. */
const MAX_CENTROID_TRUST_DISTANCE_KM = 50;

export function LocationProvider({ children }) {
  // Location states: 'idle' | 'detecting' | 'detected' | 'denied' | 'unavailable' | 'timeout' | 'unsupported' | 'demo'
  const [locationStatus, setLocationStatus] = useState(() => {
    const saved = localStorage.getItem('schemesetu_location_status');
    return saved || 'idle';
  });

  const [errorMessage, setErrorMessage] = useState('');

  // GPS debug data — exposed for the diagnostic panel
  const [gpsDebug, setGpsDebug] = useState({
    rawLat: null,
    rawLng: null,
    rawAccuracy: null,
    rawTimestamp: null,
    reverseGeocodeResult: null,
    reverseGeocodeSource: null,
    centroidDistanceKm: null,
    centroidTrusted: null
  });

  const [location, setLocation] = useState(() => {
    const saved = localStorage.getItem('schemesetu_location');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      lat: null,
      lng: null,
      accuracy: null,
      timestamp: null,
      state: '',
      district: '',
      address: '',
      isGPS: false,
      isDemo: false,
      accuracyWarning: ''
    };
  });

  const [nearbyPartners, setNearbyPartners] = useState(MOCK_PARTNERS);

  // Haversine formula to compute distance in km using genuine coordinates
  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    if (lat1 === null || lat1 === undefined || lon1 === null || lon1 === undefined ||
        lat2 === null || lat2 === undefined || lon2 === null || lon2 === undefined) {
      return null;
    }
    const nLat1 = Number(lat1);
    const nLon1 = Number(lon1);
    const nLat2 = Number(lat2);
    const nLon2 = Number(lon2);
    if (isNaN(nLat1) || isNaN(nLon1) || isNaN(nLat2) || isNaN(nLon2)) return null;

    const R = 6371; // Earth's radius in km
    const dLat = (nLat2 - nLat1) * (Math.PI / 180);
    const dLon = (nLon2 - nLon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(nLat1 * (Math.PI / 180)) * Math.cos(nLat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }, []);

  // Dynamically sort assistance centers based on real distance to user's coordinates.
  // CRITICAL FIX: Partner coordinates are stored as p.coordinates.lat / p.coordinates.lng
  const refreshPartnerDistances = useCallback((lat, lng) => {
    if (lat === null || lat === undefined || lng === null || lng === undefined) {
      setNearbyPartners(MOCK_PARTNERS);
      return;
    }
    const updated = MOCK_PARTNERS.map(p => {
      const pLat = p.coordinates?.lat;
      const pLng = p.coordinates?.lng;
      const dist = calculateDistance(lat, lng, pLat, pLng);
      return {
        ...p,
        calculatedDistance: dist,
        distanceKm: dist !== null ? dist : p.distanceKm
      };
    }).sort((a, b) => {
      const distA = a.calculatedDistance !== null ? a.calculatedDistance : 9999;
      const distB = b.calculatedDistance !== null ? b.calculatedDistance : 9999;
      return distA - distB;
    });
    setNearbyPartners(updated);
  }, [calculateDistance]);

  const updateLocation = useCallback((newLoc) => {
    setLocation(newLoc);
    localStorage.setItem('schemesetu_location', JSON.stringify(newLoc));
    if (newLoc.lat && newLoc.lng) {
      refreshPartnerDistances(newLoc.lat, newLoc.lng);
    }
  }, [refreshPartnerDistances]);

  /**
   * Reverse Geocoding:
   * 1. Tries OpenStreetMap Nominatim with actual GPS lat/lng (4s timeout).
   * 2. If online succeeds, uses the actual returned address fields — NEVER substitutes defaults.
   * 3. If offline or Nominatim fails, falls back to nearest known centroid from INDIAN_LOCATIONS.
   * 4. If nearest centroid is >50 km away, flags the result as unverified.
   */
  const reverseGeocode = useCallback(async (lat, lng) => {
    // --- Attempt online reverse geocoding ---
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en&zoom=14`,
        {
          signal: controller.signal,
          headers: { 'User-Agent': 'SchemeSetu-SIH-DevApp/1.0' }
        }
      );
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const state = addr.state || addr.region || '';
        const district = addr.state_district || addr.county || addr.city || addr.town || addr.village || '';
        const village = addr.village || addr.hamlet || addr.suburb || '';
        const displayName = data.display_name || '';

        // Build location string from whatever Nominatim returned — never substitute hardcoded defaults
        if (state || district || village) {
          return {
            state: state,
            district: district || village,
            address: displayName || [village, district, state].filter(Boolean).join(', '),
            source: 'online',
            centroidDistanceKm: null,
            centroidTrusted: true
          };
        }
      }
    } catch (e) {
      // Graceful offline fallback — do not throw
    }

    // --- Offline fallback: find nearest centroid ---
    let closest = null;
    let minD = Infinity;
    for (const item of INDIAN_LOCATIONS) {
      const d = calculateDistance(lat, lng, item.lat, item.lng);
      if (d !== null && d < minD) {
        minD = d;
        closest = item;
      }
    }

    if (!closest) {
      return {
        state: '',
        district: '',
        address: 'GPS detected, but address could not be determined.',
        source: 'none',
        centroidDistanceKm: null,
        centroidTrusted: false
      };
    }

    const isTrusted = minD <= MAX_CENTROID_TRUST_DISTANCE_KM;

    return {
      state: closest.state,
      district: closest.district,
      address: isTrusted
        ? `${closest.district}, ${closest.state} (Nearest Reference)`
        : `GPS detected (${lat.toFixed(4)}°, ${lng.toFixed(4)}°) — address could not be verified.`,
      source: 'offline_centroid',
      centroidDistanceKm: minD,
      centroidTrusted: isTrusted
    };
  }, [calculateDistance]);

  // Real Browser Geolocation API
  const detectCurrentGPSLocation = useCallback((forceFresh = false) => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setLocationStatus('unsupported');
      setErrorMessage('GPS location is not supported by this browser.');
      return;
    }

    setLocationStatus('detecting');
    setErrorMessage('');

    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0 // Always request fresh — never rely on cached
    };

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const timestamp = pos.timestamp || Date.now();

        // Store raw debug data FIRST, before any transformation
        const debugData = {
          rawLat: latitude,
          rawLng: longitude,
          rawAccuracy: accuracy ? Math.round(accuracy) : null,
          rawTimestamp: new Date(timestamp).toISOString(),
          reverseGeocodeResult: null,
          reverseGeocodeSource: null,
          centroidDistanceKm: null,
          centroidTrusted: null
        };

        const details = await reverseGeocode(latitude, longitude);

        // Update debug with reverse geocode results
        debugData.reverseGeocodeResult = `${details.district || '(unknown district)'}, ${details.state || '(unknown state)'}`;
        debugData.reverseGeocodeSource = details.source;
        debugData.centroidDistanceKm = details.centroidDistanceKm;
        debugData.centroidTrusted = details.centroidTrusted;
        setGpsDebug(debugData);

        let accuracyWarning = '';
        if (accuracy && accuracy > 1000) {
          accuracyWarning = `GPS accuracy is low (±${Math.round(accuracy)} m). Move to an open area and try again.`;
        }

        const gpsLoc = {
          lat: latitude,
          lng: longitude,
          accuracy: accuracy ? Math.round(accuracy) : null,
          timestamp,
          state: details.state,
          district: details.district,
          address: details.address,
          isGPS: true,
          isDemo: false,
          accuracyWarning,
          geocodeSource: details.source,
          centroidTrusted: details.centroidTrusted
        };

        setLocation(gpsLoc);
        setLocationStatus('detected');
        localStorage.setItem('schemesetu_location', JSON.stringify(gpsLoc));
        localStorage.setItem('schemesetu_location_status', 'detected');
        refreshPartnerDistances(latitude, longitude);
      },
      (err) => {
        let status = 'unavailable';
        let msg = 'Your device could not determine the current location.';
        
        if (err.code === 1) { // PERMISSION_DENIED
          status = 'denied';
          msg = 'Location permission was denied. Enable location access in your browser settings.';
        } else if (err.code === 2) { // POSITION_UNAVAILABLE
          status = 'unavailable';
          msg = 'Your device could not determine the current location.';
        } else if (err.code === 3) { // TIMEOUT
          status = 'timeout';
          msg = 'GPS detection timed out. Please try again.';
        }

        setLocationStatus(status);
        setErrorMessage(msg);
        localStorage.setItem('schemesetu_location_status', status);

        // Reset debug data on error — do NOT fabricate coordinates
        setGpsDebug({
          rawLat: null, rawLng: null, rawAccuracy: null, rawTimestamp: null,
          reverseGeocodeResult: `Error: ${msg}`,
          reverseGeocodeSource: 'error',
          centroidDistanceKm: null,
          centroidTrusted: null
        });
      },
      geoOptions
    );
  }, [reverseGeocode, refreshPartnerDistances]);

  // Refresh Location Action: Forces a fresh GPS reading
  const refreshLocation = useCallback(() => {
    detectCurrentGPSLocation(true);
  }, [detectCurrentGPSLocation]);

  // Demo Location Setup (Specifically for SIH Hackathon Evaluation)
  const setDemoLocation = useCallback((stateName = 'Tamil Nadu', districtName = 'Chennai') => {
    const match = INDIAN_LOCATIONS.find(loc =>
      loc.state === stateName && loc.district === districtName
    ) || INDIAN_LOCATIONS.find(loc => loc.state === stateName) || INDIAN_LOCATIONS[0];

    const demoLoc = {
      lat: match.lat,
      lng: match.lng,
      accuracy: null,
      timestamp: Date.now(),
      state: match.state,
      district: match.district,
      address: `${match.district}, ${match.state} (Demo Location)`,
      isGPS: false,
      isDemo: true,
      accuracyWarning: ''
    };
    setLocation(demoLoc);
    setLocationStatus('demo');
    localStorage.setItem('schemesetu_location', JSON.stringify(demoLoc));
    localStorage.setItem('schemesetu_location_status', 'demo');
    refreshPartnerDistances(match.lat, match.lng);
  }, [refreshPartnerDistances]);

  // Manual State Selection
  const setManualLocation = useCallback((stateName) => {
    const match = INDIAN_LOCATIONS.find(s => s.state === stateName);
    if (!match) {
      setErrorMessage(`Unknown state: ${stateName}. Please try GPS detection instead.`);
      return;
    }
    const manualLoc = {
      lat: match.lat,
      lng: match.lng,
      accuracy: null,
      timestamp: Date.now(),
      state: match.state,
      district: match.district,
      address: `${match.district}, ${match.state}`,
      isGPS: false,
      isDemo: false,
      accuracyWarning: ''
    };
    setLocation(manualLoc);
    setLocationStatus('detected');
    localStorage.setItem('schemesetu_location', JSON.stringify(manualLoc));
    localStorage.setItem('schemesetu_location_status', 'detected');
    refreshPartnerDistances(manualLoc.lat, manualLoc.lng);
  }, [refreshPartnerDistances]);

  return (
    <LocationContext.Provider value={{ 
      location, 
      locationStatus, 
      errorMessage, 
      updateLocation, 
      detectCurrentGPSLocation, 
      refreshLocation,
      setDemoLocation, 
      setManualLocation, 
      nearbyPartners, 
      calculateDistance, 
      gpsDebug,
      INDIAN_LOCATIONS 
    }}>
      {children}
    </LocationContext.Provider>
  );
}

export default LocationProvider;
