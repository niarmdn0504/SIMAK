// ============================================================
// lib/auth/parent.ts
// Helper untuk autentikasi orang tua via parent_sessions
// Digunakan di API Routes dan middleware
// ============================================================

import { cookies }              from 'next/headers'
import { createServiceClient }  from '@/lib/supabase/server'
import type { ParentSessionData } from '@/lib/types/app'

export const PARENT_COOKIE_NAME = 'simak_parent_token'

// -----------------------------------------------------------
// getParentSession
// Baca cookie token → verifikasi ke DB → return siswa data
// Return null jika token tidak valid / expired
// -----------------------------------------------------------
export async function getParentSession(): Promise<ParentSessionData | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(PARENT_COOKIE_NAME)?.value

  if (!token) return null

  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase.rpc('verify_parent_session', {
      p_token: token,
    })

    if (error || !data || data.length === 0) return null

    const result = data[0]
    if (!result.valid || !result.siswa_id || !result.nama) return null

    return {
      siswaId:   result.siswa_id,
      siswaName: result.nama,
    }
  } catch {
    return null
  }
}

// -----------------------------------------------------------
// requireParentSession
// Sama dengan getParentSession tapi throw jika tidak ada
// Gunakan di API Routes yang wajib terautentikasi
// -----------------------------------------------------------
export async function requireParentSession(): Promise<ParentSessionData> {
  const session = await getParentSession()
  if (!session) {
    throw new Error('UNAUTHORIZED')
  }
  return session
}

// -----------------------------------------------------------
// clearParentSession
// Hapus cookie (sisi server) — dipakai saat logout
// -----------------------------------------------------------
export async function clearParentCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(PARENT_COOKIE_NAME)
}
