export function haversineKm(lat1, lng1, lat2, lng2) {
  const a1 = Number(lat1);
  const b1 = Number(lng1);
  const a2 = Number(lat2);
  const b2 = Number(lng2);
  if (!a1 || !b1 || !a2 || !b2) return 0;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(a2 - a1);
  const dLng = toRad(b2 - b1);
  const s =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(a1)) * Math.cos(toRad(a2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 6371 * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

const BASE_MINUTES = 15;
const MINUTES_PER_KM = 2;

export function deliveryEtaMinutes(store, userLoc) {
  const storeLat = Number(store?.location?.lat);
  const storeLng = Number(store?.location?.lng);
  const userLat = Number(userLoc?.lat);
  const userLng = Number(userLoc?.lng);
  if (storeLat && storeLng && userLat && userLng) {
    return Math.round(BASE_MINUTES + haversineKm(storeLat, storeLng, userLat, userLng) * MINUTES_PER_KM);
  }
  return store?.deliveryMinutes || 20;
}

export function formatEta(minutes) {
  if (!minutes || minutes <= 0) return "";
  if (minutes < 60) return `~${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `~${h}h ${m}m` : `~${h}h`;
}
