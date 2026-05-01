-- ============================================================================
-- icao4 listening section: published satırlar için audio_url zorunlu
-- ============================================================================
-- Listening sorusu sesli content'tir; ses dosyası yokken yayına alınmamalı.
-- Constraint sadece status='published' satırları kısıtlar; draft kayıtlar
-- audio yüklenene kadar serbestçe taslak olarak tutulabilir.
-- ============================================================================

BEGIN;

ALTER TABLE public.icao4_questions
  ADD CONSTRAINT icao4_listening_requires_audio
  CHECK (
    status <> 'published'
    OR section <> 'listening'
    OR audio_url IS NOT NULL
  );

DO $$
BEGIN
  RAISE NOTICE 'icao4 listening audio constraint aktif';
END $$;

COMMIT;
