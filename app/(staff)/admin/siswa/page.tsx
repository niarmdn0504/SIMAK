// ============================================================
// app/(staff)/admin/siswa/page.tsx
// Kelola Siswa — list, tambah, edit, deactivate, import
// ============================================================

'use client'

import { useState, useEffect }  from 'react'
import { useSearchParams }      from 'next/navigation'
import { useToast }             from '@/components/ui/Toast'
import { ImportExcelModal }     from '@/components/admin/ImportExcelModal'
import { SiswaFormModal }       from '@/components/admin/SiswaFormModal'
import { cn }                   from '@/lib/utils/cn'

interface SiswaRow {
  id:           string
  nisn:         string
  nama_lengkap: string
  parent_name:  string | null
  parent_phone: string | null
  kelas:        string | null
  is_active:    boolean
}

export default function AdminSiswaPage() {
  const searchParams = useSearchParams()
  const [siswaList,   setSiswaList]   = useState<SiswaRow[]>([])
  const [isLoading,   setIsLoading]   = useState(true)
  const [search,      setSearch]      = useState('')
  const [showImport,  setShowImport]  = useState(searchParams.get('import') === '1')
  const [editSiswa,   setEditSiswa]   = useState<SiswaRow | null>(null)
  const [showAdd,     setShowAdd]     = useState(false)
  const [confirmDeact, setConfirmDeact] = useState<string | null>(null)
  const { showToast, ToastComponent } = useToast()

  async function fetchSiswa() {
    setIsLoading(true)
    const q = search ? `?search=${encodeURIComponent(search)}` : ''
    const res = await fetch(`/api/admin/siswa${q}`)
    const data = await res.json()
    setSiswaList(Array.isArray(data) ? data : [])
    setIsLoading(false)
  }

  useEffect(() => { fetchSiswa() }, [search])

  async function handleDeactivate(id: string) {
    const res = await fetch(`/api/admin/siswa/${id}`, { method: 'DELETE' })
    if (res.ok) {
      showToast('Siswa dinonaktifkan', 'success')
      setConfirmDeact(null)
      fetchSiswa()
    } else {
      showToast('Gagal menonaktifkan', 'error')
    }
  }

  const filtered = siswaList.filter(s =>
    s.nama_lengkap.toLowerCase().includes(search.toLowerCase()) ||
    s.nisn.includes(search)
  )

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-100 px-4 py-4 sticky top-14 z-30">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-neutral-800">Kelola Siswa</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowImport(true)}
              className="h-9 px-3 bg-teal-500 hover:bg-teal-600 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              📥 Import
            </button>
            <button
              onClick={() => setShowAdd(true)}
              className="h-9 px-3 bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              + Tambah
            </button>
          </div>
        </div>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari nama atau NISN..."
          className="w-full h-9 px-3 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
        />
      </div>

      {/* Stats */}
      <div className="px-4 py-2 flex items-center gap-3">
        <p className="text-xs text-neutral-400">{siswaList.filter(s => s.is_active).length} aktif · {siswaList.filter(s => !s.is_active).length} nonaktif</p>
      </div>

      {/* List */}
      <div className="px-4 pb-6 space-y-2">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-neutral-200 rounded-lg animate-skeleton" />
          ))
        ) : filtered.length === 0 ? (
          <div className="card text-center py-10">
            <p className="text-3xl mb-2">👤</p>
            <p className="text-sm text-neutral-500">Tidak ada siswa ditemukan</p>
          </div>
        ) : (
          filtered.map((siswa, i) => (
            <div key={siswa.id} className={cn('card animate-in', !siswa.is_active && 'opacity-60')} style={{ animationDelay: `${i * 0.02}s` }}>
              {confirmDeact === siswa.id ? (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-neutral-700">Nonaktifkan {siswa.nama_lengkap}?</p>
                  <p className="text-xs text-neutral-500">Data historis tetap tersimpan.</p>
                  <div className="flex gap-2">
                    <button onClick={() => setConfirmDeact(null)} className="flex-1 py-1.5 text-xs border border-neutral-200 rounded-md font-semibold">Batal</button>
                    <button onClick={() => handleDeactivate(siswa.id)} className="flex-1 py-1.5 text-xs bg-danger text-white rounded-md font-semibold">Nonaktifkan</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-700 font-bold text-sm">{siswa.nama_lengkap.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-neutral-800 truncate">{siswa.nama_lengkap}</p>
                      {!siswa.is_active && (
                        <span className="text-[10px] bg-neutral-200 text-neutral-500 px-1.5 py-0.5 rounded-full font-semibold">Nonaktif</span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400">{siswa.nisn} · {siswa.kelas ? `Kelas ${siswa.kelas}` : 'Belum ada kelas'}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditSiswa(siswa)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-primary-500 hover:bg-primary-50 transition-colors"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    {siswa.is_active && (
                      <button
                        onClick={() => setConfirmDeact(siswa.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-danger hover:bg-red-50 transition-colors"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      {showImport && (
        <ImportExcelModal
          onClose={() => setShowImport(false)}
          onSuccess={() => { setShowImport(false); fetchSiswa(); showToast('Import berhasil', 'success') }}
        />
      )}
      {(showAdd || editSiswa) && (
        <SiswaFormModal
          siswa={editSiswa}
          onClose={() => { setShowAdd(false); setEditSiswa(null) }}
          onSuccess={() => { setShowAdd(false); setEditSiswa(null); fetchSiswa(); showToast(editSiswa ? 'Data diperbarui' : 'Siswa ditambahkan', 'success') }}
        />
      )}
      {ToastComponent}
    </div>
  )
}
