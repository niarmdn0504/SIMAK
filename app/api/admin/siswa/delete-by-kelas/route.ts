import { NextRequest, NextResponse } from 'next/server'
import { requireRole }               from '@/lib/auth/staff'
import { createServiceClient }       from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    await requireRole(['admin'])
    const supabase = createServiceClient()
    const { kelasId } = await request.json()

    if (!kelasId) return NextResponse.json({ error: 'kelasId wajib' }, { status: 400 })

    // Ambil semua siswa di kelas ini
    const { data: siswaKelas } = await supabase
      .from('siswa_kelas')
      .select('siswa_id')
      .eq('kelas_id', kelasId)

    if (!siswaKelas || siswaKelas.length === 0) {
      return NextResponse.json({ success: true, deleted: 0 })
    }

    const siswaIds = siswaKelas.map(sk => sk.siswa_id)

    // Hard delete siswa_kelas dulu
    await supabase.from('siswa_kelas').delete().eq('kelas_id', kelasId)

    // Hard delete siswa
    const { error } = await supabase
      .from('siswa')
      .delete()
      .in('id', siswaIds)

    if (error) throw error

    return NextResponse.json({ success: true, deleted: siswaIds.length })
  } catch (err: unknown) {
    console.error('delete-by-kelas error:', err)
    if (err instanceof Error && err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err instanceof Error && err.message === 'FORBIDDEN')    return NextResponse.json({ error: 'Forbidden' },    { status: 403 })
    return NextResponse.json({ error: 'Gagal menghapus' }, { status: 500 })
  }
}
