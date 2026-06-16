// ============================================================
// app/api/admin/kenaikan-kelas/route.ts
// GET:  Preview simulasi kenaikan kelas
// POST: Eksekusi kenaikan kelas (bulk insert siswa_kelas)
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { requireRole }               from '@/lib/auth/staff'
import { createServerClient }        from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    await requireRole(['admin'])
    const supabase = await createServerClient()
    const { searchParams } = new URL(request.url)
    const tahunAsal   = searchParams.get('tahunAsal')
    const tahunTujuan = searchParams.get('tahunTujuan')

    if (!tahunAsal || !tahunTujuan) {
      return NextResponse.json({ error: 'tahunAsal dan tahunTujuan diperlukan' }, { status: 400 })
    }

    // Ambil semua siswa di tahun asal beserta kelasnya
    const { data: siswaAsal } = await supabase
      .from('siswa_kelas')
      .select('siswa_id, kelas:kelas_id(id, nama_kelas), siswa:siswa_id(id, nisn, nama_lengkap, is_active)')
      .eq('tahun_ajaran_id', tahunAsal)

    // Ambil kelas yang tersedia di tahun tujuan
    const { data: kelasTujuan } = await supabase
      .from('kelas')
      .select('id, nama_kelas')
      .eq('tahun_ajaran_id', tahunTujuan)
      .order('nama_kelas')

    // Cek siswa yang sudah ada di tahun tujuan
    const { data: sudahAda } = await supabase
      .from('siswa_kelas')
      .select('siswa_id')
      .eq('tahun_ajaran_id', tahunTujuan)
    const sudahAdaSet = new Set(sudahAda?.map(r => r.siswa_id) ?? [])

    const preview = (siswaAsal ?? [])
      .filter((r: any) => r.siswa?.is_active)
      .map((r: any) => ({
        siswaId:     r.siswa.id,
        nisn:        r.siswa.nisn,
        namaLengkap: r.siswa.nama_lengkap,
        kelasAsal:   (r.kelas as any)?.nama_kelas ?? '-',
        sudahDiTujuan: sudahAdaSet.has(r.siswa.id),
      }))

    return NextResponse.json({
      preview,
      totalSiswa:    preview.length,
      belumDiTujuan: preview.filter(p => !p.sudahDiTujuan).length,
      kelasTujuan:   kelasTujuan ?? [],
    })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err instanceof Error && err.message === 'FORBIDDEN')    return NextResponse.json({ error: 'Forbidden' },    { status: 403 })
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole(['admin'])
    const supabase = await createServerClient()
    const body     = await request.json()

    // mapping: [ { siswaId, kelasIdTujuan } ]
    const { tahunTujuan, mapping } = body as {
      tahunTujuan: string
      mapping: Array<{ siswaId: string; kelasIdTujuan: string }>
    }

    if (!tahunTujuan || !mapping?.length) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    // Validasi kelas milik tahun tujuan
    const { data: kelasTujuan } = await supabase
      .from('kelas').select('id').eq('tahun_ajaran_id', tahunTujuan)
    const validKelasIds = new Set(kelasTujuan?.map(k => k.id) ?? [])

    const invalid = mapping.filter(m => !validKelasIds.has(m.kelasIdTujuan))
    if (invalid.length > 0) {
      return NextResponse.json({ error: 'Beberapa kelas tujuan tidak valid' }, { status: 400 })
    }

    // Cek duplikat (siswa yang sudah ada di tahun tujuan)
    const siswaIds = mapping.map(m => m.siswaId)
    const { data: existing } = await supabase
      .from('siswa_kelas')
      .select('siswa_id')
      .eq('tahun_ajaran_id', tahunTujuan)
      .in('siswa_id', siswaIds)
    const existingSet = new Set(existing?.map(r => r.siswa_id) ?? [])

    const toInsert = mapping
      .filter(m => !existingSet.has(m.siswaId))
      .map(m => ({
        siswa_id:        m.siswaId,
        kelas_id:        m.kelasIdTujuan,
        tahun_ajaran_id: tahunTujuan,
      }))

    if (toInsert.length === 0) {
      return NextResponse.json({ success: true, inserted: 0, message: 'Semua siswa sudah ada di tahun tujuan' })
    }

    const { error } = await supabase.from('siswa_kelas').insert(toInsert)
    if (error) throw error

    return NextResponse.json({ success: true, inserted: toInsert.length, skipped: existingSet.size })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err instanceof Error && err.message === 'FORBIDDEN')    return NextResponse.json({ error: 'Forbidden' },    { status: 403 })
    console.error('POST /api/admin/kenaikan-kelas:', err)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}
