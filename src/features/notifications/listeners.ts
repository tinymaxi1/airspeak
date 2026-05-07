/**
 * Notification listeners — Sprint 5.C
 *
 * 1. Push response (cihaz tray'inden tıklanma): expo-notifications
 *    addNotificationResponseReceivedListener → deep link route
 * 2. Foreground push received: addNotificationReceivedListener →
 *    in-app banner göster (sistem banner kapatıldı)
 * 3. Realtime notification_log INSERT (foreground'da event olduğunda
 *    push gelmiş olmasa bile banner göster)
 */
import { useEffect } from 'react';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { supabase } from '@/lib/supabase';
import { useBannerStore } from '@/stores/notificationBannerStore';
import { routeFromKindAndData } from './api';

const KIND_EMOJI: Record<string, string> = {
  streak_danger: '🔥',
  streak_milestone: '🎉',
  heart_full: '❤',
  ai_scenario_weekly: '🤖',
  icao_mock_feedback: '🎧',
  league_promotion: '🏆',
  league_demotion: '⚠️',
  squadron_lapped: '👥',
  new_unit: '✨',
  exam_countdown: '🎯',
  inactivity_recovery: '✈',
  trial_ending_t1: '⏱',
  trial_ending_t0: '⏱',
  trial_winback: '💎',
  special_offer: '🎁',
  comment_reply: '💬',
  post_reaction: '✨',
  mod_warning: '⚠️',
  post_mention: '@',
};

function emojiFor(kind: string | undefined): string {
  if (!kind) return '🔔';
  return KIND_EMOJI[kind] ?? '🔔';
}

/**
 * Push tray tap (background'da bildirime tıklanma).
 * Edge fn data.kind kullanılıyor.
 */
export function usePushResponseHandler() {
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = (response.notification.request.content.data ?? {}) as Record<string, unknown>;
      const kind = (data.kind as string) ?? '';
      if (!kind) return;
      const route = routeFromKindAndData(kind, data);
      try {
        router.push(route as any);
      } catch (e) {
        if (__DEV__) console.warn('[notif response route]', e);
      }
    });
    return () => sub.remove();
  }, []);
}

/**
 * Foreground push received: sistem banner kapalı (setNotificationHandler
 * shouldShowBanner=false foreground), custom in-app banner göster.
 */
export function useForegroundPushBanner() {
  const show = useBannerStore((s) => s.show);
  useEffect(() => {
    const sub = Notifications.addNotificationReceivedListener((notif) => {
      const content = notif.request.content;
      const data = (content.data ?? {}) as Record<string, unknown>;
      const kind = (data.kind as string) ?? '';
      const route = kind ? routeFromKindAndData(kind, data) : undefined;
      show({
        id: notif.request.identifier,
        title: content.title ?? '',
        body: content.body ?? '',
        emoji: emojiFor(kind),
        route,
      });
    });
    return () => sub.remove();
  }, [show]);
}

/**
 * Realtime notification_log INSERT — push gelmemiş olsa bile in-app
 * event'lerde banner göster (foreground only).
 */
export function useNotificationLogBanner(userId: string | null | undefined) {
  const show = useBannerStore((s) => s.show);
  useEffect(() => {
    if (!userId) return;
    const ch = supabase
      .channel(`notif_banner_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notification_log',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const row = payload.new as any;
          if (!row?.id) return;
          // 1 saniyeden eski olanı atla (geçmişte kaydedilmiş)
          const sentMs = new Date(row.sent_at).getTime();
          if (Date.now() - sentMs > 60_000) return;
          const data = (row.data ?? {}) as Record<string, unknown>;
          const route = routeFromKindAndData(row.type, data);
          show({
            id: row.id,
            title: row.title,
            body: row.body,
            emoji: emojiFor(row.type),
            route,
          });
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
  }, [userId, show]);
}
