// ============================================================
// app/guru/wali-kelas/[siswaId]/page.tsx
// Detail mutabaah satu siswa — read only untuk wali kelas
// ============================================================

import { redirect }           from 'next/navigation'
import { getStaffSession }    from '@/lib/auth/staff'
import { createServerClient } from '@/lib/supabase/server'
import { WaliKelasSiswaClient } from '@/components/wali-kelas/WaliKelasSiswaClient'
import { getTodayWIB, getLockedAfter } from '@/lib/utils/date'

interface Props {
  params: Promise<{ siswaId: string }>
}

export default async function GuruWaliKelasSiswaPage({ params }: Props) {
  const session = await getStaffSession()
  if (!session) redirect('/login')
  if (!session.roles.includes('wali_kelas') && session.role !== 'admin') redirect('/guru')

  const { siswaId } = await params
  const supabase    = await createServerClient()

  const { data: siswa } = await supabase
    .from('siswa')
    .select('id, nama_lengkap, nisn, photo_url, parent_name, parent_phone')
    .eq('id', siswaId)
    .single()

  if (!siswa) redirect('/guru/wali-kelas')

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

  const { data: items } = tahunAjaran
    ? await supabase
        .from('mutabaah_item')
        .select('id, nama_item, urutan')
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

  const mutabaahItems = (items ?? []).map(item => ({
    id:         item.id,
    nama_item:  item.nama_item,
    is_checked: logMap.get(item.id) ?? false,
  }))

  const checked    = mutabaahItems.filter(i => i.is_checked).length
  const percentage = mutabaahItems.length > 0
    ? Math.round((checked / mutabaahItems.length) * 100)
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
      mutabaahItems={mutabaahItems}
      percentage={percentage}
      isLocked={isLocked}
      tanggal={tanggal}
      tahfizLast={tahfizLast ?? null}
      wafaLast={wafaLast ?? null}
      backHref="/guru/wali-kelas"
    />
  )
}
