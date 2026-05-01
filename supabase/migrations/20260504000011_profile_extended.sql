-- ============================================================================
-- Sprint 3c-A: Profil genişletme + kariyer detay tabloları
-- ============================================================================
-- profiles'a 14 yeni kolon + 4 yeni tablo (experiences/education/
-- certifications/type_ratings) + completion % trigger.
-- ============================================================================

BEGIN;

-- ─── 1. profiles tablosuna yeni alanlar ────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS bio_short text CHECK (bio_short IS NULL OR char_length(bio_short) <= 280),
  ADD COLUMN IF NOT EXISTS bio_long text CHECK (bio_long IS NULL OR char_length(bio_long) <= 1500),
  ADD COLUMN IF NOT EXISTS callsign text,
  ADD COLUMN IF NOT EXISTS company text,
  ADD COLUMN IF NOT EXISTS position text,
  ADD COLUMN IF NOT EXISTS base_airport text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS instagram text,
  ADD COLUMN IF NOT EXISTS twitter text,
  ADD COLUMN IF NOT EXISTS youtube text,
  ADD COLUMN IF NOT EXISTS facebook text,
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS icao_english_level text
    CHECK (icao_english_level IS NULL OR icao_english_level IN ('4', '5', '6')),
  ADD COLUMN IF NOT EXISTS aviation_experience_years int
    CHECK (aviation_experience_years IS NULL OR aviation_experience_years >= 0),
  ADD COLUMN IF NOT EXISTS profile_completion_percent int NOT NULL DEFAULT 0
    CHECK (profile_completion_percent BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS is_profile_public boolean NOT NULL DEFAULT true;

-- ─── 2. user_experiences ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company text NOT NULL,
  position text NOT NULL,
  start_date date,
  end_date date,
  description text,
  is_current boolean NOT NULL DEFAULT false,
  sort int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);
CREATE INDEX IF NOT EXISTS user_experiences_user_idx
  ON public.user_experiences (user_id, sort);

-- ─── 3. user_education ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_education (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school text NOT NULL,
  degree text,
  field text,
  graduation_year int CHECK (graduation_year IS NULL OR graduation_year BETWEEN 1900 AND 2100),
  sort int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS user_education_user_idx
  ON public.user_education (user_id, sort);

-- ─── 4. user_certifications ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  number text,
  issue_date date,
  expiry_date date,
  issuing_authority text,
  sort int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (expiry_date IS NULL OR issue_date IS NULL OR expiry_date >= issue_date)
);
CREATE INDEX IF NOT EXISTS user_certifications_user_idx
  ON public.user_certifications (user_id, sort);

-- ─── 5. user_type_ratings ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_type_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  aircraft_type text NOT NULL,
  hours int CHECK (hours IS NULL OR hours >= 0),
  certified_date date,
  sort int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS user_type_ratings_user_idx
  ON public.user_type_ratings (user_id, sort);

-- ─── 6. updated_at trigger 4 yeni tabloya ─────────────────────────────────
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'user_experiences', 'user_education', 'user_certifications', 'user_type_ratings'
  ]
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON public.%I', t);
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()',
      t
    );
  END LOOP;
END $$;

-- ─── 7. RLS — kendi kayıtlarını CRUD + public read (is_profile_public TRUE) ─
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'user_experiences', 'user_education', 'user_certifications', 'user_type_ratings'
  ]
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);

    -- Public read: profil sahibi public ise herkes görür, değilse sadece sahibi
    EXECUTE format('DROP POLICY IF EXISTS "%s public_or_own_read" ON public.%I', t, t);
    EXECUTE format($f$
      CREATE POLICY "%s public_or_own_read" ON public.%I
        FOR SELECT USING (
          user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.profiles p
             WHERE p.id = user_id AND p.is_profile_public = true
          )
        )
    $f$, t, t);

    -- Insert/update/delete: sadece kendi kayıtları
    EXECUTE format('DROP POLICY IF EXISTS "%s own_write" ON public.%I', t, t);
    EXECUTE format($f$
      CREATE POLICY "%s own_write" ON public.%I
        FOR INSERT WITH CHECK (user_id = auth.uid())
    $f$, t, t);

    EXECUTE format('DROP POLICY IF EXISTS "%s own_update" ON public.%I', t, t);
    EXECUTE format($f$
      CREATE POLICY "%s own_update" ON public.%I
        FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid())
    $f$, t, t);

    EXECUTE format('DROP POLICY IF EXISTS "%s own_delete" ON public.%I', t, t);
    EXECUTE format($f$
      CREATE POLICY "%s own_delete" ON public.%I
        FOR DELETE USING (user_id = auth.uid())
    $f$, t, t);
  END LOOP;
END $$;

-- ─── 8. profile_completion_percent trigger ─────────────────────────────────
-- 5 grup × 20 puan = 100:
--   Temel (20):    avatar_url + full_name + bio_short  (her biri 6.66, 3 dolu = 20)
--   Kariyer (20):  company + position + base_airport   (her biri 6.66)
--   Aviation (20): icao_english_level + aviation_experience_years (her biri 10)
--   Sosyal (20):   en az 1 link dolu = 20
--   Lokasyon (20): city + country (her biri 10)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.calc_profile_completion()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  pct int := 0;
  basic int := 0;
  career int := 0;
  aviation int := 0;
  social int := 0;
  location int := 0;
BEGIN
  -- Temel
  IF NEW.avatar_url IS NOT NULL AND length(NEW.avatar_url) > 0 THEN basic := basic + 7; END IF;
  IF NEW.full_name IS NOT NULL AND length(NEW.full_name) > 0 THEN basic := basic + 7; END IF;
  IF NEW.bio_short IS NOT NULL AND length(NEW.bio_short) > 0 THEN basic := basic + 6; END IF;

  -- Kariyer
  IF NEW.company IS NOT NULL AND length(NEW.company) > 0 THEN career := career + 7; END IF;
  IF NEW.position IS NOT NULL AND length(NEW.position) > 0 THEN career := career + 7; END IF;
  IF NEW.base_airport IS NOT NULL AND length(NEW.base_airport) > 0 THEN career := career + 6; END IF;

  -- Aviation
  IF NEW.icao_english_level IS NOT NULL THEN aviation := aviation + 10; END IF;
  IF NEW.aviation_experience_years IS NOT NULL THEN aviation := aviation + 10; END IF;

  -- Sosyal — en az 1 link dolu = 20
  IF (NEW.linkedin_url IS NOT NULL AND length(NEW.linkedin_url) > 0)
     OR (NEW.instagram IS NOT NULL AND length(NEW.instagram) > 0)
     OR (NEW.twitter IS NOT NULL AND length(NEW.twitter) > 0)
     OR (NEW.youtube IS NOT NULL AND length(NEW.youtube) > 0)
     OR (NEW.facebook IS NOT NULL AND length(NEW.facebook) > 0)
     OR (NEW.website IS NOT NULL AND length(NEW.website) > 0)
  THEN
    social := 20;
  END IF;

  -- Lokasyon
  IF NEW.city IS NOT NULL AND length(NEW.city) > 0 THEN location := location + 10; END IF;
  IF NEW.country IS NOT NULL AND length(NEW.country) > 0 THEN location := location + 10; END IF;

  pct := basic + career + aviation + social + location;
  IF pct > 100 THEN pct := 100; END IF;

  NEW.profile_completion_percent := pct;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_calc_completion ON public.profiles;
CREATE TRIGGER profiles_calc_completion
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.calc_profile_completion();

-- Mevcut satırları yeniden hesapla (no-op UPDATE ile trigger'ı tetikle)
UPDATE public.profiles SET updated_at = now();

DO $$
BEGIN
  RAISE NOTICE 'profiles 14 yeni kolon + 4 yeni tablo + completion trigger aktif';
END $$;

COMMIT;
