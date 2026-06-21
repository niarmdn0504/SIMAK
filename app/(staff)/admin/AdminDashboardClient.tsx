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

interface ActivityItem {
  id: string
  time: string
  nama: string
}

interface KelasItem {
  id: string
  nama: string
  totalSiswaInKelas: number
  mutabaahTodayInKelas: number
}

export function AdminDashboardClient({
  stats,
  recentActivity,
  kelasList,
  kelasKosong,
  adminNama,
}: {
  stats: Stats
  recentActivity: { mutabaah: ActivityItem[]; tahfiz: ActivityItem[]; wafa: ActivityItem[] }
  kelasList: KelasItem[]
  kelasKosong: KelasItem[]
  adminNama: string
}) {
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
            color="from-green-500 to-green-600"
          />
          <StatCard
            value={stats.totalStaff}
            label="Guru"
            icon={<IconStaff />}
            color="from-amber-500 to-amber-600"
          />
        </div>
      </div>

      {/* Warning: Kelas Kosong */}
      {kelasKosong.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">
                {kelasKosong.length} Kelas Kosong
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                Kelas berikut belum punya siswa. Pertimbangkan untuk menghapus atau mengisi siswa.
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {kelasKosong.map(k => (
                  <Link
                    key={k.id}
                    href={`/admin/kelas?kelasId=${k.id}`}
                    className="text-xs font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 px-2 py-1 rounded transition-colors"
                  >
                    {k.nama}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

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
            <div className="w-full bg-neutral-100 rounded-full h-2">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((stats.tahfizHariIni / stats.totalSiswaAktif) * 100, 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-neutral-400 mt-1.5">{Math.round((stats.tahfizHariIni / stats.totalSiswaAktif) * 100)}% dari {stats.totalSiswaAktif} siswa</p>
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
            <div className="w-full bg-neutral-100 rounded-full h-2">
              <div
                className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((stats.wafaHariIni / stats.totalSiswaAktif) * 100, 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-neutral-400 mt-1.5">{Math.round((stats.wafaHariIni / stats.totalSiswaAktif) * 100)}% dari {stats.totalSiswaAktif} siswa</p>
          </div>
        </div>
      </div>

      {/* Akses Cepat */}
      <div>
        <h2 className="text-sm font-semibold text-neutral-500 mb-3">Akses Cepat</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickAction href="/admin/siswa"            label="Kelola Siswa"    color="bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 border-blue-200" icon={<IconUsers />} />
          <QuickAction href="/admin/staff"            label="Kelola Guru"     color="bg-gradient-to-br from-green-50 to-green-100 text-green-700 border-green-200" icon={<IconStaff />} />
          <QuickAction href="/admin/mutabaah-items"   label="Template Mutabaah"   color="bg-gradient-to-br from-amber-50 to-amber-100 text-amber-700 border-amber-200" icon={<IconCheck />} />
          <QuickAction href="/admin/tahun-ajaran"     label="Tahun Ajaran"    color="bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 border-blue-200" icon={<IconCalendar />} />
          <QuickAction href="/admin/assign-guru"      label="Penugasan Guru"  color="bg-gradient-to-br from-green-50 to-green-100 text-green-700 border-green-200" icon={<IconAssign />} />
          <QuickAction href="/admin/kenaikan-kelas"   label="Kenaikan Kelas"  color="bg-gradient-to-br from-amber-50 to-amber-100 text-amber-700 border-amber-200" icon={<IconTrendUp />} />
          <QuickAction href="/admin/export"           label="Export Data"     color="bg-gradient-to-br from-orange-50 to-orange-100 text-orange-700 border-orange-200" icon={<IconDownload />} />
          <QuickAction href="/admin/siswa?import=1"   label="Import Data"     color="bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 border-blue-200" icon={<IconUpload />} />
        </div>
      </div>

      {/* Aktivitas Terbaru */}
      <div>
        <h2 className="text-sm font-semibold text-neutral-500 mb-3">Aktivitas Terbaru</h2>
        <div className="bg-white rounded-xl shadow-card border border-neutral-100 divide-y divide-neutral-100">
          {recentActivity.mutabaah.length === 0 && recentActivity.tahfiz.length === 0 && recentActivity.wafa.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-xs text-neutral-400">Belum ada aktivitas hari ini</p>
            </div>
          ) : (
            [...recentActivity.mutabaah.map(a => ({ ...a, type: 'mutabaah' as const })),
             ...recentActivity.tahfiz.map(a => ({ ...a, type: 'tahfiz' as const })),
             ...recentActivity.wafa.map(a => ({ ...a, type: 'wafa' as const }))]
              .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
              .slice(0, 8)
              .map((a, i) => (
                <div key={`${a.type}-${a.id}`} className="flex items-center gap-3 px-4 py-3">
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                    a.type === 'mutabaah' ? 'bg-green-50' : a.type === 'tahfiz' ? 'bg-emerald-50' : 'bg-amber-50'
                  )}>
                    {a.type === 'mutabaah' ? <IconCheck className="text-green-600 w-4 h-4" /> :
                     a.type === 'tahfiz' ? <IconBook className="text-emerald-600 w-4 h-4" /> :
                     <IconStar className="text-amber-600 w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-neutral-800 truncate">
                      <span className="font-semibold">{a.nama}</span>
                      <span className="text-neutral-400 ml-1">
                        {a.type === 'mutabaah' ? 'mengisi mutabaah' : a.type === 'tahfiz' ? 'setor tahfizh' : 'update wafa'}
                      </span>
                    </p>
                  </div>
                  <span className="text-[11px] text-neutral-400 flex-shrink-0">
                    {new Date(a.time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
          )}
        </div>
      </div>

      {/* Ringkasan Per Kelas */}
      <div>
        <h2 className="text-sm font-semibold text-neutral-500 mb-3">Ringkasan Per Kelas</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {kelasList.map((k, i) => {
            const mutabaahKelasRate = k.totalSiswaInKelas > 0
              ? Math.round((k.mutabaahTodayInKelas / k.totalSiswaInKelas) * 100)
              : 0

            return (
              <Link
                key={k.id}
                href={`/admin/kelas?kelasId=${k.id}`}
                className={cn(
                  'bg-white rounded-xl p-4 shadow-card border border-neutral-100 hover:shadow-md transition-shadow animate-in',
                )}
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-700 font-bold text-sm">{k.nama.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-neutral-800">Kelas {k.nama}</p>
                    <p className="text-[11px] text-neutral-400">{k.totalSiswaInKelas} siswa</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-xs text-neutral-400 mb-1">Mutabaah Hari Ini</p>
                  <div className="w-full bg-neutral-100 rounded-full h-1.5">
                    <div
                      className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(mutabaahKelasRate, 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-1">{mutabaahKelasRate}% ({k.mutabaahTodayInKelas} dari {k.totalSiswaInKelas})</p>
                </div>
              </Link>
            )
          })}
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

import { IconUsers, IconStaff, IconKelas, IconCheck, IconCalendar, IconBook, IconStar, IconAssign, IconTrendUp, IconDownload, IconUpload } from '@/lib/icons'
