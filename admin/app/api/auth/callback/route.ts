/**
 * Magic link callback — Supabase user'ı session'a yazar, /'ya yönlendirir.
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const errorParam = url.searchParams.get('error_description');
  const next = url.searchParams.get('next') ?? '/';

  if (errorParam) {
    console.error('[auth callback] Supabase error:', errorParam);
    return NextResponse.redirect(
      `${url.origin}/login?error=${encodeURIComponent(errorParam)}`,
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error('[auth callback] exchangeCodeForSession error:', error.message);
      return NextResponse.redirect(
        `${url.origin}/login?error=${encodeURIComponent(error.message)}`,
      );
    }
    return NextResponse.redirect(`${url.origin}${next}`);
  }

  return NextResponse.redirect(`${url.origin}/login?error=no_code`);
}
