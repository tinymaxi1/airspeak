-- ============================================================================
-- Sprint 4B.1 — Haftalık lig rotation altyapısı
-- ============================================================================
-- pg_cron + pg_net extensions
-- assign_user_to_league + rotate_league_season + start_new_weekly_season RPCs
-- bump_user_xp lazy assign güncelleme
-- 9 yeni badge seed (weekly/monthly/yearly champion + 6 promotion)
-- pg_cron schedule: Pazartesi 00:00 UTC → Edge Function tetikler
-- ============================================================================

BEGIN;

-- ─── 1. Extensions ────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- ─── 2. Helper: enum next/prev class ──────────────────────────────────────
CREATE OR REPLACE FUNCTION public.next_league_class(p_class league_class)
RETURNS league_class
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE p_class
    WHEN 'bronze'   THEN 'silver'::league_class
    WHEN 'silver'   THEN 'gold'::league_class
    WHEN 'gold'     THEN 'sapphire'::league_class
    WHEN 'sapphire' THEN 'ruby'::league_class
    WHEN 'ruby'     THEN 'emerald'::league_class
    WHEN 'emerald'  THEN 'diamond'::league_class
    WHEN 'diamond'  THEN 'diamond'::league_class
  END
$$;

CREATE OR REPLACE FUNCTION public.prev_league_class(p_class league_class)
RETURNS league_class
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE p_class
    WHEN 'diamond'  THEN 'emerald'::league_class
    WHEN 'emerald'  THEN 'ruby'::league_class
    WHEN 'ruby'     THEN 'sapphire'::league_class
    WHEN 'sapphire' THEN 'gold'::league_class
    WHEN 'gold'     THEN 'silver'::league_class
    WHEN 'silver'   THEN 'bronze'::league_class
    WHEN 'bronze'   THEN 'bronze'::league_class
  END
$$;

-- ─── 3. assign_user_to_league RPC ─────────────────────────────────────────
-- Mobile bump_user_xp lazy çağırır + admin manuel kullanır.
-- Aktif weekly season altında uygun grup bulur veya oluşturur.
-- Capacity: 50 (dolarsa yeni grup açılır).
-- Free passive user lig dışı: bu RPC yalnız bump_user_xp veya manuel admin'den
-- çağrıldığında atan; profile INSERT'te otomatik trigger yok.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.assign_user_to_league(
  p_user_id uuid DEFAULT NULL,
  p_default_class league_class DEFAULT 'bronze'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := COALESCE(p_user_id, auth.uid());
  v_role text;
  v_level text;
  v_level_tier text;
  v_class league_class;
  v_active_season uuid;
  v_target_group uuid;
  v_existing uuid;
BEGIN
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'no_user');
  END IF;

  -- Aktif weekly season
  SELECT id INTO v_active_season
    FROM public.league_seasons
   WHERE season_type = 'weekly' AND status = 'active'
   LIMIT 1;

  IF v_active_season IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'no_active_season');
  END IF;

  -- Önceden membership var mı?
  SELECT m.id INTO v_existing
    FROM public.league_memberships m
    JOIN public.league_groups g ON g.id = m.group_id
   WHERE m.user_id = v_user
     AND g.season_id = v_active_season;

  IF v_existing IS NOT NULL THEN
    RETURN jsonb_build_object('ok', true, 'membership_id', v_existing, 'created', false);
  END IF;

  -- Profil oku
  SELECT role, level, current_league_class
    INTO v_role, v_level, v_class
    FROM public.profiles WHERE id = v_user;

  v_class := COALESCE(v_class, p_default_class);
  v_level_tier := COALESCE(v_level, 'B1');

  -- Uygun grup ara — capacity dolmamış, en dolu olanı doldur
  SELECT id INTO v_target_group
    FROM public.league_groups
   WHERE season_id = v_active_season
     AND COALESCE(role, '_') = COALESCE(v_role, '_')
     AND COALESCE(level_tier, '_') = COALESCE(v_level_tier, '_')
     AND class_tier = v_class
     AND member_count < 50
   ORDER BY member_count DESC
   LIMIT 1;

  -- Yoksa yeni grup
  IF v_target_group IS NULL THEN
    INSERT INTO public.league_groups (season_id, role, level_tier, class_tier)
    VALUES (v_active_season, v_role, v_level_tier, v_class)
    RETURNING id INTO v_target_group;
  END IF;

  -- Membership oluştur (week_xp = mevcut user_xp_summary.week_xp ile başlar)
  INSERT INTO public.league_memberships (group_id, user_id, week_xp)
  VALUES (
    v_target_group, v_user,
    COALESCE((SELECT week_xp FROM public.user_xp_summary WHERE user_id = v_user), 0)
  )
  RETURNING id INTO v_existing;

  UPDATE public.league_groups
     SET member_count = member_count + 1
   WHERE id = v_target_group;

  RETURN jsonb_build_object(
    'ok', true,
    'membership_id', v_existing,
    'group_id', v_target_group,
    'class', v_class,
    'created', true
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.assign_user_to_league(uuid, league_class) FROM public;
GRANT EXECUTE ON FUNCTION public.assign_user_to_league(uuid, league_class) TO authenticated;

-- ─── 4. bump_user_xp lazy assignment + reward badge integration ──────────
-- Önceki bump_user_xp'yi DROP edip yeniden tanımla — lazy assign ekle.
DROP FUNCTION IF EXISTS public.bump_user_xp(uuid, int, int, int);

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
  v_has_membership boolean;
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

  -- 1. user_lesson_progress upsert
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

  -- 4. Lazy league assignment — aktif weekly season'da membership yoksa
  SELECT EXISTS (
    SELECT 1 FROM public.league_memberships m
    JOIN public.league_groups g ON g.id = m.group_id
    JOIN public.league_seasons s ON s.id = g.season_id
    WHERE m.user_id = v_user
      AND s.season_type = 'weekly'
      AND s.status = 'active'
  ) INTO v_has_membership;

  IF NOT v_has_membership THEN
    PERFORM public.assign_user_to_league(v_user);
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'lesson_id', p_lesson_id,
    'xp_awarded', p_xp,
    'current_streak', v_new_streak,
    'assigned', NOT v_has_membership
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.bump_user_xp(uuid, int, int, int) FROM public;
GRANT EXECUTE ON FUNCTION public.bump_user_xp(uuid, int, int, int) TO authenticated;

-- ─── 5. start_new_weekly_season — yeni hafta başlatır ────────────────────
-- Edge Function rotation sonunda çağırır.
-- Önceki season 'closed' olmalı, yeni 'active' season insert eder.
-- Pazartesi 00:00 UTC ile başlar, Pazar 23:59 UTC biter.
CREATE OR REPLACE FUNCTION public.start_new_weekly_season()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_today date := (now() AT TIME ZONE 'UTC')::date;
  v_year smallint := EXTRACT(YEAR FROM v_today)::smallint;
  v_iso_week int := EXTRACT(WEEK FROM v_today)::int;
  v_dow int := EXTRACT(ISODOW FROM v_today)::int; -- 1=Mon..7=Sun
  v_monday date := v_today - (v_dow - 1);
  v_sunday date := v_monday + 6;
  v_season_id uuid;
BEGIN
  INSERT INTO public.league_seasons (
    season_type, year, period_number, start_date, end_date, status
  )
  VALUES ('weekly', v_year, v_iso_week, v_monday, v_sunday, 'active')
  ON CONFLICT (season_type, year, period_number) DO UPDATE
    SET status = 'active',
        start_date = EXCLUDED.start_date,
        end_date = EXCLUDED.end_date
  RETURNING id INTO v_season_id;

  RETURN v_season_id;
END;
$$;

-- ─── 6. rotate_league_season RPC — atomik kapanış ────────────────────────
-- Top 3 ödül + promotion (top 10) + demotion (bottom 10) + new season +
-- redistribute aktif kullanıcılar + week_xp reset.
CREATE OR REPLACE FUNCTION public.rotate_active_weekly_league()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_season uuid;
  v_new_season uuid;
  v_group RECORD;
  v_member RECORD;
  v_total_members int;
  v_promo_count int := 0;
  v_demo_count int := 0;
  v_reward_count int := 0;
  v_redistributed int := 0;
  v_target_class league_class;
  v_user_default_class league_class;
BEGIN
  -- 1. Aktif weekly season bul
  SELECT id INTO v_old_season
    FROM public.league_seasons
   WHERE season_type = 'weekly' AND status = 'active'
   LIMIT 1;

  -- İlk rotation: aktif yoksa sadece yeni season başlat ve çık
  IF v_old_season IS NULL THEN
    v_new_season := public.start_new_weekly_season();
    RETURN jsonb_build_object(
      'ok', true,
      'first_run', true,
      'new_season_id', v_new_season
    );
  END IF;

  -- 2. Her grup için rank ata + ödül + promotion/demotion belirle
  FOR v_group IN
    SELECT * FROM public.league_groups WHERE season_id = v_old_season
  LOOP
    SELECT count(*) INTO v_total_members
      FROM public.league_memberships
     WHERE group_id = v_group.id;

    -- Rank ata, ödül, status
    WITH ranked AS (
      SELECT
        m.id,
        m.user_id,
        m.week_xp,
        ROW_NUMBER() OVER (ORDER BY m.week_xp DESC, m.joined_at ASC) AS r
      FROM public.league_memberships m
      WHERE m.group_id = v_group.id
    )
    UPDATE public.league_memberships m
       SET rank = ranked.r,
           promotion_status = CASE
             WHEN ranked.r <= 10 AND v_group.class_tier <> 'diamond' THEN 'promoted'::league_promotion_status
             WHEN ranked.r > GREATEST(0, v_total_members - 10) AND v_group.class_tier <> 'bronze' THEN 'demoted'::league_promotion_status
             ELSE 'stable'::league_promotion_status
           END,
           updated_at = now()
      FROM ranked
     WHERE m.id = ranked.id;

    -- Top 3 reward
    INSERT INTO public.league_rewards (user_id, season_id, group_id, rank, reward_type, reward_value)
    SELECT m.user_id, v_old_season, v_group.id, m.rank, 'coin'::text,
           CASE m.rank
             WHEN 1 THEN '{"amount": 500}'::jsonb
             WHEN 2 THEN '{"amount": 300}'::jsonb
             WHEN 3 THEN '{"amount": 200}'::jsonb
           END
      FROM public.league_memberships m
     WHERE m.group_id = v_group.id AND m.rank IN (1, 2, 3);

    -- Birinci weekly_champion badge
    INSERT INTO public.league_rewards (user_id, season_id, group_id, rank, reward_type, reward_value)
    SELECT m.user_id, v_old_season, v_group.id, 1, 'badge'::text,
           '{"code": "weekly_champion"}'::jsonb
      FROM public.league_memberships m
     WHERE m.group_id = v_group.id AND m.rank = 1;

    -- weekly_champion otomatik award
    INSERT INTO public.user_badges (user_id, badge_id)
    SELECT m.user_id, b.id
      FROM public.league_memberships m
      CROSS JOIN public.badges b
     WHERE m.group_id = v_group.id
       AND m.rank = 1
       AND b.code = 'weekly_champion'
       AND b.is_active = true
    ON CONFLICT (user_id, badge_id) DO NOTHING;

    GET DIAGNOSTICS v_reward_count = ROW_COUNT;

    -- Promotion/demotion sayaçları
    SELECT
      count(*) FILTER (WHERE promotion_status = 'promoted'),
      count(*) FILTER (WHERE promotion_status = 'demoted')
    INTO v_promo_count, v_demo_count
    FROM public.league_memberships
    WHERE group_id = v_group.id;
  END LOOP;

  -- 3. Eski season'ı kapat
  UPDATE public.league_seasons
     SET status = 'closed', closed_at = now()
   WHERE id = v_old_season;

  -- 4. Yeni season oluştur
  v_new_season := public.start_new_weekly_season();

  -- 5. Aktif kullanıcıları yeni season'a redistribute et
  -- (Önceki membership'in promotion_status ve class_tier'ına göre)
  FOR v_member IN
    SELECT m.user_id, m.promotion_status, g.class_tier, g.role, g.level_tier
      FROM public.league_memberships m
      JOIN public.league_groups g ON g.id = m.group_id
     WHERE g.season_id = v_old_season
  LOOP
    v_target_class := CASE v_member.promotion_status
      WHEN 'promoted' THEN public.next_league_class(v_member.class_tier)
      WHEN 'demoted'  THEN public.prev_league_class(v_member.class_tier)
      ELSE v_member.class_tier
    END;

    -- Promotion badge — ilk kez bu sınıfa yükseliyorsa
    IF v_member.promotion_status = 'promoted'
       AND v_target_class <> v_member.class_tier
    THEN
      INSERT INTO public.user_badges (user_id, badge_id)
      SELECT v_member.user_id, b.id
        FROM public.badges b
       WHERE b.code = 'promoted_to_' || v_target_class::text
         AND b.is_active = true
      ON CONFLICT (user_id, badge_id) DO NOTHING;
    END IF;

    PERFORM public.assign_user_to_league(v_member.user_id, v_target_class);
    v_redistributed := v_redistributed + 1;
  END LOOP;

  -- 6. Tüm user_xp_summary.week_xp = 0 reset
  UPDATE public.user_xp_summary SET week_xp = 0 WHERE week_xp > 0;

  RETURN jsonb_build_object(
    'ok', true,
    'old_season_id', v_old_season,
    'new_season_id', v_new_season,
    'promoted', v_promo_count,
    'demoted', v_demo_count,
    'redistributed', v_redistributed
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.rotate_active_weekly_league() FROM public;
GRANT EXECUTE ON FUNCTION public.rotate_active_weekly_league() TO service_role;

COMMENT ON FUNCTION public.rotate_active_weekly_league() IS
  'Haftalık lig kapanış — atomik. Edge Function veya admin manuel çağırır.';

-- ─── 7. Yeni rozet seed — 9 lig rozeti ────────────────────────────────────
INSERT INTO public.badges (
  code, name_tr, name_en, description_tr, description_en,
  icon_emoji, category, condition_type, condition_value, rarity, sort
) VALUES
  ('weekly_champion', 'Haftanın Birincisi', 'Weekly Champion',
   'Bir haftalık ligte 1. ol', 'Finish #1 in a weekly league',
   '🏆', 'league', 'custom', 1, 'rare', 100),
  ('monthly_champion', 'Ayın Birincisi', 'Monthly Champion',
   'Bir aylık şampiyonayı kazan', 'Win a monthly championship',
   '👑', 'league', 'custom', 1, 'epic', 110),
  ('yearly_champion', 'Yılın Birincisi', 'Yearly Champion',
   'Yıllık şampiyonayı kazan', 'Win the yearly championship',
   '⭐', 'league', 'custom', 1, 'legendary', 120),
  ('promoted_to_silver', 'Gümüşe Yükseldi', 'Promoted to Silver',
   'Gümüş sınıfa terfi et', 'Promote to Silver class',
   '🥈', 'league', 'custom', 1, 'common', 200),
  ('promoted_to_gold', 'Altına Yükseldi', 'Promoted to Gold',
   'Altın sınıfa terfi et', 'Promote to Gold class',
   '🥇', 'league', 'custom', 1, 'rare', 210),
  ('promoted_to_sapphire', 'Safire Yükseldi', 'Promoted to Sapphire',
   'Safir sınıfa terfi et', 'Promote to Sapphire class',
   '💙', 'league', 'custom', 1, 'rare', 220),
  ('promoted_to_ruby', 'Yakuta Yükseldi', 'Promoted to Ruby',
   'Yakut sınıfa terfi et', 'Promote to Ruby class',
   '❤️', 'league', 'custom', 1, 'epic', 230),
  ('promoted_to_emerald', 'Zümrüde Yükseldi', 'Promoted to Emerald',
   'Zümrüt sınıfa terfi et', 'Promote to Emerald class',
   '💚', 'league', 'custom', 1, 'epic', 240),
  ('promoted_to_diamond', 'Elmasa Yükseldi', 'Promoted to Diamond',
   'Elmas sınıfa terfi et', 'Promote to Diamond class',
   '💎', 'league', 'custom', 1, 'legendary', 250)
ON CONFLICT (code) DO NOTHING;

-- ─── 8. pg_cron schedule — Pazartesi 00:00 UTC ────────────────────────────
-- Edge Function URL'i app_config'ten okunur.
-- (Üretim Pro plan'da otomatik etkin; Free/dev'de manuel admin endpoint)
INSERT INTO public.app_config (key, value, description, category, data_type)
VALUES
  ('league.rotation_edge_url', '""'::jsonb,
   'Edge Function tam URL (örn https://xxx.supabase.co/functions/v1/league-weekly-rotation)',
   'general', 'string'),
  ('league.rotation_service_token', '""'::jsonb,
   'Service role token, cron Authorization header için',
   'general', 'string')
ON CONFLICT (key) DO NOTHING;

-- Cron job kaydı (opsiyonel — pg_cron + pg_net + config dolu ise çalışır)
DO $$
BEGIN
  -- Önceki schedule varsa unschedule
  PERFORM cron.unschedule('league-weekly-rotation');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
DECLARE
  v_url text;
  v_token text;
BEGIN
  SELECT value::text INTO v_url FROM public.app_config WHERE key = 'league.rotation_edge_url';
  SELECT value::text INTO v_token FROM public.app_config WHERE key = 'league.rotation_service_token';

  -- URL boş ise schedule kurma — fallback olarak SQL function'ı doğrudan çağır
  IF v_url IS NULL OR v_url = '""' OR length(v_url) < 5 THEN
    PERFORM cron.schedule(
      'league-weekly-rotation',
      '0 0 * * 1',  -- Pazartesi 00:00 UTC
      $$ SELECT public.rotate_active_weekly_league(); $$
    );
  ELSE
    -- URL doluysa pg_net ile Edge Function tetikle (push notification için)
    PERFORM cron.schedule(
      'league-weekly-rotation',
      '0 0 * * 1',
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
  -- pg_cron yoksa (Free tier) sessizce geç — manuel admin endpoint kullanılır
  RAISE NOTICE 'pg_cron schedule skipped: %', SQLERRM;
END $$;

DO $$ BEGIN
  RAISE NOTICE 'Sprint 4B.1 — pg_cron + 3 RPC + lazy assign + 9 badge seed aktif';
END $$;

COMMIT;
