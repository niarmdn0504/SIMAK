// ============================================================
// app/api/parent/wafa/route.ts
// GET: Riwayat wafa anak (read-only untuk orang tua)
// ============================================================

import { NextResponse }          from 'next/server'
import { requireParentSession }  from '@/lib/auth/parent'
import { createServiceClient }   from '@/lib/supabase/server'

export async function GET() {
  try {
    const session  = await requireParentSession()
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('wafa_log')
      .select('id, tanggal, jilid, halaman, status, catatan, created_at')
      .eq('siswa_id', session.siswaId)
      .order('tanggal', { ascending: false })
      .limit(20)

    if (error) throw error

    return NextResponse.json(data ?? [])
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Sesi tidak valid' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}
