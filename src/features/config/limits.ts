/**
 * Daily limit checker — config + counter karşılaştırır.
 * Premium kullanıcı için her zaman izin verir.
 */
import { useAppConfig } from './api';
import { useDailyLimitsStore } from '@/stores/dailyLimitsStore';
import { useAuthStore } from '@/stores/authStore';
import { supabase as typedSupabase } from '@/lib/supabase';
const supabase: any = typedSupabase;

export interface LimitCheckResult {
  allowed: boolean;
  used: number;
  limit: number;
  reason: 'premium' | 'unlimited' | 'within_limit' | 'exceeded';
}

export function useLessonLimit(): LimitCheckResult {
  const cfg = useAppConfig();
  const isPremium = useAuthStore((s) => s.isPremium);
  const counters = useDailyLimitsStore((s) => s.counters);

  if (isPremium && cfg['premium.unlimited_lessons']) {
    return { allowed: true, used: counters.lessons_completed, limit: -1, reason: 'premium' };
  }
  const limit = cfg['freemium.max_lessons_per_day'];
  if (limit <= 0) {
    return { allowed: true, used: counters.lessons_completed, limit: -1, reason: 'unlimited' };
  }
  return {
    allowed: counters.lessons_completed < limit,
    used: counters.lessons_completed,
    limit,
    reason: counters.lessons_completed < limit ? 'within_limit' : 'exceeded',
  };
}

export function useAiLimit(): LimitCheckResult {
  const cfg = useAppConfig();
  const isPremium = useAuthStore((s) => s.isPremium);
  const counters = useDailyLimitsStore((s) => s.counters);

  if (isPremium && cfg['premium.unlimited_ai']) {
    return { allowed: true, used: counters.ai_conversations, limit: -1, reason: 'premium' };
  }
  const limit = cfg['freemium.max_ai_conversations_per_day'];
  return {
    allowed: counters.ai_conversations < limit,
    used: counters.ai_conversations,
    limit,
    reason: counters.ai_conversations < limit ? 'within_limit' : 'exceeded',
  };
}

export function useVocabLookupLimit(): LimitCheckResult {
  const cfg = useAppConfig();
  const isPremium = useAuthStore((s) => s.isPremium);
  const counters = useDailyLimitsStore((s) => s.counters);

  if (isPremium) {
    return { allowed: true, used: counters.vocab_lookups, limit: -1, reason: 'premium' };
  }
  const limit = cfg['freemium.max_vocab_lookups_per_day'];
  return {
    allowed: counters.vocab_lookups < limit,
    used: counters.vocab_lookups,
    limit,
    reason: counters.vocab_lookups < limit ? 'within_limit' : 'exceeded',
  };
}

/**
 * Bir ICAO 4 setine erişim kontrolü.
 * Set 1 free, Set 2-3 premium (config ile değişebilir).
 */
export function useIcao4SetAccess(setNo: 1 | 2 | 3): { allowed: boolean; isPremiumOnly: boolean } {
  const cfg = useAppConfig();
  const isPremium = useAuthStore((s) => s.isPremium);

  const flag =
    setNo === 1
      ? cfg['freemium.icao4_set1_free']
      : setNo === 2
        ? cfg['freemium.icao4_set2_free']
        : cfg['freemium.icao4_set3_free'];

  if (flag) return { allowed: true, isPremiumOnly: false };
  if (isPremium && cfg['premium.icao4_full_access']) return { allowed: true, isPremiumOnly: true };
  return { allowed: false, isPremiumOnly: true };
}

/**
 * Reklam gösterilmeli mi?
 */
export function useShouldShowAd(): boolean {
  const cfg = useAppConfig();
  const isPremium = useAuthStore((s) => s.isPremium);

  if (!cfg['ads.enabled']) return false;
  if (isPremium && cfg['premium.no_ads']) return false;
  return true;
}

/**
 * Server-side daily_usage tablosuna sayaç artırma RPC'si.
 * Mobile auth ile çalışır (RLS user_id = auth.uid()).
 */
export async function bumpServerUsage(
  field:
    | 'lessons_completed'
    | 'ai_conversations'
    | 'vocab_lookups'
    | 'pronunciation_attempts'
    | 'oral_attempts'
    | 'ads_watched'
    | 'hearts_refilled_via_ad',
  amount: number = 1,
): Promise<void> {
  try {
    await supabase.rpc('bump_daily_usage', { field, amount });
  } catch (e) {
    console.warn('[bumpServerUsage] failed', e);
  }
}
