// ============================================================
// app/(staff)/admin/AdminDashboardClient.tsx
// Dashboard admin — menu grid + statistik sekolah
// ============================================================

'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

interface Stats {
  totalSiswa:  number
  totalStaff:  number
  totalKelas:  number
  tahunAktif:  string
}

const MENU_ITEMS = [
  { href: '/admin/siswa',          icon: '👤', label: 'Kelola Siswa',       desc: 'Tambah, edit, import siswa',    color: 'bg-blue-50   border-blue-200   text-blue-700' },
  { href: '/admin/kelas',          icon: '🏫', label: 'Kelola Kelas',       desc: 'Atur kelas dan wali kelas',     color: 'bg-green-50  border-green-200  text-green-700' },
  { href: '/admin/tahun-ajaran',   icon: '📅', label: 'Tahun Ajaran',       desc: 'Kelola tahun ajaran aktif',     color: 'bg-purple-50 border-purple-200 text-purple-700' },
  { href: '/admin/mutabaah-items', icon: '✅', label: 'Item Mutabaah',      desc: 'Atur item ibadah harian',       color: 'bg-amber-50  border-amber-200  text-amber-700' },
  { href: '/admin/siswa?import=1', icon: '📥', label: 'Import Excel',       desc: 'Bulk import data siswa',        color: 'bg-teal-50   border-teal-200   text-teal-700' },
  { href: '/admin/export',         icon: '📤', label: 'Export Data',        desc: 'Export mutabaah/tahfiz/wafa',   color: 'bg-orange-50 border-orange-200 text-orange-700' },
  { href: '/admin/kenaikan-kelas', icon: '🎓', label: 'Kenaikan Kelas',     desc: 'Simulasi & eksekusi promosi',   color: 'bg-pink-50   border-pink-200   text-pink-700' },
  { href: '/admin/staff',          icon: '👥', label: 'Kelola Akun Guru',   desc: 'Buat & atur akun staff',        color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
]

export function AdminDashboardClient({ stats, adminNama }: { stats: Stats; adminNama: string }) {
  return (
    <div className="px-4 py-4 max-w-lg mx-auto">
      {/* Greeting */}
      <div className="mb-5 animate-in">
        <h2 className="text-lg font-bold text-neutral-800">Halo, {adminNama} 👋</h2>
        <p className="text-xs text-neutral-400 mt-0.5">Tahun Ajaran Aktif: <span className="font-semibold text-primary-600">{stats.tahunAktif}</span></p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3 mb-6 animate-in" style={{ animationDelay: '0.05s' }}>
        <StatCard value={stats.totalSiswa} label="Siswa Aktif" color="text-primary-600" bg="bg-primary-50" />
        <StatCard value={stats.totalKelas} label="Kelas"       color="text-blue-600"    bg="bg-blue-50" />
        <StatCard value={stats.totalStaff} label="Staff"       color="text-purple-600"  bg="bg-purple-50" />
      </div>

      {/* Menu grid */}
      <div className="grid grid-cols-2 gap-3">
        {MENU_ITEMS.map((item, i) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'card border flex flex-col gap-2 hover:shadow-elevated active:scale-[0.97] transition-all animate-in',
              item.color
            )}
            style={{ animationDelay: `${0.08 + i * 0.04}s` }}
          >
            <span className="text-2xl">{item.icon}</span>
            <div>
              <p className="font-bold text-sm leading-tight">{item.label}</p>
              <p className="text-[11px] opacity-70 mt-0.5 leading-tight">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

function StatCard({ value, label, color, bg }: { value: number; label: string; color: string; bg: string }) {
  return (
    <div className={cn('rounded-lg px-3 py-3 text-center', bg)}>
      <p className={cn('text-2xl font-bold', color)}>{value}</p>
      <p className="text-[11px] text-neutral-500 mt-0.5 leading-tight">{label}</p>
    </div>
  )
}
