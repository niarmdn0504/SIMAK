'use client'

import { useState }                            from 'react'
import Link                                    from 'next/link'
import { useRouter, usePathname }              from 'next/navigation'
import { createClient }                        from '@/lib/supabase/client'
import { cn }                                  from '@/lib/utils/cn'
import type { StaffRole }                      from '@/lib/types/app'

const ROLE_LABEL: Record<StaffRole, string> = {
  admin:       'Admin',
  wali_kelas:  'Wali Kelas',
  guru_tahfiz: 'Guru Tahfiz',
  guru_wafa:   'Guru Wafa',
}

interface MenuItem {
  href:    string
  label:   string
  icon:    React.ReactNode
  roles:   StaffRole[]
}

const MENU_ITEMS: MenuItem[] = [
  { href: '/guru',              label: 'Dashboard',   icon: <IconDashboard />,  roles: ['wali_kelas', 'guru_tahfiz', 'guru_wafa'] },
  { href: '/guru/tahfiz',       label: 'Tahfiz',      icon: <IconTahfiz />,     roles: ['guru_tahfiz'] },
  { href: '/guru/wafa',         label: 'Wafa',        icon: <IconWafa />,       roles: ['guru_wafa'] },
  { href: '/guru/wali-kelas',   label: 'Wali Kelas',  icon: <IconWaliKelas />,  roles: ['wali_kelas'] },
]

export function GuruShell({
  children,
  nama,
  roles,
}: {
  children: React.ReactNode
  nama:     string
  roles:    StaffRole[]
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router   = useRouter()
  const pathname = usePathname()

  const filteredMenu = MENU_ITEMS.filter(item =>
    item.roles.some(r => roles.includes(r))
  )

  const parentPath = pathname.split('/').filter(Boolean).length > 2
    ? pathname.substring(0, pathname.lastIndexOf('/')) || '/guru'
    : null
  const isSubPage = parentPath !== null

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex">
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-primary-800 text-white z-50">
        <SidebarContent
          nama={nama}
          roles={roles}
          pathname={pathname}
          filteredMenu={filteredMenu}
          onLogout={handleLogout}
        />
      </aside>

      {/* ── Mobile Sidebar Overlay ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div
            className="absolute inset-0 bg-black/40 transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 bg-primary-800 text-white shadow-2xl transition-transform animate-in slide-in-from-left">
            <SidebarContent
              nama={nama}
              roles={roles}
              pathname={pathname}
              filteredMenu={filteredMenu}
              onLogout={() => { setSidebarOpen(false); handleLogout() }}
              onClose={() => setSidebarOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* ── Main Area ── */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <header className="md:hidden bg-primary-600 text-white sticky top-0 z-40 shadow-md">
          <div className="flex items-center h-14 px-4 gap-3">
            {isSubPage ? (
              <Link
                href={parentPath!}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-primary-700 transition-colors -ml-1"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </Link>
            ) : (
              <button
                onClick={() => setSidebarOpen(true)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-primary-700 transition-colors -ml-1"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            )}
            <span className="font-display font-bold text-lg flex-1">SIMAK</span>
            <button
              onClick={handleLogout}
              title="Keluar"
              className="w-8 h-8 bg-primary-700 hover:bg-primary-800 rounded-full flex items-center justify-center transition-colors"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

// ─── Sidebar Content ────────────────────────────────
function SidebarContent({
  nama,
  roles,
  pathname,
  filteredMenu,
  onLogout,
  onClose,
}: {
  nama:          string
  roles:         StaffRole[]
  pathname:      string
  filteredMenu:  MenuItem[]
  onLogout:      () => void
  onClose?:      () => void
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-primary-700/50 flex-shrink-0">
        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-white">
          <img src="/logo.png" alt="SIMAK" className="w-full h-full object-contain" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-lg leading-tight">SIMAK</p>
          <p className="text-primary-300 text-[10px] leading-tight">SDIT Al-Kautsar Mukomuko</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-primary-700 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Role badges */}
      <div className="px-5 pt-4 pb-2 flex flex-wrap gap-1.5">
        {roles.map(r => (
          <span
            key={r}
            className={cn(
              'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide',
              r === 'wali_kelas'  ? 'bg-blue-100 text-blue-700' :
              r === 'guru_tahfiz' ? 'bg-green-100 text-green-700' :
              r === 'guru_wafa'   ? 'bg-amber-100 text-amber-700' :
              'bg-purple-100 text-purple-700'
            )}
          >
            {ROLE_LABEL[r]}
          </span>
        ))}
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {filteredMenu.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/guru' && pathname.startsWith(item.href + '/'))
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative',
                isActive
                  ? 'bg-white/20 text-white shadow-sm'
                  : 'text-primary-200 hover:bg-white/10 hover:text-white'
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full" />
              )}
              <span className="w-5 h-5 flex items-center justify-center flex-shrink-0">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User profile + logout */}
      <div className="border-t border-primary-700/50 px-4 py-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">{nama.charAt(0)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate leading-tight">{nama}</p>
            <p className="text-primary-300 text-[11px] leading-tight truncate">
              {roles.map(r => ROLE_LABEL[r]).join(' & ')}
            </p>
          </div>
          <button
            onClick={onLogout}
            title="Keluar"
            className="w-8 h-8 bg-primary-700 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Icons ──────────────────────────────────────────
function IconDashboard() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}
function IconTahfiz() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  )
}
function IconWafa() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}
function IconWaliKelas() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  )
}
