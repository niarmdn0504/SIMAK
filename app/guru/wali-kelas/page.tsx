// ============================================================
// app/guru/wali-kelas/page.tsx
// Dashboard Wali Kelas — Server Component
// ============================================================

import { redirect }           from 'next/navigation'
import { getStaffSession }    from '@/lib/auth/staff'
import { WaliKelasClient }    from '@/components/wali-kelas/WaliKelasClient'

export default async function GuruWaliKelasPage() {
  const session = await getStaffSession()
  if (!session) redirect('/login')
  if (!session.roles.includes('wali_kelas') && session.role !== 'admin') redirect('/guru')

  return <WaliKelasClient namaGuru={session.nama} detailPath="/guru/wali-kelas" />
}
