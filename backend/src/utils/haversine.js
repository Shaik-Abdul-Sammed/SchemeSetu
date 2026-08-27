/**
 * SchemeSetu Haversine Distance Calculation Utility
 * Earth radius: ~6371 km
 */

function toRad(degrees) {
  return (degrees * Math.PI) / 180;
}

/**
 * Validates latitude and longitude values.
 * @param {number} lat - Latitude in degrees (-90 to 90)
 * @param {number} lng - Longitude in degrees (-180 to 180)
 * @returns {boolean}
 */
function isValidCoordinate(lat, lng) {
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return false;
  }
  if (isNaN(lat) || isNaN(lng)) {
    return false;
  }
  if (lat < -90 || lat > 90) {
    return false;
  }
  if (lng < -180 || lng > 180) {
    return false;
  }
  return true;
}

/**
 * Calculates the great-circle distance between two points on the Earth using Haversine formula.
 * @param {number} lat1 - Latitude of first point
 * @param {number} lng1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lng2 - Longitude of second point
 * @returns {number} Distance in kilometers rounded to 2 decimal places
 */
function haversineDistance(lat1, lng1, lat2, lng2) {
  const nLat1 = Number(lat1);
  const nLng1 = Number(lng1);
  const nLat2 = Number(lat2);
  const nLng2 = Number(lng2);

  if (!isValidCoordinate(nLat1, nLng1)) {
    throw new Error(`Invalid source coordinates: lat=${lat1}, lng=${lng1}. Latitude must be between -90 and 90, longitude between -180 and 180.`);
  }

  if (!isValidCoordinate(nLat2, nLng2)) {
    throw new Error(`Invalid destination coordinates: lat=${lat2}, lng=${lng2}. Latitude must be between -90 and 90, longitude between -180 and 180.`);
  }

  const EARTH_RADIUS_KM = 6371;

  const dLat = toRad(nLat2 - nLat1);
  const dLng = toRad(nLng2 - nLng1);

  const radLat1 = toRad(nLat1);
  const radLat2 = toRad(nLat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(radLat1) * Math.cos(radLat2) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = EARTH_RADIUS_KM * c;

  return Math.round(distance * 100) / 100;
}

module.exports = {
  haversineDistance,
  isValidCoordinate
};
