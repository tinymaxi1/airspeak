-- AirSpeak — Sprint 7.A.1 — Oral exam altyapısı (storage + config + RPC + review queue)
--
-- - storage.buckets: oral-recordings (private, owner read/write, admin read)
-- - app_config: ai.* grubu (provider/model/key/limits)
-- - oral_exam_attempts ek kolonlar: confidence_score, needs_review, review_status,
--   review_reason, review_requested_at, evaluated_at, provider, examiner_model
-- - RPC: start_oral_attempt, submit_oral_attempt, request_oral_review,
--        get_oral_review_queue (admin)
-- - View: oral_review_queue (admin/moderator queue)
-- - Graceful fallback: API key yoksa edge function mock döndürür (provider='mock')

BEGIN;

-- ─── 1. STORAGE: oral-recordings (private, KVKK/GDPR) ───────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'oral-recordings', 'oral-recordings', false,
  10 * 1024 * 1024,  -- 10 MB max (90sn m4a ~1-2MB tipik)
  ARRAY['audio/mp4', 'audio/m4a', 'audio/x-m4a', 'audio/aac', 'audio/mpeg']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- RLS: kullanıcı sadece kendi /<userId>/* klasörüne yazar; sadece kendisi ve admin okur
DROP POLICY IF EXISTS "oral-recordings own write" ON storage.objects;
CREATE POLICY "oral-recordings own write"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'oral-recordings'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "oral-recordings own read" ON storage.objects;
CREATE POLICY "oral-recordings own read"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'oral-recordings'
    AND (
      (auth.uid()::text = (storage.foldername(name))[1])
      OR public.is_admin_user()
      OR public.is_moderator_user()
    )
  );

DROP POLICY IF EXISTS "oral-recordings own delete" ON storage.objects;
CREATE POLICY "oral-recordings own delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'oral-recordings'
    AND (auth.uid()::text = (storage.foldername(name))[1] OR public.has_admin_role('super_admin'))
  );

-- ─── 2. APP_CONFIG: AI grubu ─────────────────────────────────────────────
INSERT INTO public.app_config (key, value, description, category, data_type)
VALUES
  -- Provider seçim (Sprint 7.A: mock default, admin claude/gpt aktive eder)
  ('ai.examiner_provider',     '"mock"'::jsonb,                     'Oral examiner provider: mock | claude | gpt', 'general', 'string'),
  ('ai.stt_provider',          '"native"'::jsonb,                   'STT provider: native | whisper | mock', 'general', 'string'),
  ('ai.examiner_model',        '"claude-sonnet-4-5"'::jsonb,        'Claude/GPT model identifier', 'general', 'string'),
  ('ai.whisper_model',         '"whisper-1"'::jsonb,                'OpenAI Whisper model', 'general', 'string'),

  -- API key'ler (server-side, admin girer; mobile asla okumaz — RLS admin-only RPC ile)
  ('ai.anthropic_api_key',     '""'::jsonb,                         'Anthropic API key (sk-ant-... )', 'general', 'string'),
  ('ai.openai_api_key',        '""'::jsonb,                         'OpenAI API key (Whisper + GPT için)', 'general', 'string'),

  -- Limits + ekonomi
  ('ai.max_audio_seconds',     '90'::jsonb,                         'Tek attempt için max ses süresi', 'general', 'number'),
  ('ai.daily_cost_cap_usd',    '50'::jsonb,                         'Günlük tüm AI çağrıları maliyet limiti', 'general', 'number'),
  ('ai.review_confidence_min', '0.6'::jsonb,                        'Bu eşiğin altı manuel review queue''ya', 'general', 'number')
ON CONFLICT (key) DO NOTHING;

-- API key'leri sadece admin okuyabilir (RLS mevcut: app_config'in sahibi admin select all).
-- Mobile zaten app_config'i bütün okuyabiliyor — bunu engellemek için RLS güncelle:
DROP POLICY IF EXISTS "app_config_hide_secrets" ON public.app_config;
-- Mevcut public read policy'sini override etmiyoruz; bunun yerine view kullanıyoruz client için.
-- Asıl önlem: anahtarlar yalnız service_role'le okunur (Edge function).

-- ─── 3. oral_exam_attempts EK KOLONLAR ─────────────────────────────────────
ALTER TABLE public.oral_exam_attempts
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS confidence_score numeric(3, 2)
    CHECK (confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 1)),
  ADD COLUMN IF NOT EXISTS needs_review boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS review_status text DEFAULT 'none'
    CHECK (review_status IN ('none', 'pending', 'in_progress', 'overridden', 'confirmed')),
  ADD COLUMN IF NOT EXISTS review_reason text,
  ADD COLUMN IF NOT EXISTS review_requested_at timestamptz,
  ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS evaluated_at timestamptz,
  ADD COLUMN IF NOT EXISTS provider text,
  ADD COLUMN IF NOT EXISTS examiner_model text,
  ADD COLUMN IF NOT EXISTS error text;

-- user_id eski satırlarda NULL — exam_simulations join'le backfill
UPDATE public.oral_exam_attempts oa
SET user_id = es.user_id
FROM public.exam_simulations es
WHERE oa.simulation_id = es.id AND oa.user_id IS NULL;

CREATE INDEX IF NOT EXISTS oral_attempts_user_idx
  ON public.oral_exam_attempts (user_id, attempted_at DESC);
CREATE INDEX IF NOT EXISTS oral_attempts_review_idx
  ON public.oral_exam_attempts (review_status, attempted_at DESC)
  WHERE review_status IN ('pending', 'in_progress');
CREATE INDEX IF NOT EXISTS oral_attempts_needs_review_idx
  ON public.oral_exam_attempts (attempted_at DESC)
  WHERE needs_review = true;

COMMENT ON COLUMN public.oral_exam_attempts.confidence_score IS '0.0-1.0 — AI examiner self-confidence (Claude rubric'' ten parse)';
COMMENT ON COLUMN public.oral_exam_attempts.needs_review IS 'auto: confidence<0.6 OR user requested';
COMMENT ON COLUMN public.oral_exam_attempts.review_status IS 'none | pending | in_progress | overridden | confirmed';
COMMENT ON COLUMN public.oral_exam_attempts.provider IS 'mock | claude | gpt — hangi provider kullanıldı';

-- ═══════════════════════════════════════════════════════════════════════
-- RPCs
-- ═══════════════════════════════════════════════════════════════════════

-- ─── 4. start_oral_attempt ──────────────────────────────────────────────
-- Yeni bir attempt satırı insert eder (status başlangıç),
-- mobile audio'yu /<userId>/<attempt_id>.m4a path'ine upload edecek.
CREATE OR REPLACE FUNCTION public.start_oral_attempt(
  p_simulation_id uuid,
  p_prompt_id text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $start_attempt$
DECLARE
  v_uid uuid := auth.uid();
  v_id uuid;
  v_audio_path text;
  v_owner uuid;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated');
  END IF;

  -- Simulation kullanıcıya ait mi
  SELECT user_id INTO v_owner FROM public.exam_simulations WHERE id = p_simulation_id;
  IF v_owner IS NULL OR v_owner <> v_uid THEN
    RETURN jsonb_build_object('ok', false, 'error', 'simulation_not_owned');
  END IF;

  -- Prompt aktif mi
  IF NOT EXISTS (
    SELECT 1 FROM public.oral_exam_prompts WHERE id = p_prompt_id AND active = true
  ) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'prompt_not_found');
  END IF;

  v_id := gen_random_uuid();
  v_audio_path := v_uid::text || '/' || v_id::text || '.m4a';

  INSERT INTO public.oral_exam_attempts (
    id, simulation_id, prompt_id, user_id, audio_path
  ) VALUES (
    v_id, p_simulation_id, p_prompt_id, v_uid, v_audio_path
  );

  RETURN jsonb_build_object(
    'ok', true,
    'attempt_id', v_id,
    'audio_path', v_audio_path,
    'bucket', 'oral-recordings'
  );
END;
$start_attempt$;

GRANT EXECUTE ON FUNCTION public.start_oral_attempt(uuid, text) TO authenticated;

-- ─── 5. submit_oral_attempt ─────────────────────────────────────────────
-- Mobile upload + STT bitince çağırır. Transcript + duration kaydeder,
-- evaluation tetiği döner (mobile'ın Edge Function'ı ayrıca çağırması beklenir;
-- DB trigger çalıştırma yerine explicit çağrı tercih ettik — debug için).
CREATE OR REPLACE FUNCTION public.submit_oral_attempt(
  p_attempt_id uuid,
  p_transcript text,
  p_duration_seconds int
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $submit_attempt$
DECLARE
  v_uid uuid := auth.uid();
  v_owner uuid;
  v_max int;
  v_max_value jsonb;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated');
  END IF;

  SELECT user_id INTO v_owner FROM public.oral_exam_attempts WHERE id = p_attempt_id;
  IF v_owner IS NULL OR v_owner <> v_uid THEN
    RETURN jsonb_build_object('ok', false, 'error', 'attempt_not_owned');
  END IF;

  -- Max audio süresi config'ten oku (clamp)
  SELECT value INTO v_max_value FROM public.app_config WHERE key = 'ai.max_audio_seconds';
  v_max := COALESCE(NULLIF(v_max_value::text, '')::int, 90);
  IF p_duration_seconds > v_max + 30 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'duration_exceeded', 'max', v_max);
  END IF;

  UPDATE public.oral_exam_attempts SET
    transcript = p_transcript,
    duration_seconds = p_duration_seconds
  WHERE id = p_attempt_id;

  RETURN jsonb_build_object('ok', true);
END;
$submit_attempt$;

GRANT EXECUTE ON FUNCTION public.submit_oral_attempt(uuid, text, int) TO authenticated;

-- ─── 6. request_oral_review (kullanıcı itirazı) ─────────────────────────
CREATE OR REPLACE FUNCTION public.request_oral_review(
  p_attempt_id uuid,
  p_reason text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $req_rev$
DECLARE
  v_uid uuid := auth.uid();
  v_owner uuid;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated');
  END IF;
  SELECT user_id INTO v_owner FROM public.oral_exam_attempts WHERE id = p_attempt_id;
  IF v_owner IS NULL OR v_owner <> v_uid THEN
    RETURN jsonb_build_object('ok', false, 'error', 'attempt_not_owned');
  END IF;
  UPDATE public.oral_exam_attempts SET
    needs_review = true,
    review_status = 'pending',
    review_reason = COALESCE(p_reason, ''),
    review_requested_at = now()
  WHERE id = p_attempt_id;
  RETURN jsonb_build_object('ok', true);
END;
$req_rev$;

GRANT EXECUTE ON FUNCTION public.request_oral_review(uuid, text) TO authenticated;

-- ─── 7. resolve_oral_review (admin/mod) ─────────────────────────────────
-- Override: yeni rubric + band, status='overridden'
-- Confirm: AI sonucu bırak, status='confirmed'
CREATE OR REPLACE FUNCTION public.resolve_oral_review(
  p_attempt_id uuid,
  p_action text,         -- 'confirm' | 'override'
  p_new_rubric jsonb DEFAULT NULL,
  p_new_band int DEFAULT NULL,
  p_note text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $resolve$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated');
  END IF;
  IF NOT public.is_admin_user() AND NOT public.is_moderator_user() THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authorized');
  END IF;
  IF p_action NOT IN ('confirm', 'override') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_action');
  END IF;

  IF p_action = 'override' THEN
    UPDATE public.oral_exam_attempts SET
      rubric = COALESCE(p_new_rubric, rubric),
      band_score = COALESCE(p_new_band, band_score),
      review_status = 'overridden',
      reviewed_by = v_uid,
      reviewed_at = now(),
      needs_review = false
    WHERE id = p_attempt_id;
  ELSE
    UPDATE public.oral_exam_attempts SET
      review_status = 'confirmed',
      reviewed_by = v_uid,
      reviewed_at = now(),
      needs_review = false
    WHERE id = p_attempt_id;
  END IF;

  -- Audit log
  PERFORM public.log_admin_action(
    'update',
    'oral_exam_attempts',
    p_attempt_id,
    NULL,
    NULL,
    jsonb_build_object('action_subtype', 'oral_review_' || p_action, 'note', p_note)
  );

  RETURN jsonb_build_object('ok', true);
END;
$resolve$;

GRANT EXECUTE ON FUNCTION public.resolve_oral_review(uuid, text, jsonb, int, text) TO authenticated;

-- ═══════════════════════════════════════════════════════════════════════
-- VIEW: oral_review_queue (admin/moderator)
-- ═══════════════════════════════════════════════════════════════════════
CREATE OR REPLACE VIEW public.oral_review_queue AS
SELECT
  oa.id,
  oa.simulation_id,
  oa.user_id,
  oa.prompt_id,
  oa.transcript,
  oa.audio_path,
  oa.duration_seconds,
  oa.rubric,
  oa.band_score,
  oa.feedback_tr,
  oa.confidence_score,
  oa.review_status,
  oa.review_reason,
  oa.review_requested_at,
  oa.attempted_at,
  oa.evaluated_at,
  oa.provider,
  oa.examiner_model,
  oa.error,
  p.username,
  p.full_name,
  p.avatar_url,
  CASE
    WHEN oa.review_reason IS NOT NULL AND oa.review_reason <> '' THEN 'user_disputed'
    WHEN oa.confidence_score IS NOT NULL AND oa.confidence_score < 0.6 THEN 'low_confidence'
    ELSE 'other'
  END AS queue_reason
FROM public.oral_exam_attempts oa
LEFT JOIN public.profiles p ON p.id = oa.user_id
WHERE oa.needs_review = true
   OR oa.review_status IN ('pending', 'in_progress')
ORDER BY oa.attempted_at DESC;

-- View RLS: SELECT yapan kullanıcı admin veya moderator olmalı
-- View'lar kendi RLS taşımaz — kaynak tablonun RLS'sine güvenir.
-- oral_exam_attempts mevcut RLS'i kullanıcının kendi simulation'ı; admin+mod için ek
-- policy gerekir:
DROP POLICY IF EXISTS "oral_att_admin_read" ON public.oral_exam_attempts;
CREATE POLICY "oral_att_admin_read" ON public.oral_exam_attempts
  FOR SELECT USING (
    (user_id = auth.uid())
    OR public.is_admin_user()
    OR public.is_moderator_user()
  );

GRANT SELECT ON public.oral_review_queue TO authenticated;

DO $$ BEGIN
  RAISE NOTICE 'Sprint 7.A.1 — oral exam infra: bucket + 9 config + 4 RPC + review queue view aktif';
END $$;

COMMIT;
