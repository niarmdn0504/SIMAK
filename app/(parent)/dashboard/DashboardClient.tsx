// ============================================================
// app/(parent)/dashboard/DashboardClient.tsx
// Dashboard interaktif orang tua
// ============================================================

'use client'

import { useQueryClient }       from '@tanstack/react-query'
import { useEffect, Suspense }  from 'react'
import { MutabaahChecklist }    from '@/components/mutabaah/MutabaahChecklist'
import { WeeklyChart, WeeklyChartSkeleton } from '@/components/mutabaah/WeeklyChart'
import { MonthlyHeatmap }       from '@/components/mutabaah/MonthlyHeatmap'
import { useTodayMutabaah, useWeeklyMutabaah } from '@/hooks/useMutabaah'
import { cn }                   from '@/lib/utils/cn'
import type { MutabaahDayData } from '@/lib/types/app'
import type { TahfizLog, WafaLog } from '@/lib/types/database'

interface DashboardClientProps {
  siswaName:        string
  tanggalLabel:     string
  initialMutabaah:  MutabaahDayData
  tahfizLast:       Pick<TahfizLog, 'surah' | 'ayat_awal' | 'ayat_akhir' | 'status' | 'tanggal'> | null
  wafaLast:         Pick<WafaLog, 'jilid' | 'halaman' | 'status' | 'tanggal'> | null
}

export function DashboardClient({
  siswaName,
  tanggalLabel,
  initialMutabaah,
  tahfizLast,
  wafaLast,
}: DashboardClientProps) {
  const queryClient = useQueryClient()

  // Pre-populate TanStack Query cache dengan data dari server
  useEffect(() => {
    queryClient.setQueryData(
      ['mutabaah', 'today', initialMutabaah.tanggal],
      initialMutabaah
    )
  }, [queryClient, initialMutabaah])

  // Ambil data real-time dari cache / refetch
  const { data: todayData } = useTodayMutabaah(initialMutabaah.tanggal)
  const { data: weeklyData, isLoading: weeklyLoading } = useWeeklyMutabaah()

  const mutabaah = todayData ?? initialMutabaah

  return (
    <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">

      {/* Greeting */}
      <div className="animate-in">
        <p className="text-xs text-neutral-400 font-medium">{tanggalLabel}</p>
        <h2 className="text-lg font-bold text-neutral-800 mt-0.5">
          Assalamu&apos;alaikum 👋
        </h2>
      </div>

      {/* ========== CARD: Mutabaah Hari Ini ========== */}
      <section
        className="card animate-in"
        style={{ animationDelay: '0.05s' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-neutral-800">Mutabaah Hari Ini</h3>
          <PercentageBadge percentage={mutabaah.percentage} />
        </div>

        {mutabaah.items.length === 0 ? (
          <EmptyMutabaah />
        ) : (
          <MutabaahChecklist
            items={mutabaah.items}
            tanggal={mutabaah.tanggal}
            percentage={mutabaah.percentage}
            isLocked={mutabaah.is_locked}
          />
        )}
      </section>

      {/* ========== CARD: Konsistensi 7 Hari ========== */}
      <section
        className="card animate-in"
        style={{ animationDelay: '0.1s' }}
      >
        <h3 className="font-bold text-neutral-800 mb-3">
          📊 Konsistensi 7 Hari
        </h3>
        {weeklyLoading ? (
          <WeeklyChartSkeleton />
        ) : weeklyData ? (
          <WeeklyChart data={weeklyData} />
        ) : null}
      </section>

      {/* ========== CARD: Kalender Bulan Ini ========== */}
      <section
        className="card animate-in"
        style={{ animationDelay: '0.15s' }}
      >
        <h3 className="font-bold text-neutral-800 mb-3">
          📅 Kalender Ibadah
        </h3>
        <MonthlyHeatmap />
      </section>

      {/* ========== CARD: Tahfiz Terakhir ========== */}
      <section
        className="card animate-in"
        style={{ animationDelay: '0.2s' }}
      >
        <h3 className="font-bold text-neutral-800 mb-3">📖 Tahfiz</h3>
        {tahfizLast ? (
          <TahfizSummary data={tahfizLast} />
        ) : (
          <EmptyCard text="Belum ada data tahfiz" />
        )}
      </section>

      {/* ========== CARD: Wafa Terakhir ========== */}
      <section
        className="card animate-in"
        style={{ animationDelay: '0.25s' }}
      >
        <h3 className="font-bold text-neutral-800 mb-3">📚 Wafa</h3>
        {wafaLast ? (
          <WafaSummary data={wafaLast} />
        ) : (
          <EmptyCard text="Belum ada data wafa" />
        )}
      </section>

      {/* Bottom spacer */}
      <div className="h-2" />
    </div>
  )
}

// -----------------------------------------------------------
// Sub-components
// -----------------------------------------------------------

function PercentageBadge({ percentage }: { percentage: number }) {
  const color =
    percentage >= 80 ? 'bg-green-100 text-success' :
    percentage >= 50 ? 'bg-amber-100 text-warning' :
    'bg-red-100 text-danger'

  return (
    <span className={cn('text-xs font-bold px-2.5 py-1 rounded-full tabular-nums', color)}>
      {percentage}%
    </span>
  )
}

const TAHFIZ_STATUS_LABEL: Record<string, string> = {
  setoran_baru: 'Setoran Baru',
  murajaah:     'Murajaah',
  lulus:        '✓ Lulus',
}

const TAHFIZ_STATUS_COLOR: Record<string, string> = {
  setoran_baru: 'bg-blue-100 text-blue-600',
  murajaah:     'bg-amber-100 text-amber-600',
  lulus:        'bg-green-100 text-success',
}

function TahfizSummary({
  data,
}: {
  data: Pick<TahfizLog, 'surah' | 'ayat_awal' | 'ayat_akhir' | 'status' | 'tanggal'>
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <div>
        <p className="font-semibold text-neutral-800 text-sm">{data.surah}</p>
        {data.ayat_awal && data.ayat_akhir && (
          <p className="text-xs text-neutral-500 mt-0.5">
            Ayat {data.ayat_awal}–{data.ayat_akhir}
          </p>
        )}
        <p className="text-xs text-neutral-400 mt-0.5">
          {new Date(data.tanggal).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long'
          })}
        </p>
      </div>
      <span className={cn(
        'text-xs font-semibold px-2.5 py-1 rounded-full',
        TAHFIZ_STATUS_COLOR[data.status] ?? 'bg-neutral-100 text-neutral-500'
      )}>
        {TAHFIZ_STATUS_LABEL[data.status] ?? data.status}
      </span>
    </div>
  )
}

const WAFA_STATUS_LABEL: Record<string, string> = {
  naik:      '↑ Naik',
  lanjut:    '→ Lanjut',
  mengulang: '↩ Mengulang',
}

const WAFA_STATUS_COLOR: Record<string, string> = {
  naik:      'bg-green-100 text-success',
  lanjut:    'bg-blue-100 text-blue-600',
  mengulang: 'bg-amber-100 text-amber-600',
}

function WafaSummary({
  data,
}: {
  data: Pick<WafaLog, 'jilid' | 'halaman' | 'status' | 'tanggal'>
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <div>
        <p className="font-semibold text-neutral-800 text-sm">{data.jilid}</p>
        {data.halaman && (
          <p className="text-xs text-neutral-500 mt-0.5">Halaman {data.halaman}</p>
        )}
        <p className="text-xs text-neutral-400 mt-0.5">
          {new Date(data.tanggal).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long'
          })}
        </p>
      </div>
      <span className={cn(
        'text-xs font-semibold px-2.5 py-1 rounded-full',
        WAFA_STATUS_COLOR[data.status] ?? 'bg-neutral-100 text-neutral-500'
      )}>
        {WAFA_STATUS_LABEL[data.status] ?? data.status}
      </span>
    </div>
  )
}

function EmptyCard({ text }: { text: string }) {
  return (
    <p className="text-sm text-neutral-400 text-center py-2">{text}</p>
  )
}

function EmptyMutabaah() {
  return (
    <div className="text-center py-6">
      <p className="text-4xl mb-2">📋</p>
      <p className="text-sm text-neutral-500 font-medium">
        Item mutabaah belum dikonfigurasi
      </p>
      <p className="text-xs text-neutral-400 mt-1">
        Hubungi admin sekolah untuk mengatur item ibadah
      </p>
    </div>
  )
}
