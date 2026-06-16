// ============================================================
// app/(staff)/wafa/[siswaId]/page.tsx
// Detail wafa satu siswa
// ============================================================

import { redirect }           from 'next/navigation'
import { getStaffSession }    from '@/lib/auth/staff'
import { createServerClient } from '@/lib/supabase/server'
import { WafaDetailClient }   from './WafaDetailClient'

interface Props {
  params: Promise<{ siswaId: string }>
}

export default async function WafaDetailPage({ params }: Props) {
  const session = await getStaffSession()
  if (!session) redirect('/login')
  if (!['guru_wafa', 'admin'].includes(session.role)) redirect('/login')

  const { siswaId } = await params
  const supabase    = await createServerClient()

  const { data: siswa } = await supabase
    .from('siswa')
    .select('id, nama_lengkap, nisn, photo_url')
    .eq('id', siswaId)
    .single()

  if (!siswa) redirect('/wafa')

  // Ambil kelas aktif
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

  // Ambil level wafa terakhir
  const { data: lastWafa } = await supabase
    .from('wafa_log')
    .select('jilid')
    .eq('siswa_id', siswaId)
    .order('tanggal', { ascending: false })
    .limit(1)
    .single()

  return (
    <WafaDetailClient
      siswa={{ ...siswa, nama_kelas: namaKelas }}
      guruId={session.userId}
      currentJilid={lastWafa?.jilid ?? null}
    />
  )
}
