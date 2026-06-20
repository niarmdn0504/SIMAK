import { NextRequest, NextResponse } from 'next/server'
import { requireStaffSession }       from '@/lib/auth/staff'
import { createServiceClient }       from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const session  = await requireStaffSession()
    const supabase = createServiceClient()
    const { searchParams } = new URL(request.url)
    const kelasId = searchParams.get('kelasId')

    if (!kelasId) {
      return NextResponse.json({ error: 'kelasId diperlukan' }, { status: 400 })
    }

    // Ambil item IDs yang aktif untuk kelas ini
    const { data: aktif } = await supabase
      .from('kelas_mutabaah_item')
      .select('mutabaah_item_id')
      .eq('kelas_id', kelasId)

    const activeIds = new Set(aktif?.map(r => r.mutabaah_item_id) ?? [])

    // Ambil semua master item
    const { data: tahunAjaran } = await supabase
      .from('tahun_ajaran')
      .select('id')
      .eq('is_active', true)
      .single()

    if (!tahunAjaran) {
      return NextResponse.json({ items: [], activeIds: [] })
    }

    const { data: allItems } = await supabase
      .from('mutabaah_item')
      .select('id, nama_item, parent_id, urutan')
      .eq('tahun_ajaran_id', tahunAjaran.id)
      .eq('is_active', true)
      .order('urutan', { ascending: true })

    return NextResponse.json({
      items: allItems ?? [],
      activeIds: Array.from(activeIds),
    })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err instanceof Error && err.message === 'FORBIDDEN')    return NextResponse.json({ error: 'Forbidden' },    { status: 403 })
    console.error('GET kelas-mutabaah-items error:', err)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session  = await requireStaffSession()
    const supabase = createServiceClient()
    const body     = await request.json()
    const { kelasId, itemIds }: { kelasId: string; itemIds: string[] } = body

    if (!kelasId || !Array.isArray(itemIds)) {
      return NextResponse.json({ error: 'kelasId dan itemIds wajib' }, { status: 400 })
    }

    // Hapus semua yang lama, insert yang baru
    const { error: delErr } = await supabase
      .from('kelas_mutabaah_item')
      .delete()
      .eq('kelas_id', kelasId)

    if (delErr) throw delErr

    if (itemIds.length > 0) {
      const { error: insErr } = await supabase
        .from('kelas_mutabaah_item')
        .insert(itemIds.map(itemId => ({ kelas_id: kelasId, mutabaah_item_id: itemId })))

      if (insErr) throw insErr
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err instanceof Error && err.message === 'FORBIDDEN')    return NextResponse.json({ error: 'Forbidden' },    { status: 403 })
    console.error('PUT kelas-mutabaah-items error:', err)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}
