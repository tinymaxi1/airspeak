-- ============================================================================
-- placement_questions: passage/scenario formatlarında context zorunlu (published)
-- ============================================================================
-- Pasaj veya senaryo sorusu yayına çıkarken context (okuma metni / durum
-- bağlamı) olmadan publish edilmesin. Draft serbest.
-- Pattern: ICAO listening_requires_audio constraint'ine paralel.
--
-- Mevcut DB'de constraint'i ihlal eden published satırlar varsa otomatik
-- olarak draft'a düşürülür — admin paneli FileWarning ikonu ile gösterir,
-- editör context'i doldurup yeniden publish eder.
-- ============================================================================

BEGIN;

DO $$
DECLARE
  reverted int;
BEGIN
  UPDATE public.placement_questions
     SET status = 'draft',
         updated_at = now()
   WHERE status = 'published'
     AND format IN ('passage', 'scenario')
     AND context IS NULL;

  GET DIAGNOSTICS reverted = ROW_COUNT;

  IF reverted > 0 THEN
    RAISE NOTICE 'placement: % satır context eksik, draft''a çekildi (admin''de düzeltilmeli)', reverted;
  END IF;
END $$;

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
