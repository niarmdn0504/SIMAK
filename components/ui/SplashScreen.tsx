'use client'

import { useEffect, useState } from 'react'

export function SplashScreen() {
  const [visible, setVisible] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const timer1 = setTimeout(() => setFadeOut(true), 1800)
    const timer2 = setTimeout(() => setVisible(false), 2200)
    return () => { clearTimeout(timer1); clearTimeout(timer2) }
  }, [])

  if (!visible) return null

  return (
    <div
      className={`fixed inset-0 z-[100] bg-primary-700 flex flex-col items-center justify-center transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
    >
      {/* Logo */}
      <div className="w-24 h-24 bg-white/15 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm border border-white/20 animate-pulse">
        <span className="font-display text-white text-4xl font-bold">س</span>
      </div>

      {/* App name */}
      <h1 className="font-display text-white text-5xl font-bold tracking-wide mb-2">
        SIMAK
      </h1>

      {/* Tagline */}
      <p className="text-primary-100 text-sm font-body">
        Monitoring Akhlak & Karakter
      </p>
      <p className="text-primary-200 text-xs font-body mt-1">
        SDIT Al-Kautsar Mukomuko
      </p>

      {/* Loading dots */}
      <div className="flex gap-1.5 mt-10">
        <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  )
}
