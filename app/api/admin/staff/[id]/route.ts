// ============================================================
// app/api/admin/staff/[id]/route.ts
// PATCH:  Edit nama / role / toggle aktif / reset password
// DELETE: Nonaktifkan akun staff
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { requireRole }               from '@/lib/auth/staff'
import { createServiceClient }       from '@/lib/supabase/server'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const me     = await requireRole(['admin'])
    const svc    = createServiceClient()
    const { id } = await params
    const body   = await request.json()
    const { nama, role, isActive, newPassword } = body

    // Jangan izinkan admin menonaktifkan diri sendiri
    if (id === me.userId && isActive === false) {
      return NextResponse.json({ error: 'Tidak bisa menonaktifkan akun sendiri' }, { status: 400 })
    }

    const updates: Record<string, unknown> = {}
    if (nama     !== undefined) updates.nama      = nama
    if (role     !== undefined) updates.role      = role
    if (isActive !== undefined) updates.is_active = isActive

    if (Object.keys(updates).length > 0) {
      const { error } = await svc.from('user_profile').update(updates).eq('id', id)
      if (error) throw error
    }

    // Reset password
    if (newPassword) {
      if (newPassword.length < 8) {
        return NextResponse.json({ error: 'Password minimal 8 karakter' }, { status: 400 })
      }
      const { error } = await svc.auth.admin.updateUserById(id, { password: newPassword })
      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err instanceof Error && err.message === 'FORBIDDEN')    return NextResponse.json({ error: 'Forbidden' },    { status: 403 })
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const me     = await requireRole(['admin'])
    const svc    = createServiceClient()
    const { id } = await params

    if (id === me.userId) {
      return NextResponse.json({ error: 'Tidak bisa menghapus akun sendiri' }, { status: 400 })
    }

    // Soft delete — set is_active = false
    const { error } = await svc.from('user_profile').update({ is_active: false }).eq('id', id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err instanceof Error && err.message === 'FORBIDDEN')    return NextResponse.json({ error: 'Forbidden' },    { status: 403 })
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}
