// ============================================================
// app/login/LoginForm.tsx
// Form login interaktif — dua tab: Orang Tua (NISN) & Staff
// ============================================================

'use client'

import { useState, useTransition } from 'react'
import { useRouter }                from 'next/navigation'
import { createClient }             from '@/lib/supabase/client'
import { cn }                       from '@/lib/utils/cn'

type Tab = 'orangtua' | 'staff'

export function LoginForm() {
  const router = useRouter()
  const [tab, setTab]           = useState<Tab>('orangtua')
  const [nisn, setNisn]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [isPending, startTransition] = useTransition()

  // -----------------------------------------------------------
  // Login Orang Tua via NISN
  // -----------------------------------------------------------
  async function handleParentLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!/^\d{10}$/.test(nisn)) {
      setError('NISN harus 10 digit angka.')
      return
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/auth/parent-login', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ nisn }),
        })
        const data = await res.json()

        if (!data.success) {
          setError(data.error ?? 'NISN tidak ditemukan.')
          return
        }

        router.push('/dashboard')
        router.refresh()
      } catch {
        setError('Terjadi kesalahan. Silakan coba lagi.')
      }
    })
  }

  // -----------------------------------------------------------
  // Login Staff via Supabase Auth
  // -----------------------------------------------------------
  async function handleStaffLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    startTransition(async () => {
      try {
        const supabase = createClient()
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (authError || !data.user) {
          setError('Email atau password salah.')
          return
        }

        // Ambil role dari user_profile
        const { data: profile } = await supabase
          .from('user_profile')
          .select('role, is_active')
          .eq('id', data.user.id)
          .single()

        if (!profile?.is_active) {
          setError('Akun tidak aktif. Hubungi admin.')
          return
        }

        // Redirect berdasarkan role
        const redirectMap: Record<string, string> = {
          admin:       '/admin',
          wali_kelas:  '/wali-kelas',
          guru_tahfiz: '/tahfiz',
          guru_wafa:   '/wafa',
        }

        router.push(redirectMap[profile.role] ?? '/login')
        router.refresh()
      } catch {
        setError('Terjadi kesalahan. Silakan coba lagi.')
      }
    })
  }

  return (
    <div className="min-h-screen bg-primary-500 islamic-pattern flex flex-col">
      {/* Header */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8">
        {/* Logo & branding */}
        <div className="text-center mb-10 animate-in">
          <div className="w-24 h-24 rounded-2xl overflow-hidden mx-auto mb-4 shadow-lg">
            <img src="/logo.png" alt="Logo SIMAK" className="w-full h-full object-contain bg-white" />
          </div>
          <h1 className="font-display text-white text-4xl font-bold tracking-wide">
            SIMAK
          </h1>
          <p className="text-primary-100 text-sm mt-1 font-body">
            Monitoring Akhlak & Karakter
          </p>
          <p className="text-primary-200 text-xs mt-1 font-body leading-relaxed max-w-xs mx-auto">
            Aplikasi Monitoring Akhlak dan Karakter<br />SDIT Al-Kautsar Mukomuko
          </p>
        </div>

        {/* Card form */}
        <div className="w-full max-w-sm bg-white rounded-xl shadow-elevated overflow-hidden animate-in"
             style={{ animationDelay: '0.1s' }}>

          {/* Tab switcher */}
          <div className="flex border-b border-neutral-100">
            <button
              onClick={() => { setTab('orangtua'); setError('') }}
              className={cn(
                'flex-1 py-3.5 text-sm font-semibold transition-colors duration-200',
                tab === 'orangtua'
                  ? 'text-primary-500 border-b-2 border-primary-500 bg-primary-50'
                  : 'text-neutral-400 hover:text-neutral-600'
              )}
            >
              Orang Tua
            </button>
            <button
              onClick={() => { setTab('staff'); setError('') }}
              className={cn(
                'flex-1 py-3.5 text-sm font-semibold transition-colors duration-200',
                tab === 'staff'
                  ? 'text-primary-500 border-b-2 border-primary-500 bg-primary-50'
                  : 'text-neutral-400 hover:text-neutral-600'
              )}
            >
              Guru / Admin
            </button>
          </div>

          <div className="p-6">
            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Form Orang Tua */}
            {tab === 'orangtua' && (
              <form onSubmit={handleParentLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                    NISN Anak
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="\d{10}"
                    maxLength={10}
                    value={nisn}
                    onChange={e => setNisn(e.target.value.replace(/\D/g, ''))}
                    placeholder="0123456789"
                    className="w-full h-12 px-4 border border-neutral-200 rounded-md
                               text-lg font-mono tracking-widest text-center
                               focus:outline-none focus:ring-2 focus:ring-primary-300
                               focus:border-primary-400 transition-all"
                    required
                  />
                  <p className="text-xs text-neutral-400 mt-1.5 text-center">
                    10 digit Nomor Induk Siswa Nasional
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isPending || nisn.length !== 10}
                  className={cn(
                    'w-full h-12 rounded-md font-semibold text-white transition-all duration-200',
                    isPending || nisn.length !== 10
                      ? 'bg-neutral-300 cursor-not-allowed'
                      : 'bg-primary-500 hover:bg-primary-600 active:scale-[0.98] shadow-md hover:shadow-elevated'
                  )}
                >
                  {isPending ? 'Memverifikasi...' : 'Masuk'}
                </button>
              </form>
            )}

            {/* Form Staff */}
            {tab === 'staff' && (
              <form onSubmit={handleStaffLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="nama@simak.sch.id"
                    className="w-full h-12 px-4 border border-neutral-200 rounded-md
                               focus:outline-none focus:ring-2 focus:ring-primary-300
                               focus:border-primary-400 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-12 px-4 border border-neutral-200 rounded-md
                               focus:outline-none focus:ring-2 focus:ring-primary-300
                               focus:border-primary-400 transition-all"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className={cn(
                    'w-full h-12 rounded-md font-semibold text-white transition-all duration-200',
                    isPending
                      ? 'bg-neutral-300 cursor-not-allowed'
                      : 'bg-primary-500 hover:bg-primary-600 active:scale-[0.98] shadow-md hover:shadow-elevated'
                  )}
                >
                  {isPending ? 'Memverifikasi...' : 'Masuk'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-primary-200 text-xs mt-8 text-center animate-in"
           style={{ animationDelay: '0.2s' }}>
          Hubungi admin sekolah jika lupa NISN
        </p>
      </div>
    </div>
  )
}
