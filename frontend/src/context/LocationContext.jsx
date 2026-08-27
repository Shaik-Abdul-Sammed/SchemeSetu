import React, { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext(null);

export function LocationProvider({ children }) {
  const [location, setLocation] = useState(() => {
    const saved = localStorage.getItem('schemesetu_location');
    return saved ? JSON.parse(saved) : {
      lat: 13.0827,
      lng: 80.2707,
      state: 'Telangana',
      district: 'Hyderabad',
      address: 'Hyderabad, Telangana, India',
      isGPS: false
    };
  });

  const [nearbyPartners, setNearbyPartners] = useState([]);

  const updateLocation = (newLoc) => {
    const updated = { ...location, ...newLoc };
    setLocation(updated);
    localStorage.setItem('schemesetu_location', JSON.stringify(updated));
  };

  return (
    <LocationContext.Provider value={{ location, updateLocation, nearbyPartners, setNearbyPartners }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  return useContext(LocationContext);
}
