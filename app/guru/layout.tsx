// ============================================================
// app/guru/layout.tsx
// Layout guru terpadu — validasi session, render GuruShell
// ============================================================

import { redirect }        from 'next/navigation'
import { getStaffSession } from '@/lib/auth/staff'
import { GuruShell }       from '@/components/guru/GuruShell'

const GURU_ROLES = ['wali_kelas', 'guru_tahfiz', 'guru_wafa'] as const

export default async function GuruLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getStaffSession()
  if (!session) redirect('/login')

  if (session.role === 'admin') redirect('/admin')

  const hasGuruRole = session.roles.some(r => GURU_ROLES.includes(r as any))
  if (!hasGuruRole) redirect('/login')

  return (
    <GuruShell nama={session.nama} roles={session.roles}>
      {children}
    </GuruShell>
  )
}
