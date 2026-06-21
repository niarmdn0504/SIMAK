// ============================================================
// app/api/admin/mutabaah-items/[id]/route.ts
// PATCH:  Edit nama / toggle aktif / reorder
// DELETE: Soft delete (is_active = false)
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { requireRole }               from '@/lib/auth/staff'
import { createServerClient }        from '@/lib/supabase/server'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    await requireRole(['admin'])
    const supabase = await createServerClient()
    const { id }   = await params
    const body     = await request.json()
    const { namaItem, isActive, urutan } = body

    const updates: Record<string, unknown> = {}
    if (namaItem  !== undefined) updates.nama_item = namaItem.trim()
    if (isActive  !== undefined) updates.is_active = isActive
    if (urutan    !== undefined) updates.urutan    = urutan

    const { error } = await supabase.from('mutabaah_item').update(updates as never).eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err instanceof Error && err.message === 'FORBIDDEN')    return NextResponse.json({ error: 'Forbidden' },    { status: 403 })
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    await requireRole(['admin'])
    const supabase = await createServerClient()
    const { id }   = await params
    const { searchParams } = new URL(request.url)
    const permanent = searchParams.get('permanent') === 'true'

    if (permanent) {
      // Ambil semua anak (sub item)
      const { data: children } = await supabase
        .from('mutabaah_item').select('id').eq('parent_id', id)
      const childIds = children?.map(c => c.id) || []
      const allIds   = [id, ...childIds]

      // Hapus log terkait
      const { error: logErr } = await supabase
        .from('mutabaah_log').delete().in('item_id', allIds)
      if (logErr) throw logErr

      // Hapus sub item
      if (childIds.length > 0) {
        const { error: childErr } = await supabase
          .from('mutabaah_item').delete().in('id', childIds)
        if (childErr) throw childErr
      }

      // Hapus item utama
      const { error } = await supabase
        .from('mutabaah_item').delete().eq('id', id)
      if (error) throw error
      return NextResponse.json({ success: true })
    }

    // Soft delete — arsipkan, preservasi riwayat
    const { error } = await supabase
      .from('mutabaah_item').update({ is_active: false }).eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err instanceof Error && err.message === 'FORBIDDEN')    return NextResponse.json({ error: 'Forbidden' },    { status: 403 })
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}
