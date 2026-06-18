export const BARRIO_COORDS: Record<string, { lat: number; lng: number }> = {
  'Pocitos':         { lat: -34.9050, lng: -56.1580 },
  'Punta Carretas':  { lat: -34.9150, lng: -56.1530 },
  'Carrasco':        { lat: -34.8850, lng: -56.0500 },
  'Malvín':          { lat: -34.8950, lng: -56.1100 },
  'Buceo':           { lat: -34.8980, lng: -56.1350 },
  'Centro':          { lat: -34.9060, lng: -56.1900 },
  'Cordón':          { lat: -34.9020, lng: -56.1780 },
  'La Blanqueada':   { lat: -34.8900, lng: -56.1700 },
  'Parque Batlle':   { lat: -34.8940, lng: -56.1620 },
  'Punta Gorda':     { lat: -34.9020, lng: -56.1100 },
  'Tres Cruces':     { lat: -34.8980, lng: -56.1810 },
  'Palermo':         { lat: -34.9050, lng: -56.1820 },
  'Barrio Sur':      { lat: -34.9120, lng: -56.1950 },
  'Ciudad Vieja':    { lat: -34.9080, lng: -56.2030 },
  'Aguada':          { lat: -34.9000, lng: -56.1920 },
  'Goes':            { lat: -34.8920, lng: -56.1840 },
  'La Teja':         { lat: -34.8870, lng: -56.2130 },
  'Cerro':           { lat: -34.8850, lng: -56.2400 },
  'Prado':           { lat: -34.8800, lng: -56.1980 },
  'Capurro':         { lat: -34.8880, lng: -56.2050 },
  'Sayago':          { lat: -34.8750, lng: -56.2200 },
  'Nuevo París':     { lat: -34.8700, lng: -56.2300 },
  'Unión':           { lat: -34.8800, lng: -56.1560 },
  'Jacinto Vera':    { lat: -34.8870, lng: -56.1660 },
  'Larrañaga':       { lat: -34.8830, lng: -56.1740 },
  'Maroñas':         { lat: -34.8750, lng: -56.1480 },
  'Flor de Maroñas': { lat: -34.8700, lng: -56.1450 },
  'Piedras Blancas': { lat: -34.8650, lng: -56.1200 },
  'Manga':           { lat: -34.8600, lng: -56.1350 },
  'Reducto':         { lat: -34.8960, lng: -56.1860 },
  'Peñarol':         { lat: -34.8600, lng: -56.2000 },
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

export function distanceBetweenBarrios(b1: string, b2: string): number | null {
  const c1 = BARRIO_COORDS[b1]
  const c2 = BARRIO_COORDS[b2]
  if (!c1 || !c2) return null
  const R = 6371
  const dLat = toRad(c2.lat - c1.lat)
  const dLng = toRad(c2.lng - c1.lng)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(c1.lat)) * Math.cos(toRad(c2.lat)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function isInRadius(proZone: string, radiusKm: number | null, clientZone: string): boolean {
  if (!clientZone) return true
  if (radiusKm === null) return true
  const d = distanceBetweenBarrios(proZone, clientZone)
  if (d === null) return true
  return d <= radiusKm
}
