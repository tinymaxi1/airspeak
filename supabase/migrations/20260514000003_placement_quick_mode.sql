-- Faz 3.1 — Placement quick mode (10 soru, 2 dk) + full mode (mevcut)
--
-- DEĞIŞIKLIKLER:
-- 1. profiles.placement_mode kolonu eklenir ('quick' | 'full', default 'full')
-- 2. user_placement_results.mode + confidence kolonları (tracking)
-- 3. finalize_placement RPC mode parametresi alır (default 'full')
--    - Quick mode: confidence='medium', GREATEST mantığı korunur (eski seviye düşmez)
--    - Full mode: confidence='high' (mevcut davranış)
--
-- NOT: Mevcut user_placement_results schema'sı korunur. Kolon isimleri:
--   - overall_level (NOT 'level')
--   - recommended_start_lesson_id (NOT 'recommended_lesson_id')
--   - taken_at (NOT 'created_at')
-- Bu kolon isimleri mobile UserPlacementResult interface'i ile uyumlu.

-- ============================================================================
-- 1) Schema değişiklikleri
-- ============================================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS placement_mode text DEFAULT 'full'
    CHECK (placement_mode IN ('quick','full'));

ALTER TABLE public.user_placement_results
  ADD COLUMN IF NOT EXISTS mode text DEFAULT 'full'
    CHECK (mode IN ('quick','full'));

ALTER TABLE public.user_placement_results
  ADD COLUMN IF NOT EXISTS confidence text DEFAULT 'high'
    CHECK (confidence IN ('low','medium','high'));

-- ============================================================================
-- 2) finalize_placement RPC — mode parametresi (geriye uyumlu, default 'full')
--    Mevcut imza (uuid, jsonb) → yeni imza (uuid, jsonb, text default 'full').
--    Mobile 2-arg çağrı yapsa bile 'full' default alır.
-- ============================================================================
DROP FUNCTION IF EXISTS public.finalize_placement(uuid, jsonb);
DROP FUNCTION IF EXISTS public.finalize_placement(uuid, jsonb, text);

CREATE OR REPLACE FUNCTION public.finalize_placement(
  p_user_id uuid,
  p_scores jsonb,
  p_mode text DEFAULT 'full'
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_general numeric(4, 2);
  v_aviation_en numeric(4, 2);
  v_aviation_know numeric(4, 2);
  v_communication numeric(4, 2);
  v_avg numeric(4, 2);
  v_level text;
  v_user_role text;
  v_recommended_lesson uuid;
  v_attempt_number int;
  v_cooldown_days int := 30;
  v_current_level text;
  v_final_level text;
  v_levels_order text[] := ARRAY['A0','A1','A2','B1','B2','C1','C2'];
  v_questions_answered int;
  v_confidence text;
  v_test_duration int;
BEGIN
  -- Auth check
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'unauthenticated';
  END IF;
  IF auth.uid() <> p_user_id AND NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  -- Mode validation
  IF p_mode NOT IN ('quick','full') THEN
    p_mode := 'full';
  END IF;
  v_confidence := CASE WHEN p_mode = 'quick' THEN 'medium' ELSE 'high' END;

  -- Extract scores + clamp 0-6 (ICAO band 0=ZERO → 6=EXPERT)
  v_general := LEAST(GREATEST((p_scores->>'generalEnglish')::numeric, 0), 6);
  v_aviation_en := LEAST(GREATEST((p_scores->>'aviationEnglish')::numeric, 0), 6);
  v_aviation_know := LEAST(GREATEST((p_scores->>'aviationKnowledge')::numeric, 0), 6);
  v_communication := LEAST(GREATEST((p_scores->>'communication')::numeric, 0), 6);
  v_questions_answered := COALESCE((p_scores->>'questionsAnswered')::int, 0);
  v_test_duration := NULLIF((p_scores->>'testDurationSeconds'), '')::int;

  -- Avg score → CEFR mapping
  v_avg := (v_general + v_aviation_en + v_aviation_know + v_communication) / 4;
  v_level := CASE
    WHEN v_avg < 0.5 THEN 'A0'
    WHEN v_avg < 1.5 THEN 'A1'
    WHEN v_avg < 2.5 THEN 'A2'
    WHEN v_avg < 3.5 THEN 'B1'
    WHEN v_avg < 4.5 THEN 'B2'
    WHEN v_avg < 5.5 THEN 'C1'
    ELSE 'C2'
  END;

  -- User role + current level
  SELECT role, level INTO v_user_role, v_current_level
    FROM public.profiles WHERE id = p_user_id;

  -- GREATEST level — yalnız yükselt, düşürme
  v_final_level := v_level;
  IF v_current_level IS NOT NULL THEN
    IF array_position(v_levels_order, v_current_level) >
       array_position(v_levels_order, v_level) THEN
      v_final_level := v_current_level;
    END IF;
  END IF;

  -- Attempt number (latest-only PK, count user_lesson_progress or use 1+0)
  SELECT COALESCE(attempt_number, 0) + 1 INTO v_attempt_number
    FROM public.user_placement_results
   WHERE user_id = p_user_id;
  v_attempt_number := COALESCE(v_attempt_number, 1);

  -- Recommended lesson — m.level CEFR-aware (A0/C2 desteği için A0→A1 fallback)
  SELECT l.id INTO v_recommended_lesson
    FROM public.lessons l
    INNER JOIN public.units u ON u.id = l.unit_id
    INNER JOIN public.modules m ON m.id = u.module_id
   WHERE m.role = v_user_role
     AND m.level = v_final_level
     AND m.status = 'published'
     AND l.status = 'published'
   ORDER BY m.number, u.number, l.sort
   LIMIT 1;

  -- Insert/update result — MEVCUT schema kolon isimleri (overall_level, taken_at,
  -- recommended_start_lesson_id). Faz 3.1: mode + confidence kolonları yeni.
  INSERT INTO public.user_placement_results (
    user_id, taken_at,
    general_english_score, aviation_english_score,
    aviation_knowledge_score, communication_score,
    overall_level, recommended_start_lesson_id,
    questions_answered, test_duration_seconds, attempt_number,
    next_test_allowed_at,
    mode, confidence
  ) VALUES (
    p_user_id, now(),
    v_general, v_aviation_en, v_aviation_know, v_communication,
    v_final_level, v_recommended_lesson,
    v_questions_answered, v_test_duration, v_attempt_number,
    now() + (v_cooldown_days || ' days')::interval,
    p_mode, v_confidence
  )
  ON CONFLICT (user_id) DO UPDATE SET
    taken_at = EXCLUDED.taken_at,
    general_english_score = EXCLUDED.general_english_score,
    aviation_english_score = EXCLUDED.aviation_english_score,
    aviation_knowledge_score = EXCLUDED.aviation_knowledge_score,
    communication_score = EXCLUDED.communication_score,
    overall_level = EXCLUDED.overall_level,
    recommended_start_lesson_id = EXCLUDED.recommended_start_lesson_id,
    questions_answered = EXCLUDED.questions_answered,
    test_duration_seconds = EXCLUDED.test_duration_seconds,
    attempt_number = EXCLUDED.attempt_number,
    next_test_allowed_at = EXCLUDED.next_test_allowed_at,
    mode = EXCLUDED.mode,
    confidence = EXCLUDED.confidence;

  -- profiles.level + placement_mode sync
  UPDATE public.profiles
     SET level = v_final_level,
         placement_mode = p_mode,
         updated_at = now()
   WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'ok', true,
    'level', v_final_level,
    'previous_level', v_current_level,
    'score', v_avg,
    'mode', p_mode,
    'confidence', v_confidence,
    'attempt_number', v_attempt_number,
    'recommended_lesson_id', v_recommended_lesson,
    'scores', jsonb_build_object(
      'generalEnglish', v_general,
      'aviationEnglish', v_aviation_en,
      'aviationKnowledge', v_aviation_know,
      'communication', v_communication
    )
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.finalize_placement(uuid, jsonb, text) FROM public;
GRANT EXECUTE ON FUNCTION public.finalize_placement(uuid, jsonb, text) TO authenticated;

-- ============================================================================
-- 3) Doğrulama
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='profiles' AND column_name='placement_mode'
  ) THEN
    RAISE EXCEPTION 'profiles.placement_mode kolonu yok';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='user_placement_results' AND column_name='mode'
  ) THEN
    RAISE EXCEPTION 'user_placement_results.mode kolonu yok';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname='public' AND p.proname='finalize_placement'
      AND pg_get_function_arguments(p.oid) LIKE '%text%'
  ) THEN
    RAISE EXCEPTION 'finalize_placement(uuid, jsonb, text) signature yok';
  END IF;

  RAISE NOTICE 'Faz 3.1 placement quick mode migration OK';
END $$;
