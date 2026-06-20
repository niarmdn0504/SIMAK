'use client'

import { useRouter } from 'next/navigation'

interface KelasItem {
  id:         string
  nama_kelas: string
}

export function AturMutabaahClient({ kelasList }: { kelasList: KelasItem[] }) {
  const router = useRouter()

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-lg font-bold text-neutral-800 mb-1">Atur Item Mutabaah</h1>
      <p className="text-xs text-neutral-400 mb-4">Pilih kelas untuk mengatur item mutabaah yang berlaku</p>

      <div className="space-y-2">
        {kelasList.map(k => (
          <button
            key={k.id}
            onClick={() => router.push(`/guru/atur-mutabaah/${k.id}`)}
            className="w-full card flex items-center justify-between p-4 text-left hover:shadow-md active:scale-[0.98] transition-all"
          >
            <span className="font-semibold text-neutral-800">Kelas {k.nama_kelas}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        ))}
      </div>

      {kelasList.length === 0 && (
        <div className="card text-center py-10">
          <p className="text-neutral-500 text-sm">Tidak ada kelas</p>
        </div>
      )}
    </div>
  )
}
