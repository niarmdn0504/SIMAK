// ============================================================
// app/api/admin/mutabaah-items/route.ts
// GET:  Item mutabaah per tahun ajaran
// POST: Tambah item baru
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { requireRole }               from '@/lib/auth/staff'
import { createServerClient }        from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    await requireRole(['admin'])
    const supabase = await createServerClient()
    const { searchParams } = new URL(request.url)
    const tahunId = searchParams.get('tahunId')

    let query = supabase
      .from('mutabaah_item')
      .select('id, nama_item, parent_id, urutan, is_active, tahun_ajaran_id, tahun_ajaran:tahun_ajaran_id(nama)')
      .order('urutan', { ascending: true })

    if (tahunId) query = query.eq('tahun_ajaran_id', tahunId)

    const { data, error } = await query
    if (error) throw error

    // Tambah jumlah kelas yang menggunakan tiap item
    const itemIds = (data ?? []).map(i => i.id)
    let kelasCountMap = new Map<string, number>()
    if (itemIds.length > 0) {
      const { data: kelasItems } = await supabase
        .from('kelas_mutabaah_item')
        .select('mutabaah_item_id')
        .in('mutabaah_item_id', itemIds)
      if (kelasItems) {
        for (const ki of kelasItems) {
          kelasCountMap.set(ki.mutabaah_item_id, (kelasCountMap.get(ki.mutabaah_item_id) ?? 0) + 1)
        }
      }
    }

    const result = (data ?? []).map(i => ({
      ...i,
      jumlah_kelas: kelasCountMap.get(i.id) ?? 0,
    }))

    return NextResponse.json(result)
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
    const { namaItem, tahunAjaranId, parentId } = body

    if (!namaItem?.trim() || !tahunAjaranId) {
      return NextResponse.json({ error: 'Nama item dan tahun ajaran wajib diisi' }, { status: 400 })
    }

    // Ambil urutan tertinggi
    let urutanQuery = supabase
      .from('mutabaah_item')
      .select('urutan')
      .eq('tahun_ajaran_id', tahunAjaranId)
      .order('urutan', { ascending: false })
      .limit(1)

    if (parentId) {
      urutanQuery = urutanQuery.eq('parent_id', parentId)
    } else {
      urutanQuery = urutanQuery.is('parent_id', null)
    }

    const { data: lastItem } = await urutanQuery.single()

    const nextUrutan = (lastItem?.urutan ?? 0) + 1

    const { data, error } = await supabase
      .from('mutabaah_item')
      .insert({ nama_item: namaItem.trim(), tahun_ajaran_id: tahunAjaranId, parent_id: parentId || null, urutan: nextUrutan })
      .select().single()

    if (error) {
      if (error.code === '23505') return NextResponse.json({ error: 'Item sudah ada di tahun ajaran ini' }, { status: 409 })
      throw error
    }
    return NextResponse.json({ success: true, data })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err instanceof Error && err.message === 'FORBIDDEN')    return NextResponse.json({ error: 'Forbidden' },    { status: 403 })
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}
