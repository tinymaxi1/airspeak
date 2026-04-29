/**
 * AirSpeak — 11 Bildirim Trigger Edge Function
 *
 * Sprint 7 / Hafta 13-14
 *
 * pg_cron Pazartesi 00:00 + günde birkaç kez tetikler. Tüm push'lar
 * Expo Push Service üzerinden push_tokens tablosundaki cihazlara gönderilir.
 *
 * 11 trigger:
 *   1. streak_danger_evening (her gün 21:00, bugün ders yok ise)
 *   2. streak_milestone (3/7/14/30 günde, kullanıcı dersini bitirir bitirmez DB trigger)
 *   3. heart_full_refill (5/5 dolduğunda)
 *   4. ai_scenario_weekly (hafta içi pazartesi öğlen, yeni senaryo öner)
 *   5. icao_mock_feedback (sınav sonrası 1 saat içinde, AI özeti hazır)
 *   6. league_promotion (lig terfisi gerçekleştiğinde)
 *   7. league_demotion_warning (haftanın son günü, son 3 sırada ise)
 *   8. squadron_friend_lapped (arkadaş senden 1000+ XP öne geçti)
 *   9. new_unit_unlocked (rol için yeni içerik açıldığında)
 *  10. exam_day_t7 / t1 (kullanıcının kayıtlı sınavı 7/1 gün öncesi)
 *  11. inactivity_recovery (3 gün hareketsiz)
 *
 * Çağrım:
 *   POST /functions/v1/notification-triggers/{trigger_id}
 *   Body: { user_ids?: string[] }   ← cron için tüm matching kullanıcıları otomatik bul
 */
import { createClient, type SupabaseClient } from 'jsr:@supabase/supabase-js@2';

interface PushPayload {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: 'default';
  badge?: number;
  channelId?: string;
}

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

async function sendExpoPush(messages: PushPayload[]): Promise<void> {
  if (messages.length === 0) return;

  // Expo limit: 100 message per request
  for (let i = 0; i < messages.length; i += 100) {
    const batch = messages.slice(i, i + 100);
    const response = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
      },
      body: JSON.stringify(batch),
    });
    if (!response.ok) {
      console.error('[expo-push] failed', response.status, await response.text());
    }
  }
}

async function getTokensForUsers(client: SupabaseClient, userIds: string[]): Promise<{ token: string; user_id: string }[]> {
  if (userIds.length === 0) return [];
  const { data, error } = await client
    .from('push_tokens')
    .select('token, user_id')
    .in('user_id', userIds);
  if (error) {
    console.error('[get-tokens]', error.message);
    return [];
  }
  return data ?? [];
}

// ═══════════════════════════════════════════════════════════════════
//  11 TRIGGER
// ═══════════════════════════════════════════════════════════════════

/** 1. STREAK DANGER — her akşam 21:00 cron */
async function streakDangerEvening(client: SupabaseClient): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);
  // Bugün xp_log kaydı olmayan, streak >= 1 olan kullanıcıları bul
  const { data: candidates } = await client
    .from('streaks')
    .select('user_id, current_streak')
    .gte('current_streak', 1);

  if (!candidates || candidates.length === 0) return 0;

  const userIds: string[] = [];
  for (const c of candidates) {
    const { count } = await client
      .from('xp_logs')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', c.user_id)
      .gte('created_at', `${today}T00:00:00Z`);
    if (!count || count === 0) userIds.push(c.user_id as string);
  }

  const tokens = await getTokensForUsers(client, userIds);
  const messages = tokens.map((t) => ({
    to: t.token,
    title: '🔥 Streak\'in tehlikede',
    body: 'Bugün hâlâ pratik yapmadın. 1 ders streak\'i kurtarır.',
    data: { kind: 'streak_danger' },
    sound: 'default' as const,
  }));
  await sendExpoPush(messages);
  return messages.length;
}

/** 2. STREAK MILESTONE — 3/7/14/30 günde DB trigger çağırır */
async function streakMilestone(client: SupabaseClient, userIds: string[]): Promise<number> {
  const tokens = await getTokensForUsers(client, userIds);
  const messages = tokens.map((t) => ({
    to: t.token,
    title: '🎉 Streak ödülü',
    body: 'Tebrikler — yeni streak rozeti kazandın. Profilinde gör.',
    data: { kind: 'streak_milestone' },
    sound: 'default' as const,
  }));
  await sendExpoPush(messages);
  return messages.length;
}

/** 3. HEART FULL REFILL — 5/5 dolduğunda */
async function heartFullRefill(client: SupabaseClient, userIds: string[]): Promise<number> {
  const tokens = await getTokensForUsers(client, userIds);
  const messages = tokens.map((t) => ({
    to: t.token,
    title: '❤ 5/5 hearts',
    body: 'Tüm canların yenilendi. Yeni dersler için hazırsın.',
    data: { kind: 'heart_full' },
    sound: 'default' as const,
  }));
  await sendExpoPush(messages);
  return messages.length;
}

/** 4. AI SCENARIO WEEKLY — Pazartesi öğlen */
async function aiScenarioWeekly(client: SupabaseClient): Promise<number> {
  // Premium veya 7 günden eski hesap olan tüm kullanıcılar
  const { data } = await client
    .from('profiles')
    .select('id')
    .lte('created_at', new Date(Date.now() - 7 * 86400e3).toISOString());

  const userIds = (data ?? []).map((r) => r.id as string);
  const tokens = await getTokensForUsers(client, userIds);
  const messages = tokens.map((t) => ({
    to: t.token,
    title: '🤖 Yeni AI senaryo',
    body: 'Bu hafta için hazırlanan rol-play senaryosu seni bekliyor.',
    data: { kind: 'ai_scenario_weekly' },
    sound: 'default' as const,
  }));
  await sendExpoPush(messages);
  return messages.length;
}

/** 5. ICAO MOCK FEEDBACK — sınav bitince DB trigger'dan */
async function icaoMockFeedback(client: SupabaseClient, userIds: string[]): Promise<number> {
  const tokens = await getTokensForUsers(client, userIds);
  const messages = tokens.map((t) => ({
    to: t.token,
    title: '🎧 ICAO sınav geri bildirimi',
    body: 'AI değerlendirme hazır — band score + zayıflık özeti.',
    data: { kind: 'icao_mock_feedback' },
    sound: 'default' as const,
  }));
  await sendExpoPush(messages);
  return messages.length;
}

/** 6. LEAGUE PROMOTION */
async function leaguePromotion(client: SupabaseClient, userIds: string[]): Promise<number> {
  const tokens = await getTokensForUsers(client, userIds);
  const messages = tokens.map((t) => ({
    to: t.token,
    title: '🏆 Lig terfisi',
    body: 'Bir üst lige çıktın! Yeni rakipler seni bekliyor.',
    data: { kind: 'league_promotion' },
    sound: 'default' as const,
  }));
  await sendExpoPush(messages);
  return messages.length;
}

/** 7. LEAGUE DEMOTION WARNING — haftanın son günü, son 3 sırada */
async function leagueDemotionWarning(client: SupabaseClient): Promise<number> {
  // Lig haftası sonunda son 3 sırada olanları bul (cron Pazar 18:00 UTC)
  const { data } = await client
    .from('user_league_membership')
    .select('user_id, rank')
    .eq('current', true)
    .gte('rank', 28); // top 30 lig, son 3 = rank 28-30

  const userIds = (data ?? []).map((r) => r.user_id as string);
  const tokens = await getTokensForUsers(client, userIds);
  const messages = tokens.map((t) => ({
    to: t.token,
    title: '⚠ Lig düşme tehlikesi',
    body: 'Son 3 sıradasın. 200 XP kazanırsan kurtulursun.',
    data: { kind: 'league_demotion' },
    sound: 'default' as const,
  }));
  await sendExpoPush(messages);
  return messages.length;
}

/** 8. SQUADRON FRIEND LAPPED — DB trigger gradient compare */
async function squadronFriendLapped(client: SupabaseClient, userIds: string[]): Promise<number> {
  const tokens = await getTokensForUsers(client, userIds);
  const messages = tokens.map((t) => ({
    to: t.token,
    title: '👥 Squadron yarışı',
    body: 'Bir arkadaşın 1000+ XP öne geçti. Yetiş!',
    data: { kind: 'squadron_lapped' },
    sound: 'default' as const,
  }));
  await sendExpoPush(messages);
  return messages.length;
}

/** 9. NEW UNIT UNLOCKED — content release sonrası */
async function newUnitUnlocked(client: SupabaseClient, userIds: string[]): Promise<number> {
  const tokens = await getTokensForUsers(client, userIds);
  const messages = tokens.map((t) => ({
    to: t.token,
    title: '✦ Yeni unit açıldı',
    body: 'Rolüne özel yeni dersler eklendi. Keşfet.',
    data: { kind: 'new_unit' },
    sound: 'default' as const,
  }));
  await sendExpoPush(messages);
  return messages.length;
}

/** 10. EXAM DAY T-7 / T-1 — günlük cron, exam_schedules ile match */
async function examDayCountdown(client: SupabaseClient): Promise<number> {
  const today = new Date();
  const t7 = new Date(today.getTime() + 7 * 86400e3).toISOString().slice(0, 10);
  const t1 = new Date(today.getTime() + 1 * 86400e3).toISOString().slice(0, 10);

  const { data: schedules } = await client
    .from('user_exam_schedules')
    .select('user_id, exam_id, scheduled_for')
    .in('scheduled_for', [t7, t1]);

  if (!schedules || schedules.length === 0) return 0;

  const messages: PushPayload[] = [];
  for (const s of schedules) {
    const { data: tokens } = await client
      .from('push_tokens')
      .select('token')
      .eq('user_id', s.user_id);
    const isT1 = s.scheduled_for === t1;
    const title = isT1 ? '🎯 Sınav yarın' : '📅 Sınav 7 gün sonra';
    const body = isT1
      ? 'Yarın için son hazırlık. T-1 modunda en kritik konuları gözden geçir.'
      : '7 gün kaldı. T-7 hazırlık planın hazır, başla.';
    for (const t of tokens ?? []) {
      messages.push({
        to: t.token as string,
        title,
        body,
        data: { kind: 'exam_countdown', examId: s.exam_id, days: isT1 ? 1 : 7 },
        sound: 'default',
      });
    }
  }

  await sendExpoPush(messages);
  return messages.length;
}

/** 11. INACTIVITY RECOVERY — 3 gün hareketsiz cron */
async function inactivityRecovery(client: SupabaseClient): Promise<number> {
  const threeDaysAgo = new Date(Date.now() - 3 * 86400e3).toISOString();
  const { data } = await client
    .from('profiles')
    .select('id, updated_at')
    .lte('updated_at', threeDaysAgo);

  const userIds = (data ?? []).map((r) => r.id as string);
  const tokens = await getTokensForUsers(client, userIds);
  const messages = tokens.map((t) => ({
    to: t.token,
    title: '✈ AirSpeak seni özledi',
    body: '3 gün ara verdin. 5 dakikalık hızlı bir uçuş seni geri getirsin.',
    data: { kind: 'inactivity_recovery' },
    sound: 'default' as const,
  }));
  await sendExpoPush(messages);
  return messages.length;
}

// ═══════════════════════════════════════════════════════════════════
//  ROUTER
// ═══════════════════════════════════════════════════════════════════

const TRIGGERS: Record<string, (client: SupabaseClient, userIds?: string[]) => Promise<number>> = {
  streak_danger_evening: (c) => streakDangerEvening(c),
  streak_milestone: (c, u) => streakMilestone(c, u ?? []),
  heart_full_refill: (c, u) => heartFullRefill(c, u ?? []),
  ai_scenario_weekly: (c) => aiScenarioWeekly(c),
  icao_mock_feedback: (c, u) => icaoMockFeedback(c, u ?? []),
  league_promotion: (c, u) => leaguePromotion(c, u ?? []),
  league_demotion_warning: (c) => leagueDemotionWarning(c),
  squadron_friend_lapped: (c, u) => squadronFriendLapped(c, u ?? []),
  new_unit_unlocked: (c, u) => newUnitUnlocked(c, u ?? []),
  exam_day_countdown: (c) => examDayCountdown(c),
  inactivity_recovery: (c) => inactivityRecovery(c),
};

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const triggerId = url.pathname.split('/').pop() ?? '';
  const handler = TRIGGERS[triggerId];

  if (!handler) {
    return new Response(
      JSON.stringify({ error: 'unknown_trigger', available: Object.keys(TRIGGERS) }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // Service role client (RLS bypass — admin işlem)
  const client = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  let userIds: string[] | undefined;
  if (req.method === 'POST') {
    try {
      const body = await req.json();
      userIds = body.user_ids;
    } catch {
      /* boş body OK */
    }
  }

  try {
    const sent = await handler(client, userIds);
    return new Response(
      JSON.stringify({ ok: true, trigger: triggerId, sent }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (e) {
    console.error('[trigger]', triggerId, e);
    return new Response(
      JSON.stringify({ ok: false, error: String(e) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
