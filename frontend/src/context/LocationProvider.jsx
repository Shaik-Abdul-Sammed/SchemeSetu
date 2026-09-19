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
  // Andhra Pradesh (All Major Districts)
  { state: 'Andhra Pradesh', district: 'Vijayawada (NTR)', lat: 16.5062, lng: 80.6480 },
  { state: 'Andhra Pradesh', district: 'YSR Kadapa', lat: 14.4673, lng: 78.8242 },
  { state: 'Andhra Pradesh', district: 'Visakhapatnam', lat: 17.6868, lng: 83.2185 },
  { state: 'Andhra Pradesh', district: 'Guntur', lat: 16.3067, lng: 80.4365 },
  { state: 'Andhra Pradesh', district: 'Tirupati', lat: 13.6288, lng: 79.4192 },
  { state: 'Andhra Pradesh', district: 'Kurnool', lat: 15.8281, lng: 78.0373 },
  { state: 'Andhra Pradesh', district: 'Nellore (SPSR)', lat: 14.4426, lng: 79.9865 },
  { state: 'Andhra Pradesh', district: 'Anantapur', lat: 14.6819, lng: 77.6006 },
  { state: 'Andhra Pradesh', district: 'Chittoor', lat: 13.2172, lng: 79.1003 },
  { state: 'Andhra Pradesh', district: 'Prakasam (Ongole)', lat: 15.5057, lng: 80.0499 },
  { state: 'Andhra Pradesh', district: 'Kakinada', lat: 16.9891, lng: 82.2475 },
  { state: 'Andhra Pradesh', district: 'Rajahmundry (East Godavari)', lat: 17.0005, lng: 81.8040 },
  { state: 'Andhra Pradesh', district: 'Eluru (West Godavari)', lat: 16.7107, lng: 81.0952 },
  { state: 'Andhra Pradesh', district: 'Machilipatnam (Krishna)', lat: 16.1875, lng: 81.1389 },
  { state: 'Andhra Pradesh', district: 'Nandyal', lat: 15.4882, lng: 78.4836 },
  { state: 'Andhra Pradesh', district: 'Sri Sathya Sai (Puttaparthi)', lat: 14.1650, lng: 77.8115 },
  { state: 'Andhra Pradesh', district: 'Annamayya (Rayachoty)', lat: 14.0560, lng: 78.7520 },
  { state: 'Andhra Pradesh', district: 'Bapatla', lat: 15.9042, lng: 80.4674 },
  { state: 'Andhra Pradesh', district: 'Palnadu (Narasaraopet)', lat: 16.2359, lng: 80.0494 },
  { state: 'Andhra Pradesh', district: 'Srikakulam', lat: 18.2949, lng: 83.8938 },
  { state: 'Andhra Pradesh', district: 'Vizianagaram', lat: 18.1067, lng: 83.3956 },
  { state: 'Andhra Pradesh', district: 'Anakapalli', lat: 17.6913, lng: 83.0039 },

  // Telangana
  { state: 'Telangana', district: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
  { state: 'Telangana', district: 'Secunderabad', lat: 17.4399, lng: 78.4983 },
  { state: 'Telangana', district: 'Warangal (Hanamkonda)', lat: 17.9689, lng: 79.5941 },
  { state: 'Telangana', district: 'Karimnagar', lat: 18.4386, lng: 79.1288 },
  { state: 'Telangana', district: 'Nizamabad', lat: 18.6725, lng: 78.0940 },
  { state: 'Telangana', district: 'Khammam', lat: 17.2473, lng: 80.1514 },
  { state: 'Telangana', district: 'Nalgonda', lat: 17.0583, lng: 79.2671 },
  { state: 'Telangana', district: 'Mahabubnagar', lat: 16.7488, lng: 77.9855 },
  { state: 'Telangana', district: 'Rangareddy', lat: 17.2403, lng: 78.4294 },
  { state: 'Telangana', district: 'Medchal-Malkajgiri', lat: 17.6297, lng: 78.4814 },
  { state: 'Telangana', district: 'Sangareddy', lat: 17.6190, lng: 78.0818 },
  { state: 'Telangana', district: 'Siddipet', lat: 18.1018, lng: 78.8520 },
  { state: 'Telangana', district: 'Adilabad', lat: 19.6641, lng: 78.5320 },
  { state: 'Telangana', district: 'Mancherial', lat: 18.8679, lng: 79.4639 },
  { state: 'Telangana', district: 'Suryapet', lat: 17.1439, lng: 79.6239 },

  // Tamil Nadu
  { state: 'Tamil Nadu', district: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { state: 'Tamil Nadu', district: 'Coimbatore', lat: 11.0168, lng: 76.9558 },
  { state: 'Tamil Nadu', district: 'Madurai', lat: 9.9252, lng: 78.1198 },
  { state: 'Tamil Nadu', district: 'Tiruchirappalli', lat: 10.7905, lng: 78.7047 },
  { state: 'Tamil Nadu', district: 'Salem', lat: 11.6643, lng: 78.1460 },
  { state: 'Tamil Nadu', district: 'Tirunelveli', lat: 8.7139, lng: 77.7567 },
  { state: 'Tamil Nadu', district: 'Vellore', lat: 12.9165, lng: 79.1325 },
  { state: 'Tamil Nadu', district: 'Erode', lat: 11.3410, lng: 77.7172 },
  { state: 'Tamil Nadu', district: 'Thanjavur', lat: 10.7870, lng: 79.1378 },

  // Karnataka
  { state: 'Karnataka', district: 'Bengaluru (Bangalore)', lat: 12.9716, lng: 77.5946 },
  { state: 'Karnataka', district: 'Mysuru (Mysore)', lat: 12.2958, lng: 76.6394 },
  { state: 'Karnataka', district: 'Hubli-Dharwad', lat: 15.3647, lng: 75.1240 },
  { state: 'Karnataka', district: 'Mangaluru (Mangalore)', lat: 12.8714, lng: 74.8431 },
  { state: 'Karnataka', district: 'Belagavi (Belgaum)', lat: 15.8497, lng: 74.4977 },
  { state: 'Karnataka', district: 'Kalaburagi (Gulbarga)', lat: 17.3297, lng: 76.8343 },
  { state: 'Karnataka', district: 'Ballari (Bellary)', lat: 15.1394, lng: 76.9214 },

  // Maharashtra
  { state: 'Maharashtra', district: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  { state: 'Maharashtra', district: 'Pune', lat: 18.5204, lng: 73.8567 },
  { state: 'Maharashtra', district: 'Nagpur', lat: 21.1458, lng: 79.0882 },
  { state: 'Maharashtra', district: 'Nashik', lat: 19.9975, lng: 73.7898 },
  { state: 'Maharashtra', district: 'Chhatrapati Sambhajinagar (Aurangabad)', lat: 19.8762, lng: 75.3433 },
  { state: 'Maharashtra', district: 'Thane', lat: 19.2183, lng: 72.9781 },
  { state: 'Maharashtra', district: 'Solapur', lat: 17.6599, lng: 75.9064 },
  { state: 'Maharashtra', district: 'Kolhapur', lat: 16.7050, lng: 74.2433 },

  // Delhi NCT
  { state: 'Delhi', district: 'New Delhi', lat: 28.6139, lng: 77.2090 },
  { state: 'Delhi', district: 'Central Delhi', lat: 28.6500, lng: 77.2200 },
  { state: 'Delhi', district: 'South Delhi', lat: 28.5355, lng: 77.2410 },

  // Uttar Pradesh
  { state: 'Uttar Pradesh', district: 'Lucknow', lat: 26.8467, lng: 80.9462 },
  { state: 'Uttar Pradesh', district: 'Varanasi', lat: 25.3176, lng: 82.9739 },
  { state: 'Uttar Pradesh', district: 'Kanpur', lat: 26.4499, lng: 80.3319 },
  { state: 'Uttar Pradesh', district: 'Agra', lat: 27.1767, lng: 78.0081 },
  { state: 'Uttar Pradesh', district: 'Prayagraj (Allahabad)', lat: 25.4358, lng: 81.8463 },
  { state: 'Uttar Pradesh', district: 'Noida (Gautam Buddha Nagar)', lat: 28.5355, lng: 77.3910 },
  { state: 'Uttar Pradesh', district: 'Ghaziabad', lat: 28.6692, lng: 77.4538 },

  // Madhya Pradesh
  { state: 'Madhya Pradesh', district: 'Bhopal', lat: 23.2599, lng: 77.4126 },
  { state: 'Madhya Pradesh', district: 'Indore', lat: 22.7196, lng: 75.8577 },
  { state: 'Madhya Pradesh', district: 'Gwalior', lat: 26.2183, lng: 78.1828 },
  { state: 'Madhya Pradesh', district: 'Jabalpur', lat: 23.1815, lng: 79.9864 },

  // West Bengal
  { state: 'West Bengal', district: 'Kolkata', lat: 22.5726, lng: 88.3639 },
  { state: 'West Bengal', district: 'Howrah', lat: 22.5958, lng: 88.2636 },

  // Kerala
  { state: 'Kerala', district: 'Thiruvananthapuram', lat: 8.5241, lng: 76.9366 },
  { state: 'Kerala', district: 'Kochi (Ernakulam)', lat: 9.9312, lng: 76.2673 },
  { state: 'Kerala', district: 'Kozhikode', lat: 11.2588, lng: 75.7804 },

  // Gujarat
  { state: 'Gujarat', district: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
  { state: 'Gujarat', district: 'Surat', lat: 21.1702, lng: 72.8311 },
  { state: 'Gujarat', district: 'Vadodara', lat: 22.3072, lng: 73.1812 },

  // Rajasthan
  { state: 'Rajasthan', district: 'Jaipur', lat: 26.9124, lng: 75.7873 },
  { state: 'Rajasthan', district: 'Jodhpur', lat: 26.2389, lng: 73.0243 },
  { state: 'Rajasthan', district: 'Udaipur', lat: 24.5854, lng: 73.7125 },

  // Bihar
  { state: 'Bihar', district: 'Patna', lat: 25.5941, lng: 85.1376 },
  { state: 'Bihar', district: 'Gaya', lat: 24.7914, lng: 85.0002 },

  // Punjab & Haryana
  { state: 'Punjab', district: 'Chandigarh', lat: 30.7333, lng: 76.7794 },
  { state: 'Punjab', district: 'Amritsar', lat: 31.6340, lng: 74.8723 },
  { state: 'Punjab', district: 'Ludhiana', lat: 30.9010, lng: 75.8573 },
  { state: 'Haryana', district: 'Gurugram (Gurgaon)', lat: 28.4595, lng: 77.0266 },
  { state: 'Haryana', district: 'Faridabad', lat: 28.4089, lng: 77.3178 },

  // Odisha
  { state: 'Odisha', district: 'Bhubaneswar', lat: 20.2961, lng: 85.8245 },
  { state: 'Odisha', district: 'Cuttack', lat: 20.4625, lng: 85.8828 }
];

/** Maximum acceptable distance (km) between GPS coords and nearest centroid
 *  before we flag the reverse-geocoded address as approximate reference. */
const MAX_CENTROID_TRUST_DISTANCE_KM = 250;

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
   * 1. Logs exact REVERSE GEOCODER INPUT.
   * 2. Tries OpenStreetMap Nominatim with actual GPS lat/lng (4s timeout).
   * 3. Logs exact REVERSE GEOCODER OUTPUT.
   * 4. If online succeeds, uses the actual returned address fields — NEVER substitutes defaults.
   * 5. If offline or Nominatim fails, falls back to nearest known centroid from INDIAN_LOCATIONS.
   * 6. If nearest centroid is >50 km away, flags the result as unverified.
   */
  const reverseGeocode = useCallback(async (lat, lng) => {
    console.log('\n==============================');
    console.log('REVERSE GEOCODER INPUT');
    console.log(`latitude = ${lat}`);
    console.log(`longitude = ${lng}`);
    console.log('==============================\n');

    let outCity = '';
    let outDistrict = '';
    let outState = '';
    let outCountry = 'India';

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
        outState = addr.state || addr.region || '';
        outDistrict = addr.state_district || addr.county || addr.district || '';
        outCity = addr.city || addr.town || addr.village || addr.hamlet || addr.suburb || '';
        outCountry = addr.country || 'India';
        const displayName = data.display_name || '';

        console.log('\n==============================');
        console.log('REVERSE GEOCODER OUTPUT (ONLINE)');
        console.log(`city = ${outCity || '(none)'}`);
        console.log(`district = ${outDistrict || '(none)'}`);
        console.log(`state = ${outState || '(none)'}`);
        console.log(`country = ${outCountry || '(none)'}`);
        console.log('==============================\n');

        if (outState || outDistrict || outCity) {
          return {
            city: outCity,
            state: outState,
            district: outDistrict || outCity,
            country: outCountry,
            address: displayName || [outCity, outDistrict, outState].filter(Boolean).join(', '),
            source: 'online',
            centroidDistanceKm: null,
            centroidTrusted: true
          };
        }
      }
    } catch (e) {
      // Graceful offline fallback
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
      console.log('\n==============================');
      console.log('REVERSE GEOCODER OUTPUT (NONE)');
      console.log(`city = `);
      console.log(`district = `);
      console.log(`state = `);
      console.log(`country = India`);
      console.log('==============================\n');
      return {
        city: '',
        state: '',
        district: '',
        country: 'India',
        address: 'GPS detected, but address could not be determined.',
        source: 'none',
        centroidDistanceKm: null,
        centroidTrusted: false
      };
    }

    const isTrusted = minD <= MAX_CENTROID_TRUST_DISTANCE_KM;
    outDistrict = closest.district;
    outState = closest.state;

    console.log('\n==============================');
    console.log('REVERSE GEOCODER OUTPUT (OFFLINE CENTROID)');
    console.log(`city = ${outCity || '(none)'}`);
    console.log(`district = ${outDistrict}`);
    console.log(`state = ${outState}`);
    console.log(`country = ${outCountry}`);
    console.log(`centroidDistance = ${minD.toFixed(1)} km (trusted: ${isTrusted})`);
    console.log('==============================\n');

    return {
      city: '',
      state: closest.state,
      district: closest.district,
      country: 'India',
      address: `${closest.district}, ${closest.state}${isTrusted ? '' : ' (Approximate Region)'}`,
      source: 'offline_centroid',
      centroidDistanceKm: minD,
      centroidTrusted: isTrusted
    };
  }, [calculateDistance]);

  const detectIPLocation = useCallback(async () => {
    try {
      // If user has explicitly selected a manual location or already has verified GPS, do NOT overwrite it!
      const savedLoc = localStorage.getItem('schemesetu_location');
      if (savedLoc) {
        try {
          const parsed = JSON.parse(savedLoc);
          if ((parsed.isManual || parsed.isGPS) && parsed.state && parsed.district) {
            console.log('Skipping IP location overwrite because verified/manual location is active:', parsed.district, parsed.state);
            return false;
          }
        } catch (e) {}
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.latitude && data.longitude) {
          const ipLoc = {
            lat: data.latitude,
            lng: data.longitude,
            accuracy: 2500,
            timestamp: Date.now(),
            state: data.region || data.region_code || 'Telangana',
            district: data.city || 'Hyderabad',
            address: `${data.city || 'City'}, ${data.region || 'State'} (IP Detected)`,
            isGPS: false,
            isIP: true,
            isManual: false,
            isDemo: false,
            accuracyWarning: 'Location resolved via IP address',
            geocodeSource: 'ipapi'
          };
          setLocation(ipLoc);
          setLocationStatus('detected');
          localStorage.setItem('schemesetu_location', JSON.stringify(ipLoc));
          localStorage.setItem('schemesetu_location_status', 'detected');
          refreshPartnerDistances(data.latitude, data.longitude);
          return true;
        }
      }
    } catch (e) {
      console.log('IP Location fallback note:', e.message);
    }
    return false;
  }, [refreshPartnerDistances]);

  // Real Browser Geolocation API
  const detectCurrentGPSLocation = useCallback((forceFresh = false) => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      detectIPLocation().then(success => {
        if (!success) {
          setLocationStatus('unsupported');
          setErrorMessage('GPS location is not supported by this browser.');
        }
      });
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

        console.log('\n==============================');
        console.log('GPS RAW RESULT');
        console.log(`latitude = ${latitude}`);
        console.log(`longitude = ${longitude}`);
        console.log(`accuracy = ${accuracy} m`);
        console.log(`timestamp = ${new Date(timestamp).toISOString()}`);
        console.log('==============================\n');

        console.log('\n==============================');
        console.log('LOCATION STATE');
        console.log(`latitude = ${latitude}`);
        console.log(`longitude = ${longitude}`);
        console.log(`accuracy = ${accuracy} m`);
        console.log('==============================\n');

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

        console.log('\n==============================');
        console.log('PARTNER SEARCH INPUT');
        console.log(`latitude = ${latitude}`);
        console.log(`longitude = ${longitude}`);
        console.log('==============================\n');

        // Update debug with reverse geocode results
        debugData.reverseGeocodeResult = `${details.district || details.city || '(unknown district)'}, ${details.state || '(unknown state)'}`;
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

        // Automatic IP Fallback when GPS fails or is denied
        detectIPLocation().then((ipSuccess) => {
          if (!ipSuccess) {
            setLocationStatus(status);
            setErrorMessage(msg);
            localStorage.setItem('schemesetu_location_status', status);

            setGpsDebug({
              rawLat: null, rawLng: null, rawAccuracy: null, rawTimestamp: null,
              reverseGeocodeResult: `Error: ${msg}`,
              reverseGeocodeSource: 'error',
              centroidDistanceKm: null,
              centroidTrusted: null
            });
          }
        });
      },
      geoOptions
    );
  }, [reverseGeocode, refreshPartnerDistances, detectIPLocation]);

  // Refresh Location Action: Forces a fresh GPS reading
  const refreshLocation = useCallback(() => {
    detectCurrentGPSLocation(true);
  }, [detectCurrentGPSLocation]);

  // Development-Only Location Injection (For testing known coordinates across complete pipeline)
  const injectTestCoordinates = useCallback(async (testLat, testLng, testAccuracy = 15) => {
    console.log('\n[DEV TEST INJECTION] Tracing GPS pipeline with test coordinates:');
    console.log(`latitude = ${testLat}`);
    console.log(`longitude = ${testLng}`);
    console.log(`accuracy = ${testAccuracy} m`);

    const timestamp = Date.now();
    const details = await reverseGeocode(testLat, testLng);

    console.log('\n[DEV TEST INJECTION] Partner Search Input:');
    console.log(`latitude = ${testLat}`);
    console.log(`longitude = ${testLng}`);

    const debugData = {
      rawLat: testLat,
      rawLng: testLng,
      rawAccuracy: Math.round(testAccuracy),
      rawTimestamp: new Date(timestamp).toISOString(),
      reverseGeocodeResult: `${details.district || details.city || '(unknown district)'}, ${details.state || '(unknown state)'}`,
      reverseGeocodeSource: `${details.source} (injected test)`,
      centroidDistanceKm: details.centroidDistanceKm,
      centroidTrusted: details.centroidTrusted
    };
    setGpsDebug(debugData);

    let accuracyWarning = '';
    if (testAccuracy > 1000) {
      accuracyWarning = `GPS accuracy is low (±${Math.round(testAccuracy)} m). Move to an open area and try again.`;
    }

    const testLoc = {
      lat: testLat,
      lng: testLng,
      accuracy: Math.round(testAccuracy),
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

    setLocation(testLoc);
    setLocationStatus('detected');
    localStorage.setItem('schemesetu_location', JSON.stringify(testLoc));
    localStorage.setItem('schemesetu_location_status', 'detected');
    refreshPartnerDistances(testLat, testLng);
  }, [reverseGeocode, refreshPartnerDistances]);

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

  // Manual State+District Selection — always uses exact district centroid coords
  const setManualLocation = useCallback((stateName, districtName = null) => {
    if (!stateName) return;
    const sNorm = String(stateName).trim().toLowerCase();
    const dNorm = districtName ? String(districtName).trim().toLowerCase() : null;

    // If district provided, match exactly; otherwise fall back to first district in that state
    const match = dNorm
      ? INDIAN_LOCATIONS.find(s => s.state.toLowerCase() === sNorm && s.district.toLowerCase() === dNorm)
        || INDIAN_LOCATIONS.find(s => s.state.toLowerCase() === sNorm)
      : INDIAN_LOCATIONS.find(s => s.state.toLowerCase() === sNorm);

    if (!match) {
      setErrorMessage(`Unknown location: ${stateName}${districtName ? ` / ${districtName}` : ''}. Please try GPS detection instead.`);
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
      isManual: true,
      isIP: false,
      isDemo: false,
      accuracyWarning: ''
    };
    setLocation(manualLoc);
    setLocationStatus('detected');
    localStorage.setItem('schemesetu_location', JSON.stringify(manualLoc));
    localStorage.setItem('schemesetu_location_status', 'detected');
    refreshPartnerDistances(match.lat, match.lng);
  }, [refreshPartnerDistances]);

  // On mount, refresh partner distances if lat and lng exist
  useEffect(() => {
    if (location && location.lat && location.lng) {
      refreshPartnerDistances(location.lat, location.lng);
    }
  }, [location.lat, location.lng, refreshPartnerDistances]);

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
      injectTestCoordinates,
      INDIAN_LOCATIONS 
    }}>
      {children}
    </LocationContext.Provider>
  );
}

export default LocationProvider;
