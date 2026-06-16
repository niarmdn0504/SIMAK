// ============================================================
// app/api/auth/parent-logout/route.ts
// POST: Revoke session token + hapus cookie
// ============================================================

import { NextResponse }        from 'next/server'
import { cookies }              from 'next/headers'
import { createServiceClient }  from '@/lib/supabase/server'
import { PARENT_COOKIE_NAME }   from '@/lib/auth/parent'

export async function POST() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(PARENT_COOKIE_NAME)?.value

    if (token) {
      // Hapus dari DB (revoke)
      const supabase = createServiceClient()
      await supabase.rpc('revoke_parent_session', { p_token: token })
    }

    // Hapus cookie
    cookieStore.delete(PARENT_COOKIE_NAME)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
