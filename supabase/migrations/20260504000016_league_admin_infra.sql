-- ============================================================================
-- Sprint 4E — Admin lig yönetim altyapısı
-- ============================================================================
-- 1. suspicious_flags tablosu (manuel + otomatik şüphe işaretleri)
-- 2. app_config 'league' kategorisi + 11 yeni config key
-- 3. suspicious_xp_view — son 1 saat / 24 saat anormal XP tespiti
-- ============================================================================

BEGIN;

-- ─── 1. suspicious_flags ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.suspicious_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text NOT NULL,
  detail jsonb,
  flagged_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  flagged_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  resolution text CHECK (resolution IS NULL OR resolution IN ('cleared', 'banned', 'warned'))
);

CREATE INDEX IF NOT EXISTS suspicious_flags_user_idx
  ON public.suspicious_flags (user_id, flagged_at DESC);
CREATE INDEX IF NOT EXISTS suspicious_flags_open_idx
  ON public.suspicious_flags (flagged_at DESC) WHERE reviewed_at IS NULL;

ALTER TABLE public.suspicious_flags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS suspicious_flags_admin_read ON public.suspicious_flags;
CREATE POLICY suspicious_flags_admin_read ON public.suspicious_flags
  FOR SELECT USING (public.is_admin_user());

DROP POLICY IF EXISTS suspicious_flags_admin_insert ON public.suspicious_flags;
CREATE POLICY suspicious_flags_admin_insert ON public.suspicious_flags
  FOR INSERT WITH CHECK (public.has_admin_role('editor'));

DROP POLICY IF EXISTS suspicious_flags_admin_update ON public.suspicious_flags;
CREATE POLICY suspicious_flags_admin_update ON public.suspicious_flags
  FOR UPDATE USING (public.has_admin_role('editor'))
                WITH CHECK (public.has_admin_role('editor'));

-- ─── 2. app_config 'league' kategorisi + key'ler ─────────────────────────
-- Önce category CHECK'i 'league' içerecek şekilde genişlet
DO $cat$
DECLARE
  v_cats text;
BEGIN
  ALTER TABLE public.app_config DROP CONSTRAINT IF EXISTS app_config_category_check;

  SELECT string_agg(DISTINCT quote_literal(c), ',')
    INTO v_cats
  FROM (
    SELECT category AS c FROM public.app_config
    UNION ALL
    SELECT unnest(ARRAY['ads', 'freemium', 'paywall', 'feature_flag', 'general', 'audio', 'league'])
  ) sub
  WHERE c IS NOT NULL;

  EXECUTE format(
    'ALTER TABLE public.app_config ADD CONSTRAINT app_config_category_check CHECK (category IN (%s))',
    v_cats
  );
END $cat$;

INSERT INTO public.app_config (key, value, description, category, data_type) VALUES
  ('league.weekly.group_capacity',     '50'::jsonb,    'Haftalık grup max üye sayısı', 'league', 'number'),
  ('league.weekly.promotion_count',    '10'::jsonb,    'Haftalık top N → terfi', 'league', 'number'),
  ('league.weekly.demotion_count',     '10'::jsonb,    'Haftalık bottom N → düşme', 'league', 'number'),
  ('league.weekly.reward_1st',         '500'::jsonb,   'Haftalık 1.''ye coin', 'league', 'number'),
  ('league.weekly.reward_2nd',         '300'::jsonb,   'Haftalık 2.''ye coin', 'league', 'number'),
  ('league.weekly.reward_3rd',         '200'::jsonb,   'Haftalık 3.''ye coin', 'league', 'number'),
  ('league.monthly.reward_1st',        '2000'::jsonb,  'Aylık 1.''ye coin', 'league', 'number'),
  ('league.monthly.reward_2nd',        '1000'::jsonb,  'Aylık 2.''ye coin', 'league', 'number'),
  ('league.monthly.reward_3rd',        '500'::jsonb,   'Aylık 3.''ye coin', 'league', 'number'),
  ('league.monthly.reward_4_to_10',    '200'::jsonb,   'Aylık 4-10. coin', 'league', 'number'),
  ('league.yearly.reward_1st',         '10000'::jsonb, 'Yıllık 1.''ye coin', 'league', 'number'),
  ('league.yearly.premium_gift_months','12'::jsonb,    'Yıllık 1.''ye premium hediye (ay)', 'league', 'number')
ON CONFLICT (key) DO NOTHING;

-- ─── 3. suspicious_xp_view — anormal XP tespiti ─────────────────────────
-- Son 1 saatte > 5000 XP veya 24 saatte > 50000 XP veya ortalama lesson < 30sn.
-- View on-demand çalışır; admin /leagues sayfası okur.
CREATE OR REPLACE VIEW public.suspicious_xp_view AS
WITH recent_progress AS (
  SELECT
    user_id,
    SUM(xp_awarded) FILTER (WHERE completed_at > now() - INTERVAL '1 hour') AS xp_1h,
    SUM(xp_awarded) FILTER (WHERE completed_at > now() - INTERVAL '24 hours') AS xp_24h,
    AVG(time_spent) FILTER (WHERE completed_at > now() - INTERVAL '24 hours') AS avg_time_24h,
    COUNT(*) FILTER (WHERE completed_at > now() - INTERVAL '24 hours') AS lessons_24h
  FROM public.user_lesson_progress
  WHERE completed_at > now() - INTERVAL '24 hours'
  GROUP BY user_id
),
device_count AS (
  SELECT user_id, COUNT(DISTINCT token) AS device_count
  FROM public.push_tokens
  GROUP BY user_id
)
SELECT
  rp.user_id,
  p.username,
  p.full_name,
  COALESCE(rp.xp_1h, 0) AS xp_1h,
  COALESCE(rp.xp_24h, 0) AS xp_24h,
  COALESCE(rp.avg_time_24h, 0)::int AS avg_time_24h,
  COALESCE(rp.lessons_24h, 0) AS lessons_24h,
  COALESCE(dc.device_count, 0) AS device_count,
  -- Flag mantığı: suspicion score 0-100
  (
    CASE WHEN COALESCE(rp.xp_1h, 0) > 5000 THEN 35 ELSE 0 END +
    CASE WHEN COALESCE(rp.xp_24h, 0) > 50000 THEN 30 ELSE 0 END +
    CASE WHEN COALESCE(rp.avg_time_24h, 9999) < 30 AND rp.lessons_24h > 5 THEN 20 ELSE 0 END +
    CASE WHEN COALESCE(dc.device_count, 0) > 3 THEN 15 ELSE 0 END
  ) AS suspicion_score,
  ARRAY_REMOVE(ARRAY[
    CASE WHEN COALESCE(rp.xp_1h, 0) > 5000 THEN 'xp_burst_1h' END,
    CASE WHEN COALESCE(rp.xp_24h, 0) > 50000 THEN 'xp_burst_24h' END,
    CASE WHEN COALESCE(rp.avg_time_24h, 9999) < 30 AND rp.lessons_24h > 5 THEN 'fast_lessons' END,
    CASE WHEN COALESCE(dc.device_count, 0) > 3 THEN 'multi_device' END
  ], NULL) AS reasons
FROM recent_progress rp
LEFT JOIN public.profiles p ON p.id = rp.user_id
LEFT JOIN device_count dc ON dc.user_id = rp.user_id
WHERE
  COALESCE(rp.xp_1h, 0) > 5000
  OR COALESCE(rp.xp_24h, 0) > 50000
  OR (COALESCE(rp.avg_time_24h, 9999) < 30 AND rp.lessons_24h > 5)
  OR COALESCE(dc.device_count, 0) > 3
ORDER BY suspicion_score DESC, rp.xp_24h DESC;

GRANT SELECT ON public.suspicious_xp_view TO authenticated;

DO $$ BEGIN
  RAISE NOTICE 'Sprint 4E — suspicious_flags + 12 league config + suspicious_xp_view aktif';
END $$;

COMMIT;
