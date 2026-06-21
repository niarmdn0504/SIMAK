// ============================================================
// app/api/admin/tahun-ajaran/route.ts
// GET:  Semua tahun ajaran
// POST: Buat tahun ajaran baru
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { requireRole }               from '@/lib/auth/staff'
import { createServerClient }        from '@/lib/supabase/server'

export async function GET() {
  try {
    await requireRole(['admin'])
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('tahun_ajaran')
      .select('*')
      .order('nama', { ascending: false })
    if (error) throw error

    // Add stats per tahun ajaran
    const result = await Promise.all((data ?? []).map(async (t) => {
      const [
        { count: kelasCount },
        { data: skData },
        { count: guruCount },
      ] = await Promise.all([
        supabase.from('kelas').select('*', { count: 'exact', head: true }).eq('tahun_ajaran_id', t.id),
        supabase.from('siswa_kelas').select('siswa_id').eq('tahun_ajaran_id', t.id),
        supabase.from('user_profile').select('*', { count: 'exact', head: true }).eq('is_active', true),
      ])
      return {
        ...t,
        jumlah_kelas: kelasCount ?? 0,
        jumlah_siswa: new Set((skData ?? []).map((r: any) => r.siswa_id)).size,
        jumlah_guru: guruCount ?? 0,
      }
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
    const { nama } = body

    if (!nama?.trim()) {
      return NextResponse.json({ error: 'Nama tahun ajaran wajib diisi' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('tahun_ajaran')
      .insert({ nama: nama.trim(), is_active: false })
      .select().single()

    if (error) {
      if (error.code === '23505') return NextResponse.json({ error: 'Tahun ajaran sudah ada' }, { status: 409 })
      throw error
    }
    return NextResponse.json({ success: true, data })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err instanceof Error && err.message === 'FORBIDDEN')    return NextResponse.json({ error: 'Forbidden' },    { status: 403 })
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}
