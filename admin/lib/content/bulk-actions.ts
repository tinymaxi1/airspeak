'use server';

/**
 * Bulk content actions — Sprint C3c
 *
 * Çoklu satır status update + delete. RLS admin guard'dan geçer.
 */
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAdminRole } from '@/lib/auth/guard';
import type { ContentTable } from './actions';

export type ActionResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string };

const BULK_TABLES: ContentTable[] = [
  'readback_clearances',
  'pronunciation_sentences',
  'listen_solve_drills',
];

function assertTable(table: string): asserts table is ContentTable {
  if (!BULK_TABLES.includes(table as ContentTable)) {
    throw new Error(`Bulk action allowed only for: ${BULK_TABLES.join(', ')}`);
  }
}

/** Toplu status update (publish / draft / archive). */
export async function bulkSetStatus(
  table: ContentTable,
  ids: string[],
  status: 'draft' | 'published' | 'archived',
  revalidate?: string | string[],
): Promise<ActionResult<{ updated: number }>> {
  await requireAdminRole('editor');
  assertTable(table);
  if (!Array.isArray(ids) || ids.length === 0) {
    return { ok: false, error: 'no ids' };
  }
  if (ids.length > 500) {
    return { ok: false, error: 'max 500 satır per call' };
  }

  const supabase = await createClient();
  const { error, count } = await (supabase as any)
    .from(table)
    .update({ status })
    .in('id', ids)
    .select('id', { count: 'exact', head: true });

  if (error) return { ok: false, error: error.message };

  if (revalidate) {
    const paths = Array.isArray(revalidate) ? revalidate : [revalidate];
    for (const p of paths) revalidatePath(p);
  }

  return { ok: true, data: { updated: count ?? ids.length } };
}

/** Toplu silme. Super_admin gerekir. */
export async function bulkDelete(
  table: ContentTable,
  ids: string[],
  revalidate?: string | string[],
): Promise<ActionResult<{ deleted: number }>> {
  await requireAdminRole('super_admin');
  assertTable(table);
  if (!Array.isArray(ids) || ids.length === 0) {
    return { ok: false, error: 'no ids' };
  }
  if (ids.length > 200) {
    return { ok: false, error: 'max 200 satır per delete' };
  }

  const supabase = await createClient();
  const { error, count } = await (supabase as any)
    .from(table)
    .delete()
    .in('id', ids)
    .select('id', { count: 'exact', head: true });

  if (error) return { ok: false, error: error.message };

  if (revalidate) {
    const paths = Array.isArray(revalidate) ? revalidate : [revalidate];
    for (const p of paths) revalidatePath(p);
  }

  return { ok: true, data: { deleted: count ?? ids.length } };
}
