// ============================================================
// app/(parent)/dashboard/page.tsx
// Dashboard orang tua — Server Component untuk initial data fetch
// ============================================================

import { getParentSession }  from '@/lib/auth/parent'
import { createServiceClient } from '@/lib/supabase/server'
import { getTodayWIB, getLockedAfter, formatTanggal } from '@/lib/utils/date'
import { DashboardClient }   from './DashboardClient'
import type { MutabaahDayData } from '@/lib/types/app'
import { redirect }          from 'next/navigation'

export default async function DashboardPage() {
  const session = await getParentSession()
  if (!session) redirect('/login')

  const supabase = createServiceClient()
  const tanggal  = getTodayWIB()

  // Fetch tahun ajaran aktif
  const { data: tahunAjaran } = await supabase
    .from('tahun_ajaran')
    .select('id')
    .eq('is_active', true)
    .single()

  let initialMutabaah: MutabaahDayData = {
    tanggal,
    items:      [],
    percentage: 0,
    is_locked:  false,
  }

  if (tahunAjaran) {
    // Fetch item mutabaah aktif
    const { data: items } = await supabase
      .from('mutabaah_item')
      .select('id, nama_item, urutan')
      .eq('tahun_ajaran_id', tahunAjaran.id)
      .eq('is_active', true)
      .order('urutan', { ascending: true })

    // Fetch log hari ini
    const { data: logs } = await supabase
      .from('mutabaah_log')
      .select('item_id, is_checked')
      .eq('siswa_id', session.siswaId)
      .eq('tanggal', tanggal)

    const lockedAfter = getLockedAfter(tanggal)
    const isLocked    = new Date() > new Date(lockedAfter)
    const logMap      = new Map(logs?.map(l => [l.item_id, l.is_checked]) ?? [])

    const itemsWithStatus = (items ?? []).map(item => ({
      id:         item.id,
      nama_item:  item.nama_item,
      urutan:     item.urutan,
      is_checked: logMap.get(item.id) ?? false,
      is_locked:  isLocked,
    }))

    const checked    = itemsWithStatus.filter(i => i.is_checked).length
    const percentage = itemsWithStatus.length > 0
      ? Math.round((checked / itemsWithStatus.length) * 100)
      : 0

    initialMutabaah = {
      tanggal,
      items:      itemsWithStatus,
      percentage,
      is_locked:  isLocked,
    }
  }

  // Fetch summary tahfiz terakhir
  const { data: tahfizLast } = await supabase
    .from('tahfiz_log')
    .select('surah, ayat_awal, ayat_akhir, status, tanggal')
    .eq('siswa_id', session.siswaId)
    .order('tanggal', { ascending: false })
    .limit(1)
    .single()

  // Fetch summary wafa terakhir
  const { data: wafaLast } = await supabase
    .from('wafa_log')
    .select('jilid, halaman, status, tanggal')
    .eq('siswa_id', session.siswaId)
    .order('tanggal', { ascending: false })
    .limit(1)
    .single()

  return (
    <DashboardClient
      siswaName={session.siswaName}
      tanggalLabel={formatTanggal(tanggal)}
      initialMutabaah={initialMutabaah}
      tahfizLast={tahfizLast ?? null}
      wafaLast={wafaLast ?? null}
    />
  )
}
