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

/** 12. TRIAL ENDING T-1 — trial_ends_at 24 saat içinde, hâlâ trialing */
async function trialEndingT1(client: SupabaseClient): Promise<number> {
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 3600e3);
  const { data } = await client
    .from('profiles')
    .select('id, trial_ends_at')
    .eq('subscription_status', 'trialing')
    .gte('trial_ends_at', now.toISOString())
    .lte('trial_ends_at', in24h.toISOString());

  const userIds = (data ?? []).map((r) => r.id as string);
  const tokens = await getTokensForUsers(client, userIds);
  const messages = tokens.map((t) => ({
    to: t.token,
    title: '⏱ Deneme bitiyor — 24 saat kaldı',
    body: 'Pro\'ya geçerek tüm ICAO 4 setlerini ve sınırsız AI\'ı koru.',
    data: { kind: 'trial_ending_t1' },
    sound: 'default' as const,
  }));
  await sendExpoPush(messages);
  return messages.length;
}

/** 13. TRIAL ENDING T-0 — trial_ends_at bugün biten, hâlâ trialing */
async function trialEndingT0(client: SupabaseClient): Promise<number> {
  const now = new Date();
  const in1h = new Date(now.getTime() + 1 * 3600e3);
  const startOfDay = new Date(now);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const { data } = await client
    .from('profiles')
    .select('id, trial_ends_at')
    .eq('subscription_status', 'trialing')
    .gte('trial_ends_at', now.toISOString())
    .lte('trial_ends_at', endOfDay.toISOString());

  const userIds = (data ?? []).map((r) => r.id as string);
  const tokens = await getTokensForUsers(client, userIds);
  const messages = tokens.map((t) => ({
    to: t.token,
    title: '🚨 Son şans — Deneme bugün bitiyor',
    body: 'Pro yıllığa geç, %50 yıllık tasarruf.',
    data: { kind: 'trial_ending_t0' },
    sound: 'default' as const,
  }));
  await sendExpoPush(messages);
  // unused variable noise prevent
  void in1h;
  return messages.length;
}

/** 15. SPECIAL OFFER — admin manuel broadcast, body: { offer_id, offer_code } */
async function specialOffer(
  client: SupabaseClient,
  body: { offer_id?: string; offer_code?: string } | undefined,
): Promise<number> {
  const offerId = body?.offer_id;
  const offerCode = body?.offer_code;
  if (!offerId && !offerCode) {
    console.error('[special_offer] missing offer_id or offer_code');
    return 0;
  }

  // Offer detayı
  const offerQuery = client
    .from('limited_offers')
    .select('id, code, title_tr, body_tr, audience, push_title_tr, push_body_tr, is_active, starts_at, ends_at')
    .limit(1);
  const { data: offerRow } = offerId
    ? await offerQuery.eq('id', offerId).maybeSingle()
    : await offerQuery.eq('code', offerCode!).maybeSingle();

  if (!offerRow) {
    console.error('[special_offer] offer not found');
    return 0;
  }
  const offer = offerRow as any;

  if (!offer.is_active) {
    console.error('[special_offer] offer not active');
    return 0;
  }

  const now = new Date();
  if (new Date(offer.starts_at) > now || new Date(offer.ends_at) < now) {
    console.error('[special_offer] offer outside window');
    return 0;
  }

  // Audience filter
  const audience: string = offer.audience ?? 'all';
  let userIds: string[] = [];

  if (audience === 'all') {
    const { data } = await client.from('profiles').select('id').limit(50000);
    userIds = (data ?? []).map((r: any) => r.id);
  } else if (audience === 'free') {
    const { data } = await client
      .from('profiles')
      .select('id, premium_until, trial_used')
      .or(`premium_until.is.null,premium_until.lt.${now.toISOString()}`)
      .eq('trial_used', false);
    userIds = (data ?? []).map((r: any) => r.id);
  } else if (audience === 'trial_used') {
    const { data } = await client
      .from('profiles')
      .select('id, premium_until, trial_used')
      .eq('trial_used', true)
      .or(`premium_until.is.null,premium_until.lt.${now.toISOString()}`);
    userIds = (data ?? []).map((r: any) => r.id);
  } else if (audience === 'expired_trial') {
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400e3).toISOString();
    const { data } = await client
      .from('profiles')
      .select('id, subscription_status, premium_until')
      .eq('subscription_status', 'expired')
      .lt('premium_until', sevenDaysAgo);
    userIds = (data ?? []).map((r: any) => r.id);
  } else if (audience === 'active_premium') {
    const { data } = await client
      .from('profiles')
      .select('id, premium_until')
      .gt('premium_until', now.toISOString());
    userIds = (data ?? []).map((r: any) => r.id);
  } else if (audience === 'inactive_7d') {
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400e3).toISOString();
    const { data } = await client
      .from('profiles')
      .select('id, last_active_at')
      .lt('last_active_at', sevenDaysAgo);
    userIds = (data ?? []).map((r: any) => r.id);
  }

  if (userIds.length === 0) return 0;

  const tokens = await getTokensForUsers(client, userIds);
  const messages = tokens.map((t) => ({
    to: t.token,
    title: offer.push_title_tr ?? offer.title_tr ?? '🎁 Sana özel teklif',
    body: offer.push_body_tr ?? offer.body_tr ?? 'Sınırlı süreli — kaçırma!',
    data: { kind: 'special_offer', offer_id: offer.id, offer_code: offer.code },
    sound: 'default' as const,
  }));
  await sendExpoPush(messages);
  return messages.length;
}

/** 18. COMMENT REPLY — DB trigger çağırır, body { recipient_id, actor_id, comment_id, post_id, parent_id } */
async function commentReply(
  client: SupabaseClient,
  body:
    | {
        recipient_id?: string;
        actor_id?: string;
        comment_id?: string;
        post_id?: string;
        parent_id?: string;
      }
    | undefined,
): Promise<number> {
  const recipient = body?.recipient_id;
  if (!recipient) return 0;

  // Actor profil + comment snippet
  const [{ data: actor }, { data: comment }] = await Promise.all([
    client.from('profiles').select('username, full_name').eq('id', body?.actor_id ?? '').maybeSingle(),
    client.from('community_comments').select('content').eq('id', body?.comment_id ?? '').maybeSingle(),
  ]);
  const actorName =
    (actor as any)?.full_name ?? (actor as any)?.username ?? 'Birisi';
  const snippet = ((comment as any)?.content ?? '').slice(0, 100);
  const isReplyOfComment = !!body?.parent_id;

  const tokens = await getTokensForUsers(client, [recipient]);
  if (tokens.length === 0) return 0;

  const messages = tokens.map((t) => ({
    to: t.token,
    title: isReplyOfComment
      ? `${actorName} yorumunu yanıtladı`
      : `${actorName} postunu yorumladı`,
    body: snippet,
    data: {
      kind: 'comment_reply',
      post_id: body?.post_id,
      comment_id: body?.comment_id,
      parent_id: body?.parent_id,
    },
    sound: 'default' as const,
  }));
  await sendExpoPush(messages);
  return messages.length;
}

/** 19. POST REACTION — DB trigger çağırır (kill switch açıksa), body { recipient_id, actor_id, post_id, kind } */
async function postReaction(
  client: SupabaseClient,
  body:
    | { recipient_id?: string; actor_id?: string; post_id?: string; kind?: string }
    | undefined,
): Promise<number> {
  const recipient = body?.recipient_id;
  if (!recipient) return 0;

  const { data: actor } = await client
    .from('profiles')
    .select('username, full_name')
    .eq('id', body?.actor_id ?? '')
    .maybeSingle();
  const actorName =
    (actor as any)?.full_name ?? (actor as any)?.username ?? 'Birisi';

  const KIND_EMOJI: Record<string, string> = {
    like: '👍',
    love: '❤️',
    goal: '🎯',
    thinking: '🤔',
  };
  const emoji = KIND_EMOJI[body?.kind ?? ''] ?? '✨';

  const tokens = await getTokensForUsers(client, [recipient]);
  if (tokens.length === 0) return 0;

  const messages = tokens.map((t) => ({
    to: t.token,
    title: `${actorName} ${emoji} reaction verdi`,
    body: 'Postuna tepki geldi.',
    data: {
      kind: 'post_reaction',
      post_id: body?.post_id,
      reaction_kind: body?.kind,
    },
    sound: 'default' as const,
  }));
  await sendExpoPush(messages);
  return messages.length;
}

/** 17. MOD WARNING — DB trigger çağırır, body { kind, target_id, user_id } */
async function modWarning(
  client: SupabaseClient,
  body: { kind?: 'post' | 'comment'; target_id?: string; user_id?: string } | undefined,
): Promise<number> {
  const userId = body?.user_id;
  const kind = body?.kind;
  if (!userId || !kind) {
    console.error('[mod_warning] missing user_id or kind');
    return 0;
  }
  const tokens = await getTokensForUsers(client, [userId]);
  if (tokens.length === 0) return 0;
  const messages = tokens.map((t) => ({
    to: t.token,
    title: '⚠️ Moderasyon uyarısı',
    body:
      kind === 'post'
        ? 'Postun topluluk kurallarını ihlal ettiği için gizlendi. Yeniden değerlendirme için itiraz edebilirsin.'
        : 'Yorumun topluluk kurallarını ihlal ettiği için gizlendi.',
    data: { kind: 'mod_warning', target_kind: kind, target_id: body?.target_id },
    sound: 'default' as const,
  }));
  await sendExpoPush(messages);
  return messages.length;
}

/** 16. POST MENTION — DB trigger çağırır, body { mention_id } */
async function postMention(
  client: SupabaseClient,
  body: { mention_id?: string } | undefined,
): Promise<number> {
  const mentionId = body?.mention_id;
  if (!mentionId) {
    console.error('[post_mention] missing mention_id');
    return 0;
  }

  const { data: mention } = await client
    .from('community_mentions')
    .select('id, post_id, comment_id, mentioned_user_id, mentioner_user_id, notified')
    .eq('id', mentionId)
    .maybeSingle();

  if (!mention || (mention as any).notified) return 0;

  const m = mention as any;

  // Mentioner profil bilgisi (push title için)
  const { data: mentionerProfile } = await client
    .from('profiles')
    .select('username, full_name')
    .eq('id', m.mentioner_user_id)
    .maybeSingle();

  // Post snippet (body'de göstermek için)
  const tableName = m.comment_id ? 'community_comments' : 'community_posts';
  const idCol = m.comment_id ?? m.post_id;
  const { data: contentRow } = await client
    .from(tableName)
    .select('content')
    .eq('id', idCol)
    .maybeSingle();

  const mentionerName =
    (mentionerProfile as any)?.full_name ??
    (mentionerProfile as any)?.username ??
    'Birisi';
  const snippet = ((contentRow as any)?.content ?? '').slice(0, 100);

  const tokens = await getTokensForUsers(client, [m.mentioned_user_id]);
  if (tokens.length === 0) {
    // Notif imkânı yok ama yine de notified = true işaretleyelim
    await client.from('community_mentions').update({ notified: true }).eq('id', m.id);
    return 0;
  }

  const messages = tokens.map((t) => ({
    to: t.token,
    title: `${mentionerName} seni etiketledi`,
    body: snippet,
    data: {
      kind: 'post_mention',
      post_id: m.post_id,
      comment_id: m.comment_id,
      mention_id: m.id,
    },
    sound: 'default' as const,
  }));
  await sendExpoPush(messages);
  await client.from('community_mentions').update({ notified: true }).eq('id', m.id);
  return messages.length;
}

/** 14. TRIAL WIN-BACK — trial bitmiş + 3 gün geçmiş + status expired */
async function trialWinback(client: SupabaseClient): Promise<number> {
  const threeDaysAgo = new Date(Date.now() - 3 * 86400e3);
  const fourDaysAgo = new Date(Date.now() - 4 * 86400e3);
  const { data } = await client
    .from('profiles')
    .select('id, trial_ends_at')
    .eq('subscription_status', 'expired')
    .gte('trial_ends_at', fourDaysAgo.toISOString())
    .lte('trial_ends_at', threeDaysAgo.toISOString());

  const userIds = (data ?? []).map((r) => r.id as string);
  const tokens = await getTokensForUsers(client, userIds);
  const messages = tokens.map((t) => ({
    to: t.token,
    title: '🎁 Sana özel — %50 indirim',
    body: 'Geri dön: ilk yıl yarı fiyat. Sadece bu hafta.',
    data: { kind: 'trial_winback' },
    sound: 'default' as const,
  }));
  await sendExpoPush(messages);
  return messages.length;
}

// ═══════════════════════════════════════════════════════════════════
//  ROUTER
// ═══════════════════════════════════════════════════════════════════

interface TriggerCtx {
  userIds?: string[];
  body?: Record<string, any>;
}

const TRIGGERS: Record<string, (client: SupabaseClient, ctx: TriggerCtx) => Promise<number>> = {
  streak_danger_evening: (c) => streakDangerEvening(c),
  streak_milestone: (c, ctx) => streakMilestone(c, ctx.userIds ?? []),
  heart_full_refill: (c, ctx) => heartFullRefill(c, ctx.userIds ?? []),
  ai_scenario_weekly: (c) => aiScenarioWeekly(c),
  icao_mock_feedback: (c, ctx) => icaoMockFeedback(c, ctx.userIds ?? []),
  league_promotion: (c, ctx) => leaguePromotion(c, ctx.userIds ?? []),
  league_demotion_warning: (c) => leagueDemotionWarning(c),
  squadron_friend_lapped: (c, ctx) => squadronFriendLapped(c, ctx.userIds ?? []),
  new_unit_unlocked: (c, ctx) => newUnitUnlocked(c, ctx.userIds ?? []),
  exam_day_countdown: (c) => examDayCountdown(c),
  inactivity_recovery: (c) => inactivityRecovery(c),
  // 5.C.1 trial push triggers
  trial_ending_t1: (c) => trialEndingT1(c),
  trial_ending_t0: (c) => trialEndingT0(c),
  trial_winback: (c) => trialWinback(c),
  // 5.D.3 special offer (admin manuel broadcast)
  special_offer: (c, ctx) => specialOffer(c, ctx.body as any),
  // 6.B.1 community mention (DB trigger fires per mention)
  post_mention: (c, ctx) => postMention(c, ctx.body as any),
  // 6.C.1 moderation warning (DB trigger fires when status='hidden')
  mod_warning: (c, ctx) => modWarning(c, ctx.body as any),
  // 6.D.1 comment_reply + post_reaction (DB triggers)
  comment_reply: (c, ctx) => commentReply(c, ctx.body as any),
  post_reaction: (c, ctx) => postReaction(c, ctx.body as any),
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

  let body: Record<string, any> | undefined;
  let userIds: string[] | undefined;
  if (req.method === 'POST') {
    try {
      body = await req.json();
      userIds = body?.user_ids;
    } catch {
      /* boş body OK */
    }
  }

  try {
    const sent = await handler(client, { userIds, body });
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
