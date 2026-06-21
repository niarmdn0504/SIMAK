// ============================================================
// app/(staff)/admin/kenaikan-kelas/page.tsx
// Simulasi & Eksekusi Kenaikan Kelas — 3 langkah
// ============================================================

'use client'

import { useState, useEffect } from 'react'
import { useToast }            from '@/components/ui/Toast'
import { Breadcrumb }          from '@/components/ui/Breadcrumb'
import { cn }                  from '@/lib/utils/cn'

interface TahunItem  { id: string; nama: string; is_active: boolean }
interface KelasItem  { id: string; nama_kelas: string }
interface SiswaPreview {
  siswaId:      string
  nisn:         string
  namaLengkap:  string
  kelasAsal:    string
  sudahDiTujuan: boolean
}

type Step = 'pilih' | 'mapping' | 'preview' | 'done'

export default function AdminKenaikanKelasPage() {
  const [step,         setStep]         = useState<Step>('pilih')
  const [tahunList,    setTahunList]     = useState<TahunItem[]>([])
  const [tahunAsal,    setTahunAsal]     = useState('')
  const [tahunTujuan,  setTahunTujuan]   = useState('')
  const [preview,      setPreview]       = useState<SiswaPreview[]>([])
  const [kelasTujuan,  setKelasTujuan]   = useState<KelasItem[]>([])
  const [mapping,      setMapping]       = useState<Record<string, string>>({}) // siswaId → kelasIdTujuan
  const [isLoading,    setIsLoading]     = useState(false)
  const [result,       setResult]        = useState<{ inserted: number; skipped: number } | null>(null)
  const { showToast, ToastComponent }    = useToast()

  useEffect(() => {
    fetch('/api/admin/tahun-ajaran')
      .then(r => r.json())
      .then(data => {
        setTahunList(Array.isArray(data) ? data : [])
        const aktif = data.find((t: any) => t.is_active)
        if (aktif) setTahunAsal(aktif.id)
      })
  }, [])

  async function handlePreview() {
    if (!tahunAsal || !tahunTujuan) return
    setIsLoading(true)
    const res  = await fetch(`/api/admin/kenaikan-kelas?tahunAsal=${tahunAsal}&tahunTujuan=${tahunTujuan}`)
    const data = await res.json()
    if (!res.ok) { showToast(data.error ?? 'Gagal', 'error'); setIsLoading(false); return }

    setPreview(data.preview ?? [])
    setKelasTujuan(data.kelasTujuan ?? [])

    // Inisialisasi mapping: semua siswa belum dipetakan
    const initMap: Record<string, string> = {}
    for (const s of data.preview ?? []) {
      initMap[s.siswaId] = ''
    }
    setMapping(initMap)
    setStep('mapping')
    setIsLoading(false)
  }

  // Group siswa berdasarkan kelas asal untuk mapping lebih mudah
  const kelasByAsal = preview.reduce<Record<string, SiswaPreview[]>>((acc, s) => {
    if (!acc[s.kelasAsal]) acc[s.kelasAsal] = []
    acc[s.kelasAsal].push(s)
    return acc
  }, {})

  // Quick-map: petakan semua siswa satu kelas ke kelas tujuan
  function quickMap(kelasAsal: string, kelasTujuanId: string) {
    const updatedMapping = { ...mapping }
    for (const s of kelasByAsal[kelasAsal] ?? []) {
      if (!s.sudahDiTujuan) updatedMapping[s.siswaId] = kelasTujuanId
    }
    setMapping(updatedMapping)
  }

  const readySiswa = preview.filter(s => !s.sudahDiTujuan && mapping[s.siswaId])
  const allMapped  = preview.filter(s => !s.sudahDiTujuan).every(s => mapping[s.siswaId])

  async function handleExekusi() {
    if (!allMapped) return
    setIsLoading(true)

    const mappingList = Object.entries(mapping)
      .filter(([, kId]) => kId)
      .map(([siswaId, kelasIdTujuan]) => ({ siswaId, kelasIdTujuan }))

    const res  = await fetch('/api/admin/kenaikan-kelas', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ tahunTujuan, mapping: mappingList }),
    })
    const data = await res.json()

    if (res.ok) {
      setResult({ inserted: data.inserted, skipped: data.skipped ?? 0 })
      setStep('done')
    } else {
      showToast(data.error ?? 'Gagal', 'error')
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-white border-b border-neutral-100 px-4 py-4 sticky top-14 md:top-0 z-30">
        <Breadcrumb />
        <h2 className="text-lg font-bold text-neutral-800">Kenaikan Kelas</h2>
        <p className="text-xs text-neutral-400 mt-0.5">Pindahkan siswa ke tahun ajaran baru</p>
      </div>

      <div className="px-4 py-4 max-w-lg mx-auto space-y-4">

        {/* Langkah 1: Pilih tahun */}
        {step === 'pilih' && (
          <section className="card space-y-4 animate-in">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-primary-500 text-white text-xs font-bold flex items-center justify-center">1</span>
              <h3 className="font-bold text-neutral-800">Pilih Tahun Ajaran</h3>
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Tahun Asal (sumber siswa)</label>
              <select value={tahunAsal} onChange={e => setTahunAsal(e.target.value)} className="w-full h-11 px-3 border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-300">
                <option value="">-- Pilih --</option>
                {tahunList.map(t => <option key={t.id} value={t.id}>{t.nama}{t.is_active ? ' (Aktif)' : ''}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Tahun Tujuan (tahun baru)</label>
              <select value={tahunTujuan} onChange={e => setTahunTujuan(e.target.value)} className="w-full h-11 px-3 border border-neutral-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-300">
                <option value="">-- Pilih --</option>
                {tahunList.filter(t => t.id !== tahunAsal).map(t => <option key={t.id} value={t.id}>{t.nama}</option>)}
              </select>
            </div>

            <button
              onClick={handlePreview}
              disabled={!tahunAsal || !tahunTujuan || isLoading}
              className={cn('w-full h-11 rounded-lg font-semibold text-sm text-white', !tahunAsal || !tahunTujuan || isLoading ? 'bg-neutral-300' : 'bg-primary-500 hover:bg-primary-600')}
            >
              {isLoading ? 'Memuat...' : 'Lanjut →'}
            </button>
          </section>
        )}

        {/* Langkah 2: Mapping kelas */}
        {step === 'mapping' && (
          <div className="space-y-4 animate-in">
            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-primary-500 text-white text-xs font-bold flex items-center justify-center">2</span>
                <h3 className="font-bold text-neutral-800">Petakan Kelas</h3>
              </div>
              <p className="text-xs text-neutral-500 mb-4">
                {preview.filter(s => !s.sudahDiTujuan).length} siswa perlu dipetakan ke kelas baru.
                {preview.filter(s => s.sudahDiTujuan).length > 0 && ` ${preview.filter(s => s.sudahDiTujuan).length} siswa sudah ada di tahun tujuan.`}
              </p>

              {Object.entries(kelasByAsal).map(([kelasAsal, siswas]) => {
                const belumPetakan = siswas.filter(s => !s.sudahDiTujuan)
                if (belumPetakan.length === 0) return null
                return (
                  <div key={kelasAsal} className="mb-4 border border-neutral-200 rounded-lg overflow-hidden">
                    <div className="bg-neutral-50 px-3 py-2 flex items-center justify-between">
                      <p className="text-xs font-bold text-neutral-700">Kelas {kelasAsal} ({belumPetakan.length} siswa)</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-neutral-400">Pindah ke:</span>
                        <select
                          className="text-xs border border-neutral-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-300"
                          onChange={e => quickMap(kelasAsal, e.target.value)}
                          defaultValue=""
                        >
                          <option value="">-- Pilih --</option>
                          {kelasTujuan.map(k => <option key={k.id} value={k.id}>Kelas {k.nama_kelas}</option>)}
                        </select>
                      </div>
                    </div>
                    {belumPetakan.map(s => (
                      <div key={s.siswaId} className="flex items-center justify-between px-3 py-2 border-t border-neutral-100">
                        <p className="text-sm text-neutral-700">{s.namaLengkap}</p>
                        <select
                          value={mapping[s.siswaId] ?? ''}
                          onChange={e => setMapping(prev => ({ ...prev, [s.siswaId]: e.target.value }))}
                          className="text-xs border border-neutral-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-300"
                        >
                          <option value="">-- Pilih --</option>
                          {kelasTujuan.map(k => <option key={k.id} value={k.id}>Kelas {k.nama_kelas}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep('pilih')} className="flex-1 h-11 border border-neutral-200 rounded-lg text-sm font-semibold text-neutral-600">← Kembali</button>
              <button
                onClick={() => setStep('preview')}
                disabled={!allMapped}
                className={cn('flex-1 h-11 rounded-lg text-sm font-semibold text-white', !allMapped ? 'bg-neutral-300' : 'bg-primary-500 hover:bg-primary-600')}
              >
                Review ({readySiswa.length}) →
              </button>
            </div>
          </div>
        )}

        {/* Langkah 3: Preview & Konfirmasi */}
        {step === 'preview' && (
          <div className="space-y-4 animate-in">
            <section className="card">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-primary-500 text-white text-xs font-bold flex items-center justify-center">3</span>
                <h3 className="font-bold text-neutral-800">Konfirmasi</h3>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-amber-700 font-semibold">
                  ⚠️ {readySiswa.length} siswa akan dipindahkan ke tahun ajaran baru. Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>

              <div className="space-y-1 max-h-64 overflow-y-auto">
                {readySiswa.map(s => {
                  const kelas = kelasTujuan.find(k => k.id === mapping[s.siswaId])
                  return (
                    <div key={s.siswaId} className="flex items-center justify-between py-2 border-b border-neutral-100">
                      <p className="text-sm text-neutral-700">{s.namaLengkap}</p>
                      <p className="text-xs text-neutral-500">
                        <span className="text-neutral-400">{s.kelasAsal}</span>
                        <span className="mx-1.5">→</span>
                        <span className="font-semibold text-primary-600">{kelas?.nama_kelas ?? '-'}</span>
                      </p>
                    </div>
                  )
                })}
              </div>
            </section>

            <div className="flex gap-3">
              <button onClick={() => setStep('mapping')} className="flex-1 h-11 border border-neutral-200 rounded-lg text-sm font-semibold text-neutral-600">← Kembali</button>
              <button
                onClick={handleExekusi}
                disabled={isLoading}
                className={cn('flex-1 h-11 rounded-lg text-sm font-semibold text-white', isLoading ? 'bg-neutral-300' : 'bg-primary-500 hover:bg-primary-600')}
              >
                {isLoading ? 'Memproses...' : '🎓 Eksekusi'}
              </button>
            </div>
          </div>
        )}

        {/* Selesai */}
        {step === 'done' && result && (
          <section className="card text-center py-8 animate-in">
            <p className="text-5xl mb-4">🎓</p>
            <h3 className="font-bold text-neutral-800 text-lg">Kenaikan Kelas Berhasil!</h3>
            <p className="text-sm text-neutral-500 mt-2">
              <span className="text-success font-semibold">{result.inserted} siswa</span> berhasil dipindahkan
              {result.skipped > 0 && <>, <span className="text-warning font-semibold">{result.skipped}</span> dilewati</>}
            </p>
            <button
              onClick={() => { setStep('pilih'); setPreview([]); setMapping({}); setResult(null) }}
              className="mt-6 px-6 py-2.5 bg-primary-500 text-white text-sm font-semibold rounded-lg"
            >
              Selesai
            </button>
          </section>
        )}
      </div>
      {ToastComponent}
    </div>
  )
}
