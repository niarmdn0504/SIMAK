// ============================================================
// components/mutabaah/MonthlyHeatmap.tsx
// Heatmap kalender bulanan dengan warna berdasarkan % ibadah
// ============================================================

'use client'

import { useState }              from 'react'
import { useMonthlyMutabaah }    from '@/hooks/useMutabaah'
import { getNamaBulan }          from '@/lib/utils/date'
import { cn }                    from '@/lib/utils/cn'
import { Skeleton }              from '@/components/ui/Skeleton'
import type { MonthlyData }      from '@/lib/types/app'

const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

function getDayColor(percentage: number | null): string {
  if (percentage === null)  return 'bg-neutral-100'
  if (percentage === 0)     return 'bg-neutral-200'
  if (percentage >= 80)     return 'bg-success'
  if (percentage >= 50)     return 'bg-warning'
  return 'bg-danger'
}

function getTextColor(percentage: number | null): string {
  if (percentage === null || percentage === 0) return 'text-neutral-400'
  return 'text-white'
}

export function MonthlyHeatmap() {
  const today    = new Date()
  const [year,  setYear]  = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)

  const { data, isLoading } = useMonthlyMutabaah(year, month)

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    const now = new Date()
    if (year === now.getFullYear() && month === now.getMonth() + 1) return
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  // Hitung grid
  const firstDay = new Date(year, month - 1, 1).getDay() // 0=Sun
  const daysInMonth = new Date(year, month, 0).getDate()

  // Build calendar grid
  const cells: (MonthlyData | null)[] = [
    ...Array(firstDay).fill(null),
    ...(data ?? Array.from({ length: daysInMonth }, (_, i) => ({
      tanggal: `${year}-${String(month).padStart(2,'0')}-${String(i+1).padStart(2,'0')}`,
      percentage: null,
    }))),
  ]

  const isCurrentMonth =
    year === today.getFullYear() && month === today.getMonth() + 1
  const todayStr = today.toLocaleDateString('sv-SE', { timeZone: 'Asia/Jakarta' })

  // Legend
  const legendItems = [
    { color: 'bg-success',     label: '≥80%' },
    { color: 'bg-warning',     label: '50-79%' },
    { color: 'bg-danger',      label: '<50%' },
    { color: 'bg-neutral-200', label: 'Kosong' },
  ]

  return (
    <div>
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <h3 className="text-sm font-bold text-neutral-700">
          {getNamaBulan(month)} {year}
        </h3>

        <button
          onClick={nextMonth}
          disabled={isCurrentMonth}
          className={cn(
            'w-8 h-8 flex items-center justify-center rounded-full transition-colors',
            isCurrentMonth
              ? 'text-neutral-300 cursor-not-allowed'
              : 'hover:bg-neutral-100'
          )}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[10px] font-semibold text-neutral-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      {isLoading ? (
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, i) => {
            if (!cell) return <div key={`empty-${i}`} />

            const dayNum = parseInt(cell.tanggal.split('-')[2])
            const isToday = cell.tanggal === todayStr

            return (
              <div
                key={cell.tanggal}
                className={cn(
                  'aspect-square rounded flex items-center justify-center',
                  'text-[11px] font-semibold relative transition-all',
                  getDayColor(cell.percentage),
                  getTextColor(cell.percentage),
                  isToday && 'ring-2 ring-primary-500 ring-offset-1'
                )}
                title={cell.percentage !== null ? `${cell.percentage}%` : 'Belum ada data'}
              >
                {dayNum}
              </div>
            )
          })}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-3 mt-3 flex-wrap">
        {legendItems.map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1">
            <div className={cn('w-3 h-3 rounded-sm', color)} />
            <span className="text-[10px] text-neutral-500">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
