-- Faz 3.1 — Placement quick mode (10 soru, 2 dk) + full mode (mevcut)
--
-- DEĞIŞIKLIKLER:
-- 1. profiles.placement_mode kolonu eklenir ('quick' | 'full', default 'full')
-- 2. user_placement_results.mode kolonu eklenir (tracking)
-- 3. finalize_placement RPC mode parametresi alır (default 'full')
--    - Quick mode: confidence='medium', GREATEST mantığı korunur (eski seviye düşmez)
--    - Full mode: confidence='high' (mevcut davranış)

-- ============================================================================
-- 1) Schema değişiklikleri
-- ============================================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS placement_mode text DEFAULT 'full'
    CHECK (placement_mode IN ('quick','full'));

ALTER TABLE public.user_placement_results
  ADD COLUMN IF NOT EXISTS mode text DEFAULT 'full'
    CHECK (mode IN ('quick','full'));

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

  -- User role (önerilen lesson için)
  SELECT role, level INTO v_user_role, v_current_level
    FROM public.profiles WHERE id = p_user_id;

  -- GREATEST level — yalnız yükselt, düşürme
  -- (yanlış güne denk gelmiş kullanıcının mevcut seviyesi korunur)
  v_final_level := v_level;
  IF v_current_level IS NOT NULL THEN
    IF array_position(v_levels_order, v_current_level) >
       array_position(v_levels_order, v_level) THEN
      v_final_level := v_current_level;
    END IF;
  END IF;

  -- Attempt number
  SELECT COUNT(*) + 1 INTO v_attempt_number
    FROM public.user_placement_results
   WHERE user_id = p_user_id;

  -- Recommended lesson (her iki mode için aynı)
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

  -- Insert/update result
  INSERT INTO public.user_placement_results (
    user_id, level, score, attempt_number, mode,
    general_english_score, aviation_english_score,
    aviation_knowledge_score, communication_score,
    confidence, recommended_lesson_id, questions_answered, created_at
  ) VALUES (
    p_user_id, v_final_level, v_avg, v_attempt_number, p_mode,
    v_general, v_aviation_en, v_aviation_know, v_communication,
    v_confidence, v_recommended_lesson, v_questions_answered, now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    level = EXCLUDED.level,
    score = EXCLUDED.score,
    attempt_number = EXCLUDED.attempt_number,
    mode = EXCLUDED.mode,
    general_english_score = EXCLUDED.general_english_score,
    aviation_english_score = EXCLUDED.aviation_english_score,
    aviation_knowledge_score = EXCLUDED.aviation_knowledge_score,
    communication_score = EXCLUDED.communication_score,
    confidence = EXCLUDED.confidence,
    recommended_lesson_id = EXCLUDED.recommended_lesson_id,
    questions_answered = EXCLUDED.questions_answered,
    created_at = now();

  -- profiles.level + placement_mode sync
  UPDATE public.profiles
     SET level = v_final_level,
         placement_mode = p_mode,
         updated_at = now()
   WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'ok', true,
    'level', v_final_level,
    'score', v_avg,
    'mode', p_mode,
    'confidence', v_confidence,
    'attempt_number', v_attempt_number,
    'recommended_lesson_id', v_recommended_lesson
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
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname='public' AND p.proname='finalize_placement'
      AND pg_get_function_arguments(p.oid) LIKE '%text%'
  ) THEN
    RAISE EXCEPTION 'finalize_placement(uuid, jsonb, text) signature yok';
  END IF;

  RAISE NOTICE 'Faz 3.1 placement quick mode migration OK';
END $$;
