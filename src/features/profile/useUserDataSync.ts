/**
 * useUserDataSync — Login / app reopen sonrası server'dan kullanıcı verisini hydrate.
 *
 * SORUN: Lesson progress, XP ve streak DB'ye yazılıyor (`bump_user_xp` RPC ile)
 * ama uygulama startup'ında server'dan ÇEKİLMİYORDU. Cihaz değişimi veya
 * uninstall sonrası local store boş kalıyor, kullanıcı progress'i sıfırdan
 * görüyor (oysa DB'de duruyor).
 *
 * Bu hook userId değişince (= login/refresh) 4 paralel fetch yapar:
 *   1. user_xp_summary  → total_xp
 *   2. streaks          → current_streak, longest_streak, last_activity_date
 *   3. user_lesson_progress → tamamlanan ders id'leri + en yüksek skorlar
 *   4. profiles         → onboarding_completed + rol/avatar/full_name
 *
 * Promise.allSettled — biri fail olsa diğerleri devam (kısmi hydrate).
 *
 * gamificationStore.syncFromServer ve progressStore.hydrateFromServer
 * server-side veriyi local'le merge eder (server = source of truth, conflict'te
 * server kazanır).
 *
 * GÜVENLİK (Sentry REACT-NATIVE-6 fix):
 * Tüm hook top-level try/catch + her hydrate step kendi try/catch'i.
 * Eski versiyon bir undefined call yüzünden patladığında app freeze oluyordu.
 * Şimdi: bir step fail olsa diğerleri devam, app patlamaz.
 */
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useGamificationStore } from '@/stores/gamificationStore';
import { useProgressStore } from '@/stores/progressStore';
import { captureException } from '@/lib/sentry';
import type { Profile } from '@/types/profile';

/** Sentry captureException'ı asla patlatmayan safe wrapper. */
function safeCapture(error: unknown, tag: string) {
  try {
    if (typeof captureException === 'function') {
      captureException(error, { tags: { hook: 'useUserDataSync', step: tag } } as any);
    } else if (__DEV__) {
      console.warn(`[useUserDataSync:${tag}]`, error);
    }
  } catch {
    /* sentry kendisi patladıysa sus */
  }
}

/** Auth store setter'ları undefined'a karşı güvenli çağır. */
function safeSetHydrating(value: boolean) {
  try {
    const store = useAuthStore.getState();
    if (store && typeof store.setHydrating === 'function') {
      store.setHydrating(value);
    }
  } catch (err) {
    safeCapture(err, 'safeSetHydrating');
  }
}

/**
 * CRASH 2 fix (BUILD 29 sonrası): Lokal useState `hydrating` kaldırıldı —
 * tüketici (`app/_layout.tsx:116`) return değerini hiç okumuyordu, ölü koddu.
 * Single source of truth artık `authStore.hydrating`. `setHydrating` (local
 * setter) çağrıları da tamamen silindi (Sentry trace bu satırlarda race
 * gösteriyordu).
 */
export function useUserDataSync(userId: string | null | undefined): void {
  useEffect(() => {
    if (!userId) {
      // Logout veya henüz login yok — hydrating global'i false'a çek.
      safeSetHydrating(false);
      return;
    }
    const uid = userId; // closure-safe narrowing for TS
    let cancelled = false;

    async function run() {
      try {
        // Global hydrating flag — Router (app/index.tsx) bunu okur, splash gösterir.
        safeSetHydrating(true);

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
          // 4) Profile (Sprint 14.C — onboarding_completed server source of truth)
          supabase
            .from('profiles')
            .select(
              'id, username, full_name, avatar_url, role, sub_role, level, daily_goal_minutes, timezone, active_hours, is_student, onboarding_completed, onboarding_completed_at, created_at, updated_at',
            )
            .eq('id', uid)
            .maybeSingle(),
        ]);

        if (cancelled) return;

        // ── Gamification hydrate (XP + streak) ──
        try {
          const xpRes = results[0];
          const streakRes = results[1];
          const snapshot: {
            totalXp?: number;
            currentStreak?: number;
            longestStreak?: number;
          } = {};
          if (xpRes && xpRes.status === 'fulfilled' && xpRes.value?.data) {
            const v = xpRes.value.data as { total_xp?: number | null };
            if (typeof v.total_xp === 'number') snapshot.totalXp = v.total_xp;
          } else if (xpRes && xpRes.status === 'rejected') {
            safeCapture(xpRes.reason, 'xp');
          }
          if (streakRes && streakRes.status === 'fulfilled' && streakRes.value?.data) {
            const v = streakRes.value.data as {
              current_streak?: number | null;
              longest_streak?: number | null;
            };
            if (typeof v.current_streak === 'number') snapshot.currentStreak = v.current_streak;
            if (typeof v.longest_streak === 'number') snapshot.longestStreak = v.longest_streak;
          } else if (streakRes && streakRes.status === 'rejected') {
            safeCapture(streakRes.reason, 'streak');
          }
          if (Object.keys(snapshot).length > 0) {
            const store = useGamificationStore.getState();
            if (store && typeof store.syncFromServer === 'function') {
              store.syncFromServer(snapshot);
            }
          }
        } catch (err) {
          safeCapture(err, 'gamification_hydrate');
        }

        // ── Lesson progress hydrate ──
        try {
          const lpRes = results[2];
          if (lpRes && lpRes.status === 'fulfilled' && Array.isArray(lpRes.value?.data)) {
            const rows = lpRes.value.data as Array<{ lesson_id: string; score: number | null }>;
            const completedLessonIds: string[] = [];
            const bestScores: Record<string, number> = {};
            for (const row of rows) {
              if (!row?.lesson_id) continue;
              completedLessonIds.push(row.lesson_id);
              if (typeof row.score === 'number') bestScores[row.lesson_id] = row.score;
            }
            const store = useProgressStore.getState();
            if (store && typeof store.hydrateFromServer === 'function') {
              store.hydrateFromServer({ completedLessonIds, bestScores });
            }
          } else if (lpRes && lpRes.status === 'rejected') {
            safeCapture(lpRes.reason, 'lesson_progress');
          }
        } catch (err) {
          safeCapture(err, 'lesson_progress_hydrate');
        }

        // ── Profile hydrate (Sprint 14.C — onboarding state) ──
        try {
          const pfRes = results[3];
          if (pfRes && pfRes.status === 'fulfilled' && pfRes.value?.data) {
            const profile = pfRes.value.data as unknown as Profile;
            const store = useAuthStore.getState();
            if (store && typeof store.setProfile === 'function') {
              store.setProfile(profile);
            }
            // Server-side onboarding_completed source-of-truth.
            // - Boolean değer (true VEYA false) gelirse setOnboardingComplete çağrılır.
            // - Field undefined/null gelirse (eski kayıtlar) DOKUNMA — local flag korunsun.
            if (
              typeof profile.onboarding_completed === 'boolean' &&
              store &&
              typeof store.setOnboardingComplete === 'function'
            ) {
              store.setOnboardingComplete(profile.onboarding_completed);
            }
          } else if (pfRes && pfRes.status === 'rejected') {
            // Fetch fail — flag'e DOKUNMA (network sorunu, local persist korunsun).
            safeCapture(pfRes.reason, 'profile');
          }
        } catch (err) {
          safeCapture(err, 'profile_hydrate');
        }
      } catch (err) {
        // En dış savunma — Promise.allSettled veya başka bir asenkron iş patlasa
        // app freeze olmasın, sadece kullanıcı bu seferlik server data'sız kalsın.
        safeCapture(err, 'run_top_level');
      } finally {
        if (!cancelled) {
          safeSetHydrating(false);
        }
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [userId]);
}
