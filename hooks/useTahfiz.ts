// ============================================================
// hooks/useTahfiz.ts
// TanStack Query hooks untuk Guru Tahfiz
// ============================================================

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface TahfizEntry {
  id:         string
  tanggal:    string
  surah:      string
  ayat_awal:  number | null
  ayat_akhir: number | null
  status:     'setoran_baru' | 'murajaah' | 'lulus'
  catatan:    string | null
  created_at: string
  guru?:      { nama: string } | null
}

export interface TahfizInput {
  siswaId:    string
  tanggal:    string
  surah:      string
  ayatAwal?:  number | null
  ayatAkhir?: number | null
  status:     'setoran_baru' | 'murajaah' | 'lulus'
  catatan?:   string
}

// -----------------------------------------------------------
// Fetch riwayat tahfiz satu siswa
// -----------------------------------------------------------
export function useTahfizBySiswa(siswaId: string | null) {
  return useQuery<TahfizEntry[]>({
    queryKey: ['tahfiz', siswaId],
    queryFn:  async () => {
      const res = await fetch(`/api/staff/tahfiz?siswaId=${siswaId}`)
      if (!res.ok) throw new Error('Gagal memuat data tahfiz')
      return res.json()
    },
    enabled:   !!siswaId,
    staleTime: 2 * 60 * 1000,
  })
}

// -----------------------------------------------------------
// Tambah setoran baru
// -----------------------------------------------------------
export function useAddTahfiz() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: TahfizInput) => {
      const res = await fetch('/api/staff/tahfiz', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(input),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Gagal menyimpan')
      }
      return res.json()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tahfiz', variables.siswaId] })
    },
  })
}

// -----------------------------------------------------------
// Edit entry
// -----------------------------------------------------------
export function useEditTahfiz() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id, siswaId, ...updates
    }: Partial<TahfizInput> & { id: string; siswaId: string }) => {
      const res = await fetch(`/api/staff/tahfiz/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(updates),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Gagal mengubah')
      }
      return res.json()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tahfiz', variables.siswaId] })
    },
  })
}

// -----------------------------------------------------------
// Hapus entry
// -----------------------------------------------------------
export function useDeleteTahfiz() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id }: { id: string; siswaId: string }) => {
      const res = await fetch(`/api/staff/tahfiz/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Gagal menghapus')
      }
      return res.json()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tahfiz', variables.siswaId] })
    },
  })
}
