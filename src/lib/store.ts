import { create } from 'zustand'

export type AppPhase = 'loading' | 'city-select' | 'explore' | 'focused'
export type ActiveLayer = 'none' | 'waterlogging' | 'tanker' | 'power' | 'noise' | 'commute'

interface AppStore {
  // Phase
  phase: AppPhase
  setPhase: (p: AppPhase) => void

  // Map interaction
  selectedSectorId: string | null
  hoveredSectorId: string | null
  setSelectedSector: (id: string | null) => void
  setHoveredSector: (id: string | null) => void

  // Night mode (auto or manual)
  isNightMode: boolean
  nightModeManualOverride: boolean
  setNightMode: (val: boolean) => void
  setNightModeOverride: (val: boolean) => void

  // Active data layer
  activeLayer: ActiveLayer
  setActiveLayer: (layer: ActiveLayer) => void

  // Commute
  commuteTarget: [number, number] | null
  setCommuteTarget: (coords: [number, number] | null) => void
  commuteTimes: Record<string, number> // sectorId -> seconds
  setCommuteTimes: (times: Record<string, number>) => void

  // VS Compare
  compareSectors: string[] // max 2 ids
  addToCompare: (id: string) => void
  removeFromCompare: (id: string) => void
  clearCompare: () => void
  showComparePanel: boolean
  setShowComparePanel: (val: boolean) => void
}

export const useStore = create<AppStore>((set, get) => ({
  phase: 'loading',
  setPhase: (p) => set({ phase: p }),

  selectedSectorId: null,
  hoveredSectorId: null,
  setSelectedSector: (id) => set({ selectedSectorId: id }),
  setHoveredSector: (id) => set({ hoveredSectorId: id }),

  isNightMode: false,
  nightModeManualOverride: false,
  setNightMode: (val) => set({ isNightMode: val }),
  // Manual toggle: always lock the override on (true) so auto-detect stops
  // fighting the user's choice; isNightMode follows the requested value.
  setNightModeOverride: (val) => set({ nightModeManualOverride: true, isNightMode: val }),

  activeLayer: 'none',
  setActiveLayer: (layer) => set({ activeLayer: layer }),

  commuteTarget: null,
  setCommuteTarget: (coords) => set({ commuteTarget: coords }),
  commuteTimes: {},
  setCommuteTimes: (times) => set({ commuteTimes: times }),

  compareSectors: [],
  addToCompare: (id) => {
    const current = get().compareSectors
    if (current.includes(id)) return
    if (current.length >= 2) {
      set({ compareSectors: [current[1], id] })
    } else {
      set({ compareSectors: [...current, id] })
    }
  },
  removeFromCompare: (id) =>
    set({ compareSectors: get().compareSectors.filter(s => s !== id) }),
  clearCompare: () => set({ compareSectors: [] }),
  showComparePanel: false,
  setShowComparePanel: (val) => set({ showComparePanel: val }),
}))
