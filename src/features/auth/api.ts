import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { identify, resetAnalytics, track } from '@/lib/posthog';
import { setUser } from '@/lib/sentry';

export async function signUpWithEmail(email: string, password: string) {
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
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'airspeak://reset-password',
  });
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (!error) {
    useAuthStore.getState().reset();
    resetAnalytics();
    setUser(null);
  }
  return { error };
}
