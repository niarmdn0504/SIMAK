// ============================================================
// lib/supabase/client.ts
// Supabase browser client — gunakan untuk staff (JWT Auth)
// JANGAN gunakan untuk data orang tua (gunakan API Routes)
// ============================================================

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
