// ============================================================
// hooks/useSiswa.ts
// Fetch daftar siswa untuk staff
// ============================================================

'use client'

import { useQuery } from '@tanstack/react-query'

export interface SiswaItem {
  id:           string
  nisn:         string
  nama_lengkap: string
  photo_url:    string | null
  kelas_id:     string
  nama_kelas:   string
}

export function useSiswaList(kelasId?: string) {
  const params = kelasId ? `?kelasId=${kelasId}` : ''

  return useQuery<SiswaItem[]>({
    queryKey: ['siswa-list', kelasId ?? 'all'],
    queryFn:  async () => {
      const res = await fetch(`/api/staff/siswa${params}`)
      if (!res.ok) throw new Error('Gagal memuat daftar siswa')
      return res.json()
    },
    staleTime: 10 * 60 * 1000,
  })
}

// Ambil semua kelas unik dari daftar siswa
export function useKelasList(siswaList: SiswaItem[]) {
  const kelasMap = new Map<string, string>()
  for (const s of siswaList) {
    kelasMap.set(s.kelas_id, s.nama_kelas)
  }
  return Array.from(kelasMap.entries())
    .map(([id, nama]) => ({ id, nama }))
    .sort((a, b) => a.nama.localeCompare(b.nama))
}
