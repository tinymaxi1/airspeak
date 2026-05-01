'use server';

/**
 * Translation admin server actions — Sprint 9.D
 *
 * - triggerTranslation: translate-content Edge fn'i çağırır.
 * - bulkTranslate: birden çok content_id için ardışık çağrı.
 */
import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase/server';
import { requireAdminRole } from '@/lib/auth/guard';

export interface TranslateResult {
  ok: boolean;
  translated?: number;
  target_langs?: string[];
  provider?: string;
  cost_usd?: number;
  error?: string;
}

async function getEdgeUrl(supabase: ReturnType<typeof createServiceClient>): Promise<{
  url: string;
  token: string;
} | { error: string }> {
  const { data: edgeRow } = await (supabase as any)
    .from('app_config')
    .select('value')
    .eq('key', 'notifications.edge_url')
    .maybeSingle();
  const { data: tokenRow } = await (supabase as any)
    .from('app_config')
    .select('value')
    .eq('key', 'notifications.service_token')
    .maybeSingle();

  const base = (edgeRow?.value ?? '').toString().replace(/^"|"$/g, '');
  const token = (tokenRow?.value ?? '').toString().replace(/^"|"$/g, '');

  if (!base || !token) {
    return { error: 'app_config.notifications.edge_url veya service_token boş' };
  }
  const url = base.replace(/\/notification-triggers.*$/, '/translate-content');
  return { url, token };
}

export async function triggerTranslation(args: {
  content_type: string;
  content_id: string;
  target_langs?: string[];
}): Promise<TranslateResult> {
  const profile = await requireAdminRole('editor');
  const supabase = createServiceClient();

  const env = await getEdgeUrl(supabase);
  if ('error' in env) return { ok: false, error: env.error };

  const res = await fetch(env.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.token}`,
    },
    body: JSON.stringify(args),
  });

  let resp: any = {};
  try {
    resp = await res.json();
  } catch {
    /* ignore */
  }

  if (!res.ok || !resp?.ok) {
    return { ok: false, error: resp?.error ?? `HTTP ${res.status}` };
  }

  // Audit log
  await (supabase as any).from('admin_actions').insert({
    actor_id: profile.id,
    action: 'bulk_update',
    table_name: 'content_translations',
    metadata: {
      kind: 'translate',
      content_type: args.content_type,
      content_id: args.content_id,
      translated: resp.translated,
      provider: resp.provider,
      cost_usd: resp.cost_usd,
    },
  });

  revalidatePath('/translations');
  return resp as TranslateResult;
}

export async function bulkTranslate(args: {
  content_type: string;
  content_ids: string[];
}): Promise<{ ok: boolean; total: number; failed: number; results: TranslateResult[] }> {
  await requireAdminRole('editor');
  const results: TranslateResult[] = [];
  let failed = 0;
  for (const id of args.content_ids) {
    const r = await triggerTranslation({
      content_type: args.content_type,
      content_id: id,
    });
    results.push(r);
    if (!r.ok) failed++;
  }
  return { ok: failed === 0, total: args.content_ids.length, failed, results };
}

export async function deleteTranslation(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdminRole('super_admin');
  const supabase = createServiceClient();
  const { error } = await (supabase as any)
    .from('content_translations')
    .delete()
    .eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/translations');
  return { ok: true };
}

export async function markTranslationReviewed(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const profile = await requireAdminRole('reviewer');
  const supabase = createServiceClient();
  const { error } = await (supabase as any)
    .from('content_translations')
    .update({
      reviewed_at: new Date().toISOString(),
      is_machine_translated: false,
      translator: 'human',
    })
    .eq('id', id);
  if (error) return { ok: false, error: error.message };

  await (supabase as any).from('admin_actions').insert({
    actor_id: profile.id,
    action: 'update',
    table_name: 'content_translations',
    row_id: id,
    metadata: { kind: 'mark_reviewed' },
  });

  revalidatePath('/translations');
  return { ok: true };
}
