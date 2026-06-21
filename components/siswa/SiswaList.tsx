// ============================================================
// components/siswa/SiswaList.tsx
// Daftar siswa dengan filter kelas dan search
// ============================================================

'use client'

import { useState, useMemo, useRef }  from 'react'
import { useRouter }          from 'next/navigation'
import { useSiswaList, useKelasList, type SiswaItem } from '@/hooks/useSiswa'
import { SkeletonCard }       from '@/components/ui/Skeleton'
import { cn }                 from '@/lib/utils/cn'

interface SiswaListProps {
  detailPath: string   // '/tahfiz' | '/wafa'
}

export function SiswaList({ detailPath }: SiswaListProps) {
  const router = useRouter()
  const [selectedKelas, setSelectedKelas] = useState<string>('all')
  const [search, setSearch] = useState('')

  const { data: allSiswa, isLoading, isError } = useSiswaList()
  const kelasList = useKelasList(allSiswa ?? [])

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  function handleSearchChange(value: string) {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = setTimeout(() => {
      setSearch(value)
    }, 300)
  }

  const filtered = useMemo(() => {
    if (!allSiswa) return []
    return allSiswa.filter(s => {
      const matchKelas = selectedKelas === 'all' || s.kelas_id === selectedKelas
      const matchSearch = !search || s.nama_lengkap.toLowerCase().includes(search.toLowerCase())
      return matchKelas && matchSearch
    })
  }, [allSiswa, selectedKelas, search])

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {[1,2,3,4].map(i => <SkeletonCard key={i} lines={1} />)}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-4">
        <div className="card text-center py-8">
          <p className="text-danger font-semibold">Gagal memuat daftar siswa</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 text-sm text-primary-500 underline"
          >
            Coba lagi
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Filter bar */}
      <div className="sticky top-0 bg-white border-b border-neutral-100 px-4 py-3 z-10 space-y-2">
        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
            placeholder="Cari nama siswa..."
            className="w-full h-9 pl-9 pr-4 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>

        {/* Kelas tabs */}
        {kelasList.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedKelas('all')}
              className={cn(
                'flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-colors',
                selectedKelas === 'all'
                  ? 'bg-primary-500 text-white'
                  : 'bg-neutral-100 text-neutral-600'
              )}
            >
              Semua
            </button>
            {kelasList.map(k => (
              <button
                key={k.id}
                onClick={() => setSelectedKelas(k.id)}
                className={cn(
                  'flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-colors',
                  selectedKelas === k.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-neutral-100 text-neutral-600'
                )}
              >
                Kelas {k.nama}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Count */}
      <div className="px-4 pt-3 pb-1">
        <p className="text-xs text-neutral-400">
          {filtered.length} siswa
        </p>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-neutral-600">Tidak ada siswa ditemukan</p>
            <p className="text-xs text-neutral-400 mt-1">Coba kata kunci lain</p>
          </div>
        </div>
      ) : (
        <div className="px-4 pb-6 space-y-2 mt-1">
          {filtered.map((siswa, i) => (
            <SiswaCard
              key={siswa.id}
              siswa={siswa}
              index={i}
              onClick={() => router.push(`${detailPath}/${siswa.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// -----------------------------------------------------------
// Kartu satu siswa
// -----------------------------------------------------------
function SiswaCard({
  siswa,
  index,
  onClick,
}: {
  siswa:   SiswaItem
  index:   number
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full card flex items-center gap-3 text-left hover:shadow-elevated active:scale-[0.98] transition-all animate-in"
      style={{ animationDelay: `${index * 0.03}s` }}
    >
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
        {siswa.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={siswa.photo_url} alt={siswa.nama_lengkap} className="w-full h-full object-cover" />
        ) : (
          <span className="text-primary-600 font-bold text-sm">
            {siswa.nama_lengkap.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-neutral-800 truncate">{siswa.nama_lengkap}</p>
        <p className="text-xs text-neutral-400 mt-0.5">Kelas {siswa.nama_kelas}</p>
      </div>

      {/* Arrow */}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </button>
  )
}
