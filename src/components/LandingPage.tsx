'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import type { CityId } from '@/data/cities'

// ── Marquee keyframes injected once ──────────────────────────────────────────
const MARQUEE_CSS = `
@keyframes al-marquee {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.al-marquee {
  display: flex;
  width: max-content;
  animation: al-marquee 36s linear infinite;
  will-change: transform;
}
.al-marquee:hover { animation-play-state: paused; }
`

// ── Data ──────────────────────────────────────────────────────────────────────
const TICKER_CITIES = [
  'GURUGRAM', 'MUMBAI', 'BENGALURU', 'DELHI NCR', 'HYDERABAD',
  'PUNE', 'CHENNAI', 'NOIDA', 'AHMEDABAD', 'KOLKATA',
  'JAIPUR', 'CHANDIGARH', 'KOCHI', 'LUCKNOW', 'SURAT',
]

const STATS = [
  { num: '500+',  sub: 'Sectors\nMapped'    },
  { num: '6K+',   sub: 'Data\nPoints'       },
  { num: '6',     sub: 'Intel\nLayers'      },
  { num: '10+',   sub: 'Cities\nLaunching'  },
]

const FEATURES = [
  { icon: '🌧️', num: '01', label: 'Flooding Risk',
    desc: 'Monsoon waterlogging mapped sector by sector. Know which streets become rivers before you sign a lease.' },
  { icon: '🚰', num: '02', label: 'Water Supply',
    desc: 'Tanker reliance vs piped-water coverage. Real dependency data, not builder brochure claims.' },
  { icon: '⚡', num: '03', label: 'Power Outages',
    desc: 'Monthly outage minutes, live-scored. Find reliable power zones before the blackouts find you.' },
  { icon: '🔊', num: '04', label: 'Noise Heatmap',
    desc: 'Ambient decibels mapped citywide. Buy the right kind of quiet for your lifestyle.' },
  { icon: '🚗', num: '05', label: 'Commute Times',
    desc: 'Drive-time overlays from your actual office. Plan around reality, not optimism.' },
  { icon: '⚖️', num: '06', label: 'VS Compare',
    desc: 'Side-by-side neighbourhood intelligence. Shortlist two sectors and see exactly how they differ.' },
]

const CITIES: { name: string; status: 'live' | 'soon'; note: string; id?: CityId }[] = [
  { name: 'Gurugram',   status: 'live', note: 'All 97 sectors', id: 'gurugram' },
  { name: 'Bengaluru',  status: 'live', note: '27 areas',       id: 'bangalore' },
  { name: 'Noida',      status: 'soon', note: 'Q3 2026' },
  { name: 'Mumbai',     status: 'soon', note: 'Q4 2026' },
  { name: 'Hyderabad',  status: 'soon', note: '2026'    },
  { name: 'Pune',       status: 'soon', note: '2026'    },
  { name: 'Chennai',    status: 'soon', note: '2026'    },
  { name: 'Delhi NCR',  status: 'soon', note: '2026'    },
]

// ── Framer variants ───────────────────────────────────────────────────────────
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.75, ease: 'easeOut' as const } },
}
const fadeIn = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.6 } },
}

// ── Corner fiducials helper ───────────────────────────────────────────────────
const CORNERS = [
  { key: 'tl', top: 18,        left: 18,        borderTop: true,  borderLeft: true  },
  { key: 'tr', top: 18,        right: 18,       borderTop: true,  borderRight: true },
  { key: 'bl', bottom: 18,     left: 18,        borderBottom: true, borderLeft: true },
  { key: 'br', bottom: 18,     right: 18,       borderBottom: true, borderRight: true },
] as const

// ── Section label component ───────────────────────────────────────────────────
function SectionLabel({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 mb-14">
      <div className="h-px w-8" style={{ background: 'var(--copper)', opacity: 0.45 }} />
      <span
        className="text-[9px] tracking-[0.32em] uppercase"
        style={{ fontFamily: 'var(--font-space-mono)', color: 'var(--text-dim)' }}
      >
        {text}
      </span>
      <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
    </div>
  )
}

// ── CTA Button ────────────────────────────────────────────────────────────────
function CtaButton({ onClick, label = 'EXPLORE YOUR CITY →', large = false }: {
  onClick: () => void
  label?: string
  large?: boolean
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily: 'var(--font-bebas)',
        fontSize: large ? '1.2rem' : '1rem',
        letterSpacing: '0.22em',
        padding: large ? '18px 52px' : '14px 36px',
        border: '1px solid var(--copper)',
        borderRadius: '2px',
        background: hovered ? 'var(--copper)' : 'transparent',
        color: hovered ? '#05050a' : 'var(--copper-light)',
        cursor: 'pointer',
        transition: 'background 0.22s ease, color 0.22s ease',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
      }}
    >
      {label}
    </button>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function LandingPage({ onEnter }: { onEnter: () => void }) {
  const setSelectedCity = useStore(s => s.setSelectedCity)
  const setPhase = useStore(s => s.setPhase)
  // Click a live city card → jump straight into that city's map.
  const enterCity = (id: CityId) => { setSelectedCity(id); setPhase('explore') }

  // Inject marquee keyframe once
  useEffect(() => {
    const el = document.createElement('style')
    el.textContent = MARQUEE_CSS
    el.id = 'al-marquee-css'
    if (!document.getElementById('al-marquee-css')) document.head.appendChild(el)
    return () => { document.getElementById('al-marquee-css')?.remove() }
  }, [])

  const tickerItems = [...TICKER_CITIES, ...TICKER_CITIES] // doubled for seamless loop

  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5, ease: 'easeInOut' } }}
      transition={{ duration: 0.4 }}
    >
      {/* ── Persistent glass backdrop ───────────────────────────────────── */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'var(--bg-panel)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          opacity: 0.95,
        }}
      />

      {/* ── Dot-grid texture ────────────────────────────────────────────── */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(155,107,56,0.13) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* ── Corner fiducials ────────────────────────────────────────────── */}
      {CORNERS.map(c => (
        <div
          key={c.key}
          className="fixed w-6 h-6 pointer-events-none"
          style={{
            top:          'top'    in c ? c.top    : undefined,
            bottom:       'bottom' in c ? c.bottom : undefined,
            left:         'left'   in c ? c.left   : undefined,
            right:        'right'  in c ? c.right  : undefined,
            borderTop:    'borderTop'    in c && c.borderTop    ? '1.5px solid var(--copper)' : undefined,
            borderBottom: 'borderBottom' in c && c.borderBottom ? '1.5px solid var(--copper)' : undefined,
            borderLeft:   'borderLeft'   in c && c.borderLeft   ? '1.5px solid var(--copper)' : undefined,
            borderRight:  'borderRight'  in c && c.borderRight  ? '1.5px solid var(--copper)' : undefined,
            opacity: 0.38,
          }}
        />
      ))}

      {/* ════════════════════════════════════════════════════════════════════
          §1  HERO — full viewport
      ════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 min-h-screen flex flex-col px-6 sm:px-12 lg:px-20">

        {/* Metadata strip */}
        <motion.div
          className="flex items-center gap-3 pt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.5 }}
        >
          <div className="h-px w-8" style={{ background: 'var(--copper)', opacity: 0.5 }} />
          <span
            className="text-[9px] tracking-[0.36em] uppercase"
            style={{ fontFamily: 'var(--font-space-mono)', color: 'var(--copper)', opacity: 0.72 }}
          >
            Intelligence Platform &nbsp;·&nbsp; India Tier-1 Cities &nbsp;·&nbsp; Phase 1
          </span>
          <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
          <span
            className="text-[9px] tracking-widest"
            style={{ fontFamily: 'var(--font-space-mono)', color: 'var(--text-dim)', opacity: 0.55 }}
          >
            V1.0
          </span>
        </motion.div>

        {/* Hero body */}
        <motion.div
          className="flex-1 flex flex-col justify-center py-4 sm:py-6 max-w-7xl mx-auto w-full"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {/* Stacked mega-wordmark */}
          <motion.div variants={fadeIn} className="overflow-hidden mb-2 sm:mb-4">
            <motion.h1
              variants={fadeUp}
              style={{
                fontFamily: 'var(--font-bebas)',
                fontSize: 'clamp(5rem, 18vw, 16rem)',
                letterSpacing: '0.05em',
                lineHeight: 0.82,
                color: 'var(--text)',
              }}
            >
              AREA
              <br />
              LENS
            </motion.h1>
          </motion.div>

          {/* Ornamental rule */}
          <motion.div variants={fadeIn} className="flex items-center gap-3 mb-6 sm:mb-8">
            <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
            {[0,1,2,3,4].map(i => (
              <div
                key={i}
                className="w-1 h-1 rounded-full"
                style={{ background: 'var(--copper)', opacity: 0.18 + i * 0.14 }}
              />
            ))}
            <div className="h-px w-20" style={{ background: 'var(--copper)', opacity: 0.28 }} />
          </motion.div>

          {/* Two-column: tagline left, pitch + CTA right */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-20 items-end">

            {/* Tagline */}
            <motion.p
              variants={fadeUp}
              style={{
                fontFamily: 'var(--font-lora)',
                fontSize: 'clamp(1.5rem, 3.8vw, 2.8rem)',
                fontStyle: 'italic',
                color: 'var(--text)',
                lineHeight: 1.2,
              }}
            >
              Know your neighbourhood{' '}
              <span style={{ color: 'var(--copper-light)' }}>before</span>{' '}
              you move in.
            </motion.p>

            {/* Pitch + CTA */}
            <motion.div variants={fadeUp} className="flex flex-col gap-6">
              <p
                className="text-sm leading-relaxed"
                style={{
                  fontFamily: 'var(--font-dm-sans)',
                  color: 'var(--text-muted)',
                  lineHeight: 1.78,
                  maxWidth: '390px',
                }}
              >
                AreaLens maps the invisible infrastructure of India's tier-1 cities — flooding risk,
                power stability, water supply, noise, and commute — sector by sector, in a single live
                intelligence layer.
              </p>

              <div className="flex flex-col items-start gap-2.5">
                <CtaButton onClick={onEnter} />
                <p
                  className="text-[9px] tracking-widest"
                  style={{ fontFamily: 'var(--font-space-mono)', color: 'var(--text-dim)' }}
                >
                  Zero property listings &nbsp;·&nbsp; Pure neighbourhood intelligence
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* City ticker marquee */}
        <div
          className="overflow-hidden py-5 border-t"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="al-marquee">
            {tickerItems.map((city, i) => (
              <span
                key={i}
                className="flex items-center"
                style={{
                  fontFamily: 'var(--font-bebas)',
                  fontSize: '0.9rem',
                  letterSpacing: '0.2em',
                  color: 'var(--text-dim)',
                  paddingRight: '0',
                  opacity: 0.6,
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{ padding: '0 1.8rem' }}>{city}</span>
                <span style={{ color: 'var(--copper)', opacity: 0.35, fontSize: '0.45rem' }}>◆</span>
              </span>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="flex flex-col items-center gap-2 py-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 1.8, duration: 0.6 }}
        >
          <span
            className="text-[7.5px] tracking-[0.35em] uppercase"
            style={{ fontFamily: 'var(--font-space-mono)', color: 'var(--text-dim)' }}
          >
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 7, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg width="11" height="18" viewBox="0 0 11 18" fill="none">
              <path d="M5.5 0v13M1 9l4.5 5.5L10 9" stroke="var(--copper)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          §2  STATS — big numbers
      ════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-24 px-6 sm:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <SectionLabel text="By the numbers" />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 sm:gap-16">
            {STATS.map((s, i) => (
              <motion.div
                key={s.sub}
                className="flex flex-col gap-2"
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.65, ease: 'easeOut' as const }}
              >
                <div className="h-px w-10 mb-2" style={{ background: 'var(--copper)', opacity: 0.35 }} />
                <span
                  style={{
                    fontFamily: 'var(--font-bebas)',
                    fontSize: 'clamp(3.2rem, 8vw, 6rem)',
                    letterSpacing: '0.03em',
                    color: 'var(--copper-light)',
                    lineHeight: 1,
                  }}
                >
                  {s.num}
                </span>
                <span
                  className="text-[8.5px] uppercase leading-tight tracking-widest"
                  style={{
                    fontFamily: 'var(--font-space-mono)',
                    color: 'var(--text-dim)',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {s.sub}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Full-bleed rule */}
      <div className="relative z-10 px-6 sm:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto h-px" style={{ background: 'var(--border)' }} />
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          §3  MANIFESTO QUOTE
      ════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-28 px-6 sm:px-12 lg:px-20">
        <div className="max-w-5xl mx-auto">
          <motion.blockquote
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: 'easeOut' as const }}
            style={{
              fontFamily: 'var(--font-lora)',
              fontSize: 'clamp(1.4rem, 3.8vw, 2.8rem)',
              fontStyle: 'italic',
              color: 'var(--text)',
              lineHeight: 1.38,
            }}
          >
            &ldquo;Every Indian city has neighbourhoods that look identical on paper but{' '}
            <span style={{ color: 'var(--copper-light)' }}>live completely differently.</span>{' '}
            AreaLens sees the difference.&rdquo;
          </motion.blockquote>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="flex items-center gap-3 mt-10"
          >
            <div className="h-px w-8" style={{ background: 'var(--copper)', opacity: 0.4 }} />
            <span
              className="text-[8.5px] tracking-[0.3em] uppercase"
              style={{ fontFamily: 'var(--font-space-mono)', color: 'var(--text-dim)' }}
            >
              AreaLens · Neighbourhood Intelligence
            </span>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          §4  INTELLIGENCE LAYERS — feature grid
      ════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-24 px-6 sm:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">

          {/* Section header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-14">
            <motion.h2
              initial={{ opacity: 0, x: -28 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: 'easeOut' as const }}
              style={{
                fontFamily: 'var(--font-bebas)',
                fontSize: 'clamp(2.8rem, 8vw, 6rem)',
                letterSpacing: '0.07em',
                color: 'var(--text)',
                lineHeight: 0.88,
              }}
            >
              INTELLIGENCE
              <br />
              LAYERS
            </motion.h2>
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-[8.5px] tracking-[0.28em] uppercase mb-0.5"
              style={{ fontFamily: 'var(--font-space-mono)', color: 'var(--text-dim)' }}
            >
              6 active layers
            </motion.span>
          </div>

          {/* Grid — border-separated cells */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px"
            style={{ background: 'var(--border)' }}
          >
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.label}
                className="flex flex-col gap-5 p-7"
                style={{ background: 'var(--bg-panel)' }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
              >
                <div className="flex items-start justify-between">
                  <span className="text-2xl leading-none">{f.icon}</span>
                  <span
                    className="text-[9px]"
                    style={{ fontFamily: 'var(--font-space-mono)', color: 'var(--copper)', opacity: 0.4 }}
                  >
                    {f.num}
                  </span>
                </div>
                <div>
                  <div
                    className="text-[13px] font-semibold mb-2"
                    style={{ fontFamily: 'var(--font-dm-sans)', color: 'var(--text)', letterSpacing: '0.02em' }}
                  >
                    {f.label}
                  </div>
                  <div
                    className="text-[10px] leading-relaxed"
                    style={{ fontFamily: 'var(--font-space-mono)', color: 'var(--text-dim)', lineHeight: 1.68 }}
                  >
                    {f.desc}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          §5  CITIES COVERAGE
      ════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-24 px-6 sm:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <SectionLabel text="Coverage Map" />

          <motion.h2
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: 'easeOut' as const }}
            className="mb-12"
            style={{
              fontFamily: 'var(--font-bebas)',
              fontSize: 'clamp(2.8rem, 8vw, 5.5rem)',
              letterSpacing: '0.07em',
              color: 'var(--text)',
              lineHeight: 0.88,
            }}
          >
            WHERE WE
            <br />
            OPERATE
          </motion.h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {CITIES.map((city, i) => (
              <motion.div
                key={city.name}
                role={city.status === 'live' ? 'button' : undefined}
                tabIndex={city.status === 'live' ? 0 : undefined}
                onClick={city.status === 'live' && city.id ? () => enterCity(city.id!) : undefined}
                onKeyDown={city.status === 'live' && city.id
                  ? (e) => { if (e.key === 'Enter' || e.key === ' ') enterCity(city.id!) }
                  : undefined}
                className="flex flex-col gap-2.5 p-5 rounded-sm transition-colors"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
                whileHover={city.status === 'live' ? { y: -3 } : undefined}
                style={{
                  border: city.status === 'live'
                    ? '1px solid rgba(155,107,56,0.5)'
                    : '1px solid var(--border)',
                  background: city.status === 'live'
                    ? 'rgba(155,107,56,0.05)'
                    : 'transparent',
                  cursor: city.status === 'live' ? 'pointer' : 'default',
                }}
              >
                {/* Status badge */}
                <div className="flex items-center gap-1.5">
                  {city.status === 'live' ? (
                    <>
                      <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--copper)' }} />
                      <span
                        className="text-[7.5px] tracking-widest uppercase"
                        style={{ fontFamily: 'var(--font-space-mono)', color: 'var(--copper)' }}
                      >
                        Live
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--text-dim)', opacity: 0.35 }} />
                      <span
                        className="text-[7.5px] tracking-widest uppercase"
                        style={{ fontFamily: 'var(--font-space-mono)', color: 'var(--text-dim)', opacity: 0.45 }}
                      >
                        Soon
                      </span>
                    </>
                  )}
                </div>

                <span
                  style={{
                    fontFamily: 'var(--font-bebas)',
                    fontSize: '1.45rem',
                    letterSpacing: '0.06em',
                    color: city.status === 'live' ? 'var(--copper-light)' : 'var(--text-muted)',
                    lineHeight: 1,
                  }}
                >
                  {city.name}
                </span>

                <span
                  className="text-[8px]"
                  style={{ fontFamily: 'var(--font-space-mono)', color: 'var(--text-dim)' }}
                >
                  {city.note}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Full-bleed rule */}
      <div className="relative z-10 px-6 sm:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto h-px" style={{ background: 'var(--border)' }} />
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          §6  BOTTOM CTA
      ════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-36 px-6 sm:px-12 lg:px-20 flex flex-col items-center text-center">

        <motion.div
          className="flex items-center gap-3 mb-14 w-full max-w-2xl"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
          <span
            className="text-[8.5px] tracking-[0.32em] uppercase"
            style={{ fontFamily: 'var(--font-space-mono)', color: 'var(--text-dim)' }}
          >
            Get started
          </span>
          <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.85, ease: 'easeOut' as const }}
          className="mb-12"
          style={{
            fontFamily: 'var(--font-bebas)',
            fontSize: 'clamp(3.2rem, 12vw, 9.5rem)',
            letterSpacing: '0.06em',
            lineHeight: 0.86,
            color: 'var(--text)',
          }}
        >
          YOUR NEXT
          <br />
          HOME STARTS
          <br />
          WITH DATA
        </motion.h2>

        <motion.div
          className="flex flex-col items-center gap-3"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <CtaButton onClick={onEnter} large />
          <p
            className="text-[9px] tracking-widest mt-1"
            style={{ fontFamily: 'var(--font-space-mono)', color: 'var(--text-dim)' }}
          >
            Zero property listings &nbsp;·&nbsp; Pure neighbourhood intelligence
          </p>
        </motion.div>

        {/* Footer metadata */}
        <motion.div
          className="flex items-center gap-4 mt-20 opacity-40"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.4 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <div className="h-px w-12" style={{ background: 'var(--border)' }} />
          <span
            className="text-[8px] tracking-[0.28em] uppercase"
            style={{ fontFamily: 'var(--font-space-mono)', color: 'var(--text-dim)' }}
          >
            AreaLens · India · V1.0
          </span>
          <div className="h-px w-12" style={{ background: 'var(--border)' }} />
        </motion.div>
      </section>
    </motion.div>
  )
}
