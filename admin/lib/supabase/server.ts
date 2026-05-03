/**
 * Server Supabase client — Server Component, Route Handler, Server Action'larda kullanılır.
 * Auth: cookie-based session okur, service_role kullanmaz (sadece RLS guard'lı yetkiler).
 */
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component içinde set edilemez — sadece middleware veya server action'da
          }
        },
      },
    },
  );
}

/**
 * Service role client — admin destructive ops + bulk insert için.
 * Sadece güvenli sunucu tarafı kodda kullan (Server Action, Route Handler).
 * KESINLIKLE Client Component'e expose etme.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error('Service role env değişkenleri eksik');
  }
  // Service role: sadece sunucu, RLS bypass eder
  return createServerClient(url, serviceKey, {
    cookies: {
      getAll: () => [],
      setAll: () => {},
    },
  });
}
