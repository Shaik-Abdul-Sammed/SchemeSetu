import React, { useState, useEffect, useCallback } from 'react';
import { LocationContext } from './useLocation';
import { MOCK_PARTNERS } from '../data/mock/partners';

// Standard Indian State/UT centroids and major district centers for offline fallback
export const INDIAN_LOCATIONS = [
  { state: 'Telangana', district: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
  { state: 'Andhra Pradesh', district: 'Amaravati / Vijayawada', lat: 16.5062, lng: 80.6480 },
  { state: 'Tamil Nadu', district: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { state: 'Karnataka', district: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
  { state: 'Maharashtra', district: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  { state: 'Delhi', district: 'New Delhi', lat: 28.6139, lng: 77.2090 },
  { state: 'Uttar Pradesh', district: 'Lucknow', lat: 26.8467, lng: 80.9462 },
  { state: 'West Bengal', district: 'Kolkata', lat: 22.5726, lng: 88.3639 },
  { state: 'Kerala', district: 'Thiruvananthapuram', lat: 8.5241, lng: 76.9366 },
  { state: 'Gujarat', district: 'Gandhinagar / Ahmedabad', lat: 23.2156, lng: 72.6369 },
  { state: 'Rajasthan', district: 'Jaipur', lat: 26.9124, lng: 75.7873 },
  { state: 'Bihar', district: 'Patna', lat: 25.5941, lng: 85.1376 },
  { state: 'Madhya Pradesh', district: 'Bhopal', lat: 23.2599, lng: 77.4126 },
  { state: 'Punjab', district: 'Chandigarh', lat: 30.7333, lng: 76.7794 },
  { state: 'Odisha', district: 'Bhubaneswar', lat: 20.2961, lng: 85.8245 }
];

export function LocationProvider({ children }) {
  // Location states: 'idle' | 'detecting' | 'detected' | 'denied' | 'unavailable' | 'timeout' | 'unsupported' | 'demo'
  const [locationStatus, setLocationStatus] = useState(() => {
    const saved = localStorage.getItem('schemesetu_location_status');
    return saved || 'idle';
  });

  const [errorMessage, setErrorMessage] = useState('');

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
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }, []);

  // Dynamically sort assistance centers based on real distance to user's coordinates
  const refreshPartnerDistances = useCallback((lat, lng) => {
    if (lat === null || lat === undefined || lng === null || lng === undefined) {
      setNearbyPartners(MOCK_PARTNERS);
      return;
    }
    const updated = MOCK_PARTNERS.map(p => ({
      ...p,
      distanceKm: calculateDistance(lat, lng, p.latitude || p.lat, p.longitude || p.lng)
    })).sort((a, b) => {
      const distA = a.distanceKm !== null ? a.distanceKm : 9999;
      const distB = b.distanceKm !== null ? b.distanceKm : 9999;
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

  // Reverse Geocoding: Uses OpenStreetMap Nominatim with offline fallback to nearest known centroid
  const reverseGeocode = useCallback(async (lat, lng) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        const address = data.address || {};
        const state = address.state || address.region || '';
        const district = address.state_district || address.county || address.city || address.town || address.village || '';
        if (state || district) {
          return {
            state: state || 'Telangana',
            district: district || 'Hyderabad',
            address: data.display_name || `${district}, ${state}`,
            source: 'online'
          };
        }
      }
    } catch (e) {
      // Graceful offline fallback
    }

    // Nearest known centroid calculation
    let closest = INDIAN_LOCATIONS[0];
    let minD = Infinity;
    for (const item of INDIAN_LOCATIONS) {
      const d = calculateDistance(lat, lng, item.lat, item.lng);
      if (d !== null && d < minD) {
        minD = d;
        closest = item;
      }
    }
    return {
      state: closest.state,
      district: closest.district,
      address: `${closest.district}, ${closest.state} (Near Centroid Reference)`,
      source: 'offline_centroid'
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
      maximumAge: forceFresh ? 0 : 0
    };

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const timestamp = pos.timestamp || Date.now();
        const details = await reverseGeocode(latitude, longitude);

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
          accuracyWarning
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
    const demoLoc = {
      lat: 13.0827,
      lng: 80.2707,
      accuracy: 10,
      timestamp: Date.now(),
      state: stateName,
      district: districtName,
      address: `${districtName}, ${stateName} (Demo Location)`,
      isGPS: false,
      isDemo: true,
      accuracyWarning: ''
    };
    setLocation(demoLoc);
    setLocationStatus('demo');
    localStorage.setItem('schemesetu_location', JSON.stringify(demoLoc));
    localStorage.setItem('schemesetu_location_status', 'demo');
    refreshPartnerDistances(13.0827, 80.2707);
  }, [refreshPartnerDistances]);

  // Manual State Selection
  const setManualLocation = useCallback((stateName) => {
    const match = INDIAN_LOCATIONS.find(s => s.state === stateName) || INDIAN_LOCATIONS[0];
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
      INDIAN_LOCATIONS 
    }}>
      {children}
    </LocationContext.Provider>
  );
}

export default LocationProvider;
