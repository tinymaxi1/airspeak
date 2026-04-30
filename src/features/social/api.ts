/**
 * Sosyal yarış DB layer — friendships + squadrons.
 */
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export type FriendshipStatus = 'pending' | 'accepted' | 'blocked';

export interface FriendRow {
  friendship_id: string;
  friend_user_id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  status: FriendshipStatus;
  is_incoming: boolean; // true: bana request gelmiş; false: ben gönderdim
  total_xp: number;
  week_xp: number;
  current_streak: number;
}

export interface SquadronRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  emoji: string;
  banner_url: string | null;
  is_public: boolean;
  capacity: number;
  member_count: number;
  created_by: string;
}

export interface SquadronMember {
  user_id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: 'admin' | 'member';
  week_xp: number;
  total_xp: number;
}

export interface SquadronLeaderboardEntry {
  id: string;
  slug: string;
  name: string;
  emoji: string;
  member_count: number;
  total_week_xp: number;
  total_xp: number;
  rank: number;
}

const TTL_MS = 5 * 60 * 1000;

// ─── useFriends ───────────────────────────────────────────────────────────
const friendsCache = new Map<string, { rows: FriendRow[]; loadedAt: number }>();

async function fetchFriends(userId: string): Promise<FriendRow[]> {
  const { data, error } = await supabase
    .from('friendships')
    .select(
      'id, requester_id, addressee_id, status, requester:profiles!friendships_requester_id_fkey(username, full_name, avatar_url), addressee:profiles!friendships_addressee_id_fkey(username, full_name, avatar_url)',
    )
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);
  if (error || !data) return [];

  const friendIds: string[] = [];
  const rows: Omit<FriendRow, 'total_xp' | 'week_xp' | 'current_streak'>[] = (
    data as any[]
  ).map((r) => {
    const isIncoming = r.addressee_id === userId;
    const friendId = isIncoming ? r.requester_id : r.addressee_id;
    const profile = isIncoming ? r.requester : r.addressee;
    friendIds.push(friendId);
    return {
      friendship_id: r.id,
      friend_user_id: friendId,
      username: profile?.username ?? null,
      full_name: profile?.full_name ?? null,
      avatar_url: profile?.avatar_url ?? null,
      status: r.status,
      is_incoming: isIncoming,
    };
  });

  if (friendIds.length === 0) return rows.map((r) => ({ ...r, total_xp: 0, week_xp: 0, current_streak: 0 }));

  const [{ data: xpRows }, { data: streakRows }] = await Promise.all([
    supabase.from('user_xp_summary').select('user_id, total_xp, week_xp').in('user_id', friendIds),
    supabase.from('streaks').select('user_id, current_streak').in('user_id', friendIds),
  ]);

  const xpMap = new Map<string, { total_xp: number; week_xp: number }>();
  for (const r of (xpRows ?? []) as any[]) {
    xpMap.set(r.user_id, { total_xp: r.total_xp, week_xp: r.week_xp });
  }
  const streakMap = new Map<string, number>();
  for (const r of (streakRows ?? []) as any[]) {
    streakMap.set(r.user_id, r.current_streak);
  }

  return rows.map((r) => ({
    ...r,
    total_xp: xpMap.get(r.friend_user_id)?.total_xp ?? 0,
    week_xp: xpMap.get(r.friend_user_id)?.week_xp ?? 0,
    current_streak: streakMap.get(r.friend_user_id) ?? 0,
  }));
}

export function useFriends(userId: string | null | undefined): {
  rows: FriendRow[];
  loading: boolean;
  refresh: () => Promise<void>;
} {
  const cached = userId ? friendsCache.get(userId)?.rows : null;
  const [rows, setRows] = useState<FriendRow[]>(cached ?? []);
  const [loading, setLoading] = useState(!cached && !!userId);

  async function load() {
    if (!userId) {
      setRows([]);
      setLoading(false);
      return;
    }
    const fresh = await fetchFriends(userId);
    friendsCache.set(userId, { rows: fresh, loadedAt: Date.now() });
    setRows(fresh);
    setLoading(false);
  }

  useEffect(() => {
    let mounted = true;
    if (!userId) {
      setRows([]);
      setLoading(false);
      return;
    }
    const entry = friendsCache.get(userId);
    if (entry && Date.now() - entry.loadedAt < TTL_MS) {
      setRows(entry.rows);
      setLoading(false);
    } else {
      void load().catch(() => {
        if (mounted) setLoading(false);
      });
    }
    return () => {
      mounted = false;
    };
  }, [userId]);

  return { rows, loading, refresh: load };
}

// ─── Friend RPC wrappers ──────────────────────────────────────────────────
export async function sendFriendRequest(
  username: string,
): Promise<{ ok: boolean; error?: string; auto_accepted?: boolean }> {
  const { data, error } = await (supabase as any).rpc('send_friend_request', {
    p_username: username,
  });
  if (error) return { ok: false, error: error.message };
  return data;
}

export async function respondFriendRequest(
  friendshipId: string,
  accept: boolean,
): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await (supabase as any).rpc('respond_friend_request', {
    p_friendship_id: friendshipId,
    p_accept: accept,
  });
  if (error) return { ok: false, error: error.message };
  return data;
}

export async function deleteFriendship(
  friendshipId: string,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from('friendships').delete().eq('id', friendshipId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ─── Squadron RPC wrappers ────────────────────────────────────────────────
export async function createSquadron(args: {
  slug: string;
  name: string;
  description?: string;
  emoji?: string;
  isPublic?: boolean;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  const { data, error } = await (supabase as any).rpc('create_squadron', {
    p_slug: args.slug,
    p_name: args.name,
    p_description: args.description ?? null,
    p_emoji: args.emoji ?? '✈️',
    p_is_public: args.isPublic ?? true,
  });
  if (error) return { ok: false, error: error.message };
  return data;
}

export async function joinSquadron(
  squadronId: string,
): Promise<{ ok: boolean; newly_joined?: boolean; error?: string }> {
  const { data, error } = await (supabase as any).rpc('join_squadron', {
    p_squadron_id: squadronId,
  });
  if (error) return { ok: false, error: error.message };
  return data;
}

export async function leaveSquadron(
  squadronId: string,
): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await (supabase as any).rpc('leave_squadron', {
    p_squadron_id: squadronId,
  });
  if (error) return { ok: false, error: error.message };
  return data;
}

// ─── useUserSquadrons ─────────────────────────────────────────────────────
export function useUserSquadrons(userId: string | null | undefined): {
  rows: SquadronRow[];
  loading: boolean;
  refresh: () => Promise<void>;
} {
  const [rows, setRows] = useState<SquadronRow[]>([]);
  const [loading, setLoading] = useState(!!userId);

  async function load() {
    if (!userId) {
      setRows([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from('squadron_members')
      .select('squadrons!inner(*)')
      .eq('user_id', userId);
    const sqs = ((data as any[]) ?? []).map((r) => r.squadrons as SquadronRow);
    setRows(sqs);
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
  }, [userId]);

  return { rows, loading, refresh: load };
}

// ─── useSquadronLeaderboard ───────────────────────────────────────────────
export function useSquadronLeaderboard(): {
  rows: SquadronLeaderboardEntry[];
  loading: boolean;
} {
  const [rows, setRows] = useState<SquadronLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    void supabase
      .from('squadron_leaderboard')
      .select('*')
      .order('rank', { ascending: true })
      .limit(50)
      .then(({ data }) => {
        if (mounted) {
          setRows((data as SquadronLeaderboardEntry[]) ?? []);
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  return { rows, loading };
}

// ─── useSquadron + members ────────────────────────────────────────────────
export function useSquadron(slug: string | null | undefined): {
  squadron: SquadronRow | null;
  members: SquadronMember[];
  loading: boolean;
  refresh: () => Promise<void>;
} {
  const [squadron, setSquadron] = useState<SquadronRow | null>(null);
  const [members, setMembers] = useState<SquadronMember[]>([]);
  const [loading, setLoading] = useState(!!slug);

  async function load() {
    if (!slug) {
      setSquadron(null);
      setMembers([]);
      setLoading(false);
      return;
    }
    const { data: sq } = await supabase
      .from('squadrons')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    if (!sq) {
      setSquadron(null);
      setMembers([]);
      setLoading(false);
      return;
    }
    setSquadron(sq as SquadronRow);

    const { data: memData } = await supabase
      .from('squadron_members')
      .select('user_id, role, profiles!inner(username, full_name, avatar_url)')
      .eq('squadron_id', (sq as any).id);

    const memberIds = ((memData as any[]) ?? []).map((m) => m.user_id);
    const { data: xpData } = memberIds.length
      ? await supabase
          .from('user_xp_summary')
          .select('user_id, total_xp, week_xp')
          .in('user_id', memberIds)
      : { data: [] };

    const xpMap = new Map<string, { total_xp: number; week_xp: number }>();
    for (const r of (xpData as any[]) ?? []) {
      xpMap.set(r.user_id, { total_xp: r.total_xp, week_xp: r.week_xp });
    }

    const mapped: SquadronMember[] = ((memData as any[]) ?? []).map((m) => ({
      user_id: m.user_id,
      username: m.profiles?.username ?? null,
      full_name: m.profiles?.full_name ?? null,
      avatar_url: m.profiles?.avatar_url ?? null,
      role: m.role,
      week_xp: xpMap.get(m.user_id)?.week_xp ?? 0,
      total_xp: xpMap.get(m.user_id)?.total_xp ?? 0,
    }));
    mapped.sort((a, b) => b.week_xp - a.week_xp);
    setMembers(mapped);
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
  }, [slug]);

  return { squadron, members, loading, refresh: load };
}

// ─── Public squadron browse (search) ──────────────────────────────────────
export async function searchPublicSquadrons(
  q: string,
  limit = 20,
): Promise<SquadronRow[]> {
  const { data } = await supabase
    .from('squadrons')
    .select('*')
    .eq('is_public', true)
    .or(`slug.ilike.%${q}%,name.ilike.%${q}%`)
    .order('member_count', { ascending: false })
    .limit(limit);
  return (data as SquadronRow[]) ?? [];
}
