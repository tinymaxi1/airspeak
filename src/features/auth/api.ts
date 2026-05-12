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
 * Email verification redirect — Universal Link (iOS) + App Link (Android).
 *
 * Production flow:
 * 1. Mail'deki link → https://airspeak.app/auth/verify?token=xxx
 * 2. iPhone/Android otomatik AirSpeak app'i açar (tarayıcı görünmez)
 * 3. App'te auth-callback ekranı token'ı handle eder → session aktive → onboarding
 *
 * Config:
 * - iOS: app.json ios.associatedDomains + docs/.well-known/apple-app-site-association
 * - Android: app.json android.intentFilters + docs/.well-known/assetlinks.json
 * - DNS: airspeak.app GitHub Pages'e CNAME (host: tinymaxi1.github.io/airspeak)
 *
 * Fallback: app yüklü değilse docs/auth/verify.html sayfası "Apple Store'dan indir" gösterir
 */
export const AUTH_REDIRECT_URL = 'https://airspeak.app/auth/verify';

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
    redirectTo: 'https://airspeak.app/auth/verify',
  });
}

// ============================================================================
// Social Sign-In — Apple Guideline 4.8 zorunlu (Google + Apple)
// Supabase signInWithIdToken native flow (Provider: Apple/Google, Dashboard'da config'li olmalı)
// ============================================================================

/**
 * Apple Sign-In — expo-apple-authentication ile native flow.
 * iOS 13+ ve sadece iOS'ta çalışır. Android'de fallback: Alert ile uyar.
 *
 * Apple Dev Portal: App ID'de "Sign In with Apple" capability aktif olmalı.
 * Supabase Dashboard → Authentication → Providers → Apple aktif olmalı.
 */
export async function signInWithApple(): Promise<{ ok: boolean; error?: string }> {
  if (USE_MOCK) {
    // Mock: hemen sahte session oluştur
    const result = await mockAuth.signInWithEmail('apple-mock@airspeak.app', 'mock-pw');
    return { ok: !result.error, error: result.error?.message };
  }

  try {
    const AppleAuthentication = await import('expo-apple-authentication');
    const isAvailable = await AppleAuthentication.isAvailableAsync();
    if (!isAvailable) {
      return { ok: false, error: 'Apple Sign-In bu cihazda kullanılamaz (iOS 13+ gerekli).' };
    }

    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (!credential.identityToken) {
      return { ok: false, error: 'Apple identity token alınamadı.' };
    }

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
    });

    if (error) return { ok: false, error: error.message };
    if (!data.session) return { ok: false, error: 'Apple ile oturum açılamadı.' };

    useAuthStore.getState().setSession(data.session);
    track('auth_logged_in', { method: 'apple' });
    // Apple "Hide my email" relay edge case: email null gelirse identify atlanır.
    // Supabase auth.users.email yine relay adresiyle (private@privaterelay.appleid.com) dolu olur.
    if (data.session.user.email) {
      identify(data.session.user.id, { email: data.session.user.email });
    }
    identifyUser({ id: data.session.user.id });

    // Apple kuralı: fullName SADECE ilk sign-in'de gelir. Sonraki signin'lerde
    // null döner — Apple bilerek gizler (user privacy). Bu yüzden profile boşsa
    // (yeni user) full_name'i şimdi yaz. Ezme yok (.is null filter).
    const givenName = credential.fullName?.givenName?.trim();
    const familyName = credential.fullName?.familyName?.trim();
    if (givenName || familyName) {
      const composedName = [givenName, familyName].filter(Boolean).join(' ');
      // Fire-and-forget; UI bloklamaz, fail olursa Sentry'ye düşer
      void (async () => {
        try {
          await supabase
            .from('profiles')
            .update({ full_name: composedName })
            .eq('id', data.session.user.id)
            .is('full_name', null);
        } catch {
          // best-effort; null değer korunur
        }
      })();
    }

    return { ok: true };
  } catch (e: any) {
    // ERR_REQUEST_CANCELED — kullanıcı iptal etti, hata gösterme
    if (e?.code === 'ERR_REQUEST_CANCELED') return { ok: false };
    return { ok: false, error: e?.message ?? 'Apple sign-in başarısız.' };
  }
}

/**
 * Google Sign-In — @react-native-google-signin/google-signin ile native flow.
 *
 * Google Cloud Console: 3 OAuth Client ID gerekli:
 *   1. iOS (Bundle ID: app.airspeak.mobile)
 *   2. Android (Package: app.airspeak.mobile + SHA-1)
 *   3. Web (Supabase için)
 *
 * Supabase Dashboard → Authentication → Providers → Google aktif + Web Client ID/Secret girilmiş.
 * Env: EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID + EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
 */
export async function signInWithGoogle(): Promise<{ ok: boolean; error?: string }> {
  if (USE_MOCK) {
    const result = await mockAuth.signInWithEmail('google-mock@airspeak.app', 'mock-pw');
    return { ok: !result.error, error: result.error?.message };
  }

  try {
    const { GoogleSignin, statusCodes } = await import('@react-native-google-signin/google-signin');

    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      offlineAccess: false,
    });

    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const userInfo: any = await GoogleSignin.signIn();

    // v13'te idToken iki yerde olabilir (data.idToken veya idToken)
    const idToken = userInfo?.data?.idToken ?? userInfo?.idToken;
    if (!idToken) {
      return { ok: false, error: 'Google ID token alınamadı.' };
    }

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });

    if (error) return { ok: false, error: error.message };
    if (!data.session) return { ok: false, error: 'Google ile oturum açılamadı.' };

    useAuthStore.getState().setSession(data.session);
    track('auth_logged_in', { method: 'google' });
    if (data.session.user.email) {
      identify(data.session.user.id, { email: data.session.user.email });
    }
    identifyUser({ id: data.session.user.id });

    // Google fullName: ilk sign-in'de userInfo.user.name veya
    // userInfo.data.user.name doludur. Profile boşsa yaz, varsa ezme.
    const googleUser = userInfo?.data?.user ?? userInfo?.user;
    const googleName: string | undefined =
      googleUser?.name ??
      [googleUser?.givenName, googleUser?.familyName].filter(Boolean).join(' ');
    if (googleName && googleName.trim()) {
      const composedName = googleName.trim();
      void (async () => {
        try {
          await supabase
            .from('profiles')
            .update({ full_name: composedName })
            .eq('id', data.session.user.id)
            .is('full_name', null);
        } catch {
          // best-effort
        }
      })();
    }

    return { ok: true };
  } catch (e: any) {
    // SIGN_IN_CANCELLED — kullanıcı iptal etti
    if (e?.code === 'SIGN_IN_CANCELLED' || e?.code === -5) return { ok: false };
    return { ok: false, error: e?.message ?? 'Google sign-in başarısız.' };
  }
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
