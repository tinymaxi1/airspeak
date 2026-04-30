-- ============================================================================
-- placement_questions: passage/scenario formatlarında context zorunlu (published)
-- ============================================================================
-- Pasaj veya senaryo sorusu yayına çıkarken context (okuma metni / durum
-- bağlamı) olmadan publish edilmesin. Draft serbest.
-- Pattern: ICAO listening_requires_audio constraint'ine paralel.
-- ============================================================================

BEGIN;

ALTER TABLE public.placement_questions
  ADD CONSTRAINT placement_passage_scenario_requires_context
  CHECK (
    status <> 'published'
    OR format NOT IN ('passage', 'scenario')
    OR context IS NOT NULL
  );

DO $$
BEGIN
  RAISE NOTICE 'placement passage/scenario context constraint aktif';
END $$;

COMMIT;
