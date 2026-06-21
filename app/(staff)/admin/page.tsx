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
  ])

  // Ambil kelas list
  const { data: kelasListRaw } = await supabase
    .from('kelas').select('id, nama_kelas')

  // Ambil detail statistik per kelas
  const kelasStats = await Promise.all((kelasListRaw ?? []).map(async (kelas) => {
    const { count: totalSiswaInKelas } = await supabase
      .from('siswa_kelas')
      .select('id', { count: 'exact', head: true })
      .eq('kelas_id', kelas.id)

    // Ambil daftar siswa_id di kelas ini dulu
    const { data: siswaInKelas } = await supabase
      .from('siswa_kelas')
      .select('siswa_id')
      .eq('kelas_id', kelas.id)
    const siswaIds = siswaInKelas?.map(s => s.siswa_id) ?? []

    const { count: mutabaahTodayInKelas } = await supabase
      .from('mutabaah_log')
      .select('id', { count: 'exact', head: true })
      .eq('tanggal', today)
      .in('siswa_id', siswaIds)

    return {
      id:                   kelas.id,
      nama:                 kelas.nama_kelas,
      totalSiswaInKelas:    totalSiswaInKelas ?? 0,
      mutabaahTodayInKelas: mutabaahTodayInKelas ?? 0,
    }
  }))

  // Kelas kosong = kelas dengan 0 siswa
  const kelasKosong = kelasStats.filter(k => k.totalSiswaInKelas === 0)

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
      kelasList={kelasStats}
      kelasKosong={kelasKosong}
      adminNama={session.nama}
    />
  )
}
