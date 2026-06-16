// ============================================================
// app/api/admin/kelas/route.ts
// GET:  Daftar kelas per tahun ajaran
// POST: Buat kelas baru
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { requireRole }               from '@/lib/auth/staff'
import { createServerClient }        from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    await requireRole(['admin'])
    const supabase = await createServerClient()
    const { searchParams } = new URL(request.url)
    const tahunId = searchParams.get('tahunId')

    let query = supabase
      .from('kelas')
      .select(`
        id, nama_kelas, tahun_ajaran_id,
        tahun_ajaran:tahun_ajaran_id(nama),
        wali_kelas:wali_kelas_id(id, nama)
      `)
      .order('nama_kelas', { ascending: true })

    if (tahunId) query = query.eq('tahun_ajaran_id', tahunId)

    const { data, error } = await query
    if (error) throw error

    // Tambahkan jumlah siswa per kelas
    const kelasIds = (data ?? []).map(k => k.id)
    const { data: counts } = await supabase
      .from('siswa_kelas')
      .select('kelas_id')
      .in('kelas_id', kelasIds)

    const countMap = new Map<string, number>()
    for (const row of counts ?? []) {
      countMap.set(row.kelas_id, (countMap.get(row.kelas_id) ?? 0) + 1)
    }

    const result = (data ?? []).map(k => ({
      ...k,
      jumlah_siswa: countMap.get(k.id) ?? 0,
    }))

    return NextResponse.json(result)
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err instanceof Error && err.message === 'FORBIDDEN')    return NextResponse.json({ error: 'Forbidden' },    { status: 403 })
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole(['admin'])
    const supabase = await createServerClient()
    const body     = await request.json()
    const { namaKelas, tahunAjaranId, waliKelasId } = body

    if (!namaKelas || !tahunAjaranId) {
      return NextResponse.json({ error: 'Nama kelas dan tahun ajaran wajib diisi' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('kelas')
      .insert({
        nama_kelas:      namaKelas.trim(),
        tahun_ajaran_id: tahunAjaranId,
        wali_kelas_id:   waliKelasId || null,
      })
      .select().single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Nama kelas sudah ada di tahun ajaran ini' }, { status: 409 })
      }
      throw error
    }

    return NextResponse.json({ success: true, data })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err instanceof Error && err.message === 'FORBIDDEN')    return NextResponse.json({ error: 'Forbidden' },    { status: 403 })
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}
