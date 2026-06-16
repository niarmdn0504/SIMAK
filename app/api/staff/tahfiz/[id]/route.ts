// ============================================================
// app/api/staff/tahfiz/[id]/route.ts
// PATCH:  Edit entry tahfiz milik sendiri
// DELETE: Hapus entry tahfiz milik sendiri
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { requireRole }               from '@/lib/auth/staff'
import { createServerClient }        from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session  = await requireRole(['guru_tahfiz', 'admin'])
    const supabase = await createServerClient()
    const { id }   = await params
    const body     = await request.json()

    const { surah, ayatAwal, ayatAkhir, status, catatan } = body

    // Pastikan entry milik guru ini (kecuali admin)
    if (session.role !== 'admin') {
      const { data: existing } = await supabase
        .from('tahfiz_log')
        .select('guru_id')
        .eq('id', id)
        .single()

      if (existing?.guru_id !== session.userId) {
        return NextResponse.json({ error: 'Tidak boleh edit entry milik guru lain' }, { status: 403 })
      }
    }

    const { data, error } = await supabase
      .from('tahfiz_log')
      .update({
        surah,
        ayat_awal:  ayatAwal  ? Number(ayatAwal)  : null,
        ayat_akhir: ayatAkhir ? Number(ayatAkhir) : null,
        status,
        catatan: catatan || null,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      if (err.message === 'FORBIDDEN')    return NextResponse.json({ error: 'Forbidden' },    { status: 403 })
    }
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session  = await requireRole(['guru_tahfiz', 'admin'])
    const supabase = await createServerClient()
    const { id }   = await params

    if (session.role !== 'admin') {
      const { data: existing } = await supabase
        .from('tahfiz_log')
        .select('guru_id')
        .eq('id', id)
        .single()

      if (existing?.guru_id !== session.userId) {
        return NextResponse.json({ error: 'Tidak boleh hapus entry milik guru lain' }, { status: 403 })
      }
    }

    const { error } = await supabase
      .from('tahfiz_log')
      .delete()
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      if (err.message === 'FORBIDDEN')    return NextResponse.json({ error: 'Forbidden' },    { status: 403 })
    }
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}
