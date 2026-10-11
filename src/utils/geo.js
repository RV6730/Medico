// ============================================================
// MEDICO - Geolocation & Distance Utilities (Haversine Formula)
// ============================================================

/**
 * Calculates the great-circle distance between two points in kilometers.
 * @param {number} lat1 User Latitude
 * @param {number} lon1 User Longitude
 * @param {number} lat2 Destination Latitude
 * @param {number} lon2 Destination Longitude
 * @returns {number} Distance in kilometers (1 decimal place)
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 1.5;
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return parseFloat(d.toFixed(1));
}

/**
 * Returns a human-friendly string for distance (e.g. "1.4 km").
 */
export function formatDistance(lat1, lon1, lat2, lon2) {
  const km = calculateDistanceKm(lat1, lon1, lat2, lon2);
  return `${km} km`;
}

/**
 * Estimates ambulance response & arrival time in minutes based on real distance in km.
 */
export function getEstimatedAmbulanceEta(distanceKm) {
  const basePrep = 3;
  const transitMinutes = Math.round(distanceKm * 2.2);
  const minEta = Math.max(5, basePrep + transitMinutes);
  return `${minEta}-${minEta + 3} mins`;
}

/**
 * Generates a Google Maps navigation direction URL.
 */
export function getDirectionsUrl(destLat, destLng, destName = '') {
  return `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}&destination_place_id=${encodeURIComponent(destName)}`;
}
