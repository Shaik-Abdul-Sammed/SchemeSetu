import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MOCK_PARTNERS } from '../data/mock/partners';

const LocationContext = createContext(null);

// Standard Indian State/UT centroids and major district centers
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
      state: '',
      district: '',
      address: '',
      isGPS: false,
      isDemo: false
    };
  });

  const [nearbyPartners, setNearbyPartners] = useState(MOCK_PARTNERS);

  // Haversine formula to compute distance in km
  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  // Update partners distances based on current coordinates
  const refreshPartnerDistances = useCallback((lat, lng) => {
    if (!lat || !lng) {
      setNearbyPartners(MOCK_PARTNERS);
      return;
    }

    const recalculated = MOCK_PARTNERS.map(p => {
      const pLat = p.coordinates?.lat || p.lat || 17.3850;
      const pLng = p.coordinates?.lng || p.lng || 78.4867;
      const dist = calculateDistance(lat, lng, pLat, pLng);
      return {
        ...p,
        distance: dist,
        distanceKm: dist ? parseFloat(dist.toFixed(1)) : null,
        distanceText: dist ? `${dist.toFixed(1)} km` : 'Prototype center'
      };
    }).sort((a, b) => (a.distance || 0) - (b.distance || 0));

    setNearbyPartners(recalculated);
  }, [calculateDistance]);

  const updateLocation = useCallback((newLoc, status = 'detected') => {
    const updated = { ...location, ...newLoc };
    setLocation(updated);
    setLocationStatus(status);
    localStorage.setItem('schemesetu_location', JSON.stringify(updated));
    localStorage.setItem('schemesetu_location_status', status);

    if (updated.lat && updated.lng) {
      refreshPartnerDistances(updated.lat, updated.lng);
    }
  }, [location, refreshPartnerDistances]);

  // Find nearest known Indian state/district centroid
  const findNearestIndianLocation = (lat, lng) => {
    let nearest = INDIAN_LOCATIONS[0];
    let minDist = Infinity;

    for (const item of INDIAN_LOCATIONS) {
      const dist = calculateDistance(lat, lng, item.lat, item.lng);
      if (dist !== null && dist < minDist) {
        minDist = dist;
        nearest = item;
      }
    }
    return nearest;
  };

  // Explicit user-triggered GPS detection (NEVER called automatically on mount)
  const detectCurrentGPSLocation = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocationStatus('unsupported');
      setErrorMessage('Geolocation is not supported by your browser.');
      return;
    }

    setLocationStatus('detecting');
    setErrorMessage('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const nearest = findNearestIndianLocation(lat, lng);

        const updatedLoc = {
          lat,
          lng,
          state: nearest.state,
          district: nearest.district,
          address: `Detected GPS: ${nearest.district}, ${nearest.state} (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
          isGPS: true,
          isDemo: false
        };

        setLocation(updatedLoc);
        setLocationStatus('detected');
        localStorage.setItem('schemesetu_location', JSON.stringify(updatedLoc));
        localStorage.setItem('schemesetu_location_status', 'detected');
        refreshPartnerDistances(lat, lng);
      },
      (err) => {
        let code = 'unavailable';
        let msg = 'Location unavailable. You can search or select your state/district manually.';

        if (err.code === 1) { // PERMISSION_DENIED
          code = 'denied';
          msg = 'Location permission was denied. You can search or select your state/district manually.';
        } else if (err.code === 3) { // TIMEOUT
          code = 'timeout';
          msg = 'Location request timed out. Please retry or select your state manually.';
        }

        setLocationStatus(code);
        setErrorMessage(msg);
      },
      { timeout: 10000, enableHighAccuracy: true, maximumAge: 60000 }
    );
  }, [calculateDistance, refreshPartnerDistances]);

  // Set predefined Demo Location
  const setDemoLocation = useCallback((demoState = 'Tamil Nadu') => {
    const match = INDIAN_LOCATIONS.find(s => s.state === demoState) || INDIAN_LOCATIONS[2];
    const demoLoc = {
      lat: match.lat,
      lng: match.lng,
      state: match.state,
      district: match.district,
      address: `Demo Location: ${match.district}, ${match.state} (Prototype data)`,
      isGPS: false,
      isDemo: true
    };
    setLocation(demoLoc);
    setLocationStatus('demo');
    localStorage.setItem('schemesetu_location', JSON.stringify(demoLoc));
    localStorage.setItem('schemesetu_location_status', 'demo');
    refreshPartnerDistances(demoLoc.lat, demoLoc.lng);
  }, [refreshPartnerDistances]);

  // Select state/district manually
  const setManualLocation = useCallback((stateName) => {
    const match = INDIAN_LOCATIONS.find(s => s.state === stateName) || INDIAN_LOCATIONS[0];
    const manualLoc = {
      lat: match.lat,
      lng: match.lng,
      state: match.state,
      district: match.district,
      address: `${match.district}, ${match.state}`,
      isGPS: false,
      isDemo: false
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

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
