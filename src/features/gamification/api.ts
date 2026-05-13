/**
 * Gamification DB sync API — Sprint (post-C3d).
 *
 * RPC wrapper'ları:
 *   bumpUserXpForLeague(source, xp) — pratiklerden XP league'e gönder
 *   decrementHearts()                — kalp düşür (DB persist)
 *   refillHeartsIfDue()              — 24h sonra otomatik refill
 *   upsertStreak()                   — DB streak update
 *
 * Hatalar Sentry'ye loglanır, çağıran tarafa silent fail (local state korunur).
 */
import { supabase as typedSupabase } from '@/lib/supabase';

const supabase: any = typedSupabase;

export type XpSource =
  | 'readback'
  | 'pronunciation'
  | 'listen_solve'
  | 'scenario'
  | 'lesson'
  | 'theory'
  | 'srs'
  | 'icao4'
  | 'quest';

export async function bumpUserXpForLeague(source: XpSource, xp: number): Promise<void> {
  if (!Number.isFinite(xp) || xp <= 0) return;
  try {
    const { error } = await supabase.rpc('bump_user_xp_v2', {
      p_source: source,
      p_xp: Math.round(xp),
    });
    if (error && __DEV__) console.warn('[bumpUserXpForLeague]', source, xp, error.message);
  } catch (e: any) {
    if (__DEV__) console.warn('[bumpUserXpForLeague] exception', source, xp, e?.message);
  }
}

export async function decrementHearts(): Promise<{ hearts: number; refill_at: string | null } | null> {
  try {
    const { data, error } = await supabase.rpc('decrement_hearts');
    if (error) {
      if (__DEV__) console.warn('[decrementHearts]', error.message);
      return null;
    }
    return { hearts: (data as any)?.hearts ?? 0, refill_at: (data as any)?.hearts_refill_at ?? null };
  } catch (e: any) {
    if (__DEV__) console.warn('[decrementHearts] exception', e?.message);
    return null;
  }
}

export async function refillHeartsIfDue(): Promise<{ hearts: number; refill_at: string | null } | null> {
  try {
    const { data, error } = await supabase.rpc('refill_hearts_if_due');
    if (error) {
      if (__DEV__) console.warn('[refillHeartsIfDue]', error.message);
      return null;
    }
    return { hearts: (data as any)?.hearts ?? 0, refill_at: (data as any)?.hearts_refill_at ?? null };
  } catch (e: any) {
    if (__DEV__) console.warn('[refillHeartsIfDue] exception', e?.message);
    return null;
  }
}

export async function upsertStreak(): Promise<{ current: number; longest: number } | null> {
  try {
    const { data, error } = await supabase.rpc('upsert_streak');
    if (error) {
      if (__DEV__) console.warn('[upsertStreak]', error.message);
      return null;
    }
    return {
      current: (data as any)?.current_streak ?? 0,
      longest: (data as any)?.longest_streak ?? 0,
    };
  } catch (e: any) {
    if (__DEV__) console.warn('[upsertStreak] exception', e?.message);
    return null;
  }
}
