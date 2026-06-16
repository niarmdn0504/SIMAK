// ============================================================
// app/(staff)/admin/page.tsx
// Dashboard Admin — server component
// ============================================================

import { redirect }           from 'next/navigation'
import { getStaffSession }    from '@/lib/auth/staff'
import { createServerClient } from '@/lib/supabase/server'
import { AdminDashboardClient } from './AdminDashboardClient'

export default async function AdminPage() {
  const session = await getStaffSession()
  if (!session) redirect('/login')
  if (session.role !== 'admin') redirect('/login')

  const supabase = await createServerClient()

  const [
    { count: totalSiswa },
    { count: totalStaff },
    { data: tahunAktif },
    { count: totalKelas },
  ] = await Promise.all([
    supabase.from('siswa').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('user_profile').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('tahun_ajaran').select('id, nama').eq('is_active', true).single(),
    supabase.from('kelas').select('*', { count: 'exact', head: true }),
  ])

  return (
    <AdminDashboardClient
      stats={{
        totalSiswa:  totalSiswa  ?? 0,
        totalStaff:  totalStaff  ?? 0,
        totalKelas:  totalKelas  ?? 0,
        tahunAktif:  tahunAktif?.nama ?? 'Belum ada',
      }}
      adminNama={session.nama}
    />
  )
}
