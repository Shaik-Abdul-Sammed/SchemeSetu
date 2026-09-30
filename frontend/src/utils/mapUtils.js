/**
 * Map & Navigation Utilities for SchemeSetu
 * Generates accurate Google Maps directions URLs linking user's actual GPS or
 * selected reference location to the target Channel Partner / Nodal center.
 */

export function getDirectionsUrl(partner, userLocation = null) {
  if (!partner) return '';

  const pLat = partner.coordinates?.lat ?? partner.lat ?? null;
  const pLng = partner.coordinates?.lng ?? partner.lng ?? null;

  // Build origin parameter from user's current GPS or district
  let originParam = '';
  if (userLocation?.lat && userLocation?.lng) {
    originParam = `&origin=${userLocation.lat},${userLocation.lng}`;
  } else if (userLocation?.district && userLocation?.state) {
    originParam = `&origin=${encodeURIComponent(`${userLocation.district}, ${userLocation.state}, India`)}`;
  } else if (userLocation?.address) {
    originParam = `&origin=${encodeURIComponent(userLocation.address)}`;
  }

  // Build destination
  if (pLat && pLng) {
    return `https://www.google.com/maps/dir/?api=1${originParam}&destination=${pLat},${pLng}&travelmode=driving`;
  }

  const destParts = [partner.name, partner.address, partner.district, partner.state, 'India'].filter(Boolean);
  const destQuery = encodeURIComponent(destParts.join(', '));
  return `https://www.google.com/maps/dir/?api=1${originParam}&destination=${destQuery}&travelmode=driving`;
}

export function openDirectionsInMaps(partner, userLocation = null) {
  const url = getDirectionsUrl(partner, userLocation);
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
