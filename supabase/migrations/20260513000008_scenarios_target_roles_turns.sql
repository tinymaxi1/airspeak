-- scenarios: target_roles + turns + level + gauges
-- Mevcut static scenarios.ts'i DB'ye taşımak için gerekli kolonlar.

ALTER TABLE public.scenarios
  ADD COLUMN IF NOT EXISTS target_roles text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS turns jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS level text CHECK (level IS NULL OR level IN ('B1','B2','L4')),
  ADD COLUMN IF NOT EXISTS gauges jsonb;

CREATE INDEX IF NOT EXISTS idx_scenarios_target_roles
  ON public.scenarios USING GIN (target_roles);

CREATE INDEX IF NOT EXISTS idx_scenarios_level ON public.scenarios (level);

COMMENT ON COLUMN public.scenarios.target_roles IS
  'Hedef parent roller. Boş = role kolonu ile filtre (geriye uyumlu).';
COMMENT ON COLUMN public.scenarios.turns IS
  'Dialog turn array. Yapı: [{ id, atcStation, atcUtterance, expectedReadback, keyPhrases, correctionTr, isFinal }].';
COMMENT ON COLUMN public.scenarios.level IS
  'ICAO seviye: B1, B2, L4.';
COMMENT ON COLUMN public.scenarios.gauges IS
  'Cockpit gauges: { alt, hdg, spd, freq }. Sadece pilot senaryolar için.';
