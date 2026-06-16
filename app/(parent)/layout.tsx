// ============================================================
// app/(parent)/layout.tsx
// Layout orang tua: top bar + bottom navigation
// ============================================================

import { redirect }         from 'next/navigation'
import { getParentSession } from '@/lib/auth/parent'
import { ParentShell }      from '@/components/ui/ParentShell'

export default async function ParentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getParentSession()
  if (!session) redirect('/login')

  return (
    <ParentShell siswaName={session.siswaName} siswaId={session.siswaId}>
      {children}
    </ParentShell>
  )
}
