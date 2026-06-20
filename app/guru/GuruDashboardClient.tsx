'use client'

import Link from 'next/link'

interface Stats {
  totalSiswa:    number
  totalKelas:    number
  tahunAktif:    string
  mutabaahToday: number
}

interface MenuCard {
  href:     string
  label:    string
  icon:     React.ReactNode
  color:    string
}

const MENU_CARDS: MenuCard[] = [
  {
    href: '/guru/kelas',
    label: 'Kelas / Mutabaah',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    color: 'from-blue-500 to-blue-600',
  },
  {
    href: '/guru/wafa',
    label: 'Wafa',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    color: 'from-amber-500 to-amber-600',
  },
  {
    href: '/guru/tahfiz',
    label: 'Tahfizh',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
    color: 'from-emerald-500 to-emerald-600',
  },
]

export function GuruDashboardClient({
  nama,
  stats,
}: {
  nama:   string
  stats:  Stats
}) {
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700 rounded-2xl p-5 text-white relative overflow-hidden">
        <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full" />
        <div className="absolute -right-2 -bottom-8 w-24 h-24 bg-white/5 rounded-full" />
        <div className="relative z-10">
          <p className="text-primary-100 text-xs font-medium uppercase tracking-wide">
            {stats.tahunAktif !== 'Belum ada' ? `Tahun Ajaran ${stats.tahunAktif}` : 'Dashboard Guru'}
          </p>
          <h1 className="text-2xl font-bold mt-1">Halo, {nama.split(' ')[0]}!</h1>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white relative overflow-hidden">
          <div className="absolute -right-3 -bottom-3 w-16 h-16 bg-white/10 rounded-full" />
          <p className="text-3xl font-bold relative z-10">{stats.totalSiswa}</p>
          <p className="text-blue-100 text-xs mt-0.5 relative z-10">Siswa</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white relative overflow-hidden">
          <div className="absolute -right-3 -bottom-3 w-16 h-16 bg-white/10 rounded-full" />
          <p className="text-3xl font-bold relative z-10">{stats.totalKelas}</p>
          <p className="text-purple-100 text-xs mt-0.5 relative z-10">Kelas</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white relative overflow-hidden">
          <div className="absolute -right-3 -bottom-3 w-16 h-16 bg-white/10 rounded-full" />
          <p className="text-3xl font-bold relative z-10">{stats.mutabaahToday}</p>
          <p className="text-green-100 text-xs mt-0.5 relative z-10">Mutabaah Hari Ini</p>
        </div>
      </div>

      {/* Menu cards */}
      <div>
        <h2 className="text-sm font-semibold text-neutral-500 mb-3">Menu</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {MENU_CARDS.map(card => (
            <Link
              key={card.href}
              href={card.href}
              className={`bg-gradient-to-br ${card.color} rounded-xl p-6 text-white text-center hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]`}
            >
              <div className="flex justify-center mb-3 opacity-90">{card.icon}</div>
              <p className="font-bold text-sm">{card.label}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
