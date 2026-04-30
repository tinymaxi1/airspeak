-- ============================================================================
-- Sprint 4D — Yıllık lig rotation + şampiyonlar
-- ============================================================================
-- rotate_yearly_championships() RPC: önceki yıl için rol×tier şampiyonu,
-- top 50 ödül, 1 yıl premium gift (1.'ye), year_xp reset.
-- pg_cron: 1 Ocak 00:00 UTC.
-- ============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.rotate_yearly_championships()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_today date := (now() AT TIME ZONE 'UTC')::date;
  v_prev_year smallint := EXTRACT(YEAR FROM v_today)::smallint - 1;
  v_year_start date := make_date(v_prev_year, 1, 1);
  v_year_end date := make_date(v_prev_year, 12, 31);
  v_season_id uuid;
  v_winner RECORD;
  v_champ_count int := 0;
  v_reward_count int := 0;
  v_premium_count int := 0;
BEGIN
  -- 1. Yıllık season closed kayıt
  INSERT INTO public.league_seasons (
    season_type, year, period_number, start_date, end_date, status, closed_at
  )
  VALUES ('yearly', v_prev_year, 1, v_year_start, v_year_end, 'closed', now())
  ON CONFLICT (season_type, year, period_number) DO UPDATE
    SET status = 'closed',
        closed_at = COALESCE(league_seasons.closed_at, now())
  RETURNING id INTO v_season_id;

  -- 2. Her rol×tier #1 → şampiyon + badge + 1 yıl premium gift
  FOR v_winner IN
    WITH ranked AS (
      SELECT
        p.role,
        p.level AS level_tier,
        p.id AS user_id,
        x.year_xp,
        ROW_NUMBER() OVER (
          PARTITION BY p.role, p.level
          ORDER BY x.year_xp DESC, x.last_activity_at ASC
        ) AS r
      FROM public.user_xp_summary x
      JOIN public.profiles p ON p.id = x.user_id
      WHERE x.year_xp > 0
        AND p.role IS NOT NULL
        AND p.level IS NOT NULL
    )
    SELECT * FROM ranked WHERE r = 1
  LOOP
    -- Championship kaydı
    INSERT INTO public.championships (
      championship_type, year, period_number, role, level_tier,
      user_id, snapshot_xp
    )
    VALUES ('yearly', v_prev_year, 1, v_winner.role, v_winner.level_tier,
            v_winner.user_id, v_winner.year_xp)
    ON CONFLICT (championship_type, year, period_number, role, level_tier)
      DO NOTHING;
    v_champ_count := v_champ_count + 1;

    -- yearly_champion badge auto-award (legendary)
    INSERT INTO public.user_badges (user_id, badge_id)
    SELECT v_winner.user_id, b.id
      FROM public.badges b
     WHERE b.code = 'yearly_champion' AND b.is_active = true
    ON CONFLICT (user_id, badge_id) DO NOTHING;

    -- Premium gift: 1 yıl uzat (mevcut > now ise üzerine ekle)
    UPDATE public.profiles
       SET premium_until = GREATEST(
             COALESCE(premium_until, now()),
             now()
           ) + INTERVAL '1 year'
     WHERE id = v_winner.user_id;
    v_premium_count := v_premium_count + 1;

    -- Revenue event audit (admin görsün, MRR analitiği)
    BEGIN
      INSERT INTO public.revenue_events (
        user_id, event_type, tier, amount_try, source, metadata
      )
      VALUES (
        v_winner.user_id, 'admin_grant', 'yearly', 0, 'promo',
        jsonb_build_object(
          'reason', 'yearly_champion',
          'year', v_prev_year,
          'role', v_winner.role,
          'level_tier', v_winner.level_tier
        )
      );
    EXCEPTION WHEN OTHERS THEN
      -- revenue_events tablosu yoksa veya CHECK fail ederse sessiz geç
      NULL;
    END;
  END LOOP;

  -- 3. Top 50 ödül (her rol×tier için)
  WITH ranked AS (
    SELECT
      p.role,
      p.level AS level_tier,
      p.id AS user_id,
      x.year_xp,
      ROW_NUMBER() OVER (
        PARTITION BY p.role, p.level
        ORDER BY x.year_xp DESC, x.last_activity_at ASC
      ) AS r
    FROM public.user_xp_summary x
    JOIN public.profiles p ON p.id = x.user_id
    WHERE x.year_xp > 0
      AND p.role IS NOT NULL
      AND p.level IS NOT NULL
  ),
  reward_rows AS (
    SELECT
      user_id,
      r,
      CASE
        WHEN r = 1 THEN 10000
        WHEN r BETWEEN 2 AND 3 THEN 5000
        WHEN r BETWEEN 4 AND 10 THEN 2000
        WHEN r BETWEEN 11 AND 50 THEN 500
        ELSE 0
      END AS coin_amount
    FROM ranked
    WHERE r <= 50
  )
  INSERT INTO public.league_rewards (
    user_id, season_id, group_id, rank, reward_type, reward_value
  )
  SELECT
    user_id, v_season_id, NULL, r, 'coin',
    jsonb_build_object(
      'amount', coin_amount,
      'period', 'yearly',
      'year', v_prev_year
    )
  FROM reward_rows
  WHERE coin_amount > 0;

  GET DIAGNOSTICS v_reward_count = ROW_COUNT;

  -- 4. year_xp reset
  UPDATE public.user_xp_summary SET year_xp = 0 WHERE year_xp > 0;

  RETURN jsonb_build_object(
    'ok', true,
    'year', v_prev_year,
    'season_id', v_season_id,
    'champions', v_champ_count,
    'rewards', v_reward_count,
    'premium_gifts', v_premium_count
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.rotate_yearly_championships() FROM public;
GRANT EXECUTE ON FUNCTION public.rotate_yearly_championships() TO service_role;

COMMENT ON FUNCTION public.rotate_yearly_championships() IS
  'Yıllık şampiyon (rol×tier #1) + top 50 coin + 1 yıl premium gift + year_xp reset.';

-- ─── pg_cron schedule — 1 Ocak 00:00 UTC ─────────────────────────────────
DO $outer$ BEGIN
  PERFORM cron.unschedule('league-yearly-rotation');
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
    PERFORM cron.schedule(
      'league-yearly-rotation',
      '0 0 1 1 *',
      $$ SELECT public.rotate_yearly_championships(); $$
    );
  ELSE
    PERFORM cron.schedule(
      'league-yearly-rotation',
      '0 0 1 1 *',
      format(
        $$ SELECT net.http_post(
            url := %L,
            headers := jsonb_build_object('Authorization', 'Bearer ' || %L, 'Content-Type', 'application/json'),
            body := '{"period":"yearly"}'::jsonb
          ); $$,
        replace(replace(v_url, '"', ''), 'league-weekly-rotation', 'league-yearly-rotation'),
        replace(v_token, '"', '')
      )
    );
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'yearly cron schedule skipped: %', SQLERRM;
END $outer$;

DO $$ BEGIN
  RAISE NOTICE 'Sprint 4D — rotate_yearly_championships RPC + cron aktif';
END $$;

COMMIT;
