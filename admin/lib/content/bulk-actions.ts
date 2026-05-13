'use server';

/**
 * Bulk content actions — Sprint C3c
 *
 * Çoklu satır status update + delete. RLS admin guard'dan geçer.
 *
 * NOT: 'use server' dosyasında SADECE async function export edilebilir.
 * Type/const/sync helper'lar non-export olmalı veya başka dosyaya taşınmalı.
 * (ActionResult type → actions.ts'ten import edilir.)
 */
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAdminRole } from '@/lib/auth/guard';
import type { ContentTable, ActionResult } from './actions';

// File-level non-export helper'lar (server action bundler bunları ayırır)
const BULK_TABLES = [
  'readback_clearances',
  'pronunciation_sentences',
  'listen_solve_drills',
] as const;

function isBulkTable(table: string): table is ContentTable {
  return (BULK_TABLES as readonly string[]).includes(table);
}

/** Toplu status update (publish / draft / archive). */
export async function bulkSetStatus(
  table: ContentTable,
  ids: string[],
  status: 'draft' | 'published' | 'archived',
  revalidate?: string | string[],
): Promise<ActionResult<{ updated: number }>> {
  await requireAdminRole('editor');
  if (!isBulkTable(table)) {
    return { ok: false, error: `Bulk action allowed only for: ${BULK_TABLES.join(', ')}` };
  }
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
  if (!isBulkTable(table)) {
    return { ok: false, error: `Bulk action allowed only for: ${BULK_TABLES.join(', ')}` };
  }
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
