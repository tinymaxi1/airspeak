/**
 * Placement test DB layer (3f.A backend ile uyumlu).
 *
 * - useUserPlacementResult(userId): user_placement_results latest row + realtime
 * - useCanTakePlacement(userId): can_take_placement RPC (cooldown gate)
 * - getNextPlacementQuestion(...): adaptive RPC, mobile state'i pass'lar
 * - finalizePlacement(scores, ...): finalize RPC, profile.level update
 *
 * Adaptive session helper:
 * - createAdaptiveSession(initialDimensions): state machine reducer pattern
 * - applyAnswer(state, isCorrect): consecutive sayaçları + dimension sırası
 */
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────
export type PlacementLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
export type PlacementDimension = 'vocabulary' | 'grammar' | 'listening' | 'reading';

export interface UserPlacementResult {
  user_id: string;
  taken_at: string;
  vocabulary_score: number | null;
  grammar_score: number | null;
  listening_score: number | null;
  reading_score: number | null;
  overall_level: PlacementLevel | null;
  recommended_start_lesson_id: string | null;
  questions_answered: number;
  test_duration_seconds: number | null;
  attempt_number: number;
  next_test_allowed_at: string;
}

export interface PlacementQuestionPayload {
  id: string;
  slug: string;
  level: PlacementLevel;
  dimension: string;
  format: string | null;
  question: string;
  question_tr: string | null;
  context: string | null;
  options: any;
  correct_id: string;
  weight: number;
}

export interface NextQuestionResponse {
  ok: boolean;
  finished?: boolean;
  reason?: 'max_reached' | 'consecutive_wrong' | 'no_questions_available';
  final_level?: PlacementLevel;
  question?: PlacementQuestionPayload;
  target_level?: PlacementLevel;
  served_level?: PlacementLevel;
  error?: string;
}

export interface FinalizeResult {
  ok: boolean;
  level?: PlacementLevel;
  avg_score?: number;
  scores?: {
    vocabulary: number;
    grammar: number;
    listening: number;
    reading: number;
  };
  recommended_lesson_id?: string | null;
  next_test_allowed_at?: string;
  attempt_number?: number;
  error?: string;
}

export interface CanTakeResponse {
  ok: boolean;
  can_take: boolean;
  attempt_number?: number;
  next_test_allowed_at?: string;
  days_remaining?: number;
  reason?: string;
  error?: string;
}

// ─── useUserPlacementResult ───────────────────────────────────────────────
export function useUserPlacementResult(
  userId: string | null | undefined,
): {
  result: UserPlacementResult | null;
  loading: boolean;
  refresh: () => Promise<void>;
} {
  const [result, setResult] = useState<UserPlacementResult | null>(null);
  const [loading, setLoading] = useState(!!userId);

  const refresh = useCallback(async () => {
    if (!userId) {
      setResult(null);
      setLoading(false);
      return;
    }
    const { data } = await (supabase as any)
      .from('user_placement_results')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    setResult((data as UserPlacementResult) ?? null);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    void refresh();
    if (!userId) return;
    const channel = supabase
      .channel(`placement_result_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_placement_results',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          void refresh();
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return { result, loading, refresh };
}

// ─── useCanTakePlacement ──────────────────────────────────────────────────
export function useCanTakePlacement(
  userId: string | null | undefined,
): { state: CanTakeResponse | null; loading: boolean; refresh: () => Promise<void> } {
  const [state, setState] = useState<CanTakeResponse | null>(null);
  const [loading, setLoading] = useState(!!userId);

  const refresh = useCallback(async () => {
    if (!userId) {
      setState(null);
      setLoading(false);
      return;
    }
    const { data } = await (supabase as any).rpc('can_take_placement', {
      p_user_id: userId,
    });
    setState(data as CanTakeResponse);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { state, loading, refresh };
}

// ─── RPC wrappers ─────────────────────────────────────────────────────────
export async function getNextPlacementQuestion(args: {
  sessionId: string;
  lastCorrect: boolean;
  consecutiveCorrect: number;
  consecutiveWrong: number;
  answeredIds: string[];
  dimension: PlacementDimension;
  currentLevel?: PlacementLevel;
}): Promise<NextQuestionResponse> {
  const { data, error } = await (supabase as any).rpc('get_next_placement_question', {
    p_session_id: args.sessionId,
    p_last_correct: args.lastCorrect,
    p_consecutive_correct: args.consecutiveCorrect,
    p_consecutive_wrong: args.consecutiveWrong,
    p_answered_ids: args.answeredIds,
    p_dimension: args.dimension,
    p_current_level: args.currentLevel ?? 'B1',
  });
  if (error) return { ok: false, error: error.message };
  return data;
}

export async function finalizePlacement(args: {
  scores: {
    vocabulary: number;
    grammar: number;
    listening: number;
    reading: number;
  };
  questionsAnswered?: number;
  testDurationSeconds?: number;
}): Promise<FinalizeResult> {
  const { data, error } = await (supabase as any).rpc('finalize_placement', {
    p_scores: args.scores,
    p_questions_answered: args.questionsAnswered ?? 0,
    p_test_duration_seconds: args.testDurationSeconds ?? null,
  });
  if (error) return { ok: false, error: error.message };
  return data;
}

// ═══════════════════════════════════════════════════════════════════════
// ADAPTIVE SESSION HELPER (state machine reducer)
// ═══════════════════════════════════════════════════════════════════════

export interface AdaptiveSessionState {
  sessionId: string;
  startedAt: number;
  /** Boyutlar sırası ve mevcut index */
  dimensions: PlacementDimension[];
  currentDimensionIndex: number;
  /** Boyut bazlı state (sayaç ve sorular) */
  perDimension: Record<
    PlacementDimension,
    {
      consecutiveCorrect: number;
      consecutiveWrong: number;
      answeredIds: string[];
      currentLevel: PlacementLevel;
      finalLevel: PlacementLevel | null;
      correctCount: number;
      wrongCount: number;
      // Skor: ICAO band (1-6) — final level mapping ile eşit
      score: number;
    }
  >;
  done: boolean;
}

const LEVEL_TO_BAND: Record<PlacementLevel, number> = {
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 4,
  C1: 5,
};

export function createAdaptiveSession(
  dimensions: PlacementDimension[] = ['vocabulary', 'grammar', 'listening', 'reading'],
  startLevel: PlacementLevel = 'B1',
): AdaptiveSessionState {
  const perDimension: AdaptiveSessionState['perDimension'] = {} as any;
  for (const d of dimensions) {
    perDimension[d] = {
      consecutiveCorrect: 0,
      consecutiveWrong: 0,
      answeredIds: [],
      currentLevel: startLevel,
      finalLevel: null,
      correctCount: 0,
      wrongCount: 0,
      score: LEVEL_TO_BAND[startLevel],
    };
  }
  return {
    sessionId: cryptoRandomUuid(),
    startedAt: Date.now(),
    dimensions,
    currentDimensionIndex: 0,
    perDimension,
    done: false,
  };
}

export function recordAnswer(
  state: AdaptiveSessionState,
  questionId: string,
  isCorrect: boolean,
  servedLevel: PlacementLevel,
): AdaptiveSessionState {
  const dim = state.dimensions[state.currentDimensionIndex];
  if (!dim) return state;
  const pd = state.perDimension[dim];
  const next = { ...pd };
  next.answeredIds = [...next.answeredIds, questionId];
  if (isCorrect) {
    next.consecutiveCorrect = next.consecutiveCorrect + 1;
    next.consecutiveWrong = 0;
    next.correctCount += 1;
  } else {
    next.consecutiveWrong = next.consecutiveWrong + 1;
    next.consecutiveCorrect = 0;
    next.wrongCount += 1;
  }
  next.currentLevel = servedLevel;
  return {
    ...state,
    perDimension: { ...state.perDimension, [dim]: next },
  };
}

// Boyut bittiğinde currentDimensionIndex artırır + finalLevel + score yazar
export function completeCurrentDimension(
  state: AdaptiveSessionState,
  finalLevel: PlacementLevel,
): AdaptiveSessionState {
  const dim = state.dimensions[state.currentDimensionIndex];
  if (!dim) return state;
  const pd = state.perDimension[dim];
  const updated = {
    ...pd,
    finalLevel,
    score: LEVEL_TO_BAND[finalLevel],
  };
  const nextIndex = state.currentDimensionIndex + 1;
  return {
    ...state,
    perDimension: { ...state.perDimension, [dim]: updated },
    currentDimensionIndex: nextIndex,
    done: nextIndex >= state.dimensions.length,
  };
}

export function aggregateScores(
  state: AdaptiveSessionState,
): { vocabulary: number; grammar: number; listening: number; reading: number } {
  return {
    vocabulary: state.perDimension.vocabulary?.score ?? 0,
    grammar: state.perDimension.grammar?.score ?? 0,
    listening: state.perDimension.listening?.score ?? 0,
    reading: state.perDimension.reading?.score ?? 0,
  };
}

// Tiny UUID (RFC4122 v4) — crypto.randomUUID Expo'da var ama eski sürümlerde
// fallback gerekebilir. Basit Math.random tabanlı (collision ihtimali düşük,
// session_id sadece audit için).
function cryptoRandomUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
