// ============================================================
// app/api/admin/tahun-ajaran/[id]/route.ts
// PATCH:  Edit nama / set sebagai aktif
// DELETE: Hapus (hanya jika tidak ada data)
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { requireRole }               from '@/lib/auth/staff'
import { createServerClient }        from '@/lib/supabase/server'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    await requireRole(['admin'])
    const supabase  = await createServerClient()
    const { id }    = await params
    const body      = await request.json()
    const { nama, setActive } = body

    // Set sebagai tahun ajaran aktif
    if (setActive === true) {
      // Nonaktifkan semua dulu
      await supabase.from('tahun_ajaran').update({ is_active: false }).neq('id', id)
      // Aktifkan yang ini
      const { error } = await supabase.from('tahun_ajaran').update({ is_active: true }).eq('id', id)
      if (error) throw error
      return NextResponse.json({ success: true })
    }

    if (nama !== undefined) {
      const { error } = await supabase
        .from('tahun_ajaran').update({ nama: nama.trim() }).eq('id', id)
      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err instanceof Error && err.message === 'FORBIDDEN')    return NextResponse.json({ error: 'Forbidden' },    { status: 403 })
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}
