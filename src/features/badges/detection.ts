/**
 * Client-side badge detection.
 *
 * Sprint 3 user_progress tabloları gelene kadar geçici çözüm:
 * - Mobile gamificationStore + progressStore state'inden eligible kontrol
 * - Eligible olunca awardBadge(code) RPC çağır (idempotent)
 *
 * checkAndAwardAll() — store change sonrası tüm template'lere karşı tara.
 * Tek RPC = 1 round-trip; 12 rozet için 12 paralel RPC sorun değil ama
 * idempotent olduğu için sadece eligible'lara çağır.
 */
import { useGamificationStore } from '@/stores/gamificationStore';
import { useProgressStore } from '@/stores/progressStore';
import { awardBadge, type BadgeRow, type AwardResult } from './api';

export function isEligible(badge: BadgeRow): boolean {
  const gam = useGamificationStore.getState();
  const prog = useProgressStore.getState();

  switch (badge.condition_type) {
    case 'streak_days':
      return gam.longestStreak >= badge.condition_value;
    case 'total_xp':
      return gam.totalXp >= badge.condition_value;
    case 'level':
      return gam.currentLevel >= badge.condition_value;
    case 'lessons_completed':
      return prog.completedLessonIds.length >= badge.condition_value;
    case 'perfect_scores':
      // TODO: Sprint 3'te user_lesson_progress.perfect=true sayısı
      return false;
    case 'custom':
      return false;
    default:
      return false;
  }
}

export interface CheckOptions {
  /** Halihazırda kazanılmış rozet kodları — bunlara RPC atılmaz */
  alreadyEarnedCodes: Set<string>;
  /** Yeni kazanılan callback (UI celebration için) */
  onNewlyEarned?: (code: string) => void;
}

/**
 * Tüm template'leri tara, eligible olanlar için awardBadge çağır.
 * Idempotent — daha önce earned ise RPC newly_earned=false döner.
 */
export async function checkAndAwardAll(
  templates: BadgeRow[],
  opts: CheckOptions,
): Promise<AwardResult[]> {
  const eligible = templates.filter(
    (b) => !opts.alreadyEarnedCodes.has(b.code) && isEligible(b),
  );
  if (eligible.length === 0) return [];

  const results = await Promise.all(eligible.map((b) => awardBadge(b.code)));
  for (const r of results) {
    if (r.ok && r.newlyEarned && r.code) {
      opts.onNewlyEarned?.(r.code);
    }
  }
  return results;
}
