/**
 * AirSpeak — release-broadcast edge function (Faz 4)
 *
 * Yeni app_releases satırı insert edildiğinde DB trigger çağırır.
 * Tüm aktif push tokenlerine "yeni sürüm hazır" bildirimi gönderir.
 *
 * Tek seferlik guard: app_releases.push_sent_at NULL ise gönderir, sonra
 * UPDATE eder. Aynı release için tekrar tetiklenirse skip.
 *
 * Çağrım:
 *   POST /functions/v1/release-broadcast
 *   Header: Authorization: Bearer <service_role_key>
 *   Body: { release_id: uuid, version: "1.0.0" }
 */
import { createClient } from 'jsr:@supabase/supabase-js@2';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

interface PushPayload {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: 'default';
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const url = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  if (!url || !serviceKey) {
    return new Response(
      JSON.stringify({ ok: false, error: 'service_role_not_configured' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  let payload: { release_id?: string; version?: string } = {};
  try {
    payload = await req.json();
  } catch {
    // DB trigger bazen boş body gönderebilir — en son release'i al
  }

  // Release fetch — id varsa direkt, yoksa en son
  let release;
  if (payload.release_id) {
    const { data } = await admin
      .from('app_releases')
      .select('*')
      .eq('id', payload.release_id)
      .single();
    release = data;
  } else {
    const { data } = await admin
      .from('app_releases')
      .select('*')
      .order('released_at', { ascending: false })
      .limit(1)
      .single();
    release = data;
  }

  if (!release) {
    return new Response(
      JSON.stringify({ ok: false, error: 'release_not_found' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // Tek seferlik guard — zaten push gönderildiyse skip
  if (release.push_sent_at) {
    return new Response(
      JSON.stringify({ ok: true, skipped: true, reason: 'already_sent', version: release.version }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // Aktif push token'lar
  const { data: tokens } = await admin
    .from('push_tokens')
    .select('token, user_id');

  if (!tokens || tokens.length === 0) {
    // Yine de push_sent_at güncelle — tekrar trigger gelirse log spam'i olmasın
    await admin.from('app_releases').update({ push_sent_at: new Date().toISOString() }).eq('id', release.id);
    return new Response(
      JSON.stringify({ ok: true, sent: 0, reason: 'no_tokens' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const messages: PushPayload[] = tokens.map((t: { token: string }) => ({
    to: t.token,
    title: '🎉 AirSpeak güncellendi',
    body: 'Yeni özellikler ve düzeltmeler hazır. Aç ve gör!',
    data: { type: 'app_update', version: release.version },
    sound: 'default',
  }));

  // Expo Push API — 100'lük chunk
  let totalSent = 0;
  const errors: string[] = [];
  for (let i = 0; i < messages.length; i += 100) {
    const batch = messages.slice(i, i + 100);
    try {
      const res = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate',
        },
        body: JSON.stringify(batch),
      });
      if (res.ok) {
        totalSent += batch.length;
      } else {
        errors.push(`batch ${i}: ${res.status}`);
      }
    } catch (e) {
      errors.push(`batch ${i}: ${(e as Error).message}`);
    }
  }

  // push_sent_at güncelle (tekrar göndermesin)
  await admin
    .from('app_releases')
    .update({ push_sent_at: new Date().toISOString() })
    .eq('id', release.id);

  return new Response(
    JSON.stringify({
      ok: true,
      version: release.version,
      total_tokens: tokens.length,
      sent: totalSent,
      errors: errors.length > 0 ? errors : undefined,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
});
