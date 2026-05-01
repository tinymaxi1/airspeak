/**
 * useBadgeWatcher — store değişimlerini dinler, eligible rozetleri server'a yazar.
 *
 * App'in tek bir yerinde mount edilir (root layout). gamificationStore ve
 * progressStore değişimlerinde batched check çalışır.
 */
import { useEffect, useRef } from 'react';
import { useGamificationStore } from '@/stores/gamificationStore';
import { useProgressStore } from '@/stores/progressStore';
import { useAuthStore } from '@/stores/authStore';
import { useBadgeTemplates, useUserBadges } from './api';
import { checkAndAwardAll } from './detection';

const DEBOUNCE_MS = 1500;

/** Yeni kazanılan rozet code'larının yayınlandığı pub/sub.
 *  Vitrin ekranı veya celebration overlay subscribe edebilir. */
type Listener = (code: string) => void;
const newlyEarnedListeners = new Set<Listener>();
export function onBadgeNewlyEarned(cb: Listener) {
  newlyEarnedListeners.add(cb);
  return () => {
    newlyEarnedListeners.delete(cb);
  };
}

export function useBadgeWatcher() {
  const userId = useAuthStore((s) => s.user?.id);
  const totalXp = useGamificationStore((s) => s.totalXp);
  const longestStreak = useGamificationStore((s) => s.longestStreak);
  const currentLevel = useGamificationStore((s) => s.currentLevel);
  const lessons = useProgressStore((s) => s.completedLessonIds.length);

  const { badges } = useBadgeTemplates();
  const { rows: userBadges } = useUserBadges(userId);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!userId || badges.length === 0) return;

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const earnedIds = new Set(userBadges.map((u) => u.badge_id));
      const earnedCodes = new Set(
        badges.filter((b) => earnedIds.has(b.id)).map((b) => b.code),
      );

      void checkAndAwardAll(badges, {
        alreadyEarnedCodes: earnedCodes,
        onNewlyEarned: (code) => {
          // Pub/sub — celebration overlay gibi tüketiciler dinler.
          newlyEarnedListeners.forEach((cb) => cb(code));
          // %20 random soft paywall nudge (cooldown 3 gün)
          if (Math.random() < 0.2) {
            // Geç dynamic import — circular ref'i önle
            void import('@/stores/paywallStore').then((m) => {
              setTimeout(() => m.showPaywall('badge_celebration_random'), 2500);
            });
          }
        },
      });
    }, DEBOUNCE_MS);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [userId, badges, userBadges, totalXp, longestStreak, currentLevel, lessons]);
}
