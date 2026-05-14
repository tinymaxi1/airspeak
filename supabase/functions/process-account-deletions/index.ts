/**
 * AirSpeak — Hesap silme grace period processor
 * Sprint 4.A
 *
 * pg_cron günde 1 kez tetikler. deletion_requested_at >= 30 gün önce
 * olan profilleri auth admin API ile hard delete eder. profiles cascade.
 *
 * Çağrım:
 *   POST /functions/v1/process-account-deletions
 *   Header: Authorization: Bearer <service_role_key>
 *
 * Body: yok. Tüm matching kullanıcıları otomatik bulur.
 *
 * Mock-first: SUPABASE_SERVICE_ROLE_KEY yoksa graceful no-op.
 */
import { createClient } from 'jsr:@supabase/supabase-js@2';

interface DeletionResult {
  user_id: string;
  ok: boolean;
  error?: string;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const url = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

  if (!url || !serviceKey) {
    return new Response(
      JSON.stringify({ ok: false, error: 'service_role_not_configured', processed: 0 }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 30+ gün önce silme isteği yapılmış profilleri al
  const { data: profiles, error } = await admin
    .from('profiles')
    .select('id, deletion_requested_at')
    .lt('deletion_requested_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .limit(100);

  if (error) {
    return new Response(
      JSON.stringify({ ok: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const results: DeletionResult[] = [];

  for (const p of profiles ?? []) {
    const { error: delErr } = await admin.auth.admin.deleteUser(p.id);
    if (delErr) {
      results.push({ user_id: p.id, ok: false, error: delErr.message });
    } else {
      results.push({ user_id: p.id, ok: true });
      // admin_actions audit log (service_role bypasses RLS)
      await admin.from('admin_actions').insert({
        actor_id: null,
        action: 'account_hard_deleted',
        table_name: 'profiles',
        target_user_id: p.id,
        metadata: { deletion_requested_at: p.deletion_requested_at },
      });
      // Faz 2.F — deleted_accounts_log anonymized hash audit (KVKK compliance)
      try {
        await admin.rpc('record_hard_deletion', {
          p_user_id: p.id,
          p_deletion_requested_at: p.deletion_requested_at,
          p_reason: null,
        });
      } catch {
        // best-effort, admin_actions yine de var
      }
    }
  }

  return new Response(
    JSON.stringify({
      ok: true,
      processed: results.length,
      successful: results.filter((r) => r.ok).length,
      failed: results.filter((r) => !r.ok).length,
      results,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
});
