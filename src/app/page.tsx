'use client'

import { useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { AnimatePresence } from 'framer-motion'
import { useStore } from '@/lib/store'
import { isNightInGurugram } from '@/lib/sunUtils'
import Loader from '@/components/Loader'
import CitySelector from '@/components/CitySelector'
import HUD from '@/components/HUD'
import SectorPanel from '@/components/SectorPanel'
import CommutePanel from '@/components/CommutePanel'

// MapCanvas must be client-only (WebGL needs browser)
const MapCanvas = dynamic(() => import('@/components/MapCanvas'), { ssr: false })
const MobileBanner = dynamic(() => import('@/components/MobileBanner'), { ssr: false })

export default function Home() {
  const { phase, setPhase, setNightMode, nightModeManualOverride } = useStore()

  const isNightMode = useStore(s => s.isNightMode)

  // Auto night-mode based on Gurugram sunset time
  useEffect(() => {
    if (nightModeManualOverride) return
    const update = () => {
      if (!useStore.getState().nightModeManualOverride) {
        setNightMode(isNightInGurugram())
      }
    }
    update()
    const interval = setInterval(update, 60_000)
    return () => clearInterval(interval)
  }, [nightModeManualOverride, setNightMode])

  // Drive the whole-app theme (champagne day ↔ dark night) off the night flag
  useEffect(() => {
    document.documentElement.classList.toggle('night', isNightMode)
  }, [isNightMode])

  const handleLoaderComplete = useCallback(() => {
    setPhase('city-select')
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

      {/* City selector */}
      <AnimatePresence>
        {phase === 'city-select' && <CitySelector onSelect={() => {}} />}
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

      {/* Mobile notice */}
      {isMapVisible && <MobileBanner />}
    </main>
  )
}
