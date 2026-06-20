import { redirect }           from 'next/navigation'
import { getStaffSession }    from '@/lib/auth/staff'
import { createServiceClient } from '@/lib/supabase/server'
import { AturMutabaahClient } from './AturMutabaahClient'

export default async function AturMutabaahPage() {
  const session = await getStaffSession()
  if (!session) redirect('/login')
  if (session.role === 'admin') redirect('/admin')

  const supabase = createServiceClient()

  const { data: tahunAjaran } = await supabase
    .from('tahun_ajaran')
    .select('id')
    .eq('is_active', true)
    .single()

  if (!tahunAjaran) return <p className="p-4 text-sm text-neutral-400">Belum ada tahun ajaran aktif</p>

  const { data: semuaKelas } = await supabase
    .from('kelas')
    .select('id, nama_kelas')
    .eq('tahun_ajaran_id', tahunAjaran.id)

  const kelasSaya = (semuaKelas ?? []).filter(k =>
    true
  )

  return <AturMutabaahClient kelasList={kelasSaya} />
}
