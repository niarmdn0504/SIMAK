// ============================================================
// app/guru/page.tsx
// Dashboard Guru — server component (per-class cards)
// ============================================================

import { redirect }            from 'next/navigation'
import { getStaffSession }     from '@/lib/auth/staff'
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

  let kelasCards: Array<{
    kelasId: string
    namaKelas: string
    jumlahSiswa: number
    mutabaahToday: number
    totalItems: number
    checkedItems: number
  }> = []
  let totalSiswa = 0
  let totalKelas = 0
  let mutabaahToday = 0

  if (tahunAktif) {
    // Get assigned classes
    const { data: kelasSaya } = await supabase
      .from('kelas')
      .select('id, nama_kelas')
      .eq('tahun_ajaran_id', tahunAktif.id)
      .eq('wali_kelas_id', session.userId)

    const kelasList = kelasSaya ?? []
    totalKelas = kelasList.length

    const today = new Date().toISOString().split('T')[0]

    for (const kelas of kelasList) {
      // Count students in this class
      const { count: sCount } = await supabase
        .from('siswa_kelas')
        .select('*', { count: 'exact', head: true })
        .eq('kelas_id', kelas.id)
        .eq('tahun_ajaran_id', tahunAktif.id)

      const jumlahSiswa = sCount ?? 0
      totalSiswa += jumlahSiswa

      // Get student IDs in this class
      const { data: siswaIds } = await supabase
        .from('siswa_kelas')
        .select('siswa_id')
        .eq('kelas_id', kelas.id)
        .eq('tahun_ajaran_id', tahunAktif.id)

      const ids = siswaIds?.map(s => s.siswa_id) ?? []

      // Count mutabaah logs today for these students
      let kelasMutabaahToday = 0
      if (ids.length > 0) {
        const { count: mCount } = await supabase
          .from('mutabaah_log')
          .select('*', { count: 'exact', head: true })
          .in('siswa_id', ids)
          .eq('tanggal', today)
        kelasMutabaahToday = mCount ?? 0
      }

      mutabaahToday += kelasMutabaahToday

      // Get active items for this class
      const { data: activeItems } = await supabase
        .from('kelas_mutabaah_item')
        .select('mutabaah_item_id')
        .eq('kelas_id', kelas.id)

      const totalItems = activeItems?.length ?? 0

      kelasCards.push({
        kelasId: kelas.id,
        namaKelas: kelas.nama_kelas,
        jumlahSiswa,
        mutabaahToday: kelasMutabaahToday,
        totalItems,
        checkedItems: 0,
      })
    }
  }

  return (
    <GuruDashboardClient
      nama={session.nama}
      stats={{
        totalSiswa,
        totalKelas,
        tahunAktif: tahunAktif?.nama ?? 'Belum ada',
        mutabaahToday,
      }}
      kelasCards={kelasCards}
    />
  )
}
