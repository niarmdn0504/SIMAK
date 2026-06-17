// ============================================================
// app/api/admin/siswa/route.ts
// GET:  Daftar semua siswa (dengan filter)
// POST: Tambah siswa baru
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { requireRole }               from '@/lib/auth/staff'
import { createServerClient }        from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    await requireRole(['admin'])
    const supabase = await createServerClient()
    const { searchParams } = new URL(request.url)
    const search    = searchParams.get('search') ?? ''
    const kelasId   = searchParams.get('kelasId') ?? ''
    const tahunId   = searchParams.get('tahunId') ?? ''
    const isActive  = searchParams.get('isActive')

    // Base: semua siswa
    let query = supabase
      .from('siswa')
      .select('id, nisn, nama_lengkap, parent_name, parent_phone, photo_url, is_active, created_at')
      .order('nama_lengkap', { ascending: true })

    if (search) {
      query = query.or(`nama_lengkap.ilike.%${search}%,nisn.ilike.%${search}%`)
    }
    if (isActive !== null && isActive !== '') {
      query = query.eq('is_active', isActive === 'true')
    }

    const { data: siswaList, error } = await query
    if (error) throw error

    // Jika ada filter kelas/tahun, join via siswa_kelas
    if (kelasId || tahunId) {
      let skQuery = supabase
        .from('siswa_kelas')
        .select('siswa_id, kelas:kelas_id(id, nama_kelas), tahun_ajaran:tahun_ajaran_id(id, nama)')

      if (kelasId)  skQuery = skQuery.eq('kelas_id', kelasId)
      if (tahunId)  skQuery = skQuery.eq('tahun_ajaran_id', tahunId)

      const { data: skData } = await skQuery
      const validIds = new Set(skData?.map(r => r.siswa_id) ?? [])
      const filtered = (siswaList ?? []).filter(s => validIds.has(s.id))

      // Attach kelas info
      const skMap = new Map(skData?.map(r => [r.siswa_id, r]) ?? [])
      const result = filtered.map(s => ({
        ...s,
        kelas: (skMap.get(s.id)?.kelas as any)?.nama_kelas ?? null,
      }))
      return NextResponse.json(result)
    }

    // Attach kelas aktif untuk setiap siswa
    const { data: tahunAktif } = await supabase
      .from('tahun_ajaran').select('id').eq('is_active', true).single()

    if (tahunAktif) {
      const { data: skData } = await supabase
        .from('siswa_kelas')
        .select('siswa_id, kelas:kelas_id(id, nama_kelas)')
        .eq('tahun_ajaran_id', tahunAktif.id)

      const skMap = new Map(skData?.map(r => [r.siswa_id, r]) ?? [])
      const result = (siswaList ?? []).map(s => ({
        ...s,
        kelas:    (skMap.get(s.id)?.kelas as any)?.nama_kelas ?? null,
        kelas_id: (skMap.get(s.id)?.kelas as any)?.id ?? null,
      }))
      return NextResponse.json(result)
    }

    return NextResponse.json(siswaList ?? [])
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err instanceof Error && err.message === 'FORBIDDEN')    return NextResponse.json({ error: 'Forbidden' },    { status: 403 })
    console.error('GET /api/admin/siswa:', err)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole(['admin'])
    const supabase = await createServerClient()
    const body     = await request.json()
    const { nisn, namaLengkap, parentName, parentPhone, kelasId } = body

    if (!nisn || !namaLengkap) {
      return NextResponse.json({ error: 'NISN dan nama lengkap wajib diisi' }, { status: 400 })
    }
    if (!/^\d{10}$/.test(nisn)) {
      return NextResponse.json({ error: 'NISN harus 10 digit angka' }, { status: 400 })
    }

    // Cek NISN duplikat
    const { data: existing } = await supabase
      .from('siswa').select('id').eq('nisn', nisn).single()
    if (existing) {
      return NextResponse.json({ error: 'NISN sudah terdaftar' }, { status: 409 })
    }

    // Insert siswa
    const { data: newSiswa, error } = await supabase
      .from('siswa')
      .insert({ nisn, nama_lengkap: namaLengkap, parent_name: parentName || null, parent_phone: parentPhone || null })
      .select().single()
    if (error) throw error

    // Jika ada kelasId, assign ke kelas
    if (kelasId) {
      const { data: kelas } = await supabase
        .from('kelas').select('tahun_ajaran_id').eq('id', kelasId).single()
      if (kelas) {
        await supabase.from('siswa_kelas').insert({
          siswa_id: newSiswa.id, kelas_id: kelasId, tahun_ajaran_id: kelas.tahun_ajaran_id,
        })
      }
    }

    return NextResponse.json({ success: true, data: newSiswa })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err instanceof Error && err.message === 'FORBIDDEN')    return NextResponse.json({ error: 'Forbidden' },    { status: 403 })
    console.error('POST /api/admin/siswa:', err)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}
