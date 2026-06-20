'use client'

import Link from 'next/link'

interface Stats {
  totalSiswa:   number
  totalKelas:   number
  tahunAktif:   string
  mutabaahToday: number
}

interface MenuCard {
  href:     string
  label:    string
  icon:     string
  color:    string
}

const MENU_CARDS: MenuCard[] = [
  {
    href: '/guru/kelas',
    label: 'Kelas / Mutabaah',
    icon: '🏫',
    color: 'from-blue-500 to-blue-600',
  },
  {
    href: '/guru/wafa',
    label: 'Wafa',
    icon: '📚',
    color: 'from-amber-500 to-amber-600',
  },
  {
    href: '/guru/tahfiz',
    label: 'Tahfizh',
    icon: '📖',
    color: 'from-green-500 to-green-600',
  },
  {
    href: '/guru/atur-mutabaah',
    label: 'Atur Item Mutabaah',
    icon: '⚙️',
    color: 'from-purple-500 to-purple-600',
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
        <h2 className="text-sm font-semibold text-neutral-600 mb-3">Menu</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {MENU_CARDS.map(card => (
            <Link
              key={card.href}
              href={card.href}
              className={`bg-gradient-to-br ${card.color} rounded-xl p-5 text-white text-center hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]`}
            >
              <span className="text-4xl block mb-2">{card.icon}</span>
              <p className="font-bold text-sm">{card.label}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
