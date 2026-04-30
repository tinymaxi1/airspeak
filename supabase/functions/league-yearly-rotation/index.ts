/**
 * AirSpeak — Lig Yıllık Rotation Edge Function
 *
 * Sprint 4D
 *
 * Tetikleyiciler:
 *   - pg_cron 1 Ocak 00:00 UTC (otomatik)
 *   - POST /api/admin/leagues/rotate-yearly (admin manuel)
 *
 * Akış:
 *   1. RPC `rotate_yearly_championships()` — atomik DB işi
 *      (rol×tier #1 şampiyon, top 50 ödül, 1 yıl premium gift, year_xp reset)
 *   2. Push notification — şampiyonlara
 */
import { createClient } from 'jsr:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

interface RotationResult {
  ok: boolean;
  year?: number;
  season_id?: string;
  champions?: number;
  rewards?: number;
  premium_gifts?: number;
  error?: string;
}

async function callNotificationTrigger(
  trigger: string,
  body: { user_ids: string[] },
): Promise<void> {
  if (body.user_ids.length === 0) return;
  try {
    await fetch(
      `${SUPABASE_URL}/functions/v1/notification-triggers/${trigger}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${SERVICE_ROLE}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    );
  } catch (err) {
    console.error(`notify ${trigger} failed`, err);
  }
}

Deno.serve(async (req: Request): Promise<Response> => {
  const auth = req.headers.get('authorization') ?? '';
  if (!auth.includes(SERVICE_ROLE) && SERVICE_ROLE.length > 0) {
    return new Response(JSON.stringify({ ok: false, error: 'unauthorized' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

  const { data, error } = await supabase.rpc('rotate_yearly_championships');
  if (error) {
    console.error('yearly rotation rpc failed', error);
    return new Response(
      JSON.stringify({ ok: false, error: error.message }),
      { status: 500, headers: { 'content-type': 'application/json' } },
    );
  }

  const result = data as RotationResult;

  if (result.year) {
    const { data: champs } = await supabase
      .from('championships')
      .select('user_id')
      .eq('championship_type', 'yearly')
      .eq('year', result.year);

    const userIds = (champs ?? []).map((c: any) => c.user_id);
    await callNotificationTrigger('league_promotion', { user_ids: userIds });
  }

  return new Response(JSON.stringify(result), {
    headers: { 'content-type': 'application/json' },
  });
});
