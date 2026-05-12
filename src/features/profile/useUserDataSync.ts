/**
 * useUserDataSync — Login / app reopen sonrası server'dan kullanıcı verisini hydrate.
 *
 * SORUN: Lesson progress, XP ve streak DB'ye yazılıyor (`bump_user_xp` RPC ile)
 * ama uygulama startup'ında server'dan ÇEKİLMİYORDU. Cihaz değişimi veya
 * uninstall sonrası local store boş kalıyor, kullanıcı progress'i sıfırdan
 * görüyor (oysa DB'de duruyor).
 *
 * Bu hook userId değişince (= login/refresh) 3 paralel fetch yapar:
 *   1. user_xp_summary  → total_xp
 *   2. streaks          → current_streak, longest_streak, last_activity_date
 *   3. user_lesson_progress → tamamlanan ders id'leri + en yüksek skorlar
 *
 * Promise.allSettled — biri fail olsa diğerleri devam (kısmi hydrate).
 *
 * gamificationStore.syncFromServer ve progressStore.hydrateFromServer
 * server-side veriyi local'le merge eder (server = source of truth, conflict'te
 * server kazanır).
 */
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useGamificationStore } from '@/stores/gamificationStore';
import { useProgressStore } from '@/stores/progressStore';
import { captureException } from '@/lib/sentry';

export function useUserDataSync(userId: string | null | undefined): { hydrating: boolean } {
  const [hydrating, setHydrating] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const uid = userId; // closure-safe narrowing for TS
    let cancelled = false;

    async function run() {
      setHydrating(true);
      const results = await Promise.allSettled([
        // 1) XP summary
        supabase
          .from('user_xp_summary')
          .select('total_xp, week_xp, month_xp, year_xp')
          .eq('user_id', uid)
          .maybeSingle(),
        // 2) Streak
        supabase
          .from('streaks')
          .select('current_streak, longest_streak, last_activity_date, frozen_until')
          .eq('user_id', uid)
          .maybeSingle(),
        // 3) Lesson progress
        supabase
          .from('user_lesson_progress')
          .select('lesson_id, score')
          .eq('user_id', uid),
      ]);

      if (cancelled) return;

      // ── Gamification hydrate (XP + streak) ──
      const xpRes = results[0];
      const streakRes = results[1];
      const snapshot: {
        totalXp?: number;
        currentStreak?: number;
        longestStreak?: number;
      } = {};
      if (xpRes.status === 'fulfilled' && xpRes.value.data) {
        const v = xpRes.value.data as { total_xp?: number | null };
        if (typeof v.total_xp === 'number') snapshot.totalXp = v.total_xp;
      } else if (xpRes.status === 'rejected') {
        captureException(xpRes.reason, { tags: { hook: 'useUserDataSync', step: 'xp' } } as any);
      }
      if (streakRes.status === 'fulfilled' && streakRes.value.data) {
        const v = streakRes.value.data as {
          current_streak?: number | null;
          longest_streak?: number | null;
        };
        if (typeof v.current_streak === 'number') snapshot.currentStreak = v.current_streak;
        if (typeof v.longest_streak === 'number') snapshot.longestStreak = v.longest_streak;
      } else if (streakRes.status === 'rejected') {
        captureException(streakRes.reason, {
          tags: { hook: 'useUserDataSync', step: 'streak' },
        } as any);
      }
      if (Object.keys(snapshot).length > 0) {
        useGamificationStore.getState().syncFromServer(snapshot);
      }

      // ── Lesson progress hydrate ──
      const lpRes = results[2];
      if (lpRes.status === 'fulfilled' && Array.isArray(lpRes.value.data)) {
        const rows = lpRes.value.data as Array<{ lesson_id: string; score: number | null }>;
        const completedLessonIds: string[] = [];
        const bestScores: Record<string, number> = {};
        for (const row of rows) {
          if (!row?.lesson_id) continue;
          completedLessonIds.push(row.lesson_id);
          if (typeof row.score === 'number') bestScores[row.lesson_id] = row.score;
        }
        useProgressStore.getState().hydrateFromServer({ completedLessonIds, bestScores });
      } else if (lpRes.status === 'rejected') {
        captureException(lpRes.reason, {
          tags: { hook: 'useUserDataSync', step: 'lesson_progress' },
        } as any);
      }

      if (!cancelled) setHydrating(false);
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { hydrating };
}
