-- AirSpeak — Sprint 7.E.1 — app_config secret keys RLS hide
--
-- Mevcut policy app_config_public_read using(true) → herkes API key'leri okur.
-- Yeni: api_key sonu '%_api_key' pattern'li satırlar yalnız admin'e görünür.
-- Service role (Edge function) RLS bypass eder, hep okur.

BEGIN;

DROP POLICY IF EXISTS app_config_public_read ON public.app_config;
CREATE POLICY app_config_public_read
  ON public.app_config
  FOR SELECT
  USING (
    -- Secret key pattern'lerini gizle
    key NOT LIKE '%_api_key'
    AND key NOT LIKE '%service_token'
    OR public.is_admin_user()
  );

DO $$ BEGIN
  RAISE NOTICE 'Sprint 7.E.1 — app_config api_key + service_token secrets gizlendi (admin only read)';
END $$;

COMMIT;
