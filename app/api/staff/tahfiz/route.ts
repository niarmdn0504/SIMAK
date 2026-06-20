// ============================================================
// app/api/staff/tahfiz/route.ts
// GET:  Riwayat tahfiz satu siswa
// POST: Input setoran tahfiz baru
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { requireStaffSession }       from '@/lib/auth/staff'
import { createServiceClient }       from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    await requireStaffSession()
    const supabase = createServiceClient()
    const { searchParams } = new URL(request.url)
    const siswaId = searchParams.get('siswaId')

    if (!siswaId) {
      return NextResponse.json({ error: 'siswaId diperlukan' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('tahfiz_log')
      .select(`
        id, tanggal, surah, ayat_awal, ayat_akhir,
        status, catatan, created_at,
        guru:guru_id ( nama )
      `)
      .eq('siswa_id', siswaId)
      .order('tanggal', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error
    return NextResponse.json(data ?? [])
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      if (err.message === 'FORBIDDEN')    return NextResponse.json({ error: 'Forbidden' },    { status: 403 })
    }
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session  = await requireStaffSession()
    const supabase = createServiceClient()
    const body     = await request.json()

    const { siswaId, tanggal, surah, ayatAwal, ayatAkhir, status, catatan } = body

    // Validasi wajib
    if (!siswaId || !tanggal || !surah || !status) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    // Validasi status
    if (!['setoran_baru', 'murajaah', 'lulus'].includes(status)) {
      return NextResponse.json({ error: 'Status tidak valid' }, { status: 400 })
    }

    // Validasi rentang ayat
    if (ayatAwal && ayatAkhir && Number(ayatAkhir) < Number(ayatAwal)) {
      return NextResponse.json(
        { error: 'Ayat akhir harus lebih besar atau sama dengan ayat awal' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('tahfiz_log')
      .insert({
        siswa_id:   siswaId,
        guru_id:    session.userId,
        tanggal,
        surah,
        ayat_awal:  ayatAwal  ? Number(ayatAwal)  : null,
        ayat_akhir: ayatAkhir ? Number(ayatAkhir) : null,
        status,
        catatan:    catatan || null,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      if (err.message === 'FORBIDDEN')    return NextResponse.json({ error: 'Forbidden' },    { status: 403 })
    }
    console.error('POST tahfiz error:', err)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}
