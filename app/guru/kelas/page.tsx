import { redirect }           from 'next/navigation'
import { getStaffSession }    from '@/lib/auth/staff'
import { WaliKelasClient }    from '@/components/wali-kelas/WaliKelasClient'

export default async function GuruKelasPage() {
  const session = await getStaffSession()
  if (!session) redirect('/login')
  if (session.role === 'admin') redirect('/admin')

  return <WaliKelasClient namaGuru={session.nama} detailPath="/guru/kelas" />
}
