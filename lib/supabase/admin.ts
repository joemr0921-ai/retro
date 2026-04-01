import { createClient } from '@supabase/supabase-js'

/**
 * Supabase admin client using the service role key.
 * Bypasses Row Level Security — use only in server-side API routes.
 * NEVER expose SUPABASE_SERVICE_ROLE_KEY to the browser.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}
