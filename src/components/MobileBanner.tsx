'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/lib/store'

export default function MobileBanner() {
  const [dismissed, setDismissed] = useState(false)
  // Hide the nudge while a sector report is open so it never overlaps the
  // bottom sheet's drag handle / close button (esp. when expanded to full).
  const selectedSectorId = useStore(s => s.selectedSectorId)

  // Auto-dismiss after 7s — it's a one-time orientation hint, not a persistent
  // bar. The user can still close it early via the × button.
  useEffect(() => {
    const t = setTimeout(() => setDismissed(true), 7000)
    return () => clearTimeout(t)
  }, [])

  if (typeof window !== 'undefined' && window.innerWidth >= 1024) return null

  return (
    <AnimatePresence>
      {!dismissed && !selectedSectorId && (
        <motion.div
          className="fixed top-16 left-4 right-4 z-50 flex items-start gap-3 rounded-xl px-4 py-3"
          style={{ background: 'var(--bg-panel)', border: '1px solid rgba(192,120,32,0.25)' }}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
        >
          <span className="flex-shrink-0 mt-0.5" style={{ color: 'var(--amber)' }}>💡</span>
          <p className="text-xs flex-1" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            Best experienced on desktop. Mobile view is functional but optimised for larger screens.
          </p>
          <button onClick={() => setDismissed(true)} className="text-base leading-none flex-shrink-0" style={{ color: 'var(--text-dim)' }}>
            ×
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
