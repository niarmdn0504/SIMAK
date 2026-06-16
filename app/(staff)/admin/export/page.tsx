// ============================================================
// app/(staff)/admin/export/page.tsx
// Export data ke Excel
// ============================================================

'use client'

import { useState, useEffect } from 'react'
import { downloadFromUrl }     from '@/lib/utils/excel'
import { useToast }            from '@/components/ui/Toast'
import { cn }                  from '@/lib/utils/cn'
import { getTodayWIB }         from '@/lib/utils/date'

const EXPORT_TYPES = [
  { value: 'mutabaah', label: 'Mutabaah', icon: '✅', desc: 'Data ibadah harian per siswa' },
  { value: 'tahfiz',   label: 'Tahfiz',   icon: '📖', desc: 'Riwayat setoran hafalan' },
  { value: 'wafa',     label: 'Wafa',     icon: '📚', desc: 'Riwayat progres Wafa' },
]

interface TahunItem { id: string; nama: string; is_active: boolean }
interface KelasItem { id: string; nama_kelas: string }

export default function AdminExportPage() {
  const today = getTodayWIB()
  const firstDayOfMonth = today.slice(0, 8) + '01'

  const [type,        setType]        = useState('mutabaah')
  const [tahunId,     setTahunId]     = useState('')
  const [kelasId,     setKelasId]     = useState('')
  const [dateFrom,    setDateFrom]    = useState(firstDayOfMonth)
  const [dateTo,      setDateTo]      = useState(today)
  const [tahunList,   setTahunList]   = useState<TahunItem[]>([])
  const [kelasList,   setKelasList]   = useState<KelasItem[]>([])
  const [isLoading,   setIsLoading]   = useState(false)
  const { showToast, ToastComponent } = useToast()

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/tahun-ajaran').then(r => r.json()),
    ]).then(([tData]) => {
      setTahunList(Array.isArray(tData) ? tData : [])
      const aktif = tData.find((t: any) => t.is_active)
      if (aktif) setTahunId(aktif.id)
    })
  }, [])

  useEffect(() => {
    if (!tahunId) return
    fetch(`/api/admin/kelas?tahunId=${tahunId}`)
      .then(r => r.json())
      .then(data => setKelasList(Array.isArray(data) ? data : []))
  }, [tahunId])

  async function handleExport() {
    if (!tahunId) return
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ type, tahunId })
      if (kelasId)  params.set('kelasId', kelasId)
      if (dateFrom) params.set('dateFrom', dateFrom)
      if (dateTo)   params.set('dateTo', dateTo)

      const filename = `${type}_${dateFrom}_${dateTo}.xlsx`
      await downloadFromUrl(`/api/admin/export?${params}`, filename)
      showToast('File berhasil didownload', 'success')
    } catch {
      showToast('Gagal mengekspor data', 'error')
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-white border-b border-neutral-100 px-4 py-4 sticky top-14 z-30">
        <h2 className="text-lg font-bold text-neutral-800">Export Data</h2>
        <p className="text-xs text-neutral-400 mt-0.5">Download data ke file Excel (.xlsx)</p>
      </div>

      <div className="px-4 py-4 max-w-lg mx-auto space-y-4">

        {/* Pilih jenis data */}
        <section className="card">
          <h3 className="text-sm font-bold text-neutral-700 mb-3">Jenis Data</h3>
          <div className="space-y-2">
            {EXPORT_TYPES.map(t => (
              <button
                key={t.value}
                onClick={() => setType(t.value)}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left',
                  type === t.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-neutral-200 hover:border-neutral-300'
                )}
              >
                <span className="text-xl">{t.icon}</span>
                <div>
                  <p className={cn('text-sm font-semibold', type === t.value ? 'text-primary-700' : 'text-neutral-700')}>{t.label}</p>
                  <p className="text-xs text-neutral-400">{t.desc}</p>
                </div>
                {type === t.value && <span className="ml-auto text-primary-500 font-bold">✓</span>}
              </button>
            ))}
          </div>
        </section>

        {/* Filter */}
        <section className="card space-y-3">
          <h3 className="text-sm font-bold text-neutral-700">Filter</h3>

          {/* Tahun ajaran */}
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">Tahun Ajaran</label>
            <select value={tahunId} onChange={e => setTahunId(e.target.value)} className="w-full h-10 px-3 border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-300">
              {tahunList.map(t => <option key={t.id} value={t.id}>{t.nama}{t.is_active ? ' (Aktif)' : ''}</option>)}
            </select>
          </div>

          {/* Kelas */}
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">Kelas <span className="font-normal text-neutral-400">(opsional - kosong = semua kelas)</span></label>
            <select value={kelasId} onChange={e => setKelasId(e.target.value)} className="w-full h-10 px-3 border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-300">
              <option value="">Semua Kelas</option>
              {kelasList.map(k => <option key={k.id} value={k.id}>Kelas {k.nama_kelas}</option>)}
            </select>
          </div>

          {/* Rentang tanggal */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">Dari Tanggal</label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full h-10 px-3 border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">Sampai Tanggal</label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-full h-10 px-3 border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
            </div>
          </div>
        </section>

        {/* Tombol export */}
        <button
          onClick={handleExport}
          disabled={isLoading || !tahunId}
          className={cn(
            'w-full h-12 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all',
            isLoading || !tahunId ? 'bg-neutral-300' : 'bg-primary-500 hover:bg-primary-600 active:scale-[0.98] shadow-md'
          )}
        >
          {isLoading ? (
            <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Mengekspor...</>
          ) : (
            <>📤 Export ke Excel</>
          )}
        </button>
      </div>
      {ToastComponent}
    </div>
  )
}
