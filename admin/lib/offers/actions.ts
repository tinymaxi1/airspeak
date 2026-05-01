'use server';

/**
 * Limited offers admin server actions.
 *
 * - createOffer / updateOffer / deleteOffer (super_admin)
 * - setOfferActive (toggle)
 * - broadcastOfferPush (notification-triggers/special_offer)
 *
 * Audit: log_admin_action.
 */
import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase/server';
import { requireAdminRole } from '@/lib/auth/guard';

export type OfferAudience =
  | 'all'
  | 'free'
  | 'trial_used'
  | 'expired_trial'
  | 'active_premium'
  | 'inactive_7d';

export interface OfferPayload {
  code: string;
  title_tr: string;
  title_en?: string | null;
  body_tr: string;
  body_en?: string | null;
  monthly_price_try?: number | null;
  yearly_price_try?: number | null;
  lifetime_price_try?: number | null;
  discount_percent?: number | null;
  starts_at: string;
  ends_at: string;
  is_active?: boolean;
  banner_color?: string | null;
  push_title_tr?: string | null;
  push_body_tr?: string | null;
  audience: OfferAudience;
  priority?: number;
}

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

function validatePayload(p: OfferPayload): string | null {
  if (!/^[a-z0-9_-]+$/.test(p.code)) {
    return 'code: küçük harf, rakam, _ ya da -';
  }
  if (new Date(p.ends_at) <= new Date(p.starts_at)) {
    return 'ends_at, starts_at sonrası olmalı';
  }
  const hasPricing =
    p.monthly_price_try != null ||
    p.yearly_price_try != null ||
    p.lifetime_price_try != null ||
    p.discount_percent != null;
  if (!hasPricing) {
    return 'En az bir tier override veya discount_percent olmalı';
  }
  if (p.discount_percent != null && (p.discount_percent < 1 || p.discount_percent > 90)) {
    return 'discount_percent 1-90 arası olmalı';
  }
  return null;
}

export async function createOffer(
  payload: OfferPayload,
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const profile = await requireAdminRole('editor');
  const supabase = createServiceClient();

  const err = validatePayload(payload);
  if (err) return { ok: false, error: err };

  const { data, error } = await (supabase as any)
    .from('limited_offers')
    .insert({
      ...payload,
      created_by: profile.id,
      is_active: payload.is_active ?? false, // varsayılan pasif (test sonrası açılır)
      priority: payload.priority ?? 0,
      banner_color: payload.banner_color || '#E63946',
    })
    .select('id')
    .single();
  if (error) return { ok: false, error: error.message };

  await logAdmin(supabase, 'create', {
    table: 'limited_offers',
    row_id: (data as any).id,
    code: payload.code,
  });
  revalidatePath('/offers');
  return { ok: true, id: (data as any).id };
}

export async function updateOffer(
  id: string,
  patch: Partial<OfferPayload>,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdminRole('editor');
  const supabase = createServiceClient();

  // Validate (sadece ilgili alanlar geliyorsa skip)
  if (patch.code && !/^[a-z0-9_-]+$/.test(patch.code)) {
    return { ok: false, error: 'code: küçük harf, rakam, _ ya da -' };
  }
  if (patch.starts_at && patch.ends_at && new Date(patch.ends_at) <= new Date(patch.starts_at)) {
    return { ok: false, error: 'ends_at, starts_at sonrası olmalı' };
  }

  const { error } = await (supabase as any)
    .from('limited_offers')
    .update(patch)
    .eq('id', id);
  if (error) return { ok: false, error: error.message };

  await logAdmin(supabase, 'update', {
    table: 'limited_offers',
    row_id: id,
    fields: Object.keys(patch),
  });
  revalidatePath('/offers');
  return { ok: true };
}

export async function setOfferActive(
  id: string,
  active: boolean,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdminRole('editor');
  const supabase = createServiceClient();
  const { error } = await (supabase as any)
    .from('limited_offers')
    .update({ is_active: active })
    .eq('id', id);
  if (error) return { ok: false, error: error.message };
  await logAdmin(supabase, active ? 'publish' : 'archive', {
    table: 'limited_offers',
    row_id: id,
    is_active: active,
  });
  revalidatePath('/offers');
  return { ok: true };
}

export async function deleteOffer(id: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdminRole('super_admin');
  const supabase = createServiceClient();
  const { error } = await (supabase as any)
    .from('limited_offers')
    .delete()
    .eq('id', id);
  if (error) return { ok: false, error: error.message };
  await logAdmin(supabase, 'delete', { table: 'limited_offers', row_id: id });
  revalidatePath('/offers');
  return { ok: true };
}

export async function broadcastOfferPush(
  offerId: string,
): Promise<{ ok: boolean; sent?: number; error?: string }> {
  await requireAdminRole('editor');
  const supabase = createServiceClient();

  // 1. Offer bilgisini çek (code + audience)
  const { data: offer, error: offerErr } = await (supabase as any)
    .from('limited_offers')
    .select('id, code, title_tr, audience, is_active, starts_at, ends_at, push_title_tr, push_body_tr')
    .eq('id', offerId)
    .maybeSingle();
  if (offerErr || !offer) return { ok: false, error: offerErr?.message ?? 'offer_not_found' };

  if (!(offer as any).is_active) return { ok: false, error: 'Önce offer\'ı aktif et' };

  // 2. Edge function URL + token'i config'ten oku
  const { data: cfgRows } = await (supabase as any)
    .from('app_config')
    .select('key, value')
    .in('key', ['notifications.edge_url', 'notifications.service_token']);

  const cfg = new Map<string, any>();
  for (const r of (cfgRows ?? []) as any[]) cfg.set(r.key, r.value);
  const url = String(cfg.get('notifications.edge_url') ?? '').replace(/^"|"$/g, '');
  const token = String(cfg.get('notifications.service_token') ?? '').replace(/^"|"$/g, '');

  if (!url || url.length < 5) {
    return {
      ok: false,
      error: 'notifications.edge_url ayarlanmamış (Settings > Edge URL)',
    };
  }

  // 3. POST to special_offer trigger
  let sent = 0;
  try {
    const res = await fetch(`${url}/special_offer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ offer_id: (offer as any).id, offer_code: (offer as any).code }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: json.error ?? `HTTP ${res.status}` };
    }
    sent = Number(json.sent ?? 0);
  } catch (e) {
    return { ok: false, error: String(e) };
  }

  await logAdmin(supabase, 'bulk_update', {
    table: 'limited_offers',
    row_id: offerId,
    action_subtype: 'push_broadcast',
    sent_count: sent,
    audience: (offer as any).audience,
  });
  revalidatePath('/offers');
  return { ok: true, sent };
}
