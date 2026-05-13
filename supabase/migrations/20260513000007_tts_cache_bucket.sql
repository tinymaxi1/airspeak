-- tts-cache bucket — ElevenLabs üretilen mp3'leri public CDN cache.
-- Migration tarihi: 2026-05-13 (ADIM 13 ElevenLabs)
--
-- Public read (anonim de okuyabilir, CDN cache),
-- Service role yazar (Edge Function: elevenlabs-tts).

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tts-cache',
  'tts-cache',
  true,
  2 * 1024 * 1024,  -- 2 MB / mp3
  ARRAY['audio/mpeg', 'audio/mp3']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- RLS: public read
DROP POLICY IF EXISTS "tts-cache public read" ON storage.objects;
CREATE POLICY "tts-cache public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'tts-cache');

-- RLS: service_role write (Edge Function)
DROP POLICY IF EXISTS "tts-cache service write" ON storage.objects;
CREATE POLICY "tts-cache service write"
  ON storage.objects FOR ALL
  TO service_role
  USING (bucket_id = 'tts-cache')
  WITH CHECK (bucket_id = 'tts-cache');
