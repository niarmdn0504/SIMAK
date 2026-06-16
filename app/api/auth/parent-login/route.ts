// ============================================================
// app/api/auth/parent-login/route.ts
// POST: Verifikasi NISN → buat session token → set HttpOnly cookie
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { cookies }                    from 'next/headers'
import { createServiceClient }        from '@/lib/supabase/server'
import { PARENT_COOKIE_NAME }         from '@/lib/auth/parent'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const nisn = String(body.nisn ?? '').trim()

    // Validasi format NISN di sisi server juga
    if (!/^\d{10}$/.test(nisn)) {
      return NextResponse.json(
        { success: false, error: 'Format NISN tidak valid. NISN harus 10 digit angka.' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Panggil SECURITY DEFINER function — verifikasi NISN & buat token
    const { data, error } = await supabase.rpc('create_parent_session', {
      p_nisn: nisn,
    })

    if (error) {
      console.error('create_parent_session error:', error)
      return NextResponse.json(
        { success: false, error: 'Terjadi kesalahan. Silakan coba lagi.' },
        { status: 500 }
      )
    }

    const result = data?.[0]

    if (!result?.success || !result.token) {
      // Pesan generik — jangan beritahu apakah NISN ada atau tidak
      return NextResponse.json(
        { success: false, error: result?.error_msg ?? 'NISN tidak ditemukan.' },
        { status: 401 }
      )
    }

    // Set HttpOnly cookie — tidak bisa diakses via JavaScript
    const cookieStore = await cookies()
    cookieStore.set(PARENT_COOKIE_NAME, result.token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:   60 * 60 * 24 * 30, // 30 hari
      path:     '/',
    })

    return NextResponse.json({
      success:   true,
      siswaName: result.nama,
    })
  } catch (err) {
    console.error('parent-login error:', err)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server.' },
      { status: 500 }
    )
  }
}
