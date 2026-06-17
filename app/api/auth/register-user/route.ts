import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient }        from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password, nama, role } = await request.json()

    if (!email || !password || !nama || !role) {
      return NextResponse.json(
        { success: false, error: 'Semua field wajib: email, password, nama, role' },
        { status: 400 }
      )
    }

    const validRoles = ['admin', 'wali_kelas', 'guru_tahfiz', 'guru_wafa']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Role tidak valid' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (createError) {
      return NextResponse.json(
        { success: false, error: createError.message },
        { status: 500 }
      )
    }

    if (!userData.user) {
      return NextResponse.json(
        { success: false, error: 'Gagal membuat user' },
        { status: 500 }
      )
    }

    const { error: profileError } = await supabase
      .from('user_profile')
      .insert({
        id: userData.user.id,
        nama,
        role: role as 'admin' | 'wali_kelas' | 'guru_tahfiz' | 'guru_wafa',
        is_active: true,
      })

    if (profileError) {
      await supabase.auth.admin.deleteUser(userData.user.id)
      return NextResponse.json(
        { success: false, error: 'Gagal membuat profil: ' + profileError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      user: { email, nama, role },
    })
  } catch (err) {
    console.error('register-user error:', err)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server.' },
      { status: 500 }
    )
  }
}
