// ============================================================
// app/(staff)/admin/mutabaah-items/page.tsx
// Kelola Item Mutabaah per tahun ajaran
// ============================================================

'use client'

import { useState, useEffect } from 'react'
import { useToast }            from '@/components/ui/Toast'
import { cn }                  from '@/lib/utils/cn'

interface ItemRow {
  id:              string
  nama_item:       string
  urutan:          number
  is_active:       boolean
  tahun_ajaran_id: string
  tahun_ajaran:    { nama: string }
}

interface TahunItem { id: string; nama: string; is_active: boolean }

export default function AdminMutabaahItemsPage() {
  const [items,       setItems]       = useState<ItemRow[]>([])
  const [tahunList,   setTahunList]   = useState<TahunItem[]>([])
  const [selectedTahun, setSelectedTahun] = useState('')
  const [isLoading,   setIsLoading]   = useState(true)
  const [showForm,    setShowForm]    = useState(false)
  const [formNama,    setFormNama]    = useState('')
  const [formLoad,    setFormLoad]    = useState(false)
  const { showToast, ToastComponent } = useToast()

  async function fetchData() {
    setIsLoading(true)
    const [iRes, tRes] = await Promise.all([
      fetch(`/api/admin/mutabaah-items${selectedTahun ? `?tahunId=${selectedTahun}` : ''}`),
      fetch('/api/admin/tahun-ajaran'),
    ])
    const [iData, tData] = await Promise.all([iRes.json(), tRes.json()])
    setItems(Array.isArray(iData) ? iData : [])
    setTahunList(Array.isArray(tData) ? tData : [])
    if (!selectedTahun && tData.length > 0) {
      const aktif = tData.find((t: any) => t.is_active)
      setSelectedTahun(aktif?.id ?? tData[0]?.id ?? '')
    }
    setIsLoading(false)
  }

  useEffect(() => { fetchData() }, [selectedTahun])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!formNama.trim() || !selectedTahun) return
    setFormLoad(true)
    const res  = await fetch('/api/admin/mutabaah-items', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ namaItem: formNama, tahunAjaranId: selectedTahun }),
    })
    const data = await res.json()
    if (res.ok) { showToast('Item ditambahkan', 'success'); setShowForm(false); setFormNama(''); fetchData() }
    else showToast(data.error ?? 'Gagal', 'error')
    setFormLoad(false)
  }

  async function handleToggle(item: ItemRow) {
    const res = await fetch(`/api/admin/mutabaah-items/${item.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !item.is_active }),
    })
    if (res.ok) { fetchData() }
    else showToast('Gagal mengubah status', 'error')
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/admin/mutabaah-items/${id}`, { method: 'DELETE' })
    if (res.ok) { showToast('Item dinonaktifkan', 'success'); fetchData() }
    else showToast('Gagal', 'error')
  }

  const activeItems   = items.filter(i => i.is_active)
  const inactiveItems = items.filter(i => !i.is_active)

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-white border-b border-neutral-100 px-4 py-4 sticky top-14 z-30">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-neutral-800">Item Mutabaah</h2>
          <button onClick={() => setShowForm(true)} className="h-9 px-3 bg-primary-500 text-white text-xs font-semibold rounded-lg">+ Tambah</button>
        </div>
        <select value={selectedTahun} onChange={e => setSelectedTahun(e.target.value)} className="w-full h-9 px-3 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-300">
          {tahunList.map(t => <option key={t.id} value={t.id}>{t.nama}{t.is_active ? ' (Aktif)' : ''}</option>)}
        </select>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Item aktif */}
        <div>
          <p className="text-xs font-semibold text-neutral-500 mb-2">AKTIF ({activeItems.length})</p>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-neutral-200 rounded-lg animate-skeleton mb-2" />)
          ) : activeItems.length === 0 ? (
            <div className="card text-center py-6">
              <p className="text-sm text-neutral-500">Belum ada item aktif</p>
            </div>
          ) : (
            <div className="space-y-2">
              {activeItems.map((item, i) => (
                <div key={item.id} className="card flex items-center gap-3 animate-in" style={{ animationDelay: `${i * 0.03}s` }}>
                  <span className="w-6 h-6 rounded-full bg-neutral-200 text-xs font-bold text-neutral-600 flex items-center justify-center flex-shrink-0">{item.urutan}</span>
                  <p className="flex-1 text-sm font-semibold text-neutral-800">{item.nama_item}</p>
                  <div className="flex gap-1">
                    <button onClick={() => handleToggle(item)} title="Nonaktifkan" className="w-7 h-7 flex items-center justify-center rounded text-amber-400 hover:bg-amber-50 text-xs font-bold">⊘</button>
                    <button onClick={() => handleDelete(item.id)} title="Hapus" className="w-7 h-7 flex items-center justify-center rounded text-neutral-300 hover:text-danger hover:bg-red-50">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Item nonaktif */}
        {inactiveItems.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-neutral-400 mb-2">NONAKTIF ({inactiveItems.length})</p>
            <div className="space-y-2">
              {inactiveItems.map(item => (
                <div key={item.id} className="card flex items-center gap-3 opacity-50">
                  <p className="flex-1 text-sm text-neutral-500 line-through">{item.nama_item}</p>
                  <button onClick={() => handleToggle(item)} className="text-xs text-primary-500 font-semibold">Aktifkan</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Form tambah */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-xl">
            <div className="flex items-center justify-between px-4 py-4 border-b border-neutral-100">
              <h3 className="font-bold text-neutral-800">Tambah Item Mutabaah</h3>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-500">✕</button>
            </div>
            <form onSubmit={handleAdd} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Nama Item <span className="text-danger">*</span></label>
                <input type="text" value={formNama} onChange={e => setFormNama(e.target.value)} placeholder="Contoh: Shalat Subuh" className="w-full h-11 px-4 border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" required />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 h-11 border border-neutral-200 rounded-lg text-sm font-semibold text-neutral-600">Batal</button>
                <button type="submit" disabled={formLoad} className={cn('flex-1 h-11 rounded-lg text-sm font-semibold text-white', formLoad ? 'bg-neutral-300' : 'bg-primary-500 hover:bg-primary-600')}>
                  {formLoad ? 'Menyimpan...' : 'Tambah'}
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
