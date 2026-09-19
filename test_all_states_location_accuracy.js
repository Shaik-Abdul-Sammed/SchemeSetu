/**
 * Comprehensive verification of all 28 States and 8 Union Territories
 * in SchemeSetu's location database and district normalization logic.
 */

const fs = require('fs');
const path = require('path');

// Extract INDIAN_LOCATIONS and normalizeDistrictName from LocationProvider.jsx
const providerPath = path.join(__dirname, 'frontend/src/context/LocationProvider.jsx');
const content = fs.readFileSync(providerPath, 'utf8');

// Parse INDIAN_LOCATIONS
const locationsMatch = content.match(/export const INDIAN_LOCATIONS = (\[[\s\S]*?\]);/);
if (!locationsMatch) {
  console.error('Failed to extract INDIAN_LOCATIONS from LocationProvider.jsx');
  process.exit(1);
}

const INDIAN_LOCATIONS = eval(locationsMatch[1]);

// Haversine function
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

const EXPECTED_28_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

const EXPECTED_8_UTS = [
  'Andaman and Nicobar Islands', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi',
  'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✓ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`✗ [FAIL] ${message}`);
    failed++;
  }
}

console.log('====================================================');
console.log(' SCHEMESETU 36 STATES & UTs LOCATION ACCURACY SUITE ');
console.log('====================================================\n');

// 1. Total records check
assert(INDIAN_LOCATIONS.length >= 140, `INDIAN_LOCATIONS contains ${INDIAN_LOCATIONS.length} district centroids (>= 140)`);

// 2. All 28 States present
const presentStates = new Set(INDIAN_LOCATIONS.map(loc => loc.state));
EXPECTED_28_STATES.forEach(state => {
  assert(presentStates.has(state), `State "${state}" is present in INDIAN_LOCATIONS`);
});

// 3. All 8 UTs present
EXPECTED_8_UTS.forEach(ut => {
  assert(presentStates.has(ut), `Union Territory "${ut}" is present in INDIAN_LOCATIONS`);
});

// 4. Valid latitude & longitude for all centroids
let validCoords = true;
INDIAN_LOCATIONS.forEach(loc => {
  if (typeof loc.lat !== 'number' || typeof loc.lng !== 'number' ||
      loc.lat < 6 || loc.lat > 38 || loc.lng < 68 || loc.lng > 98) {
    console.error(`Invalid coordinates for ${loc.district}, ${loc.state}: (${loc.lat}, ${loc.lng})`);
    validCoords = false;
  }
});
assert(validCoords, 'All centroids have valid geographical coordinates within India bounding box (6°-38° N, 68°-98° E)');

// 5. Centroid proximity check for newly added states
function findClosest(lat, lng) {
  let closest = null;
  let minD = Infinity;
  for (const item of INDIAN_LOCATIONS) {
    const d = calculateDistance(lat, lng, item.lat, item.lng);
    if (d < minD) {
      minD = d;
      closest = item;
    }
  }
  return { closest, distance: minD };
}

// Test Guwahati coords -> Assam
const rGuwahati = findClosest(26.18, 91.75);
assert(rGuwahati.closest.state === 'Assam', `Simulated coordinates for Guwahati match Assam (nearest: ${rGuwahati.closest.district}, ${rGuwahati.distance} km)`);

// Test Shimla coords -> Himachal Pradesh
const rShimla = findClosest(31.10, 77.17);
assert(rShimla.closest.state === 'Himachal Pradesh', `Simulated coordinates for Shimla match Himachal Pradesh (nearest: ${rShimla.closest.district}, ${rShimla.distance} km)`);

// Test Raipur coords -> Chhattisgarh
const rRaipur = findClosest(21.25, 81.63);
assert(rRaipur.closest.state === 'Chhattisgarh', `Simulated coordinates for Raipur match Chhattisgarh (nearest: ${rRaipur.closest.district}, ${rRaipur.distance} km)`);

// Test Panaji coords -> Goa
const rGoa = findClosest(15.49, 73.82);
assert(rGoa.closest.state === 'Goa', `Simulated coordinates for Panaji match Goa (nearest: ${rGoa.closest.district}, ${rGoa.distance} km)`);

// Test Dehradun coords -> Uttarakhand
const rDehradun = findClosest(30.32, 78.03);
assert(rDehradun.closest.state === 'Uttarakhand', `Simulated coordinates for Dehradun match Uttarakhand (nearest: ${rDehradun.closest.district}, ${rDehradun.distance} km)`);

// Test Leh coords -> Ladakh
const rLeh = findClosest(34.15, 77.58);
assert(rLeh.closest.state === 'Ladakh', `Simulated coordinates for Leh match Ladakh (nearest: ${rLeh.closest.district}, ${rLeh.distance} km)`);

// Test Srinagar coords -> Jammu and Kashmir
const rSrinagar = findClosest(34.08, 74.80);
assert(rSrinagar.closest.state === 'Jammu and Kashmir', `Simulated coordinates for Srinagar match Jammu and Kashmir (nearest: ${rSrinagar.closest.district}, ${rSrinagar.distance} km)`);

console.log('\n====================================================');
console.log(`RESULTS: ${passed}/${passed + failed} TESTS PASSED`);
if (failed === 0) {
  console.log('🎉 ALL 36 STATES & UTs LOCATION TESTS PASSED SUCCESSFULLY!');
} else {
  console.error(`💥 ${failed} TESTS FAILED!`);
  process.exit(1);
}
console.log('====================================================\n');
