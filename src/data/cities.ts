// ───────────────────────────────────────────────────────────────────────────
// CITY REGISTRY — the single source of truth for everything that varies between
// cities: data, map framing, terminology, sun coordinates and commute presets.
// Gurugram is sector-based; Bengaluru is area-based. Both reuse the `Sector`
// record shape (a generic "place"), so the UI is identical across cities.
// ───────────────────────────────────────────────────────────────────────────
import type { Sector } from './sectors'
import { ALL_SECTORS, getSectorsGeoJSON } from './sectors'
import { BANGALORE_AREAS, getBangaloreGeoJSON } from './bangalore'
import type { LngLatBoundsLike } from 'maplibre-gl'

export type CityId = 'gurugram' | 'bangalore'

export interface OfficePreset {
  label: string
  coordinates: [number, number] // [lng, lat]
}

export interface CityConfig {
  id: CityId
  name: string
  state: string
  /** Terminology for a place: 'Sector' (Gurugram) vs 'Area' (Bengaluru). */
  unit: string
  unitPlural: string
  /** Locality datalist + GeoJSON accessor. */
  places: Sector[]
  getGeoJSON: () => ReturnType<typeof getSectorsGeoJSON>
  // Map framing
  bounds: LngLatBoundsLike
  maxBounds: LngLatBoundsLike
  center: [number, number] // [lng, lat]
  minZoom: number
  zoomFocus: number
  // Sun / night-mode calc
  lat: number
  lng: number
  // Commute model
  avgSpeedKmh: number
  offices: OfficePreset[]
  // CitySelector card stats
  stats: { label: string; value: string }[]
}

export const CITIES: Record<CityId, CityConfig> = {
  gurugram: {
    id: 'gurugram',
    name: 'Gurugram',
    state: 'Haryana',
    unit: 'Sector',
    unitPlural: 'sectors',
    places: ALL_SECTORS,
    getGeoJSON: getSectorsGeoJSON,
    bounds: [[76.91, 28.37], [77.16, 28.50]],
    maxBounds: [[76.88, 28.345], [77.18, 28.520]],
    center: [77.035, 28.45],
    minZoom: 11,
    zoomFocus: 14.2,
    lat: 28.46,
    lng: 77.03,
    avgSpeedKmh: 28,
    offices: [
      { label: 'Cyber City / DLF Phase 2', coordinates: [77.0877, 28.4950] },
      { label: 'Udyog Vihar', coordinates: [77.0780, 28.5035] },
      { label: 'Golf Course Road Offices', coordinates: [77.1050, 28.4600] },
      { label: 'Sohna Road Corridor', coordinates: [77.0500, 28.4200] },
      { label: 'Connaught Place, Delhi', coordinates: [77.2090, 28.6315] },
      { label: 'Sector 44 Corp Park', coordinates: [77.0720, 28.4530] },
    ],
    stats: [
      { label: 'Sectors mapped', value: String(ALL_SECTORS.length) },
      { label: 'Data points', value: '900+' },
      { label: 'Avg AQI', value: '103' },
    ],
  },
  bangalore: {
    id: 'bangalore',
    name: 'Bengaluru',
    state: 'Karnataka',
    unit: 'Area',
    unitPlural: 'areas',
    places: BANGALORE_AREAS,
    getGeoJSON: getBangaloreGeoJSON,
    bounds: [[77.46, 12.82], [77.78, 13.12]],
    maxBounds: [[77.40, 12.76], [77.84, 13.18]],
    center: [77.62, 12.97],
    minZoom: 10.5,
    zoomFocus: 13.2,
    lat: 12.97,
    lng: 77.59,
    avgSpeedKmh: 22, // Bengaluru peak-hour average (worse than Gurugram)
    offices: [
      { label: 'ORR Tech Belt (Bellandur)', coordinates: [77.6760, 12.9260] },
      { label: 'Electronic City', coordinates: [77.6603, 12.8452] },
      { label: 'Whitefield / ITPL', coordinates: [77.7400, 12.9850] },
      { label: 'Manyata Tech Park', coordinates: [77.6230, 13.0440] },
      { label: 'MG Road / CBD', coordinates: [77.6090, 12.9750] },
      { label: 'Koramangala', coordinates: [77.6245, 12.9352] },
    ],
    stats: [
      { label: 'Areas mapped', value: String(BANGALORE_AREAS.length) },
      { label: 'Data points', value: '500+' },
      { label: 'Avg AQI', value: '90' },
    ],
  },
}

export const getCityConfig = (id: CityId): CityConfig => CITIES[id]

/** Look up a place by id across all cities (ids are globally unique). */
export function getPlaceById(id: string): Sector | undefined {
  return ALL_SECTORS.find(s => s.id === id) ?? BANGALORE_AREAS.find(s => s.id === id)
}
