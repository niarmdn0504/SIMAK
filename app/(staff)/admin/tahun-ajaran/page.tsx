// ============================================================
// app/(staff)/admin/tahun-ajaran/page.tsx
// Kelola Tahun Ajaran
// ============================================================

'use client'

import { useState, useEffect } from 'react'
import { useToast }            from '@/components/ui/Toast'
import { cn }                  from '@/lib/utils/cn'

interface TahunRow {
  id:        string
  nama:      string
  is_active: boolean
}

export default function AdminTahunAjaranPage() {
  const [list,       setList]       = useState<TahunRow[]>([])
  const [isLoading,  setIsLoading]  = useState(true)
  const [showForm,   setShowForm]   = useState(false)
  const [formNama,   setFormNama]   = useState('')
  const [formLoad,   setFormLoad]   = useState(false)
  const [confirmAct, setConfirmAct] = useState<string | null>(null)
  const { showToast, ToastComponent } = useToast()

  async function fetchData() {
    setIsLoading(true)
    const res  = await fetch('/api/admin/tahun-ajaran')
    const data = await res.json()
    setList(Array.isArray(data) ? data : [])
    setIsLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!formNama.trim()) return
    setFormLoad(true)
    const res  = await fetch('/api/admin/tahun-ajaran', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nama: formNama }),
    })
    const data = await res.json()
    if (res.ok) { showToast('Tahun ajaran ditambahkan', 'success'); setShowForm(false); setFormNama(''); fetchData() }
    else showToast(data.error ?? 'Gagal', 'error')
    setFormLoad(false)
  }

  async function handleSetActive(id: string) {
    const res = await fetch(`/api/admin/tahun-ajaran/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ setActive: true }),
    })
    if (res.ok) { showToast('Tahun ajaran diaktifkan', 'success'); setConfirmAct(null); fetchData() }
    else showToast('Gagal mengaktifkan', 'error')
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-white border-b border-neutral-100 px-4 py-4 sticky top-14 md:top-0 z-30">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-800">Tahun Ajaran</h2>
          <button onClick={() => setShowForm(true)} className="h-9 px-3 bg-primary-500 text-white text-xs font-semibold rounded-lg">+ Tambah</button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        {/* Info */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs text-amber-700">
            <span className="font-semibold">Catatan:</span> Hanya satu tahun ajaran yang boleh aktif. Mengaktifkan tahun ajaran baru akan menonaktifkan yang lama.
          </p>
        </div>

        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-neutral-200 rounded-lg animate-skeleton" />)
        ) : list.length === 0 ? (
          <div className="bg-white rounded-xl shadow-card border border-neutral-100 text-center py-12">
            <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-neutral-600">Belum ada tahun ajaran</p>
            <p className="text-xs text-neutral-400 mt-1">Tambah tahun ajaran untuk memulai</p>
          </div>
        ) : (
          list.map((t, i) => (
            <div key={t.id} className={cn('card animate-in', t.is_active && 'border-2 border-primary-300 bg-primary-50')} style={{ animationDelay: `${i * 0.04}s` }}>
              {confirmAct === t.id ? (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-neutral-700">Aktifkan {t.nama} sebagai tahun ajaran aktif?</p>
                  <p className="text-xs text-neutral-500">Tahun ajaran sebelumnya akan dinonaktifkan.</p>
                  <div className="flex gap-2">
                    <button onClick={() => setConfirmAct(null)} className="flex-1 py-1.5 text-xs border border-neutral-200 rounded-md font-semibold">Batal</button>
                    <button onClick={() => handleSetActive(t.id)} className="flex-1 py-1.5 text-xs bg-primary-500 text-white rounded-md font-semibold">Ya, Aktifkan</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-neutral-800">{t.nama}</p>
                      {t.is_active && (
                        <span className="text-[10px] bg-primary-500 text-white px-2 py-0.5 rounded-full font-semibold">Aktif</span>
                      )}
                    </div>
                  </div>
                  {!t.is_active && (
                    <button
                      onClick={() => setConfirmAct(t.id)}
                      className="text-xs text-primary-600 font-semibold bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Aktifkan
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Form tambah */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-xl">
            <div className="flex items-center justify-between px-4 py-4 border-b border-neutral-100">
              <h3 className="font-bold text-neutral-800">Tambah Tahun Ajaran</h3>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-500">✕</button>
            </div>
            <form onSubmit={handleAdd} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Nama Tahun Ajaran <span className="text-danger">*</span></label>
                <input type="text" value={formNama} onChange={e => setFormNama(e.target.value)} placeholder="Contoh: 2025/2026" className="w-full h-11 px-4 border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" required />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 h-11 border border-neutral-200 rounded-lg text-sm font-semibold text-neutral-600">Batal</button>
                <button type="submit" disabled={formLoad} className={cn('flex-1 h-11 rounded-lg text-sm font-semibold text-white', formLoad ? 'bg-neutral-300' : 'bg-primary-500 hover:bg-primary-600')}>
                  {formLoad ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {ToastComponent}
    </div>
  )
}
