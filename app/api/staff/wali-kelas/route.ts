// ============================================================
// app/api/staff/wali-kelas/route.ts
// GET: Data dashboard wali kelas — status fill rate kelas hari ini
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { requireRole }               from '@/lib/auth/staff'
import { createServerClient }        from '@/lib/supabase/server'
import { getTodayWIB }               from '@/lib/utils/date'

export async function GET(request: NextRequest) {
  try {
    const session  = await requireRole(['wali_kelas', 'admin'])
    const supabase = await createServerClient()
    const { searchParams } = new URL(request.url)
    const tanggal  = searchParams.get('tanggal') ?? getTodayWIB()

    // Ambil tahun ajaran aktif
    const { data: tahunAjaran } = await supabase
      .from('tahun_ajaran')
      .select('id')
      .eq('is_active', true)
      .single()

    if (!tahunAjaran) return NextResponse.json({ siswaList: [], stats: null })

    // Ambil kelas wali kelas ini
    const { data: kelasList } = await supabase
      .from('kelas')
      .select('id, nama_kelas')
      .eq('wali_kelas_id', session.userId)
      .eq('tahun_ajaran_id', tahunAjaran.id)

    if (!kelasList || kelasList.length === 0) {
      return NextResponse.json({ siswaList: [], stats: null })
    }

    const kelasIds = kelasList.map(k => k.id)

    // Ambil semua siswa di kelas ini
    const { data: siswaKelas } = await supabase
      .from('siswa_kelas')
      .select(`
        siswa_id,
        kelas:kelas_id ( id, nama_kelas ),
        siswa:siswa_id ( id, nama_lengkap, photo_url, is_active )
      `)
      .in('kelas_id', kelasIds)
      .eq('tahun_ajaran_id', tahunAjaran.id)

    const aktivSiswa = (siswaKelas ?? []).filter((r: any) => r.siswa?.is_active)
    const siswaIds   = aktivSiswa.map((r: any) => r.siswa.id as string)

    // Ambil total item mutabaah aktif
    const { data: items } = await supabase
      .from('mutabaah_item')
      .select('id')
      .eq('tahun_ajaran_id', tahunAjaran.id)
      .eq('is_active', true)

    const totalItems = items?.length ?? 0

    // Ambil semua log hari ini untuk siswa ini
    const { data: logs } = await supabase
      .from('mutabaah_log')
      .select('siswa_id, is_checked')
      .in('siswa_id', siswaIds)
      .eq('tanggal', tanggal)

    // Hitung per siswa
    const logBySiswa = new Map<string, { total: number; checked: number }>()
    for (const log of logs ?? []) {
      const curr = logBySiswa.get(log.siswa_id) ?? { total: 0, checked: 0 }
      curr.total++
      if (log.is_checked) curr.checked++
      logBySiswa.set(log.siswa_id, curr)
    }

    // Tentukan status per siswa
    const siswaList = aktivSiswa.map((row: any) => {
      const stats   = logBySiswa.get(row.siswa.id)
      const checked = stats?.checked ?? 0
      const filled  = stats?.total   ?? 0

      let fillStatus: 'lengkap' | 'sebagian' | 'belum' = 'belum'
      if (filled > 0) {
        fillStatus = checked === totalItems ? 'lengkap' : 'sebagian'
      }

      const pct = totalItems > 0 ? Math.round((checked / totalItems) * 100) : 0

      return {
        siswaId:     row.siswa.id,
        namaLengkap: row.siswa.nama_lengkap,
        photoUrl:    row.siswa.photo_url,
        kelasId:     row.kelas.id,
        namaKelas:   row.kelas.nama_kelas,
        fillStatus,
        percentage:  pct,
        checkedCount: checked,
        totalItems,
      }
    }).sort((a: any, b: any) =>
      a.namaKelas.localeCompare(b.namaKelas) ||
      a.namaLengkap.localeCompare(b.namaLengkap)
    )

    // Stats ringkasan
    const sudahLengkap = siswaList.filter((s: any) => s.fillStatus === 'lengkap').length
    const sudahSebagian = siswaList.filter((s: any) => s.fillStatus === 'sebagian').length
    const belumIsi = siswaList.filter((s: any) => s.fillStatus === 'belum').length
    const totalSiswa = siswaList.length
    const avgPct = totalSiswa > 0
      ? Math.round(siswaList.reduce((s: number, r: any) => s + r.percentage, 0) / totalSiswa)
      : 0

    return NextResponse.json({
      siswaList,
      stats: {
        totalSiswa,
        sudahLengkap,
        sudahSebagian,
        belumIsi,
        avgPercentage: avgPct,
        tanggal,
        namaKelas: kelasList.map(k => k.nama_kelas).join(', '),
      },
    })
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      if (err.message === 'FORBIDDEN')    return NextResponse.json({ error: 'Forbidden' },    { status: 403 })
    }
    console.error('GET wali-kelas error:', err)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}
