/**
 * Community in-app notifications + group presence (Supabase Realtime).
 *
 * - useCommunityNotifications(userId): community_notifications query +
 *   postgres_changes subscribe (yeni notifications anlık görünür).
 * - useUnreadCount(userId): just unread count, lightweight.
 * - markRead / markAllRead: RPC wrapper.
 * - useGroupPresence(groupId, profile): Supabase Presence channel —
 *   join/leave online users, returns list.
 */
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export type NotificationType =
  | 'mention'
  | 'comment_reply'
  | 'post_reaction'
  | 'mod_warning';

export interface CommunityNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  actor_id: string | null;
  target_type: 'post' | 'comment';
  target_id: string;
  snippet: string | null;
  read_at: string | null;
  created_at: string;
  // Actor profile join
  actor_username?: string | null;
  actor_full_name?: string | null;
  actor_avatar_url?: string | null;
}

// ─── useCommunityNotifications ─────────────────────────────────────────────
export function useCommunityNotifications(userId: string | null | undefined): {
  rows: CommunityNotification[];
  loading: boolean;
  refresh: () => Promise<void>;
  unreadCount: number;
} {
  const [rows, setRows] = useState<CommunityNotification[]>([]);
  const [loading, setLoading] = useState(!!userId);

  async function load() {
    if (!userId) {
      setRows([]);
      setLoading(false);
      return;
    }
    const { data } = await (supabase as any)
      .from('community_notifications')
      .select(
        'id, user_id, type, actor_id, target_type, target_id, snippet, read_at, created_at, actor:profiles!community_notifications_actor_id_fkey(username, full_name, avatar_url)',
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);
    const mapped = ((data as any[]) ?? []).map(
      (r): CommunityNotification => ({
        id: r.id,
        user_id: r.user_id,
        type: r.type,
        actor_id: r.actor_id,
        target_type: r.target_type,
        target_id: r.target_id,
        snippet: r.snippet,
        read_at: r.read_at,
        created_at: r.created_at,
        actor_username: r.actor?.username ?? null,
        actor_full_name: r.actor?.full_name ?? null,
        actor_avatar_url: r.actor?.avatar_url ?? null,
      }),
    );
    setRows(mapped);
    setLoading(false);
  }

  useEffect(() => {
    void load();
    if (!userId) return;
    const channel = supabase
      .channel(`community_notif_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          void load();
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const unreadCount = rows.filter((n) => !n.read_at).length;

  return { rows, loading, refresh: load, unreadCount };
}

// ─── markRead RPCs ────────────────────────────────────────────────────────
export async function markCommunityNotificationsRead(
  ids?: string[],
): Promise<{ ok: boolean; count?: number; error?: string }> {
  const { data, error } = await (supabase as any).rpc(
    'mark_community_notifications_read',
    { p_ids: ids && ids.length > 0 ? ids : null },
  );
  if (error) return { ok: false, error: error.message };
  return data;
}

// ═══════════════════════════════════════════════════════════════════════
// GROUP PRESENCE — Supabase Realtime Presence
// ═══════════════════════════════════════════════════════════════════════

export interface PresenceUser {
  user_id: string;
  full_name?: string | null;
  username?: string | null;
  avatar_url?: string | null;
  joined_at: string;
}

export function useGroupPresence(
  groupId: string | null | undefined,
  selfProfile: { user_id: string; full_name?: string | null; username?: string | null; avatar_url?: string | null } | null,
): { users: PresenceUser[]; count: number } {
  const [users, setUsers] = useState<PresenceUser[]>([]);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!groupId || !selfProfile?.user_id) {
      setUsers([]);
      return;
    }
    const channel = supabase.channel(`community_presence_${groupId}`, {
      config: { presence: { key: selfProfile.user_id } },
    });
    channelRef.current = channel;

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const flat: PresenceUser[] = [];
        for (const key of Object.keys(state)) {
          const arr = state[key] as any[];
          for (const meta of arr) {
            flat.push({
              user_id: meta.user_id ?? key,
              full_name: meta.full_name ?? null,
              username: meta.username ?? null,
              avatar_url: meta.avatar_url ?? null,
              joined_at: meta.joined_at ?? new Date().toISOString(),
            });
          }
        }
        // Dedup by user_id (multi-device olabilir)
        const seen = new Set<string>();
        const unique = flat.filter((u) => {
          if (seen.has(u.user_id)) return false;
          seen.add(u.user_id);
          return true;
        });
        setUsers(unique);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: selfProfile.user_id,
            full_name: selfProfile.full_name ?? null,
            username: selfProfile.username ?? null,
            avatar_url: selfProfile.avatar_url ?? null,
            joined_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      void supabase.removeChannel(channel);
      channelRef.current = null;
      setUsers([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, selfProfile?.user_id]);

  return { users, count: users.length };
}
