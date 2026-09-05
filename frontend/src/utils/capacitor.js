/**
 * Safe Capacitor Native Plugin Wrapper with Web Fallbacks
 * 
 * IMPORTANT: This module NEVER returns fabricated coordinates.
 * If geolocation is unavailable or denied, it returns null — not fake defaults.
 */

export const isNativePlatform = () => {
  return typeof window !== 'undefined' && window.Capacitor && window.Capacitor.isNativePlatform();
};

/**
 * Attempts to get the device's real GPS location.
 * Returns { lat, lng, accuracy, timestamp } on success, or null on failure.
 * NEVER returns hardcoded fallback coordinates.
 */
export const safeGetLocation = async () => {
  // Try Capacitor native geolocation first (mobile apps)
  if (isNativePlatform() && window.Capacitor?.Plugins?.Geolocation) {
    try {
      const position = await window.Capacitor.Plugins.Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      });
      return {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy ? Math.round(position.coords.accuracy) : null,
        timestamp: position.timestamp || Date.now()
      };
    } catch (e) {
      console.warn("Capacitor geolocation failed, falling back to Web API:", e);
    }
  }

  // Web browser Geolocation API
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      // No geolocation available — return null, NOT fake coordinates
      return resolve(null);
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy ? Math.round(pos.coords.accuracy) : null,
        timestamp: pos.timestamp || Date.now()
      }),
      (err) => {
        console.warn('Geolocation error:', err.message);
        // Permission denied or unavailable — return null, NOT fake coordinates
        resolve(null);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  });
};

export const safeOpenExternalUrl = (url) => {
  if (isNativePlatform() && window.Capacitor?.Plugins?.Browser) {
    window.Capacitor.Plugins.Browser.open({ url });
  } else {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

export const safeStorage = {
  get: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error("Storage set error:", e);
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error("Storage remove error:", e);
    }
  }
};
