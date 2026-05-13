-- AirSpeak — Add 'dispatcher' role (Flight Dispatcher / Operations)
-- v1.0 UX REAL FIX PACK — Quick Practice role-aware için 7. rol.
--
-- Pattern: 20260512000002_add_atc_role.sql ile aynı.

-- ─── 1) profiles.role CHECK constraint güncelle ───────────────────────────
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IS NULL OR role IN ('pilot', 'atc', 'cabin', 'technician', 'ground', 'student', 'dispatcher'));

COMMENT ON COLUMN public.profiles.role IS
  'User aviation role. Dispatcher = Flight Dispatcher / Operations (v1.0 UX REAL FIX). Null = onboarding incomplete.';

-- ─── 2) modules.role ───────────────────────────────────────────────────────
ALTER TABLE public.modules
  DROP CONSTRAINT IF EXISTS modules_role_check;
ALTER TABLE public.modules
  ADD CONSTRAINT modules_role_check
  CHECK (role IN ('pilot', 'atc', 'cabin', 'technician', 'ground', 'student', 'dispatcher'));

-- ─── 3) Conditional updates for other tables ──────────────────────────────
DO $$
BEGIN
  -- placement_questions
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='placement_questions' AND column_name='role') THEN
    EXECUTE 'ALTER TABLE public.placement_questions DROP CONSTRAINT IF EXISTS placement_questions_role_check';
    EXECUTE 'ALTER TABLE public.placement_questions ADD CONSTRAINT placement_questions_role_check CHECK (role IS NULL OR role IN (''pilot'', ''atc'', ''cabin'', ''technician'', ''ground'', ''student'', ''dispatcher'', ''all''))';
  END IF;

  -- vocabulary_terms
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='vocabulary_terms' AND column_name='role') THEN
    EXECUTE 'ALTER TABLE public.vocabulary_terms DROP CONSTRAINT IF EXISTS vocabulary_terms_role_check';
    EXECUTE 'ALTER TABLE public.vocabulary_terms ADD CONSTRAINT vocabulary_terms_role_check CHECK (role IN (''pilot'', ''atc'', ''cabin'', ''technician'', ''ground'', ''student'', ''dispatcher''))';
  END IF;

  -- oral_exam_prompts
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='oral_exam_prompts' AND column_name='role') THEN
    EXECUTE 'ALTER TABLE public.oral_exam_prompts DROP CONSTRAINT IF EXISTS oral_exam_prompts_role_check';
    EXECUTE 'ALTER TABLE public.oral_exam_prompts ADD CONSTRAINT oral_exam_prompts_role_check CHECK (role IS NULL OR role IN (''pilot'', ''atc'', ''cabin'', ''technician'', ''ground'', ''student'', ''dispatcher'', ''all''))';
  END IF;
END $$;

-- ─── 4) word_of_the_day target_roles GIN index zaten array, constraint yok.
-- Yeni 'dispatcher' rolüne özel içerik admin tarafından eklenecek (boş başlar).
