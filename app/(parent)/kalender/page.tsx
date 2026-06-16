// ============================================================
// app/(parent)/kalender/page.tsx
// Halaman kalender bulanan — heatmap lengkap
// ============================================================

import { MonthlyHeatmap } from '@/components/mutabaah/MonthlyHeatmap'

export default function KalenderPage() {
  return (
    <div className="px-4 py-4 max-w-lg mx-auto">
      <div className="mb-4 animate-in">
        <h2 className="text-lg font-bold text-neutral-800">Kalender Ibadah</h2>
        <p className="text-xs text-neutral-400 mt-0.5">
          Riwayat mutabaah bulanan
        </p>
      </div>

      <section className="card animate-in" style={{ animationDelay: '0.05s' }}>
        <MonthlyHeatmap />
      </section>

      {/* Keterangan */}
      <section className="card mt-4 animate-in" style={{ animationDelay: '0.1s' }}>
        <h3 className="text-sm font-bold text-neutral-700 mb-3">Keterangan</h3>
        <div className="space-y-2">
          {[
            { color: 'bg-success',     range: '≥ 80%',   desc: 'Sangat konsisten' },
            { color: 'bg-warning',     range: '50 – 79%', desc: 'Cukup konsisten' },
            { color: 'bg-danger',      range: '< 50%',   desc: 'Perlu ditingkatkan' },
            { color: 'bg-neutral-200', range: 'Kosong',   desc: 'Belum diisi' },
          ].map(({ color, range, desc }) => (
            <div key={range} className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded ${color} flex-shrink-0`} />
              <div>
                <span className="text-xs font-semibold text-neutral-700">{range}</span>
                <span className="text-xs text-neutral-400 ml-2">{desc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
