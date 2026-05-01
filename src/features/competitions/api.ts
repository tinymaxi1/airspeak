/**
 * Competitions DB layer (Sprint 4F).
 *
 * - useActiveCompetitions — announced + active yarışmalar
 * - useCompetition(slug) — tek yarışma
 * - useUserEntry(userId, competitionId) — kullanıcının kayıt + rank
 * - useCompetitionLeaderboard(competitionId) — top 50 score DESC
 * - joinCompetition(competitionId) — RPC wrapper
 * - useUserCompetitionRewards(userId) — kullanıcının ödülleri
 */
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export type CompetitionStatus = 'draft' | 'announced' | 'active' | 'closed' | 'cancelled';
export type CompetitionTheme =
  | 'icao_focus'
  | 'phraseology'
  | 'vocabulary_blast'
  | 'maintenance'
  | 'cabin_safety'
  | 'seasonal'
  | 'company_event'
  | 'other';
export type CompetitionType =
  | 'xp_race'
  | 'lesson_count'
  | 'perfect_score'
  | 'streak'
  | 'specific_content';

export interface CompetitionRow {
  id: string;
  slug: string;
  name: string;
  name_tr: string | null;
  description: string | null;
  description_tr: string | null;
  theme: CompetitionTheme;
  type: CompetitionType;
  rules: any;
  target_role: string | null;
  target_level_tier: string | null;
  start_date: string;
  end_date: string;
  is_premium: boolean;
  entry_cost_coin: number;
  prize_pool: any[];
  banner_url: string | null;
  icon_emoji: string;
  status: CompetitionStatus;
  resolved_at: string | null;
}

export interface CompetitionEntryRow {
  id: string;
  competition_id: string;
  user_id: string;
  score: number;
  rank: number | null;
  joined_at: string;
  rewards_granted: boolean;
}

export interface LeaderboardEntry {
  entry_id: string;
  user_id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  score: number;
  rank: number | null;
  is_self: boolean;
}

const TTL_MS = 5 * 60 * 1000;

// ─── useActiveCompetitions ────────────────────────────────────────────────
let activeCache: { rows: CompetitionRow[]; loadedAt: number } | null = null;

async function fetchActive(): Promise<CompetitionRow[]> {
  const { data, error } = await supabase
    .from('competitions')
    .select('*')
    .in('status', ['announced', 'active'])
    .order('start_date', { ascending: true });
  if (error || !data) return [];
  return data as CompetitionRow[];
}

export function useActiveCompetitions(): {
  rows: CompetitionRow[];
  loading: boolean;
  refresh: () => Promise<void>;
} {
  const [rows, setRows] = useState<CompetitionRow[]>(activeCache?.rows ?? []);
  const [loading, setLoading] = useState(!activeCache);

  useEffect(() => {
    let mounted = true;
    if (activeCache && Date.now() - activeCache.loadedAt < TTL_MS) {
      setLoading(false);
      return;
    }
    void fetchActive().then((r) => {
      if (!mounted) return;
      activeCache = { rows: r, loadedAt: Date.now() };
      setRows(r);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  async function refresh() {
    const fresh = await fetchActive();
    activeCache = { rows: fresh, loadedAt: Date.now() };
    setRows(fresh);
  }

  return { rows, loading, refresh };
}

// ─── useCompetition (single by slug) ─────────────────────────────────────
export function useCompetition(slug: string | null | undefined): {
  row: CompetitionRow | null;
  loading: boolean;
} {
  const [row, setRow] = useState<CompetitionRow | null>(null);
  const [loading, setLoading] = useState(!!slug);

  useEffect(() => {
    if (!slug) {
      setRow(null);
      setLoading(false);
      return;
    }
    let mounted = true;
    setLoading(true);
    void supabase
      .from('competitions')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()
      .then(({ data }) => {
        if (!mounted) return;
        setRow((data as CompetitionRow) ?? null);
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [slug]);

  return { row, loading };
}

// ─── useUserEntry ─────────────────────────────────────────────────────────
export function useUserEntry(
  userId: string | null | undefined,
  competitionId: string | null | undefined,
): {
  entry: CompetitionEntryRow | null;
  loading: boolean;
  refresh: () => Promise<void>;
} {
  const [entry, setEntry] = useState<CompetitionEntryRow | null>(null);
  const [loading, setLoading] = useState(!!userId && !!competitionId);

  async function load() {
    if (!userId || !competitionId) {
      setEntry(null);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from('competition_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('competition_id', competitionId)
      .maybeSingle();
    setEntry((data as CompetitionEntryRow) ?? null);
    setLoading(false);
  }

  useEffect(() => {
    let mounted = true;
    void load().catch(() => {
      if (mounted) setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [userId, competitionId]);

  return { entry, loading, refresh: load };
}

// ─── useCompetitionLeaderboard ────────────────────────────────────────────
export function useCompetitionLeaderboard(
  competitionId: string | null | undefined,
  selfUserId: string | null | undefined,
): {
  rows: LeaderboardEntry[];
  loading: boolean;
  refresh: () => Promise<void>;
} {
  const [rows, setRows] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(!!competitionId);

  async function load() {
    if (!competitionId) {
      setRows([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from('competition_entries')
      .select(
        'id, user_id, score, rank, profiles!inner(username, full_name, avatar_url)',
      )
      .eq('competition_id', competitionId)
      .order('score', { ascending: false })
      .order('joined_at', { ascending: true })
      .limit(50);

    const mapped: LeaderboardEntry[] = ((data as any[]) ?? []).map((r, idx) => ({
      entry_id: r.id,
      user_id: r.user_id,
      username: r.profiles?.username ?? null,
      full_name: r.profiles?.full_name ?? null,
      avatar_url: r.profiles?.avatar_url ?? null,
      score: r.score,
      rank: r.rank ?? idx + 1,
      is_self: r.user_id === selfUserId,
    }));
    setRows(mapped);
    setLoading(false);
  }

  useEffect(() => {
    let mounted = true;
    void load().catch(() => {
      if (mounted) setLoading(false);
    });

    if (competitionId) {
      const channel = supabase
        .channel(`competition_${competitionId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'competition_entries',
            filter: `competition_id=eq.${competitionId}`,
          },
          () => {
            void load();
          },
        )
        .subscribe();

      return () => {
        mounted = false;
        supabase.removeChannel(channel);
      };
    }

    return () => {
      mounted = false;
    };
  }, [competitionId, selfUserId]);

  return { rows, loading, refresh: load };
}

// ─── joinCompetition ──────────────────────────────────────────────────────
export async function joinCompetition(
  competitionId: string,
): Promise<{ ok: boolean; entryId?: string; newlyJoined?: boolean; error?: string }> {
  const { data, error } = await (supabase as any).rpc('join_competition', {
    p_competition_id: competitionId,
  });
  if (error) return { ok: false, error: error.message };
  return {
    ok: !!data?.ok,
    entryId: data?.entry_id,
    newlyJoined: data?.newly_joined,
    error: data?.error,
  };
}

// ─── useUserCompetitionRewards ────────────────────────────────────────────
export function useUserCompetitionRewards(userId: string | null | undefined): {
  rows: any[];
  loading: boolean;
} {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(!!userId);

  useEffect(() => {
    if (!userId) {
      setRows([]);
      setLoading(false);
      return;
    }
    let mounted = true;
    void supabase
      .from('competition_rewards')
      .select('*, competitions(name, name_tr, slug, icon_emoji)')
      .eq('user_id', userId)
      .order('granted_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (!mounted) return;
        setRows((data as any[]) ?? []);
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [userId]);

  return { rows, loading };
}
