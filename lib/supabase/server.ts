// ============================================================
// lib/supabase/server.ts
// Supabase server client — DUA versi:
//   1. createServerClient: untuk Server Components (pakai cookies)
//   2. createServiceClient: untuk API Routes (service_role, bypass RLS)
//
// PENTING: File ini HANYA boleh diimport di:
//   - app/**/page.tsx (Server Components)
//   - app/api/**/route.ts (API Routes)
//   - middleware.ts
// JANGAN import di Client Components ('use client')
// ============================================================

import { createServerClient as createSSRServerClient } from '@supabase/ssr'
import { createClient, type SupabaseClient }           from '@supabase/supabase-js'
import { cookies }                                     from 'next/headers'
import type { Database }                               from '@/lib/types/database'
import type { SetAllCookies }                          from '@supabase/ssr'

// -----------------------------------------------------------
// Server Client — untuk Server Components & Route Handlers
// Menggunakan anon key + cookies (menghormati RLS)
// -----------------------------------------------------------
export async function createServerClient(): Promise<SupabaseClient<Database, 'public', 'public'>> {
  const cookieStore = await cookies()

  return createSSRServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: Parameters<SetAllCookies>[0]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component — cookies read-only, diabaikan
          }
        },
      },
    }
  ) as unknown as SupabaseClient<Database, 'public', 'public'>
}

// -----------------------------------------------------------
// Service Client — untuk API Routes yang membutuhkan
// akses penuh (bypass RLS): login orang tua, admin operations
//
// ATURAN: Hanya boleh dipakai di app/api/**/route.ts
// JANGAN expose ke client/browser
// -----------------------------------------------------------
export function createServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession:   false,
      },
    }
  )
}
