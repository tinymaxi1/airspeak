'use server';

/**
 * Admin IAP / RevenueCat config server actions — Sprint 13.A.7
 *
 * - getIapConfig: tüm revenuecat.* + iap.* satırlarını döner
 * - updateIapConfig: tek key güncelle
 */
import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase/server';
import { requireAdminRole } from '@/lib/auth/guard';

export interface IapConfigRow {
  key: string;
  value: any;
  description: string | null;
  data_type: string;
}

export async function getIapConfig(): Promise<IapConfigRow[]> {
  await requireAdminRole('editor');
  const supabase = createServiceClient();
  const { data } = await (supabase as any)
    .from('app_config')
    .select('key, value, description, data_type')
    .or('key.like.revenuecat.%,key.like.iap.%')
    .order('key');
  return (data as IapConfigRow[]) ?? [];
}

export async function updateIapConfig(
  key: string,
  value: unknown,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdminRole('editor');
  if (!key.startsWith('revenuecat.') && !key.startsWith('iap.')) {
    return { ok: false, error: 'invalid_key_prefix' };
  }
  const supabase = createServiceClient();
  const { error } = await (supabase as any)
    .from('app_config')
    .update({ value })
    .eq('key', key);
  if (error) return { ok: false, error: error.message };

  await (supabase as any).rpc('log_admin_action', {
    p_action: 'update',
    p_table_name: 'app_config',
    p_metadata: { key, action_subtype: 'iap_config_update' },
  });

  revalidatePath('/revenue');
  return { ok: true };
}
