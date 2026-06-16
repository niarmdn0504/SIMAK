// ============================================================
// hooks/useWafa.ts
// TanStack Query hooks untuk Guru Wafa
// ============================================================

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface WafaEntry {
  id:         string
  tanggal:    string
  jilid:      string
  halaman:    number | null
  status:     'naik' | 'lanjut' | 'mengulang'
  catatan:    string | null
  created_at: string
  guru?:      { nama: string } | null
}

export interface WafaInput {
  siswaId:  string
  tanggal:  string
  jilid:    string
  halaman?: number | null
  status:   'naik' | 'lanjut' | 'mengulang'
  catatan?: string
}

export function useWafaBySiswa(siswaId: string | null) {
  return useQuery<WafaEntry[]>({
    queryKey: ['wafa', siswaId],
    queryFn:  async () => {
      const res = await fetch(`/api/staff/wafa?siswaId=${siswaId}`)
      if (!res.ok) throw new Error('Gagal memuat data wafa')
      return res.json()
    },
    enabled:   !!siswaId,
    staleTime: 2 * 60 * 1000,
  })
}

export function useAddWafa() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: WafaInput) => {
      const res = await fetch('/api/staff/wafa', {
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
      queryClient.invalidateQueries({ queryKey: ['wafa', variables.siswaId] })
    },
  })
}

export function useEditWafa() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id, siswaId, ...updates
    }: Partial<WafaInput> & { id: string; siswaId: string }) => {
      const res = await fetch(`/api/staff/wafa/${id}`, {
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
      queryClient.invalidateQueries({ queryKey: ['wafa', variables.siswaId] })
    },
  })
}

export function useDeleteWafa() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id }: { id: string; siswaId: string }) => {
      const res = await fetch(`/api/staff/wafa/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Gagal menghapus')
      }
      return res.json()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['wafa', variables.siswaId] })
    },
  })
}
