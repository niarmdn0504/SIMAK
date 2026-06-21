// ============================================================
// app/api/admin/mutabaah-items/route.ts
// GET:  Item mutabaah per tahun ajaran
// POST: Tambah item baru (supports parent + subItems array)
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

// Helper — insert satu item, return data atau throw
async function insertMutabaahItem(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  payload: { nama_item: string; tahun_ajaran_id: string; parent_id: string | null; urutan: number },
) {
  const { data, error } = await supabase
    .from('mutabaah_item')
    .insert(payload)
    .select()
    .single()
  if (error) {
    if (error.code === '23505') throw new Error('DUPLICATE_ITEM')
    throw error
  }
  return data
}

export async function POST(request: NextRequest) {
  try {
    await requireRole(['admin'])
    const supabase = await createServerClient()
    const body     = await request.json()
    const { namaItem, tahunAjaranId, parentId, subItems } = body as {
      namaItem:       string
      tahunAjaranId:  string
      parentId:       string | null
      subItems?:      string[]
    }

    if (!namaItem?.trim() || !tahunAjaranId) {
      return NextResponse.json({ error: 'Nama item dan tahun ajaran wajib diisi' }, { status: 400 })
    }

    // Validasi hierarki: max 2 level (parent → child)
    if (parentId) {
      // Cek parent-nya punya parent_id atau tidak
      const { data: parent } = await supabase
        .from('mutabaah_item')
        .select('parent_id')
        .eq('id', parentId)
        .single()
      if (!parent) return NextResponse.json({ error: 'Item induk tidak ditemukan' }, { status: 404 })
      if (parent.parent_id) {
        return NextResponse.json({ error: 'Maksimal 2 level hierarki (Induk → Sub)' }, { status: 400 })
      }
    }

    // Cek duplikat nama dalam parent & tahun ajaran yang sama
    let dupQuery = supabase
      .from('mutabaah_item')
      .select('id')
      .eq('nama_item', namaItem.trim())
      .eq('tahun_ajaran_id', tahunAjaranId)

    if (parentId) {
      dupQuery = dupQuery.eq('parent_id', parentId)
    } else {
      dupQuery = dupQuery.is('parent_id', null)
    }

    const { data: existing } = await dupQuery.maybeSingle()
    if (existing) {
      return NextResponse.json({ error: 'Nama item sudah ada di tingkat ini' }, { status: 409 })
    }

    // Ambil urutan tertinggi (use maybeSingle to handle empty)
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

    const { data: lastItem } = await urutanQuery.maybeSingle()
    let nextUrutan = (lastItem?.urutan ?? 0) + 1

    // Insert parent item
    const newItem = await insertMutabaahItem(supabase, {
      nama_item:       namaItem.trim(),
      tahun_ajaran_id: tahunAjaranId,
      parent_id:       parentId || null,
      urutan:          nextUrutan,
    })

    // Insert sub-items if provided (batch — parent_id guaranteed correct)
    let createdSubCount = 0
    if (parentId === null && Array.isArray(subItems) && subItems.length > 0) {
      for (const sub of subItems) {
        if (!sub?.trim()) continue
        nextUrutan++
        try {
          await insertMutabaahItem(supabase, {
            nama_item:       sub.trim(),
            tahun_ajaran_id: tahunAjaranId,
            parent_id:       newItem.id,
            urutan:          nextUrutan,
          })
          createdSubCount++
        } catch {
          // If a sub fails, we still return success with partial count
        }
      }
    }

    const msg = createdSubCount > 0
      ? `Item ditambahkan dengan ${createdSubCount} sub item`
      : 'Item berhasil ditambahkan'

    return NextResponse.json({ success: true, data: newItem, message: msg })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED')     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err instanceof Error && err.message === 'FORBIDDEN')        return NextResponse.json({ error: 'Forbidden' },    { status: 403 })
    if (err instanceof Error && err.message === 'DUPLICATE_ITEM')   return NextResponse.json({ error: 'Item sudah ada di tahun ajaran ini' }, { status: 409 })
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}
