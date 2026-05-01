-- ============================================================================
-- Sprint 4A — Lig altyapısı + XP/streak/progress source-of-truth
-- ============================================================================
-- 8 tablo: user_xp_summary, streaks, user_lesson_progress + 5 league_*
-- RLS: own read + admin read; league public read (leaderboard).
-- Trigger: bump_user_xp RPC (mobile çağırır), sync_league_membership.
-- Period reset: edge function cron (Sprint 4B), trigger sadece increment.
-- ============================================================================

BEGIN;

-- ─── 0. Enums ──────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE league_class AS ENUM (
    'bronze', 'silver', 'gold', 'sapphire', 'ruby', 'emerald', 'diamond'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE league_season_type AS ENUM ('weekly', 'monthly', 'yearly');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE league_promotion_status AS ENUM ('promoted', 'demoted', 'stable', 'pending');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── 1. user_xp_summary (DB source of truth) ───────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_xp_summary (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp int NOT NULL DEFAULT 0 CHECK (total_xp >= 0),
  week_xp int NOT NULL DEFAULT 0 CHECK (week_xp >= 0),
  month_xp int NOT NULL DEFAULT 0 CHECK (month_xp >= 0),
  year_xp int NOT NULL DEFAULT 0 CHECK (year_xp >= 0),
  last_activity_at timestamptz,
  -- Period sync için cron tarafından okunup karşılaştırılır
  current_iso_week int,
  current_year_month text,
  current_year smallint,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS user_xp_total_idx
  ON public.user_xp_summary (total_xp DESC);
CREATE INDEX IF NOT EXISTS user_xp_week_idx
  ON public.user_xp_summary (week_xp DESC) WHERE week_xp > 0;
CREATE INDEX IF NOT EXISTS user_xp_last_activity_idx
  ON public.user_xp_summary (last_activity_at DESC NULLS LAST);

-- ─── 2. streaks ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.streaks (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak int NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
  longest_streak int NOT NULL DEFAULT 0 CHECK (longest_streak >= 0),
  last_activity_date date,
  frozen_until date,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS streaks_current_idx
  ON public.streaks (current_streak DESC) WHERE current_streak > 0;

-- ─── 3. user_lesson_progress ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_lesson_progress (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed_at timestamptz NOT NULL DEFAULT now(),
  score int NOT NULL DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
  attempts int NOT NULL DEFAULT 1 CHECK (attempts >= 1),
  time_spent int CHECK (time_spent IS NULL OR time_spent >= 0),
  is_perfect boolean GENERATED ALWAYS AS (score = 100) STORED,
  xp_awarded int NOT NULL DEFAULT 0 CHECK (xp_awarded >= 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, lesson_id)
);
CREATE INDEX IF NOT EXISTS ulp_user_completed_idx
  ON public.user_lesson_progress (user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS ulp_user_perfect_idx
  ON public.user_lesson_progress (user_id) WHERE is_perfect = true;

-- ─── 4. league_seasons ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.league_seasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_type league_season_type NOT NULL,
  year smallint NOT NULL CHECK (year BETWEEN 2025 AND 2200),
  period_number smallint NOT NULL CHECK (period_number BETWEEN 1 AND 53),
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  closed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_date >= start_date),
  UNIQUE (season_type, year, period_number)
);
CREATE INDEX IF NOT EXISTS league_seasons_status_idx
  ON public.league_seasons (status, season_type) WHERE status = 'active';

-- ─── 5. league_groups ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.league_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id uuid NOT NULL REFERENCES public.league_seasons(id) ON DELETE CASCADE,
  role text CHECK (role IN ('pilot', 'cabin', 'technician', 'ground', 'student', 'all')),
  level_tier text CHECK (level_tier IS NULL OR level_tier IN ('A1', 'A2', 'B1', 'B2', 'C1')),
  class_tier league_class NOT NULL,
  member_count int NOT NULL DEFAULT 0 CHECK (member_count >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS league_groups_season_idx
  ON public.league_groups (season_id, role, level_tier, class_tier);

-- ─── 6. league_memberships ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.league_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.league_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_xp int NOT NULL DEFAULT 0 CHECK (week_xp >= 0),
  rank int CHECK (rank IS NULL OR rank >= 1),
  promotion_status league_promotion_status NOT NULL DEFAULT 'pending',
  joined_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (group_id, user_id)
);
CREATE INDEX IF NOT EXISTS league_memberships_user_idx
  ON public.league_memberships (user_id);
CREATE INDEX IF NOT EXISTS league_memberships_group_xp_idx
  ON public.league_memberships (group_id, week_xp DESC);

-- ─── 7. league_rewards ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.league_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  season_id uuid NOT NULL REFERENCES public.league_seasons(id) ON DELETE CASCADE,
  group_id uuid REFERENCES public.league_groups(id) ON DELETE SET NULL,
  rank int CHECK (rank IS NULL OR rank >= 1),
  reward_type text NOT NULL CHECK (reward_type IN (
    'coin', 'badge', 'promotion', 'demotion_safe', 'championship'
  )),
  reward_value jsonb,
  granted_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS league_rewards_user_idx
  ON public.league_rewards (user_id, granted_at DESC);
CREATE INDEX IF NOT EXISTS league_rewards_season_idx
  ON public.league_rewards (season_id);

-- ─── 8. championships ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.championships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  championship_type league_season_type NOT NULL,
  year smallint NOT NULL,
  period_number smallint NOT NULL,
  role text CHECK (role IN ('pilot', 'cabin', 'technician', 'ground', 'student', 'all')),
  level_tier text CHECK (level_tier IS NULL OR level_tier IN ('A1','A2','B1','B2','C1')),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot_xp int NOT NULL CHECK (snapshot_xp >= 0),
  awarded_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (championship_type, year, period_number, role, level_tier)
);
CREATE INDEX IF NOT EXISTS championships_user_idx
  ON public.championships (user_id, awarded_at DESC);

-- ─── 9. profiles — current/highest league class ──────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS current_league_class league_class,
  ADD COLUMN IF NOT EXISTS highest_league_class league_class;

CREATE INDEX IF NOT EXISTS profiles_league_class_idx
  ON public.profiles (current_league_class) WHERE current_league_class IS NOT NULL;

-- ─── 10. updated_at trigger 8 yeni tabloya ───────────────────────────────
DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY[
    'user_xp_summary', 'streaks', 'user_lesson_progress',
    'league_memberships'
  ]
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON public.%I', t);
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()',
      t
    );
  END LOOP;
END $$;

-- ─── 11. RLS ──────────────────────────────────────────────────────────────
-- own_read + admin pattern for personal tables
DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['user_xp_summary', 'streaks', 'user_lesson_progress']
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);

    EXECUTE format('DROP POLICY IF EXISTS "%s own_read" ON public.%I', t, t);
    EXECUTE format($f$
      CREATE POLICY "%s own_read" ON public.%I
        FOR SELECT USING (user_id = auth.uid() OR public.is_admin_user())
    $f$, t, t);

    EXECUTE format('DROP POLICY IF EXISTS "%s own_write" ON public.%I', t, t);
    EXECUTE format($f$
      CREATE POLICY "%s own_write" ON public.%I
        FOR INSERT WITH CHECK (user_id = auth.uid() OR public.is_admin_user())
    $f$, t, t);

    EXECUTE format('DROP POLICY IF EXISTS "%s own_update" ON public.%I', t, t);
    EXECUTE format($f$
      CREATE POLICY "%s own_update" ON public.%I
        FOR UPDATE USING (user_id = auth.uid() OR public.is_admin_user())
                     WITH CHECK (user_id = auth.uid() OR public.is_admin_user())
    $f$, t, t);

    EXECUTE format('DROP POLICY IF EXISTS "%s super_delete" ON public.%I', t, t);
    EXECUTE format($f$
      CREATE POLICY "%s super_delete" ON public.%I
        FOR DELETE USING (public.has_admin_role('super_admin'))
    $f$, t, t);
  END LOOP;
END $$;

-- League tables: public read (leaderboard), system write (admin)
DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY[
    'league_seasons', 'league_groups', 'league_memberships',
    'league_rewards', 'championships'
  ]
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);

    EXECUTE format('DROP POLICY IF EXISTS "%s public_read" ON public.%I', t, t);
    EXECUTE format($f$
      CREATE POLICY "%s public_read" ON public.%I
        FOR SELECT USING (true)
    $f$, t, t);

    -- Insert/update sadece admin (cron edge function service_role kullanır, RLS bypass)
    EXECUTE format('DROP POLICY IF EXISTS "%s admin_write" ON public.%I', t, t);
    EXECUTE format($f$
      CREATE POLICY "%s admin_write" ON public.%I
        FOR INSERT WITH CHECK (public.has_admin_role('editor'))
    $f$, t, t);

    EXECUTE format('DROP POLICY IF EXISTS "%s admin_update" ON public.%I', t, t);
    EXECUTE format($f$
      CREATE POLICY "%s admin_update" ON public.%I
        FOR UPDATE USING (public.has_admin_role('editor'))
                     WITH CHECK (public.has_admin_role('editor'))
    $f$, t, t);

    EXECUTE format('DROP POLICY IF EXISTS "%s super_delete" ON public.%I', t, t);
    EXECUTE format($f$
      CREATE POLICY "%s super_delete" ON public.%I
        FOR DELETE USING (public.has_admin_role('super_admin'))
    $f$, t, t);
  END LOOP;
END $$;

-- ─── 12. bump_user_xp RPC ────────────────────────────────────────────────
-- Mobile bir ders tamamladığında çağırır:
--   - user_lesson_progress upsert (best score, attempts++, completed_at)
--   - user_xp_summary increment (total + week + month + year)
--   - streaks update (last_activity_date, current/longest)
-- Period reset YAPMAZ — onu cron yapar (Pazartesi 00:00 UTC, ay başı, yıl başı).
CREATE OR REPLACE FUNCTION public.bump_user_xp(
  p_lesson_id uuid,
  p_score int,
  p_xp int,
  p_time_spent int DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_today date := (now() AT TIME ZONE 'UTC')::date;
  v_iso_week int := EXTRACT(WEEK FROM (now() AT TIME ZONE 'UTC'))::int;
  v_year_month text := to_char((now() AT TIME ZONE 'UTC'), 'YYYY-MM');
  v_year smallint := EXTRACT(YEAR FROM (now() AT TIME ZONE 'UTC'))::smallint;
  v_streak record;
  v_new_streak int;
BEGIN
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'no_auth');
  END IF;
  IF p_score < 0 OR p_score > 100 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_score');
  END IF;
  IF p_xp < 0 OR p_xp > 10000 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_xp');
  END IF;

  -- 1. user_lesson_progress upsert (best score, attempts++)
  INSERT INTO public.user_lesson_progress (
    user_id, lesson_id, completed_at, score, attempts, time_spent, xp_awarded
  )
  VALUES (v_user, p_lesson_id, now(), p_score, 1, p_time_spent, p_xp)
  ON CONFLICT (user_id, lesson_id) DO UPDATE
    SET completed_at = EXCLUDED.completed_at,
        score = GREATEST(user_lesson_progress.score, EXCLUDED.score),
        attempts = user_lesson_progress.attempts + 1,
        time_spent = EXCLUDED.time_spent,
        xp_awarded = user_lesson_progress.xp_awarded + EXCLUDED.xp_awarded,
        updated_at = now();

  -- 2. user_xp_summary increment
  INSERT INTO public.user_xp_summary (
    user_id, total_xp, week_xp, month_xp, year_xp,
    last_activity_at, current_iso_week, current_year_month, current_year
  )
  VALUES (
    v_user, p_xp, p_xp, p_xp, p_xp,
    now(), v_iso_week, v_year_month, v_year
  )
  ON CONFLICT (user_id) DO UPDATE
    SET total_xp = user_xp_summary.total_xp + p_xp,
        week_xp = user_xp_summary.week_xp + p_xp,
        month_xp = user_xp_summary.month_xp + p_xp,
        year_xp = user_xp_summary.year_xp + p_xp,
        last_activity_at = now(),
        current_iso_week = v_iso_week,
        current_year_month = v_year_month,
        current_year = v_year,
        updated_at = now();

  -- 3. streak update
  SELECT * INTO v_streak FROM public.streaks WHERE user_id = v_user;
  IF v_streak IS NULL THEN
    v_new_streak := 1;
    INSERT INTO public.streaks (user_id, current_streak, longest_streak, last_activity_date)
    VALUES (v_user, 1, 1, v_today);
  ELSE
    IF v_streak.last_activity_date = v_today THEN
      v_new_streak := v_streak.current_streak;
    ELSIF v_streak.last_activity_date = v_today - 1
       OR v_streak.frozen_until >= v_today
    THEN
      v_new_streak := v_streak.current_streak + 1;
    ELSE
      v_new_streak := 1;
    END IF;
    UPDATE public.streaks
       SET current_streak = v_new_streak,
           longest_streak = GREATEST(v_streak.longest_streak, v_new_streak),
           last_activity_date = v_today,
           updated_at = now()
     WHERE user_id = v_user;
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'lesson_id', p_lesson_id,
    'xp_awarded', p_xp,
    'current_streak', v_new_streak
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.bump_user_xp(uuid, int, int, int) FROM public;
GRANT EXECUTE ON FUNCTION public.bump_user_xp(uuid, int, int, int) TO authenticated;

COMMENT ON FUNCTION public.bump_user_xp(uuid, int, int, int) IS
  'Mobile lesson tamamlandığında çağırır — progress upsert + xp increment + streak. Period reset: cron.';

-- ─── 13. sync_league_membership trigger ──────────────────────────────────
-- user_xp_summary.week_xp UPDATE'inde aktif user'ın aktif weekly membership'i
-- varsa week_xp sync edilir. League assignment Sprint 4B'de eklenecek;
-- şimdilik forward-compatible no-op (membership yoksa hiçbir şey olmaz).
CREATE OR REPLACE FUNCTION public.sync_league_membership_week_xp()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.week_xp IS DISTINCT FROM OLD.week_xp THEN
    UPDATE public.league_memberships m
       SET week_xp = NEW.week_xp,
           updated_at = now()
      FROM public.league_groups g
      JOIN public.league_seasons s ON s.id = g.season_id
     WHERE m.group_id = g.id
       AND m.user_id = NEW.user_id
       AND s.season_type = 'weekly'
       AND s.status = 'active';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_league_week_xp ON public.user_xp_summary;
CREATE TRIGGER sync_league_week_xp
  AFTER UPDATE ON public.user_xp_summary
  FOR EACH ROW EXECUTE FUNCTION public.sync_league_membership_week_xp();

-- ─── 14. profile current_league_class auto-update ────────────────────────
-- league_memberships INSERT/UPDATE → kullanıcının current_league_class
-- güncellenir (active weekly membership grup class_tier'ından).
-- highest_league_class GREATEST mantığı: enum sırası (bronze<...<diamond)
CREATE OR REPLACE FUNCTION public.sync_profile_league_class()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_class league_class;
  v_current league_class;
  v_highest league_class;
BEGIN
  SELECT g.class_tier INTO v_class
    FROM public.league_groups g
    JOIN public.league_seasons s ON s.id = g.season_id
   WHERE g.id = NEW.group_id
     AND s.season_type = 'weekly'
     AND s.status = 'active';

  IF v_class IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT current_league_class, highest_league_class
    INTO v_current, v_highest
    FROM public.profiles
   WHERE id = NEW.user_id;

  UPDATE public.profiles
     SET current_league_class = v_class,
         highest_league_class = CASE
           WHEN v_highest IS NULL THEN v_class
           WHEN v_class > v_highest THEN v_class
           ELSE v_highest
         END
   WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_profile_league_class_trigger ON public.league_memberships;
CREATE TRIGGER sync_profile_league_class_trigger
  AFTER INSERT OR UPDATE OF group_id ON public.league_memberships
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile_league_class();

DO $$ BEGIN
  RAISE NOTICE 'Sprint 4A — 8 tablo + 2 enum + bump_user_xp RPC + 2 trigger aktif';
END $$;

COMMIT;
