'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/lib/store'
import type { ActiveLayer } from '@/lib/store'

const LEGENDS: Partial<Record<ActiveLayer, {
  title: string
  stops: string[]
  low: string
  high: string
}>> = {
  waterlogging: {
    title: 'FLOODING RISK',
    stops: ['#A8C5D8', '#7AAFC8', '#9B85C0', '#7B60A8', '#5B3D88'],
    low: 'Minimal',
    high: 'Severe',
  },
  tanker: {
    title: 'WATER SUPPLY',
    stops: ['#7AB88A', '#A8C878', '#D4B840', '#C87830', '#A83820'],
    low: 'Piped',
    high: 'Tanker',
  },
  power: {
    title: 'POWER OUTAGES',
    stops: ['#7AB88A', '#A8C878', '#D4B840', '#C87830', '#A83820'],
    low: 'Reliable',
    high: '≥ 2 hr / mo',
  },
  noise: {
    title: 'NOISE LEVEL',
    stops: ['#C8B888', '#C4A840', '#C47820', '#B84820', '#8B2810'],
    low: '40 dB',
    high: '80 dB',
  },
}

export default function LayerLegend() {
  const { activeLayer } = useStore()
  const legend = LEGENDS[activeLayer]

  return (
    <AnimatePresence>
      {legend && (
        <motion.div
          className="fixed bottom-6 left-4 sm:left-6 z-20 rounded-xl border border-[color:var(--border)] shadow-lg px-4 py-3"
          style={{
            minWidth: 188,
            background: 'var(--bg-panel)',
            backdropFilter: 'blur(20px)',
          }}
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 12, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        >
          <div
            className="text-[11px] mb-2.5 tracking-widest"
            style={{ fontFamily: 'var(--font-bebas)', color: 'var(--copper-light)', letterSpacing: '0.1em' }}
          >
            {legend.title}
          </div>

          {/* Color bar */}
          <div className="flex rounded-md overflow-hidden h-2.5 mb-1.5">
            {legend.stops.map((color, i) => (
              <div key={i} className="flex-1" style={{ background: color }} />
            ))}
          </div>

          {/* Low / High labels */}
          <div className="flex justify-between">
            <span
              className="text-[9px]"
              style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-space-mono)' }}
            >
              {legend.low}
            </span>
            <span
              className="text-[9px]"
              style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-space-mono)' }}
            >
              {legend.high}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
