-- AirSpeak — FAZ 5 Option A: Role CHECK constraint genişletme + aviation_glossary altyapı
--
-- Mevcut sorun (FAZ 1 sonrası):
--   - scenarios_role_check: 5 rol + 'all' (atc/dispatcher YOK)
--   - vocab_terms_role_check: 5 rol + 'all' (atc/dispatcher YOK)
--   - league_groups_role_check: 5 rol + 'all' (atc/dispatcher YOK)
--   - interview_questions_role_check: 5 rol (atc/dispatcher YOK, 'all' da YOK)
--   - word_of_the_day_target_roles_check: 6 rol (dispatcher YOK)
--   - aviation_glossary: target_sub_roles kolonu YOK
--
-- Bu migration:
--   1. 5 CHECK constraint'i 7 rol + 'all' (interview_questions için sadece 7 rol — 'all' eklenir)
--   2. word_of_the_day_target_roles dispatcher dahil 7 rol
--   3. aviation_glossary'ye target_sub_roles text[] GIN index ile

-- ─── 1) scenarios.role_check ────────────────────────────────────────────────
ALTER TABLE public.scenarios
  DROP CONSTRAINT IF EXISTS scenarios_role_check;
ALTER TABLE public.scenarios
  ADD CONSTRAINT scenarios_role_check
  CHECK (role IN ('pilot','atc','cabin','technician','ground','student','dispatcher','all'));

-- ─── 2) vocab_terms.role_check ──────────────────────────────────────────────
ALTER TABLE public.vocab_terms
  DROP CONSTRAINT IF EXISTS vocab_terms_role_check;
ALTER TABLE public.vocab_terms
  ADD CONSTRAINT vocab_terms_role_check
  CHECK (role IN ('pilot','atc','cabin','technician','ground','student','dispatcher','all'));

-- ─── 3) league_groups.role_check ────────────────────────────────────────────
ALTER TABLE public.league_groups
  DROP CONSTRAINT IF EXISTS league_groups_role_check;
ALTER TABLE public.league_groups
  ADD CONSTRAINT league_groups_role_check
  CHECK (role IN ('pilot','atc','cabin','technician','ground','student','dispatcher','all'));

-- ─── 4) interview_questions.role_check ──────────────────────────────────────
-- Önce 'all' eklemiyordu — şimdi 7 rol + 'all' unify
ALTER TABLE public.interview_questions
  DROP CONSTRAINT IF EXISTS interview_questions_role_check;
ALTER TABLE public.interview_questions
  ADD CONSTRAINT interview_questions_role_check
  CHECK (role IN ('pilot','atc','cabin','technician','ground','student','dispatcher','all'));

-- ─── 5) word_of_the_day.target_roles_check ─────────────────────────────────
-- target_roles bir array — ARRAY SUBSET check (her eleman 7 rolden biri olmalı)
-- VE en az 1 eleman olmalı.
ALTER TABLE public.word_of_the_day
  DROP CONSTRAINT IF EXISTS word_of_the_day_target_roles_check;
ALTER TABLE public.word_of_the_day
  ADD CONSTRAINT word_of_the_day_target_roles_check
  CHECK (
    array_length(target_roles, 1) >= 1
    AND target_roles <@ ARRAY['pilot','atc','cabin','technician','ground','student','dispatcher']::text[]
  );

-- ─── 6) aviation_glossary.target_sub_roles ─────────────────────────────────
-- Glossary parent role'a bağlı değil — sub_role tag'leri direct atanır.
-- Boş array = "tüm sub_role'lere açık" (filter yok).
ALTER TABLE public.aviation_glossary
  ADD COLUMN IF NOT EXISTS target_sub_roles text[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_aviation_glossary_target_sub_roles
  ON public.aviation_glossary USING GIN (target_sub_roles);

COMMENT ON COLUMN public.aviation_glossary.target_sub_roles IS
  'Granular sub-role filter. Boş = tüm sub_role''lara açık. FAZ 5 Option A.';
