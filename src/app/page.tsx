'use client'

import { useEffect, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { AnimatePresence } from 'framer-motion'
import { useStore } from '@/lib/store'
import { isNight } from '@/lib/sunUtils'
import { getCityConfig } from '@/data/cities'
import Loader from '@/components/Loader'
import CitySelector from '@/components/CitySelector'
import HUD from '@/components/HUD'
import SectorPanel from '@/components/SectorPanel'
import CommutePanel from '@/components/CommutePanel'
import LayerLegend from '@/components/LayerLegend'
import LandingPage from '@/components/LandingPage'

// MapCanvas must be client-only (WebGL needs browser)
const MapCanvas = dynamic(() => import('@/components/MapCanvas'), { ssr: false })
const MobileBanner = dynamic(() => import('@/components/MobileBanner'), { ssr: false })

export default function Home() {
  const { phase, setPhase, setNightMode, nightModeManualOverride } = useStore()

  const isNightMode = useStore(s => s.isNightMode)
  const selectedCity = useStore(s => s.selectedCity)

  // Auto night-mode based on the selected city's sunset time
  useEffect(() => {
    if (nightModeManualOverride) return
    const update = () => {
      if (!useStore.getState().nightModeManualOverride) {
        const cfg = getCityConfig(useStore.getState().selectedCity)
        setNightMode(isNight(cfg.lat, cfg.lng))
      }
    }
    update()
    const interval = setInterval(update, 60_000)
    return () => clearInterval(interval)
  }, [nightModeManualOverride, setNightMode, selectedCity])

  // Drive the whole-app theme (champagne day ↔ dark night) off the night flag
  useEffect(() => {
    document.documentElement.classList.toggle('night', isNightMode)
  }, [isNightMode])

  // Track whether the user has already chosen a city so that returning
  // to the landing page skips the city-select screen and goes straight back
  // to explore.
  const cityChosenRef = useRef(false)

  const handleLoaderComplete = useCallback(() => {
    setPhase('landing')
  }, [setPhase])

  const handleLandingEnter = useCallback(() => {
    if (cityChosenRef.current) {
      setPhase('explore')
    } else {
      setPhase('city-select')
    }
  }, [setPhase])

  const isMapVisible = phase !== 'loading'

  return (
    <main className="relative w-full h-full overflow-hidden bg-[#05050a]">
      {/* Map — mounted once loading finishes, stays beneath all overlays */}
      {isMapVisible && <MapCanvas />}

      {/* Boot loader */}
      <AnimatePresence>
        {phase === 'loading' && <Loader onComplete={handleLoaderComplete} />}
      </AnimatePresence>

      {/* Landing page */}
      <AnimatePresence>
        {phase === 'landing' && (
          <LandingPage onEnter={handleLandingEnter} />
        )}
      </AnimatePresence>

      {/* City selector */}
      <AnimatePresence>
        {phase === 'city-select' && (
          <CitySelector onSelect={() => { cityChosenRef.current = true }} />
        )}
      </AnimatePresence>

      {/* HUD */}
      <AnimatePresence>
        {(phase === 'explore' || phase === 'focused') && <HUD />}
      </AnimatePresence>

      {/* Sector + VS panels */}
      {(phase === 'explore' || phase === 'focused') && <SectorPanel />}

      {/* Commute overlay */}
      <AnimatePresence>
        {(phase === 'explore' || phase === 'focused') && <CommutePanel />}
      </AnimatePresence>

      {/* Layer legend (flooding / water / power / noise) */}
      <AnimatePresence>
        {(phase === 'explore' || phase === 'focused') && <LayerLegend />}
      </AnimatePresence>

      {/* Mobile notice */}
      {isMapVisible && <MobileBanner />}
    </main>
  )
}
