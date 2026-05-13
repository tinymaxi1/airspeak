/**
 * Word of the Day — Server actions (admin CRUD).
 * Sprint 14.D — Faz B.
 */
'use server';

import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase/server';
import { requireAdminRole } from '@/lib/auth/guard';

export type WotdContentType = 'word' | 'phrase' | 'sentence' | 'dialogue' | 'tip';
export type WotdWordType = 'noun' | 'verb' | 'adj' | 'adv' | 'phrase' | 'abbr' | 'dialogue' | 'tip';
export type WotdDifficulty = 'basic' | 'intermediate' | 'advanced';
export type WotdRole = 'pilot' | 'atc' | 'cabin' | 'technician' | 'ground' | 'student';

export interface WordOfDayPayload {
  content_type: WotdContentType;
  word_or_phrase: string;
  ipa?: string | null;
  word_type?: WotdWordType | null;
  target_roles: WotdRole[];
  /**
   * Opsiyonel granular sub-role filter. Boş array = parent role içeren TÜM
   * alt-rollere açık (target_roles üzerinden filter). Dolu ise sadece bu
   * sub_role.id değerine sahip user'lar görür.
   * Migration 20260513000003 ile eklendi.
   */
  target_sub_roles?: string[];
  definition_en: string;
  definition_tr: string;
  example_en: string;
  example_tr: string;
  category: string;
  difficulty: WotdDifficulty;
  etymology?: string | null;
  related_words?: string[] | null;
  source?: string | null;
  word_audio_url?: string | null;
  example_audio_url?: string | null;
  scheduled_date?: string | null;
  is_active?: boolean;
}

export async function createWordOfDay(payload: WordOfDayPayload) {
  const profile = await requireAdminRole('editor');
  const supabase = createServiceClient();

  if (payload.target_roles.length === 0) {
    return { error: 'En az 1 hedef rol seç' };
  }
  if (!payload.word_or_phrase.trim()) {
    return { error: 'Kelime/ifade boş olamaz' };
  }

  const { data, error } = await (supabase as any)
    .from('word_of_the_day')
    .insert({
      ...payload,
      created_by: profile.id,
      updated_by: profile.id,
    })
    .select('id')
    .single();

  if (error) return { error: error.message };

  await (supabase as any).from('admin_audit_log').insert({
    actor_id: profile.id,
    action: 'word_of_day_create',
    target_table: 'word_of_the_day',
    target_id: data.id,
    payload: { word: payload.word_or_phrase, roles: payload.target_roles },
  });

  revalidatePath('/word-of-day');
  return { ok: true, id: data.id };
}

export async function updateWordOfDay(id: string, payload: WordOfDayPayload) {
  const profile = await requireAdminRole('editor');
  const supabase = createServiceClient();

  if (payload.target_roles.length === 0) {
    return { error: 'En az 1 hedef rol seç' };
  }

  const { error } = await (supabase as any)
    .from('word_of_the_day')
    .update({ ...payload, updated_by: profile.id })
    .eq('id', id);

  if (error) return { error: error.message };

  await (supabase as any).from('admin_audit_log').insert({
    actor_id: profile.id,
    action: 'word_of_day_update',
    target_table: 'word_of_the_day',
    target_id: id,
    payload: { word: payload.word_or_phrase },
  });

  revalidatePath('/word-of-day');
  return { ok: true };
}

export async function deleteWordOfDay(id: string) {
  const profile = await requireAdminRole('super_admin');
  const supabase = createServiceClient();

  const { error } = await (supabase as any)
    .from('word_of_the_day')
    .delete()
    .eq('id', id);

  if (error) return { error: error.message };

  await (supabase as any).from('admin_audit_log').insert({
    actor_id: profile.id,
    action: 'word_of_day_delete',
    target_table: 'word_of_the_day',
    target_id: id,
  });

  revalidatePath('/word-of-day');
  return { ok: true };
}

export async function toggleWordOfDayActive(id: string, is_active: boolean) {
  const profile = await requireAdminRole('editor');
  const supabase = createServiceClient();

  const { error } = await (supabase as any)
    .from('word_of_the_day')
    .update({ is_active, updated_by: profile.id })
    .eq('id', id);

  if (error) return { error: error.message };
  revalidatePath('/word-of-day');
  return { ok: true };
}
