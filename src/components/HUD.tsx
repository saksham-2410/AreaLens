'use client'

import { useStore, ActiveLayer } from '@/lib/store'
import { getSunsetLabel } from '@/lib/sunUtils'
import { getCityConfig } from '@/data/cities'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

const LAYERS: { id: ActiveLayer; label: string; icon: string }[] = [
  { id: 'none',         label: 'Base',     icon: '🗺️' },
  { id: 'waterlogging', label: 'Flooding', icon: '🌧️' },
  { id: 'tanker',       label: 'Water',    icon: '🚰' },
  { id: 'power',        label: 'Power',    icon: '⚡' },
  { id: 'noise',        label: 'Noise',    icon: '🔊' },
  { id: 'commute',      label: 'Commute',  icon: '🚗' },
]

export default function HUD() {
  const {
    activeLayer, setActiveLayer,
    isNightMode, nightModeManualOverride, setNightModeOverride,
    compareSectors, setShowComparePanel, showComparePanel,
    selectedSectorId, setSelectedSector, setPhase, selectedCity,
  } = useStore()
  const city = getCityConfig(selectedCity)

  const [sunLabel, setSunLabel] = useState('')
  const [time, setTime] = useState('')
  // Mobile left drawer state — opens via the logo tap, holds the layer list
  // (and could later host search, settings, etc.).
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    const update = () => {
      setSunLabel(getSunsetLabel(city.lat, city.lng))
      const now = new Date()
      const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000)
      const h = ist.getUTCHours() % 12 || 12
      const m = ist.getUTCMinutes().toString().padStart(2, '0')
      setTime(`${h}:${m} ${ist.getUTCHours() >= 12 ? 'PM' : 'AM'} IST`)
    }
    update()
    const t = setInterval(update, 30_000)
    return () => clearInterval(t)
  }, [city.lat, city.lng])

  return (
    <>
    <div
      className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-3 sm:px-4 h-14 gap-2 sm:gap-3"
      style={{
        background: isNightMode
          ? 'linear-gradient(to bottom, rgba(12,9,7,0.97) 0%, rgba(12,9,7,0) 100%)'
          : 'linear-gradient(to bottom, rgba(245,230,206,0.97) 0%, rgba(245,230,206,0) 100%)',
      }}
    >
      {/* Left — Logo + back. On mobile the logo tile becomes a menu trigger
          and shows a tiny chevron to advertise the drawer. On desktop it's
          purely decorative since the layer switcher lives in the HUD itself. */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            if (window.innerWidth >= 640) {
              setSelectedSector(null)
              setPhase('landing')
            } else {
              setDrawerOpen(o => !o)
            }
          }}
          aria-label="Open menu"
          className="flex items-center gap-2 group"
        >
          <div
            className="relative w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(155,107,56,0.10)', border: '1px solid rgba(155,107,56,0.25)' }}
          >
            <svg width="14" height="14" viewBox="0 0 32 32" fill="none">
              <path d="M16 2L28 8V24L16 30L4 24V8L16 2Z" stroke="#9B6B38" strokeWidth="2" fill="rgba(155,107,56,0.12)" />
              <circle cx="16" cy="16" r="4" fill="#9B6B38" />
            </svg>
            {/* Mobile-only chevron hint, bottom-right of the tile */}
            <span
              className="sm:hidden absolute -bottom-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center"
              style={{ background: 'var(--copper)', color: 'var(--bg)' }}
            >
              <svg width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                <path strokeLinecap="round" d="M9 18l6-6-6-6" />
              </svg>
            </span>
          </div>
          <span
            className="text-xl tracking-wider transition-opacity sm:group-hover:opacity-70"
            style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '0.10em', color: 'var(--text)' }}
          >
            AREALENS
          </span>
          <span
            className="text-[10px] tracking-widest hidden sm:block"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}
          >
            {city.name.toUpperCase()}
          </span>
        </button>

        {selectedSectorId && (
          <motion.button
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => { setSelectedSector(null); setPhase('explore') }}
            className="hidden sm:flex items-center gap-1 text-xs transition-colors"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            All {city.unitPlural}
          </motion.button>
        )}
      </div>

      {/* Centre — Layer switcher (hidden on mobile, moved to bottom bar) */}
      <div
        className="hidden sm:flex items-center gap-0.5 rounded-xl px-2 py-1.5"
        style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)', backdropFilter: 'blur(16px)' }}
      >
        {LAYERS.map(layer => (
          <button
            key={layer.id}
            onClick={() => setActiveLayer(layer.id)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs transition-all duration-200"
            style={
              activeLayer === layer.id
                ? {
                    background: 'rgba(155,107,56,0.12)',
                    color: 'var(--copper)',
                    border: '1px solid rgba(155,107,56,0.28)',
                    fontFamily: 'var(--font-mono)',
                  }
                : {
                    color: 'var(--text-muted)',
                    border: '1px solid transparent',
                    fontFamily: 'var(--font-mono)',
                  }
            }
          >
            <span className="text-[11px]">{layer.icon}</span>
            <span className="hidden md:block">{layer.label}</span>
          </button>
        ))}
      </div>

      {/* Right — VS, night toggle, clock */}
      <div className="flex items-center gap-2">
        {compareSectors.length > 0 && (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={() => setShowComparePanel(!showComparePanel)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
            style={
              showComparePanel
                ? { background: 'rgba(107,91,154,0.12)', color: '#6B5B9A', border: '1px solid rgba(107,91,154,0.30)', fontFamily: 'var(--font-mono)' }
                : { background: 'var(--bg-glass)', color: 'var(--text-muted)', border: '1px solid var(--border)', fontFamily: 'var(--font-mono)', backdropFilter: 'blur(16px)' }
            }
          >
            ⚡ VS {compareSectors.length}/2
          </motion.button>
        )}

        <button
          onClick={() => setNightModeOverride(!isNightMode)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
          style={{
            background: 'var(--bg-glass)',
            border: `1px solid ${nightModeManualOverride ? 'rgba(155,107,56,0.35)' : 'var(--border)'}`,
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            backdropFilter: 'blur(16px)',
          }}
          title={sunLabel}
        >
          <span>{isNightMode ? '🌙' : '☀️'}</span>
          <span className="hidden lg:block">{isNightMode ? 'Night' : 'Day'}</span>
        </button>

        <div
          className="hidden xl:block text-xs px-2"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}
        >
          {time}
        </div>
      </div>
    </div>

    {/* ── Mobile side drawer ───────────────────────────────────────────
        Replaces the older horizontal layer strip. Tap the AREALENS logo to
        toggle. Backdrop click or selecting a layer also closes it. */}
    <AnimatePresence>
      {drawerOpen && (
        <motion.div
          key="drawer-backdrop"
          className="sm:hidden fixed inset-0 z-40"
          style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={() => setDrawerOpen(false)}
        />
      )}
    </AnimatePresence>
    <AnimatePresence>
      {drawerOpen && (
        <motion.aside
          key="drawer-panel"
          className="sm:hidden fixed left-0 top-0 bottom-0 z-50 flex flex-col"
          style={{
            width: 'min(82vw, 320px)',
            background: 'var(--bg-panel)',
            borderRight: '1px solid var(--border)',
            backdropFilter: 'blur(28px)',
            boxShadow: '6px 0 28px rgba(0,0,0,0.20)',
          }}
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 320, mass: 0.85 }}
        >
          {/* Drawer header */}
          <div
            className="flex items-center justify-between px-5 h-14 flex-shrink-0"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(155,107,56,0.10)', border: '1px solid rgba(155,107,56,0.25)' }}
              >
                <svg width="14" height="14" viewBox="0 0 32 32" fill="none">
                  <path d="M16 2L28 8V24L16 30L4 24V8L16 2Z" stroke="#9B6B38" strokeWidth="2" fill="rgba(155,107,56,0.12)" />
                  <circle cx="16" cy="16" r="4" fill="#9B6B38" />
                </svg>
              </div>
              <span
                className="text-xl tracking-wider"
                style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '0.10em', color: 'var(--text)' }}
              >
                AREALENS
              </span>
            </div>
            <button
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(155,107,56,0.08)',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          {/* Layers list */}
          <div className="px-4 pt-5 pb-2">
            <p
              className="text-[10px] tracking-widest uppercase px-2 mb-2"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}
            >
              Map Layers
            </p>
            <div className="flex flex-col gap-1">
              {LAYERS.map(layer => (
                <button
                  key={layer.id}
                  onClick={() => { setActiveLayer(layer.id); setDrawerOpen(false) }}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all"
                  style={
                    activeLayer === layer.id
                      ? {
                          background: 'rgba(155,107,56,0.12)',
                          border: '1px solid rgba(155,107,56,0.30)',
                          color: 'var(--copper)',
                        }
                      : {
                          background: 'transparent',
                          border: '1px solid transparent',
                          color: 'var(--text-muted)',
                        }
                  }
                >
                  <span className="text-lg flex-shrink-0">{layer.icon}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14 }}>{layer.label}</span>
                  {activeLayer === layer.id && (
                    <svg className="ml-auto" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Footer hint */}
          <div className="mt-auto px-5 py-4" style={{ borderTop: '1px solid var(--border)' }}>
            <p
              className="text-[10px] tracking-widest uppercase text-center"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}
            >
              Tap {city.unit === 'Area' ? 'an' : 'a'} {city.unit.toLowerCase()} to see its report
            </p>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
    </>
  )
}
