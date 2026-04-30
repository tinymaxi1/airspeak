/**
 * Badges DB layer — template + user_badges + award RPC.
 */
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export type BadgeCategory =
  | 'streak'
  | 'xp'
  | 'level'
  | 'lesson'
  | 'speed'
  | 'social'
  | 'league'
  | 'special';

export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface BadgeRow {
  id: string;
  code: string;
  name_tr: string;
  name_en: string | null;
  description_tr: string | null;
  description_en: string | null;
  icon_emoji: string;
  icon_url: string | null;
  category: BadgeCategory;
  condition_type:
    | 'streak_days'
    | 'total_xp'
    | 'level'
    | 'lessons_completed'
    | 'perfect_scores'
    | 'custom';
  condition_value: number;
  rarity: BadgeRarity;
  sort: number;
  is_active: boolean;
}

export interface UserBadgeRow {
  badge_id: string;
  earned_at: string;
}

const TTL_MS = 5 * 60 * 1000;

interface BadgesCache {
  badges: BadgeRow[];
  loadedAt: number;
}
let badgesCache: BadgesCache | null = null;
let badgesInflight: Promise<BadgeRow[]> | null = null;

async function fetchBadges(): Promise<BadgeRow[]> {
  const { data, error } = await supabase
    .from('badges')
    .select('*')
    .eq('is_active', true)
    .order('category', { ascending: true })
    .order('sort', { ascending: true });
  if (error || !data) return [];
  return data as BadgeRow[];
}

async function loadBadges(): Promise<BadgeRow[]> {
  if (badgesCache && Date.now() - badgesCache.loadedAt < TTL_MS) {
    return badgesCache.badges;
  }
  if (badgesInflight) return badgesInflight;
  badgesInflight = fetchBadges()
    .then((b) => {
      badgesCache = { badges: b, loadedAt: Date.now() };
      badgesInflight = null;
      return b;
    })
    .catch((e) => {
      badgesInflight = null;
      throw e;
    });
  return badgesInflight;
}

export function useBadgeTemplates(): { badges: BadgeRow[]; loading: boolean } {
  const [badges, setBadges] = useState<BadgeRow[]>(badgesCache?.badges ?? []);
  const [loading, setLoading] = useState(!badgesCache);
  useEffect(() => {
    let mounted = true;
    void loadBadges().then((b) => {
      if (mounted) {
        setBadges(b);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);
  return { badges, loading };
}

const userBadgesSubs = new Map<string, Set<(rows: UserBadgeRow[]) => void>>();
const userBadgesCache = new Map<string, { rows: UserBadgeRow[]; loadedAt: number }>();
const userBadgesRealtime = new Set<string>();

async function fetchUserBadges(userId: string): Promise<UserBadgeRow[]> {
  const { data, error } = await supabase
    .from('user_badges')
    .select('badge_id, earned_at')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });
  if (error || !data) return [];
  return data as UserBadgeRow[];
}

function bindUserBadgesRealtime(userId: string) {
  if (userBadgesRealtime.has(userId)) return;
  userBadgesRealtime.add(userId);
  supabase
    .channel(`user_badges_${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'user_badges',
        filter: `user_id=eq.${userId}`,
      },
      async () => {
        const fresh = await fetchUserBadges(userId);
        userBadgesCache.set(userId, { rows: fresh, loadedAt: Date.now() });
        userBadgesSubs.get(userId)?.forEach((cb) => cb(fresh));
      },
    )
    .subscribe();
}

export function useUserBadges(userId: string | null | undefined): {
  rows: UserBadgeRow[];
  loading: boolean;
  refresh: () => Promise<void>;
} {
  const cached = userId ? userBadgesCache.get(userId)?.rows : null;
  const [rows, setRows] = useState<UserBadgeRow[]>(cached ?? []);
  const [loading, setLoading] = useState(!cached && !!userId);

  useEffect(() => {
    if (!userId) {
      setRows([]);
      setLoading(false);
      return;
    }
    let mounted = true;

    let subs = userBadgesSubs.get(userId);
    if (!subs) {
      subs = new Set();
      userBadgesSubs.set(userId, subs);
    }
    const cb = (next: UserBadgeRow[]) => {
      if (mounted) setRows(next);
    };
    subs.add(cb);

    const cacheEntry = userBadgesCache.get(userId);
    if (cacheEntry && Date.now() - cacheEntry.loadedAt < TTL_MS) {
      setRows(cacheEntry.rows);
      setLoading(false);
      bindUserBadgesRealtime(userId);
    } else {
      void fetchUserBadges(userId).then((r) => {
        if (!mounted) return;
        userBadgesCache.set(userId, { rows: r, loadedAt: Date.now() });
        setRows(r);
        setLoading(false);
        bindUserBadgesRealtime(userId);
      });
    }

    return () => {
      mounted = false;
      subs!.delete(cb);
    };
  }, [userId]);

  async function refresh() {
    if (!userId) return;
    const fresh = await fetchUserBadges(userId);
    userBadgesCache.set(userId, { rows: fresh, loadedAt: Date.now() });
    setRows(fresh);
  }

  return { rows, loading, refresh };
}

export interface AwardResult {
  ok: boolean;
  newlyEarned: boolean;
  badgeId?: string;
  code?: string;
  error?: string;
}

/**
 * Server'a "bu kullanıcı bu rozeti hak ediyor" sinyali yolla.
 * Idempotent — daha önce kazanılmışsa newly_earned=false döner.
 */
export async function awardBadge(code: string): Promise<AwardResult> {
  const { data, error } = await (supabase as any).rpc('award_badge', { p_code: code });
  if (error) return { ok: false, newlyEarned: false, error: error.message };
  return {
    ok: !!data?.ok,
    newlyEarned: !!data?.newly_earned,
    badgeId: data?.badge_id,
    code: data?.code,
    error: data?.error,
  };
}
