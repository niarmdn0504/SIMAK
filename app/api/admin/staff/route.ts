// ============================================================
// app/api/admin/staff/route.ts
// GET:  Daftar semua staff (dengan email + kelas)
// POST: Buat akun staff baru (via Supabase Admin Auth)
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { requireRole }               from '@/lib/auth/staff'
import { createServiceClient }       from '@/lib/supabase/server'

export async function GET() {
  try {
    await requireRole(['admin'])
    const supabase = createServiceClient()

    // Fetch profiles
    const { data: profiles, error } = await supabase
      .from('user_profile')
      .select('id, nama, role, is_active, created_at')
      .order('nama')

    if (error) throw error

    // Fetch auth users for emails
    const { data: authUsers } = await supabase.auth.admin.listUsers()
    const emailMap = new Map<string, string>()
    for (const u of authUsers?.users ?? []) {
      emailMap.set(u.id, u.email ?? '')
    }

    // Fetch kelas assignments (wali_kelas)
    const { data: kelasData } = await supabase
      .from('kelas')
      .select('id, nama_kelas, wali_kelas_id')

    const kelasMap = new Map<string, string[]>()
    for (const k of kelasData ?? []) {
      if (k.wali_kelas_id) {
        const existing = kelasMap.get(k.wali_kelas_id) ?? []
        existing.push(k.nama_kelas)
        kelasMap.set(k.wali_kelas_id, existing)
      }
    }

    const result = (profiles ?? []).map(p => ({
      id:         p.id,
      nama:       p.nama,
      email:      emailMap.get(p.id) ?? '',
      role:       p.role,
      is_active:  p.is_active,
      kelas:      kelasMap.get(p.id) ?? [],
      created_at: p.created_at,
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

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      if (authError.message.includes('already')) {
        return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 409 })
      }
      throw authError
    }

    const { error: profileError } = await supabase
      .from('user_profile')
      .insert({ id: authData.user.id, nama, role })

    if (profileError) {
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
