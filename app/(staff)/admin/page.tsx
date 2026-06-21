// ============================================================
// app/(staff)/admin/page.tsx
// Dashboard Admin — server component
// ============================================================

import { redirect }            from 'next/navigation'
import { getStaffSession }     from '@/lib/auth/staff'
import { createServiceClient } from '@/lib/supabase/server'
import { AdminDashboardClient } from './AdminDashboardClient'

export default async function AdminPage() {
  const session = await getStaffSession()
  if (!session) redirect('/login')
  if (session.role !== 'admin') redirect('/login')

  const supabase = createServiceClient()

  const today = new Date().toISOString().split('T')[0]

  const [
    { count: totalSiswa },
    { count: totalStaff },
    { data: tahunAktif },
    { count: totalKelas },
    { count: mutabaahHariIni },
    { count: tahfizHariIni },
    { count: wafaHariIni },
    { data: recentMutabaah },
    { data: recentTahfiz },
    { data: recentWafa },
    { data: kelasList },
  ] = await Promise.all([
    supabase.from('siswa').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('user_profile').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('tahun_ajaran').select('id, nama').eq('is_active', true).single(),
    supabase.from('kelas').select('*', { count: 'exact', head: true }),
    supabase.from('mutabaah_log').select('*', { count: 'exact', head: true }).eq('tanggal', today),
    supabase.from('tahfiz_log').select('*', { count: 'exact', head: true }).eq('tanggal', today),
    supabase.from('wafa_log').select('*', { count: 'exact', head: true }).eq('tanggal', today),
    supabase.from('mutabaah_log').select('id, created_at, siswa:siswa_id(nama_lengkap)').order('created_at', { ascending: false }).limit(5),
    supabase.from('tahfiz_log').select('id, created_at, siswa:siswa_id(nama_lengkap)').order('created_at', { ascending: false }).limit(5),
    supabase.from('wafa_log').select('id, created_at, siswa:siswa_id(nama_lengkap)').order('created_at', { ascending: false }).limit(5),
    supabase.from('kelas').select('id, nama_kelas'),
  ])

  return (
    <AdminDashboardClient
      stats={{
        totalSiswa:     totalSiswa ?? 0,
        totalStaff:     totalStaff ?? 0,
        totalKelas:     totalKelas ?? 0,
        tahunAktif:     tahunAktif?.nama ?? 'Belum ada',
        mutabaahHariIni: mutabaahHariIni ?? 0,
        tahfizHariIni:  tahfizHariIni ?? 0,
        wafaHariIni:    wafaHariIni ?? 0,
        totalSiswaAktif: totalSiswa ?? 0,
      }}
      recentActivity={{
        mutabaah: (recentMutabaah ?? []).map((m: any) => ({ id: m.id, time: m.created_at, nama: m.siswa?.nama_lengkap ?? '-' })),
        tahfiz: (recentTahfiz ?? []).map((t: any) => ({ id: t.id, time: t.created_at, nama: t.siswa?.nama_lengkap ?? '-' })),
        wafa: (recentWafa ?? []).map((w: any) => ({ id: w.id, time: w.created_at, nama: w.siswa?.nama_lengkap ?? '-' })),
      }}
      kelasList={(kelasList ?? []).map((k: any) => ({ id: k.id, nama: k.nama_kelas }))}
      adminNama={session.nama}
    />
  )
}
