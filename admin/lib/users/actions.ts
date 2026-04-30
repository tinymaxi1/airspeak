'use server';

/**
 * Admin user detail actions — başka kullanıcının profilini/listelerini düzenle.
 *
 * Service role ile RLS bypass — yetki kontrolü server-side guard.
 * Tüm değişiklikler admin_actions tablosuna otomatik audit yazılır
 * (audit_content_change trigger profiles üzerinde aktif değil ama
 *  log_admin_action ile özet log atılır).
 */
import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase/server';
import { requireAdminRole } from '@/lib/auth/guard';

export type UserDetailTable =
  | 'user_experiences'
  | 'user_education'
  | 'user_certifications'
  | 'user_type_ratings';

const ALLOWED_PROFILE_FIELDS = new Set([
  'full_name',
  'callsign',
  'avatar_url',
  'bio_short',
  'bio_long',
  'company',
  'position',
  'base_airport',
  'city',
  'country',
  'linkedin_url',
  'instagram',
  'twitter',
  'youtube',
  'facebook',
  'website',
  'icao_english_level',
  'aviation_experience_years',
  'is_profile_public',
  'role',
  'level',
]);

function sanitizeProfilePatch(input: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    if (ALLOWED_PROFILE_FIELDS.has(k)) out[k] = v;
  }
  return out;
}

async function logAdmin(
  supabase: ReturnType<typeof createServiceClient>,
  action: string,
  meta: Record<string, unknown>,
) {
  await (supabase as any).rpc('log_admin_action', {
    p_action: action,
    p_table_name: meta.table ?? null,
    p_target_user_id: meta.target_user_id ?? null,
    p_metadata: meta,
  });
}

export async function adminUpdateProfile(
  userId: string,
  patch: Record<string, unknown>,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdminRole('editor');
  const supabase = createServiceClient();
  const safe = sanitizeProfilePatch(patch);
  if (Object.keys(safe).length === 0) {
    return { ok: false, error: 'Düzenlenebilir alan yok' };
  }
  const { error } = await (supabase as any).from('profiles').update(safe).eq('id', userId);
  if (error) return { ok: false, error: error.message };
  await logAdmin(supabase, 'update', {
    table: 'profiles',
    target_user_id: userId,
    fields: Object.keys(safe),
    source: 'admin_user_detail',
  });
  revalidatePath(`/users/${userId}`);
  revalidatePath('/users');
  return { ok: true };
}

export async function adminClearAvatar(
  userId: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdminRole('super_admin');
  const supabase = createServiceClient();
  const { error } = await (supabase as any)
    .from('profiles')
    .update({ avatar_url: null })
    .eq('id', userId);
  if (error) return { ok: false, error: error.message };
  await logAdmin(supabase, 'update', {
    table: 'profiles',
    target_user_id: userId,
    field: 'avatar_url',
    action: 'avatar_moderation_clear',
  });
  revalidatePath(`/users/${userId}`);
  return { ok: true };
}

export async function adminCreateDetailRow(
  userId: string,
  table: UserDetailTable,
  data: Record<string, unknown>,
): Promise<{ ok: boolean; id?: string; error?: string }> {
  await requireAdminRole('editor');
  const supabase = createServiceClient();
  const { data: row, error } = await (supabase as any)
    .from(table)
    .insert({ ...data, user_id: userId })
    .select('id')
    .single();
  if (error) return { ok: false, error: error.message };
  await logAdmin(supabase, 'create', { table, target_user_id: userId, row_id: row.id });
  revalidatePath(`/users/${userId}`);
  return { ok: true, id: row.id };
}

export async function adminUpdateDetailRow(
  table: UserDetailTable,
  id: string,
  patch: Record<string, unknown>,
  userId: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdminRole('editor');
  const supabase = createServiceClient();
  const { error } = await (supabase as any).from(table).update(patch).eq('id', id);
  if (error) return { ok: false, error: error.message };
  await logAdmin(supabase, 'update', { table, target_user_id: userId, row_id: id });
  revalidatePath(`/users/${userId}`);
  return { ok: true };
}

export async function adminDeleteDetailRow(
  table: UserDetailTable,
  id: string,
  userId: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdminRole('editor');
  const supabase = createServiceClient();
  const { error } = await (supabase as any).from(table).delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  await logAdmin(supabase, 'delete', { table, target_user_id: userId, row_id: id });
  revalidatePath(`/users/${userId}`);
  return { ok: true };
}
