-- AirSpeak — Sprint 3f.A — Placement test adaptive altyapısı
--
-- NOTE: Migration sıra numarası kullanıcının verdiği 029 değil 031 — 029 ve 030
-- Sprint 7.E.1 ve 3e.A tarafından kullanıldı (chronological order).
--
-- - user_placement_results: user_id PK (latest-only), 4 boyut score, overall_level,
--   recommended_start_lesson_id, attempt_number, next_test_allowed_at (now+30g)
-- - placement_questions.dimension whitelist genişletildi:
--   ekle: vocabulary, grammar, listening, reading (mevcut 4 korunur)
-- - RPC get_next_placement_question: adaptive rule-based logic
--   (consecutive +/- 3 → level shift, min 3 max 7 per dim)
-- - RPC finalize_placement: avg → A1-C1 mapping, profiles.level update,
--   30 gün cooldown set
-- - RPC can_take_placement: cooldown gate (admin override)
-- - app_config placement.* (4 key: min/max/advance/stop)

BEGIN;

-- ─── 1. placement_questions.dimension whitelist genişlet ────────────────
ALTER TABLE public.placement_questions DROP CONSTRAINT IF EXISTS placement_questions_dimension_check;
ALTER TABLE public.placement_questions
  ADD CONSTRAINT placement_questions_dimension_check
  CHECK (dimension IN (
    'general_english', 'aviation_english', 'aviation_knowledge', 'communication',
    -- 3f.A yeni boyutlar
    'vocabulary', 'grammar', 'listening', 'reading'
  ));

-- ─── 2. user_placement_results ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_placement_results (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  taken_at timestamptz NOT NULL DEFAULT now(),
  vocabulary_score numeric(4, 2) CHECK (vocabulary_score IS NULL OR (vocabulary_score >= 0 AND vocabulary_score <= 6)),
  grammar_score numeric(4, 2) CHECK (grammar_score IS NULL OR (grammar_score >= 0 AND grammar_score <= 6)),
  listening_score numeric(4, 2) CHECK (listening_score IS NULL OR (listening_score >= 0 AND listening_score <= 6)),
  reading_score numeric(4, 2) CHECK (reading_score IS NULL OR (reading_score >= 0 AND reading_score <= 6)),
  overall_level text CHECK (overall_level IN ('A1', 'A2', 'B1', 'B2', 'C1')),
  recommended_start_lesson_id uuid REFERENCES public.lessons(id) ON DELETE SET NULL,
  questions_answered int NOT NULL DEFAULT 0 CHECK (questions_answered >= 0),
  test_duration_seconds int CHECK (test_duration_seconds IS NULL OR test_duration_seconds >= 0),
  attempt_number int NOT NULL DEFAULT 1 CHECK (attempt_number >= 1),
  next_test_allowed_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS user_placement_results_taken_at_idx
  ON public.user_placement_results (taken_at DESC);
CREATE INDEX IF NOT EXISTS user_placement_results_level_idx
  ON public.user_placement_results (overall_level);

DROP TRIGGER IF EXISTS set_user_placement_results_updated_at ON public.user_placement_results;
CREATE TRIGGER set_user_placement_results_updated_at
  BEFORE UPDATE ON public.user_placement_results
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.user_placement_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_placement_results_own_read ON public.user_placement_results;
CREATE POLICY user_placement_results_own_read ON public.user_placement_results
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin_user());

-- INSERT/UPDATE/DELETE only via SECURITY DEFINER RPC (engelle direct)
DROP POLICY IF EXISTS user_placement_results_no_direct_write ON public.user_placement_results;
CREATE POLICY user_placement_results_no_direct_write ON public.user_placement_results
  FOR INSERT WITH CHECK (false);
DROP POLICY IF EXISTS user_placement_results_no_direct_update ON public.user_placement_results;
CREATE POLICY user_placement_results_no_direct_update ON public.user_placement_results
  FOR UPDATE USING (false);

-- ─── 3. app_config: placement adaptive parametreleri ────────────────────
INSERT INTO public.app_config (key, value, description, category, data_type)
VALUES
  ('placement.questions_per_dimension_min', '3'::jsonb,
   'Adaptive: bir boyut için minimum soru sayısı', 'general', 'number'),
  ('placement.questions_per_dimension_max', '7'::jsonb,
   'Adaptive: bir boyut için maksimum soru sayısı', 'general', 'number'),
  ('placement.consecutive_to_advance', '3'::jsonb,
   'Adaptive: ardışık doğru → zorluk +1', 'general', 'number'),
  ('placement.consecutive_to_stop', '3'::jsonb,
   'Adaptive: ardışık yanlış → boyut sonu', 'general', 'number'),
  ('placement.cooldown_days', '30'::jsonb,
   'İki test arası min gün (admin override)', 'general', 'number')
ON CONFLICT (key) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════
-- ADAPTIVE RPCs
-- ═══════════════════════════════════════════════════════════════════════

-- ─── 4. Helper: level shift ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.placement_shift_level(p_level text, p_delta int)
RETURNS text
LANGUAGE plpgsql IMMUTABLE
AS $shift$
DECLARE
  levels text[] := ARRAY['A1', 'A2', 'B1', 'B2', 'C1'];
  cur int;
  next int;
BEGIN
  cur := COALESCE(array_position(levels, p_level), 3); -- default B1
  next := cur + p_delta;
  IF next < 1 THEN next := 1; END IF;
  IF next > 5 THEN next := 5; END IF;
  RETURN levels[next];
END;
$shift$;

-- ─── 5. RPC: get_next_placement_question ────────────────────────────────
-- State mobile'da tutulur, paramlar geçer; RPC adaptive level shift uygular.
-- Returns NULL when dimension is finished (max reached or 3 wrong consecutive).
CREATE OR REPLACE FUNCTION public.get_next_placement_question(
  p_session_id uuid,
  p_last_correct boolean,
  p_consecutive_correct int,
  p_consecutive_wrong int,
  p_answered_ids uuid[],
  p_dimension text,
  p_current_level text DEFAULT 'B1'
) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $next_q$
DECLARE
  v_min int;
  v_max int;
  v_advance int;
  v_stop int;
  v_answered_count int;
  v_target_level text;
  v_question RECORD;
  v_value jsonb;
  v_search_levels text[];
BEGIN
  -- Config
  SELECT (value::text)::int INTO v_min
    FROM public.app_config WHERE key = 'placement.questions_per_dimension_min';
  v_min := COALESCE(v_min, 3);

  SELECT (value::text)::int INTO v_max
    FROM public.app_config WHERE key = 'placement.questions_per_dimension_max';
  v_max := COALESCE(v_max, 7);

  SELECT (value::text)::int INTO v_advance
    FROM public.app_config WHERE key = 'placement.consecutive_to_advance';
  v_advance := COALESCE(v_advance, 3);

  SELECT (value::text)::int INTO v_stop
    FROM public.app_config WHERE key = 'placement.consecutive_to_stop';
  v_stop := COALESCE(v_stop, 3);

  v_answered_count := COALESCE(array_length(p_answered_ids, 1), 0);

  -- Termination conditions
  IF v_answered_count >= v_max THEN
    RETURN jsonb_build_object(
      'ok', true, 'finished', true, 'reason', 'max_reached',
      'final_level', p_current_level
    );
  END IF;
  IF v_answered_count >= v_min AND p_consecutive_wrong >= v_stop THEN
    -- 3 ardışık yanlış → bir alt seviye final, dur
    RETURN jsonb_build_object(
      'ok', true, 'finished', true, 'reason', 'consecutive_wrong',
      'final_level', public.placement_shift_level(p_current_level, -1)
    );
  END IF;

  -- Level shift
  v_target_level := p_current_level;
  IF p_consecutive_correct >= v_advance THEN
    v_target_level := public.placement_shift_level(p_current_level, 1);
  ELSIF p_consecutive_wrong >= v_stop AND v_answered_count < v_min THEN
    -- Min'a ulaşmadan 3 yanlış: level düşür ama devam et
    v_target_level := public.placement_shift_level(p_current_level, -1);
  END IF;

  -- Dimension validation
  IF p_dimension NOT IN (
    'vocabulary', 'grammar', 'listening', 'reading',
    'general_english', 'aviation_english', 'aviation_knowledge', 'communication'
  ) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_dimension');
  END IF;

  -- Soru ara — önce target level, yoksa komşu (önce alt sonra üst)
  v_search_levels := ARRAY[v_target_level,
    public.placement_shift_level(v_target_level, -1),
    public.placement_shift_level(v_target_level, 1)];

  FOR i IN 1..array_length(v_search_levels, 1) LOOP
    SELECT id, slug, level, dimension, format, question, question_tr, context, options, correct_id, weight
      INTO v_question
    FROM public.placement_questions
    WHERE dimension = p_dimension
      AND level = v_search_levels[i]
      AND status = 'published'
      AND (p_answered_ids IS NULL OR NOT (id = ANY(p_answered_ids)))
    ORDER BY random()
    LIMIT 1;

    IF FOUND THEN
      v_value := jsonb_build_object(
        'ok', true,
        'finished', false,
        'question', jsonb_build_object(
          'id', v_question.id,
          'slug', v_question.slug,
          'level', v_question.level,
          'dimension', v_question.dimension,
          'format', v_question.format,
          'question', v_question.question,
          'question_tr', v_question.question_tr,
          'context', v_question.context,
          'options', v_question.options,
          'correct_id', v_question.correct_id,
          'weight', v_question.weight
        ),
        'target_level', v_target_level,
        'served_level', v_search_levels[i]
      );
      RETURN v_value;
    END IF;
  END LOOP;

  -- Hiç soru yok
  RETURN jsonb_build_object(
    'ok', true, 'finished', true, 'reason', 'no_questions_available',
    'final_level', v_target_level
  );
END;
$next_q$;

GRANT EXECUTE ON FUNCTION public.get_next_placement_question(
  uuid, boolean, int, int, uuid[], text, text
) TO authenticated;

-- ─── 6. RPC: finalize_placement ─────────────────────────────────────────
-- p_scores: { vocabulary, grammar, listening, reading } (her biri 0-6 numeric)
-- Avg → level mapping, profile update, 30g cooldown set, return summary.
CREATE OR REPLACE FUNCTION public.finalize_placement(
  p_scores jsonb,
  p_questions_answered int DEFAULT 0,
  p_test_duration_seconds int DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $finalize$
DECLARE
  v_uid uuid := auth.uid();
  v_voc numeric;
  v_gra numeric;
  v_lis numeric;
  v_rea numeric;
  v_avg numeric;
  v_level text;
  v_recommended_lesson uuid;
  v_existing_attempts int;
  v_cooldown_days int;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated');
  END IF;

  -- Score parse + clamp 0-6
  v_voc := LEAST(6, GREATEST(0, COALESCE((p_scores->>'vocabulary')::numeric, 0)));
  v_gra := LEAST(6, GREATEST(0, COALESCE((p_scores->>'grammar')::numeric, 0)));
  v_lis := LEAST(6, GREATEST(0, COALESCE((p_scores->>'listening')::numeric, 0)));
  v_rea := LEAST(6, GREATEST(0, COALESCE((p_scores->>'reading')::numeric, 0)));

  v_avg := (v_voc + v_gra + v_lis + v_rea) / 4.0;

  -- Level mapping
  IF v_avg < 1.5 THEN v_level := 'A1';
  ELSIF v_avg < 2.5 THEN v_level := 'A2';
  ELSIF v_avg < 3.5 THEN v_level := 'B1';
  ELSIF v_avg < 4.5 THEN v_level := 'B2';
  ELSE v_level := 'C1';
  END IF;

  -- Recommended start lesson: kullanıcının role'üne göre ilk lesson
  -- (basit heuristik — modules üstünden role match, level >= overall)
  SELECT l.id INTO v_recommended_lesson
  FROM public.lessons l
  JOIN public.units u ON u.id = l.unit_id
  JOIN public.modules m ON m.id = u.module_id
  WHERE l.status = 'published'
    AND (m.target_role IS NULL OR m.target_role = (SELECT role FROM public.profiles WHERE id = v_uid)::text OR m.target_role = 'all')
    AND l.level = v_level
  ORDER BY u.order_index, l.order_index
  LIMIT 1;

  -- Cooldown
  SELECT COALESCE((value::text)::int, 30) INTO v_cooldown_days
  FROM public.app_config WHERE key = 'placement.cooldown_days';

  -- Mevcut attempt sayısı (UPSERT için)
  SELECT attempt_number INTO v_existing_attempts
  FROM public.user_placement_results WHERE user_id = v_uid;

  -- UPSERT (user_id PK, latest-only)
  INSERT INTO public.user_placement_results (
    user_id, taken_at,
    vocabulary_score, grammar_score, listening_score, reading_score,
    overall_level, recommended_start_lesson_id,
    questions_answered, test_duration_seconds,
    attempt_number, next_test_allowed_at
  ) VALUES (
    v_uid, now(),
    v_voc, v_gra, v_lis, v_rea,
    v_level, v_recommended_lesson,
    p_questions_answered, p_test_duration_seconds,
    1, now() + (v_cooldown_days || ' days')::interval
  )
  ON CONFLICT (user_id) DO UPDATE SET
    taken_at = now(),
    vocabulary_score = EXCLUDED.vocabulary_score,
    grammar_score = EXCLUDED.grammar_score,
    listening_score = EXCLUDED.listening_score,
    reading_score = EXCLUDED.reading_score,
    overall_level = EXCLUDED.overall_level,
    recommended_start_lesson_id = EXCLUDED.recommended_start_lesson_id,
    questions_answered = EXCLUDED.questions_answered,
    test_duration_seconds = EXCLUDED.test_duration_seconds,
    attempt_number = COALESCE(v_existing_attempts, 0) + 1,
    next_test_allowed_at = EXCLUDED.next_test_allowed_at,
    updated_at = now();

  -- profiles.level güncelle
  UPDATE public.profiles SET level = v_level::text WHERE id = v_uid;

  RETURN jsonb_build_object(
    'ok', true,
    'level', v_level,
    'avg_score', ROUND(v_avg, 2),
    'scores', jsonb_build_object(
      'vocabulary', v_voc,
      'grammar', v_gra,
      'listening', v_lis,
      'reading', v_rea
    ),
    'recommended_lesson_id', v_recommended_lesson,
    'next_test_allowed_at', (now() + (v_cooldown_days || ' days')::interval),
    'attempt_number', COALESCE(v_existing_attempts, 0) + 1
  );
END;
$finalize$;

GRANT EXECUTE ON FUNCTION public.finalize_placement(jsonb, int, int) TO authenticated;

-- ─── 7. RPC: can_take_placement ─────────────────────────────────────────
-- Cooldown gate. Admin override (is_admin_user) her zaman true.
CREATE OR REPLACE FUNCTION public.can_take_placement(p_user_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $can$
DECLARE
  v_uid uuid := COALESCE(p_user_id, auth.uid());
  v_next timestamptz;
  v_attempts int;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated');
  END IF;

  -- Admin override
  IF public.is_admin_user() AND p_user_id IS NOT NULL AND p_user_id <> auth.uid() THEN
    RETURN jsonb_build_object('ok', true, 'can_take', true, 'reason', 'admin_override');
  END IF;

  SELECT next_test_allowed_at, attempt_number INTO v_next, v_attempts
  FROM public.user_placement_results WHERE user_id = v_uid;

  IF v_next IS NULL THEN
    -- Hiç test yapmamış
    RETURN jsonb_build_object('ok', true, 'can_take', true, 'attempt_number', 0);
  END IF;

  IF v_next < now() THEN
    RETURN jsonb_build_object(
      'ok', true, 'can_take', true,
      'attempt_number', v_attempts,
      'last_attempt_at', v_next
    );
  END IF;

  RETURN jsonb_build_object(
    'ok', true, 'can_take', false,
    'attempt_number', v_attempts,
    'next_test_allowed_at', v_next,
    'days_remaining', GREATEST(0, EXTRACT(DAY FROM (v_next - now()))::int)
  );
END;
$can$;

GRANT EXECUTE ON FUNCTION public.can_take_placement(uuid) TO authenticated;

DO $$ BEGIN
  RAISE NOTICE 'Sprint 3f.A — placement adaptive: 3 RPC + cooldown + 4 dim score aktif';
END $$;

COMMIT;
