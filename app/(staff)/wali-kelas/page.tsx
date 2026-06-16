// ============================================================
// app/(staff)/wali-kelas/page.tsx
// Dashboard Wali Kelas — Server Component
// ============================================================

import { redirect }           from 'next/navigation'
import { getStaffSession }    from '@/lib/auth/staff'
import { WaliKelasClient }    from './WaliKelasClient'

export default async function WaliKelasPage() {
  const session = await getStaffSession()
  if (!session) redirect('/login')
  if (!['wali_kelas', 'admin'].includes(session.role)) redirect('/login')

  return <WaliKelasClient namaGuru={session.nama} />
}
