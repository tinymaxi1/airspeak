-- ============================================================================
-- app_config: 'audio' kategorisi + 4 audio limit anahtarı
-- ============================================================================
-- Manuel-only audio policy: admin form'larında AudioField mp3/wav/ogg dosya
-- yüklemesini bu config'ten okuyup limitler. Mobile aynı config'i okur,
-- preload/cache için file_size_limit'i bilir.
-- ============================================================================

BEGIN;

-- ─── 1. category enum'a 'audio' ekle ───
ALTER TABLE public.app_config
  DROP CONSTRAINT IF EXISTS app_config_category_check;

ALTER TABLE public.app_config
  ADD CONSTRAINT app_config_category_check
  CHECK (category IN ('ads', 'freemium', 'paywall', 'feature_flag', 'general', 'audio'));

-- ─── 2. Default audio config seed ───
INSERT INTO public.app_config (key, value, description, category, data_type) VALUES
  ('audio.max_duration_seconds',  '60'::jsonb,
   'Tek ses dosyası max süre (saniye)', 'audio', 'number'),

  ('audio.allowed_formats',       '["mp3","wav","ogg"]'::jsonb,
   'İzin verilen ses formatları', 'audio', 'array'),

  ('audio.max_size_mb_lesson',    '5'::jsonb,
   'lesson-audio bucket max dosya boyutu (MB)', 'audio', 'number'),

  ('audio.max_size_mb_vocab',     '1'::jsonb,
   'vocab-audio bucket max dosya boyutu (MB)', 'audio', 'number')
ON CONFLICT (key) DO NOTHING;

DO $$
BEGIN
  RAISE NOTICE 'audio config 4 anahtar yüklendi (audio.max_duration_seconds, allowed_formats, max_size_mb_lesson, max_size_mb_vocab)';
END $$;

COMMIT;
