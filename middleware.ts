// ============================================================
// middleware.ts — Proteksi route berdasarkan role
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient }        from '@supabase/ssr'
import type { SetAllCookies }        from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Lewati static assets dan API routes
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/icons/') ||
    pathname === '/manifest.json' ||
    pathname === '/sw.js' ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // Login page — redirect jika sudah punya session
  if (pathname === '/login') {
    const parentToken = request.cookies.get('simak_parent_token')?.value
    if (parentToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // Root → login
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Routes orang tua
  const parentRoutes = ['/dashboard', '/kalender']
  // Cek prefix /tahfiz dan /wafa hanya untuk parent jika tidak ada staff session
  const isParentRoute = parentRoutes.some(r => pathname.startsWith(r))

  if (isParentRoute) {
    const parentToken = request.cookies.get('simak_parent_token')?.value
    if (!parentToken) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }

  // Routes staff (guru, admin — cek Supabase Auth)
  const staffRoutes = ['/guru', '/admin']
  const isStaffRoute = staffRoutes.some(r => pathname.startsWith(r))

  if (isStaffRoute) {
    const response = NextResponse.next()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll(cookiesToSet: Parameters<SetAllCookies>[0]) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js).*)',
  ],
}
