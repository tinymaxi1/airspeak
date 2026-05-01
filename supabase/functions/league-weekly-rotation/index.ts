/**
 * AirSpeak — Lig Haftalık Rotation Edge Function
 *
 * Sprint 4B.1
 *
 * Tetikleyiciler:
 *   - pg_cron Pazartesi 00:00 UTC (otomatik)
 *   - POST /api/admin/leagues/rotate (admin manuel)
 *
 * Akış:
 *   1. RPC `rotate_active_weekly_league()` — atomik DB işi
 *      (rank, top 3 ödül, promotion/demotion, new season, redistribute,
 *       week_xp reset)
 *   2. Push notification — promotion/demotion/champion notify
 *      (notification-triggers function'ına HTTP)
 *
 * Auth: Authorization: Bearer <SERVICE_ROLE>
 */
import { createClient } from 'jsr:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

interface RotationResult {
  ok: boolean;
  first_run?: boolean;
  old_season_id?: string;
  new_season_id?: string;
  promoted?: number;
  demoted?: number;
  redistributed?: number;
  error?: string;
}

interface NotifyTarget {
  user_ids: string[];
}

async function callNotificationTrigger(
  trigger: string,
  body: NotifyTarget,
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
  // Auth check — service role gerekli
  const auth = req.headers.get('authorization') ?? '';
  if (!auth.includes(SERVICE_ROLE) && SERVICE_ROLE.length > 0) {
    return new Response(JSON.stringify({ ok: false, error: 'unauthorized' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

  // 1. Atomik rotation
  const { data, error } = await supabase.rpc('rotate_active_weekly_league');

  if (error) {
    console.error('rotation rpc failed', error);
    return new Response(
      JSON.stringify({ ok: false, error: error.message }),
      { status: 500, headers: { 'content-type': 'application/json' } },
    );
  }

  const result = data as RotationResult;

  // İlk run (henüz season yoktu) — push gerek yok
  if (result.first_run) {
    return new Response(JSON.stringify(result), {
      headers: { 'content-type': 'application/json' },
    });
  }

  // 2. Push notify — eski season'daki promoted/demoted user'ları çek
  if (result.old_season_id) {
    const { data: oldGroups } = await supabase
      .from('league_groups')
      .select('id')
      .eq('season_id', result.old_season_id);

    const oldGroupIds = (oldGroups ?? []).map((g: any) => g.id);

    const { data: oldMembers } = oldGroupIds.length
      ? await supabase
          .from('league_memberships')
          .select('user_id, promotion_status, rank')
          .in('group_id', oldGroupIds)
      : { data: [] as any[] };

    const promoted: string[] = [];
    const demoted: string[] = [];

    for (const m of (oldMembers ?? []) as any[]) {
      if (m.promotion_status === 'promoted') promoted.push(m.user_id);
      if (m.promotion_status === 'demoted') demoted.push(m.user_id);
    }

    await Promise.all([
      callNotificationTrigger('league_promotion', { user_ids: promoted }),
      callNotificationTrigger('league_demotion_warning', { user_ids: demoted }),
    ]);
  }

  return new Response(JSON.stringify(result), {
    headers: { 'content-type': 'application/json' },
  });
});
