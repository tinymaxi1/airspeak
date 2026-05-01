'use server';

/**
 * Admin AI settings server actions.
 *
 * - updateAiConfig: tek key güncelle (ai.* config)
 * - testClaudeKey: Anthropic API health check
 * - testOpenAiKey: OpenAI API health check
 * - getAiConfig: tüm ai.* satırlarını döner (server-side; secrets dahil)
 */
import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase/server';
import { requireAdminRole } from '@/lib/auth/guard';

export interface AiConfigRow {
  key: string;
  value: any;
  description: string;
  data_type: string;
}

async function logAdmin(
  supabase: ReturnType<typeof createServiceClient>,
  meta: Record<string, unknown>,
) {
  await (supabase as any).rpc('log_admin_action', {
    p_action: 'update',
    p_table_name: 'app_config',
    p_metadata: meta,
  });
}

export async function getAiConfig(): Promise<AiConfigRow[]> {
  await requireAdminRole('editor');
  const supabase = createServiceClient();
  const { data } = await (supabase as any)
    .from('app_config')
    .select('key, value, description, data_type')
    .like('key', 'ai.%')
    .order('key');
  return (data as AiConfigRow[]) ?? [];
}

export async function updateAiConfig(
  key: string,
  value: unknown,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdminRole('editor');
  const supabase = createServiceClient();
  if (!key.startsWith('ai.')) return { ok: false, error: 'invalid_key_prefix' };

  const { error } = await (supabase as any)
    .from('app_config')
    .update({ value })
    .eq('key', key);
  if (error) return { ok: false, error: error.message };
  await logAdmin(supabase, {
    table: 'app_config',
    key,
    action_subtype: 'ai_config_update',
    // Secret leak yapmamak için key'i log'a yazıyoruz, value'yu maskeliyoruz
    masked_value: key.includes('api_key') ? '***' : value,
  });
  revalidatePath('/ai');
  return { ok: true };
}

// ─── Provider key health checks ──────────────────────────────────────────

export async function testClaudeKey(): Promise<{
  ok: boolean;
  status?: number;
  error?: string;
  model?: string;
}> {
  await requireAdminRole('editor');
  const supabase = createServiceClient();
  const { data: rows } = await (supabase as any)
    .from('app_config')
    .select('key, value')
    .in('key', ['ai.anthropic_api_key', 'ai.examiner_model']);
  const map = new Map<string, any>();
  for (const r of (rows ?? []) as any[]) map.set(r.key, r.value);
  const apiKey = String(map.get('ai.anthropic_api_key') ?? '').replace(/^"|"$/g, '');
  const model = String(map.get('ai.examiner_model') ?? 'claude-sonnet-4-5').replace(/^"|"$/g, '');
  if (!apiKey || apiKey.length < 10) {
    return { ok: false, error: 'API key boş ya da geçersiz' };
  }
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model,
        max_tokens: 8,
        messages: [{ role: 'user', content: 'ping' }],
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return { ok: false, status: res.status, error: text.slice(0, 200), model };
    }
    return { ok: true, status: res.status, model };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function testOpenAiKey(): Promise<{
  ok: boolean;
  status?: number;
  error?: string;
}> {
  await requireAdminRole('editor');
  const supabase = createServiceClient();
  const { data: rows } = await (supabase as any)
    .from('app_config')
    .select('key, value')
    .eq('key', 'ai.openai_api_key');
  const apiKey = String((rows?.[0] as any)?.value ?? '').replace(/^"|"$/g, '');
  if (!apiKey || apiKey.length < 10) {
    return { ok: false, error: 'API key boş ya da geçersiz' };
  }
  try {
    // Models list endpoint (lightweight)
    const res = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return { ok: false, status: res.status, error: text.slice(0, 200) };
    }
    return { ok: true, status: res.status };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

// ─── Cost dashboard data ─────────────────────────────────────────────────
export interface DailyCostRow {
  day: string;
  attempts: number;
  mock_attempts: number;
  claude_attempts: number;
  gpt_attempts: number;
  total_tokens_in: number;
  total_tokens_out: number;
  total_cost_usd: number;
}

export async function getAiDailyCost(days = 14): Promise<DailyCostRow[]> {
  await requireAdminRole('editor');
  const supabase = createServiceClient();
  const { data } = await (supabase as any)
    .from('ai_daily_cost')
    .select('*')
    .order('day', { ascending: false })
    .limit(days);
  return (data as DailyCostRow[]) ?? [];
}
