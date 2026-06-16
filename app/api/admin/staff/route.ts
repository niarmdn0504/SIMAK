// ============================================================
// app/api/admin/staff/route.ts
// GET:  Daftar semua staff
// POST: Buat akun staff baru (via Supabase Admin Auth)
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { requireRole }               from '@/lib/auth/staff'
import { createServiceClient }       from '@/lib/supabase/server'

export async function GET() {
  try {
    await requireRole(['admin'])
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('user_profile')
      .select('id, nama, role, is_active, created_at')
      .order('nama')

    if (error) throw error
    return NextResponse.json(data ?? [])
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err instanceof Error && err.message === 'FORBIDDEN')    return NextResponse.json({ error: 'Forbidden' },    { status: 403 })
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole(['admin'])
    const supabase = createServiceClient()
    const body     = await request.json()
    const { email, password, nama, role } = body

    if (!email || !password || !nama || !role) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 })
    }
    if (!['wali_kelas', 'guru_tahfiz', 'guru_wafa', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Role tidak valid' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password minimal 8 karakter' }, { status: 400 })
    }

    // Buat user di Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,  // langsung aktif tanpa perlu konfirmasi email
    })

    if (authError) {
      if (authError.message.includes('already')) {
        return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 409 })
      }
      throw authError
    }

    // Buat user_profile
    const { error: profileError } = await supabase
      .from('user_profile')
      .insert({ id: authData.user.id, nama, role })

    if (profileError) {
      // Rollback: hapus user auth jika profile gagal
      await supabase.auth.admin.deleteUser(authData.user.id)
      throw profileError
    }

    return NextResponse.json({ success: true, userId: authData.user.id })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err instanceof Error && err.message === 'FORBIDDEN')    return NextResponse.json({ error: 'Forbidden' },    { status: 403 })
    console.error('POST /api/admin/staff:', err)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}
