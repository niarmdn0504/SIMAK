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
        <div className="bg-white rounded-xl shadow-card border border-neutral-100 text-center py-12">
          <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-neutral-600">Tidak ada kelas</p>
          <p className="text-xs text-neutral-400 mt-1">Hubungi admin untuk penugasan kelas</p>
        </div>
      )}
    </div>
  )
}
