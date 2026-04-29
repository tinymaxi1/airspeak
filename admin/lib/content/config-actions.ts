'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAdminRole } from '@/lib/auth/guard';

export type ConfigCategory = 'ads' | 'freemium' | 'paywall' | 'feature_flag' | 'general';

/**
 * App config tek alan güncelleme.
 * Mobile her açılışta çekiyor → 5 dk cache + realtime invalidate.
 */
export async function updateConfig(
  key: string,
  value: any,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdminRole('editor');
  const supabase = await createClient();
  const { error } = await (supabase as any)
    .from('app_config')
    .update({ value, updated_at: new Date().toISOString() })
    .eq('key', key);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/freemium');
  revalidatePath('/ads');
  revalidatePath('/paywall');
  revalidatePath('/settings');
  return { ok: true };
}

/**
 * Bulk update — tek seferde birden fazla key.
 */
export async function bulkUpdateConfig(
  updates: Record<string, any>,
): Promise<{ ok: true; count: number } | { ok: false; error: string }> {
  await requireAdminRole('editor');
  const supabase = await createClient();
  const entries = Object.entries(updates);
  for (const [key, value] of entries) {
    const { error } = await (supabase as any)
      .from('app_config')
      .update({ value, updated_at: new Date().toISOString() })
      .eq('key', key);
    if (error) return { ok: false, error: error.message };
  }
  revalidatePath('/freemium');
  revalidatePath('/ads');
  revalidatePath('/paywall');
  revalidatePath('/settings');
  return { ok: true, count: entries.length };
}
