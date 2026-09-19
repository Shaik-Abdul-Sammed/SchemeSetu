import { createContext, useContext } from 'react';

const fallbackLocationContext = {
  location: { state: '', district: '', address: '', isGPS: false, isDemo: true },
  locationStatus: 'idle',
  nearbyPartners: [],
  detectGPSLocation: () => {},
  setManualLocation: () => {}
};

export const LocationContext = createContext(fallbackLocationContext);

export function useLocation() {
  const context = useContext(LocationContext);
  return context || fallbackLocationContext;
}

export default useLocation;
