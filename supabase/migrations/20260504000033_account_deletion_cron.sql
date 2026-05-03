-- Sprint 4.A — Account deletion processor cron schedule
-- Günde 1 kez 03:00 UTC: 30+ gün önce silme isteği yapmış hesapları hard delete
-- ============================================================================

-- Mevcut Sprint 5.D config'leri kullan: notifications.edge_url base + service_token
-- Ek: account_deletion.cron_path → tam Edge fn URL

INSERT INTO public.app_config (key, value, description, category, data_type)
VALUES
  ('account_deletion.edge_url', '""'::jsonb,
   'process-account-deletions Edge Function tam URL',
   'general', 'string')
ON CONFLICT (key) DO NOTHING;

-- Önceki schedule varsa kaldır
DO $$
BEGIN
  PERFORM cron.unschedule('process-account-deletions');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $outer$
DECLARE
  v_url text;
  v_token text;
  v_base text;
BEGIN
  -- Önce account_deletion.edge_url, yoksa notifications base'den türet
  SELECT value::text INTO v_url FROM public.app_config WHERE key = 'account_deletion.edge_url';
  SELECT value::text INTO v_token FROM public.app_config WHERE key = 'notifications.service_token';

  IF v_url IS NULL OR v_url = '""' OR length(v_url) < 5 THEN
    -- notifications.edge_url'den base türet (.../notification-triggers → .../process-account-deletions)
    SELECT value::text INTO v_base FROM public.app_config WHERE key = 'notifications.edge_url';
    IF v_base IS NOT NULL AND length(v_base) > 5 THEN
      v_url := replace(replace(v_base, '"', ''), 'notification-triggers', 'process-account-deletions');
      v_url := '"' || v_url || '"';
    END IF;
  END IF;

  IF v_url IS NULL OR v_url = '""' OR v_token IS NULL OR v_token = '""' THEN
    -- Config eksik — schedule kurulmaz, kullanıcı app_config'i doldurmalı
    RAISE NOTICE 'process-account-deletions cron skipped: edge_url or service_token not set in app_config';
  ELSE
    PERFORM cron.schedule(
      'process-account-deletions',
      '0 3 * * *',  -- Her gün 03:00 UTC
      format(
        $$ SELECT net.http_post(
            url := %L,
            headers := jsonb_build_object('Authorization', 'Bearer ' || %L, 'Content-Type', 'application/json'),
            body := '{}'::jsonb
          ); $$,
        replace(v_url, '"', ''),
        replace(v_token, '"', '')
      )
    );
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pg_cron schedule skipped: %', SQLERRM;
END $outer$;
