// ============================================================
// components/staff/StaffShell.tsx
// Shell layout untuk semua role staff
// ============================================================

'use client'

import { useRouter }   from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn }           from '@/lib/utils/cn'
import type { StaffRole } from '@/lib/types/app'

const ROLE_LABEL: Record<StaffRole, string> = {
  admin:       'Admin',
  wali_kelas:  'Wali Kelas',
  guru_tahfiz: 'Guru Tahfiz',
  guru_wafa:   'Guru Wafa',
}

const ROLE_COLOR: Record<StaffRole, string> = {
  admin:       'bg-purple-100 text-purple-700',
  wali_kelas:  'bg-blue-100 text-blue-700',
  guru_tahfiz: 'bg-green-100 text-green-700',
  guru_wafa:   'bg-amber-100 text-amber-700',
}

export function StaffShell({
  children,
  nama,
  role,
  backHref,
  backLabel,
  title,
}: {
  children:   React.ReactNode
  nama:       string
  role:       StaffRole
  backHref?:  string
  backLabel?: string
  title?:     string
}) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-primary-500 text-white sticky top-0 z-40 shadow-md">
        <div className="flex items-center h-14 px-4 gap-3">
          {/* Back button */}
          {backHref && (
            <button
              onClick={() => router.push(backHref)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-primary-600 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}

          {/* Title / Logo */}
          <div className="flex-1 min-w-0">
            {title ? (
              <p className="font-semibold text-sm truncate">{title}</p>
            ) : (
              <span className="font-display font-bold text-xl">SIMAK</span>
            )}
          </div>

          {/* Role + Name + Logout */}
          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-primary-200 leading-none">{nama}</p>
              <p className="text-xs text-primary-100 leading-none mt-0.5">
                {ROLE_LABEL[role]}
              </p>
            </div>
            <button
              onClick={handleLogout}
              title="Keluar"
              className="w-8 h-8 bg-primary-600 hover:bg-primary-700 rounded-full flex items-center justify-center transition-colors"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Role badge strip */}
        {!backHref && (
          <div className="px-4 pb-2">
            <span className={cn('text-xs font-semibold px-2.5 py-0.5 rounded-full', ROLE_COLOR[role])}>
              {ROLE_LABEL[role]}
            </span>
          </div>
        )}
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
