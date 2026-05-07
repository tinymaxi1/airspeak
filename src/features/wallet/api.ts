/**
 * Wallet DB layer — coin + inventory.
 *
 * - useWallet(userId) — coins + streak_freezes + hints + xp_boost (realtime)
 * - addCoins / spendCoins / purchaseShopItem / applyStreakFreeze
 * - migrateLocalCoins — first launch one-way
 * - useCoinTransactions(userId) — audit history
 */
import { useEffect, useState } from 'react';
import * as Sentry from '@sentry/react-native';
import { supabase } from '@/lib/supabase';

export interface WalletRow {
  user_id: string;
  coins: number;
  streak_freezes_inventory: number;
  hints_inventory: number;
  lesson_skips_inventory: number;
  xp_boost_until: string | null;
}

export interface CoinTx {
  id: string;
  amount: number;
  balance_after: number;
  reason: string;
  source: string;
  metadata: any;
  created_at: string;
}

const TTL_MS = 2 * 60 * 1000;

const walletCache = new Map<string, { row: WalletRow | null; loadedAt: number }>();
const walletSubs = new Map<string, Set<(row: WalletRow | null) => void>>();
const walletRealtime = new Set<string>();

async function fetchWallet(userId: string): Promise<WalletRow | null> {
  const { data, error } = await (supabase as any)
    .from('profiles')
    .select('id, coins, streak_freezes_inventory, hints_inventory, lesson_skips_inventory, xp_boost_until')
    .eq('id', userId)
    .maybeSingle();
  if (error || !data) return null;
  return {
    user_id: (data as any).id,
    coins: (data as any).coins ?? 0,
    streak_freezes_inventory: (data as any).streak_freezes_inventory ?? 0,
    hints_inventory: (data as any).hints_inventory ?? 0,
    lesson_skips_inventory: (data as any).lesson_skips_inventory ?? 0,
    xp_boost_until: (data as any).xp_boost_until ?? null,
  };
}

function bindWalletRealtime(userId: string) {
  if (walletRealtime.has(userId)) return;
  walletRealtime.add(userId);
  supabase
    .channel(`wallet_${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${userId}`,
      },
      async () => {
        const fresh = await fetchWallet(userId);
        walletCache.set(userId, { row: fresh, loadedAt: Date.now() });
        walletSubs.get(userId)?.forEach((cb) => cb(fresh));
      },
    )
    .subscribe();
}

export function useWallet(userId: string | null | undefined): {
  wallet: WalletRow | null;
  loading: boolean;
  refresh: () => Promise<void>;
} {
  const cached = userId ? walletCache.get(userId)?.row : null;
  const [wallet, setWallet] = useState<WalletRow | null>(cached ?? null);
  const [loading, setLoading] = useState(!cached && !!userId);

  useEffect(() => {
    if (!userId) {
      setWallet(null);
      setLoading(false);
      return;
    }
    let mounted = true;
    let subSet = walletSubs.get(userId);
    if (!subSet) {
      subSet = new Set();
      walletSubs.set(userId, subSet);
    }
    const cb = (next: WalletRow | null) => {
      if (mounted) setWallet(next);
    };
    subSet.add(cb);

    const entry = walletCache.get(userId);
    if (entry && Date.now() - entry.loadedAt < TTL_MS) {
      setWallet(entry.row);
      setLoading(false);
      bindWalletRealtime(userId);
    } else {
      void fetchWallet(userId).then((r) => {
        if (!mounted) return;
        walletCache.set(userId, { row: r, loadedAt: Date.now() });
        setWallet(r);
        setLoading(false);
        bindWalletRealtime(userId);
      });
    }

    return () => {
      mounted = false;
      subSet!.delete(cb);
    };
  }, [userId]);

  async function refresh() {
    if (!userId) return;
    const fresh = await fetchWallet(userId);
    walletCache.set(userId, { row: fresh, loadedAt: Date.now() });
    setWallet(fresh);
  }

  return { wallet, loading, refresh };
}

// ─── RPC wrappers ─────────────────────────────────────────────────────────

export async function addCoins(args: {
  amount: number;
  reason: string;
  source?:
    | 'lesson_completed'
    | 'admin_grant'
    | 'league_reward'
    | 'competition_reward'
    | 'other';
  metadata?: Record<string, unknown>;
}): Promise<{ ok: boolean; balance?: number; error?: string }> {
  const { data, error } = await (supabase as any).rpc('add_coins', {
    p_amount: args.amount,
    p_reason: args.reason,
    p_source: args.source ?? 'other',
    p_metadata: args.metadata ?? null,
  });
  if (error) {
    Sentry.captureException(new Error(error.message), {
      tags: { function: 'addCoins', source: args.source ?? 'other' },
      extra: { amount: args.amount, reason: args.reason },
    });
    return { ok: false, error: error.message };
  }
  return data;
}

export async function spendCoins(args: {
  amount: number;
  reason: string;
  source?: 'shop_purchase' | 'streak_freeze_use' | 'other';
  metadata?: Record<string, unknown>;
}): Promise<{ ok: boolean; balance?: number; error?: string }> {
  const { data, error } = await (supabase as any).rpc('spend_coins', {
    p_amount: args.amount,
    p_reason: args.reason,
    p_source: args.source ?? 'other',
    p_metadata: args.metadata ?? null,
  });
  if (error) return { ok: false, error: error.message };
  return data;
}

export async function purchaseShopItem(args: {
  itemId: string;
  cost: number;
  inventoryField?:
    | 'streak_freezes_inventory'
    | 'hints_inventory'
    | 'lesson_skips_inventory';
  inventoryCount?: number;
  boostMinutes?: number;
}): Promise<{ ok: boolean; balance?: number; error?: string }> {
  const { data, error } = await (supabase as any).rpc('purchase_shop_item', {
    p_item_id: args.itemId,
    p_cost: args.cost,
    p_inventory_field: args.inventoryField ?? null,
    p_inventory_count: args.inventoryCount ?? 1,
    p_boost_minutes: args.boostMinutes ?? null,
  });
  if (error) return { ok: false, error: error.message };
  return data;
}

export async function applyStreakFreeze(): Promise<{
  ok: boolean;
  frozen_until?: string;
  remaining_inventory?: number;
  error?: string;
}> {
  const { data, error } = await (supabase as any).rpc('apply_streak_freeze');
  if (error) return { ok: false, error: error.message };
  return data;
}

export async function migrateLocalCoins(args: {
  coins: number;
  freezes?: number;
  hints?: number;
}): Promise<{ ok: boolean; already_migrated?: boolean; error?: string }> {
  const { data, error } = await (supabase as any).rpc('migrate_local_coins', {
    p_local_coins: args.coins,
    p_local_freezes: args.freezes ?? 0,
    p_local_hints: args.hints ?? 0,
  });
  if (error) return { ok: false, error: error.message };
  return data;
}

// ─── useCoinTransactions ──────────────────────────────────────────────────
export function useCoinTransactions(
  userId: string | null | undefined,
  limit = 50,
): { rows: CoinTx[]; loading: boolean } {
  const [rows, setRows] = useState<CoinTx[]>([]);
  const [loading, setLoading] = useState(!!userId);

  useEffect(() => {
    if (!userId) {
      setRows([]);
      setLoading(false);
      return;
    }
    let mounted = true;
    void (supabase as any)
      .from('coin_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
      .then(({ data }: { data: any }) => {
        if (mounted) {
          setRows((data as CoinTx[]) ?? []);
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, [userId, limit]);

  return { rows, loading };
}
