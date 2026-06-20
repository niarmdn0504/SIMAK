'use client'

import { useState, useEffect } from 'react'
import { useToast }            from '@/components/ui/Toast'

interface KelasItem {
  id: string
  nama_kelas: string
  tahun_ajaran_id: string
  wali_kelas_id: string | null
}

interface GuruItem {
  id: string
  nama: string
  role: string
}

interface TahunAjaranItem { id: string; nama: string }

interface KelasAssignment {
  kelasId:      string
  waliKelasId:  string
  guruWafaId:   string
  guruTahfizId: string
}

export default function AssignGuruPage() {
  const [kelas,     setKelas]     = useState<KelasItem[]>([])
  const [guru,      setGuru]      = useState<GuruItem[]>([])
  const [tahunAjaran, setTahunAjaran] = useState<TahunAjaranItem[]>([])
  const [assign, setAssign] = useState<Record<string, KelasAssignment>>({})
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const { showToast, ToastComponent } = useToast()

  async function fetchData() {
    setLoading(true)
    const res = await fetch('/api/admin/assign-guru')
    const data = await res.json()
    setKelas(data.kelas ?? [])
    setGuru(data.guru ?? [])
    setTahunAjaran(data.tahunAjaran ?? [])
    // Init assignments
    const init: Record<string, KelasAssignment> = {}
    for (const k of (data.kelas ?? [])) {
      init[k.id] = { kelasId: k.id, waliKelasId: k.wali_kelas_id ?? '', guruWafaId: '', guruTahfizId: '' }
    }
    setAssign(init)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  function update(kelasId: string, field: keyof KelasAssignment, value: string) {
    setAssign(prev => ({
      ...prev,
      [kelasId]: { ...prev[kelasId], [field]: value },
    }))
  }

  async function handleSave() {
    setSaving(true)
    const assignments = Object.values(assign).filter(a => a.waliKelasId || a.guruWafaId || a.guruTahfizId)
    if (assignments.length === 0) {
      showToast('Tidak ada perubahan', 'info')
      setSaving(false)
      return
    }

    const res = await fetch('/api/admin/assign-guru', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignments }),
    })

    if (res.ok) {
      const data = await res.json()
      if (data.kelas) setKelas(data.kelas)
      showToast('Guru berhasil ditugaskan', 'success')
      // Re-init
      const init: Record<string, KelasAssignment> = {}
      for (const k of (data.kelas ?? [])) {
        init[k.id] = { kelasId: k.id, waliKelasId: k.wali_kelas_id ?? '', guruWafaId: '', guruTahfizId: '' }
      }
      setAssign(init)
    } else {
      showToast('Gagal menyimpan', 'error')
    }
    setSaving(false)
  }

  if (loading) return <div className="p-6 text-sm text-neutral-400">Memuat...</div>

  const hasChanges = Object.values(assign).some(a => a.waliKelasId || a.guruWafaId || a.guruTahfizId)

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold text-neutral-800 mb-1">Assign Guru ke Kelas</h1>
      <p className="text-xs text-neutral-400 mb-6">Pilih guru untuk setiap peran di setiap kelas</p>

      <div className="space-y-3">
        {kelas.map(k => {
          const a = assign[k.id]
          if (!a) return null

          return (
            <div key={k.id} className="card p-4 space-y-3">
              <p className="font-bold text-sm text-neutral-800 border-b border-neutral-100 pb-2">
                Kelas {k.nama_kelas}
              </p>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Wali Kelas</label>
                  <select
                    className="input text-sm w-full"
                    value={a.waliKelasId}
                    onChange={e => update(k.id, 'waliKelasId', e.target.value)}
                  >
                    <option value="">— Kosong —</option>
                    {guru.map(g => <option key={g.id} value={g.id}>{g.nama}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Guru Wafa</label>
                  <select
                    className="input text-sm w-full"
                    value={a.guruWafaId}
                    onChange={e => update(k.id, 'guruWafaId', e.target.value)}
                  >
                    <option value="">— Kosong —</option>
                    {guru.map(g => <option key={g.id} value={g.id}>{g.nama}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Guru Tahfiz</label>
                  <select
                    className="input text-sm w-full"
                    value={a.guruTahfizId}
                    onChange={e => update(k.id, 'guruTahfizId', e.target.value)}
                  >
                    <option value="">— Kosong —</option>
                    {guru.map(g => <option key={g.id} value={g.id}>{g.nama}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {kelas.length === 0 && (
        <div className="card text-center py-10">
          <p className="text-neutral-500 text-sm">Belum ada kelas</p>
        </div>
      )}

      {hasChanges && (
        <div className="mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full h-12 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
          >
            {saving ? 'Menyimpan...' : 'Simpan Semua Perubahan'}
          </button>
        </div>
      )}

      {ToastComponent}
    </div>
  )
}
