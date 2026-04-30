'use server';

/**
 * Admin yarışma server actions.
 *
 * Hepsi editor+ veya super_admin (yıkıcı için).
 * Audit: log_admin_action.
 */
import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase/server';
import { requireAdminRole } from '@/lib/auth/guard';

export type CompetitionTheme =
  | 'icao_focus'
  | 'phraseology'
  | 'vocabulary_blast'
  | 'maintenance'
  | 'cabin_safety'
  | 'seasonal'
  | 'company_event'
  | 'other';

export type CompetitionType =
  | 'xp_race'
  | 'lesson_count'
  | 'perfect_score'
  | 'streak'
  | 'specific_content';

export type CompetitionStatus =
  | 'draft'
  | 'announced'
  | 'active'
  | 'closed'
  | 'cancelled';

export interface PrizeRow {
  rank?: number;
  rank_from?: number;
  rank_to?: number;
  type: 'coin' | 'badge' | 'premium_days' | 'certificate' | 'custom';
  amount?: number;
  code?: string;
  days?: number;
  metadata?: Record<string, unknown>;
}

export interface CompetitionPayload {
  slug: string;
  name: string;
  name_tr?: string | null;
  description?: string | null;
  description_tr?: string | null;
  theme: CompetitionTheme;
  type: CompetitionType;
  rules?: Record<string, unknown>;
  target_role?: string | null;
  target_level_tier?: string | null;
  start_date: string;
  end_date: string;
  is_premium?: boolean;
  entry_cost_coin?: number;
  prize_pool?: PrizeRow[];
  banner_url?: string | null;
  icon_emoji?: string;
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

export async function createCompetition(
  payload: CompetitionPayload,
): Promise<{ ok: boolean; id?: string; error?: string }> {
  await requireAdminRole('editor');
  const supabase = createServiceClient();

  if (new Date(payload.end_date) <= new Date(payload.start_date)) {
    return { ok: false, error: 'end_date start_date sonrası olmalı' };
  }

  const { data, error } = await (supabase as any)
    .from('competitions')
    .insert({
      ...payload,
      rules: payload.rules ?? {},
      prize_pool: payload.prize_pool ?? [],
      icon_emoji: payload.icon_emoji ?? '🏁',
      status: 'draft',
    })
    .select('id')
    .single();

  if (error) return { ok: false, error: error.message };

  await logAdmin(supabase, 'create', {
    table: 'competitions',
    row_id: (data as any).id,
    slug: payload.slug,
  });
  revalidatePath('/competitions');
  return { ok: true, id: (data as any).id };
}

export async function updateCompetition(
  id: string,
  patch: Partial<CompetitionPayload>,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdminRole('editor');
  const supabase = createServiceClient();

  const { error } = await (supabase as any)
    .from('competitions')
    .update(patch)
    .eq('id', id);
  if (error) return { ok: false, error: error.message };

  await logAdmin(supabase, 'update', {
    table: 'competitions',
    row_id: id,
    fields: Object.keys(patch),
  });
  revalidatePath('/competitions');
  revalidatePath(`/competitions/${id}`);
  return { ok: true };
}

export async function setCompetitionStatus(
  id: string,
  status: CompetitionStatus,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdminRole('editor');
  const supabase = createServiceClient();

  const { error } = await (supabase as any)
    .from('competitions')
    .update({ status })
    .eq('id', id);
  if (error) return { ok: false, error: error.message };

  const action =
    status === 'announced' || status === 'active'
      ? 'publish'
      : status === 'cancelled'
        ? 'archive'
        : 'update';
  await logAdmin(supabase, action, {
    table: 'competitions',
    row_id: id,
    new_status: status,
  });
  revalidatePath('/competitions');
  revalidatePath(`/competitions/${id}`);
  return { ok: true };
}

export async function manualResolveCompetition(
  id: string,
): Promise<{ ok: boolean; result?: unknown; error?: string }> {
  await requireAdminRole('super_admin');
  const supabase = createServiceClient();

  const { data, error } = await (supabase as any).rpc('resolve_competition', {
    p_competition_id: id,
  });
  if (error) return { ok: false, error: error.message };

  await logAdmin(supabase, 'bulk_update', {
    table: 'competitions',
    row_id: id,
    action_subtype: 'manual_resolve',
    result: data,
  });
  revalidatePath('/competitions');
  revalidatePath(`/competitions/${id}`);
  return { ok: true, result: data };
}

export async function removeCompetitionEntry(
  entryId: string,
  reason: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdminRole('super_admin');
  const supabase = createServiceClient();

  const { data: entry } = await (supabase as any)
    .from('competition_entries')
    .select('user_id, competition_id')
    .eq('id', entryId)
    .maybeSingle();

  const { error } = await (supabase as any)
    .from('competition_entries')
    .delete()
    .eq('id', entryId);
  if (error) return { ok: false, error: error.message };

  await logAdmin(supabase, 'delete', {
    table: 'competition_entries',
    row_id: entryId,
    target_user_id: (entry as any)?.user_id ?? null,
    competition_id: (entry as any)?.competition_id ?? null,
    reason,
  });
  revalidatePath('/competitions');
  return { ok: true };
}

export async function deleteCompetition(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdminRole('super_admin');
  const supabase = createServiceClient();

  const { error } = await (supabase as any)
    .from('competitions')
    .delete()
    .eq('id', id);
  if (error) return { ok: false, error: error.message };

  await logAdmin(supabase, 'delete', { table: 'competitions', row_id: id });
  revalidatePath('/competitions');
  return { ok: true };
}
