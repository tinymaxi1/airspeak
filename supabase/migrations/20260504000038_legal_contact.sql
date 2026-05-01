-- Sprint 8.D — KVKK iletişim email config (admin değiştirebilir)

-- 'legal' kategorisini whitelist'e ekle (dinamik constraint pattern)
ALTER TABLE public.app_config DROP CONSTRAINT IF EXISTS app_config_category_check;
DO $cat$
DECLARE v_cats text;
BEGIN
  SELECT string_agg(DISTINCT quote_literal(c), ',') INTO v_cats
  FROM (
    SELECT category AS c FROM public.app_config
    UNION ALL
    SELECT unnest(ARRAY['ads', 'freemium', 'paywall', 'feature_flag', 'general', 'audio', 'legal'])
  ) sub
  WHERE c IS NOT NULL;
  EXECUTE format(
    'ALTER TABLE public.app_config ADD CONSTRAINT app_config_category_check CHECK (category IN (%s))',
    v_cats
  );
END $cat$;

INSERT INTO public.app_config (key, value, description, category, data_type)
VALUES
  ('legal.contact_email', '"kvkk@airspeak.io"'::jsonb,
   'KVKK başvuruları + yasal iletişim email adresi (Settings > Privacy''de gösterilir)',
   'legal', 'string')
ON CONFLICT (key) DO NOTHING;
