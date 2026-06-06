import { ALL_SECTORS as SECTORS } from '@/data/sectors'

// Mock commute times via straight-line distance + road factor
// In the full build, this hits self-hosted OSRM
const ROAD_FACTOR = 1.6 // approximate road distance vs straight-line
const AVG_SPEED_KMH = 28 // Gurugram peak-hour average

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function calcCommuteTimes(
  officeLng: number,
  officeLat: number
): Record<string, number> {
  const times: Record<string, number> = {}
  for (const sector of SECTORS) {
    const [sLng, sLat] = sector.coordinates
    const straightKm = haversineKm(officeLat, officeLng, sLat, sLng)
    const roadKm = straightKm * ROAD_FACTOR
    const hours = roadKm / AVG_SPEED_KMH
    // Add slight noise per sector for realism
    const noise = 0.9 + Math.random() * 0.2
    times[sector.id] = Math.round(hours * 3600 * noise)
  }
  return times
}

export function commuteColor(seconds: number): string {
  if (seconds <= 900) return '#10b981'   // ≤15 min — emerald
  if (seconds <= 1800) return '#f59e0b'  // ≤30 min — amber
  return '#ef4444'                        // >30 min — red
}

export function commuteLabel(seconds: number): string {
  const mins = Math.round(seconds / 60)
  if (mins < 60) return `${mins} min`
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}
