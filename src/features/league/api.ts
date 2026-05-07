/**
 * League / XP DB layer.
 *
 * - bumpUserXp(): lesson tamamlandıktan sonra çağrılır. user_lesson_progress
 *   upsert + user_xp_summary increment + streak update + lazy league assign.
 * - useUserXpSummary: total/week/month/year XP + last_activity. Module cache +
 *   realtime subscribe.
 * - useLeagueMembership: kullanıcının aktif weekly group + rank.
 * - useLeagueGroup: group içindeki tüm üyeler (leaderboard) — realtime.
 */
import { useEffect, useState } from 'react';
import * as Sentry from '@sentry/react-native';
import { supabase } from '@/lib/supabase';

const TTL_MS = 5 * 60 * 1000;

// ─── Types ──────────────────────────────────────────────────────────────────
export type LeagueClass =
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'sapphire'
  | 'ruby'
  | 'emerald'
  | 'diamond';

export type PromotionStatus = 'promoted' | 'demoted' | 'stable' | 'pending';

export interface UserXpSummary {
  user_id: string;
  total_xp: number;
  week_xp: number;
  month_xp: number;
  year_xp: number;
  last_activity_at: string | null;
  current_iso_week: number | null;
  current_year_month: string | null;
  current_year: number | null;
  updated_at: string;
}

export interface LeagueMembership {
  id: string;
  group_id: string;
  user_id: string;
  week_xp: number;
  rank: number | null;
  promotion_status: PromotionStatus;
  joined_at: string;
}

export interface LeagueGroupRow {
  id: string;
  season_id: string;
  role: string | null;
  level_tier: string | null;
  class_tier: LeagueClass;
  member_count: number;
}

export interface LeagueLeaderboardEntry {
  membership_id: string;
  user_id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  week_xp: number;
  rank: number | null;
  promotion_status: PromotionStatus;
  is_self: boolean;
}

export interface BumpResult {
  ok: boolean;
  lesson_id?: string;
  xp_awarded?: number;
  current_streak?: number;
  assigned?: boolean;
  error?: string;
}

// ─── bump_user_xp RPC ──────────────────────────────────────────────────────
export async function bumpUserXp(args: {
  lessonId: string;
  score: number;
  xp: number;
  timeSpentSec?: number;
}): Promise<BumpResult> {
  const { data, error } = await (supabase as any).rpc('bump_user_xp', {
    p_lesson_id: args.lessonId,
    p_score: args.score,
    p_xp: args.xp,
    p_time_spent: args.timeSpentSec ?? null,
  });
  if (error) {
    Sentry.captureException(new Error(error.message), {
      tags: { function: 'bumpUserXp' },
      extra: { lessonId: args.lessonId, score: args.score, xp: args.xp },
    });
    return { ok: false, error: error.message };
  }
  return data as BumpResult;
}

export async function assignUserToLeague(
  defaultClass: LeagueClass = 'bronze',
): Promise<{ ok: boolean; group_id?: string; class?: LeagueClass; error?: string }> {
  const { data, error } = await (supabase as any).rpc('assign_user_to_league', {
    p_default_class: defaultClass,
  });
  if (error) return { ok: false, error: error.message };
  return data;
}

// ─── useUserXpSummary ─────────────────────────────────────────────────────
const xpCache = new Map<string, { row: UserXpSummary | null; loadedAt: number }>();
const xpSubs = new Map<string, Set<(row: UserXpSummary | null) => void>>();
const xpRealtime = new Set<string>();

async function fetchUserXp(userId: string): Promise<UserXpSummary | null> {
  const { data, error } = await supabase
    .from('user_xp_summary')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) return null;
  return (data as UserXpSummary) ?? null;
}

function bindXpRealtime(userId: string) {
  if (xpRealtime.has(userId)) return;
  xpRealtime.add(userId);
  supabase
    .channel(`user_xp_${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_xp_summary',
        filter: `user_id=eq.${userId}`,
      },
      async () => {
        const fresh = await fetchUserXp(userId);
        xpCache.set(userId, { row: fresh, loadedAt: Date.now() });
        xpSubs.get(userId)?.forEach((cb) => cb(fresh));
      },
    )
    .subscribe();
}

export function useUserXpSummary(userId: string | null | undefined): {
  row: UserXpSummary | null;
  loading: boolean;
  refresh: () => Promise<void>;
} {
  const cached = userId ? xpCache.get(userId)?.row : null;
  const [row, setRow] = useState<UserXpSummary | null>(cached ?? null);
  const [loading, setLoading] = useState(!cached && !!userId);

  useEffect(() => {
    if (!userId) {
      setRow(null);
      setLoading(false);
      return;
    }
    let mounted = true;
    let subSet = xpSubs.get(userId);
    if (!subSet) {
      subSet = new Set();
      xpSubs.set(userId, subSet);
    }
    const cb = (next: UserXpSummary | null) => {
      if (mounted) setRow(next);
    };
    subSet.add(cb);

    const entry = xpCache.get(userId);
    if (entry && Date.now() - entry.loadedAt < TTL_MS) {
      setRow(entry.row);
      setLoading(false);
      bindXpRealtime(userId);
    } else {
      void fetchUserXp(userId).then((r) => {
        if (!mounted) return;
        xpCache.set(userId, { row: r, loadedAt: Date.now() });
        setRow(r);
        setLoading(false);
        bindXpRealtime(userId);
      });
    }

    return () => {
      mounted = false;
      subSet!.delete(cb);
    };
  }, [userId]);

  async function refresh() {
    if (!userId) return;
    const fresh = await fetchUserXp(userId);
    xpCache.set(userId, { row: fresh, loadedAt: Date.now() });
    setRow(fresh);
  }

  return { row, loading, refresh };
}

// ─── useLeagueMembership ──────────────────────────────────────────────────
interface ActiveMembership {
  membership: LeagueMembership;
  group: LeagueGroupRow;
}

const memCache = new Map<string, { entry: ActiveMembership | null; loadedAt: number }>();
const memSubs = new Map<string, Set<(e: ActiveMembership | null) => void>>();
const memRealtime = new Set<string>();

async function fetchMembership(userId: string): Promise<ActiveMembership | null> {
  // Active weekly season altında user'ın grubu
  const { data, error } = await supabase
    .from('league_memberships')
    .select(
      'id, group_id, user_id, week_xp, rank, promotion_status, joined_at, league_groups!inner(id, season_id, role, level_tier, class_tier, member_count, league_seasons!inner(season_type, status))',
    )
    .eq('user_id', userId)
    .eq('league_groups.league_seasons.season_type', 'weekly')
    .eq('league_groups.league_seasons.status', 'active')
    .maybeSingle();
  if (error || !data) return null;

  const row = data as any;
  return {
    membership: {
      id: row.id,
      group_id: row.group_id,
      user_id: row.user_id,
      week_xp: row.week_xp,
      rank: row.rank,
      promotion_status: row.promotion_status,
      joined_at: row.joined_at,
    },
    group: {
      id: row.league_groups.id,
      season_id: row.league_groups.season_id,
      role: row.league_groups.role,
      level_tier: row.league_groups.level_tier,
      class_tier: row.league_groups.class_tier,
      member_count: row.league_groups.member_count,
    },
  };
}

function bindMembershipRealtime(userId: string) {
  if (memRealtime.has(userId)) return;
  memRealtime.add(userId);
  supabase
    .channel(`league_membership_${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'league_memberships',
        filter: `user_id=eq.${userId}`,
      },
      async () => {
        const fresh = await fetchMembership(userId);
        memCache.set(userId, { entry: fresh, loadedAt: Date.now() });
        memSubs.get(userId)?.forEach((cb) => cb(fresh));
      },
    )
    .subscribe();
}

export function useLeagueMembership(userId: string | null | undefined): {
  membership: LeagueMembership | null;
  group: LeagueGroupRow | null;
  loading: boolean;
  refresh: () => Promise<void>;
} {
  const cached = userId ? memCache.get(userId)?.entry : null;
  const [entry, setEntry] = useState<ActiveMembership | null>(cached ?? null);
  const [loading, setLoading] = useState(!cached && !!userId);

  useEffect(() => {
    if (!userId) {
      setEntry(null);
      setLoading(false);
      return;
    }
    let mounted = true;
    let subSet = memSubs.get(userId);
    if (!subSet) {
      subSet = new Set();
      memSubs.set(userId, subSet);
    }
    const cb = (next: ActiveMembership | null) => {
      if (mounted) setEntry(next);
    };
    subSet.add(cb);

    const cacheEntry = memCache.get(userId);
    if (cacheEntry && Date.now() - cacheEntry.loadedAt < TTL_MS) {
      setEntry(cacheEntry.entry);
      setLoading(false);
      bindMembershipRealtime(userId);
    } else {
      void fetchMembership(userId).then((e) => {
        if (!mounted) return;
        memCache.set(userId, { entry: e, loadedAt: Date.now() });
        setEntry(e);
        setLoading(false);
        bindMembershipRealtime(userId);
      });
    }

    return () => {
      mounted = false;
      subSet!.delete(cb);
    };
  }, [userId]);

  async function refresh() {
    if (!userId) return;
    const fresh = await fetchMembership(userId);
    memCache.set(userId, { entry: fresh, loadedAt: Date.now() });
    setEntry(fresh);
  }

  return {
    membership: entry?.membership ?? null,
    group: entry?.group ?? null,
    loading,
    refresh,
  };
}

// ─── useLeagueGroup (leaderboard) ────────────────────────────────────────
const groupCache = new Map<string, { rows: LeagueLeaderboardEntry[]; loadedAt: number }>();
const groupSubs = new Map<string, Set<(rows: LeagueLeaderboardEntry[]) => void>>();
const groupRealtime = new Set<string>();

async function fetchGroupLeaderboard(
  groupId: string,
  selfUserId: string | null | undefined,
): Promise<LeagueLeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('league_memberships')
    .select(
      'id, user_id, week_xp, rank, promotion_status, profiles!inner(username, full_name, avatar_url)',
    )
    .eq('group_id', groupId)
    .order('week_xp', { ascending: false })
    .order('joined_at', { ascending: true })
    .limit(60);

  if (error || !data) return [];

  return (data as any[]).map((r, idx) => ({
    membership_id: r.id,
    user_id: r.user_id,
    username: r.profiles?.username ?? null,
    full_name: r.profiles?.full_name ?? null,
    avatar_url: r.profiles?.avatar_url ?? null,
    week_xp: r.week_xp,
    rank: r.rank ?? idx + 1,
    promotion_status: r.promotion_status,
    is_self: r.user_id === selfUserId,
  }));
}

function bindGroupRealtime(groupId: string, selfUserId: string | null | undefined) {
  if (groupRealtime.has(groupId)) return;
  groupRealtime.add(groupId);
  supabase
    .channel(`league_group_${groupId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'league_memberships',
        filter: `group_id=eq.${groupId}`,
      },
      async () => {
        const fresh = await fetchGroupLeaderboard(groupId, selfUserId);
        groupCache.set(groupId, { rows: fresh, loadedAt: Date.now() });
        groupSubs.get(groupId)?.forEach((cb) => cb(fresh));
      },
    )
    .subscribe();
}

export function useLeagueGroup(
  groupId: string | null | undefined,
  selfUserId: string | null | undefined,
): {
  rows: LeagueLeaderboardEntry[];
  loading: boolean;
  refresh: () => Promise<void>;
} {
  const cached = groupId ? groupCache.get(groupId)?.rows : null;
  const [rows, setRows] = useState<LeagueLeaderboardEntry[]>(cached ?? []);
  const [loading, setLoading] = useState(!cached && !!groupId);

  useEffect(() => {
    if (!groupId) {
      setRows([]);
      setLoading(false);
      return;
    }
    let mounted = true;
    let subSet = groupSubs.get(groupId);
    if (!subSet) {
      subSet = new Set();
      groupSubs.set(groupId, subSet);
    }
    const cb = (next: LeagueLeaderboardEntry[]) => {
      if (mounted) {
        // is_self güncel selfUserId'ye göre yeniden işaretle
        setRows(
          next.map((r) => ({ ...r, is_self: r.user_id === selfUserId })),
        );
      }
    };
    subSet.add(cb);

    const entry = groupCache.get(groupId);
    if (entry && Date.now() - entry.loadedAt < TTL_MS) {
      cb(entry.rows);
      setLoading(false);
      bindGroupRealtime(groupId, selfUserId);
    } else {
      void fetchGroupLeaderboard(groupId, selfUserId).then((r) => {
        if (!mounted) return;
        groupCache.set(groupId, { rows: r, loadedAt: Date.now() });
        setRows(r);
        setLoading(false);
        bindGroupRealtime(groupId, selfUserId);
      });
    }

    return () => {
      mounted = false;
      subSet!.delete(cb);
    };
  }, [groupId, selfUserId]);

  async function refresh() {
    if (!groupId) return;
    const fresh = await fetchGroupLeaderboard(groupId, selfUserId);
    groupCache.set(groupId, { rows: fresh, loadedAt: Date.now() });
    setRows(fresh);
  }

  return { rows, loading, refresh };
}
