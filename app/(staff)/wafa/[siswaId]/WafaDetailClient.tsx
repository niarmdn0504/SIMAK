// ============================================================
// app/(staff)/wafa/[siswaId]/WafaDetailClient.tsx
// ============================================================

'use client'

import { useState }       from 'react'
import { useRouter }      from 'next/navigation'
import { WafaHistory }    from '@/components/wafa/WafaHistory'
import { WafaForm }       from '@/components/wafa/WafaForm'
import { useWafaBySiswa } from '@/hooks/useWafa'
import { cn }             from '@/lib/utils/cn'

const JILID_ICON: Record<string, string> = {
  'Jilid 1': '①','Jilid 2': '②','Jilid 3': '③',
  'Jilid 4': '④','Jilid 5': '⑤','Jilid 6': '⑥',
  "Al-Qur'an": '📖',
}

interface SiswaInfo {
  id:           string
  nama_lengkap: string
  nisn:         string
  photo_url:    string | null
  nama_kelas:   string
}

interface Props {
  siswa:        SiswaInfo
  guruId:       string
  currentJilid: string | null
}

export function WafaDetailClient({ siswa, guruId, currentJilid }: Props) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)

  const { data: entries = [], isLoading } = useWafaBySiswa(siswa.id)
  const latestJilid = entries[0]?.jilid ?? currentJilid

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header siswa */}
      <div className="bg-white border-b border-neutral-100 px-4 py-4">
        <button
          onClick={() => router.push('/wafa')}
          className="flex items-center gap-1.5 text-primary-600 text-sm font-medium mb-3 hover:text-primary-700"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Daftar Siswa
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {siswa.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={siswa.photo_url} alt={siswa.nama_lengkap} className="w-full h-full object-cover" />
            ) : (
              <span className="text-primary-700 font-bold text-lg">{siswa.nama_lengkap.charAt(0)}</span>
            )}
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-neutral-800">{siswa.nama_lengkap}</h2>
            <p className="text-xs text-neutral-400">Kelas {siswa.nama_kelas} · NISN {siswa.nisn}</p>
          </div>
          {/* Level badge */}
          {latestJilid && (
            <div className="text-center bg-primary-50 border border-primary-200 rounded-lg px-3 py-2">
              <p className="text-xl">{JILID_ICON[latestJilid] ?? '📚'}</p>
              <p className="text-[10px] font-semibold text-primary-700 leading-tight">
                {latestJilid.replace('Jilid ', 'Jilid ')}
              </p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-3 mt-3">
          <div className="flex-1 bg-neutral-50 rounded-lg px-3 py-2 text-center">
            <p className="text-lg font-bold text-neutral-700">{entries.length}</p>
            <p className="text-[10px] text-neutral-400">Total Sesi</p>
          </div>
          <div className="flex-1 bg-green-50 rounded-lg px-3 py-2 text-center">
            <p className="text-lg font-bold text-success">{entries.filter(e => e.status === 'naik').length}</p>
            <p className="text-[10px] text-neutral-400">Naik Level</p>
          </div>
          <div className="flex-1 bg-amber-50 rounded-lg px-3 py-2 text-center">
            <p className="text-lg font-bold text-warning">{entries.filter(e => e.status === 'mengulang').length}</p>
            <p className="text-[10px] text-neutral-400">Mengulang</p>
          </div>
        </div>
      </div>

      {/* Konten */}
      <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
        {showForm ? (
          <div className="card animate-in">
            <h3 className="font-bold text-neutral-800 mb-4">Tambah Progres Wafa</h3>
            <WafaForm
              siswaId={siswa.id}
              currentJilid={latestJilid}
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
            Tambah Progres
          </button>
        )}

        <div>
          <h3 className="font-bold text-neutral-700 mb-3">
            Riwayat Progres
            {!isLoading && entries.length > 0 && (
              <span className="ml-2 text-xs font-normal text-neutral-400">({entries.length} total)</span>
            )}
          </h3>
          <WafaHistory entries={entries} siswaId={siswa.id} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}
