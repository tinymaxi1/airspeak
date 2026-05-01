-- Sprint 10.A (devam) — exercise_type tipe-özel CHECK constraint + doğrulama
-- 041'de eklenen matching/ordering/true_false enum değerleri artık committed.
-- ============================================================================

BEGIN;

ALTER TABLE public.exercises
  DROP CONSTRAINT IF EXISTS exercise_type_fields_check;

-- type::text comparison ile enum cache sorununu by-pass et
-- (yeni eklenen enum değerleri aynı session'da literal-cast'te sorun yaratıyor)
ALTER TABLE public.exercises
  ADD CONSTRAINT exercise_type_fields_check
  CHECK (
    CASE type::text
      WHEN 'matching' THEN pairs IS NOT NULL
      WHEN 'fill-blank' THEN prompt IS NOT NULL
      WHEN 'listening-mc' THEN audio_url IS NOT NULL
      WHEN 'pronunciation-record' THEN prompt IS NOT NULL
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
    AND enumlabel IN ('matching','ordering','true_false');

  IF v_count < 3 THEN
    RAISE EXCEPTION '3 yeni enum değeri eksik: % bulundu', v_count;
  END IF;

  RAISE NOTICE 'Migration başarılı: matching + ordering + true_false + pairs + correct_order + is_true';
END $$;

COMMIT;
