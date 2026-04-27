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
import { setUser } from '@/lib/sentry';
import * as mockAuth from './mockAuth';

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK_AUTH !== 'false';

export async function signUpWithEmail(email: string, password: string) {
  if (USE_MOCK) return mockAuth.signUpWithEmail(email, password);

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (data.session) {
    useAuthStore.getState().setSession(data.session);
    track('auth_signed_up', { method: 'email' });
    identify(data.session.user.id, { email });
    setUser({ id: data.session.user.id, email });
  }
  return { data, error };
}

export async function signInWithEmail(email: string, password: string) {
  if (USE_MOCK) return mockAuth.signInWithEmail(email, password);

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (data.session) {
    useAuthStore.getState().setSession(data.session);
    track('auth_logged_in', { method: 'email' });
    identify(data.session.user.id, { email });
    setUser({ id: data.session.user.id, email });
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
  if (USE_MOCK) {
    const result = await mockAuth.signOut();
    resetAnalytics();
    return result;
  }

  const { error } = await supabase.auth.signOut();
  if (!error) {
    useAuthStore.getState().reset();
    resetAnalytics();
    setUser(null);
  }
  return { error };
}
