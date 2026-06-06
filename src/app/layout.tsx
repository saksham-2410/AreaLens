import type { Metadata, Viewport } from 'next'
import { Lora, DM_Sans, Space_Mono, Bebas_Neue } from 'next/font/google'
import './globals.css'

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
  display: 'swap',
})

const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-bebas',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AreaLens — Gurugram Neighborhood Intelligence',
  description: 'Uncover the real story behind every Gurugram sector. Air quality, water supply, power reliability, commute times — before you sign.',
  keywords: ['Gurugram', 'neighborhood', 'real estate', 'quality of life', 'sector analysis'],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${lora.variable} ${dmSans.variable} ${spaceMono.variable} ${bebasNeue.variable} h-full`}
      style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
    >
      <body
        className="h-full overflow-hidden antialiased"
        style={{ background: 'var(--bg)', color: 'var(--text)' }}
        // Browser extensions (Bitwarden, Grammarly, etc.) inject attributes
        // onto <body> before React hydrates, causing a hydration mismatch
        // that isn't ours to fix. Suppress the warning on this element only.
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  )
}
