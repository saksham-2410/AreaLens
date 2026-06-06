'use client'

import { motion } from 'framer-motion'
import { useStore } from '@/lib/store'
import { getSectorById } from '@/data/sectors'
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
  'Water Supply',
  'Power',
  'Peace & Noise',
  'Connectivity',
  'Infrastructure',
]

const COLORS = ['#22d3ee', '#818cf8']

export default function VSCompare() {
  const {
    compareSectors,
    removeFromCompare,
    clearCompare,
    setShowComparePanel,
  } = useStore()

  const sectors = compareSectors.map(id => getSectorById(id)).filter(Boolean)

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
    backgroundColor: `${COLORS[i]}22`,
    borderColor: COLORS[i],
    borderWidth: 2,
    pointBackgroundColor: COLORS[i],
    pointRadius: 4,
    pointHoverRadius: 6,
  }))

  const chartData = { labels: RADAR_LABELS, datasets }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 25,
          color: 'rgba(148,163,184,0.4)',
          font: { size: 10, family: 'Space Mono' },
          backdropColor: 'transparent',
        },
        grid: { color: 'rgba(255,255,255,0.06)' },
        angleLines: { color: 'rgba(255,255,255,0.06)' },
        pointLabels: {
          color: 'rgba(148,163,184,0.8)',
          font: { size: 11, family: 'Space Mono' },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(6,8,20,0.95)',
        borderColor: 'rgba(34,211,238,0.3)',
        borderWidth: 1,
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        titleFont: { family: 'Space Mono', size: 11 },
        bodyFont: { family: 'Space Mono', size: 11 },
      },
    },
  }

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
          className="text-slate-500 hover:text-slate-300 text-lg leading-none"
        >
          ×
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Sector chips */}
        <div className="flex gap-2">
          {sectors.map((s, i) => (
            <div
              key={s!.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs border"
              style={{
                borderColor: `${COLORS[i]}40`,
                background: `${COLORS[i]}10`,
                fontFamily: 'var(--font-space-mono)',
                color: COLORS[i],
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: COLORS[i] }}
              />
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
            <div
              className="px-3 py-1.5 rounded-full text-xs text-slate-600 border border-dashed border-slate-700"
              style={{ fontFamily: 'var(--font-space-mono)' }}
            >
              + add second sector
            </div>
          )}
        </div>

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
                  className="text-[10px] text-slate-500 w-24 flex-shrink-0"
                  style={{ fontFamily: 'var(--font-space-mono)' }}
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
                        className="flex-1 h-1.5 rounded-full overflow-hidden bg-white/5"
                      >
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${vals[idx]}%`, background: COLORS[si], opacity: 0.8 }}
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

        {/* Clear */}
        <button
          onClick={() => { clearCompare(); setShowComparePanel(false) }}
          className="w-full text-xs text-slate-600 hover:text-slate-400 transition-colors py-1"
          style={{ fontFamily: 'var(--font-space-mono)' }}
        >
          Clear comparison
        </button>
      </div>
    </motion.div>
  )
}
