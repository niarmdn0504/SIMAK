'use client'

import { useState, useEffect } from 'react'
import { useToast }            from '@/components/ui/Toast'

interface KelasItem {
  id: string
  nama_kelas: string
  tahun_ajaran: { id: string; nama: string }
  wali_kelas: { id: string; nama: string } | null
}

interface GuruItem {
  id: string
  nama: string
  role: string
}

export default function AssignGuruPage() {
  const [kelas,   setKelas]   = useState<KelasItem[]>([])
  const [guru,    setGuru]    = useState<GuruItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState<string | null>(null)
  const { showToast, ToastComponent } = useToast()

  async function fetchData() {
    setLoading(true)
    const res = await fetch('/api/admin/assign-guru')
    const data = await res.json()
    setKelas(data.kelas ?? [])
    setGuru(data.guru ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  async function handleAssign(kelasId: string, guruId: string) {
    setSaving(kelasId)
    const res = await fetch('/api/admin/assign-guru', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kelasId, guruId: guruId || null }),
    })
    if (res.ok) {
      showToast('Guru berhasil ditugaskan', 'success')
      fetchData()
    } else {
      showToast('Gagal menyimpan', 'error')
    }
    setSaving(null)
  }

  if (loading) return <div className="p-6 text-sm text-neutral-400">Memuat...</div>

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold text-neutral-800 mb-1">Assign Guru ke Kelas</h1>
      <p className="text-xs text-neutral-400 mb-6">Pilih guru untuk setiap kelas</p>

      <div className="space-y-2">
        {kelas.map(k => (
          <div key={k.id} className="card flex items-center gap-4 p-4">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-neutral-800">{k.nama_kelas}</p>
              <p className="text-[11px] text-neutral-400">{k.tahun_ajaran.nama}</p>
            </div>
            <select
              className="input text-sm max-w-48"
              value={k.wali_kelas?.id ?? ''}
              onChange={e => handleAssign(k.id, e.target.value)}
              disabled={saving === k.id}
            >
              <option value="">— Kosong —</option>
              {guru.map(g => (
                <option key={g.id} value={g.id}>{g.nama}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {kelas.length === 0 && (
        <div className="card text-center py-10">
          <p className="text-neutral-500 text-sm">Belum ada kelas</p>
        </div>
      )}

      {ToastComponent}
    </div>
  )
}
