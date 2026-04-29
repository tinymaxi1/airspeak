/**
 * İçerik Bildirim Servisi
 *
 * App Store 1.2 (UGC Safety) ve genel content moderation için.
 * Kullanıcı bir soru/ders/AI cevabı/sözlük terimini "bildir" diyebilir,
 * 24 saat içinde moderasyon ekibi inceler.
 *
 * Auth zorunlu (RLS auth.uid() = user_id check eder).
 * Aynı kullanıcı aynı içeriği 24 saatte tekrar bildiremez (DB trigger).
 */
import { supabase } from '@/lib/supabase';
import { track } from '@/lib/posthog';

export type FlagContentType =
  | 'interview_question'
  | 'exam_question'
  | 'lesson_exercise'
  | 'vocabulary_term'
  | 'conversation_scenario'
  | 'phraseology_entry'
  | 'ai_response'
  | 'other';

export type FlagReason =
  | 'inaccurate'
  | 'offensive'
  | 'copyright'
  | 'spam'
  | 'broken_audio'
  | 'other';

export interface FlagPayload {
  contentType: FlagContentType;
  contentId: string;
  reason: FlagReason;
  comment?: string;
}

export type FlagResult =
  | { ok: true; flagId: string }
  | { ok: false; reason: 'no-auth' | 'duplicate' | 'network' | 'unknown'; message?: string };

/**
 * Bir içerik için flag gönder.
 * 24 saat duplicate guard DB tarafında — duplicate ise 'duplicate' döner.
 */
export async function flagContent(payload: FlagPayload): Promise<FlagResult> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return { ok: false, reason: 'no-auth' };

  const { data, error } = await supabase
    .from('content_flags')
    .insert({
      user_id: userId,
      content_type: payload.contentType,
      content_id: payload.contentId,
      reason: payload.reason,
      comment: payload.comment?.trim() || null,
    })
    .select('id')
    .single();

  if (error) {
    if (error.message.includes('duplicate_flag_within_24h')) {
      return { ok: false, reason: 'duplicate' };
    }
    return { ok: false, reason: 'unknown', message: error.message };
  }

  // Telemetri — moderasyon önceliklendirmesi için
  track('content_flagged', {
    contentType: payload.contentType,
    contentId: payload.contentId,
    reason: payload.reason,
    hasComment: Boolean(payload.comment),
  });

  return { ok: true, flagId: data.id };
}

/**
 * Bu kullanıcının bildirdiği içerikler — Settings ekranı için.
 */
export interface UserFlag {
  id: string;
  contentType: FlagContentType;
  contentId: string;
  reason: FlagReason;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: string;
}

export async function getUserFlags(): Promise<UserFlag[]> {
  const { data, error } = await supabase
    .from('content_flags')
    .select('id, content_type, content_id, reason, status, created_at')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error || !data) return [];
  return data.map((row) => ({
    id: row.id,
    contentType: row.content_type as FlagContentType,
    contentId: row.content_id,
    reason: row.reason as FlagReason,
    status: row.status as UserFlag['status'],
    createdAt: row.created_at,
  }));
}
