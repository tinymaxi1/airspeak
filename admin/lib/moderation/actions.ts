'use server';

/**
 * Community moderation admin server actions.
 *
 * - Reports queue: resolveReport, dismissReport (content_flags status update)
 * - Mod actions: hidePost, hideComment, unhidePost, unhideComment
 *   (mevcut RPC hide_community_post / hide_community_comment çağırır)
 * - Banned words: create / update / delete
 * - User moderator role: setUserModerator (super_admin only)
 */
import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase/server';
import { requireAdminRole } from '@/lib/auth/guard';

async function logAdmin(
  supabase: ReturnType<typeof createServiceClient>,
  action: string,
  meta: Record<string, unknown>,
) {
  await (supabase as any).rpc('log_admin_action', {
    p_action: action,
    p_table_name: meta.table ?? null,
    p_metadata: meta,
  });
}

// ─── Reports queue ────────────────────────────────────────────────────────
export async function resolveReport(args: {
  id: string;
  status: 'reviewed' | 'resolved' | 'dismissed';
  reviewerNote?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const profile = await requireAdminRole('reviewer');
  const supabase = createServiceClient();
  const { error } = await (supabase as any)
    .from('content_flags')
    .update({
      status: args.status,
      reviewed_at: new Date().toISOString(),
      reviewer_id: profile.id,
      reviewer_note: args.reviewerNote ?? null,
    })
    .eq('id', args.id);
  if (error) return { ok: false, error: error.message };
  await logAdmin(supabase, 'update', {
    table: 'content_flags',
    row_id: args.id,
    new_status: args.status,
  });
  revalidatePath('/reports');
  return { ok: true };
}

// ─── Hide / unhide community content (admin) ─────────────────────────────
export async function hideCommunityPost(
  postId: string,
  unhide = false,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdminRole('reviewer');
  const supabase = createServiceClient();
  const { data, error } = await (supabase as any).rpc('hide_community_post', {
    p_post_id: postId,
    p_unhide: unhide,
  });
  if (error) return { ok: false, error: error.message };
  if (!(data as any)?.ok) return { ok: false, error: (data as any)?.error ?? 'rpc_failed' };
  await logAdmin(supabase, unhide ? 'restore' : 'archive', {
    table: 'community_posts',
    row_id: postId,
    action_subtype: unhide ? 'unhide' : 'hide',
  });
  revalidatePath('/reports');
  return { ok: true };
}

export async function hideCommunityComment(
  commentId: string,
  unhide = false,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdminRole('reviewer');
  const supabase = createServiceClient();
  const { data, error } = await (supabase as any).rpc('hide_community_comment', {
    p_comment_id: commentId,
    p_unhide: unhide,
  });
  if (error) return { ok: false, error: error.message };
  if (!(data as any)?.ok) return { ok: false, error: (data as any)?.error ?? 'rpc_failed' };
  await logAdmin(supabase, unhide ? 'restore' : 'archive', {
    table: 'community_comments',
    row_id: commentId,
    action_subtype: unhide ? 'unhide' : 'hide',
  });
  revalidatePath('/reports');
  return { ok: true };
}

// ─── Banned words ─────────────────────────────────────────────────────────
export type BannedWordSeverity = 'warn' | 'block';
export type BannedWordCategory = 'profanity' | 'spam' | 'hate' | 'pii' | 'other';

export interface BannedWordPayload {
  word: string;
  severity: BannedWordSeverity;
  category: BannedWordCategory;
}

export async function createBannedWord(
  payload: BannedWordPayload,
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const profile = await requireAdminRole('editor');
  const supabase = createServiceClient();
  const word = payload.word.trim().toLowerCase();
  if (word.length < 2 || word.length > 80) {
    return { ok: false, error: 'word: 2-80 karakter' };
  }
  const { data, error } = await (supabase as any)
    .from('community_banned_words')
    .insert({
      word,
      severity: payload.severity,
      category: payload.category,
      created_by: profile.id,
    })
    .select('id')
    .single();
  if (error) return { ok: false, error: error.message };
  await logAdmin(supabase, 'create', {
    table: 'community_banned_words',
    row_id: (data as any).id,
    word,
  });
  revalidatePath('/banned-words');
  return { ok: true, id: (data as any).id };
}

export async function updateBannedWord(
  id: string,
  patch: Partial<BannedWordPayload>,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdminRole('editor');
  const supabase = createServiceClient();
  const update: Record<string, unknown> = {};
  if (patch.word) update.word = patch.word.trim().toLowerCase();
  if (patch.severity) update.severity = patch.severity;
  if (patch.category) update.category = patch.category;
  const { error } = await (supabase as any)
    .from('community_banned_words')
    .update(update)
    .eq('id', id);
  if (error) return { ok: false, error: error.message };
  await logAdmin(supabase, 'update', {
    table: 'community_banned_words',
    row_id: id,
    fields: Object.keys(update),
  });
  revalidatePath('/banned-words');
  return { ok: true };
}

export async function deleteBannedWord(id: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdminRole('super_admin');
  const supabase = createServiceClient();
  const { error } = await (supabase as any)
    .from('community_banned_words')
    .delete()
    .eq('id', id);
  if (error) return { ok: false, error: error.message };
  await logAdmin(supabase, 'delete', { table: 'community_banned_words', row_id: id });
  revalidatePath('/banned-words');
  return { ok: true };
}

// ─── User moderator role (super_admin) ───────────────────────────────────
export async function setUserModerator(
  userId: string,
  isModerator: boolean,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdminRole('super_admin');
  const supabase = createServiceClient();
  const { data, error } = await (supabase as any).rpc('set_user_moderator', {
    p_user_id: userId,
    p_is_moderator: isModerator,
  });
  if (error) return { ok: false, error: error.message };
  if (!(data as any)?.ok) return { ok: false, error: (data as any)?.error ?? 'rpc_failed' };
  revalidatePath('/users');
  return { ok: true };
}
