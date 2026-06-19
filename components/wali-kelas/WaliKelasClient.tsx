// ============================================================
// app/(staff)/wali-kelas/WaliKelasClient.tsx
// Dashboard Wali Kelas — status fill rate kelas hari ini
// ============================================================

'use client'

import { useQuery }       from '@tanstack/react-query'
import { useRouter }      from 'next/navigation'
import { getTodayWIB, formatTanggal } from '@/lib/utils/date'
import { SkeletonDashboard } from '@/components/ui/Skeleton'
import { cn }             from '@/lib/utils/cn'

interface SiswaStatus {
  siswaId:      string
  namaLengkap:  string
  photoUrl:     string | null
  namaKelas:    string
  fillStatus:   'lengkap' | 'sebagian' | 'belum'
  percentage:   number
  checkedCount: number
  totalItems:   number
}

interface KelasStats {
  totalSiswa:    number
  sudahLengkap:  number
  sudahSebagian: number
  belumIsi:      number
  avgPercentage: number
  tanggal:       string
  namaKelas:     string
}

const STATUS_CONFIG = {
  lengkap:  { label: 'Lengkap',  color: 'text-success', bg: 'bg-green-50',  border: 'border-green-200', icon: '✅' },
  sebagian: { label: 'Sebagian', color: 'text-warning',  bg: 'bg-amber-50', border: 'border-amber-200',  icon: '⚠️' },
  belum:    { label: 'Belum',    color: 'text-danger',   bg: 'bg-red-50',   border: 'border-red-200',    icon: '❌' },
}

export function WaliKelasClient({ namaGuru, detailPath = '/wali-kelas' }: { namaGuru: string; detailPath?: string }) {
  const router  = useRouter()
  const tanggal = getTodayWIB()

  const { data, isLoading, isError, refetch } = useQuery<{
    siswaList: SiswaStatus[]
    stats: KelasStats | null
  }>({
    queryKey: ['wali-kelas', tanggal],
    queryFn:  async () => {
      const res = await fetch(`/api/staff/wali-kelas?tanggal=${tanggal}`)
      if (!res.ok) throw new Error('Gagal memuat data')
      return res.json()
    },
    staleTime:        60 * 1000,
    refetchInterval:  5 * 60 * 1000, // auto refresh tiap 5 menit
  })

  if (isLoading) return <SkeletonDashboard />

  if (isError) {
    return (
      <div className="p-4">
        <div className="card text-center py-10">
          <p className="text-danger font-semibold">Gagal memuat data</p>
          <button onClick={() => refetch()} className="mt-3 text-sm text-primary-500 underline">
            Coba lagi
          </button>
        </div>
      </div>
    )
  }

  const { siswaList = [], stats } = data ?? {}

  if (!stats) {
    return (
      <div className="p-4">
        <div className="card text-center py-10">
          <p className="text-4xl mb-3">🏫</p>
          <p className="text-sm font-semibold text-neutral-600">Belum ada kelas yang ditugaskan</p>
          <p className="text-xs text-neutral-400 mt-1">Hubungi admin untuk penugasan kelas</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
      {/* Greeting */}
      <div className="animate-in">
        <p className="text-xs text-neutral-400">{formatTanggal(tanggal)}</p>
        <h2 className="text-lg font-bold text-neutral-800 mt-0.5">
          Kelas {stats.namaKelas}
        </h2>
      </div>

      {/* Stats card utama */}
      <section className="card animate-in" style={{ animationDelay: '0.05s' }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-neutral-800">Mutabaah Hari Ini</h3>
          <span className={cn(
            'text-sm font-bold px-2.5 py-1 rounded-full',
            stats.avgPercentage >= 80 ? 'bg-green-100 text-success' :
            stats.avgPercentage >= 50 ? 'bg-amber-100 text-warning' : 'bg-red-100 text-danger'
          )}>
            {stats.avgPercentage}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2.5 bg-neutral-100 rounded-full overflow-hidden mb-4">
          <div
            className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-primary-500 to-primary-400"
            style={{ width: `${stats.avgPercentage}%` }}
          />
        </div>

        {/* Stat grid */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            value={stats.sudahLengkap}
            label="Lengkap"
            color="text-success"
            bg="bg-green-50"
          />
          <StatCard
            value={stats.sudahSebagian}
            label="Sebagian"
            color="text-warning"
            bg="bg-amber-50"
          />
          <StatCard
            value={stats.belumIsi}
            label="Belum Isi"
            color="text-danger"
            bg="bg-red-50"
          />
        </div>

        <p className="text-xs text-neutral-400 mt-3 text-center">
          {stats.totalSiswa} total siswa
        </p>
      </section>

      {/* Filter pills */}
      <FilterTabs siswaList={siswaList} />

      {/* Daftar siswa */}
      <SiswaStatusList siswaList={siswaList} onTapSiswa={(id) => router.push(`${detailPath}/${id}`)} />
    </div>
  )
}

// -----------------------------------------------------------
// Filter tabs: Semua / Lengkap / Sebagian / Belum
// -----------------------------------------------------------
function FilterTabs({ siswaList }: { siswaList: SiswaStatus[] }) {
  // State dikelola di parent tapi ini contoh sederhana
  return null // Akan dikembangkan — sekarang tampil semua
}

// -----------------------------------------------------------
// List siswa dengan status
// -----------------------------------------------------------
function SiswaStatusList({
  siswaList,
  onTapSiswa,
}: {
  siswaList:  SiswaStatus[]
  onTapSiswa: (id: string) => void
}) {
  if (siswaList.length === 0) {
    return (
      <div className="card text-center py-8">
        <p className="text-neutral-500 text-sm">Tidak ada siswa</p>
      </div>
    )
  }

  // Sort: belum → sebagian → lengkap
  const sorted = [...siswaList].sort((a, b) => {
    const order = { belum: 0, sebagian: 1, lengkap: 2 }
    return order[a.fillStatus] - order[b.fillStatus]
  })

  return (
    <div className="space-y-2">
      {sorted.map((siswa, i) => {
        const cfg = STATUS_CONFIG[siswa.fillStatus]
        return (
          <button
            key={siswa.siswaId}
            onClick={() => onTapSiswa(siswa.siswaId)}
            className={cn(
              'w-full flex items-center gap-3 p-3.5 rounded-lg border text-left',
              'hover:shadow-md active:scale-[0.98] transition-all animate-in',
              'bg-white',
              cfg.border
            )}
            style={{ animationDelay: `${i * 0.025}s` }}
          >
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {siswa.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={siswa.photoUrl} alt={siswa.namaLengkap} className="w-full h-full object-cover" />
              ) : (
                <span className="text-neutral-500 font-bold text-sm">
                  {siswa.namaLengkap.charAt(0)}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-neutral-800 truncate">{siswa.namaLengkap}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {/* Mini progress bar */}
                <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden max-w-24">
                  <div
                    className={cn('h-full rounded-full', cfg.color.replace('text-', 'bg-'))}
                    style={{ width: `${siswa.percentage}%` }}
                  />
                </div>
                <span className={cn('text-xs font-semibold tabular-nums', cfg.color)}>
                  {siswa.percentage}%
                </span>
              </div>
            </div>

            {/* Status icon */}
            <span className="text-lg flex-shrink-0">{cfg.icon}</span>

            {/* Arrow */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        )
      })}
    </div>
  )
}

function StatCard({
  value, label, color, bg
}: {
  value: number; label: string; color: string; bg: string
}) {
  return (
    <div className={cn('rounded-lg px-2 py-2.5 text-center', bg)}>
      <p className={cn('text-2xl font-bold', color)}>{value}</p>
      <p className="text-[10px] text-neutral-500 leading-tight mt-0.5">{label}</p>
    </div>
  )
}
