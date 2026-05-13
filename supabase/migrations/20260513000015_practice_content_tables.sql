-- AirSpeak — Practice Content Tables (Sprint C2)
--
-- Hardcoded TS dosyalarını (readback/pronunciation/listen-solve) DB'ye taşı.
-- Admin CRUD + mobile hook'lar DB'den okur. Hardcoded TS fallback olarak kalır.
--
-- 3 yeni tablo:
--   - readback_clearances: ATC clearance read-back drill bank (30 satır seed)
--   - pronunciation_sentences: Telaffuz cümle bank (10 satır seed)
--   - listen_solve_drills: Dinle & Çöz drill bank (14 satır seed)
--
-- Hepsi role + sub_role + level aware. RLS: public published okur, admin yazar.

BEGIN;

-- ═══════════════════════════════════════════════════════
-- 1. readback_clearances
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.readback_clearances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  level text CHECK (level IS NULL OR level IN ('A0','A1','A2','B1','B2','C1','C2')),
  target_role text CHECK (target_role IN ('pilot','atc','cabin','technician','ground','student','dispatcher','all')),
  target_sub_roles text[] DEFAULT '{}',
  category text,
  station text,
  freq text,
  atc_utterance text NOT NULL,
  expected_readback text NOT NULL,
  key_phrases jsonb NOT NULL,
  icao_ref text,
  hint_tr text,
  hint_en text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  audio_url text,
  sort int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_readback_clearances_role_sub
  ON public.readback_clearances (target_role, target_sub_roles);
CREATE INDEX IF NOT EXISTS idx_readback_clearances_status_level
  ON public.readback_clearances (status, level);

DROP TRIGGER IF EXISTS set_readback_clearances_updated_at ON public.readback_clearances;
CREATE TRIGGER set_readback_clearances_updated_at
  BEFORE UPDATE ON public.readback_clearances
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.readback_clearances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS readback_select_published ON public.readback_clearances;
CREATE POLICY readback_select_published ON public.readback_clearances
  FOR SELECT USING (status = 'published' OR public.is_admin_user());

DROP POLICY IF EXISTS readback_admin_all ON public.readback_clearances;
CREATE POLICY readback_admin_all ON public.readback_clearances
  FOR ALL USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());

-- ═══════════════════════════════════════════════════════
-- 2. pronunciation_sentences
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.pronunciation_sentences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  text_en text NOT NULL,
  text_tr text,
  ipa text,
  phonemes jsonb,
  level text CHECK (level IS NULL OR level IN ('A0','A1','A2','B1','B2','C1','C2')),
  target_role text CHECK (target_role IN ('pilot','atc','cabin','technician','ground','student','dispatcher','all')),
  target_sub_roles text[] DEFAULT '{}',
  category text,
  hint_tr text,
  hint_en text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  audio_url text,
  sort int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_pronunciation_role_sub
  ON public.pronunciation_sentences (target_role, target_sub_roles);
CREATE INDEX IF NOT EXISTS idx_pronunciation_status_level
  ON public.pronunciation_sentences (status, level);

DROP TRIGGER IF EXISTS set_pronunciation_sentences_updated_at ON public.pronunciation_sentences;
CREATE TRIGGER set_pronunciation_sentences_updated_at
  BEFORE UPDATE ON public.pronunciation_sentences
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.pronunciation_sentences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pronunciation_select_published ON public.pronunciation_sentences;
CREATE POLICY pronunciation_select_published ON public.pronunciation_sentences
  FOR SELECT USING (status = 'published' OR public.is_admin_user());

DROP POLICY IF EXISTS pronunciation_admin_all ON public.pronunciation_sentences;
CREATE POLICY pronunciation_admin_all ON public.pronunciation_sentences
  FOR ALL USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());

-- ═══════════════════════════════════════════════════════
-- 3. listen_solve_drills
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.listen_solve_drills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  level text CHECK (level IS NULL OR level IN ('A0','A1','A2','B1','B2','C1','C2')),
  target_role text CHECK (target_role IN ('pilot','atc','cabin','technician','ground','student','dispatcher','all')),
  target_sub_roles text[] DEFAULT '{}',
  category text,
  audio_text text NOT NULL,
  question_tr text NOT NULL,
  question_en text NOT NULL,
  options jsonb NOT NULL,
  correct_id text NOT NULL,
  explanation_tr text,
  explanation_en text,
  hint_tr text,
  hint_en text,
  noise_level int NOT NULL DEFAULT 0 CHECK (noise_level >= 0 AND noise_level <= 100),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  audio_url text,
  sort int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_listen_solve_role_sub
  ON public.listen_solve_drills (target_role, target_sub_roles);
CREATE INDEX IF NOT EXISTS idx_listen_solve_status_cat
  ON public.listen_solve_drills (status, category);

DROP TRIGGER IF EXISTS set_listen_solve_drills_updated_at ON public.listen_solve_drills;
CREATE TRIGGER set_listen_solve_drills_updated_at
  BEFORE UPDATE ON public.listen_solve_drills
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.listen_solve_drills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS listen_solve_select_published ON public.listen_solve_drills;
CREATE POLICY listen_solve_select_published ON public.listen_solve_drills
  FOR SELECT USING (status = 'published' OR public.is_admin_user());

DROP POLICY IF EXISTS listen_solve_admin_all ON public.listen_solve_drills;
CREATE POLICY listen_solve_admin_all ON public.listen_solve_drills
  FOR ALL USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());

DO $$ BEGIN
  RAISE NOTICE 'Practice content tables created: readback_clearances + pronunciation_sentences + listen_solve_drills';
END $$;

COMMIT;
