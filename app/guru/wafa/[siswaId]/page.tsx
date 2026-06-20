// ============================================================
// app/guru/wafa/[siswaId]/page.tsx
// Detail wafa satu siswa — server component
// ============================================================

import { redirect }           from 'next/navigation'
import { getStaffSession }    from '@/lib/auth/staff'
import { createServiceClient } from '@/lib/supabase/server'
import { WafaDetailClient }   from '@/components/wafa/WafaDetailClient'

interface Props {
  params: Promise<{ siswaId: string }>
}

export default async function GuruWafaDetailPage({ params }: Props) {
  const session = await getStaffSession()
  if (!session) redirect('/login')
  if (session.role === 'admin') redirect('/admin')

  const { siswaId } = await params
  const supabase    = createServiceClient()

  const { data: siswa } = await supabase
    .from('siswa')
    .select('id, nama_lengkap, nisn, photo_url')
    .eq('id', siswaId)
    .single()

  if (!siswa) redirect('/guru/wafa')

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
      backHref="/guru/wafa"
    />
  )
}
