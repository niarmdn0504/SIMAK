'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

interface Stats {
  totalSiswa:  number
  totalStaff:  number
  totalKelas:  number
  tahunAktif:  string
}

export function AdminDashboardClient({ stats }: { stats: Stats; adminNama: string }) {
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700 rounded-2xl p-5 text-white relative overflow-hidden">
        <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full" />
        <div className="absolute -right-2 -bottom-8 w-24 h-24 bg-white/5 rounded-full" />
        <div className="relative z-10">
          <p className="text-primary-100 text-xs font-medium uppercase tracking-wide">Tahun Ajaran {stats.tahunAktif}</p>
          <h1 className="text-2xl font-bold mt-1">Selamat Datang</h1>
          <p className="text-primary-200 text-sm mt-0.5">Kelola data siswa dan mutabaah sekolah</p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white relative overflow-hidden">
          <div className="absolute -right-3 -bottom-3 w-16 h-16 bg-white/10 rounded-full" />
          <p className="text-3xl font-bold relative z-10">{stats.totalSiswa}</p>
          <p className="text-blue-100 text-xs mt-0.5 relative z-10">Siswa Aktif</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white relative overflow-hidden">
          <div className="absolute -right-3 -bottom-3 w-16 h-16 bg-white/10 rounded-full" />
          <p className="text-3xl font-bold relative z-10">{stats.totalKelas}</p>
          <p className="text-purple-100 text-xs mt-0.5 relative z-10">Kelas</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-4 text-white relative overflow-hidden">
          <div className="absolute -right-3 -bottom-3 w-16 h-16 bg-white/10 rounded-full" />
          <p className="text-3xl font-bold relative z-10">{stats.totalStaff}</p>
          <p className="text-amber-100 text-xs mt-0.5 relative z-10">Staff</p>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-neutral-600 mb-3">Akses Cepat</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickAction href="/admin/siswa"          label="Kelola Siswa"    color="bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 border-blue-200" icon={<IconSiswa />} />
          <QuickAction href="/admin/siswa?import=1" label="Import Data"     color="bg-gradient-to-br from-teal-50 to-teal-100 text-teal-700 border-teal-200" icon={<IconImport />} />
          <QuickAction href="/admin/staff"          label="Kelola Guru"     color="bg-gradient-to-br from-purple-50 to-purple-100 text-purple-700 border-purple-200" icon={<IconStaff />} />
          <QuickAction href="/admin/mutabaah-items" label="Item Mutabaah"   color="bg-gradient-to-br from-amber-50 to-amber-100 text-amber-700 border-amber-200" icon={<IconCheck />} />
          <QuickAction href="/admin/tahun-ajaran"   label="Tahun Ajaran"    color="bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-700 border-indigo-200" icon={<IconTahun />} />
          <QuickAction href="/admin/export"         label="Export Data"     color="bg-gradient-to-br from-orange-50 to-orange-100 text-orange-700 border-orange-200" icon={<IconExport />} />
          <QuickAction href="/admin/kenaikan-kelas" label="Kenaikan Kelas"  color="bg-gradient-to-br from-pink-50 to-pink-100 text-pink-700 border-pink-200" icon={<IconUp />} />
          <QuickAction href="/tahfiz"               label="Tahfiz"          color="bg-gradient-to-br from-green-50 to-green-100 text-green-700 border-green-200" icon={<IconBook />} />
        </div>
      </div>
    </div>
  )
}

function QuickAction({ href, label, icon, color }: {
  href: string; label: string; icon: React.ReactNode; color: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 p-3.5 rounded-xl border transition-all active:scale-[0.97] hover:shadow-md',
        color
      )}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="text-sm font-semibold leading-tight">{label}</span>
    </Link>
  )
}

// ─── Icons ──────────────────────────────────────────
function IconSiswa() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
function IconStaff() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  )
}
function IconCheck() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  )
}
function IconTahun() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}
function IconImport() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}
function IconExport() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}
function IconUp() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  )
}
function IconBook() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  )
}
