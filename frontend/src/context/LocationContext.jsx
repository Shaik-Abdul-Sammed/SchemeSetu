export { LocationContext, useLocation } from './useLocation';
export { LocationProvider, INDIAN_LOCATIONS, default } from './LocationProvider';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_PARTNERS } from '../data/mock/partners';

const LocationContext = createContext(null);

// Standard Indian State/UT centroids & capital districts for reliable fallback
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
  const [location, setLocation] = useState(() => {
    const saved = localStorage.getItem('schemesetu_location');
    return saved ? JSON.parse(saved) : {
      lat: 17.3850,
      lng: 78.4867,
      state: 'Telangana',
      district: 'Hyderabad',
      address: 'Hyderabad, Telangana, India',
      isGPS: false
    };
  });

  const [hasConsent, setHasConsent] = useState(() => {
    return localStorage.getItem('schemesetu_location_consent') === 'true';
  });

  const [nearbyPartners, setNearbyPartners] = useState(MOCK_PARTNERS);

  // Haversine formula to compute distance in km
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const updateLocation = (newLoc) => {
    const updated = { ...location, ...newLoc };
    setLocation(updated);
    localStorage.setItem('schemesetu_location', JSON.stringify(updated));

    // Recalculate distance for all mock partners
    if (updated.lat && updated.lng) {
      const recalculated = MOCK_PARTNERS.map(p => {
        const pLat = p.coordinates?.lat || p.lat || 17.3850;
        const pLng = p.coordinates?.lng || p.lng || 78.4867;
        const dist = calculateDistance(updated.lat, updated.lng, pLat, pLng);
        return {
          ...p,
          distance: dist,
          distanceKm: parseFloat(dist.toFixed(1)),
          distanceText: `${dist.toFixed(1)} km`
        };
      }).sort((a, b) => a.distance - b.distance);

      setNearbyPartners(recalculated);
    }
  };

  const requestGpsLocation = (consentGiven = true) => {
    if (consentGiven) {
      setHasConsent(true);
      localStorage.setItem('schemesetu_location_consent', 'true');
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          updateLocation({
            lat,
            lng,
            isGPS: true,
            address: `GPS Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`
          });
        },
        (err) => {
          console.log("GPS detection note:", err.message);
        },
        { timeout: 5000, enableHighAccuracy: false }
      );
    }
  };

  const selectStateLocation = (stateName) => {
    const found = INDIAN_LOCATIONS.find(l => l.state.toLowerCase() === stateName.toLowerCase());
    if (found) {
      updateLocation({
        lat: found.lat,
        lng: found.lng,
        state: found.state,
        district: found.district,
        address: `${found.district}, ${found.state}, India`,
        isGPS: false
      });
    }
  };

  // Attempt initial GPS check if user already gave consent
  useEffect(() => {
    if (hasConsent && navigator.geolocation && !location.isGPS) {
      requestGpsLocation(false);
    }
  }, [hasConsent]);

  return (
    <LocationContext.Provider value={{
      location,
      updateLocation,
      nearbyPartners,
      setNearbyPartners,
      calculateDistance,
      INDIAN_LOCATIONS,
      hasConsent,
      requestGpsLocation,
      selectStateLocation
    }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  return useContext(LocationContext);
}
