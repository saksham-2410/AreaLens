'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/lib/store'
import { calcCommuteTimes, commuteLabel, commuteColor } from '@/lib/commuteUtils'
import { ALL_SECTORS as SECTORS } from '@/data/sectors'
import { useState } from 'react'

// Pre-set office locations in Gurugram/NCR
const QUICK_OFFICES = [
  { label: 'Cyber City / DLF Phase 2', coordinates: [77.0877, 28.4950] as [number, number] },
  { label: 'Udyog Vihar', coordinates: [77.0780, 28.5035] as [number, number] },
  { label: 'Golf Course Road Offices', coordinates: [77.1050, 28.4600] as [number, number] },
  { label: 'Sohna Road Corridor', coordinates: [77.0500, 28.4200] as [number, number] },
  { label: 'Connaught Place, Delhi', coordinates: [77.2090, 28.6315] as [number, number] },
  { label: 'Sector 44 Corp Park', coordinates: [77.0720, 28.4530] as [number, number] },
]

export default function CommutePanel() {
  const { activeLayer, setCommuteTimes, setActiveLayer } = useStore()
  const [calculating, setCalculating] = useState(false)
  const [lastOffice, setLastOffice] = useState<string | null>(null)
  const isActive = activeLayer === 'commute'

  if (!isActive) return null

  const handleOfficeSelect = (office: typeof QUICK_OFFICES[0]) => {
    setCalculating(true)
    setLastOffice(office.label)
    // Simulate async (would hit OSRM in full build)
    setTimeout(() => {
      const times = calcCommuteTimes(office.coordinates[0], office.coordinates[1])
      setCommuteTimes(times)
      setCalculating(false)
    }, 600)
  }

  return (
    <motion.div
      className="fixed left-3 bottom-3 sm:left-6 sm:bottom-6 z-30 glass-heavy rounded-2xl border border-[color:var(--border)] overflow-hidden"
      style={{ width: 'min(340px, calc(100vw - 48px))' }}
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 60, opacity: 0 }}
      transition={{ type: 'spring', damping: 28, stiffness: 280 }}
    >
      <div className="flex items-center justify-between px-5 py-3 border-b border-[color:var(--border)]">
        <span
          className="text-lg text-[color:var(--copper)]"
          style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '0.08em' }}
        >
          COMMUTE HEATMAP
        </span>
        <button
          onClick={() => setActiveLayer('none')}
          className="text-slate-500 hover:text-slate-300 text-lg"
        >
          ×
        </button>
      </div>

      <div className="p-4 space-y-3">
        <p
          className="text-xs text-slate-400"
          style={{ fontFamily: 'var(--font-space-mono)' }}
        >
          Select your office. Sectors color by drive-time.
        </p>

        <div className="space-y-1.5">
          {QUICK_OFFICES.map(office => (
            <button
              key={office.label}
              onClick={() => handleOfficeSelect(office)}
              className={`
                w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all
                ${lastOffice === office.label
                  ? 'bg-[color:var(--copper)]/10 border border-[color:var(--copper)]/40 text-[color:var(--copper-light)]'
                  : 'bg-white/[0.03] border border-white/5 text-slate-400 hover:bg-white/[0.06] hover:text-slate-200'
                }
              `}
              style={{ fontFamily: 'var(--font-space-mono)' }}
            >
              <div className="flex items-center gap-2">
                {lastOffice === office.label && !calculating && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--copper)] flex-shrink-0" />
                )}
                {lastOffice === office.label && calculating && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
                )}
                {lastOffice !== office.label && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white/10 flex-shrink-0" />
                )}
                {office.label}
              </div>
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex gap-3 pt-2 border-t border-white/5">
          {[
            { color: '#10b981', label: '≤15 min' },
            { color: '#f59e0b', label: '15–30 min' },
            { color: '#ef4444', label: '>30 min' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
              <span
                className="text-[10px] text-slate-500"
                style={{ fontFamily: 'var(--font-space-mono)' }}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>

        <p
          className="text-[10px] text-slate-600"
          style={{ fontFamily: 'var(--font-space-mono)' }}
        >
          ⚠ Prototype: estimates via straight-line × road factor. Full build uses OSRM routing.
        </p>
      </div>
    </motion.div>
  )
}
