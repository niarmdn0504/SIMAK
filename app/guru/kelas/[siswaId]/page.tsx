import { redirect }           from 'next/navigation'
import { getStaffSession }    from '@/lib/auth/staff'
import { createServerClient } from '@/lib/supabase/server'
import { WaliKelasSiswaClient } from '@/components/wali-kelas/WaliKelasSiswaClient'
import { getTodayWIB, getLockedAfter } from '@/lib/utils/date'

interface Props {
  params: Promise<{ siswaId: string }>
}

interface MutabaahItemWithChildren {
  id:         string
  nama_item:  string
  urutan:     number
  is_checked: boolean
  parent_id:  string | null
  children:   MutabaahItemWithChildren[]
}

export default async function GuruKelasSiswaPage({ params }: Props) {
  const session = await getStaffSession()
  if (!session) redirect('/login')
  if (session.role === 'admin') redirect('/admin')

  const { siswaId } = await params
  const supabase    = await createServerClient()

  const { data: siswa } = await supabase
    .from('siswa')
    .select('id, nama_lengkap, nisn, photo_url, parent_name, parent_phone')
    .eq('id', siswaId)
    .single()

  if (!siswa) redirect('/guru/kelas')

  const { data: tahunAjaran } = await supabase
    .from('tahun_ajaran')
    .select('id')
    .eq('is_active', true)
    .single()

  let namaKelas = '-'
  if (tahunAjaran) {
    const { data: kelasData } = await supabase
      .from('siswa_kelas')
      .select('kelas:kelas_id ( nama_kelas )')
      .eq('siswa_id', siswaId)
      .eq('tahun_ajaran_id', tahunAjaran.id)
      .single()
    namaKelas = (kelasData?.kelas as any)?.nama_kelas ?? '-'
  }

  const tanggal = getTodayWIB()

  // Fetch items with parent_id
  const { data: items } = tahunAjaran
    ? await supabase
        .from('mutabaah_item')
        .select('id, nama_item, urutan, parent_id')
        .eq('tahun_ajaran_id', tahunAjaran.id)
        .eq('is_active', true)
        .order('urutan', { ascending: true })
    : { data: [] }

  const { data: logs } = await supabase
    .from('mutabaah_log')
    .select('item_id, is_checked')
    .eq('siswa_id', siswaId)
    .eq('tanggal', tanggal)

  const logMap = new Map(logs?.map(l => [l.item_id, l.is_checked]) ?? [])
  const isLocked = new Date() > new Date(getLockedAfter(tanggal))

  // Map to items with status
  const allItems: MutabaahItemWithChildren[] = (items ?? []).map(item => ({
    id:         item.id,
    nama_item:  item.nama_item,
    urutan:     item.urutan,
    is_checked: logMap.get(item.id) ?? false,
    parent_id:  item.parent_id ?? null,
    children:   [],
  }))

  // Build hierarchy
  const parentItems = allItems.filter(i => !i.parent_id)
  const childItems  = allItems.filter(i => i.parent_id)
  for (const parent of parentItems) {
    parent.children = childItems.filter(c => c.parent_id === parent.id)
  }
  const hierarchicalItems = parentItems.map(p => ({
    ...p,
    children: p.children,
  }))

  // Count leaf items only
  const leafItems    = hierarchicalItems.flatMap(p => p.children.length > 0 ? p.children : [p])
  const checked      = leafItems.filter(i => i.is_checked).length
  const percentage   = leafItems.length > 0
    ? Math.round((checked / leafItems.length) * 100)
    : 0

  const { data: tahfizLast } = await supabase
    .from('tahfiz_log')
    .select('surah, ayat_awal, ayat_akhir, status, tanggal')
    .eq('siswa_id', siswaId)
    .order('tanggal', { ascending: false })
    .limit(1)
    .single()

  const { data: wafaLast } = await supabase
    .from('wafa_log')
    .select('jilid, halaman, status, tanggal')
    .eq('siswa_id', siswaId)
    .order('tanggal', { ascending: false })
    .limit(1)
    .single()

  return (
    <WaliKelasSiswaClient
      siswa={{ ...siswa, nama_kelas: namaKelas }}
      mutabaahItems={hierarchicalItems}
      percentage={percentage}
      isLocked={isLocked}
      tanggal={tanggal}
      tahfizLast={tahfizLast ?? null}
      wafaLast={wafaLast ?? null}
      backHref="/guru/kelas"
    />
  )
}
