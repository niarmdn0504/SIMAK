// ============================================================
// app/api/admin/staff/[id]/route.ts
// PATCH:  Edit nama / role / toggle aktif / reset password
// DELETE: Hapus akun (hard delete jika tanpa histori, soft delete jika ada)
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

    if (id === me.userId && isActive === false) {
      return NextResponse.json({ error: 'Tidak bisa menonaktifkan akun sendiri' }, { status: 400 })
    }

    const updates: Record<string, unknown> = {}
    if (nama     !== undefined) updates.nama      = nama
    if (role     !== undefined) updates.role      = role
    if (isActive !== undefined) updates.is_active = isActive

    if (Object.keys(updates).length > 0) {
      const { error } = await svc.from('user_profile').update(updates as never).eq('id', id)
      if (error) throw error
    }

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

    // Check for history: tahfiz_log, wafa_log, mutabaah_log (via siswa assignments)
    const [tahfizRes, wafaRes] = await Promise.all([
      svc.from('tahfiz_log').select('id', { count: 'exact', head: true }).eq('guru_id', id),
      svc.from('wafa_log').select('id', { count: 'exact', head: true }).eq('guru_id', id),
    ])

    const hasHistory = (tahfizRes.count ?? 0) > 0 || (wafaRes.count ?? 0) > 0

    if (hasHistory) {
      // Soft delete: nonaktifkan akses, pertahankan data
      await svc.from('user_profile').update({ is_active: false }).eq('id', id)
      await svc.from('user_roles').delete().eq('user_id', id)
      // Revoke auth session
      await svc.auth.admin.signOut(id)
      return NextResponse.json({ success: true, method: 'soft', message: 'Akun dinonaktifkan, data histori dipertahankan' })
    } else {
      // Hard delete: hapus semua
      await svc.from('user_roles').delete().eq('user_id', id)
      await svc.from('kelas').update({ wali_kelas_id: null }).eq('wali_kelas_id', id)
      await svc.from('user_profile').delete().eq('id', id)
      await svc.auth.admin.deleteUser(id)
      return NextResponse.json({ success: true, method: 'hard', message: 'Akun dihapus permanen' })
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err instanceof Error && err.message === 'FORBIDDEN')    return NextResponse.json({ error: 'Forbidden' },    { status: 403 })
    console.error('DELETE /api/admin/staff:', err)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}
