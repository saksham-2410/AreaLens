'use client'

import { motion } from 'framer-motion'
import { useStore } from '@/lib/store'
import { getPlaceById } from '@/data/cities'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'
import { Radar } from 'react-chartjs-2'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

const RADAR_LABELS = [
  'Air Quality',
  'Water',
  'Power',
  'Peace & Noise',
  'Connectivity',
  'Infra',
]

// Darker variants for day mode (cream bg), lighter for night mode (dark bg)
const COLORS_NIGHT = ['#22d3ee', '#818cf8']
const COLORS_DAY   = ['#0e7490', '#4338ca']

export default function VSCompare() {
  const {
    compareSectors,
    removeFromCompare,
    clearCompare,
    setShowComparePanel,
    setIsSelectingCompare,
    isNightMode,
  } = useStore()

  const COLORS = isNightMode ? COLORS_NIGHT : COLORS_DAY

  const sectors = compareSectors.map(id => getPlaceById(id)).filter(Boolean)

  if (sectors.length === 0) return null

  const datasets = sectors.map((s, i) => ({
    label: s!.sector_name,
    data: [
      s!.radar.air_quality,
      s!.radar.water_reliability,
      s!.radar.power_reliability,
      s!.radar.noise_peace,
      s!.radar.connectivity,
      s!.radar.infra_health,
    ],
    backgroundColor: `${COLORS[i]}28`,
    borderColor: COLORS[i],
    borderWidth: 2,
    pointBackgroundColor: COLORS[i],
    pointRadius: 4,
    pointHoverRadius: 6,
  }))

  const chartData = { labels: RADAR_LABELS, datasets }

  const tickColor    = isNightMode ? 'rgba(148,163,184,0.45)' : 'rgba(44,26,14,0.35)'
  const gridColor    = isNightMode ? 'rgba(255,255,255,0.07)'  : 'rgba(155,107,56,0.15)'
  const labelColor   = isNightMode ? 'rgba(148,163,184,0.85)' : 'rgba(44,26,14,0.65)'
  const tooltipBg    = isNightMode ? 'rgba(6,8,20,0.95)'      : 'rgba(252,244,232,0.98)'
  const tooltipBdr   = isNightMode ? 'rgba(34,211,238,0.3)'   : 'rgba(155,107,56,0.35)'
  const tooltipTitle = isNightMode ? '#f1f5f9' : '#2C1A0E'
  const tooltipBody  = isNightMode ? '#94a3b8' : '#7A5C3E'

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    layout: {
      padding: { left: 0, right: 40, top: 0, bottom: 0 },
    },
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 25,
          color: tickColor,
          font: { size: 10, family: 'Space Mono' },
          backdropColor: 'transparent',
        },
        grid: { color: gridColor },
        angleLines: { color: gridColor },
        pointLabels: {
          color: labelColor,
          font: { size: 9, family: 'Space Mono' },
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: tooltipBg,
        borderColor: tooltipBdr,
        borderWidth: 1,
        titleColor: tooltipTitle,
        bodyColor: tooltipBody,
        titleFont: { family: 'Space Mono', size: 11 },
        bodyFont: { family: 'Space Mono', size: 11 },
      },
    },
  }

  const trackBg = isNightMode ? 'rgba(255,255,255,0.06)' : 'rgba(44,26,14,0.08)'
  const removeBtnBorder = isNightMode ? 'rgba(255,255,255,0.08)' : 'var(--border)'
  const removeBtnBg     = isNightMode ? 'rgba(255,255,255,0.03)' : 'rgba(155,107,56,0.04)'
  const addPickBorder   = isNightMode ? 'rgba(148,163,184,0.3)'  : 'rgba(155,107,56,0.3)'
  const addPickColor    = isNightMode ? 'rgba(148,163,184,0.6)'  : 'var(--text-muted)'
  const closeColor      = isNightMode ? '#64748b' : 'var(--text-dim)'

  return (
    <motion.div
      className="fixed bottom-3 left-3 sm:bottom-6 sm:left-6 z-30 glass-heavy rounded-2xl border border-[color:var(--border)] overflow-hidden shadow-xl"
      style={{ width: 'min(420px, calc(100vw - 48px))' }}
      initial={{ y: 80, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 80, opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', damping: 28, stiffness: 280 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[color:var(--border)]">
        <div className="flex items-center gap-2">
          <span
            className="text-lg text-[color:var(--copper-light)]"
            style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '0.08em' }}
          >
            VS COMPARE
          </span>
          <span className="text-xs text-[color:var(--text-dim)]" style={{ fontFamily: 'var(--font-space-mono)' }}>
            {sectors.length}/2 sectors
          </span>
        </div>
        <button
          onClick={() => setShowComparePanel(false)}
          className="text-lg leading-none transition-colors"
          style={{ color: closeColor }}
        >
          ×
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Sector chips */}
        <div className="flex gap-2 flex-wrap">
          {sectors.map((s, i) => (
            <div
              key={s!.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs border"
              style={{
                borderColor: `${COLORS[i]}50`,
                background: `${COLORS[i]}18`,
                fontFamily: 'var(--font-space-mono)',
                color: COLORS[i],
              }}
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i] }} />
              {s!.sector_name}
              <button
                onClick={() => removeFromCompare(s!.id)}
                className="opacity-50 hover:opacity-100 ml-1"
              >
                ×
              </button>
            </div>
          ))}
          {sectors.length < 2 && (
            <button
              onClick={() => { setIsSelectingCompare(true); setShowComparePanel(false) }}
              className="px-3 py-1.5 rounded-full text-xs border border-dashed transition-colors cursor-pointer hover:border-[color:var(--copper)] hover:text-[color:var(--copper)]"
              style={{
                fontFamily: 'var(--font-space-mono)',
                borderColor: addPickBorder,
                color: addPickColor,
              }}
            >
              + tap map to pick
            </button>
          )}
        </div>

        {/* Remove comparison + return to map */}
        <button
          onClick={() => {
            clearCompare()
            setShowComparePanel(false)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const m = (window as any).__map
            if (m) {
              const isMobile = window.innerWidth < 768
              m.setPadding({ top: 0, bottom: 0, left: 0, right: 0 })
              m.fitBounds([[76.91, 28.37], [77.16, 28.50]], {
                padding: isMobile ? 20 : 70,
                duration: 1400,
                pitch: 52,
                bearing: -12,
                essential: true,
              })
            }
          }}
          className="w-full flex items-center justify-center gap-1.5 text-xs py-1.5 rounded-lg transition-colors"
          style={{
            fontFamily: 'var(--font-space-mono)',
            color: 'var(--text-dim)',
            background: removeBtnBg,
            border: `1px solid ${removeBtnBorder}`,
          }}
          onMouseEnter={e => {
            ;(e.currentTarget as HTMLButtonElement).style.color = '#ef4444'
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.35)'
          }}
          onMouseLeave={e => {
            ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-dim)'
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = removeBtnBorder
          }}
        >
          <span style={{ fontSize: '10px', opacity: 0.7 }}>✕</span>
          Remove comparison
        </button>

        {/* Radar chart */}
        {datasets.length > 0 && (
          <div className="radar-container mx-auto" style={{ maxWidth: '280px' }}>
            <Radar data={chartData} options={chartOptions} />
          </div>
        )}

        {/* Score comparison */}
        {sectors.length >= 1 && (
          <div className="space-y-2">
            {RADAR_LABELS.map((label, idx) => (
              <div key={label} className="flex items-center gap-2">
                <span
                  className="text-[10px] w-24 flex-shrink-0"
                  style={{ fontFamily: 'var(--font-space-mono)', color: 'var(--text-muted)' }}
                >
                  {label}
                </span>
                <div className="flex-1 flex gap-2 items-center">
                  {sectors.map((s, si) => {
                    const vals = [
                      s!.radar.air_quality, s!.radar.water_reliability,
                      s!.radar.power_reliability, s!.radar.noise_peace,
                      s!.radar.connectivity, s!.radar.infra_health,
                    ]
                    return (
                      <div
                        key={s!.id}
                        className="flex-1 h-1.5 rounded-full overflow-hidden"
                        style={{ background: trackBg }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${vals[idx]}%`, background: COLORS[si], opacity: 0.85 }}
                        />
                      </div>
                    )
                  })}
                  {sectors.map((s, si) => {
                    const vals = [
                      s!.radar.air_quality, s!.radar.water_reliability,
                      s!.radar.power_reliability, s!.radar.noise_peace,
                      s!.radar.connectivity, s!.radar.infra_health,
                    ]
                    return (
                      <span
                        key={s!.id}
                        className="text-[10px] w-6 text-right"
                        style={{ color: COLORS[si], fontFamily: 'var(--font-space-mono)' }}
                      >
                        {vals[idx]}
                      </span>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
