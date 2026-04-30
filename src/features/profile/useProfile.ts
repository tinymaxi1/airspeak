/**
 * useProfile — profiles tablosu okuma + cache + realtime.
 *
 * Pattern: useFlowConfig benzeri.
 * - Module-level cache (singleton Promise + MMKV persist)
 * - 5dk TTL (manuel invalidate ile bypass)
 * - Realtime subscribe: profile satırı değişirse cache + state güncellenir
 *
 * Tüm ekranlar bunu kullanabilir.
 */
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { storage, setItem, getItem } from '@/lib/storage';

export interface ProfileRow {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: 'pilot' | 'cabin' | 'technician' | 'ground' | 'student' | null;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | null;
  daily_goal_minutes: number;
  timezone: string;
  active_hours: number[];
  is_student: boolean;
  created_at: string;
  updated_at: string;
}

const CACHE_KEY = 'airspeak.profile.cache';
const TTL_MS = 5 * 60 * 1000;

interface CacheEntry {
  profile: ProfileRow;
  loadedAt: number;
}

let memCache: CacheEntry | null = null;
let inflight: Promise<ProfileRow | null> | null = null;
let realtimeBound: { userId: string } | null = null;
const subscribers = new Set<(p: ProfileRow | null) => void>();

function readDiskCache(userId: string): ProfileRow | null {
  const raw = getItem<CacheEntry & { userId: string }>(CACHE_KEY);
  if (!raw || raw.userId !== userId) return null;
  if (Date.now() - raw.loadedAt > TTL_MS) return null;
  return raw.profile;
}

function writeDiskCache(userId: string, profile: ProfileRow) {
  setItem(CACHE_KEY, { userId, profile, loadedAt: Date.now() });
}

function broadcast(profile: ProfileRow | null) {
  subscribers.forEach((cb) => cb(profile));
}

async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error || !data) return null;
  return data as ProfileRow;
}

function bindRealtime(userId: string) {
  if (realtimeBound?.userId === userId) return;
  realtimeBound = { userId };
  supabase
    .channel(`profile_${userId}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` },
      (payload) => {
        const next = payload.new as ProfileRow;
        memCache = { profile: next, loadedAt: Date.now() };
        writeDiskCache(userId, next);
        broadcast(next);
      },
    )
    .subscribe();
}

async function loadProfile(userId: string): Promise<ProfileRow | null> {
  if (memCache && Date.now() - memCache.loadedAt < TTL_MS) return memCache.profile;

  if (inflight) return inflight;

  const disk = readDiskCache(userId);
  if (disk) {
    memCache = { profile: disk, loadedAt: Date.now() };
    // Disk hit — paralel olarak fresh fetch (background revalidate)
    void fetchProfile(userId).then((fresh) => {
      if (fresh) {
        memCache = { profile: fresh, loadedAt: Date.now() };
        writeDiskCache(userId, fresh);
        broadcast(fresh);
      }
    });
    return disk;
  }

  inflight = fetchProfile(userId)
    .then((p) => {
      if (p) {
        memCache = { profile: p, loadedAt: Date.now() };
        writeDiskCache(userId, p);
      }
      inflight = null;
      return p;
    })
    .catch((err) => {
      inflight = null;
      throw err;
    });
  return inflight;
}

export function useProfile(userId: string | null | undefined): {
  profile: ProfileRow | null;
  loading: boolean;
  refresh: () => Promise<void>;
} {
  const [profile, setProfile] = useState<ProfileRow | null>(memCache?.profile ?? null);
  const [loading, setLoading] = useState<boolean>(!memCache?.profile && !!userId);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    let mounted = true;
    const cb = (p: ProfileRow | null) => {
      if (mounted) setProfile(p);
    };
    subscribers.add(cb);

    void loadProfile(userId).then((p) => {
      if (!mounted) return;
      setProfile(p);
      setLoading(false);
      bindRealtime(userId);
    });

    return () => {
      mounted = false;
      subscribers.delete(cb);
    };
  }, [userId]);

  async function refresh() {
    if (!userId) return;
    invalidateProfile();
    const p = await loadProfile(userId);
    setProfile(p);
    broadcast(p);
  }

  return { profile, loading, refresh };
}

/**
 * Cache invalidate — profil güncellendikten sonra çağrılır
 * (örn avatar upload, name değişikliği).
 */
export function invalidateProfile() {
  memCache = null;
  storage.delete(CACHE_KEY);
}

/**
 * Optimistic patch — UI'yı bekletmeden cache'i güncelle.
 * DB write paralel devam eder, realtime subscriber zaten geri dönüş garanti eder.
 */
export function patchProfileCache(userId: string, patch: Partial<ProfileRow>) {
  if (!memCache || memCache.profile.id !== userId) return;
  const next = { ...memCache.profile, ...patch };
  memCache = { profile: next, loadedAt: Date.now() };
  writeDiskCache(userId, next);
  broadcast(next);
}
