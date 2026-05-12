-- AirSpeak — Add 'atc' role (Air Traffic Controller)
-- Sprint 14.D — Word of the Day role-based content prerequisite

-- ─── 1) profiles.role CHECK constraint güncelle ───────────────────────────
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IS NULL OR role IN ('pilot', 'atc', 'cabin', 'technician', 'ground', 'student'));

COMMENT ON COLUMN public.profiles.role IS
  'User aviation role. Atc = Air Traffic Controller (Sprint 14.D). Null = onboarding incomplete.';

-- ─── 2) Diğer tablolarda role CHECK constraint güncelle ───────────────────
-- placement_questions, vocabulary_terms, oral_exam_prompts, ... ile aynı pattern.
-- 20260430110000_content_tables.sql'de 4 tablo etkilenir.

-- modules.role
ALTER TABLE public.modules
  DROP CONSTRAINT IF EXISTS modules_role_check;
ALTER TABLE public.modules
  ADD CONSTRAINT modules_role_check
  CHECK (role IN ('pilot', 'atc', 'cabin', 'technician', 'ground', 'student'));

-- Conditional updates — kolon varsa CHECK'i güncelle, yoksa skip.
-- Bazı tablolar role kolonu içermiyor olabilir (schema evolüsyonu).
DO $$
BEGIN
  -- placement_questions
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='placement_questions' AND column_name='role') THEN
    EXECUTE 'ALTER TABLE public.placement_questions DROP CONSTRAINT IF EXISTS placement_questions_role_check';
    EXECUTE 'ALTER TABLE public.placement_questions ADD CONSTRAINT placement_questions_role_check CHECK (role IS NULL OR role IN (''pilot'', ''atc'', ''cabin'', ''technician'', ''ground'', ''student'', ''all''))';
  END IF;

  -- vocabulary_terms
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='vocabulary_terms' AND column_name='role') THEN
    EXECUTE 'ALTER TABLE public.vocabulary_terms DROP CONSTRAINT IF EXISTS vocabulary_terms_role_check';
    EXECUTE 'ALTER TABLE public.vocabulary_terms ADD CONSTRAINT vocabulary_terms_role_check CHECK (role IN (''pilot'', ''atc'', ''cabin'', ''technician'', ''ground'', ''student''))';
  END IF;

  -- oral_exam_prompts
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='oral_exam_prompts' AND column_name='role') THEN
    EXECUTE 'ALTER TABLE public.oral_exam_prompts DROP CONSTRAINT IF EXISTS oral_exam_prompts_role_check';
    EXECUTE 'ALTER TABLE public.oral_exam_prompts ADD CONSTRAINT oral_exam_prompts_role_check CHECK (role IS NULL OR role IN (''pilot'', ''atc'', ''cabin'', ''technician'', ''ground'', ''student'', ''all''))';
  END IF;
END $$;
