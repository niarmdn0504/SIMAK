// ============================================================
// app/api/auth/parent-session/route.ts
// GET: Cek apakah session orang tua masih valid
// ============================================================

import { NextResponse }       from 'next/server'
import { getParentSession }   from '@/lib/auth/parent'

export async function GET() {
  const session = await getParentSession()

  if (!session) {
    return NextResponse.json({ valid: false }, { status: 401 })
  }

  return NextResponse.json({
    valid:     true,
    siswaId:   session.siswaId,
    siswaName: session.siswaName,
  })
}
