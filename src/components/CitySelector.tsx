'use client'

import { motion } from 'framer-motion'
import { useStore } from '@/lib/store'
import { CITIES as CITY_REGISTRY, type CityId } from '@/data/cities'

const CITIES = [
  {
    id: 'gurugram' as const,
    name: CITY_REGISTRY.gurugram.name,
    state: CITY_REGISTRY.gurugram.state,
    status: 'live',
    tagline: 'Full intelligence coverage active',
    stats: CITY_REGISTRY.gurugram.stats,
  },
  {
    id: 'bangalore' as const,
    name: CITY_REGISTRY.bangalore.name,
    state: CITY_REGISTRY.bangalore.state,
    status: 'live',
    tagline: 'Area intelligence now live',
    stats: CITY_REGISTRY.bangalore.stats,
  },
  { id: 'delhi', name: 'Delhi', state: 'NCT', status: 'soon', tagline: 'Coming soon' },
  { id: 'noida', name: 'Noida', state: 'UP',  status: 'soon', tagline: 'Coming soon' },
]

export default function CitySelector({ onSelect }: { onSelect: () => void }) {
  const setPhase = useStore(s => s.setPhase)
  const setSelectedCity = useStore(s => s.setSelectedCity)

  const handleSelect = (id: CityId) => {
    setSelectedCity(id)
    setPhase('explore')
    onSelect()
  }

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(245,230,206,0.65)', backdropFilter: 'blur(6px)' }}
      />

      {/* Panel */}
      <motion.div
        className="relative z-10 w-full max-w-lg mx-4"
        initial={{ y: 28, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ delay: 0.08, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          className="rounded-2xl overflow-hidden shadow-warm-strong"
          style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}
        >
          {/* Header */}
          <div className="px-8 pt-8 pb-6" style={{ borderBottom: '1px solid var(--border)' }}>
            <p
              className="text-xs tracking-widest uppercase mb-2"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}
            >
              Intelligence Platform
            </p>
            <h2
              className="text-5xl mb-1"
              style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '0.06em', color: 'var(--text)' }}
            >
              SELECT CITY
            </h2>
            <p
              className="text-sm"
              style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--text-muted)' }}
            >
              Choose a city to explore neighborhood intelligence
            </p>
          </div>

          {/* City list */}
          <div className="p-4 flex flex-col gap-2">
            {CITIES.map((city, i) => (
              <motion.button
                key={city.id}
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.18 + i * 0.07 }}
                onClick={city.status === 'live' ? () => handleSelect(city.id as CityId) : undefined}
                disabled={city.status !== 'live'}
                className="w-full text-left rounded-xl px-5 py-4 transition-all duration-200 group"
                style={
                  city.status === 'live'
                    ? {
                        background: 'rgba(155,107,56,0.05)',
                        border: '1px solid rgba(155,107,56,0.20)',
                        cursor: 'pointer',
                      }
                    : {
                        background: 'rgba(0,0,0,0.02)',
                        border: '1px solid rgba(0,0,0,0.06)',
                        cursor: 'not-allowed',
                        opacity: 0.45,
                      }
                }
                onMouseEnter={e => {
                  if (city.status === 'live') {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(155,107,56,0.10)'
                    ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(155,107,56,0.35)'
                  }
                }}
                onMouseLeave={e => {
                  if (city.status === 'live') {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(155,107,56,0.05)'
                    ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(155,107,56,0.20)'
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{
                        background: city.status === 'live' ? 'var(--copper)' : 'rgba(0,0,0,0.15)',
                        animation: city.status === 'live' ? 'pulse-warm 2s ease-in-out infinite' : 'none',
                      }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-2xl"
                          style={{
                            fontFamily: 'var(--font-bebas)',
                            letterSpacing: '0.06em',
                            color: city.status === 'live' ? 'var(--text)' : 'var(--text-dim)',
                          }}
                        >
                          {city.name.toUpperCase()}
                        </span>
                        <span
                          className="text-xs"
                          style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}
                        >
                          {city.state}
                        </span>
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {city.tagline}
                      </p>
                    </div>
                  </div>

                  {city.status === 'live' && (
                    <div className="flex gap-4 items-center">
                      {city.stats?.map(stat => (
                        <div key={stat.label} className="text-right">
                          <div
                            className="text-lg"
                            style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '0.06em', color: 'var(--copper)' }}
                          >
                            {stat.value}
                          </div>
                          <div className="text-[10px] leading-none" style={{ color: 'var(--text-dim)' }}>
                            {stat.label}
                          </div>
                        </div>
                      ))}
                      <svg className="w-4 h-4" style={{ color: 'var(--copper-light)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>

          <div className="px-8 py-5" style={{ borderTop: '1px solid var(--border)' }}>
            <p
              className="text-xs text-center"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}
            >
              Zero property listings · Pure neighborhood intelligence
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
