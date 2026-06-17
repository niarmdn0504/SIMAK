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
      {/* Welcome */}
      <div>
        <h1 className="text-xl font-bold text-neutral-800">Dashboard</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Tahun Ajaran <span className="font-semibold text-primary-600">{stats.tahunAktif}</span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard value={stats.totalSiswa} label="Siswa Aktif" icon={<IconSiswa />} color="text-primary-600" bg="bg-primary-50" border="border-primary-100" />
        <StatCard value={stats.totalKelas} label="Kelas"       icon={<IconKelas />} color="text-blue-600"    bg="bg-blue-50"    border="border-blue-100" />
        <StatCard value={stats.totalStaff} label="Staff"       icon={<IconStaff />} color="text-purple-600"  bg="bg-purple-50"  border="border-purple-100" />
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-neutral-600 mb-3">Akses Cepat</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickAction href="/admin/siswa"        label="Kelola Siswa"  icon={<IconSiswa />}   color="bg-blue-50 text-blue-600 hover:bg-blue-100" />
          <QuickAction href="/admin/kelas"        label="Kelola Kelas"  icon={<IconKelas />}   color="bg-green-50 text-green-600 hover:bg-green-100" />
          <QuickAction href="/admin/staff"        label="Kelola Guru"   icon={<IconStaff />}   color="bg-purple-50 text-purple-600 hover:bg-purple-100" />
          <QuickAction href="/admin/mutabaah-items" label="Item Mutabaah" icon={<IconCheck />} color="bg-amber-50 text-amber-600 hover:bg-amber-100" />
          <QuickAction href="/admin/tahun-ajaran" label="Tahun Ajaran"  icon={<IconTahun />}   color="bg-indigo-50 text-indigo-600 hover:bg-indigo-100" />
          <QuickAction href="/admin/siswa?import=1" label="Import Data" icon={<IconImport />}  color="bg-teal-50 text-teal-600 hover:bg-teal-100" />
          <QuickAction href="/admin/export"       label="Export Data"   icon={<IconExport />}  color="bg-orange-50 text-orange-600 hover:bg-orange-100" />
          <QuickAction href="/admin/kenaikan-kelas" label="Kenaikan Kelas" icon={<IconUp />}  color="bg-pink-50 text-pink-600 hover:bg-pink-100" />
        </div>
      </div>
    </div>
  )
}

function StatCard({ value, label, icon, color, bg, border }: {
  value: number; label: string; icon: React.ReactNode; color: string; bg: string; border: string
}) {
  return (
    <div className={cn('rounded-xl border p-4', bg, border)}>
      <div className={cn('mb-2', color)}>{icon}</div>
      <p className={cn('text-2xl font-bold', color)}>{value}</p>
      <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
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
        'flex items-center gap-3 p-3 rounded-xl transition-all active:scale-[0.97]',
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
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
function IconKelas() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  )
}
function IconStaff() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  )
}
function IconCheck() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  )
}
function IconTahun() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}
function IconImport() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}
function IconExport() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}
function IconUp() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  )
}
