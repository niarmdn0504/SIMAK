// ============================================================
// app/(staff)/tahfiz/[siswaId]/page.tsx
// Detail tahfiz satu siswa — riwayat + form input
// ============================================================

import { redirect }            from 'next/navigation'
import { getStaffSession }     from '@/lib/auth/staff'
import { createServerClient }  from '@/lib/supabase/server'
import { TahfizDetailClient }  from './TahfizDetailClient'

interface Props {
  params: Promise<{ siswaId: string }>
}

export default async function TahfizDetailPage({ params }: Props) {
  const session = await getStaffSession()
  if (!session) redirect('/login')
  if (!['guru_tahfiz', 'admin'].includes(session.role)) redirect('/login')

  const { siswaId } = await params
  const supabase    = await createServerClient()

  // Ambil data siswa
  const { data: siswa } = await supabase
    .from('siswa')
    .select('id, nama_lengkap, nisn, photo_url')
    .eq('id', siswaId)
    .single()

  if (!siswa) redirect('/tahfiz')

  // Ambil kelas siswa saat ini
  const { data: kelasData } = await supabase
    .from('siswa_kelas')
    .select('kelas:kelas_id ( nama_kelas )')
    .eq('siswa_id', siswaId)
    .in(
      'tahun_ajaran_id',
      (await supabase.from('tahun_ajaran').select('id').eq('is_active', true).single()).data
        ? [(await supabase.from('tahun_ajaran').select('id').eq('is_active', true).single()).data!.id]
        : []
    )
    .single()

  const namaKelas = (kelasData?.kelas as any)?.nama_kelas ?? '-'

  return (
    <TahfizDetailClient
      siswa={{ ...siswa, nama_kelas: namaKelas }}
      guruId={session.userId}
      guruNama={session.nama}
    />
  )
}
