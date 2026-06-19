// ============================================================
// app/guru/layout.tsx
// Layout guru terpadu — validasi session, render GuruShell
// ============================================================

import { redirect }        from 'next/navigation'
import { getStaffSession } from '@/lib/auth/staff'
import { GuruShell }       from '@/components/guru/GuruShell'

export default async function GuruLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getStaffSession()
  if (!session) redirect('/login')
  if (session.role === 'admin') redirect('/admin')

  return (
    <GuruShell nama={session.nama}>
      {children}
    </GuruShell>
  )
}
