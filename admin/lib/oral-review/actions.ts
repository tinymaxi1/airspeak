'use server';

/**
 * Oral review queue admin actions.
 *
 * - getOralReviewQueue: oral_review_queue view (low_confidence + user_disputed)
 * - getOralAudioSignedUrl: oral-recordings bucket signed URL (1 saat)
 * - resolveOralReview: RPC confirm | override (rubric/band override)
 */
import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase/server';
import { requireAdminRole } from '@/lib/auth/guard';

export interface OralReviewRow {
  id: string;
  simulation_id: string;
  user_id: string;
  prompt_id: string;
  transcript: string | null;
  audio_path: string | null;
  duration_seconds: number | null;
  rubric: any;
  band_score: number | null;
  feedback_tr: string | null;
  confidence_score: number | null;
  review_status: string;
  review_reason: string | null;
  review_requested_at: string | null;
  attempted_at: string;
  evaluated_at: string | null;
  provider: string | null;
  examiner_model: string | null;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  queue_reason: 'user_disputed' | 'low_confidence' | 'other';
}

export async function getOralReviewQueue(): Promise<OralReviewRow[]> {
  await requireAdminRole('reviewer');
  const supabase = createServiceClient();
  const { data } = await (supabase as any)
    .from('oral_review_queue')
    .select('*')
    .limit(100);
  return (data as OralReviewRow[]) ?? [];
}

export async function getOralAudioSignedUrl(
  audioPath: string,
): Promise<{ ok: boolean; url?: string; error?: string }> {
  await requireAdminRole('reviewer');
  const supabase = createServiceClient();
  const { data, error } = await (supabase as any).storage
    .from('oral-recordings')
    .createSignedUrl(audioPath, 60 * 60); // 1 saat
  if (error || !data?.signedUrl) {
    return { ok: false, error: error?.message ?? 'no_url' };
  }
  return { ok: true, url: data.signedUrl };
}

export async function resolveOralReview(args: {
  attemptId: string;
  action: 'confirm' | 'override';
  newRubric?: Record<string, number>;
  newBand?: number;
  note?: string;
}): Promise<{ ok: boolean; error?: string }> {
  await requireAdminRole('reviewer');
  const supabase = createServiceClient();
  const { data, error } = await (supabase as any).rpc('resolve_oral_review', {
    p_attempt_id: args.attemptId,
    p_action: args.action,
    p_new_rubric: args.newRubric ?? null,
    p_new_band: args.newBand ?? null,
    p_note: args.note ?? null,
  });
  if (error) return { ok: false, error: error.message };
  if (!(data as any)?.ok) return { ok: false, error: (data as any)?.error ?? 'rpc_failed' };
  revalidatePath('/oral-review');
  return { ok: true };
}
