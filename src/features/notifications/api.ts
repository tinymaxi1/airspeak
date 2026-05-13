/**
 * Notifications feature — notification_log + community_notifications UNION feed.
 * Sprint 5.B
 *
 * - useNotifications(userId): birleşik feed + realtime (postgres_changes)
 * - useUnreadCount: get_unread_count RPC (Sprint 5.D için topbar/tab badge)
 * - markRead(ids?), markAllRead(), deleteNotification(id, source)
 * - routeFromKind: deep link mapping (push tap + in-app row tap)
 */
import { useEffect, useState, useCallback, useId } from 'react';
import { supabase } from '@/lib/supabase';

export type NotificationSource = 'log' | 'community';

export interface UnifiedNotification {
  id: string;
  source: NotificationSource;
  user_id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

// ─── Loaders ──────────────────────────────────────────────────────────────
async function loadFromLog(userId: string): Promise<UnifiedNotification[]> {
  const { data } = await (supabase as any)
    .from('notification_log')
    .select('id, user_id, type, title, body, data, read_at, sent_at')
    .eq('user_id', userId)
    .order('sent_at', { ascending: false })
    .limit(100);
  return ((data as any[]) ?? []).map(
    (r): UnifiedNotification => ({
      id: r.id,
      source: 'log',
      user_id: r.user_id,
      type: r.type,
      title: r.title,
      body: r.body,
      data: (r.data ?? {}) as Record<string, unknown>,
      read_at: r.read_at,
      created_at: r.sent_at,
    }),
  );
}

async function loadFromCommunity(userId: string): Promise<UnifiedNotification[]> {
  const { data } = await (supabase as any)
    .from('community_notifications')
    .select(
      'id, user_id, type, snippet, target_type, target_id, read_at, created_at, actor:profiles!community_notifications_actor_id_fkey(username, full_name)',
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100);

  return ((data as any[]) ?? []).map((r): UnifiedNotification => {
    const actorName =
      r.actor?.full_name ?? r.actor?.username ?? 'Birisi';
    let title = '';
    if (r.type === 'mention') title = `${actorName} seni etiketledi`;
    else if (r.type === 'comment_reply') title = `${actorName} yanıtladı`;
    else if (r.type === 'post_reaction') title = `${actorName} tepki verdi`;
    else if (r.type === 'mod_warning') title = '⚠️ Moderasyon uyarısı';
    else title = actorName;

    return {
      id: r.id,
      source: 'community',
      user_id: r.user_id,
      type: r.type,
      title,
      body: r.snippet ?? '',
      data: { target_type: r.target_type, target_id: r.target_id, actor_username: r.actor?.username },
      read_at: r.read_at,
      created_at: r.created_at,
    };
  });
}

// ─── Hook ─────────────────────────────────────────────────────────────────
export function useNotifications(userId: string | null | undefined): {
  rows: UnifiedNotification[];
  loading: boolean;
  refresh: () => Promise<void>;
  unreadCount: number;
} {
  const [rows, setRows] = useState<UnifiedNotification[]>([]);
  const [loading, setLoading] = useState(!!userId);

  const load = useCallback(async () => {
    if (!userId) {
      setRows([]);
      setLoading(false);
      return;
    }
    const [logs, community] = await Promise.all([
      loadFromLog(userId),
      loadFromCommunity(userId),
    ]);
    const merged = [...logs, ...community].sort((a, b) =>
      a.created_at < b.created_at ? 1 : -1,
    );
    setRows(merged);
    setLoading(false);
  }, [userId]);

  // Unique channel name per hook instance — React Strict Mode + multi-component
  // safe. Aynı userId için TabsLayout + HomeScreen ikisi de useNotifications
  // çağırırsa, aynı channel adı ile collision olur (REACT-NATIVE-4,5 crash).
  const instanceId = useId();
  useEffect(() => {
    void load();
    if (!userId) return;
    // Sentry RN-4/5 ek savunma: subscribe / on / removeChannel'da runtime
    // exception oluşsa bile app crash etmesin (realtime opsiyonel feature).
    let ch: ReturnType<typeof supabase.channel> | null = null;
    try {
      ch = supabase
        .channel(`notif_unified_${userId}_${instanceId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'notification_log', filter: `user_id=eq.${userId}` },
          () => void load(),
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'community_notifications', filter: `user_id=eq.${userId}` },
          () => void load(),
        )
        .subscribe();
    } catch (err) {
      if (__DEV__) console.warn('[notifications] realtime subscribe failed', err);
      ch = null;
    }
    return () => {
      if (!ch) return;
      try {
        void supabase.removeChannel(ch);
      } catch {
        /* ignore — channel zaten kapatılmış olabilir */
      }
    };
  }, [userId, load, instanceId]);

  const unreadCount = rows.filter((r) => !r.read_at).length;
  return { rows, loading, refresh: load, unreadCount };
}

// ─── Mutations ────────────────────────────────────────────────────────────
export async function markNotificationsRead(items: UnifiedNotification[]): Promise<void> {
  const logIds = items.filter((i) => i.source === 'log' && !i.read_at).map((i) => i.id);
  const communityIds = items.filter((i) => i.source === 'community' && !i.read_at).map((i) => i.id);

  await Promise.all([
    logIds.length > 0
      ? (supabase as any).rpc('mark_notifications_read', { p_ids: logIds })
      : Promise.resolve(),
    communityIds.length > 0
      ? (supabase as any).rpc('mark_community_notifications_read', { p_ids: communityIds })
      : Promise.resolve(),
  ]);
}

export async function markAllNotificationsRead(): Promise<void> {
  await Promise.all([
    (supabase as any).rpc('mark_notifications_read', { p_ids: null }),
    (supabase as any).rpc('mark_community_notifications_read', { p_ids: null }),
  ]);
}

export async function deleteNotification(item: UnifiedNotification): Promise<void> {
  const table = item.source === 'log' ? 'notification_log' : 'community_notifications';
  await (supabase as any).from(table).delete().eq('id', item.id);
}

export async function markNotificationTapped(item: UnifiedNotification): Promise<void> {
  if (item.source === 'log') {
    await (supabase as any).rpc('mark_notification_tapped', { p_id: item.id });
  } else {
    await (supabase as any).rpc('mark_community_notifications_read', { p_ids: [item.id] });
  }
}

// ─── Unread count (Sprint 5.D için) ───────────────────────────────────────
export function useUnreadCount(userId: string | null | undefined): number {
  const [count, setCount] = useState(0);
  // Unique channel id per hook instance — TabsLayout + HomeScreen iki kez
  // çağırsa bile channel collision olmaz.
  const instanceId = useId();

  useEffect(() => {
    if (!userId) {
      setCount(0);
      return;
    }
    const fetchCount = async () => {
      const { data } = await (supabase as any).rpc('get_unread_count');
      if (data?.ok) setCount(data.total ?? 0);
    };
    void fetchCount();
    // Sentry RN-4/5 ek savunma: subscribe / removeChannel try/catch.
    let ch: ReturnType<typeof supabase.channel> | null = null;
    try {
      ch = supabase
        .channel(`unread_count_${userId}_${instanceId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'notification_log', filter: `user_id=eq.${userId}` },
          fetchCount,
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'community_notifications', filter: `user_id=eq.${userId}` },
          fetchCount,
        )
        .subscribe();
    } catch (err) {
      if (__DEV__) console.warn('[notifications] unread_count subscribe failed', err);
      ch = null;
    }
    return () => {
      if (!ch) return;
      try {
        void supabase.removeChannel(ch);
      } catch {
        /* ignore */
      }
    };
  }, [userId, instanceId]);

  return count;
}

// ─── Deep link routing (Sprint 5.C de kullanır) ───────────────────────────
export function routeFromNotification(item: UnifiedNotification): string {
  return routeFromKindAndData(item.type, item.data);
}

export function routeFromKindAndData(
  kind: string,
  data: Record<string, unknown> | undefined,
): string {
  const d = data ?? {};
  // Community
  if (kind === 'mention' || kind === 'comment_reply' || kind === 'post_reaction') {
    const targetType = (d.target_type as string) ?? 'post';
    const targetId = (d.target_id as string) ?? (d.post_id as string);
    if (targetId) return `/community/post/${targetId}`;
    return '/community';
  }
  if (kind === 'mod_warning') return '/notifications';
  if (kind === 'post_mention') {
    const postId = (d.post_id as string) ?? (d.target_id as string);
    if (postId) return `/community/post/${postId}`;
    return '/community';
  }
  // Streak
  if (kind.startsWith('streak') || kind === 'heart_full') return '/(tabs)/home';
  // League / squadron
  if (kind.startsWith('league_') || kind === 'squadron_lapped') return '/(tabs)/league';
  // Oral / icao
  if (kind === 'icao_mock_feedback' || kind === 'oral_evaluated') return '/exam/icao4-history';
  if (kind === 'exam_countdown') return '/exam';
  // Trial / offers
  if (kind === 'trial_ending_t1' || kind === 'trial_ending_t0' || kind === 'trial_winback')
    return '/paywall';
  if (kind === 'special_offer') return '/paywall';
  // Misc
  if (kind === 'ai_scenario_weekly') return '/conversation';
  if (kind === 'new_unit') return '/(tabs)/learn';
  if (kind === 'inactivity_recovery') return '/(tabs)/home';
  // Placement
  if (kind === 'placement_cooldown_done') return '/(auth)/onboarding/level-test';
  return '/notifications';
}
