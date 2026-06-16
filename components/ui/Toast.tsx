// ============================================================
// components/ui/Toast.tsx
// Toast notification ringan (tanpa library external)
// ============================================================

'use client'

import { useEffect, useState } from 'react'
import { cn }                   from '@/lib/utils/cn'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastProps {
  message: string
  type?:   ToastType
  onClose: () => void
}

export function Toast({ message, type = 'info', onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  const styles: Record<ToastType, string> = {
    success: 'bg-green-600 text-white',
    error:   'bg-red-600 text-white',
    warning: 'bg-amber-500 text-white',
    info:    'bg-neutral-800 text-white',
  }

  return (
    <div
      className={cn(
        'fixed bottom-20 left-4 right-4 z-50 py-3 px-4 rounded-lg shadow-elevated',
        'animate-slide-up flex items-center gap-3',
        styles[type]
      )}
      onClick={onClose}
    >
      <ToastIcon type={type} />
      <p className="text-sm font-medium flex-1">{message}</p>
    </div>
  )
}

function ToastIcon({ type }: { type: ToastType }) {
  const icons = {
    success: '✓',
    error:   '✕',
    warning: '⚠',
    info:    'ℹ',
  }
  return <span className="text-base font-bold">{icons[type]}</span>
}

// -----------------------------------------------------------
// Hook sederhana untuk menggunakan Toast
// -----------------------------------------------------------
export function useToast() {
  const [toast, setToast] = useState<{
    message: string
    type:    ToastType
  } | null>(null)

  function showToast(message: string, type: ToastType = 'info') {
    setToast({ message, type })
  }

  function hideToast() {
    setToast(null)
  }

  const ToastComponent = toast ? (
    <Toast message={toast.message} type={toast.type} onClose={hideToast} />
  ) : null

  return { showToast, ToastComponent }
}
