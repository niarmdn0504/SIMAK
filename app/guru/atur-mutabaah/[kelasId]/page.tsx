import { redirect }           from 'next/navigation'
import { getStaffSession }    from '@/lib/auth/staff'
import { createServiceClient } from '@/lib/supabase/server'
import { KelasMutabaahForm }  from './KelasMutabaahForm'

interface Props {
  params: Promise<{ kelasId: string }>
}

export default async function AturMutabaahKelasPage({ params }: Props) {
  const session = await getStaffSession()
  if (!session) redirect('/login')
  if (session.role === 'admin') redirect('/admin')

  const { kelasId } = await params
  const supabase = createServiceClient()

  const { data: kelas } = await supabase
    .from('kelas')
    .select('id, nama_kelas')
    .eq('id', kelasId)
    .single()

  if (!kelas) redirect('/guru/atur-mutabaah')

  const { data: tahunAjaran } = await supabase
    .from('tahun_ajaran')
    .select('id')
    .eq('is_active', true)
    .single()

  if (!tahunAjaran) return <p className="p-4 text-sm text-neutral-400">Belum ada tahun ajaran aktif</p>

  const { data: allItems } = await supabase
    .from('mutabaah_item')
    .select('id, nama_item, parent_id, urutan')
    .eq('tahun_ajaran_id', tahunAjaran.id)
    .eq('is_active', true)
    .order('urutan', { ascending: true })

  const { data: aktif } = await supabase
    .from('kelas_mutabaah_item')
    .select('mutabaah_item_id')
    .eq('kelas_id', kelasId)

  const activeSet = new Set(aktif?.map(r => r.mutabaah_item_id) ?? [])

  return (
    <KelasMutabaahForm
      kelas={kelas}
      allItems={allItems ?? []}
      initialActiveIds={Array.from(activeSet)}
    />
  )
}
