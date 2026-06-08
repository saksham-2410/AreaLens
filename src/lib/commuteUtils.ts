import { getCityConfig } from '@/data/cities'
import { useStore } from '@/lib/store'

// Mock commute times via straight-line distance + road factor
// In the full build, this hits self-hosted OSRM
const ROAD_FACTOR = 1.6 // approximate road distance vs straight-line

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Deterministic per-sector noise so repeated clicks on the same office
// produce identical results. Hash the sector id to a stable float in [0,1).
function sectorHash(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (Math.imul(31, h) + id.charCodeAt(i)) | 0
  return (h >>> 0) / 0x100000000
}

export function calcCommuteTimes(
  officeLng: number,
  officeLat: number
): Record<string, number> {
  const cfg = getCityConfig(useStore.getState().selectedCity)
  const times: Record<string, number> = {}
  for (const place of cfg.places) {
    const [sLng, sLat] = place.coordinates
    const straightKm = haversineKm(officeLat, officeLng, sLat, sLng)
    const roadKm = straightKm * ROAD_FACTOR
    const hours = roadKm / cfg.avgSpeedKmh
    const noise = 0.9 + sectorHash(place.id) * 0.2
    times[place.id] = Math.round(hours * 3600 * noise)
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
