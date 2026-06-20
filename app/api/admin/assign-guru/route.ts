import { NextRequest, NextResponse } from 'next/server'
import { requireRole }               from '@/lib/auth/staff'
import { createServerClient }        from '@/lib/supabase/server'

export async function GET() {
  try {
    const session = await requireRole(['admin'])
    const supabase = await createServerClient()

    const [kelasRes, guruRes, tahunAjaranRes] = await Promise.all([
      supabase.from('kelas').select('id, nama_kelas, tahun_ajaran_id, wali_kelas_id').order('nama_kelas'),
      supabase.from('user_profile').select('id, nama, role').neq('role', 'admin').order('nama'),
      supabase.from('tahun_ajaran').select('id, nama').order('nama'),
    ])

    return NextResponse.json({
      kelas:     kelasRes.data ?? [],
      guru:      guruRes.data ?? [],
      tahunAjaran: tahunAjaranRes.data ?? [],
    })
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      if (err.message === 'FORBIDDEN')    return NextResponse.json({ error: 'Forbidden' },    { status: 403 })
    }
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(['admin'])
    const supabase = await createServerClient()
    const { kelasId, guruId } = await request.json()

    if (!kelasId) {
      return NextResponse.json({ error: 'Pilih kelas' }, { status: 400 })
    }

    const { error } = await supabase
      .from('kelas')
      .update({ wali_kelas_id: guruId || null })
      .eq('id', kelasId)

    if (error) throw error

    // Get updated data after successful assignment
    const [kelasRes, guruRes, tahunAjaranRes] = await Promise.all([
      supabase.from('kelas').select('id, nama_kelas, tahun_ajaran_id, wali_kelas_id').order('nama_kelas'),
      supabase.from('user_profile').select('id, nama, role').neq('role', 'admin').order('nama'),
      supabase.from('tahun_ajaran').select('id, nama').order('nama'),
    ])

    return NextResponse.json({
      success: true,
      kelas:     kelasRes.data ?? [],
      guru:      guruRes.data ?? [],
      tahunAjaran: tahunAjaranRes.data ?? [],
    })
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      if (err.message === 'FORBIDDEN')    return NextResponse.json({ error: 'Forbidden' },    { status: 403 })
    }
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}
