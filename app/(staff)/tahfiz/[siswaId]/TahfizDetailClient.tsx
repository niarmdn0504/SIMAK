// ============================================================
// app/(staff)/tahfiz/[siswaId]/TahfizDetailClient.tsx
// Halaman detail tahfiz satu siswa — interaktif
// ============================================================

'use client'

import { useState }         from 'react'
import { useRouter }        from 'next/navigation'
import { TahfizHistory }    from '@/components/tahfiz/TahfizHistory'
import { TahfizForm }       from '@/components/tahfiz/TahfizForm'
import { useTahfizBySiswa } from '@/hooks/useTahfiz'
import { cn }               from '@/lib/utils/cn'

interface SiswaInfo {
  id:          string
  nama_lengkap: string
  nisn:        string
  photo_url:   string | null
  nama_kelas:  string
}

interface Props {
  siswa:    SiswaInfo
  guruId:   string
  guruNama: string
}

export function TahfizDetailClient({ siswa, guruId, guruNama }: Props) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)

  const { data: entries = [], isLoading } = useTahfizBySiswa(siswa.id)

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header siswa */}
      <div className="bg-white border-b border-neutral-100 px-4 py-4">
        <button
          onClick={() => router.push('/tahfiz')}
          className="flex items-center gap-1.5 text-primary-600 text-sm font-medium mb-3 hover:text-primary-700"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Daftar Siswa
        </button>

        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {siswa.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={siswa.photo_url} alt={siswa.nama_lengkap} className="w-full h-full object-cover" />
            ) : (
              <span className="text-primary-700 font-bold text-lg">
                {siswa.nama_lengkap.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <h2 className="font-bold text-neutral-800">{siswa.nama_lengkap}</h2>
            <p className="text-xs text-neutral-400">Kelas {siswa.nama_kelas} · NISN {siswa.nisn}</p>
          </div>
        </div>

        {/* Stats singkat */}
        <div className="flex gap-3 mt-3">
          <StatBadge label="Total Setoran" value={entries.length} />
          <StatBadge
            label="Lulus"
            value={entries.filter(e => e.status === 'lulus').length}
            color="text-success"
          />
          <StatBadge
            label="Murajaah"
            value={entries.filter(e => e.status === 'murajaah').length}
            color="text-warning"
          />
        </div>
      </div>

      {/* Konten */}
      <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
        {/* Tombol tambah / form */}
        {showForm ? (
          <div className="card animate-in">
            <h3 className="font-bold text-neutral-800 mb-4">Tambah Setoran Baru</h3>
            <TahfizForm
              siswaId={siswa.id}
              onSuccess={() => setShowForm(false)}
              onCancel={() => setShowForm(false)}
            />
          </div>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="w-full h-12 bg-primary-500 hover:bg-primary-600 active:scale-[0.98] text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all shadow-md"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Tambah Setoran
          </button>
        )}

        {/* Riwayat */}
        <div>
          <h3 className="font-bold text-neutral-700 mb-3">
            Riwayat Setoran
            {!isLoading && entries.length > 0 && (
              <span className="ml-2 text-xs font-normal text-neutral-400">({entries.length} total)</span>
            )}
          </h3>
          <TahfizHistory
            entries={entries}
            siswaId={siswa.id}
            isLoading={isLoading}
            guruId={guruId}
          />
        </div>
      </div>
    </div>
  )
}

function StatBadge({
  label, value, color = 'text-neutral-700'
}: {
  label: string; value: number; color?: string
}) {
  return (
    <div className="flex-1 bg-neutral-50 rounded-lg px-3 py-2 text-center">
      <p className={cn('text-lg font-bold', color)}>{value}</p>
      <p className="text-[10px] text-neutral-400 leading-tight">{label}</p>
    </div>
  )
}
