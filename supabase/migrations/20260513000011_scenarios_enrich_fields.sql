-- scenarios: briefing, learner_role, objective, key_vocabulary + estimated_duration_seconds
-- Senaryo zenginleştirme için 4 yeni jsonb + 1 int.
-- turns jsonb mevcut (schema-less) — yeni alt-fieldlar (expected_response, hint, vocabulary_focus)
-- ek migration gerektirmez.

ALTER TABLE public.scenarios
  ADD COLUMN IF NOT EXISTS briefing jsonb,
  ADD COLUMN IF NOT EXISTS learner_role jsonb,
  ADD COLUMN IF NOT EXISTS objective jsonb,
  ADD COLUMN IF NOT EXISTS key_vocabulary jsonb,
  ADD COLUMN IF NOT EXISTS estimated_duration_seconds int DEFAULT 120;

COMMENT ON COLUMN public.scenarios.briefing IS
  '{ tr, en } — 2-3 sentence durum açıklaması (pre-scenario briefing kartı).';
COMMENT ON COLUMN public.scenarios.learner_role IS
  '{ tr, en } — "Sen kimsin?" — callsign + aircraft + role.';
COMMENT ON COLUMN public.scenarios.objective IS
  '{ tr, en } — "Ne yapacaksın?" — hedef.';
COMMENT ON COLUMN public.scenarios.key_vocabulary IS
  '[{ term, definition_tr, definition_en }] — 5-8 anahtar terim.';
COMMENT ON COLUMN public.scenarios.estimated_duration_seconds IS
  'Saniye cinsinden tahmini süre. Mevcut estimated_minutes ile uyumlu (saniye finer-grain).';
