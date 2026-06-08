'use client'

import { motion, AnimatePresence, useMotionValue, animate, useDragControls } from 'framer-motion'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useStore } from '@/lib/store'
import { getSectorById, type Sector } from '@/data/sectors'
import VSCompare from './VSCompare'

const STATUS_STYLE: Record<string, React.CSSProperties> = {
  Active:    { color: '#1E7A4A', background: 'rgba(30,122,74,0.08)',  border: '1px solid rgba(30,122,74,0.22)' },
  Completed: { color: '#6B5B9A', background: 'rgba(107,91,154,0.08)', border: '1px solid rgba(107,91,154,0.22)' },
  Proposed:  { color: '#9B7A50', background: 'rgba(155,107,56,0.06)', border: '1px solid rgba(155,107,56,0.18)' },
  Stalled:   { color: '#B83420', background: 'rgba(184,52,32,0.08)',  border: '1px solid rgba(184,52,32,0.22)' },
}
const RATING_COLOR: Record<string, string> = {
  Rising: '#1E7A4A', Stable: '#9B6B38', Declining: '#B83420', Transforming: '#C07820',
}
const RATING_ICON: Record<string, string> = {
  Rising: '↑', Stable: '→', Declining: '↓', Transforming: '⟳',
}

function MetricBar({ value, max = 5, invert = false }: { value: number; max?: number; invert?: boolean }) {
  const pct = (value / max) * 100
  const disp = invert ? 100 - pct : pct
  const color = disp > 66 ? 'var(--green)' : disp > 33 ? 'var(--amber)' : 'var(--red)'
  return (
    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(155,107,56,0.10)' }}>
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${disp}%`, background: color }} />
    </div>
  )
}

function MetricRow({ label, value, unit, max, invert }: { label: string; value: number; unit: string; max?: number; invert?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs w-28 flex-shrink-0" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
        {label}
      </span>
      <MetricBar value={value} max={max} invert={invert} />
      <span className="text-xs w-20 text-right flex-shrink-0 tabular-nums" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
        {value}{unit}
      </span>
    </div>
  )
}

function SectorContent({ sector, onClose, onExpand, sheetExpanded, onShowCompare }: { sector: Sector; onClose?: () => void; onExpand?: () => void; sheetExpanded?: boolean; onShowCompare?: () => void }) {
  // Track scroll position so the "more below" cue can fade out once the user
  // has scrolled past the Reality Check section.
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const [showMoreCue, setShowMoreCue] = useState(true)
  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setShowMoreCue(el.scrollTop < 40)
  }
  useEffect(() => {
    // Reset cue visibility whenever we switch sectors
    setShowMoreCue(true)
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }, [sector.id])

  const { compareSectors, addToCompare, removeFromCompare } = useStore()
  const inCompare = compareSectors.includes(sector.id)

  const score = sector.score
  const scoreColor = score >= 80 ? '#9B6B38' : score >= 65 ? '#C07820' : score >= 55 ? '#C07820' : '#B83420'

  return (
    <div className="flex flex-col h-full relative">
      {/* Close button (desktop only — mobile has its own X in the drag bar) */}
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Close report"
          className="hidden md:flex absolute z-10 w-8 h-8 items-center justify-center rounded-full transition-all"
          style={{
            top: 12, right: 12,
            background: 'rgba(155,107,56,0.08)',
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      )}

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="px-6 pt-5 pb-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        {/* On desktop the close X sits top-right, so reserve space (pr) so the
            big score never slides under it. */}
        <div className={`flex items-start justify-between gap-3 ${onClose ? 'md:pr-10' : ''}`}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{sector.vibe_emoji}</span>
              <span
                className="text-xs tracking-widest uppercase"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}
              >
                {sector.vibe_tag}
              </span>
            </div>
            <h2
              className="text-2xl leading-tight"
              style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--text)' }}
            >
              {sector.sector_name}
            </h2>
            <div className="flex items-center gap-3 mt-2">
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  fontFamily: 'var(--font-mono)',
                  background: 'var(--copper-dim)',
                  border: '1px solid rgba(155,107,56,0.18)',
                  color: 'var(--text-muted)',
                }}
              >
                {sector.sector_code}
              </span>
              <span
                className="text-sm font-medium"
                style={{ color: RATING_COLOR[sector.prediction_3yr.rating], fontFamily: 'var(--font-mono)' }}
              >
                {RATING_ICON[sector.prediction_3yr.rating]} {sector.prediction_3yr.rating}
              </span>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <div
              className="text-5xl leading-none"
              style={{ fontFamily: 'var(--font-bebas)', color: scoreColor, letterSpacing: '0.06em' }}
            >
              {score}
            </div>
            <div
              className="text-[10px] tracking-widest uppercase mt-0.5"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}
            >
              Live Score
            </div>
          </div>
        </div>

        {/* Price + compare button */}
        <div className="flex gap-4 mt-3 pt-3 items-center" style={{ borderTop: '1px solid var(--border)' }}>
          <div>
            <div className="text-[10px] uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>Buy (PSF)</div>
            <div className="text-sm" style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '0.06em', color: 'var(--text)' }}>
              ₹{sector.price_range.buy_psf[0].toLocaleString()} – {sector.price_range.buy_psf[1].toLocaleString()}
            </div>
          </div>
          <div className="w-px h-8" style={{ background: 'var(--border)' }} />
          <div>
            <div className="text-[10px] uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>Rent 2BHK/mo</div>
            <div className="text-sm" style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '0.06em', color: 'var(--text)' }}>
              ₹{sector.price_range.rent_2bhk[0].toLocaleString()} – {sector.price_range.rent_2bhk[1].toLocaleString()}
            </div>
          </div>
          <div className="ml-auto">
            <button
              onClick={() => {
                if (inCompare) removeFromCompare(sector.id)
                else { addToCompare(sector.id); onShowCompare?.() }
              }}
              className="text-xs px-3 py-1.5 rounded-lg transition-all duration-200"
              style={
                inCompare
                  ? { background: 'rgba(107,91,154,0.10)', color: '#6B5B9A', border: '1px solid rgba(107,91,154,0.28)', fontFamily: 'var(--font-mono)' }
                  : { background: 'var(--copper-dim)', color: 'var(--copper)', border: '1px solid rgba(155,107,56,0.22)', fontFamily: 'var(--font-mono)' }
              }
            >
              {inCompare ? '✓ In VS' : '+ VS Compare'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Scrollable body (relative so the "more below" cue can overlay) ── */}
      <div className="flex-1 relative min-h-0">
      <div ref={scrollRef} onScroll={handleScroll} className="absolute inset-0 overflow-y-auto px-6 py-4 space-y-5">

        {/* Reality Check */}
        <div>
          <h3 className="text-xs tracking-widest uppercase mb-3" style={{ fontFamily: 'var(--font-mono)', color: 'var(--copper)' }}>
            Reality Check
          </h3>
          <div className="space-y-2.5">
            <MetricRow label="AQI Index"       value={sector.metrics.aqi}                   unit=""     max={250} />
            <MetricRow label="Tanker Reliance" value={sector.metrics.water_tanker_reliance} unit="/5"   max={5}   invert />
            <MetricRow label="Power Outage"    value={sector.metrics.power_outage_mins}     unit="m/d"  max={150} invert />
            <MetricRow label="Noise Level"     value={sector.metrics.noise_db}              unit="dB"   max={90}  invert />
            <MetricRow label="Waterlogging"    value={sector.metrics.waterlogging_level}    unit="/5"   max={5}   invert />
          </div>
        </div>

        {/* Amenities */}
        <div>
          <h3 className="text-xs tracking-widest uppercase mb-3" style={{ fontFamily: 'var(--font-mono)', color: 'var(--copper)' }}>
            Nearest Amenities
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {sector.amenities.metro && (
              <AmenityCard icon="🚇" type="Metro" name={sector.amenities.metro.name} dist={sector.amenities.metro.distance_km} />
            )}
            {sector.amenities.hospitals.slice(0,1).map(h => (
              <AmenityCard key={h.name} icon="🏥" type="Hospital" name={h.name} dist={h.distance_km} rating={h.rating} />
            ))}
            {sector.amenities.schools.slice(0,1).map(s => (
              <AmenityCard key={s.name} icon="🏫" type="School" name={s.name} dist={s.distance_km} rating={s.rating} />
            ))}
            {sector.amenities.malls.slice(0,1).map(m => (
              <AmenityCard key={m.name} icon="🛍️" type="Mall" name={m.name} dist={m.distance_km} />
            ))}
          </div>
        </div>

        {/* Infra Tracker */}
        <div>
          <h3 className="text-xs tracking-widest uppercase mb-3" style={{ fontFamily: 'var(--font-mono)', color: 'var(--copper)' }}>
            Infrastructure Tracker
          </h3>
          <div className="space-y-2">
            {sector.infrastructure_projects.map((p, i) => (
              <div
                key={i}
                className="rounded-xl p-3 flex items-start justify-between gap-3"
                style={{ background: 'rgba(155,107,56,0.04)', border: '1px solid var(--border)' }}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium leading-snug" style={{ color: 'var(--text)' }}>{p.title}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
                      {p.type} · {p.completion_year}
                    </span>
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded"
                      style={Object.assign(
                        p.impact === 'High'
                          ? { color: '#C07820', background: 'rgba(192,120,32,0.10)', border: '1px solid rgba(192,120,32,0.22)' }
                          : p.impact === 'Medium'
                          ? { color: '#6B5B9A', background: 'rgba(107,91,154,0.08)', border: '1px solid rgba(107,91,154,0.20)' }
                          : { color: 'var(--text-dim)', background: 'rgba(0,0,0,0.04)', border: '1px solid var(--border)' },
                        { fontFamily: 'var(--font-mono)' }
                      )}
                    >
                      {p.impact} impact
                    </span>
                  </div>
                </div>
                <span
                  className="text-[10px] px-2 py-1 rounded flex-shrink-0"
                  style={{ ...STATUS_STYLE[p.status], fontFamily: 'var(--font-mono)' }}
                >
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 3-Year Outlook */}
        <div>
          <h3 className="text-xs tracking-widest uppercase mb-3" style={{ fontFamily: 'var(--font-mono)', color: 'var(--copper)' }}>
            3-Year Outlook
          </h3>
          <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(155,107,56,0.04)', border: '1px solid var(--border)' }}>
            <span
              className="text-sm font-medium"
              style={{ color: RATING_COLOR[sector.prediction_3yr.rating], fontFamily: 'var(--font-mono)' }}
            >
              {RATING_ICON[sector.prediction_3yr.rating]} {sector.prediction_3yr.rating}
            </span>
            <p className="text-sm leading-relaxed" style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--text-muted)' }}>
              {sector.prediction_3yr.summary}
            </p>
            {sector.prediction_3yr.risks.length > 0 && (
              <div>
                <div className="text-[10px] uppercase tracking-widest mb-1.5" style={{ fontFamily: 'var(--font-mono)', color: '#B83420' }}>Risks</div>
                <ul className="space-y-1">
                  {sector.prediction_3yr.risks.map((r, i) => (
                    <li key={i} className="text-xs flex gap-2" style={{ color: 'var(--text-muted)' }}>
                      <span style={{ color: '#B83420', flexShrink: 0 }}>▸</span>{r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {sector.prediction_3yr.opportunities.length > 0 && (
              <div>
                <div className="text-[10px] uppercase tracking-widest mb-1.5" style={{ fontFamily: 'var(--font-mono)', color: 'var(--green)' }}>Opportunities</div>
                <ul className="space-y-1">
                  {sector.prediction_3yr.opportunities.map((o, i) => (
                    <li key={i} className="text-xs flex gap-2" style={{ color: 'var(--text-muted)' }}>
                      <span style={{ color: 'var(--green)', flexShrink: 0 }}>▸</span>{o}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="h-4" />
      </div>

      {/* "More below" cue — pulses softly above the bottom edge until the
          user scrolls past the Reality Check section. Mobile only — desktop
          panel is tall enough to show everything without this hint. */}
      {showMoreCue && !sheetExpanded && (
        <div
          className="md:hidden absolute left-0 right-0 bottom-2 flex justify-center"
          style={{ zIndex: 5 }}
        >
          <button
            onClick={() => onExpand?.()}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full animate-pulse-warm"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid rgba(155,107,56,0.30)',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--text-muted)',
              boxShadow: '0 4px 14px rgba(155,107,56,0.15)',
            }}
          >
            <span>Amenities &amp; Infra below</span>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}
      </div>
    </div>
  )
}

function AmenityCard({ icon, type, name, dist, rating }: { icon: string; type: string; name: string; dist: number; rating?: number }) {
  return (
    <div className="rounded-xl p-3" style={{ background: 'rgba(155,107,56,0.04)', border: '1px solid var(--border)' }}>
      <div className="text-[10px] uppercase tracking-widest mb-1" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
        {icon} {type}
      </div>
      <div className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{name}</div>
      <div className="flex items-center gap-1 mt-0.5">
        <span className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--copper)' }}>{dist} km</span>
        {rating && <span className="text-xs" style={{ color: '#C07820' }}>★ {rating}</span>}
      </div>
    </div>
  )
}

// ─── MOBILE BOTTOM SHEET ───────────────────────────────────────────────────
// A real draggable sheet: it FOLLOWS the finger continuously (via a bound
// motion value) between two snap points — peek (shows up to Reality Check) and
// full — and dismisses when flung/dragged below peek. Tapping the handle
// toggles peek↔full. Drag only starts on the handle, so the body still scrolls.
const SHEET_FULL_VH = 0.92  // the sheet's real height
const SHEET_PEEK_VH = 0.58  // visible portion when collapsed

function MobileSheet({ sector, onDismissed }: { sector: Sector; onDismissed: () => void }) {
  const dragControls = useDragControls()
  const y = useMotionValue(0)
  const draggedRef = useRef(false)
  const [vh, setVh] = useState(0)
  const [atFull, setAtFull] = useState(false)
  const { setShowComparePanel } = useStore()

  // collapsedY = how far to push the (full-height) sheet down so only the peek
  // portion shows. y=0 → fully expanded; y=collapsedY → peek.
  const collapsedY = vh * (SHEET_FULL_VH - SHEET_PEEK_VH)

  // Measure viewport, then slide the sheet up from offscreen to the peek snap.
  useEffect(() => {
    const h = window.innerHeight
    setVh(h)
    y.set(h)  // start fully offscreen (below the fold)
    const controls = animate(y, h * (SHEET_FULL_VH - SHEET_PEEK_VH), {
      type: 'spring', damping: 32, stiffness: 300,
    })
    return () => controls.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const snapPeek = useCallback(() => { animate(y, collapsedY, { type: 'spring', damping: 32, stiffness: 320 }); setAtFull(false) }, [y, collapsedY])
  const snapFull = useCallback(() => { animate(y, 0, { type: 'spring', damping: 32, stiffness: 320 }); setAtFull(true) }, [y])
  const snapDismiss = useCallback(() => { animate(y, vh, { type: 'tween', duration: 0.25, ease: 'easeIn' }).then(onDismissed) }, [y, vh, onDismissed])

  const handleShowCompare = useCallback(() => {
    // Dismiss the sheet first so the compare panel has clear space
    snapDismiss()
    setTimeout(() => setShowComparePanel(true), 280)
  }, [snapDismiss, setShowComparePanel])

  const onDragEnd = (_: unknown, info: { velocity: { y: number } }) => {
    const cur = y.get()
    const v = info.velocity.y
    // Dragged well below the peek line, or flung down hard → dismiss.
    if (cur > collapsedY + vh * 0.12 || v > 800) { snapDismiss(); return }
    // Otherwise snap to the nearer of full / peek, with a velocity bias.
    if (v < -350) snapFull()
    else if (v > 350) snapPeek()
    else (cur < collapsedY / 2 ? snapFull : snapPeek)()
  }

  return (
    <motion.div
      className="fixed left-0 right-0 bottom-0 z-20 flex flex-col"
      style={{
        y,
        height: `${SHEET_FULL_VH * 100}vh`,
        background: 'var(--bg-panel)',
        borderTop: '1px solid var(--border)',
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        backdropFilter: 'blur(28px)',
        boxShadow: '0 -12px 40px rgba(0,0,0,0.18)',
      }}
      drag="y"
      dragListener={false}
      dragControls={dragControls}
      dragConstraints={{ top: 0, bottom: vh }}
      dragElastic={{ top: 0.04, bottom: 0 }}
      dragMomentum={false}
      onDrag={() => { draggedRef.current = true }}
      onDragEnd={onDragEnd}
    >
      {/* Handle row — press here to drag the whole sheet; tap to toggle. */}
      <div
        className="flex items-center justify-between px-4 pt-3 pb-3 flex-shrink-0 cursor-grab active:cursor-grabbing select-none"
        style={{ touchAction: 'none' }}
        onPointerDown={(e) => { draggedRef.current = false; dragControls.start(e) }}
        onClick={() => { if (!draggedRef.current) (atFull ? snapPeek() : snapFull()) }}
      >
        <div className="w-9" />
        <div className="w-12 h-1.5 rounded-full" style={{ background: 'rgba(155,107,56,0.50)' }} />
        <button
          onClick={(e) => { e.stopPropagation(); snapDismiss() }}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label="Close"
          className="w-9 h-9 flex items-center justify-center rounded-full"
          style={{ background: 'rgba(155,107,56,0.10)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
      <SectorContent
        sector={sector}
        onExpand={snapFull}
        sheetExpanded={atFull}
        onShowCompare={handleShowCompare}
      />
    </motion.div>
  )
}

function CompareSelectionHint() {
  const { isSelectingCompare, setIsSelectingCompare, setShowComparePanel, compareSectors } = useStore()
  const firstSector = compareSectors[0] ? getSectorById(compareSectors[0]) : null
  const firstLabel = firstSector?.sector_code ?? null

  return (
    <AnimatePresence>
      {isSelectingCompare && (
        <motion.div
          className="fixed z-40 flex items-center gap-2 px-3 py-2.5 rounded-full"
          style={{
            bottom: 32,
            left: '50%',
            background: 'var(--bg-panel)',
            border: '1px solid rgba(155,107,56,0.35)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 28px rgba(0,0,0,0.22)',
          }}
          initial={{ y: 16, opacity: 0, scale: 0.95, x: '-50%' }}
          animate={{ y: 0, opacity: 1, scale: 1, x: '-50%' }}
          exit={{ y: 16, opacity: 0, scale: 0.95, x: '-50%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        >
          <span
            className="w-2 h-2 rounded-full animate-pulse flex-shrink-0"
            style={{ background: 'var(--copper)' }}
          />
          <span
            className="text-[11px] whitespace-nowrap"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}
          >
            {firstLabel ? `Compare with ${firstLabel} — tap a sector` : 'Tap a sector on the map'}
          </span>
          <button
            onClick={() => { setIsSelectingCompare(false); setShowComparePanel(true) }}
            className="text-xs px-2.5 py-1 rounded-full transition-all flex-shrink-0 ml-1"
            style={{
              background: 'rgba(155,107,56,0.10)',
              border: '1px solid rgba(155,107,56,0.22)',
              color: 'var(--text-dim)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            Cancel
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function SectorPanel() {
  const { selectedSectorId, showComparePanel, setSelectedSector, setPhase, setShowComparePanel } = useStore()
  const sector = selectedSectorId ? getSectorById(selectedSectorId) : null
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Dismiss the panel — clears selection and recenters the map.
  const dismiss = () => { setSelectedSector(null); setPhase('explore') }

  return (
    <>
      <AnimatePresence>
        {sector && (
          isMobile ? (
            // Mobile: full draggable bottom sheet (peek ↔ full, drag to dismiss).
            // Keyed by sector id so switching sectors re-runs the slide-up entry.
            <MobileSheet key={sector.id} sector={sector} onDismissed={dismiss} />
          ) : (
            // Desktop / tablet: right side panel
            <motion.div
              key="sector-panel"
              // Start BELOW the 56px HUD so layer-switcher buttons, day toggle
              // and clock never overlap the report header (score, vibe tag).
              className="fixed right-0 bottom-0 z-20"
              style={{
                top: 56,
                width: 'min(52vw, 520px)',
                background: 'var(--bg-panel)',
                borderLeft: '1px solid var(--border)',
                borderTop: '1px solid var(--border)',
                backdropFilter: 'blur(28px)',
              }}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 280, mass: 0.9 }}
            >
              <SectorContent
                sector={sector}
                onClose={dismiss}
                onShowCompare={() => setShowComparePanel(true)}
              />
            </motion.div>
          )
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showComparePanel && <VSCompare />}
      </AnimatePresence>

      <CompareSelectionHint />
    </>
  )
}
