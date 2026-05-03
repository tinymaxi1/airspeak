-- Sprint 10.E — exercise CHECK constraint v2 (yeni 3 tip dahil)
-- 045'te eklenen fill_blank/listening/speaking artık committed.
-- ============================================================================

BEGIN;

ALTER TABLE public.exercises
  DROP CONSTRAINT IF EXISTS exercise_type_fields_check;

ALTER TABLE public.exercises
  ADD CONSTRAINT exercise_type_fields_check
  CHECK (
    CASE type::text
      WHEN 'matching' THEN pairs IS NOT NULL
      WHEN 'fill-blank' THEN prompt IS NOT NULL
      WHEN 'fill_blank' THEN prompt IS NOT NULL
      WHEN 'listening-mc' THEN audio_url IS NOT NULL
      WHEN 'listening' THEN (transcript IS NOT NULL OR audio_url IS NOT NULL)
      WHEN 'pronunciation-record' THEN prompt IS NOT NULL
      WHEN 'speaking' THEN target_text IS NOT NULL
      WHEN 'ordering' THEN correct_order IS NOT NULL
      WHEN 'true_false' THEN is_true IS NOT NULL
      ELSE TRUE
    END
  );

DO $$
DECLARE v_count int;
BEGIN
  SELECT count(*) INTO v_count
  FROM pg_enum
  WHERE enumtypid = 'public.exercise_type'::regtype
    AND enumlabel IN ('fill_blank','listening','speaking');

  IF v_count < 3 THEN
    RAISE EXCEPTION '3 yeni enum değeri eksik: % bulundu', v_count;
  END IF;

  RAISE NOTICE 'exercise_type v2: fill_blank/listening/speaking + transcript/target_text';
END $$;

COMMIT;
