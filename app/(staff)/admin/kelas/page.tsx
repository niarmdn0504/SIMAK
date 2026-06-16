// ============================================================
// app/(staff)/admin/kelas/page.tsx
// Kelola Kelas — CRUD kelas per tahun ajaran
// ============================================================

'use client'

import { useState, useEffect } from 'react'
import { useToast }            from '@/components/ui/Toast'
import { cn }                  from '@/lib/utils/cn'

interface KelasRow {
  id:             string
  nama_kelas:     string
  tahun_ajaran_id: string
  tahun_ajaran:   { nama: string }
  wali_kelas:     { id: string; nama: string } | null
  jumlah_siswa:   number
}

interface TahunItem { id: string; nama: string; is_active: boolean }
interface StaffItem { id: string; nama: string; role: string }

export default function AdminKelasPage() {
  const [kelasList,   setKelasList]   = useState<KelasRow[]>([])
  const [tahunList,   setTahunList]   = useState<TahunItem[]>([])
  const [staffList,   setStaffList]   = useState<StaffItem[]>([])
  const [selectedTahun, setSelectedTahun] = useState('')
  const [showForm,    setShowForm]    = useState(false)
  const [editKelas,   setEditKelas]   = useState<KelasRow | null>(null)
  const [isLoading,   setIsLoading]   = useState(true)
  const [confirmDel,  setConfirmDel]  = useState<string | null>(null)
  const { showToast, ToastComponent } = useToast()

  // Form state
  const [formNama,    setFormNama]    = useState('')
  const [formTahun,   setFormTahun]   = useState('')
  const [formWali,    setFormWali]    = useState('')
  const [formLoading, setFormLoading] = useState(false)

  async function fetchData() {
    setIsLoading(true)
    const [kRes, tRes, sRes] = await Promise.all([
      fetch(`/api/admin/kelas${selectedTahun ? `?tahunId=${selectedTahun}` : ''}`),
      fetch('/api/admin/tahun-ajaran'),
      fetch('/api/admin/staff'),
    ])
    const [kData, tData, sData] = await Promise.all([kRes.json(), tRes.json(), sRes.json()])
    setKelasList(Array.isArray(kData) ? kData : [])
    setTahunList(Array.isArray(tData) ? tData : [])
    setStaffList(Array.isArray(sData) ? sData.filter((s: any) => s.is_active) : [])
    if (!selectedTahun && tData.length > 0) {
      const aktif = tData.find((t: any) => t.is_active)
      setSelectedTahun(aktif?.id ?? tData[0]?.id ?? '')
      setFormTahun(aktif?.id ?? tData[0]?.id ?? '')
    }
    setIsLoading(false)
  }

  useEffect(() => { fetchData() }, [selectedTahun])

  function openAddForm() {
    setEditKelas(null)
    setFormNama('')
    setFormWali('')
    setShowForm(true)
  }

  function openEditForm(kelas: KelasRow) {
    setEditKelas(kelas)
    setFormNama(kelas.nama_kelas)
    setFormTahun(kelas.tahun_ajaran_id)
    setFormWali(kelas.wali_kelas?.id ?? '')
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formNama.trim()) return
    setFormLoading(true)

    if (editKelas) {
      const res = await fetch(`/api/admin/kelas/${editKelas.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ namaKelas: formNama, waliKelasId: formWali || null }),
      })
      if (res.ok) { showToast('Kelas diperbarui', 'success'); setShowForm(false); fetchData() }
      else { const d = await res.json(); showToast(d.error ?? 'Gagal', 'error') }
    } else {
      const res = await fetch('/api/admin/kelas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ namaKelas: formNama, tahunAjaranId: formTahun, waliKelasId: formWali || null }),
      })
      if (res.ok) { showToast('Kelas ditambahkan', 'success'); setShowForm(false); fetchData() }
      else { const d = await res.json(); showToast(d.error ?? 'Gagal', 'error') }
    }
    setFormLoading(false)
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/admin/kelas/${id}`, { method: 'DELETE' })
    if (res.ok) { showToast('Kelas dihapus', 'success'); setConfirmDel(null); fetchData() }
    else { const d = await res.json(); showToast(d.error ?? 'Gagal menghapus', 'error') }
  }

  const waliKelasStaff = staffList.filter(s => ['wali_kelas', 'admin'].includes(s.role))

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-white border-b border-neutral-100 px-4 py-4 sticky top-14 z-30">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-neutral-800">Kelola Kelas</h2>
          <button onClick={openAddForm} className="h-9 px-3 bg-primary-500 text-white text-xs font-semibold rounded-lg">+ Tambah</button>
        </div>
        {/* Filter tahun */}
        <select
          value={selectedTahun}
          onChange={e => setSelectedTahun(e.target.value)}
          className="w-full h-9 px-3 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
        >
          {tahunList.map(t => (
            <option key={t.id} value={t.id}>{t.nama}{t.is_active ? ' (Aktif)' : ''}</option>
          ))}
        </select>
      </div>

      <div className="px-4 py-4 space-y-2">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-neutral-200 rounded-lg animate-skeleton" />)
        ) : kelasList.length === 0 ? (
          <div className="card text-center py-10">
            <p className="text-3xl mb-2">🏫</p>
            <p className="text-sm text-neutral-500">Belum ada kelas</p>
          </div>
        ) : (
          kelasList.map((kelas, i) => (
            <div key={kelas.id} className="card animate-in" style={{ animationDelay: `${i * 0.03}s` }}>
              {confirmDel === kelas.id ? (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-neutral-700">Hapus Kelas {kelas.nama_kelas}?</p>
                  <div className="flex gap-2">
                    <button onClick={() => setConfirmDel(null)} className="flex-1 py-1.5 text-xs border border-neutral-200 rounded-md font-semibold">Batal</button>
                    <button onClick={() => handleDelete(kelas.id)} className="flex-1 py-1.5 text-xs bg-danger text-white rounded-md font-semibold">Hapus</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-700 font-bold text-sm">{kelas.nama_kelas}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-neutral-800">Kelas {kelas.nama_kelas}</p>
                    <p className="text-xs text-neutral-400">
                      {kelas.jumlah_siswa} siswa · {kelas.wali_kelas?.nama ?? 'Belum ada wali kelas'}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEditForm(kelas)} className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-primary-500 hover:bg-primary-50">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button onClick={() => setConfirmDel(kelas.id)} className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-danger hover:bg-red-50">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/></svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-xl">
            <div className="flex items-center justify-between px-4 py-4 border-b border-neutral-100">
              <h3 className="font-bold text-neutral-800">{editKelas ? 'Edit Kelas' : 'Tambah Kelas'}</h3>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-500">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Nama Kelas <span className="text-danger">*</span></label>
                <input type="text" value={formNama} onChange={e => setFormNama(e.target.value)} placeholder="Contoh: 3A" className="w-full h-11 px-4 border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" required />
              </div>
              {!editKelas && (
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Tahun Ajaran <span className="text-danger">*</span></label>
                  <select value={formTahun} onChange={e => setFormTahun(e.target.value)} className="w-full h-11 px-3 border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" required>
                    <option value="">-- Pilih --</option>
                    {tahunList.map(t => <option key={t.id} value={t.id}>{t.nama}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Wali Kelas <span className="text-neutral-400 font-normal">(opsional)</span></label>
                <select value={formWali} onChange={e => setFormWali(e.target.value)} className="w-full h-11 px-3 border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-300">
                  <option value="">-- Belum ditentukan --</option>
                  {waliKelasStaff.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
                </select>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 h-11 border border-neutral-200 rounded-lg text-sm font-semibold text-neutral-600">Batal</button>
                <button type="submit" disabled={formLoading} className={cn('flex-1 h-11 rounded-lg text-sm font-semibold text-white', formLoading ? 'bg-neutral-300' : 'bg-primary-500 hover:bg-primary-600')}>
                  {formLoading ? 'Menyimpan...' : 'Simpan'}
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
