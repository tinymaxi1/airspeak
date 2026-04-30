/**
 * Admin manuel yıllık lig rotation tetikleyici.
 *
 * POST /api/admin/leagues/rotate-yearly
 * Yetki: super_admin
 */
import { NextResponse } from 'next/server';
import { requireAdminRole } from '@/lib/auth/guard';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(): Promise<NextResponse> {
  await requireAdminRole('super_admin');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRole) {
    return NextResponse.json(
      { ok: false, error: 'env vars missing' },
      { status: 500 },
    );
  }

  const url = `${supabaseUrl}/functions/v1/league-yearly-rotation`;

  let edgeResult: unknown;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${serviceRole}`,
        'Content-Type': 'application/json',
      },
      body: '{}',
    });
    edgeResult = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: 'edge_failed', detail: edgeResult },
        { status: 502 },
      );
    }
  } catch (err: any) {
    const supabase = createServiceClient();
    const { data, error } = await (supabase as any).rpc('rotate_yearly_championships');
    if (error) {
      return NextResponse.json(
        {
          ok: false,
          error: 'fallback_rpc_failed',
          edge_error: err?.message ?? String(err),
          rpc_error: error.message,
        },
        { status: 500 },
      );
    }
    edgeResult = { ...data, fallback: 'sql_rpc' };
  }

  const supabase = createServiceClient();
  await (supabase as any).rpc('log_admin_action', {
    p_action: 'bulk_update',
    p_table_name: 'championships',
    p_metadata: {
      source: 'admin_manual_rotate_yearly',
      result: edgeResult,
    },
  });

  return NextResponse.json({ ok: true, result: edgeResult });
}
