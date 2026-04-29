/**
 * Browser Supabase client — Client Component'lerde kullanılır.
 * Auth: anon key + cookie-based session (Supabase SSR).
 */
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
