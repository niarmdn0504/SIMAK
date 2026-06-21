import { NextResponse } from 'next/server'
import { getStaffSession } from '@/lib/auth/staff'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(req: Request) {
  const session = await getStaffSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim()
  if (!q || q.length < 2) return NextResponse.json({ results: [] })

  const supabase = createServiceClient()
  const like = `%${q}%`

  const [siswaRes, guruRes, kelasRes] = await Promise.all([
    supabase.from('siswa').select('id, nisn, nama_lengkap, kelas:kelas_id(nama_kelas)').ilike('nama_lengkap', like).eq('is_active', true).limit(5),
    supabase.from('user_profile').select('id, nama, role').ilike('nama', like).eq('is_active', true).limit(5),
    supabase.from('kelas').select('id, nama_kelas').ilike('nama_kelas', like).limit(5),
  ])

  const results = [
    ...(siswaRes.data ?? []).map((s: any) => ({
      type: 'siswa' as const,
      label: s.nama_lengkap,
      sub: `NISN: ${s.nisn} · Kelas ${s.kelas?.nama_kelas ?? '-'}`,
      href: `/admin/siswa`,
    })),
    ...(guruRes.data ?? []).map((g: any) => ({
      type: 'guru' as const,
      label: g.nama,
      sub: g.role === 'admin' ? 'Admin' : g.role === 'wali_kelas' ? 'Wali Kelas' : g.role === 'guru_tahfiz' ? 'Guru Tahfiz' : 'Guru Wafa',
      href: `/admin/staff`,
    })),
    ...(kelasRes.data ?? []).map((k: any) => ({
      type: 'kelas' as const,
      label: `Kelas ${k.nama_kelas}`,
      sub: 'Detail kelas',
      href: `/admin/kelas`,
    })),
  ]

  return NextResponse.json({ results })
}
