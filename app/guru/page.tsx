// ============================================================
// app/guru/page.tsx
// Dashboard Guru — server component
// ============================================================

import { redirect }           from 'next/navigation'
import { getStaffSession }    from '@/lib/auth/staff'
import { createServerClient } from '@/lib/supabase/server'
import { GuruDashboardClient } from './GuruDashboardClient'

export default async function GuruPage() {
  const session = await getStaffSession()
  if (!session) redirect('/login')
  if (session.role === 'admin') redirect('/admin')

  const supabase = await createServerClient()

  const { data: tahunAktif } = await supabase
    .from('tahun_ajaran')
    .select('id, nama')
    .eq('is_active', true)
    .single()

  const { count: totalSiswa } = await supabase
    .from('siswa')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  const { count: totalKelas } = await supabase
    .from('kelas')
    .select('*', { count: 'exact', head: true })

  const today = new Date().toISOString().split('T')[0]
  let mutabaahToday = 0
  if (tahunAktif) {
    const { count } = await supabase
      .from('mutabaah_log')
      .select('*', { count: 'exact', head: true })
      .eq('tanggal', today)
    mutabaahToday = count ?? 0
  }

  return (
    <GuruDashboardClient
      nama={session.nama}
      stats={{
        totalSiswa:  totalSiswa ?? 0,
        totalKelas:  totalKelas ?? 0,
        tahunAktif:  tahunAktif?.nama ?? 'Belum ada',
        mutabaahToday,
      }}
    />
  )
}
