/**
 * Championships query hooks.
 *
 * - useUserChampionships(userId) — kullanıcının tüm şampiyonlukları
 * - useMonthlyChampions(year, month) — belirli ay şampiyonları
 * - useUserMonthlyRank(userId, year, month) — kullanıcının ay sıralaması
 */
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export type ChampionshipType = 'weekly' | 'monthly' | 'yearly';

export interface ChampionshipRow {
  id: string;
  championship_type: ChampionshipType;
  year: number;
  period_number: number;
  role: string | null;
  level_tier: string | null;
  user_id: string;
  snapshot_xp: number;
  awarded_at: string;
}

export interface ChampionWithProfile extends ChampionshipRow {
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

const TTL_MS = 5 * 60 * 1000;

// ─── useUserChampionships ─────────────────────────────────────────────────
const userChampCache = new Map<
  string,
  { rows: ChampionshipRow[]; loadedAt: number }
>();

async function fetchUserChampionships(userId: string): Promise<ChampionshipRow[]> {
  const { data, error } = await supabase
    .from('championships')
    .select('*')
    .eq('user_id', userId)
    .order('awarded_at', { ascending: false });
  if (error || !data) return [];
  return data as ChampionshipRow[];
}

export function useUserChampionships(userId: string | null | undefined): {
  rows: ChampionshipRow[];
  loading: boolean;
  refresh: () => Promise<void>;
} {
  const cached = userId ? userChampCache.get(userId)?.rows : null;
  const [rows, setRows] = useState<ChampionshipRow[]>(cached ?? []);
  const [loading, setLoading] = useState(!cached && !!userId);

  useEffect(() => {
    if (!userId) {
      setRows([]);
      setLoading(false);
      return;
    }
    let mounted = true;

    const entry = userChampCache.get(userId);
    if (entry && Date.now() - entry.loadedAt < TTL_MS) {
      setRows(entry.rows);
      setLoading(false);
      return;
    }
    void fetchUserChampionships(userId).then((r) => {
      if (!mounted) return;
      userChampCache.set(userId, { rows: r, loadedAt: Date.now() });
      setRows(r);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [userId]);

  async function refresh() {
    if (!userId) return;
    const fresh = await fetchUserChampionships(userId);
    userChampCache.set(userId, { rows: fresh, loadedAt: Date.now() });
    setRows(fresh);
  }

  return { rows, loading, refresh };
}

// ─── useMonthlyChampions ──────────────────────────────────────────────────
async function fetchMonthlyChampions(
  year: number,
  month: number,
): Promise<ChampionWithProfile[]> {
  const { data, error } = await supabase
    .from('championships')
    .select(
      'id, championship_type, year, period_number, role, level_tier, user_id, snapshot_xp, awarded_at, profiles!inner(username, full_name, avatar_url)',
    )
    .eq('championship_type', 'monthly')
    .eq('year', year)
    .eq('period_number', month)
    .order('snapshot_xp', { ascending: false });
  if (error || !data) return [];
  return (data as any[]).map((r) => ({
    id: r.id,
    championship_type: r.championship_type,
    year: r.year,
    period_number: r.period_number,
    role: r.role,
    level_tier: r.level_tier,
    user_id: r.user_id,
    snapshot_xp: r.snapshot_xp,
    awarded_at: r.awarded_at,
    username: r.profiles?.username ?? null,
    full_name: r.profiles?.full_name ?? null,
    avatar_url: r.profiles?.avatar_url ?? null,
  }));
}

export function useMonthlyChampions(
  year: number | null,
  month: number | null,
): { rows: ChampionWithProfile[]; loading: boolean } {
  const [rows, setRows] = useState<ChampionWithProfile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (year == null || month == null) return;
    let mounted = true;
    setLoading(true);
    void fetchMonthlyChampions(year, month).then((r) => {
      if (mounted) {
        setRows(r);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [year, month]);

  return { rows, loading };
}

// ─── useUserMonthlyRank ───────────────────────────────────────────────────
// Belirli aydaki tüm rol×tier'lardan kullanıcının pozisyonu — basitleştirme:
// Sadece kullanıcının kendi rol×tier'ında league_rewards.rank okunur.
export async function fetchUserMonthlyRank(
  userId: string,
  year: number,
  month: number,
): Promise<number | null> {
  const { data, error } = await supabase
    .from('league_rewards')
    .select('rank, reward_value, season_id, league_seasons!inner(season_type, year, period_number)')
    .eq('user_id', userId)
    .eq('league_seasons.season_type', 'monthly')
    .eq('league_seasons.year', year)
    .eq('league_seasons.period_number', month)
    .order('rank', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return (data as any).rank ?? null;
}
