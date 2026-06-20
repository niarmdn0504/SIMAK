'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

interface Stats {
  totalSiswa:     number
  totalStaff:     number
  totalKelas:     number
  tahunAktif:     string
  mutabaahHariIni: number
  tahfizHariIni:  number
  wafaHariIni:    number
  totalSiswaAktif: number
}

export function AdminDashboardClient({ stats }: { stats: Stats; adminNama: string }) {
  const mutabaahRate = stats.totalSiswaAktif > 0
    ? Math.round((stats.mutabaahHariIni / stats.totalSiswaAktif) * 100)
    : 0

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

      {/* Ringkasan Sekolah */}
      <div>
        <h2 className="text-sm font-semibold text-neutral-500 mb-3">Ringkasan Sekolah</h2>
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            value={stats.totalSiswa}
            label="Siswa Aktif"
            icon={<IconUsers />}
            color="from-blue-500 to-blue-600"
          />
          <StatCard
            value={stats.totalKelas}
            label="Kelas"
            icon={<IconKelas />}
            color="from-purple-500 to-purple-600"
          />
          <StatCard
            value={stats.totalStaff}
            label="Guru"
            icon={<IconStaff />}
            color="from-amber-500 to-amber-600"
          />
        </div>
      </div>

      {/* Aktivitas Hari Ini */}
      <div>
        <h2 className="text-sm font-semibold text-neutral-500 mb-3">Aktivitas Hari Ini</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Mutabaah */}
          <div className="bg-white rounded-xl p-4 shadow-card border border-neutral-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <IconCheck className="text-green-600" />
              </div>
              <div>
                <p className="text-xs text-neutral-400">Mutabaah Hari Ini</p>
                <p className="text-xl font-bold text-neutral-800">{stats.mutabaahHariIni}</p>
              </div>
            </div>
            <div className="w-full bg-neutral-100 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(mutabaahRate, 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-neutral-400 mt-1.5">{mutabaahRate}% dari {stats.totalSiswaAktif} siswa</p>
          </div>

          {/* Tahfiz */}
          <div className="bg-white rounded-xl p-4 shadow-card border border-neutral-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <IconBook className="text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-neutral-400">Tahfizh Hari Ini</p>
                <p className="text-xl font-bold text-neutral-800">{stats.tahfizHariIni}</p>
              </div>
            </div>
            <p className="text-[11px] text-neutral-400">setoran tercatat hari ini</p>
          </div>

          {/* Wafa */}
          <div className="bg-white rounded-xl p-4 shadow-card border border-neutral-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <IconStar className="text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-neutral-400">Wafa Hari Ini</p>
                <p className="text-xl font-bold text-neutral-800">{stats.wafaHariIni}</p>
              </div>
            </div>
            <p className="text-[11px] text-neutral-400">progress tercatat hari ini</p>
          </div>
        </div>
      </div>

      {/* Akses Cepat */}
      <div>
        <h2 className="text-sm font-semibold text-neutral-500 mb-3">Akses Cepat</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickAction href="/admin/siswa"            label="Kelola Siswa"    color="bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 border-blue-200" icon={<IconUsers />} />
          <QuickAction href="/admin/staff"            label="Kelola Guru"     color="bg-gradient-to-br from-purple-50 to-purple-100 text-purple-700 border-purple-200" icon={<IconStaff />} />
          <QuickAction href="/admin/mutabaah-items"   label="Item Mutabaah"   color="bg-gradient-to-br from-amber-50 to-amber-100 text-amber-700 border-amber-200" icon={<IconCheck />} />
          <QuickAction href="/admin/tahun-ajaran"     label="Tahun Ajaran"    color="bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-700 border-indigo-200" icon={<IconCalendar />} />
          <QuickAction href="/admin/assign-guru"      label="Penugasan Guru"  color="bg-gradient-to-br from-teal-50 to-teal-100 text-teal-700 border-teal-200" icon={<IconAssign />} />
          <QuickAction href="/admin/kenaikan-kelas"   label="Kenaikan Kelas"  color="bg-gradient-to-br from-pink-50 to-pink-100 text-pink-700 border-pink-200" icon={<IconTrendUp />} />
          <QuickAction href="/admin/export"           label="Export Data"     color="bg-gradient-to-br from-orange-50 to-orange-100 text-orange-700 border-orange-200" icon={<IconDownload />} />
          <QuickAction href="/admin/siswa?import=1"   label="Import Data"     color="bg-gradient-to-br from-cyan-50 to-cyan-100 text-cyan-700 border-cyan-200" icon={<IconUpload />} />
        </div>
      </div>
    </div>
  )
}

function StatCard({ value, label, icon, color }: {
  value: number; label: string; icon: React.ReactNode; color: string
}) {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-xl p-4 text-white relative overflow-hidden`}>
      <div className="absolute -right-3 -bottom-3 w-16 h-16 bg-white/10 rounded-full" />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2 opacity-80">{icon}</div>
        <p className="text-3xl font-bold">{value}</p>
        <p className="text-white/80 text-xs mt-0.5">{label}</p>
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
function IconUsers() {
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
function IconKelas() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  )
}
function IconCheck({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  )
}
function IconCalendar() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}
function IconBook({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  )
}
function IconStar({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}
function IconAssign() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="20" y1="8" x2="20" y2="14" />
      <line x1="23" y1="11" x2="17" y2="11" />
    </svg>
  )
}
function IconTrendUp() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  )
}
function IconDownload() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}
function IconUpload() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}
