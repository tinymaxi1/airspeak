-- AirSpeak — Sprint 3e.A — Detaylı istatistik altyapısı
--
-- Views (RLS source-table'a güvenir):
-- - weekly_user_stats: user_id, week_start, lessons, xp, accuracy_avg, minutes
-- - monthly_user_stats: user_id, month_start, lessons, xp, accuracy_avg, minutes
--
-- RPC (SECURITY DEFINER, auth.uid filter):
-- - user_hourly_activity(p_user_id, p_tz, p_days): 24h heatmap
-- - user_dow_activity(p_user_id, p_tz, p_days): 7-day-of-week dağılımı
-- - get_peer_comparison(p_user_id): role+level grubunda percentile
-- - get_user_goals_progress(p_user_id): bu hafta XP / bu ay lesson hedeflerine ne kadar
--
-- profiles ek kolonlar:
-- - weekly_goal_xp (default 1000)
-- - monthly_goal_lessons (default 30)

BEGIN;

-- ─── 1. profiles: goal kolonları ────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS weekly_goal_xp int NOT NULL DEFAULT 1000
    CHECK (weekly_goal_xp >= 0 AND weekly_goal_xp <= 100000),
  ADD COLUMN IF NOT EXISTS monthly_goal_lessons int NOT NULL DEFAULT 30
    CHECK (monthly_goal_lessons >= 0 AND monthly_goal_lessons <= 1000);

COMMENT ON COLUMN public.profiles.weekly_goal_xp IS '3e.C: kullanıcının haftalık XP hedefi';
COMMENT ON COLUMN public.profiles.monthly_goal_lessons IS '3e.C: kullanıcının aylık ders hedefi';

-- ─── 2. app_config: admin default değiştirebilir ────────────────────────
INSERT INTO public.app_config (key, value, description, category, data_type)
VALUES
  ('goals.default_weekly_xp', '1000'::jsonb,
   'Yeni kullanıcı default haftalık XP hedefi', 'general', 'number'),
  ('goals.default_monthly_lessons', '30'::jsonb,
   'Yeni kullanıcı default aylık ders hedefi', 'general', 'number')
ON CONFLICT (key) DO NOTHING;

-- ─── 3. weekly_user_stats VIEW ──────────────────────────────────────────
CREATE OR REPLACE VIEW public.weekly_user_stats AS
SELECT
  user_id,
  date_trunc('week', completed_at)::date AS week_start,
  COUNT(*) AS lessons_count,
  COUNT(*) FILTER (WHERE is_perfect) AS perfect_count,
  COALESCE(SUM(xp_awarded), 0)::int AS total_xp,
  ROUND(AVG(score)::numeric, 1) AS accuracy_avg,
  COALESCE(SUM(time_spent), 0) AS total_seconds
FROM public.user_lesson_progress
GROUP BY user_id, week_start;

GRANT SELECT ON public.weekly_user_stats TO authenticated;

-- ─── 4. monthly_user_stats VIEW ─────────────────────────────────────────
CREATE OR REPLACE VIEW public.monthly_user_stats AS
SELECT
  user_id,
  date_trunc('month', completed_at)::date AS month_start,
  COUNT(*) AS lessons_count,
  COUNT(*) FILTER (WHERE is_perfect) AS perfect_count,
  COALESCE(SUM(xp_awarded), 0)::int AS total_xp,
  ROUND(AVG(score)::numeric, 1) AS accuracy_avg,
  COALESCE(SUM(time_spent), 0) AS total_seconds
FROM public.user_lesson_progress
GROUP BY user_id, month_start;

GRANT SELECT ON public.monthly_user_stats TO authenticated;

-- ─── 5. user_hourly_activity RPC (24h heatmap, timezone-aware) ──────────
CREATE OR REPLACE FUNCTION public.user_hourly_activity(
  p_user_id uuid DEFAULT NULL,
  p_tz text DEFAULT 'UTC',
  p_days int DEFAULT 90
) RETURNS TABLE (hour int, lessons_count bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $hourly$
  WITH series AS (
    SELECT generate_series(0, 23) AS hour
  ),
  agg AS (
    SELECT
      EXTRACT(HOUR FROM completed_at AT TIME ZONE p_tz)::int AS hour,
      COUNT(*) AS lessons_count
    FROM public.user_lesson_progress
    WHERE user_id = COALESCE(p_user_id, auth.uid())
      AND completed_at > now() - (p_days || ' days')::interval
    GROUP BY 1
  )
  SELECT s.hour, COALESCE(a.lessons_count, 0) AS lessons_count
  FROM series s
  LEFT JOIN agg a ON a.hour = s.hour
  ORDER BY s.hour;
$hourly$;

GRANT EXECUTE ON FUNCTION public.user_hourly_activity(uuid, text, int) TO authenticated;

-- ─── 6. user_dow_activity RPC (7-day-of-week, ISODOW: 1=Mon, 7=Sun) ─────
CREATE OR REPLACE FUNCTION public.user_dow_activity(
  p_user_id uuid DEFAULT NULL,
  p_tz text DEFAULT 'UTC',
  p_days int DEFAULT 90
) RETURNS TABLE (dow int, lessons_count bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $dow$
  WITH series AS (
    SELECT generate_series(1, 7) AS dow
  ),
  agg AS (
    SELECT
      EXTRACT(ISODOW FROM completed_at AT TIME ZONE p_tz)::int AS dow,
      COUNT(*) AS lessons_count
    FROM public.user_lesson_progress
    WHERE user_id = COALESCE(p_user_id, auth.uid())
      AND completed_at > now() - (p_days || ' days')::interval
    GROUP BY 1
  )
  SELECT s.dow, COALESCE(a.lessons_count, 0) AS lessons_count
  FROM series s
  LEFT JOIN agg a ON a.dow = s.dow
  ORDER BY s.dow;
$dow$;

GRANT EXECUTE ON FUNCTION public.user_dow_activity(uuid, text, int) TO authenticated;

-- ─── 7. get_peer_comparison RPC (role+level percentile) ─────────────────
-- SECURITY DEFINER ile RLS bypass — pencere fonksiyonu doğru hesaplansın.
-- Yalnız kullanıcının kendi sonucu döner; diğer satırlar internal.
CREATE OR REPLACE FUNCTION public.get_peer_comparison(
  p_user_id uuid DEFAULT NULL
) RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $peer$
  WITH base AS (
    SELECT
      p.id, p.role, p.level,
      COALESCE(uxs.week_xp, 0) AS week_xp,
      COALESCE(uxs.total_xp, 0) AS total_xp,
      COALESCE(s.current_streak, 0) AS current_streak
    FROM public.profiles p
    LEFT JOIN public.user_xp_summary uxs ON uxs.user_id = p.id
    LEFT JOIN public.streaks s ON s.user_id = p.id
    WHERE p.role IS NOT NULL AND p.level IS NOT NULL
  ),
  ranked AS (
    SELECT
      base.*,
      COUNT(*) OVER (PARTITION BY role, level) AS peer_count,
      PERCENT_RANK() OVER (PARTITION BY role, level ORDER BY week_xp) AS week_xp_pct,
      PERCENT_RANK() OVER (PARTITION BY role, level ORDER BY total_xp) AS total_xp_pct,
      PERCENT_RANK() OVER (PARTITION BY role, level ORDER BY current_streak) AS streak_pct
    FROM base
  )
  SELECT jsonb_build_object(
    'role', role,
    'level', level,
    'peer_count', peer_count,
    'week_xp', week_xp,
    'week_xp_percentile', ROUND((week_xp_pct * 100)::numeric, 1),
    'total_xp', total_xp,
    'total_xp_percentile', ROUND((total_xp_pct * 100)::numeric, 1),
    'current_streak', current_streak,
    'streak_percentile', ROUND((streak_pct * 100)::numeric, 1)
  )
  FROM ranked
  WHERE id = COALESCE(p_user_id, auth.uid())
  LIMIT 1;
$peer$;

GRANT EXECUTE ON FUNCTION public.get_peer_comparison(uuid) TO authenticated;

-- ─── 8. get_user_goals_progress RPC ─────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_user_goals_progress(
  p_user_id uuid DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $goals$
DECLARE
  v_uid uuid := COALESCE(p_user_id, auth.uid());
  v_daily_goal int;
  v_weekly_goal int;
  v_monthly_goal int;
  v_today_minutes int;
  v_week_xp int;
  v_month_lessons int;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated');
  END IF;

  SELECT daily_goal_minutes, weekly_goal_xp, monthly_goal_lessons
    INTO v_daily_goal, v_weekly_goal, v_monthly_goal
  FROM public.profiles WHERE id = v_uid;

  -- Günlük: bugün toplam dakika (lesson_progress time_spent)
  SELECT COALESCE(SUM(time_spent) / 60, 0)::int INTO v_today_minutes
  FROM public.user_lesson_progress
  WHERE user_id = v_uid AND completed_at::date = current_date;

  -- Haftalık: bu hafta XP (date_trunc 'week')
  SELECT COALESCE(SUM(xp_awarded), 0)::int INTO v_week_xp
  FROM public.user_lesson_progress
  WHERE user_id = v_uid
    AND completed_at >= date_trunc('week', current_timestamp);

  -- Aylık: bu ay ders sayısı
  SELECT COUNT(*)::int INTO v_month_lessons
  FROM public.user_lesson_progress
  WHERE user_id = v_uid
    AND completed_at >= date_trunc('month', current_timestamp);

  RETURN jsonb_build_object(
    'daily_goal_minutes', v_daily_goal,
    'today_minutes', v_today_minutes,
    'daily_progress_pct', CASE WHEN v_daily_goal > 0 THEN
      LEAST(100, ROUND((v_today_minutes::numeric / v_daily_goal) * 100, 1)) ELSE 0 END,
    'weekly_goal_xp', v_weekly_goal,
    'week_xp', v_week_xp,
    'weekly_progress_pct', CASE WHEN v_weekly_goal > 0 THEN
      LEAST(100, ROUND((v_week_xp::numeric / v_weekly_goal) * 100, 1)) ELSE 0 END,
    'monthly_goal_lessons', v_monthly_goal,
    'month_lessons', v_month_lessons,
    'monthly_progress_pct', CASE WHEN v_monthly_goal > 0 THEN
      LEAST(100, ROUND((v_month_lessons::numeric / v_monthly_goal) * 100, 1)) ELSE 0 END
  );
END;
$goals$;

GRANT EXECUTE ON FUNCTION public.get_user_goals_progress(uuid) TO authenticated;

-- ─── 9. update_user_goals RPC ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_user_goals(
  p_daily_minutes int DEFAULT NULL,
  p_weekly_xp int DEFAULT NULL,
  p_monthly_lessons int DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $upd_goals$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated');
  END IF;
  -- Clamp
  IF p_daily_minutes IS NOT NULL AND (p_daily_minutes < 5 OR p_daily_minutes > 240) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'daily_minutes_5_240');
  END IF;
  IF p_weekly_xp IS NOT NULL AND (p_weekly_xp < 0 OR p_weekly_xp > 100000) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'weekly_xp_0_100k');
  END IF;
  IF p_monthly_lessons IS NOT NULL AND (p_monthly_lessons < 0 OR p_monthly_lessons > 1000) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'monthly_lessons_0_1000');
  END IF;

  UPDATE public.profiles SET
    daily_goal_minutes = COALESCE(p_daily_minutes, daily_goal_minutes),
    weekly_goal_xp = COALESCE(p_weekly_xp, weekly_goal_xp),
    monthly_goal_lessons = COALESCE(p_monthly_lessons, monthly_goal_lessons)
  WHERE id = v_uid;
  RETURN jsonb_build_object('ok', true);
END;
$upd_goals$;

GRANT EXECUTE ON FUNCTION public.update_user_goals(int, int, int) TO authenticated;

DO $$ BEGIN
  RAISE NOTICE 'Sprint 3e.A — weekly/monthly views + 4 RPC + goal kolonları aktif';
END $$;

COMMIT;
