// ============================================================
// app/guru/page.tsx
// Dashboard Guru — server component
// ============================================================

import { redirect }           from 'next/navigation'
import { getStaffSession }    from '@/lib/auth/staff'
import { createServiceClient } from '@/lib/supabase/server'
import { GuruDashboardClient } from './GuruDashboardClient'

export default async function GuruPage() {
  const session = await getStaffSession()
  if (!session) redirect('/login')
  if (session.role === 'admin') redirect('/admin')

  const supabase = createServiceClient()

  const { data: tahunAktif } = await supabase
    .from('tahun_ajaran')
    .select('id, nama')
    .eq('is_active', true)
    .single()

  // Filter by assigned classes only
  let totalSiswa = 0
  let totalKelas = 0
  let mutabaahToday = 0

  if (tahunAktif) {
    const { data: kelasSaya } = await supabase
      .from('kelas')
      .select('id')
      .eq('tahun_ajaran_id', tahunAktif.id)

    const kelasIds = kelasSaya?.map(k => k.id) ?? []
    totalKelas = kelasSaya?.length ?? 0
    const today = new Date().toISOString().split('T')[0]

    if (kelasIds.length > 0) {
      const { count: sCount } = await supabase
        .from('siswa_kelas')
        .select('*', { count: 'exact', head: true })
        .in('kelas_id', kelasIds)
        .eq('tahun_ajaran_id', tahunAktif.id)
      totalSiswa = sCount ?? 0

      const { data: siswaIds } = await supabase
        .from('siswa_kelas')
        .select('siswa_id')
        .in('kelas_id', kelasIds)
        .eq('tahun_ajaran_id', tahunAktif.id)

      const ids = siswaIds?.map(s => s.siswa_id) ?? []
      if (ids.length > 0) {
        const { count: mCount } = await supabase
          .from('mutabaah_log')
          .select('*', { count: 'exact', head: true })
          .in('siswa_id', ids)
          .eq('tanggal', today)
        mutabaahToday = mCount ?? 0
      }
    }
  }

  return (
    <GuruDashboardClient
      nama={session.nama}
      stats={{
        totalSiswa,
        totalKelas,
        tahunAktif:  tahunAktif?.nama ?? 'Belum ada',
        mutabaahToday,
      }}
    />
  )
}
