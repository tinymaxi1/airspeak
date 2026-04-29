/**
 * Mock auth provider — Sprint 1 development için.
 * Supabase migration push edilince src/features/auth/api.ts kullanılacak.
 *
 * Bu mock:
 * - MMKV'de local kullanıcı tutar
 * - Sahte sessions üretir
 * - Real-world akışı simüle eder
 */
import { storage } from '@/lib/storage';
import { useAuthStore } from '@/stores/authStore';
import { track, identify } from '@/lib/posthog';
import type { Session } from '@supabase/supabase-js';

interface MockUser {
  id: string;
  email: string;
  password: string; // In production: hashed; this is dev-only
  created_at: string;
}

const USERS_KEY = 'mock-users';

function getUsers(): MockUser[] {
  const raw = storage.getString(USERS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as MockUser[];
  } catch {
    return [];
  }
}

function saveUsers(users: MockUser[]): void {
  storage.set(USERS_KEY, JSON.stringify(users));
}

function makeId(): string {
  return `usr_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function makeSession(user: MockUser): Session {
  return {
    access_token: `mock_token_${user.id}`,
    refresh_token: `mock_refresh_${user.id}`,
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user: {
      id: user.id,
      email: user.email,
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: user.created_at,
    },
  } as Session;
}

export async function signUpWithEmail(email: string, password: string) {
  if (!email || !password) {
    return { data: null, error: { message: 'E-posta ve şifre gerekli' } };
  }
  if (password.length < 6) {
    return { data: null, error: { message: 'Şifre en az 6 karakter olmalı' } };
  }

  const users = getUsers();
  if (users.some((u) => u.email === email)) {
    return { data: null, error: { message: 'Bu e-posta zaten kayıtlı' } };
  }

  const user: MockUser = {
    id: makeId(),
    email,
    password,
    created_at: new Date().toISOString(),
  };
  users.push(user);
  saveUsers(users);

  const session = makeSession(user);
  useAuthStore.getState().setSession(session);
  track('auth_signed_up', { method: 'email' });
  identify(user.id, { email });

  return { data: { session, user: session.user }, error: null };
}

export async function signInWithEmail(email: string, password: string) {
  if (!email || !password) {
    return { data: null, error: { message: 'E-posta ve şifre gerekli' } };
  }

  const users = getUsers();
  let user = users.find((u) => u.email === email && u.password === password);

  // Dev kolaylığı: kullanıcı hiç yoksa otomatik oluştur (mock modda ayrı kayıt gerekmiyor)
  if (!user) {
    const existing = users.find((u) => u.email === email);
    if (existing) {
      return { data: null, error: { message: 'Şifre hatalı' } };
    }
    user = { id: makeId(), email, password, created_at: new Date().toISOString() };
    users.push(user);
    saveUsers(users);
  }

  const session = makeSession(user);
  useAuthStore.getState().setSession(session);
  track('auth_logged_in', { method: 'email' });
  identify(user.id, { email });

  return { data: { session, user: session.user }, error: null };
}

export async function resetPassword(_email: string) {
  // Mock: hep başarılı olur
  return { data: null, error: null };
}

export async function signOut() {
  useAuthStore.getState().reset();
  return { error: null };
}
