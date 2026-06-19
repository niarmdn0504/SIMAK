// ============================================================
// app/(parent)/dashboard/DashboardClient.tsx
// Dashboard interaktif orang tua — redesign
// ============================================================

'use client'

import { useQueryClient }       from '@tanstack/react-query'
import { useEffect, useState }  from 'react'
import { WeeklyChart, WeeklyChartSkeleton } from '@/components/mutabaah/WeeklyChart'
import { MonthlyHeatmap }       from '@/components/mutabaah/MonthlyHeatmap'
import { useTodayMutabaah, useWeeklyMutabaah, useToggleMutabaah } from '@/hooks/useMutabaah'
import { cn }                   from '@/lib/utils/cn'
import type { MutabaahDayData, MutabaahItemWithStatus } from '@/lib/types/app'
import type { TahfizLog, WafaLog } from '@/lib/types/database'

interface DashboardClientProps {
  siswaName:        string
  namaKelas:        string
  tanggalLabel:     string
  initialMutabaah:  MutabaahDayData
  tahfizLast:       Pick<TahfizLog, 'surah' | 'ayat_awal' | 'ayat_akhir' | 'status' | 'tanggal'> | null
  wafaLast:         Pick<WafaLog, 'jilid' | 'halaman' | 'status' | 'tanggal'> | null
}

export function DashboardClient({
  siswaName,
  namaKelas,
  tanggalLabel,
  initialMutabaah,
  tahfizLast,
  wafaLast,
}: DashboardClientProps) {
  const queryClient = useQueryClient()

  useEffect(() => {
    queryClient.setQueryData(
      ['mutabaah', 'today', initialMutabaah.tanggal],
      initialMutabaah
    )
  }, [queryClient, initialMutabaah])

  const { data: todayData } = useTodayMutabaah(initialMutabaah.tanggal)
  const { data: weeklyData, isLoading: weeklyLoading } = useWeeklyMutabaah()

  const mutabaah = todayData ?? initialMutabaah

  return (
    <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">

      {/* ========== IDENTITAS ANAK ========== */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-5 text-white animate-in">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">👦</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-2xl font-bold truncate">{siswaName}</p>
            {namaKelas && (
              <p className="text-primary-100 text-sm mt-0.5">Kelas {namaKelas}</p>
            )}
          </div>
        </div>
      </div>

      {/* ========== CARD: Mutabaah Hari Ini ========== */}
      <section
        className="card animate-in"
        style={{ animationDelay: '0.05s' }}
      >
        <h3 className="font-bold text-neutral-800 mb-3">Mutabaah Hari Ini</h3>

        {mutabaah.items.length === 0 ? (
          <EmptyMutabaah />
        ) : (
          <MutabaahHarian items={mutabaah.items} percentage={mutabaah.percentage} isLocked={mutabaah.is_locked} tanggal={mutabaah.tanggal} />
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
// MutabaahHarian — Card progres dengan expand/collapse sub-item
// -----------------------------------------------------------
function MutabaahHarian({
  items,
  percentage,
  isLocked,
  tanggal,
}: {
  items:      MutabaahItemWithStatus[]
  percentage: number
  isLocked:   boolean
  tanggal:    string
}) {
  const { mutate: toggle } = useToggleMutabaah()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)

  // Hitung total dan checked (termasuk children)
  const allItems = items.flatMap(p => [p, ...(p.children ?? [])])
  const totalItems   = allItems.length
  const checkedItems = allItems.filter(i => i.is_checked).length
  const isAllDone    = totalItems > 0 && checkedItems === totalItems

  function handleToggle(item: MutabaahItemWithStatus) {
    if (isLocked) return
    setSavingId(item.id)
    toggle(
      { itemId: item.id, tanggal, isChecked: !item.is_checked },
      {
        onSettled: () => setSavingId(null),
      }
    )
  }

  return (
    <>
      {/* Progress summary */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-neutral-600">
            {checkedItems} dari {totalItems} terlaksana
          </span>
          <span className={cn(
            'text-sm font-bold tabular-nums',
            percentage >= 80 ? 'text-success' :
            percentage >= 50 ? 'text-warning' : 'text-danger'
          )}>
            {percentage}%
          </span>
        </div>
        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              percentage >= 80 ? 'bg-success' :
              percentage >= 50 ? 'bg-warning' : 'bg-danger'
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Locked banner */}
      {isLocked && (
        <div className="mb-3 flex items-center gap-2 py-2 px-3 bg-neutral-100 rounded-md">
          <span className="text-neutral-400 text-sm">🔒</span>
          <p className="text-xs text-neutral-500">
            Mutabaah sudah terkunci. Data hari ini tidak dapat diubah.
          </p>
        </div>
      )}

      {/* Items */}
      <div className="space-y-2">
        {items.map((item, index) => {
          const hasChildren = item.children && item.children.length > 0
          const isExpanded  = expandedId === item.id

          if (hasChildren) {
            return (
              <ParentItem
                key={item.id}
                item={item}
                isExpanded={isExpanded}
                isLocked={isLocked}
                savingId={savingId}
                onToggle={handleToggle}
                onExpand={() => setExpandedId(isExpanded ? null : item.id)}
                index={index}
              />
            )
          }

          return (
            <FlatItem
              key={item.id}
              item={item}
              isLocked={isLocked}
              isSaving={savingId === item.id}
              onToggle={() => handleToggle(item)}
              index={index}
            />
          )
        })}
      </div>

      {/* Motivation message */}
      <div className={cn(
        'mt-4 py-3 px-4 rounded-xl text-center text-sm font-medium',
        isAllDone
          ? 'bg-green-50 text-green-700 border border-green-200'
          : 'bg-amber-50 text-amber-700 border border-amber-200'
      )}>
        {isAllDone ? (
          <span>MasyaAllah 🌟 Semua ibadah hari ini telah terlaksana.</span>
        ) : (
          <span>Ayo semangat 💪 Masih ada ibadah yang belum tercatat.</span>
        )}
      </div>
    </>
  )
}

// -----------------------------------------------------------
// ParentItem — Item induk yang bisa di-expand
// -----------------------------------------------------------
function ParentItem({
  item,
  isExpanded,
  isLocked,
  savingId,
  onToggle,
  onExpand,
  index,
}: {
  item:         MutabaahItemWithStatus
  isExpanded:   boolean
  isLocked:     boolean
  savingId:     string | null
  onToggle:     (item: MutabaahItemWithStatus) => void
  onExpand:     () => void
  index:        number
}) {
  const children = item.children ?? []
  const checkedCount = children.filter(c => c.is_checked).length
  const totalCount   = children.length
  const allDone      = totalCount > 0 && checkedCount === totalCount

  return (
    <div
      className={cn(
        'rounded-lg border transition-all animate-in',
        allDone
          ? 'bg-primary-50 border-primary-200'
          : 'bg-white border-neutral-200'
      )}
      style={{ animationDelay: `${index * 0.03}s` }}
    >
      {/* Parent header — tap to expand */}
      <button
        onClick={onExpand}
        className="w-full flex items-center gap-3 p-3.5 text-left"
      >
        {/* Status icon */}
        <div className={cn(
          'w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-sm',
          allDone ? 'bg-primary-500 text-white' : 'bg-neutral-200 text-neutral-500'
        )}>
          {allDone ? '✓' : checkedCount}
        </div>

        {/* Name + count */}
        <div className="flex-1 min-w-0">
          <p className={cn(
            'text-sm font-semibold',
            allDone ? 'text-primary-700' : 'text-neutral-800'
          )}>
            {item.nama_item}
          </p>
          <p className="text-xs text-neutral-400 mt-0.5">
            {checkedCount} dari {totalCount} terlaksana
          </p>
        </div>

        {/* Expand arrow */}
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          className={cn(
            'text-neutral-400 transition-transform',
            isExpanded && 'rotate-180'
          )}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* Children — expanded */}
      {isExpanded && (
        <div className="px-3.5 pb-3 space-y-1.5 border-t border-neutral-100">
          {children.map(child => (
            <button
              key={child.id}
              onClick={() => !isLocked && onToggle(child)}
              disabled={isLocked || savingId === child.id}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left',
                'active:scale-[0.98]',
                child.is_checked
                  ? 'bg-primary-50 border-primary-200'
                  : 'bg-white border-neutral-200',
                isLocked && 'opacity-70 cursor-default'
              )}
            >
              {/* Checkbox */}
              <div className={cn(
                'w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all',
                child.is_checked
                  ? 'bg-primary-500 border-primary-500'
                  : 'border-neutral-300 bg-white',
                savingId === child.id && 'opacity-50'
              )}>
                {savingId === child.id ? (
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : child.is_checked ? (
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                    <path d="M2.5 7L5.5 10L11.5 4" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span className="text-xs text-neutral-400 font-medium">✗</span>
                )}
              </div>

              {/* Label */}
              <span className={cn(
                'text-sm font-medium flex-1',
                child.is_checked ? 'text-primary-700' : 'text-neutral-600'
              )}>
                {child.nama_item}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// -----------------------------------------------------------
// FlatItem — Item tanpa sub-item
// -----------------------------------------------------------
function FlatItem({
  item,
  isLocked,
  isSaving,
  onToggle,
  index,
}: {
  item:     MutabaahItemWithStatus
  isLocked: boolean
  isSaving: boolean
  onToggle: () => void
  index:    number
}) {
  return (
    <button
      onClick={onToggle}
      disabled={isLocked || isSaving}
      className={cn(
        'w-full flex items-center gap-3 p-3.5 rounded-lg border transition-all text-left',
        'active:scale-[0.98] animate-in',
        item.is_checked
          ? 'bg-primary-50 border-primary-200'
          : 'bg-white border-neutral-200',
        isLocked && 'opacity-70 cursor-default'
      )}
      style={{ animationDelay: `${index * 0.03}s` }}
    >
      <div className={cn(
        'w-7 h-7 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all',
        item.is_checked
          ? 'bg-primary-500 border-primary-500'
          : 'border-neutral-300 bg-white',
        isSaving && 'opacity-50'
      )}>
        {isSaving ? (
          <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : item.is_checked ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2.5 7L5.5 10L11.5 4" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : null}
      </div>

      <span className={cn(
        'text-sm font-medium flex-1',
        item.is_checked ? 'text-primary-700' : 'text-neutral-700'
      )}>
        {item.nama_item}
      </span>

      {item.is_checked && (
        <span className="text-xs text-primary-500 font-semibold bg-primary-100 px-2 py-0.5 rounded-full">
          ✓
        </span>
      )}
    </button>
  )
}

// -----------------------------------------------------------
// Sub-components
// -----------------------------------------------------------

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
