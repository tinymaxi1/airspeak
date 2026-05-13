-- AirSpeak — Placement RPC fix + schema align (mobile dim naming)
--
-- Sprint B — Placement UX
--
-- 1. user_placement_results: 4 yeni kolon (mobile dim isimleri)
--    - general_english_score
--    - aviation_english_score
--    - aviation_knowledge_score
--    - communication_score
--    Eski 4 kolon (vocabulary/grammar/listening/reading_score) NULL kalır (DROP edilmez,
--    gelecek migration'da temizlenir — geriye dönük uyumluluk için).
--
-- 2. finalize_placement RPC REWRITE:
--    - Imza: (p_user_id uuid, p_scores jsonb) — eski imza (jsonb, int, int) DROP
--    - Mobile gönderir: { generalEnglish, aviationEnglish, aviationKnowledge,
--      communication, questionsAnswered }
--    - Avg → CEFR mapping: A0/A1/A2/B1/B2/C1/C2 (7 level)
--    - GREATEST level — sadece yükseltir, düşürmez (kullanıcı yanlış güne denk
--      gelse de eski seviye korunur)
--    - Recommended lesson FIX: m.role (target_role değil) + m.level + u.sort + l.sort
--    - profiles.updated_at güncellenir (UI cache invalidation için)
--
-- 3. SMOKE TEST sonunda — DO block ile çıkar.

BEGIN;

-- ─── 1. Schema align: 4 yeni dim score kolonu ──────────────────────────
ALTER TABLE public.user_placement_results
  ADD COLUMN IF NOT EXISTS general_english_score numeric(4, 2)
    CHECK (general_english_score IS NULL OR (general_english_score >= 0 AND general_english_score <= 6)),
  ADD COLUMN IF NOT EXISTS aviation_english_score numeric(4, 2)
    CHECK (aviation_english_score IS NULL OR (aviation_english_score >= 0 AND aviation_english_score <= 6)),
  ADD COLUMN IF NOT EXISTS aviation_knowledge_score numeric(4, 2)
    CHECK (aviation_knowledge_score IS NULL OR (aviation_knowledge_score >= 0 AND aviation_knowledge_score <= 6)),
  ADD COLUMN IF NOT EXISTS communication_score numeric(4, 2)
    CHECK (communication_score IS NULL OR (communication_score >= 0 AND communication_score <= 6));

-- overall_level CHECK: A0 + C2 dahil (FAZ 1 ile uyumlu)
ALTER TABLE public.user_placement_results
  DROP CONSTRAINT IF EXISTS user_placement_results_overall_level_check;
ALTER TABLE public.user_placement_results
  ADD CONSTRAINT user_placement_results_overall_level_check
  CHECK (overall_level IS NULL OR overall_level IN ('A0','A1','A2','B1','B2','C1','C2'));

COMMENT ON COLUMN public.user_placement_results.general_english_score IS
  'Genel İngilizce CEFR band (0-6). Mobile mapping: A1=1..C2=6. NULL = eski test (drop edildiğinde).';
COMMENT ON COLUMN public.user_placement_results.aviation_english_score IS
  'Havacılık İngilizcesi band (0-6).';
COMMENT ON COLUMN public.user_placement_results.aviation_knowledge_score IS
  'Havacılık Bilgisi band (0-6).';
COMMENT ON COLUMN public.user_placement_results.communication_score IS
  'İletişim/sözlü band (0-6).';

-- ─── 2. finalize_placement RPC — eski imzaları drop et ────────────────
DROP FUNCTION IF EXISTS public.finalize_placement(jsonb, int, int);
DROP FUNCTION IF EXISTS public.finalize_placement(uuid, jsonb);
DROP FUNCTION IF EXISTS public.finalize_placement(jsonb);

-- ─── 3. Yeni finalize_placement RPC ───────────────────────────────────
CREATE OR REPLACE FUNCTION public.finalize_placement(
  p_user_id uuid,
  p_scores jsonb
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
BEGIN
  -- Auth check
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'unauthenticated';
  END IF;
  IF auth.uid() <> p_user_id AND NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  -- Extract scores + clamp 0-6
  v_general := LEAST(6, GREATEST(0, COALESCE((p_scores->>'generalEnglish')::numeric, 0)));
  v_aviation_en := LEAST(6, GREATEST(0, COALESCE((p_scores->>'aviationEnglish')::numeric, 0)));
  v_aviation_know := LEAST(6, GREATEST(0, COALESCE((p_scores->>'aviationKnowledge')::numeric, 0)));
  v_communication := LEAST(6, GREATEST(0, COALESCE((p_scores->>'communication')::numeric, 0)));
  v_questions_answered := COALESCE((p_scores->>'questionsAnswered')::int, 0);

  v_avg := (v_general + v_aviation_en + v_aviation_know + v_communication) / 4.0;

  -- Avg → CEFR mapping (7 level)
  v_level := CASE
    WHEN v_avg < 1.0 THEN 'A0'
    WHEN v_avg < 1.5 THEN 'A1'
    WHEN v_avg < 2.5 THEN 'A2'
    WHEN v_avg < 3.5 THEN 'B1'
    WHEN v_avg < 4.5 THEN 'B2'
    WHEN v_avg < 5.5 THEN 'C1'
    ELSE 'C2'
  END;

  -- User role + current level
  SELECT role::text, level INTO v_user_role, v_current_level
  FROM public.profiles WHERE id = p_user_id;

  -- GREATEST level (sadece yükseltir)
  v_final_level := CASE
    WHEN v_current_level IS NULL THEN v_level
    WHEN array_position(v_levels_order, v_level) >
         COALESCE(array_position(v_levels_order, v_current_level), 0)
    THEN v_level
    ELSE v_current_level
  END;

  -- Attempt number (latest-only tablo, max+1)
  SELECT COALESCE(attempt_number, 0) + 1 INTO v_attempt_number
  FROM public.user_placement_results WHERE user_id = p_user_id;
  v_attempt_number := COALESCE(v_attempt_number, 1);

  -- Recommended start lesson (FIX: m.role + m.level + m.sort + u.sort + l.sort)
  SELECT l.id INTO v_recommended_lesson
  FROM public.lessons l
  JOIN public.units u ON u.id = l.unit_id
  JOIN public.modules m ON m.id = u.module_id
  WHERE l.status = 'published'
    AND m.status = 'published'
    AND (m.role = v_user_role OR m.role = 'all')
    AND m.level = v_final_level
  ORDER BY m.sort ASC NULLS LAST, u.sort ASC NULLS LAST, l.sort ASC NULLS LAST
  LIMIT 1;

  -- UPSERT (user_id PK)
  INSERT INTO public.user_placement_results (
    user_id, taken_at,
    general_english_score, aviation_english_score,
    aviation_knowledge_score, communication_score,
    overall_level, recommended_start_lesson_id,
    questions_answered, attempt_number,
    next_test_allowed_at
  ) VALUES (
    p_user_id, now(),
    v_general, v_aviation_en, v_aviation_know, v_communication,
    v_final_level, v_recommended_lesson,
    v_questions_answered, v_attempt_number,
    now() + (v_cooldown_days || ' days')::interval
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
    attempt_number = EXCLUDED.attempt_number,
    next_test_allowed_at = EXCLUDED.next_test_allowed_at,
    updated_at = now();

  -- profiles.level update (GREATEST)
  UPDATE public.profiles
    SET level = v_final_level, updated_at = now()
    WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'ok', true,
    'level', v_final_level,
    'previous_level', v_current_level,
    'avg_score', ROUND(v_avg, 2),
    'scores', jsonb_build_object(
      'generalEnglish', v_general,
      'aviationEnglish', v_aviation_en,
      'aviationKnowledge', v_aviation_know,
      'communication', v_communication
    ),
    'recommended_lesson_id', v_recommended_lesson,
    'attempt_number', v_attempt_number,
    'next_test_allowed_at', (now() + (v_cooldown_days || ' days')::interval)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.finalize_placement(uuid, jsonb) TO authenticated;

DO $$ BEGIN
  RAISE NOTICE 'Placement RPC fix + schema align — 4 yeni dim kolon + finalize_placement rewrite + GREATEST level';
END $$;

COMMIT;
