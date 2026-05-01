/**
 * Social proof + last_active heartbeat (light, DB COUNT).
 *
 * Realtime presence YOK — Sprint 6 chat/online indicator ile birlikte gelecek.
 * Şimdi: profiles.last_active_at son 24h count.
 *
 * - useActiveCount24h(): Son 24h aktif kullanıcı sayısı (5dk cache).
 * - useLastActiveHeartbeat(): App foreground'a geçince bump_last_active() RPC.
 */
import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

const COUNT_TTL_MS = 5 * 60 * 1000;

let countCache: { value: number; loadedAt: number } | null = null;
const countSubs = new Set<(n: number) => void>();
let inFlight: Promise<number | null> | null = null;

async function fetchActiveCount(): Promise<number | null> {
  const { data, error } = await (supabase as any).rpc('get_active_count_24h');
  if (error || data === null || data === undefined) return null;
  const n = typeof data === 'number' ? data : Number(data);
  return Number.isFinite(n) ? n : null;
}

async function ensureCount(): Promise<number | null> {
  if (countCache && Date.now() - countCache.loadedAt < COUNT_TTL_MS) {
    return countCache.value;
  }
  if (inFlight) return inFlight;
  inFlight = fetchActiveCount().then((n) => {
    inFlight = null;
    if (n === null) return null;
    countCache = { value: n, loadedAt: Date.now() };
    countSubs.forEach((cb) => cb(n));
    return n;
  });
  return inFlight;
}

export function useActiveCount24h(): { count: number | null; loading: boolean } {
  const [count, setCount] = useState<number | null>(countCache?.value ?? null);
  const [loading, setLoading] = useState(!countCache);

  useEffect(() => {
    let mounted = true;
    const cb = (n: number) => {
      if (mounted) {
        setCount(n);
        setLoading(false);
      }
    };
    countSubs.add(cb);

    void ensureCount().then((n) => {
      if (!mounted) return;
      if (n !== null) setCount(n);
      setLoading(false);
    });

    return () => {
      mounted = false;
      countSubs.delete(cb);
    };
  }, []);

  return { count, loading };
}

// ─── Heartbeat ────────────────────────────────────────────────────────────
const HEARTBEAT_MIN_INTERVAL_MS = 5 * 60 * 1000;

async function bumpLastActive(): Promise<void> {
  await (supabase as any).rpc('bump_last_active').catch(() => undefined);
}

export function useLastActiveHeartbeat(): void {
  const userId = useAuthStore((s) => s.user?.id);
  const lastBumpRef = useRef<number>(0);

  useEffect(() => {
    if (!userId) return;

    const tryBump = () => {
      if (Date.now() - lastBumpRef.current < HEARTBEAT_MIN_INTERVAL_MS) return;
      lastBumpRef.current = Date.now();
      void bumpLastActive();
    };

    tryBump();

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') tryBump();
    });

    return () => sub.remove();
  }, [userId]);
}
