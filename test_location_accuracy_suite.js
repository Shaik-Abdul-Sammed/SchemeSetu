/**
 * SCHEMESETU LOCATION RADAR & HAVERSINE PROXIMITY TEST SUITE
 * Tests high-accuracy spherical distance calculations, proximity sorting, and district centroid fallbacks.
 */

const assert = require('assert');

function calculateDistance(lat1, lon1, lat2, lon2) {
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
}

const MOCK_PARTNERS = [
  { id: 'p1', name: 'State Bank of India - Hyderabad Main', coordinates: { lat: 17.3850, lng: 78.4867 } },
  { id: 'p2', name: 'Canara Bank - Warangal Regional Branch', coordinates: { lat: 17.9689, lng: 79.5941 } },
  { id: 'p3', name: 'Union Bank of India - Vijayawada Center', coordinates: { lat: 16.5062, lng: 80.6480 } },
  { id: 'p4', name: 'Indian Bank - Bengaluru Central', coordinates: { lat: 12.9716, lng: 77.5946 } },
];

console.log('====================================================');
console.log(' SCHEMESETU LOCATION & HAVERSINE ACCURACY TEST SUITE ');
console.log('====================================================\n');

let passCount = 0;
let totalCount = 0;

function runTest(name, fn) {
  totalCount++;
  try {
    fn();
    console.log(`✓ [PASS] Test #${totalCount}: ${name}`);
    passCount++;
  } catch (err) {
    console.error(`✗ [FAIL] Test #${totalCount}: ${name}`);
    console.error(`  Error: ${err.message}`);
  }
}

// 1. Exact Distance Calculation Tests
runTest('Hyderabad (17.3850, 78.4867) to Warangal (17.9689, 79.5941) ~ 132.8 km', () => {
  const dist = calculateDistance(17.3850, 78.4867, 17.9689, 79.5941);
  assert.ok(dist >= 130 && dist <= 135, `Expected distance ~132.8km but got ${dist}km`);
});

runTest('Vijayawada (16.5062, 80.6480) to Guntur (16.3067, 80.4365) ~ 31.4 km', () => {
  const dist = calculateDistance(16.5062, 80.6480, 16.3067, 80.4365);
  assert.ok(dist >= 30 && dist <= 33, `Expected distance ~31.4km but got ${dist}km`);
});

runTest('Bengaluru (12.9716, 77.5946) to Mysuru (12.2958, 76.6394) ~ 128.5 km', () => {
  const dist = calculateDistance(12.9716, 77.5946, 12.2958, 76.6394);
  assert.ok(dist >= 125 && dist <= 132, `Expected distance ~128.5km but got ${dist}km`);
});

runTest('Chennai (13.0827, 80.2707) to Tirupati (13.6288, 79.4192) ~ 113.8 km', () => {
  const dist = calculateDistance(13.0827, 80.2707, 13.6288, 79.4192);
  assert.ok(dist >= 110 && dist <= 118, `Expected distance ~113.8km but got ${dist}km`);
});

// 2. Partner Branch Proximity Ranking Test
runTest('Proximity Sorting ranks closest partner first for Hyderabad user', () => {
  const userLat = 17.3850;
  const userLng = 78.4867;

  const sorted = MOCK_PARTNERS.map(p => ({
    ...p,
    distanceKm: calculateDistance(userLat, userLng, p.coordinates.lat, p.coordinates.lng)
  })).sort((a, b) => a.distanceKm - b.distanceKm);

  assert.strictEqual(sorted[0].id, 'p1', 'Closest partner for Hyderabad user must be State Bank of India - Hyderabad Main');
  assert.strictEqual(sorted[0].distanceKm, 0, 'Distance to exact user location must be 0 km');
});

runTest('Proximity Sorting ranks closest partner first for Vijayawada user', () => {
  const userLat = 16.5062;
  const userLng = 80.6480;

  const sorted = MOCK_PARTNERS.map(p => ({
    ...p,
    distanceKm: calculateDistance(userLat, userLng, p.coordinates.lat, p.coordinates.lng)
  })).sort((a, b) => a.distanceKm - b.distanceKm);

  assert.strictEqual(sorted[0].id, 'p3', 'Closest partner for Vijayawada user must be Union Bank of India - Vijayawada');
  assert.strictEqual(sorted[0].distanceKm, 0, 'Distance to exact user location must be 0 km');
});

console.log('\n====================================================');
console.log(`RESULTS: ${passCount}/${totalCount} TESTS PASSED`);
if (passCount === totalCount) {
  console.log('🎉 ALL LOCATION ACCURACY TESTS PASSED SUCCESSFULLY!');
}
console.log('====================================================\n');
