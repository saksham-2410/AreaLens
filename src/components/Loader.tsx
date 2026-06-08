'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const LOAD_STEPS = [
  'Initialising spatial engine...',
  'Loading neighbourhood data...',
  'Calibrating quality indices...',
  'Rendering map canvas...',
  'Ready.',
]

export default function Loader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0)
  const [stepIdx, setStepIdx] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    let p = 0
    const interval = setInterval(() => {
      p += Math.random() * 14 + 4
      if (p >= 100) {
        p = 100
        clearInterval(interval)
        setProgress(100)
        setStepIdx(LOAD_STEPS.length - 1)
        setTimeout(() => setDone(true), 500)
        setTimeout(() => onComplete(), 1200)
        return
      }
      setProgress(Math.min(p, 98))
      setStepIdx(Math.floor((p / 100) * (LOAD_STEPS.length - 1)))
    }, 200)
    return () => clearInterval(interval)
  }, [onComplete])

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{ background: 'var(--bg)' }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
        >
          {/* Subtle grid */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(155,107,56,1) 1px, transparent 1px), linear-gradient(90deg, rgba(155,107,56,1) 1px, transparent 1px)',
              backgroundSize: '56px 56px',
            }}
          />

          <div className="relative z-10 flex flex-col items-center gap-10 px-8 text-center">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center gap-3"
            >
              <div className="relative">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(155,107,56,0.08)', border: '1px solid rgba(155,107,56,0.22)' }}
                >
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <path d="M16 2L28 8V24L16 30L4 24V8L16 2Z" stroke="#9B6B38" strokeWidth="1.5" fill="rgba(155,107,56,0.08)" />
                    <circle cx="16" cy="16" r="4" fill="#9B6B38" fillOpacity="0.85" />
                    <line x1="16" y1="2"  x2="16" y2="12" stroke="#9B6B38" strokeWidth="1" strokeOpacity="0.4" />
                    <line x1="16" y1="20" x2="16" y2="30" stroke="#9B6B38" strokeWidth="1" strokeOpacity="0.4" />
                    <line x1="28" y1="8"  x2="20" y2="13" stroke="#9B6B38" strokeWidth="1" strokeOpacity="0.4" />
                    <line x1="4"  y1="8"  x2="12" y2="13" stroke="#9B6B38" strokeWidth="1" strokeOpacity="0.4" />
                  </svg>
                </div>
                {/* Pulse ring */}
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  style={{ border: '1px solid rgba(155,107,56,0.25)' }}
                  animate={{ scale: [1, 1.35], opacity: [0.5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                />
              </div>

              <div>
                <h1
                  className="text-4xl tracking-wider"
                  style={{ fontFamily: 'var(--font-bebas)', color: 'var(--text)', letterSpacing: '0.08em' }}
                >
                  AREALENS
                </h1>
                <p
                  className="text-xs tracking-widest uppercase mt-1"
                  style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}
                >
                  Neighbourhood Intelligence Platform
                </p>
              </div>
            </motion.div>

            {/* Progress */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="w-72 flex flex-col gap-3"
            >
              <div className="relative h-px" style={{ background: 'rgba(155,107,56,0.12)' }}>
                <motion.div
                  className="absolute left-0 top-0 h-full"
                  style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(to right, #9B6B38, #C8A046)',
                    transition: 'width 0.25s ease',
                  }}
                />
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                  style={{ left: `calc(${progress}% - 4px)`, background: '#C8A046' }}
                />
              </div>

              <div className="flex justify-between items-center">
                <p className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
                  {LOAD_STEPS[stepIdx]}
                </p>
                <p
                  className="tabular-nums"
                  style={{ fontFamily: 'var(--font-bebas)', fontSize: '18px', letterSpacing: '0.08em', color: 'var(--copper)' }}
                >
                  {Math.round(progress)}
                </p>
              </div>
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 0.7 }}
            className="absolute bottom-8 text-xs tracking-widest uppercase"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}
          >
            Phase 1 · India Tier-1 Cities · v1.0
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
