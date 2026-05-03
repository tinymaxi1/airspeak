'use server';

/**
 * Notifications admin server actions — Sprint 5.E
 *
 * - sendBroadcast: notification-triggers/broadcast Edge fn'i çağırır
 *   audience filter (all / free / premium / role:X / level:Y)
 * - Audit log: admin_actions
 */
import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase/server';
import { requireAdminRole } from '@/lib/auth/guard';
import { broadcastSchema, formatZodError } from '@/lib/validation';

export interface BroadcastPayload {
  audience: 'all' | 'free' | 'premium' | string; // 'role:pilot', 'level:B2'
  title: string;
  body: string;
  kind?: string;
  url?: string; // deep link override
}

export async function sendBroadcast(
  payload: BroadcastPayload,
): Promise<{ ok: boolean; sent?: number; error?: string }> {
  const profile = await requireAdminRole('super_admin');
  const supabase = createServiceClient();

  // Sprint 7.D — Zod validation
  const parsed = broadcastSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, error: formatZodError(parsed.error) };
  }
  payload = parsed.data;

  // Edge fn URL config
  const { data: edgeUrlRow } = await (supabase as any)
    .from('app_config')
    .select('value')
    .eq('key', 'notifications.edge_url')
    .maybeSingle();
  const { data: tokenRow } = await (supabase as any)
    .from('app_config')
    .select('value')
    .eq('key', 'notifications.service_token')
    .maybeSingle();

  const baseUrl = (edgeUrlRow?.value ?? '').toString().replace(/^"|"$/g, '');
  const serviceToken = (tokenRow?.value ?? '').toString().replace(/^"|"$/g, '');

  if (!baseUrl || !serviceToken) {
    return {
      ok: false,
      error: 'app_config.notifications.edge_url veya service_token boş',
    };
  }

  const url = baseUrl.replace(/\/notification-triggers.*$/, '/notification-triggers/broadcast');

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${serviceToken}`,
    },
    body: JSON.stringify({
      audience: payload.audience,
      title: payload.title,
      body: payload.body,
      kind: payload.kind ?? 'admin_broadcast',
      data: payload.url ? { url: payload.url } : {},
    }),
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

  // Audit
  await (supabase as any).from('admin_actions').insert({
    actor_id: profile.id,
    action: 'bulk_update',
    table_name: 'notification_log',
    metadata: {
      kind: 'broadcast',
      audience: payload.audience,
      title: payload.title,
      body: payload.body,
      sent: resp.sent,
    },
  });

  revalidatePath('/notifications');
  return { ok: true, sent: resp.sent ?? 0 };
}

export async function deleteNotificationLog(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdminRole('super_admin');
  const supabase = createServiceClient();
  const { error } = await (supabase as any).from('notification_log').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/notifications');
  return { ok: true };
}
