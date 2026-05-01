/**
 * Trial state — DB authoritative.
 *
 * profiles.trial_started_at / trial_ends_at / trial_used / subscription_status
 * + premium_until (zaten vardı; trial başladığında bu da set edilir).
 *
 * - useTrialStatus(userId): { canStartTrial, isTrialing, daysLeft, ... }
 * - startTrial(): RPC wrapper; idempotent (already_used → ok:false).
 */
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { showPaywall } from '@/stores/paywallStore';

export type SubscriptionStatus =
  | 'free'
  | 'trialing'
  | 'active'
  | 'canceled'
  | 'expired';

export interface TrialRow {
  trial_started_at: string | null;
  trial_ends_at: string | null;
  trial_used: boolean;
  subscription_status: SubscriptionStatus;
  premium_until: string | null;
}

export interface TrialStatus {
  loading: boolean;
  trial: TrialRow | null;
  /** Hiç trial kullanmadıysa true */
  canStartTrial: boolean;
  /** subscription_status === 'trialing' && trial_ends_at gelecekte */
  isTrialing: boolean;
  /** Trialing ise kalan gün (0 alt sınır), aksi 0 */
  daysLeft: number;
  /** Trial bitiş tam saat (string) — countdown UI için */
  endsAtIso: string | null;
}

const TTL_MS = 60 * 1000;
const trialCache = new Map<string, { row: TrialRow | null; loadedAt: number }>();
const trialSubs = new Map<string, Set<(row: TrialRow | null) => void>>();
const trialRealtime = new Set<string>();

async function fetchTrial(userId: string): Promise<TrialRow | null> {
  const { data, error } = await (supabase as any)
    .from('profiles')
    .select('trial_started_at, trial_ends_at, trial_used, subscription_status, premium_until')
    .eq('id', userId)
    .maybeSingle();
  if (error || !data) return null;
  return {
    trial_started_at: data.trial_started_at ?? null,
    trial_ends_at: data.trial_ends_at ?? null,
    trial_used: !!data.trial_used,
    subscription_status: (data.subscription_status as SubscriptionStatus) ?? 'free',
    premium_until: data.premium_until ?? null,
  };
}

function bindTrialRealtime(userId: string) {
  if (trialRealtime.has(userId)) return;
  trialRealtime.add(userId);
  supabase
    .channel(`trial_${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${userId}`,
      },
      async () => {
        const fresh = await fetchTrial(userId);
        trialCache.set(userId, { row: fresh, loadedAt: Date.now() });
        trialSubs.get(userId)?.forEach((cb) => cb(fresh));
      },
    )
    .subscribe();
}

function deriveStatus(row: TrialRow | null, loading: boolean): TrialStatus {
  if (!row) {
    return {
      loading,
      trial: null,
      canStartTrial: !loading,
      isTrialing: false,
      daysLeft: 0,
      endsAtIso: null,
    };
  }
  const endsMs = row.trial_ends_at ? Date.parse(row.trial_ends_at) : 0;
  const isTrialing = row.subscription_status === 'trialing' && endsMs > Date.now();
  const daysLeft = isTrialing
    ? Math.max(0, Math.ceil((endsMs - Date.now()) / 86_400_000))
    : 0;
  return {
    loading,
    trial: row,
    canStartTrial: !row.trial_used,
    isTrialing,
    daysLeft,
    endsAtIso: row.trial_ends_at,
  };
}

export function useTrialStatus(userId: string | null | undefined): TrialStatus {
  const cached = userId ? trialCache.get(userId)?.row : null;
  const [trial, setTrial] = useState<TrialRow | null>(cached ?? null);
  const [loading, setLoading] = useState(!cached && !!userId);

  useEffect(() => {
    if (!userId) {
      setTrial(null);
      setLoading(false);
      return;
    }
    let mounted = true;
    let subSet = trialSubs.get(userId);
    if (!subSet) {
      subSet = new Set();
      trialSubs.set(userId, subSet);
    }
    const cb = (next: TrialRow | null) => {
      if (mounted) setTrial(next);
    };
    subSet.add(cb);

    const entry = trialCache.get(userId);
    if (entry && Date.now() - entry.loadedAt < TTL_MS) {
      setTrial(entry.row);
      setLoading(false);
      bindTrialRealtime(userId);
    } else {
      void fetchTrial(userId).then((r) => {
        if (!mounted) return;
        trialCache.set(userId, { row: r, loadedAt: Date.now() });
        setTrial(r);
        setLoading(false);
        bindTrialRealtime(userId);
      });
    }

    return () => {
      mounted = false;
      subSet!.delete(cb);
    };
  }, [userId]);

  return deriveStatus(trial, loading);
}

// ─── RPC wrapper ──────────────────────────────────────────────────────────
export async function startTrial(): Promise<{
  ok: boolean;
  trial_ends_at?: string;
  days?: number;
  error?: string;
}> {
  const { data, error } = await (supabase as any).rpc('start_trial');
  if (error) return { ok: false, error: error.message };
  return data;
}

// ─── Trial ending paywall watcher ─────────────────────────────────────────
// Trial 1 gün ya da daha az kala client-side paywall'u tetikle. Cooldown'lı.
export function useTrialEndingPaywall(userId: string | null | undefined): void {
  const status = useTrialStatus(userId);
  useEffect(() => {
    if (!status.isTrialing) return;
    if (status.daysLeft > 1) return;
    showPaywall('trial_ending');
  }, [status.isTrialing, status.daysLeft]);
}
