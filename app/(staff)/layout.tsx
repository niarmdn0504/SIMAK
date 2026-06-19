// ============================================================
// app/(staff)/layout.tsx
// Layout staff — validasi session, render StaffShell
// ============================================================

import { redirect }        from 'next/navigation'
import { getStaffSession } from '@/lib/auth/staff'
import { StaffShell }      from '@/components/staff/StaffShell'

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getStaffSession()
  if (!session) redirect('/login')

  // Staff layout hanya untuk admin
  if (session.role !== 'admin') redirect('/guru')

  return (
    <StaffShell nama={session.nama} role={session.role}>
      {children}
    </StaffShell>
  )
}
