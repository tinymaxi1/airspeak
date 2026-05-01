/**
 * Detaylı istatistik DB layer.
 *
 * - useWeeklyStats(userId, weeks=12): weekly_user_stats view
 * - useMonthlyStats(userId, months=12): monthly_user_stats view
 * - useHourlyActivity(userId, tz, days=90): user_hourly_activity RPC
 * - useDowActivity(userId, tz, days=90): user_dow_activity RPC
 * - usePeerComparison(userId): get_peer_comparison RPC
 * - useGoalsProgress(userId): get_user_goals_progress RPC
 * - updateUserGoals: RPC wrapper
 */
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────
export interface WeeklyStat {
  week_start: string;
  lessons_count: number;
  perfect_count: number;
  total_xp: number;
  accuracy_avg: number | null;
  total_seconds: number;
}

export interface MonthlyStat {
  month_start: string;
  lessons_count: number;
  perfect_count: number;
  total_xp: number;
  accuracy_avg: number | null;
  total_seconds: number;
}

export interface HourlyBucket {
  hour: number;
  lessons_count: number;
}

export interface DowBucket {
  dow: number;
  lessons_count: number;
}

export interface PeerComparison {
  role: string;
  level: string;
  peer_count: number;
  week_xp: number;
  week_xp_percentile: number;
  total_xp: number;
  total_xp_percentile: number;
  current_streak: number;
  streak_percentile: number;
}

export interface GoalsProgress {
  daily_goal_minutes: number;
  today_minutes: number;
  daily_progress_pct: number;
  weekly_goal_xp: number;
  week_xp: number;
  weekly_progress_pct: number;
  monthly_goal_lessons: number;
  month_lessons: number;
  monthly_progress_pct: number;
}

// ─── useWeeklyStats ──────────────────────────────────────────────────────
export function useWeeklyStats(
  userId: string | null | undefined,
  weeks = 12,
): { rows: WeeklyStat[]; loading: boolean; refresh: () => Promise<void> } {
  const [rows, setRows] = useState<WeeklyStat[]>([]);
  const [loading, setLoading] = useState(!!userId);

  const refresh = useCallback(async () => {
    if (!userId) {
      setRows([]);
      setLoading(false);
      return;
    }
    const { data } = await (supabase as any)
      .from('weekly_user_stats')
      .select('*')
      .eq('user_id', userId)
      .order('week_start', { ascending: false })
      .limit(weeks);
    setRows(((data as WeeklyStat[]) ?? []).reverse());
    setLoading(false);
  }, [userId, weeks]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { rows, loading, refresh };
}

// ─── useMonthlyStats ─────────────────────────────────────────────────────
export function useMonthlyStats(
  userId: string | null | undefined,
  months = 12,
): { rows: MonthlyStat[]; loading: boolean; refresh: () => Promise<void> } {
  const [rows, setRows] = useState<MonthlyStat[]>([]);
  const [loading, setLoading] = useState(!!userId);

  const refresh = useCallback(async () => {
    if (!userId) {
      setRows([]);
      setLoading(false);
      return;
    }
    const { data } = await (supabase as any)
      .from('monthly_user_stats')
      .select('*')
      .eq('user_id', userId)
      .order('month_start', { ascending: false })
      .limit(months);
    setRows(((data as MonthlyStat[]) ?? []).reverse());
    setLoading(false);
  }, [userId, months]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { rows, loading, refresh };
}

// ─── useHourlyActivity ───────────────────────────────────────────────────
export function useHourlyActivity(
  userId: string | null | undefined,
  tz = 'UTC',
  days = 90,
): { buckets: HourlyBucket[]; loading: boolean } {
  const [buckets, setBuckets] = useState<HourlyBucket[]>([]);
  const [loading, setLoading] = useState(!!userId);

  useEffect(() => {
    if (!userId) {
      setBuckets([]);
      setLoading(false);
      return;
    }
    let mounted = true;
    void (async () => {
      const { data } = await (supabase as any).rpc('user_hourly_activity', {
        p_user_id: userId,
        p_tz: tz,
        p_days: days,
      });
      if (!mounted) return;
      setBuckets(((data as any[]) ?? []).map((r) => ({
        hour: Number(r.hour),
        lessons_count: Number(r.lessons_count),
      })));
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [userId, tz, days]);

  return { buckets, loading };
}

// ─── useDowActivity ──────────────────────────────────────────────────────
export function useDowActivity(
  userId: string | null | undefined,
  tz = 'UTC',
  days = 90,
): { buckets: DowBucket[]; loading: boolean } {
  const [buckets, setBuckets] = useState<DowBucket[]>([]);
  const [loading, setLoading] = useState(!!userId);

  useEffect(() => {
    if (!userId) {
      setBuckets([]);
      setLoading(false);
      return;
    }
    let mounted = true;
    void (async () => {
      const { data } = await (supabase as any).rpc('user_dow_activity', {
        p_user_id: userId,
        p_tz: tz,
        p_days: days,
      });
      if (!mounted) return;
      setBuckets(((data as any[]) ?? []).map((r) => ({
        dow: Number(r.dow),
        lessons_count: Number(r.lessons_count),
      })));
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [userId, tz, days]);

  return { buckets, loading };
}

// ─── usePeerComparison ───────────────────────────────────────────────────
export function usePeerComparison(
  userId: string | null | undefined,
): { peer: PeerComparison | null; loading: boolean } {
  const [peer, setPeer] = useState<PeerComparison | null>(null);
  const [loading, setLoading] = useState(!!userId);

  useEffect(() => {
    if (!userId) {
      setPeer(null);
      setLoading(false);
      return;
    }
    let mounted = true;
    void (async () => {
      const { data } = await (supabase as any).rpc('get_peer_comparison', {
        p_user_id: userId,
      });
      if (!mounted) return;
      setPeer((data as PeerComparison) ?? null);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [userId]);

  return { peer, loading };
}

// ─── useGoalsProgress ────────────────────────────────────────────────────
export function useGoalsProgress(
  userId: string | null | undefined,
): { goals: GoalsProgress | null; loading: boolean; refresh: () => Promise<void> } {
  const [goals, setGoals] = useState<GoalsProgress | null>(null);
  const [loading, setLoading] = useState(!!userId);

  const refresh = useCallback(async () => {
    if (!userId) {
      setGoals(null);
      setLoading(false);
      return;
    }
    const { data } = await (supabase as any).rpc('get_user_goals_progress', {
      p_user_id: userId,
    });
    setGoals((data as GoalsProgress) ?? null);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { goals, loading, refresh };
}

// ─── updateUserGoals RPC ─────────────────────────────────────────────────
export async function updateUserGoals(args: {
  dailyMinutes?: number;
  weeklyXp?: number;
  monthlyLessons?: number;
}): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await (supabase as any).rpc('update_user_goals', {
    p_daily_minutes: args.dailyMinutes ?? null,
    p_weekly_xp: args.weeklyXp ?? null,
    p_monthly_lessons: args.monthlyLessons ?? null,
  });
  if (error) return { ok: false, error: error.message };
  return data;
}
