'use server';

/**
 * Data export server actions.
 * Sprint 4.E (minimal) — admin manuel "İşle" butonu ile kullanıcı verilerini
 * JSON olarak toplar, indirilebilir base64 data URL döner.
 *
 * KVKK/GDPR: Kullanıcı talep eder, admin işler, destek ekibi email gönderir.
 * Otomatik email/cron ileride eklenir.
 */
import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase/server';
import { requireAdminRole } from '@/lib/auth/guard';

export interface DataExportResult {
  ok: boolean;
  error?: string;
  /** base64 JSON data URL (admin browser'da indirir) */
  dataUrl?: string;
  filename?: string;
}

/**
 * processDataExport — kullanıcının tüm public verilerini JSON olarak toplar,
 * data_export_requests.status='sent', file_url=admin tarafından doldurulur.
 * Auth: super_admin only.
 */
export async function processDataExport(requestId: string): Promise<DataExportResult> {
  const profile = await requireAdminRole('super_admin');
  const supabase = createServiceClient();

  // 1) İstek satırını al
  const { data: req, error: reqErr } = await (supabase as any)
    .from('data_export_requests')
    .select('id, user_id, status, requested_at')
    .eq('id', requestId)
    .single();

  if (reqErr || !req) {
    return { ok: false, error: 'İstek bulunamadı' };
  }
  if (req.status === 'sent') {
    return { ok: false, error: 'Bu istek zaten gönderildi' };
  }

  // 2) Status → processing
  await (supabase as any)
    .from('data_export_requests')
    .update({ status: 'processing' })
    .eq('id', requestId);

  // 3) Kullanıcının tüm verilerini paralel çek
  const uid = req.user_id;
  const [
    profileRes,
    settingsRes,
    xpRes,
    streakRes,
    progressRes,
    badgesRes,
    championshipsRes,
    oralRes,
    placementRes,
    coinTxRes,
  ] = await Promise.all([
    (supabase as any).from('profiles').select('*').eq('id', uid).maybeSingle(),
    (supabase as any).from('user_settings').select('*').eq('user_id', uid).maybeSingle(),
    (supabase as any).from('user_xp_summary').select('*').eq('user_id', uid).maybeSingle(),
    (supabase as any).from('streaks').select('*').eq('user_id', uid).maybeSingle(),
    (supabase as any).from('user_lesson_progress').select('*').eq('user_id', uid),
    (supabase as any).from('user_badges').select('*').eq('user_id', uid),
    (supabase as any).from('championships').select('*').eq('user_id', uid),
    (supabase as any).from('oral_exam_attempts').select('*').eq('user_id', uid),
    (supabase as any).from('user_placement_results').select('*').eq('user_id', uid).maybeSingle(),
    (supabase as any).from('coin_transactions').select('*').eq('user_id', uid),
  ]);

  const exportPayload = {
    export_meta: {
      generated_at: new Date().toISOString(),
      generated_by_admin: profile.id,
      request_id: requestId,
      requested_at: req.requested_at,
      user_id: uid,
      kvkk_note:
        'Bu dosya KVKK md.11/h ve GDPR md.20 (data portability) kapsamında üretilmiştir.',
    },
    profile: profileRes.data ?? null,
    user_settings: settingsRes.data ?? null,
    xp_summary: xpRes.data ?? null,
    streak: streakRes.data ?? null,
    lesson_progress: progressRes.data ?? [],
    badges: badgesRes.data ?? [],
    championships: championshipsRes.data ?? [],
    oral_exam_attempts: oralRes.data ?? [],
    placement_results: placementRes.data ?? null,
    coin_transactions: coinTxRes.data ?? [],
  };

  const json = JSON.stringify(exportPayload, null, 2);
  const filename = `airspeak-export-${uid}-${new Date()
    .toISOString()
    .slice(0, 10)}.json`;

  // 4) base64 data URL (admin browser'dan indirir)
  const base64 = Buffer.from(json, 'utf-8').toString('base64');
  const dataUrl = `data:application/json;base64,${base64}`;

  // 5) Status → sent + audit log
  await (supabase as any)
    .from('data_export_requests')
    .update({
      status: 'sent',
      completed_at: new Date().toISOString(),
      file_url: `local-download:${filename}`,
    })
    .eq('id', requestId);

  await (supabase as any).from('admin_actions').insert({
    actor_id: profile.id,
    action: 'data_export_requested',
    table_name: 'data_export_requests',
    target_user_id: uid,
    metadata: {
      request_id: requestId,
      filename,
      bytes: json.length,
    },
  });

  revalidatePath('/data-exports');

  return { ok: true, dataUrl, filename };
}

/**
 * markDataExportFailed — admin işleme başlamış ama hata almış ise
 * status='failed' set eder.
 */
export async function markDataExportFailed(
  requestId: string,
  reason: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdminRole('super_admin');
  const supabase = createServiceClient();

  const { error } = await (supabase as any)
    .from('data_export_requests')
    .update({ status: 'failed', error: reason })
    .eq('id', requestId);

  if (error) return { ok: false, error: error.message };
  revalidatePath('/data-exports');
  return { ok: true };
}
