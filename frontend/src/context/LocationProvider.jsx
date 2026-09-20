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
/**
 * Normalize common Indian district and administrative naming quirks
 * to match canonical SchemeSetu district records.
 */
export function normalizeDistrictName(rawDistrict = '', state = '') {
  if (!rawDistrict) return '';
  const d = String(rawDistrict).trim();
  const lower = d.toLowerCase();
  
  // Andhra Pradesh — YSR Kadapa District (Mandals, Towns, Stations & Historic names)
  if (
    lower.includes('y.s.r') || lower.includes('ysr') || lower.includes('cuddapah') || lower.includes('kadapa') ||
    lower.includes('vempalli') || lower.includes('idupulapaya') || lower.includes('rk valley') ||
    lower.includes('pulivendula') || lower.includes('proddatur') || lower.includes('jammalamadugu') ||
    lower.includes('mydukur') || lower.includes('badvel') || lower.includes('kamalapuram') ||
    lower.includes('yerraguntla') || lower.includes('muddanur') || lower.includes('simhadripuram') ||
    lower.includes('lingala') || lower.includes('thondur') || lower.includes('vemula') ||
    lower.includes('chakrayapet') || lower.includes('pendlimarri') || lower.includes('vontimitta') ||
    lower.includes('siddavatam') || lower.includes('porumamilla') || lower.includes('chennur') ||
    lower.includes('khajipet') || lower.includes('chapadu') || lower.includes('duvvur') ||
    lower.includes('chinthakommadinne') || lower.includes('vallur') || lower.includes('brahmamgarimattam') ||
    lower.includes('atlur') || lower.includes('kalasapadu') || lower.includes('b.kodur') ||
    lower.includes('kasi nayana')
  ) return 'YSR Kadapa';

  // Andhra Pradesh — Other Districts
  if (lower.includes('n.t.r') || lower.includes('ntr') || lower.includes('vijayawada') || lower.includes('gannavaram') || lower.includes('jaggaiahpet')) return 'Vijayawada (NTR)';
  if (lower.includes('spsr') || lower.includes('potti sriramulu') || lower.includes('nellore') || lower.includes('kavali') || lower.includes('gudur')) return 'Nellore (SPSR)';
  if (lower.includes('sathya sai') || lower.includes('puttaparthi') || lower.includes('dharmavaram') || lower.includes('kadiri') || lower.includes('hindupur') || lower.includes('penukonda')) return 'Sri Sathya Sai (Puttaparthi)';
  if (lower.includes('annamayya') || lower.includes('rayachoty') || lower.includes('rayachoti') || lower.includes('rajampet') || lower.includes('madanapalle') || lower.includes('pileru')) return 'Annamayya (Rayachoty)';
  if (lower.includes('tirupati') || lower.includes('chandragiri') || lower.includes('srikalahasti') || lower.includes('renigunta')) return 'Tirupati';
  if (lower.includes('prakasam') || lower.includes('ongole') || lower.includes('chirala') || lower.includes('markapur')) return 'Prakasam (Ongole)';
  if (lower.includes('palnadu') || lower.includes('narasaraopet') || lower.includes('sattenapalle') || lower.includes('vinukonda')) return 'Palnadu (Narasaraopet)';
  if (lower.includes('bapatla')) return 'Bapatla';
  if (lower.includes('eluru')) return 'Eluru (West Godavari)';
  if (lower.includes('rajahmundry') || lower.includes('east godavari')) return 'Rajahmundry (East Godavari)';
  if (lower.includes('machilipatnam') || lower.includes('krishna')) return 'Machilipatnam (Krishna)';
  if (lower.includes('nandyal') || lower.includes('allagadda') || lower.includes('banaganapalle')) return 'Nandyal';
  if (lower.includes('kurnool') || lower.includes('adoni') || lower.includes('yemmiganur')) return 'Kurnool';
  if (lower.includes('anantapur') || lower.includes('guntakal') || lower.includes('tadipatri')) return 'Anantapur';

  // Telangana
  if (lower.includes('rangareddi') || lower.includes('ranga reddy')) return 'Rangareddy';
  if (lower.includes('hanamkonda') || lower.includes('warangal')) return 'Warangal (Hanamkonda)';
  if (lower.includes('medchal') || lower.includes('malkajgiri')) return 'Medchal-Malkajgiri';

  // Karnataka
  if (lower.includes('bangalore') || lower.includes('bengaluru')) return 'Bengaluru (Bangalore)';
  if (lower.includes('mysore') || lower.includes('mysuru')) return 'Mysuru (Mysore)';
  if (lower.includes('belgaum') || lower.includes('belagavi')) return 'Belagavi (Belgaum)';
  if (lower.includes('gulbarga') || lower.includes('kalaburagi')) return 'Kalaburagi (Gulbarga)';
  if (lower.includes('bellary') || lower.includes('ballari')) return 'Ballari (Bellary)';
  if (lower.includes('mangaluru') || lower.includes('mangalore') || lower.includes('dakshina kannada')) return 'Mangaluru (Mangalore)';
  if (lower.includes('hubli') || lower.includes('dharwad')) return 'Hubli-Dharwad';

  // Maharashtra
  if (lower.includes('aurangabad') || lower.includes('sambhajinagar')) return 'Chhatrapati Sambhajinagar (Aurangabad)';
  if (lower.includes('mumbai')) return 'Mumbai';
  
  // Uttar Pradesh
  if (lower.includes('allahabad') || lower.includes('prayagraj')) return 'Prayagraj (Allahabad)';
  if (lower.includes('gautam buddha nagar') || lower.includes('noida')) return 'Noida (Gautam Buddha Nagar)';
  if (lower.includes('faizabad') || lower.includes('ayodhya')) return 'Ayodhya';

  // Haryana
  if (lower.includes('gurgaon') || lower.includes('gurugram')) return 'Gurugram (Gurgaon)';

  // Kerala
  if (lower.includes('ernakulam') || lower.includes('kochi')) return 'Kochi (Ernakulam)';

  // Return cleaned original if no special normalization rule applies
  return d.replace(/\s+district$/i, '').trim();
}

/**
 * "Where Is My Train"-Style Offline Spatial Database:
 * Provides offline bounding-boxes, railway stations, mandals, and town coordinates.
 * Operates 100% offline without requiring external network calls.
 */
export const OFFLINE_INDIAN_SPATIAL_REGIONS = [
  {
    state: 'Andhra Pradesh',
    district: 'YSR Kadapa',
    bounds: { minLat: 13.75, maxLat: 15.30, minLng: 77.85, maxLng: 79.45 },
    keyNodes: [
      { name: 'Vempalli (RGUKT RK Valley / Idupulapaya)', lat: 14.3396, lng: 78.5818 },
      { name: 'Kadapa Central (HX Railway Station)', lat: 14.4673, lng: 78.8242 },
      { name: 'Pulivendula', lat: 14.4167, lng: 78.2333 },
      { name: 'Proddatur', lat: 14.7504, lng: 78.5528 },
      { name: 'Jammalamadugu', lat: 14.8500, lng: 78.3833 },
      { name: 'Yerraguntla Railway Junction (YA)', lat: 14.6333, lng: 78.5333 },
      { name: 'Mydukur', lat: 14.7000, lng: 78.6833 },
      { name: 'Badvel', lat: 14.7400, lng: 79.0550 },
      { name: 'Kamalapuram (KKM Station)', lat: 14.5833, lng: 78.6667 },
      { name: 'Muddanur (MOO Station)', lat: 14.6667, lng: 78.4000 },
      { name: 'Vontimitta (VNM Station)', lat: 14.3833, lng: 79.0333 },
      { name: 'Porumamilla', lat: 15.0167, lng: 78.9833 }
    ]
  },
  {
    state: 'Andhra Pradesh',
    district: 'Annamayya (Rayachoty)',
    bounds: { minLat: 13.40, maxLat: 14.35, minLng: 78.20, maxLng: 79.40 },
    keyNodes: [
      { name: 'Rayachoti', lat: 14.0560, lng: 78.7520 },
      { name: 'Rajampet (RJP Station)', lat: 14.1833, lng: 79.1500 },
      { name: 'Madanapalle', lat: 13.5500, lng: 78.5000 },
      { name: 'Railway Kodur', lat: 13.9500, lng: 79.3500 }
    ]
  },
  {
    state: 'Andhra Pradesh',
    district: 'Sri Sathya Sai (Puttaparthi)',
    bounds: { minLat: 13.60, maxLat: 14.50, minLng: 77.00, maxLng: 78.10 },
    keyNodes: [
      { name: 'Puttaparthi (SSPN Station)', lat: 14.1650, lng: 77.8115 },
      { name: 'Dharmavaram Junction (DMM)', lat: 14.4140, lng: 77.7210 },
      { name: 'Kadiri (KRY Station)', lat: 14.1167, lng: 78.1667 },
      { name: 'Hindupur (HUP Station)', lat: 13.8286, lng: 77.4914 }
    ]
  },
  {
    state: 'Andhra Pradesh',
    district: 'Tirupati',
    bounds: { minLat: 13.20, maxLat: 14.10, minLng: 79.10, maxLng: 80.20 },
    keyNodes: [
      { name: 'Tirupati Main (TPTY)', lat: 13.6288, lng: 79.4192 },
      { name: 'Renigunta Junction (RU)', lat: 13.6500, lng: 79.5167 },
      { name: 'Srikalahasti (KHT)', lat: 13.7500, lng: 79.7000 }
    ]
  },
  {
    state: 'Andhra Pradesh',
    district: 'Kurnool',
    bounds: { minLat: 15.20, maxLat: 16.10, minLng: 77.00, maxLng: 78.50 },
    keyNodes: [
      { name: 'Kurnool City (KRNT)', lat: 15.8281, lng: 78.0373 },
      { name: 'Adoni (AD)', lat: 15.6322, lng: 77.2728 }
    ]
  },
  {
    state: 'Andhra Pradesh',
    district: 'Nandyal',
    bounds: { minLat: 14.90, maxLat: 15.70, minLng: 78.00, maxLng: 79.10 },
    keyNodes: [
      { name: 'Nandyal Junction (NDL)', lat: 15.4882, lng: 78.4836 },
      { name: 'Allagadda', lat: 15.1333, lng: 78.5167 }
    ]
  },
  {
    state: 'Andhra Pradesh',
    district: 'Anantapur',
    bounds: { minLat: 14.30, maxLat: 15.20, minLng: 76.80, maxLng: 77.90 },
    keyNodes: [
      { name: 'Anantapur (ATP Station)', lat: 14.6819, lng: 77.6006 },
      { name: 'Guntakal Junction (GTL)', lat: 15.1700, lng: 77.3800 }
    ]
  }
];

/**
 * Resolves GPS / Network coordinates offline using bounding boxes and nearest station/mandal node,
 * exactly like "Where Is My Train" does for railway and district tracking.
 */
export function resolveWhereIsMyTrainLocation(lat, lng) {
  if (lat === null || lat === undefined || lng === null || lng === undefined) return null;
  const numLat = Number(lat);
  const numLng = Number(lng);
  if (isNaN(numLat) || isNaN(numLng)) return null;

  const R = 6371;
  const haversineDist = (lat1, lon1, lat2, lon2) => {
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  for (const region of OFFLINE_INDIAN_SPATIAL_REGIONS) {
    const { bounds, keyNodes } = region;
    if (numLat >= bounds.minLat && numLat <= bounds.maxLat &&
        numLng >= bounds.minLng && numLng <= bounds.maxLng) {
      let bestNode = keyNodes[0];
      let minNodeDist = Infinity;
      for (const node of keyNodes) {
        const d = haversineDist(numLat, numLng, node.lat, node.lng);
        if (d < minNodeDist) {
          minNodeDist = d;
          bestNode = node;
        }
      }
      return {
        state: region.state,
        district: region.district,
        nearestNode: bestNode.name,
        distanceKm: Math.round(minNodeDist * 10) / 10,
        isTrusted: true
      };
    }
  }
  return null;
}

/**
 * District-level centroids for offline reverse-geocoding fallback and manual selection.
 * Covers all 28 States and 8 Union Territories across India.
 */
export const INDIAN_LOCATIONS = [
  // ── 1. Andhra Pradesh ──
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

  // ── 2. Arunachal Pradesh ──
  { state: 'Arunachal Pradesh', district: 'Itanagar (Papum Pare)', lat: 27.0844, lng: 93.6053 },
  { state: 'Arunachal Pradesh', district: 'Tawang', lat: 27.5861, lng: 91.8594 },
  { state: 'Arunachal Pradesh', district: 'Pasighat (East Siang)', lat: 28.0664, lng: 95.3267 },

  // ── 3. Assam ──
  { state: 'Assam', district: 'Guwahati (Kamrup Metro)', lat: 26.1445, lng: 91.7362 },
  { state: 'Assam', district: 'Silchar (Cachar)', lat: 24.8333, lng: 92.7789 },
  { state: 'Assam', district: 'Dibrugarh', lat: 27.4728, lng: 94.9120 },
  { state: 'Assam', district: 'Jorhat', lat: 26.7509, lng: 94.2037 },
  { state: 'Assam', district: 'Tezpur (Sonitpur)', lat: 26.6528, lng: 92.7926 },
  { state: 'Assam', district: 'Nagaon', lat: 26.3466, lng: 92.6840 },

  // ── 4. Bihar ──
  { state: 'Bihar', district: 'Patna', lat: 25.5941, lng: 85.1376 },
  { state: 'Bihar', district: 'Gaya', lat: 24.7914, lng: 85.0002 },
  { state: 'Bihar', district: 'Muzaffarpur', lat: 26.1209, lng: 85.3647 },
  { state: 'Bihar', district: 'Bhagalpur', lat: 25.2425, lng: 86.9842 },
  { state: 'Bihar', district: 'Darbhanga', lat: 26.1542, lng: 85.8918 },
  { state: 'Bihar', district: 'Purnia', lat: 25.7771, lng: 87.4753 },

  // ── 5. Chhattisgarh ──
  { state: 'Chhattisgarh', district: 'Raipur', lat: 21.2514, lng: 81.6296 },
  { state: 'Chhattisgarh', district: 'Bilaspur', lat: 22.0797, lng: 82.1409 },
  { state: 'Chhattisgarh', district: 'Durg-Bhilai', lat: 21.1904, lng: 81.2849 },
  { state: 'Chhattisgarh', district: 'Korba', lat: 22.3595, lng: 82.7501 },
  { state: 'Chhattisgarh', district: 'Bastar (Jagdalpur)', lat: 19.0734, lng: 82.0206 },

  // ── 6. Goa ──
  { state: 'Goa', district: 'North Goa (Panaji)', lat: 15.4909, lng: 73.8278 },
  { state: 'Goa', district: 'South Goa (Margao)', lat: 15.2736, lng: 73.9582 },

  // ── 7. Gujarat ──
  { state: 'Gujarat', district: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
  { state: 'Gujarat', district: 'Surat', lat: 21.1702, lng: 72.8311 },
  { state: 'Gujarat', district: 'Vadodara', lat: 22.3072, lng: 73.1812 },
  { state: 'Gujarat', district: 'Rajkot', lat: 22.3039, lng: 70.8022 },
  { state: 'Gujarat', district: 'Bhavnagar', lat: 21.7645, lng: 72.1519 },
  { state: 'Gujarat', district: 'Gandhinagar', lat: 23.2156, lng: 72.6369 },

  // ── 8. Haryana ──
  { state: 'Haryana', district: 'Gurugram (Gurgaon)', lat: 28.4595, lng: 77.0266 },
  { state: 'Haryana', district: 'Faridabad', lat: 28.4089, lng: 77.3178 },
  { state: 'Haryana', district: 'Panipat', lat: 29.3909, lng: 76.9635 },
  { state: 'Haryana', district: 'Ambala', lat: 30.3782, lng: 76.7767 },
  { state: 'Haryana', district: 'Rohtak', lat: 28.8955, lng: 76.6066 },
  { state: 'Haryana', district: 'Hisar', lat: 29.1492, lng: 75.7217 },

  // ── 9. Himachal Pradesh ──
  { state: 'Himachal Pradesh', district: 'Shimla', lat: 31.1048, lng: 77.1734 },
  { state: 'Himachal Pradesh', district: 'Dharamshala (Kangra)', lat: 32.2190, lng: 76.3234 },
  { state: 'Himachal Pradesh', district: 'Mandi', lat: 31.7087, lng: 76.9320 },
  { state: 'Himachal Pradesh', district: 'Solan', lat: 30.9045, lng: 77.0967 },
  { state: 'Himachal Pradesh', district: 'Kullu', lat: 31.9579, lng: 77.1095 },

  // ── 10. Jharkhand ──
  { state: 'Jharkhand', district: 'Ranchi', lat: 23.3441, lng: 85.3096 },
  { state: 'Jharkhand', district: 'Jamshedpur (East Singhbhum)', lat: 22.8046, lng: 86.2029 },
  { state: 'Jharkhand', district: 'Dhanbad', lat: 23.7957, lng: 86.4304 },
  { state: 'Jharkhand', district: 'Bokaro', lat: 23.6693, lng: 86.1511 },
  { state: 'Jharkhand', district: 'Deoghar', lat: 24.4826, lng: 86.7013 },
  { state: 'Jharkhand', district: 'Hazaribagh', lat: 23.9961, lng: 85.3637 },

  // ── 11. Karnataka ──
  { state: 'Karnataka', district: 'Bengaluru (Bangalore)', lat: 12.9716, lng: 77.5946 },
  { state: 'Karnataka', district: 'Mysuru (Mysore)', lat: 12.2958, lng: 76.6394 },
  { state: 'Karnataka', district: 'Hubli-Dharwad', lat: 15.3647, lng: 75.1240 },
  { state: 'Karnataka', district: 'Mangaluru (Mangalore)', lat: 12.8714, lng: 74.8431 },
  { state: 'Karnataka', district: 'Belagavi (Belgaum)', lat: 15.8497, lng: 74.4977 },
  { state: 'Karnataka', district: 'Kalaburagi (Gulbarga)', lat: 17.3297, lng: 76.8343 },
  { state: 'Karnataka', district: 'Ballari (Bellary)', lat: 15.1394, lng: 76.9214 },
  { state: 'Karnataka', district: 'Shivamogga (Shimoga)', lat: 13.9299, lng: 75.5681 },
  { state: 'Karnataka', district: 'Davanagere', lat: 14.4644, lng: 75.9218 },
  { state: 'Karnataka', district: 'Tumakuru (Tumkur)', lat: 13.3379, lng: 77.1173 },

  // ── 12. Kerala ──
  { state: 'Kerala', district: 'Thiruvananthapuram', lat: 8.5241, lng: 76.9366 },
  { state: 'Kerala', district: 'Kochi (Ernakulam)', lat: 9.9312, lng: 76.2673 },
  { state: 'Kerala', district: 'Kozhikode', lat: 11.2588, lng: 75.7804 },
  { state: 'Kerala', district: 'Thrissur', lat: 10.5276, lng: 76.2144 },
  { state: 'Kerala', district: 'Kollam', lat: 8.8932, lng: 76.6141 },
  { state: 'Kerala', district: 'Palakkad', lat: 10.7867, lng: 76.6548 },
  { state: 'Kerala', district: 'Kannur', lat: 11.8745, lng: 75.3704 },
  { state: 'Kerala', district: 'Kottayam', lat: 9.5916, lng: 76.5222 },

  // ── 13. Madhya Pradesh ──
  { state: 'Madhya Pradesh', district: 'Bhopal', lat: 23.2599, lng: 77.4126 },
  { state: 'Madhya Pradesh', district: 'Indore', lat: 22.7196, lng: 75.8577 },
  { state: 'Madhya Pradesh', district: 'Gwalior', lat: 26.2183, lng: 78.1828 },
  { state: 'Madhya Pradesh', district: 'Jabalpur', lat: 23.1815, lng: 79.9864 },
  { state: 'Madhya Pradesh', district: 'Ujjain', lat: 23.1765, lng: 75.7885 },
  { state: 'Madhya Pradesh', district: 'Sagar', lat: 23.8388, lng: 78.7378 },
  { state: 'Madhya Pradesh', district: 'Rewa', lat: 24.5362, lng: 81.3037 },

  // ── 14. Maharashtra ──
  { state: 'Maharashtra', district: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  { state: 'Maharashtra', district: 'Pune', lat: 18.5204, lng: 73.8567 },
  { state: 'Maharashtra', district: 'Nagpur', lat: 21.1458, lng: 79.0882 },
  { state: 'Maharashtra', district: 'Nashik', lat: 19.9975, lng: 73.7898 },
  { state: 'Maharashtra', district: 'Chhatrapati Sambhajinagar (Aurangabad)', lat: 19.8762, lng: 75.3433 },
  { state: 'Maharashtra', district: 'Thane', lat: 19.2183, lng: 72.9781 },
  { state: 'Maharashtra', district: 'Solapur', lat: 17.6599, lng: 75.9064 },
  { state: 'Maharashtra', district: 'Kolhapur', lat: 16.7050, lng: 74.2433 },
  { state: 'Maharashtra', district: 'Amravati', lat: 20.9374, lng: 77.7796 },
  { state: 'Maharashtra', district: 'Nanded', lat: 19.1383, lng: 77.3210 },
  { state: 'Maharashtra', district: 'Jalgaon', lat: 21.0077, lng: 75.5626 },

  // ── 15. Manipur ──
  { state: 'Manipur', district: 'Imphal (Imphal West)', lat: 24.8170, lng: 93.9368 },
  { state: 'Manipur', district: 'Churachandpur', lat: 24.3333, lng: 93.6833 },
  { state: 'Manipur', district: 'Thoubal', lat: 24.6387, lng: 94.0044 },

  // ── 16. Meghalaya ──
  { state: 'Meghalaya', district: 'Shillong (East Khasi Hills)', lat: 25.5788, lng: 91.8933 },
  { state: 'Meghalaya', district: 'Tura (West Garo Hills)', lat: 25.5144, lng: 90.2034 },
  { state: 'Meghalaya', district: 'Jowai (West Jaintia Hills)', lat: 25.4528, lng: 92.2036 },

  // ── 17. Mizoram ──
  { state: 'Mizoram', district: 'Aizawl', lat: 23.7271, lng: 92.7176 },
  { state: 'Mizoram', district: 'Lunglei', lat: 22.8833, lng: 92.7333 },
  { state: 'Mizoram', district: 'Champhai', lat: 23.4566, lng: 93.3282 },

  // ── 18. Nagaland ──
  { state: 'Nagaland', district: 'Kohima', lat: 25.6751, lng: 94.1086 },
  { state: 'Nagaland', district: 'Dimapur', lat: 25.9063, lng: 93.7271 },
  { state: 'Nagaland', district: 'Mokokchung', lat: 26.3262, lng: 94.5228 },

  // ── 19. Odisha ──
  { state: 'Odisha', district: 'Bhubaneswar', lat: 20.2961, lng: 85.8245 },
  { state: 'Odisha', district: 'Cuttack', lat: 20.4625, lng: 85.8828 },
  { state: 'Odisha', district: 'Rourkela (Sundargarh)', lat: 22.2604, lng: 84.8536 },
  { state: 'Odisha', district: 'Berhampur (Ganjam)', lat: 19.3150, lng: 84.7941 },
  { state: 'Odisha', district: 'Sambalpur', lat: 21.4669, lng: 83.9812 },
  { state: 'Odisha', district: 'Puri', lat: 19.8135, lng: 85.8312 },
  { state: 'Odisha', district: 'Balasore', lat: 21.4934, lng: 86.9135 },

  // ── 20. Punjab ──
  { state: 'Punjab', district: 'Chandigarh', lat: 30.7333, lng: 76.7794 },
  { state: 'Punjab', district: 'Amritsar', lat: 31.6340, lng: 74.8723 },
  { state: 'Punjab', district: 'Ludhiana', lat: 30.9010, lng: 75.8573 },
  { state: 'Punjab', district: 'Jalandhar', lat: 31.3260, lng: 75.5762 },
  { state: 'Punjab', district: 'Patiala', lat: 30.3398, lng: 76.3869 },
  { state: 'Punjab', district: 'Bathinda', lat: 30.2110, lng: 74.9455 },

  // ── 21. Rajasthan ──
  { state: 'Rajasthan', district: 'Jaipur', lat: 26.9124, lng: 75.7873 },
  { state: 'Rajasthan', district: 'Jodhpur', lat: 26.2389, lng: 73.0243 },
  { state: 'Rajasthan', district: 'Udaipur', lat: 24.5854, lng: 73.7125 },
  { state: 'Rajasthan', district: 'Kota', lat: 25.2138, lng: 75.8648 },
  { state: 'Rajasthan', district: 'Bikaner', lat: 28.0229, lng: 73.3119 },
  { state: 'Rajasthan', district: 'Ajmer', lat: 26.4499, lng: 74.6399 },
  { state: 'Rajasthan', district: 'Alwar', lat: 27.5530, lng: 76.6346 },
  { state: 'Rajasthan', district: 'Bhilwara', lat: 25.3474, lng: 74.6408 },

  // ── 22. Sikkim ──
  { state: 'Sikkim', district: 'Gangtok (East Sikkim)', lat: 27.3389, lng: 88.6065 },
  { state: 'Sikkim', district: 'Namchi (South Sikkim)', lat: 27.1667, lng: 88.3500 },
  { state: 'Sikkim', district: 'Geyzing (West Sikkim)', lat: 27.2889, lng: 88.2431 },
  { state: 'Sikkim', district: 'Mangan (North Sikkim)', lat: 27.5097, lng: 88.5292 },

  // ── 23. Tamil Nadu ──
  { state: 'Tamil Nadu', district: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { state: 'Tamil Nadu', district: 'Coimbatore', lat: 11.0168, lng: 76.9558 },
  { state: 'Tamil Nadu', district: 'Madurai', lat: 9.9252, lng: 78.1198 },
  { state: 'Tamil Nadu', district: 'Tiruchirappalli', lat: 10.7905, lng: 78.7047 },
  { state: 'Tamil Nadu', district: 'Salem', lat: 11.6643, lng: 78.1460 },
  { state: 'Tamil Nadu', district: 'Tirunelveli', lat: 8.7139, lng: 77.7567 },
  { state: 'Tamil Nadu', district: 'Vellore', lat: 12.9165, lng: 79.1325 },
  { state: 'Tamil Nadu', district: 'Erode', lat: 11.3410, lng: 77.7172 },
  { state: 'Tamil Nadu', district: 'Thanjavur', lat: 10.7870, lng: 79.1378 },
  { state: 'Tamil Nadu', district: 'Tiruppur', lat: 11.1085, lng: 77.3411 },
  { state: 'Tamil Nadu', district: 'Dindigul', lat: 10.3673, lng: 77.9803 },
  { state: 'Tamil Nadu', district: 'Thoothukudi', lat: 8.7642, lng: 78.1348 },

  // ── 24. Telangana ──
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
  { state: 'Telangana', district: 'Jagtial', lat: 18.7972, lng: 78.9140 },
  { state: 'Telangana', district: 'Kamareddy', lat: 18.3242, lng: 78.3410 },

  // ── 25. Tripura ──
  { state: 'Tripura', district: 'Agartala (West Tripura)', lat: 23.8315, lng: 91.2868 },
  { state: 'Tripura', district: 'Gomati (Udaipur)', lat: 23.5333, lng: 91.4833 },
  { state: 'Tripura', district: 'Dharmanagar (North Tripura)', lat: 24.3807, lng: 92.1648 },

  // ── 26. Uttar Pradesh ──
  { state: 'Uttar Pradesh', district: 'Lucknow', lat: 26.8467, lng: 80.9462 },
  { state: 'Uttar Pradesh', district: 'Varanasi', lat: 25.3176, lng: 82.9739 },
  { state: 'Uttar Pradesh', district: 'Kanpur', lat: 26.4499, lng: 80.3319 },
  { state: 'Uttar Pradesh', district: 'Agra', lat: 27.1767, lng: 78.0081 },
  { state: 'Uttar Pradesh', district: 'Prayagraj (Allahabad)', lat: 25.4358, lng: 81.8463 },
  { state: 'Uttar Pradesh', district: 'Noida (Gautam Buddha Nagar)', lat: 28.5355, lng: 77.3910 },
  { state: 'Uttar Pradesh', district: 'Ghaziabad', lat: 28.6692, lng: 77.4538 },
  { state: 'Uttar Pradesh', district: 'Meerut', lat: 28.9845, lng: 77.7064 },
  { state: 'Uttar Pradesh', district: 'Bareilly', lat: 28.3670, lng: 79.4304 },
  { state: 'Uttar Pradesh', district: 'Aligarh', lat: 27.8974, lng: 78.0880 },
  { state: 'Uttar Pradesh', district: 'Moradabad', lat: 28.8353, lng: 78.7747 },
  { state: 'Uttar Pradesh', district: 'Gorakhpur', lat: 26.7606, lng: 83.3732 },
  { state: 'Uttar Pradesh', district: 'Ayodhya', lat: 26.7922, lng: 82.1998 },
  { state: 'Uttar Pradesh', district: 'Jhansi', lat: 25.4484, lng: 78.5685 },
  { state: 'Uttar Pradesh', district: 'Mathura', lat: 27.4924, lng: 77.6737 },

  // ── 27. Uttarakhand ──
  { state: 'Uttarakhand', district: 'Dehradun', lat: 30.3165, lng: 78.0322 },
  { state: 'Uttarakhand', district: 'Haridwar', lat: 29.9457, lng: 78.1642 },
  { state: 'Uttarakhand', district: 'Nainital', lat: 29.3919, lng: 79.4542 },
  { state: 'Uttarakhand', district: 'Haldwani', lat: 29.2183, lng: 79.5130 },
  { state: 'Uttarakhand', district: 'Almora', lat: 29.5971, lng: 79.6591 },
  { state: 'Uttarakhand', district: 'Rishikesh', lat: 30.0869, lng: 78.2676 },
  { state: 'Uttarakhand', district: 'Roorkee', lat: 29.8543, lng: 77.8880 },

  // ── 28. West Bengal ──
  { state: 'West Bengal', district: 'Kolkata', lat: 22.5726, lng: 88.3639 },
  { state: 'West Bengal', district: 'Howrah', lat: 22.5958, lng: 88.2636 },
  { state: 'West Bengal', district: 'Siliguri (Darjeeling)', lat: 26.7271, lng: 88.3953 },
  { state: 'West Bengal', district: 'Asansol (Paschim Bardhaman)', lat: 23.6739, lng: 86.9524 },
  { state: 'West Bengal', district: 'Durgapur', lat: 23.5204, lng: 87.3119 },
  { state: 'West Bengal', district: 'Kharagpur (Paschim Medinipur)', lat: 22.3400, lng: 87.2300 },
  { state: 'West Bengal', district: 'Malda', lat: 25.0108, lng: 88.1411 },
  { state: 'West Bengal', district: 'Burdwan (Purba Bardhaman)', lat: 23.2324, lng: 87.8615 },

  // ── UNION TERRITORIES ──
  // ── 29. Andaman and Nicobar Islands ──
  { state: 'Andaman and Nicobar Islands', district: 'Port Blair (South Andaman)', lat: 11.6234, lng: 92.7265 },
  { state: 'Andaman and Nicobar Islands', district: 'Nicobar', lat: 9.1550, lng: 92.8180 },

  // ── 30. Chandigarh ──
  { state: 'Chandigarh', district: 'Chandigarh', lat: 30.7333, lng: 76.7794 },

  // ── 31. Dadra and Nagar Haveli and Daman and Diu ──
  { state: 'Dadra and Nagar Haveli and Daman and Diu', district: 'Daman', lat: 20.3974, lng: 72.8328 },
  { state: 'Dadra and Nagar Haveli and Daman and Diu', district: 'Diu', lat: 20.7144, lng: 70.9874 },
  { state: 'Dadra and Nagar Haveli and Daman and Diu', district: 'Silvassa', lat: 20.2763, lng: 73.0083 },

  // ── 32. Delhi ──
  { state: 'Delhi', district: 'New Delhi', lat: 28.6139, lng: 77.2090 },
  { state: 'Delhi', district: 'Central Delhi', lat: 28.6500, lng: 77.2200 },
  { state: 'Delhi', district: 'South Delhi', lat: 28.5355, lng: 77.2410 },
  { state: 'Delhi', district: 'North Delhi', lat: 28.7180, lng: 77.1680 },
  { state: 'Delhi', district: 'East Delhi', lat: 28.6300, lng: 77.2900 },
  { state: 'Delhi', district: 'West Delhi', lat: 28.6400, lng: 77.1000 },

  // ── 33. Jammu and Kashmir ──
  { state: 'Jammu and Kashmir', district: 'Srinagar', lat: 34.0837, lng: 74.7973 },
  { state: 'Jammu and Kashmir', district: 'Jammu', lat: 32.7266, lng: 74.8570 },
  { state: 'Jammu and Kashmir', district: 'Anantnag', lat: 33.7311, lng: 75.1522 },
  { state: 'Jammu and Kashmir', district: 'Baramulla', lat: 34.2000, lng: 74.3400 },
  { state: 'Jammu and Kashmir', district: 'Udhampur', lat: 32.9250, lng: 75.1410 },

  // ── 34. Ladakh ──
  { state: 'Ladakh', district: 'Leh', lat: 34.1526, lng: 77.5771 },
  { state: 'Ladakh', district: 'Kargil', lat: 34.5539, lng: 76.1349 },

  // ── 35. Lakshadweep ──
  { state: 'Lakshadweep', district: 'Kavaratti', lat: 10.5667, lng: 72.6417 },
  { state: 'Lakshadweep', district: 'Agatti', lat: 10.8533, lng: 72.1931 },

  // ── 36. Puducherry ──
  { state: 'Puducherry', district: 'Puducherry', lat: 11.9416, lng: 79.8083 },
  { state: 'Puducherry', district: 'Karaikal', lat: 10.9254, lng: 79.8380 },
  { state: 'Puducherry', district: 'Mahe', lat: 11.7002, lng: 75.5340 },
  { state: 'Puducherry', district: 'Yanam', lat: 16.7333, lng: 82.2167 }
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

    // 1. Where Is My Train Offline Spatial Check (Immediate, 100% reliable)
    const trainSpatial = resolveWhereIsMyTrainLocation(lat, lng);

    let outCity = trainSpatial ? trainSpatial.nearestNode : '';
    let outDistrict = trainSpatial ? trainSpatial.district : '';
    let outState = trainSpatial ? trainSpatial.state : '';
    let outCountry = 'India';

    // --- Primary attempt: OpenStreetMap Nominatim (without forbidden User-Agent header) ---
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en&zoom=14`,
        {
          signal: controller.signal
        }
      );
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const nomState = addr.state || addr.region || '';
        const rawDistrict = addr.state_district || addr.county || addr.district || addr.city || '';
        const nomDistrict = normalizeDistrictName(rawDistrict, nomState);
        const nomCity = addr.city || addr.town || addr.village || addr.hamlet || addr.suburb || '';
        const displayName = data.display_name || '';

        // Prioritize offline Where Is My Train verified district if matched in polygon
        const finalDistrict = trainSpatial ? trainSpatial.district : (nomDistrict || nomCity);
        const finalState = trainSpatial ? trainSpatial.state : (nomState || 'Andhra Pradesh');
        const finalCity = nomCity || (trainSpatial ? trainSpatial.nearestNode : '');

        console.log('\n==============================');
        console.log('REVERSE GEOCODER OUTPUT (ONLINE - NOMINATIM + WHERE IS MY TRAIN VERIFIED)');
        console.log(`city = ${finalCity || '(none)'}`);
        console.log(`district = ${finalDistrict || '(none)'}`);
        console.log(`state = ${finalState || '(none)'}`);
        console.log('==============================\n');

        if (finalState || finalDistrict) {
          return {
            city: finalCity,
            state: finalState,
            district: finalDistrict,
            country: 'India',
            address: displayName || [finalCity, finalDistrict, finalState].filter(Boolean).join(', '),
            source: 'online_nominatim',
            centroidDistanceKm: trainSpatial ? trainSpatial.distanceKm : null,
            centroidTrusted: true
          };
        }
      }
    } catch (e) {
      // Graceful fallback to secondary geocoder
    }

    // --- Secondary attempt: BigDataCloud free client reverse geocoder ---
    try {
      const bdcController = new AbortController();
      const bdcTimeout = setTimeout(() => bdcController.abort(), 3500);
      const bdcRes = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
        { signal: bdcController.signal }
      );
      clearTimeout(bdcTimeout);
      if (bdcRes.ok) {
        const bdcData = await bdcRes.json();
        const bdcState = bdcData.principalSubdivision || '';
        const admin2 = bdcData.localityInfo?.administrative?.find(a => a.adminLevel === 6 || a.adminLevel === 5)?.name || '';
        const rawDist = admin2 || bdcData.city || bdcData.locality || '';
        const bdcDistrict = normalizeDistrictName(rawDist, bdcState);
        const bdcCity = bdcData.city || bdcData.locality || '';

        const finalDistrict = trainSpatial ? trainSpatial.district : (bdcDistrict || bdcCity);
        const finalState = trainSpatial ? trainSpatial.state : bdcState;

        if (finalState || finalDistrict) {
          console.log('\n==============================');
          console.log('REVERSE GEOCODER OUTPUT (ONLINE - BIGDATACLOUD)');
          console.log(`city = ${bdcCity || '(none)'}`);
          console.log(`district = ${finalDistrict || '(none)'}`);
          console.log(`state = ${finalState || '(none)'}`);
          console.log('==============================\n');

          const addrParts = [bdcCity, finalDistrict, finalState].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i);
          return {
            city: bdcCity,
            state: finalState,
            district: finalDistrict,
            country: 'India',
            address: addrParts.join(', ') || `${finalDistrict}, ${finalState}`,
            source: 'online_bigdatacloud',
            centroidDistanceKm: trainSpatial ? trainSpatial.distanceKm : null,
            centroidTrusted: true
          };
        }
      }
    } catch (e) {
      // Graceful fallback to offline Where Is My Train engine
    }

    // --- Tier 1 Offline Fallback: Where Is My Train Spatial Bounding Box & Station Index ---
    if (trainSpatial) {
      console.log('\n==============================');
      console.log('REVERSE GEOCODER OUTPUT (WHERE IS MY TRAIN OFFLINE SPATIAL)');
      console.log(`nearestNode = ${trainSpatial.nearestNode}`);
      console.log(`district = ${trainSpatial.district}`);
      console.log(`state = ${trainSpatial.state}`);
      console.log(`distance = ${trainSpatial.distanceKm} km`);
      console.log('==============================\n');

      return {
        city: trainSpatial.nearestNode,
        state: trainSpatial.state,
        district: trainSpatial.district,
        country: 'India',
        address: `${trainSpatial.nearestNode}, ${trainSpatial.district}, ${trainSpatial.state}`,
        source: 'where_is_my_train_offline',
        centroidDistanceKm: trainSpatial.distanceKm,
        centroidTrusted: true
      };
    }

    // --- Tier 2 Offline fallback: find nearest centroid across all 36 Indian states & UTs ---
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
    console.log(`district = ${outDistrict}`);
    console.log(`state = ${outState}`);
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

      let ipData = null;

      // Primary IP Endpoint: ipapi.co
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
          const d = await res.json();
          if (d.latitude && d.longitude) {
            ipData = {
              lat: d.latitude,
              lng: d.longitude,
              state: d.region || d.region_code || '',
              district: normalizeDistrictName(d.city || '', d.region || ''),
              source: 'ipapi'
            };
          }
        }
      } catch (e) {
        // Fall through to secondary IP provider
      }

      // Secondary IP Endpoint: ipwho.is (CORS friendly, fast global CDN)
      if (!ipData) {
        try {
          const controller2 = new AbortController();
          const timeoutId2 = setTimeout(() => controller2.abort(), 3500);
          const res2 = await fetch('https://ipwho.is/', { signal: controller2.signal });
          clearTimeout(timeoutId2);
          if (res2.ok) {
            const d2 = await res2.json();
            if (d2.success && d2.latitude && d2.longitude) {
              ipData = {
                lat: d2.latitude,
                lng: d2.longitude,
                state: d2.region || '',
                district: normalizeDistrictName(d2.city || '', d2.region || ''),
                source: 'ipwhois'
              };
            }
          }
        } catch (e) {
          // Both IP services failed
        }
      }

      if (ipData) {
        // India Bounding Box: Latitude 6.0°N to 38.0°N, Longitude 68.0°E to 98.0°E
        const numLat = Number(ipData.lat);
        const numLng = Number(ipData.lng);
        const isInsideIndia = !isNaN(numLat) && !isNaN(numLng) &&
          numLat >= 6.0 && numLat <= 38.0 &&
          numLng >= 68.0 && numLng <= 98.0;

        if (!isInsideIndia) {
          console.warn('IP geolocation coordinates outside India boundary, skipping:', numLat, numLng);
          return false;
        }

        const ipAddress = [ipData.district, ipData.state].filter(Boolean).join(', ');
        const ipLoc = {
          lat: ipData.lat,
          lng: ipData.lng,
          accuracy: 5000,
          timestamp: Date.now(),
          state: ipData.state,
          district: ipData.district,
          address: ipAddress ? `${ipAddress} (IP Approximate)` : 'Approximate IP Location',
          isGPS: false,
          isIP: true,
          isManual: false,
          isDemo: false,
          accuracyWarning: 'Location estimated via IP address (approximate)',
          geocodeSource: ipData.source
        };
        setLocation(ipLoc);
        setLocationStatus('detected');
        localStorage.setItem('schemesetu_location', JSON.stringify(ipLoc));
        localStorage.setItem('schemesetu_location_status', 'detected');
        refreshPartnerDistances(ipData.lat, ipData.lng);
        return true;
      }
    } catch (e) {
      console.log('IP Location fallback note:', e.message);
    }
    return false;
  }, [refreshPartnerDistances]);

  // ─────────────────────────────────────────────────────────────────────────
  // 3-Layer Location Detection: GPS → Cell/WiFi → IP
  // ─────────────────────────────────────────────────────────────────────────

  const applyGPSPosition = useCallback(async (pos, sourceLabel) => {
    const { latitude, longitude, accuracy } = pos.coords;
    const timestamp = pos.timestamp || Date.now();

    // ── Where Is My Train Style Filter: When accuracy > 20km, the device is returning
    // an ISP/cell tower estimate — NOT a real GPS fix. In this case, we must NOT save
    // it as an accurate GPS location, and NEVER overwrite manual selection.
    const savedLoc = localStorage.getItem('schemesetu_location');
    if (savedLoc) {
      try {
        const parsed = JSON.parse(savedLoc);
        if (parsed.isManual && parsed.district) {
          console.log('[GPS] Preserving user manual location selection:', parsed.district, parsed.state);
          return;
        }
      } catch (e) {}
    }

    if (accuracy && accuracy > 20000) {
      console.warn(`[GPS] Accuracy too poor (±${Math.round(accuracy / 1000)} km) — skipping GPS save, falling back to IP/manual.`);
      const ipSuccess = await detectIPLocation();
      if (!ipSuccess) {
        setLocationStatus('unavailable');
        setErrorMessage(`GPS accuracy too low (±${Math.round(accuracy / 1000)} km). Please select your State & District manually.`);
      }
      return;
    }

    const debugData = {
      rawLat: latitude,
      rawLng: longitude,
      rawAccuracy: accuracy ? Math.round(accuracy) : null,
      rawTimestamp: new Date(timestamp).toISOString(),
      reverseGeocodeResult: null,
      reverseGeocodeSource: sourceLabel,
      centroidDistanceKm: null,
      centroidTrusted: null
    };

    const details = await reverseGeocode(latitude, longitude);
    debugData.reverseGeocodeResult = `${details.district || details.city || '(unknown district)'}, ${details.state || '(unknown state)'}`;
    debugData.reverseGeocodeSource = details.source;
    debugData.centroidDistanceKm = details.centroidDistanceKm;
    debugData.centroidTrusted = details.centroidTrusted;
    setGpsDebug(debugData);

    let accuracyWarning = '';
    if (accuracy && accuracy > 1000) {
      accuracyWarning = `Location accuracy is low (±${Math.round(accuracy)} m). Move to an open area for a better reading.`;
    }

    const gpsLoc = {
      lat: latitude,
      lng: longitude,
      accuracy: accuracy ? Math.round(accuracy) : null,
      timestamp,
      state: details.state,
      district: details.district,
      city: details.city || '',
      address: details.address,
      isGPS: true,
      isDemo: false,
      accuracyWarning,
      geocodeSource: details.source,
      centroidTrusted: details.centroidTrusted,
      locationSource: sourceLabel  // 'gps' | 'network' | 'cell_tower' | 'ip'
    };

    setLocation(gpsLoc);
    setLocationStatus('detected');
    localStorage.setItem('schemesetu_location', JSON.stringify(gpsLoc));
    localStorage.setItem('schemesetu_location_status', 'detected');
    refreshPartnerDistances(latitude, longitude);
  }, [reverseGeocode, refreshPartnerDistances, detectIPLocation]);

  // Layer 2 — Cell tower / WiFi network triangulation
  const detectNetworkLocation = useCallback(() => {
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => { await applyGPSPosition(pos, 'cell_tower'); resolve(true); },
        () => resolve(false),
        { enableHighAccuracy: false, timeout: 6000, maximumAge: 60000 }
      );
    });
  }, [applyGPSPosition]);

  // Main entry — 3-layer detection: GPS → Cell Tower Network → IP
  const detectCurrentGPSLocation = useCallback((forceFresh = false) => {
    if (!forceFresh) {
      const savedLoc = localStorage.getItem('schemesetu_location');
      if (savedLoc) {
        try {
          const parsed = JSON.parse(savedLoc);
          if (parsed.isManual && parsed.district) {
            console.log('[Location] Keeping saved manual location, skipping background GPS:', parsed.district, parsed.state);
            return;
          }
        } catch (e) {}
      }
    }

    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      detectIPLocation().then(success => {
        if (!success) { setLocationStatus('unsupported'); setErrorMessage('GPS location is not supported by this browser.'); }
      });
      return;
    }

    setLocationStatus('detecting');
    setErrorMessage('');

    // Layer 1 — GPS chip (high accuracy, ≤100m preferred)
    const geoOptionsGPS = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { accuracy } = pos.coords;
        const source = (accuracy && accuracy <= 100) ? 'gps' : 'cell_tower';
        await applyGPSPosition(pos, source);
      },
      async (err) => {
        if (err.code === 1) { // PERMISSION_DENIED — no fallback possible
          setLocationStatus('denied');
          setErrorMessage('Location permission was denied. Please select your State & District manually.');
          localStorage.setItem('schemesetu_location_status', 'denied');
          setGpsDebug({ rawLat: null, rawLng: null, rawAccuracy: null, rawTimestamp: null,
            reverseGeocodeResult: 'Permission denied', reverseGeocodeSource: 'permission_denied',
            centroidDistanceKm: null, centroidTrusted: null });
          return;
        }

        // Layer 2 — Cell tower / WiFi triangulation
        const networkSuccess = await detectNetworkLocation();
        if (networkSuccess) return;

        // Layer 3 — IP geolocation (always gives at least city/state)
        const savedLoc = localStorage.getItem('schemesetu_location');
        let hasSaved = false;
        if (savedLoc) { try { const p = JSON.parse(savedLoc); if (p.state && p.district) hasSaved = true; } catch(e) {} }

        if (!hasSaved) {
          const ipSuccess = await detectIPLocation();
          if (!ipSuccess) {
            setLocationStatus('unavailable');
            setErrorMessage('Could not determine your location. Please select State & District manually.');
          }
        }
      },
      geoOptionsGPS
    );
  }, [applyGPSPosition, detectNetworkLocation, detectIPLocation]);

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

  // Auto-detect exact location on mount — always trigger fresh detection.
  // Also clear stale bad-accuracy cached location that was saved as "GPS" but
  // was actually a network/IP estimate (the browser passed it through the GPS API).
  useEffect(() => {
    const saved = localStorage.getItem('schemesetu_location');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // If this "GPS" location had no real accuracy constraint (i.e. it was saved
        // from a network/IP estimate with terrible accuracy), purge it so we try fresh.
        const isStaleInaccurateGPS = parsed.isGPS && parsed.isIP !== true &&
          parsed.isManual !== true && parsed.isDemo !== true &&
          (!parsed.accuracy || parsed.accuracy > 80000);
        if (isStaleInaccurateGPS) {
          console.log('[Location] Clearing stale low-accuracy GPS cache, forcing fresh detection.');
          localStorage.removeItem('schemesetu_location');
          localStorage.removeItem('schemesetu_location_status');
        }
      } catch (e) {}
    }
    // Always attempt fresh location detection on every mount
    detectCurrentGPSLocation();
  }, [detectCurrentGPSLocation]);

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
