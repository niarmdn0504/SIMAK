// ============================================================
// components/mutabaah/WeeklyChart.tsx
// Bar chart konsistensi 7 hari — Recharts
// ============================================================

'use client'

import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts'
import type { WeeklyData } from '@/lib/types/app'
import { cn }              from '@/lib/utils/cn'

interface WeeklyChartProps {
  data: WeeklyData[]
}

function getBarColor(pct: number) {
  if (pct >= 80) return '#27AE60'
  if (pct >= 50) return '#F39C12'
  return '#E74C3C'
}

// Tooltip custom
function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ value: number; payload: WeeklyData }>
  label?:   string
}) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white border border-neutral-200 rounded-lg px-3 py-2 shadow-card text-xs">
      <p className="font-semibold text-neutral-700">{label}</p>
      <p className="text-primary-600 font-bold">{d.percentage}%</p>
      <p className="text-neutral-400">{d.checked}/{d.total} ibadah</p>
    </div>
  )
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  const avg = data.length
    ? Math.round(data.reduce((s, d) => s + d.percentage, 0) / data.length)
    : 0

  return (
    <div>
      {/* Summary */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-neutral-500">Rata-rata minggu ini</p>
        <span className={cn(
          'text-sm font-bold',
          avg >= 80 ? 'text-success' : avg >= 50 ? 'text-warning' : 'text-danger'
        )}>
          {avg}%
        </span>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={100}>
        <BarChart data={data} barCategoryGap="20%" barGap={2}>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: '#9CA3AF' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide domain={[0, 100]} />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(45,122,79,0.06)', radius: 4 }}
          />
          <Bar dataKey="percentage" radius={[4, 4, 0, 0]} maxBarSize={32}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.percentage === 0 ? '#E5E7EB' : getBarColor(entry.percentage)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// Loading state
export function WeeklyChartSkeleton() {
  return (
    <div className="flex items-end gap-2 h-24 pt-4">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full bg-neutral-200 rounded-t animate-skeleton"
            style={{ height: `${Math.random() * 60 + 20}%` }}
          />
          <div className="w-5 h-2 bg-neutral-200 rounded animate-skeleton" />
        </div>
      ))}
    </div>
  )
}
