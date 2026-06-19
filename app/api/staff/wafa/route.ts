// ============================================================
// app/api/staff/wafa/route.ts
// GET:  Riwayat wafa satu siswa
// POST: Input progres wafa baru
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { requireStaffSession }       from '@/lib/auth/staff'
import { createServerClient }        from '@/lib/supabase/server'
import { WAFA_JILID }                from '@/lib/constants/wafa'

export async function GET(request: NextRequest) {
  try {
    await requireStaffSession()
    const supabase = await createServerClient()
    const { searchParams } = new URL(request.url)
    const siswaId = searchParams.get('siswaId')

    if (!siswaId) {
      return NextResponse.json({ error: 'siswaId diperlukan' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('wafa_log')
      .select(`
        id, tanggal, jilid, halaman,
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
    const supabase = await createServerClient()
    const body     = await request.json()

    const { siswaId, tanggal, jilid, halaman, status, catatan } = body

    if (!siswaId || !tanggal || !jilid || !status) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    if (!['naik', 'lanjut', 'mengulang'].includes(status)) {
      return NextResponse.json({ error: 'Status tidak valid' }, { status: 400 })
    }

    if (!(WAFA_JILID as readonly string[]).includes(jilid)) {
      return NextResponse.json({ error: 'Jilid tidak valid' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('wafa_log')
      .insert({
        siswa_id: siswaId,
        guru_id:  session.userId,
        tanggal,
        jilid,
        halaman:  halaman ? Number(halaman) : null,
        status,
        catatan:  catatan || null,
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
    console.error('POST wafa error:', err)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}
