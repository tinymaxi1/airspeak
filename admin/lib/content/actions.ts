'use server';

import { revalidatePath } from 'next/cache';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { requireAdmin, requireAdminRole } from '@/lib/auth/guard';

/**
 * Genel CRUD Server Action katmanı.
 *
 * Tüm action'lar:
 * - admin guard'ı geçer (requireAdmin)
 * - service_role bypass kullanmaz (RLS guard'lar policy'den geçer)
 * - başarı sonrası ilgili path'i revalidate eder
 * - audit_change trigger'ı zaten DB'de admin_actions'a yazar (manuel log gerekmez)
 */

export type ContentTable =
  | 'modules'
  | 'units'
  | 'lessons'
  | 'exercises'
  | 'vocab_terms'
  | 'interview_questions'
  | 'icao4_questions'
  | 'oral_prompts'
  | 'placement_questions'
  | 'airlines'
  | 'scenarios'
  | 'badges'
  | 'readback_clearances'
  | 'pronunciation_sentences'
  | 'listen_solve_drills';

export type ActionResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string };

// ─────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────

export async function createRow<T extends Record<string, any>>(
  table: ContentTable,
  payload: T,
  revalidate: string | string[] = '/',
): Promise<ActionResult<{ id: string; slug?: string }>> {
  await requireAdminRole('editor');
  const supabase = await createClient();
  const { data, error } = await (supabase as any)
    .from(table)
    .insert(payload)
    .select('id, slug')
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }
  revalidatePaths(revalidate);
  return { ok: true, data };
}

// ─────────────────────────────────────────────
// UPDATE
// ─────────────────────────────────────────────

export async function updateRow<T extends Record<string, any>>(
  table: ContentTable,
  id: string,
  patch: Partial<T>,
  revalidate: string | string[] = '/',
): Promise<ActionResult<void>> {
  await requireAdminRole('editor');
  const supabase = await createClient();
  const { error } = await (supabase as any).from(table).update(patch).eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePaths(revalidate);
  return { ok: true, data: undefined };
}

// ─────────────────────────────────────────────
// DELETE — sadece super_admin
// ─────────────────────────────────────────────

export async function deleteRow(
  table: ContentTable,
  id: string,
  revalidate: string | string[] = '/',
): Promise<ActionResult<void>> {
  await requireAdminRole('super_admin');
  const supabase = await createClient();
  const { error } = await (supabase as any).from(table).delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePaths(revalidate);
  return { ok: true, data: undefined };
}

// ─────────────────────────────────────────────
// STATUS WORKFLOW
// ─────────────────────────────────────────────

export async function setStatus(
  table: ContentTable,
  id: string,
  status: 'draft' | 'review' | 'published' | 'archived',
  revalidate: string | string[] = '/',
): Promise<ActionResult<void>> {
  // reviewer = sadece status değişikliği yapabilir; editor+ yapabilir
  await requireAdminRole('reviewer');
  const supabase = await createClient();
  const { error } = await (supabase as any).from(table).update({ status }).eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePaths(revalidate);
  return { ok: true, data: undefined };
}

// ─────────────────────────────────────────────
// REORDER (drag-drop sıralama)
// ─────────────────────────────────────────────

export async function reorderRows(
  table: ContentTable,
  orderedIds: string[],
  revalidate: string | string[] = '/',
): Promise<ActionResult<void>> {
  await requireAdminRole('editor');
  const supabase = await createClient();
  // Her satırı yeni sort ile güncelle
  const updates = orderedIds.map((id, sort) =>
    (supabase as any).from(table).update({ sort }).eq('id', id),
  );
  const results = await Promise.all(updates);
  const firstError = results.find((r) => r.error);
  if (firstError?.error) return { ok: false, error: firstError.error.message };
  revalidatePaths(revalidate);
  return { ok: true, data: undefined };
}

// ─────────────────────────────────────────────
// BULK STATUS — birden fazla satırı tek seferde published/archived yap
// ─────────────────────────────────────────────

export async function bulkSetStatus(
  table: ContentTable,
  ids: string[],
  status: 'draft' | 'review' | 'published' | 'archived',
  revalidate: string | string[] = '/',
): Promise<ActionResult<{ updated: number }>> {
  await requireAdminRole('reviewer');
  const supabase = await createClient();
  const { error, count } = await (supabase as any)
    .from(table)
    .update({ status }, { count: 'exact' })
    .in('id', ids);
  if (error) return { ok: false, error: error.message };
  revalidatePaths(revalidate);
  return { ok: true, data: { updated: count ?? ids.length } };
}

// ─────────────────────────────────────────────
// REVISIONS — son N revizyon
// ─────────────────────────────────────────────

export async function fetchRevisions(
  table: ContentTable,
  rowId: string,
  limit = 20,
): Promise<ActionResult<any[]>> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await (supabase as any).rpc('get_revisions', {
    target_table: table,
    target_id: rowId,
    limit_count: limit,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: data ?? [] };
}

// ─────────────────────────────────────────────
// USER MGMT — premium / ban / admin role (super_admin)
// ─────────────────────────────────────────────

export async function setPremium(
  userId: string,
  days: number | null,
): Promise<ActionResult<void>> {
  await requireAdminRole('editor');
  const supabase = await createClient();
  const premiumUntil =
    days === null ? null : new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  const { error } = await (supabase as any)
    .from('profiles')
    .update({ premium_until: premiumUntil })
    .eq('id', userId);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/users');
  return { ok: true, data: undefined };
}

export async function banUser(
  userId: string,
  reason: string,
): Promise<ActionResult<void>> {
  await requireAdminRole('super_admin');
  const supabase = await createClient();
  const { error } = await (supabase as any)
    .from('profiles')
    .update({ banned_at: new Date().toISOString(), ban_reason: reason })
    .eq('id', userId);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/users');
  return { ok: true, data: undefined };
}

export async function unbanUser(userId: string): Promise<ActionResult<void>> {
  await requireAdminRole('super_admin');
  const supabase = await createClient();
  const { error } = await (supabase as any)
    .from('profiles')
    .update({ banned_at: null, ban_reason: null })
    .eq('id', userId);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/users');
  return { ok: true, data: undefined };
}

export async function setAdminRole(
  userId: string,
  adminRole: 'super_admin' | 'editor' | 'reviewer' | null,
): Promise<ActionResult<void>> {
  await requireAdminRole('super_admin');
  const supabase = await createClient();
  const { error } = await (supabase as any)
    .from('profiles')
    .update({ is_admin: adminRole !== null, admin_role: adminRole })
    .eq('id', userId);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/users');
  return { ok: true, data: undefined };
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function revalidatePaths(paths: string | string[]) {
  const list = Array.isArray(paths) ? paths : [paths];
  for (const p of list) {
    try {
      revalidatePath(p);
    } catch {
      // some paths may not exist yet — silent
    }
  }
}
