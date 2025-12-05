
const toRad = deg => deg * Math.PI / 180;
const toDeg = rad => rad * 180 / Math.PI;

export default function haversineDistance(lat1, lon1, lat2, lon2, R = 6371008.8) {
  const lat1_rad = toRad(lat1), lat2_rad = toRad(lat2);
  const delta_lat = toRad(lat2 - lat1);
  const delta_lon = toRad(lon2 - lon1);

  const sin_half_lat = Math.sin(delta_lat / 2);
  const sin_half_lon = Math.sin(delta_lon / 2);
  const a = sin_half_lat * sin_half_lat + Math.cos(lat1_rad) * Math.cos(lat2_rad) * sin_half_lon * sin_half_lon;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const km = (R * c) / 1000;
return Math.round(km * 10) / 10;
}