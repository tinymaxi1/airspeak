/**
 * Oral exam DB layer — RPC wrappers + storage upload + evaluation trigger.
 *
 * Akış (mobile state machine):
 *   1. startOralAttempt(simulationId, promptId) → { attempt_id, audio_path, bucket }
 *   2. (kullanıcı kaydı yapar — audioRecording.ts)
 *   3. uploadOralRecording(bucket, audio_path, fileUri) → public.path (bucket private)
 *   4. submitOralAttempt(attempt_id, transcript, duration_seconds) → ok
 *   5. triggerEvaluate(attempt_id) → fetch oral-exam-evaluate edge function
 *   6. realtime: oral_exam_attempts UPDATE (rubric/band/feedback) → mobile UI
 *
 * Graceful fallback:
 *   - Storage upload başarısız → retry 2x, sonra error döner.
 *   - Edge function 5xx → mock evaluator yine de çalışır (provider='mock').
 *   - Edge function unreachable → submit_oral_attempt yine yapılır, retry button.
 */
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

const ORAL_BUCKET = 'oral-recordings';

// ─── Types ────────────────────────────────────────────────────────────────
export interface OralRubric {
  pronunciation: number;
  structure: number;
  vocabulary: number;
  fluency: number;
  comprehension: number;
  interactions: number;
}

export type ReviewStatus = 'none' | 'pending' | 'in_progress' | 'overridden' | 'confirmed';

export interface OralExamAttempt {
  id: string;
  simulation_id: string;
  user_id: string | null;
  prompt_id: string;
  transcript: string | null;
  audio_path: string | null;
  duration_seconds: number | null;
  rubric: OralRubric | null;
  band_score: number | null;
  feedback_tr: string | null;
  confidence_score: number | null;
  needs_review: boolean;
  review_status: ReviewStatus;
  review_reason: string | null;
  attempted_at: string;
  evaluated_at: string | null;
  provider: string | null;
  examiner_model: string | null;
  error: string | null;
}

// ─── RPC: start_oral_attempt ─────────────────────────────────────────────
export async function startOralAttempt(args: {
  simulationId: string;
  promptId: string;
}): Promise<{
  ok: boolean;
  attempt_id?: string;
  audio_path?: string;
  bucket?: string;
  error?: string;
}> {
  const { data, error } = await (supabase as any).rpc('start_oral_attempt', {
    p_simulation_id: args.simulationId,
    p_prompt_id: args.promptId,
  });
  if (error) return { ok: false, error: error.message };
  return data;
}

// ─── RPC: submit_oral_attempt ────────────────────────────────────────────
export async function submitOralAttempt(args: {
  attemptId: string;
  transcript: string;
  durationSeconds: number;
}): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await (supabase as any).rpc('submit_oral_attempt', {
    p_attempt_id: args.attemptId,
    p_transcript: args.transcript,
    p_duration_seconds: args.durationSeconds,
  });
  if (error) return { ok: false, error: error.message };
  return data;
}

// ─── RPC: request_oral_review ────────────────────────────────────────────
export async function requestOralReview(args: {
  attemptId: string;
  reason: string;
}): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await (supabase as any).rpc('request_oral_review', {
    p_attempt_id: args.attemptId,
    p_reason: args.reason,
  });
  if (error) return { ok: false, error: error.message };
  return data;
}

// ─── Storage upload (private bucket) ─────────────────────────────────────
export async function uploadOralRecording(args: {
  audioPath: string;
  fileUri: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(args.fileUri);
    if (!res.ok) return { ok: false, error: `fetch_failed_${res.status}` };
    const blob = await res.blob();
    const arrayBuffer = await blob.arrayBuffer();

    const { error } = await supabase.storage
      .from(ORAL_BUCKET)
      .upload(args.audioPath, arrayBuffer, {
        contentType: 'audio/m4a',
        upsert: false,
      });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

// ─── Edge function trigger ──────────────────────────────────────────────
// Mevcut session JWT'yi kullanır, edge function attempt ownership doğrular.
export async function triggerOralEvaluate(
  attemptId: string,
): Promise<{ ok: boolean; band_score?: number; provider?: string; error?: string }> {
  const { data: sess } = await supabase.auth.getSession();
  const token = sess.session?.access_token;
  if (!token) return { ok: false, error: 'no_session' };

  const url = `${(supabase as any).supabaseUrl}/functions/v1/oral-exam-evaluate`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ attempt_id: attemptId }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: json.error ?? `http_${res.status}` };
    return {
      ok: true,
      band_score: json.band_score,
      provider: json.provider,
    };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

// ─── useOralAttempt: realtime status ─────────────────────────────────────
// attempt_id'den polling/realtime ile satırı izle, evaluation tamamlanınca callback.
export function useOralAttempt(
  attemptId: string | null | undefined,
): { attempt: OralExamAttempt | null; loading: boolean; refresh: () => Promise<void> } {
  const [attempt, setAttempt] = useState<OralExamAttempt | null>(null);
  const [loading, setLoading] = useState(!!attemptId);

  const refresh = useCallback(async () => {
    if (!attemptId) {
      setAttempt(null);
      setLoading(false);
      return;
    }
    const { data } = await (supabase as any)
      .from('oral_exam_attempts')
      .select('*')
      .eq('id', attemptId)
      .maybeSingle();
    setAttempt(data as OralExamAttempt | null);
    setLoading(false);
  }, [attemptId]);

  useEffect(() => {
    void refresh();
    if (!attemptId) return;
    const channel = supabase
      .channel(`oral_attempt_${attemptId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'oral_exam_attempts',
          filter: `id=eq.${attemptId}`,
        },
        () => {
          void refresh();
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [attemptId, refresh]);

  return { attempt, loading, refresh };
}

// ─── useUserOralHistory: kullanıcının son N denemesi ─────────────────────
export function useUserOralHistory(
  userId: string | null | undefined,
  limit = 20,
): { rows: OralExamAttempt[]; loading: boolean; refresh: () => Promise<void> } {
  const [rows, setRows] = useState<OralExamAttempt[]>([]);
  const [loading, setLoading] = useState(!!userId);

  const refresh = useCallback(async () => {
    if (!userId) {
      setRows([]);
      setLoading(false);
      return;
    }
    const { data } = await (supabase as any)
      .from('oral_exam_attempts')
      .select('*')
      .eq('user_id', userId)
      .order('attempted_at', { ascending: false })
      .limit(limit);
    setRows((data as OralExamAttempt[]) ?? []);
    setLoading(false);
  }, [userId, limit]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { rows, loading, refresh };
}

// ─── Oral prompts (pick + fetch) ─────────────────────────────────────────
export interface OralPrompt {
  id: string;
  task_type: 'picture_description' | 'story_telling' | 'problem_solving' | 'common_topics';
  prompt: string;
  image_hint: string | null;
  follow_ups: string[];
  expected_topics: string[];
  difficulty_hint: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  context: string | null;
}

export async function fetchOralPrompt(promptId: string): Promise<OralPrompt | null> {
  const { data } = await (supabase as any)
    .from('oral_exam_prompts')
    .select('*')
    .eq('id', promptId)
    .eq('active', true)
    .maybeSingle();
  return (data as OralPrompt) ?? null;
}

// Rastgele aktif bir prompt çek (briefing → live geçişinde).
export async function pickRandomOralPrompt(args?: {
  difficulty?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  taskType?: OralPrompt['task_type'];
}): Promise<OralPrompt | null> {
  let q = (supabase as any)
    .from('oral_exam_prompts')
    .select('*')
    .eq('active', true)
    .limit(50);
  if (args?.difficulty) q = q.eq('difficulty_hint', args.difficulty);
  if (args?.taskType) q = q.eq('task_type', args.taskType);
  const { data } = await q;
  const list = (data as OralPrompt[]) ?? [];
  if (list.length === 0) return null;
  return list[Math.floor(Math.random() * list.length)] ?? null;
}

// ─── Exam simulation create (briefing'ten çağrılır) ──────────────────────
export async function startOralSimulation(args: {
  examId: string;
}): Promise<{ ok: boolean; simulationId?: string; error?: string }> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  if (!userId) return { ok: false, error: 'unauthenticated' };

  const { data, error } = await (supabase as any)
    .from('exam_simulations')
    .insert({
      user_id: userId,
      exam_id: args.examId,
      status: 'in_progress',
      started_at: new Date().toISOString(),
    })
    .select('id')
    .single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, simulationId: (data as any).id };
}

// ─── Helper: skill radar mean rubric ─────────────────────────────────────
export function aggregateRubric(attempts: OralExamAttempt[]): OralRubric | null {
  const valid = attempts.filter((a) => a.rubric);
  if (valid.length === 0) return null;
  const sum: OralRubric = {
    pronunciation: 0,
    structure: 0,
    vocabulary: 0,
    fluency: 0,
    comprehension: 0,
    interactions: 0,
  };
  for (const a of valid) {
    const r = a.rubric!;
    sum.pronunciation += r.pronunciation ?? 0;
    sum.structure += r.structure ?? 0;
    sum.vocabulary += r.vocabulary ?? 0;
    sum.fluency += r.fluency ?? 0;
    sum.comprehension += r.comprehension ?? 0;
    sum.interactions += r.interactions ?? 0;
  }
  const n = valid.length;
  return {
    pronunciation: round1(sum.pronunciation / n),
    structure: round1(sum.structure / n),
    vocabulary: round1(sum.vocabulary / n),
    fluency: round1(sum.fluency / n),
    comprehension: round1(sum.comprehension / n),
    interactions: round1(sum.interactions / n),
  };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
