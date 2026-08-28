/**
 * Safe Capacitor Native Plugin Wrapper with Web Fallbacks
 */

export const isNativePlatform = () => {
  return typeof window !== 'undefined' && window.Capacitor && window.Capacitor.isNativePlatform();
};

export const safeGetLocation = async () => {
  if (isNativePlatform() && window.Capacitor?.Plugins?.Geolocation) {
    try {
      const position = await window.Capacitor.Plugins.Geolocation.getCurrentPosition();
      return {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
    } catch (e) {
      console.warn("Capacitor geolocation failed, falling back to Web API:", e);
    }
  }

  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      return resolve({ lat: 20.5937, lng: 78.9629 }); // India center fallback
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve({ lat: 20.5937, lng: 78.9629 }),
      { timeout: 8000 }
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
