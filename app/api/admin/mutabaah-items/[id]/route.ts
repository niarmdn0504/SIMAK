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

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await requireRole(['admin'])
    const supabase = await createServerClient()
    const { id }   = await params

    // Soft delete — preservasi riwayat mutabaah_log
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
