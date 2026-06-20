// ============================================================
// app/layout.tsx
// Root layout — font, metadata, QueryClient provider
// ============================================================

import type { Metadata, Viewport } from 'next'
import { Amiri, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const amiri = Amiri({
  subsets:  ['latin', 'arabic'],
  weight:   ['400', '700'],
  variable: '--font-amiri',
  display:  'swap',
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets:  ['latin'],
  weight:   ['400', '500', '600', '700'],
  variable: '--font-plus-jakarta',
  display:  'swap',
})

export const metadata: Metadata = {
  title:       'SIMAK — Monitoring Akhlak & Karakter SDIT Al-Kautsar Muko-muko',
  description: 'Aplikasi Monitoring Akhlak dan Karakter SDIT Al-Kautsar Muko-muko',
  manifest:    '/manifest.json',
  icons: {
    icon: '/logo.png',
  },
  appleWebApp: {
    capable:       true,
    statusBarStyle: 'default',
    title:         'SIMAK',
  },
}

export const viewport: Viewport = {
  themeColor:       '#2D7A4F',
  width:            'device-width',
  initialScale:     1,
  maximumScale:     1,
  userScalable:     false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className={`${amiri.variable} ${plusJakarta.variable}`}>
      <body className="font-body bg-neutral-50 text-neutral-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
