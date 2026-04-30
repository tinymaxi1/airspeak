-- ============================================================================
-- Sprint 4C — Aylık lig rotation + şampiyonlar
-- ============================================================================
-- rotate_monthly_championships() RPC: önceki ay için rol×tier şampiyonu belirle,
-- top 10 ödül, championships INSERT, month_xp reset.
-- pg_cron: ayın 1'i 00:00 UTC.
-- ============================================================================

BEGIN;

-- ─── 1. rotate_monthly_championships RPC ─────────────────────────────────
CREATE OR REPLACE FUNCTION public.rotate_monthly_championships()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_today date := (now() AT TIME ZONE 'UTC')::date;
  v_prev_month_start date := (date_trunc('month', v_today) - INTERVAL '1 month')::date;
  v_prev_month_end date := (date_trunc('month', v_today) - INTERVAL '1 day')::date;
  v_year smallint := EXTRACT(YEAR FROM v_prev_month_start)::smallint;
  v_month smallint := EXTRACT(MONTH FROM v_prev_month_start)::smallint;
  v_season_id uuid;
  v_winner RECORD;
  v_champ_count int := 0;
  v_reward_count int := 0;
BEGIN
  -- 1. Önceki ay için league_seasons'da kapalı bir kayıt aç (period_number = month)
  INSERT INTO public.league_seasons (
    season_type, year, period_number, start_date, end_date, status, closed_at
  )
  VALUES ('monthly', v_year, v_month, v_prev_month_start, v_prev_month_end, 'closed', now())
  ON CONFLICT (season_type, year, period_number) DO UPDATE
    SET status = 'closed',
        closed_at = COALESCE(league_seasons.closed_at, now())
  RETURNING id INTO v_season_id;

  -- 2. Her rol×level_tier kombinasyonu için #1'i şampiyon ilan et
  FOR v_winner IN
    WITH ranked AS (
      SELECT
        p.role,
        p.level AS level_tier,
        p.id AS user_id,
        x.month_xp,
        ROW_NUMBER() OVER (
          PARTITION BY p.role, p.level
          ORDER BY x.month_xp DESC, x.last_activity_at ASC
        ) AS r
      FROM public.user_xp_summary x
      JOIN public.profiles p ON p.id = x.user_id
      WHERE x.month_xp > 0
        AND p.role IS NOT NULL
        AND p.level IS NOT NULL
    )
    SELECT * FROM ranked WHERE r = 1
  LOOP
    INSERT INTO public.championships (
      championship_type, year, period_number, role, level_tier,
      user_id, snapshot_xp
    )
    VALUES ('monthly', v_year, v_month, v_winner.role, v_winner.level_tier,
            v_winner.user_id, v_winner.month_xp)
    ON CONFLICT (championship_type, year, period_number, role, level_tier)
      DO NOTHING;
    v_champ_count := v_champ_count + 1;

    -- monthly_champion badge auto-award
    INSERT INTO public.user_badges (user_id, badge_id)
    SELECT v_winner.user_id, b.id
      FROM public.badges b
     WHERE b.code = 'monthly_champion' AND b.is_active = true
    ON CONFLICT (user_id, badge_id) DO NOTHING;
  END LOOP;

  -- 3. Top 10 ödül (her rol×tier kombinasyonunda)
  WITH ranked AS (
    SELECT
      p.role,
      p.level AS level_tier,
      p.id AS user_id,
      x.month_xp,
      ROW_NUMBER() OVER (
        PARTITION BY p.role, p.level
        ORDER BY x.month_xp DESC, x.last_activity_at ASC
      ) AS r
    FROM public.user_xp_summary x
    JOIN public.profiles p ON p.id = x.user_id
    WHERE x.month_xp > 0
      AND p.role IS NOT NULL
      AND p.level IS NOT NULL
  ),
  reward_rows AS (
    SELECT
      user_id,
      r,
      CASE
        WHEN r = 1 THEN 2000
        WHEN r = 2 THEN 1000
        WHEN r = 3 THEN 500
        WHEN r BETWEEN 4 AND 10 THEN 200
        ELSE 0
      END AS coin_amount
    FROM ranked
    WHERE r <= 10
  )
  INSERT INTO public.league_rewards (
    user_id, season_id, group_id, rank, reward_type, reward_value
  )
  SELECT
    user_id, v_season_id, NULL, r, 'coin',
    jsonb_build_object(
      'amount', coin_amount,
      'period', 'monthly',
      'year', v_year,
      'month', v_month
    )
  FROM reward_rows
  WHERE coin_amount > 0;

  GET DIAGNOSTICS v_reward_count = ROW_COUNT;

  -- 4. month_xp reset
  UPDATE public.user_xp_summary SET month_xp = 0 WHERE month_xp > 0;

  RETURN jsonb_build_object(
    'ok', true,
    'year', v_year,
    'month', v_month,
    'season_id', v_season_id,
    'champions', v_champ_count,
    'rewards', v_reward_count
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.rotate_monthly_championships() FROM public;
GRANT EXECUTE ON FUNCTION public.rotate_monthly_championships() TO service_role;

COMMENT ON FUNCTION public.rotate_monthly_championships() IS
  'Aylık şampiyon belirle (rol×tier #1) + top 10 coin reward + month_xp reset. Edge fn / cron çağırır.';

-- ─── 2. pg_cron schedule — Ayın 1'i 00:00 UTC ────────────────────────────
DO $outer$
DECLARE
  v_url text;
  v_token text;
BEGIN
  PERFORM cron.unschedule('league-monthly-rotation');
EXCEPTION WHEN OTHERS THEN NULL;
END $outer$;

DO $outer$
DECLARE
  v_url text;
  v_token text;
BEGIN
  SELECT value::text INTO v_url FROM public.app_config WHERE key = 'league.rotation_edge_url';
  SELECT value::text INTO v_token FROM public.app_config WHERE key = 'league.rotation_service_token';

  IF v_url IS NULL OR v_url = '""' OR length(v_url) < 5 THEN
    -- Edge URL yok → SQL function direkt
    PERFORM cron.schedule(
      'league-monthly-rotation',
      '0 0 1 * *',
      $$ SELECT public.rotate_monthly_championships(); $$
    );
  ELSE
    -- Edge function tetikle (push gönderir)
    PERFORM cron.schedule(
      'league-monthly-rotation',
      '0 0 1 * *',
      format(
        $$ SELECT net.http_post(
            url := %L,
            headers := jsonb_build_object('Authorization', 'Bearer ' || %L, 'Content-Type', 'application/json'),
            body := '{"period":"monthly"}'::jsonb
          ); $$,
        replace(replace(v_url, '"', ''), 'league-weekly-rotation', 'league-monthly-rotation'),
        replace(v_token, '"', '')
      )
    );
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'monthly cron schedule skipped: %', SQLERRM;
END $outer$;

DO $$ BEGIN
  RAISE NOTICE 'Sprint 4C — rotate_monthly_championships RPC + cron aktif';
END $$;

COMMIT;
