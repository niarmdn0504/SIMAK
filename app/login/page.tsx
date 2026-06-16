// ============================================================
// app/login/page.tsx
// Halaman login — orang tua (NISN) dan staff (email+password)
// ============================================================

import { redirect }    from 'next/navigation'
import { getParentSession } from '@/lib/auth/parent'
import { getStaffSession }  from '@/lib/auth/staff'
import { LoginForm }        from './LoginForm'

export default async function LoginPage() {
  // Redirect jika sudah login
  const parentSession = await getParentSession()
  if (parentSession) redirect('/dashboard')

  const staffSession = await getStaffSession()
  if (staffSession) {
    switch (staffSession.role) {
      case 'wali_kelas':  redirect('/wali-kelas')
      case 'guru_tahfiz': redirect('/tahfiz')
      case 'guru_wafa':   redirect('/wafa')
      case 'admin':       redirect('/admin')
    }
  }

  return <LoginForm />
}
