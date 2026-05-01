/**
 * AirSpeak — Competition Tick Edge Function (Sprint 4F).
 *
 * Cron her saat çağırır. tick_competitions RPC sarmalar + biten
 * yarışmaların kazananlarına push notification yollar.
 */
import { createClient } from 'jsr:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

interface TickResult {
  ok: boolean;
  announced_to_active?: number;
  recalc?: { ok: boolean; competitions_recalculated: number };
  resolved?: number;
  error?: string;
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

  // tick öncesi resolved_at IS NULL & end_date < now olanları kaydet (push için)
  const { data: justFinishingComps } = await supabase
    .from('competitions')
    .select('id, name_tr, name')
    .eq('status', 'active')
    .lt('end_date', new Date().toISOString());

  const { data, error } = await supabase.rpc('tick_competitions');
  if (error) {
    console.error('tick rpc failed', error);
    return new Response(
      JSON.stringify({ ok: false, error: error.message }),
      { status: 500, headers: { 'content-type': 'application/json' } },
    );
  }

  const result = data as TickResult;

  // Yeni resolved competitions için top 3'e push
  for (const comp of (justFinishingComps ?? []) as any[]) {
    const { data: winners } = await supabase
      .from('competition_entries')
      .select('user_id')
      .eq('competition_id', comp.id)
      .lte('rank', 3)
      .gt('score', 0);

    const userIds = ((winners ?? []) as any[]).map((w) => w.user_id);
    if (userIds.length > 0) {
      try {
        await fetch(
          `${SUPABASE_URL}/functions/v1/notification-triggers/league_promotion`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${SERVICE_ROLE}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_ids: userIds }),
          },
        );
      } catch (err) {
        console.error('competition winners push failed', err);
      }
    }
  }

  return new Response(JSON.stringify(result), {
    headers: { 'content-type': 'application/json' },
  });
});
