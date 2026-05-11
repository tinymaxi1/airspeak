/**
 * Auth API — Mock veya Supabase'e yönlendirir.
 *
 * EXPO_PUBLIC_USE_MOCK_AUTH=true ise mock kullanılır (default development).
 * Production'da Supabase'e otomatik geçer.
 *
 * Sprint 1'de Supabase migration push edilince USE_MOCK_AUTH false yapılır.
 */
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { identify, resetAnalytics, track } from '@/lib/posthog';
import { identifyUser, clearUser } from '@/lib/sentry';
import { unregisterPushToken } from '@/lib/notifications';
import * as mockAuth from './mockAuth';

// Sprint 14.B.5 — Default kapalı (production-safe). Sadece env'de explicit
// 'true' ise mock auth açılır. Production build'inde env yoksa mock asla devreye girmez.
const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK_AUTH === 'true';

/**
 * Email verification redirect — Supabase verification email'indeki linke tıklanınca
 * app açılır ve auth-callback ekranı session'ı aktive eder.
 * Production'da iOS scheme airspeak://, deeplink config app.json'da.
 */
export const AUTH_REDIRECT_URL = 'airspeak://auth-callback';

export async function signUpWithEmail(email: string, password: string) {
  if (USE_MOCK) return mockAuth.signUpWithEmail(email, password);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: AUTH_REDIRECT_URL },
  });
  if (data.session) {
    // Email confirmation kapalı modda — direkt session
    useAuthStore.getState().setSession(data.session);
    track('auth_signed_up', { method: 'email' });
    identify(data.session.user.id, { email });
    identifyUser({ id: data.session.user.id });
  } else if (data.user) {
    // Email confirmation açık — user oluştu ama session yok, verification bekliyor
    track('auth_signup_verification_pending', { method: 'email' });
  }
  return { data, error };
}

/**
 * Verification email'i tekrar gönder.
 * Rate limit: Supabase default 60sn cooldown — UI tarafında da enforce edilir.
 */
export async function resendVerificationEmail(email: string) {
  if (USE_MOCK) return { error: null };
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: { emailRedirectTo: AUTH_REDIRECT_URL },
  });
  if (!error) track('auth_verification_resent');
  return { error };
}

/**
 * Email verification status check — polling için kullanılır.
 * `email_confirmed_at` set olduğunda true döner.
 */
export async function checkEmailVerified(): Promise<boolean> {
  if (USE_MOCK) return true;
  const { data } = await supabase.auth.getUser();
  return Boolean(data.user?.email_confirmed_at);
}

export async function signInWithEmail(email: string, password: string) {
  if (USE_MOCK) return mockAuth.signInWithEmail(email, password);

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (data.session) {
    useAuthStore.getState().setSession(data.session);
    track('auth_logged_in', { method: 'email' });
    identify(data.session.user.id, { email });
    identifyUser({ id: data.session.user.id });
  }
  return { data, error };
}

export async function resetPassword(email: string) {
  if (USE_MOCK) return mockAuth.resetPassword(email);

  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'airspeak://reset-password',
  });
}

export async function signOut() {
  // Push token unregister: cihazın bildirim almaması için.
  // Logout'tan ÖNCE çağrılır — sonra auth.uid() null olur, RLS engeller.
  await unregisterPushToken().catch(() => undefined);

  if (USE_MOCK) {
    const result = await mockAuth.signOut();
    resetAnalytics();
    return result;
  }

  const { error } = await supabase.auth.signOut();
  if (!error) {
    useAuthStore.getState().reset();
    resetAnalytics();
    clearUser();
  }
  return { error };
}

// ============================================================================
// Account deletion — Apple App Store Guideline 5.1.1(v) zorunlu
// Backend: profiles.deletion_requested_at + 30 gün grace + Edge fn cron hard delete
// (migration 32 + 33 + Edge fn process-account-deletions)
// ============================================================================

export interface AccountDeletionStatus {
  requested_at: string;
  scheduled_for: string;
  days_remaining: number;
}

export async function requestAccountDeletion(): Promise<{
  scheduledFor: Date | null;
  error: string | null;
}> {
  if (USE_MOCK) return mockAuth.requestAccountDeletion();

  const { data, error } = await (supabase.rpc as any)('request_account_deletion');
  if (error) return { scheduledFor: null, error: error.message };
  const result = data as { ok?: boolean; grace_until?: string; error?: string } | null;
  if (!result?.ok) return { scheduledFor: null, error: result?.error ?? 'unknown' };
  track('account_deletion_requested');
  return {
    scheduledFor: result.grace_until ? new Date(result.grace_until) : null,
    error: null,
  };
}

export async function cancelAccountDeletion(): Promise<{ ok: boolean; error: string | null }> {
  if (USE_MOCK) return mockAuth.cancelAccountDeletion();

  const { data, error } = await (supabase.rpc as any)('cancel_account_deletion');
  if (error) return { ok: false, error: error.message };
  const result = data as { ok?: boolean; error?: string } | null;
  if (!result?.ok) return { ok: false, error: result?.error ?? null };
  track('account_deletion_cancelled');
  return { ok: true, error: null };
}

export async function getAccountDeletionStatus(): Promise<AccountDeletionStatus | null> {
  if (USE_MOCK) return mockAuth.getAccountDeletionStatus();

  const { data, error } = await (supabase.rpc as any)('get_account_deletion_status');
  if (error || !data) return null;
  return data as AccountDeletionStatus;
}
