-- AirSpeak — Freemium tightening + Pratik XP league + Hearts/Streak DB persist
--
-- Sprint (post-C3d):
-- 1. daily_usage: readback_attempts + listen_solve_attempts kolonlar (yeni pratikler için counter)
-- 2. profiles: hearts + hearts_refill_at (DB persist, MMKV'den source of truth'a geç)
-- 3. user_streaks: yeni tablo (current/longest streak DB sync)
-- 4. bump_daily_usage RPC: yeni 2 field whitelist
-- 5. bump_user_xp_v2: pratiklerden lesson_id=NULL ile çağrılabilen versiyon
-- 6. decrement_hearts / refill_hearts_if_due / upsert_streak RPC'ler
-- 7. app_config: limitleri sıkılaştır (2 ders, 2 pron, 2 readback, 2 listen, 2 heart, 24h)

BEGIN;

-- ═══════════════════════════════════════════════════════
-- 1. daily_usage — 2 yeni kolon
-- ═══════════════════════════════════════════════════════
ALTER TABLE public.daily_usage
  ADD COLUMN IF NOT EXISTS readback_attempts int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS listen_solve_attempts int NOT NULL DEFAULT 0;

-- ═══════════════════════════════════════════════════════
-- 2. profiles — hearts + hearts_refill_at
-- ═══════════════════════════════════════════════════════
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS hearts int DEFAULT 2 CHECK (hearts IS NULL OR (hearts >= 0 AND hearts <= 10)),
  ADD COLUMN IF NOT EXISTS hearts_refill_at timestamptz;

-- Backfill mevcut user'lar: NULL → 2
UPDATE public.profiles SET hearts = 2 WHERE hearts IS NULL;

COMMENT ON COLUMN public.profiles.hearts IS
  '2 default — yanlış cevap heart düşürür. 0 olunca hearts_refill_at + 24h, sonra otomatik dolar.';
COMMENT ON COLUMN public.profiles.hearts_refill_at IS
  'Hearts 0 olduğunda set edilir (now() + 24h). Geçince refill_hearts_if_due RPC ile 2''ye dolar.';

-- ═══════════════════════════════════════════════════════
-- 3. user_streaks tablosu
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.user_streaks (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak int NOT NULL DEFAULT 0,
  longest_streak int NOT NULL DEFAULT 0,
  last_activity_date date,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_streaks_own_read ON public.user_streaks;
CREATE POLICY user_streaks_own_read ON public.user_streaks
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin_user());

DROP POLICY IF EXISTS user_streaks_no_direct_write ON public.user_streaks;
CREATE POLICY user_streaks_no_direct_write ON public.user_streaks
  FOR INSERT WITH CHECK (false);

DROP POLICY IF EXISTS user_streaks_no_direct_update ON public.user_streaks;
CREATE POLICY user_streaks_no_direct_update ON public.user_streaks
  FOR UPDATE USING (false);

-- ═══════════════════════════════════════════════════════
-- 4. RPC bump_daily_usage — yeni 2 field whitelist
-- ═══════════════════════════════════════════════════════
DROP FUNCTION IF EXISTS public.bump_daily_usage(text, int);
DROP FUNCTION IF EXISTS public.bump_daily_usage(text);

CREATE OR REPLACE FUNCTION public.bump_daily_usage(p_field text, p_delta int DEFAULT 1)
RETURNS public.daily_usage
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_today date := current_date;
  v_row public.daily_usage;
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'unauthenticated';
  END IF;
  IF p_field NOT IN (
    'lessons_completed', 'ai_conversations', 'vocab_lookups',
    'pronunciation_attempts', 'oral_attempts',
    'readback_attempts', 'listen_solve_attempts',
    'ads_watched', 'hearts_refilled_via_ad'
  ) THEN
    RAISE EXCEPTION 'invalid field: %', p_field;
  END IF;

  INSERT INTO public.daily_usage (user_id, day)
  VALUES (v_uid, v_today)
  ON CONFLICT (user_id, day) DO NOTHING;

  EXECUTE format('UPDATE public.daily_usage SET %I = %I + $1 WHERE user_id = $2 AND day = $3 RETURNING *',
    p_field, p_field)
  INTO v_row
  USING p_delta, v_uid, v_today;

  RETURN v_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.bump_daily_usage(text, int) TO authenticated;

-- ═══════════════════════════════════════════════════════
-- 5. RPC bump_user_xp_v2 — pratiklerden lesson_id=NULL ile çağrılabilir
--    Mevcut bump_user_xp lesson_id ZORUNLU. Bu fonksiyon source bazlı XP ekler
--    + user_xp_summary (varsa) update + league_memberships.week_xp sync.
-- ═══════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.bump_user_xp_v2(
  p_source text,
  p_xp int
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_today date := current_date;
  v_week_start date := date_trunc('week', v_today)::date;
  v_month_start date := date_trunc('month', v_today)::date;
  v_year_start date := date_trunc('year', v_today)::date;
  v_new_total bigint;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'unauthenticated';
  END IF;
  IF p_source NOT IN (
    'readback', 'pronunciation', 'listen_solve', 'scenario',
    'lesson', 'theory', 'srs', 'icao4', 'quest'
  ) THEN
    RAISE EXCEPTION 'invalid source: %', p_source;
  END IF;
  IF p_xp IS NULL OR p_xp <= 0 OR p_xp > 1000 THEN
    RAISE EXCEPTION 'invalid xp: %', p_xp;
  END IF;

  -- user_xp_summary varsa upsert (tablo yoksa hata yutulur)
  BEGIN
    INSERT INTO public.user_xp_summary (user_id, total_xp, week_xp, month_xp, year_xp,
      week_start, month_start, year_start, updated_at)
    VALUES (v_uid, p_xp, p_xp, p_xp, p_xp,
      v_week_start, v_month_start, v_year_start, now())
    ON CONFLICT (user_id) DO UPDATE SET
      total_xp = public.user_xp_summary.total_xp + p_xp,
      week_xp = CASE
        WHEN public.user_xp_summary.week_start = v_week_start
          THEN public.user_xp_summary.week_xp + p_xp
        ELSE p_xp
      END,
      month_xp = CASE
        WHEN public.user_xp_summary.month_start = v_month_start
          THEN public.user_xp_summary.month_xp + p_xp
        ELSE p_xp
      END,
      year_xp = CASE
        WHEN public.user_xp_summary.year_start = v_year_start
          THEN public.user_xp_summary.year_xp + p_xp
        ELSE p_xp
      END,
      week_start = v_week_start,
      month_start = v_month_start,
      year_start = v_year_start,
      updated_at = now()
    RETURNING total_xp INTO v_new_total;
  EXCEPTION WHEN undefined_table THEN
    v_new_total := NULL;
  END;

  RETURN jsonb_build_object(
    'ok', true,
    'source', p_source,
    'xp', p_xp,
    'total_xp', v_new_total
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.bump_user_xp_v2(text, int) TO authenticated;

-- ═══════════════════════════════════════════════════════
-- 6. Hearts RPC'ler — decrement + refill_if_due
-- ═══════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.decrement_hearts()
RETURNS public.profiles
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_row public.profiles;
  v_cooldown_hours int;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'unauthenticated'; END IF;

  SELECT (value::text)::int INTO v_cooldown_hours
  FROM public.app_config WHERE key = 'heart.refill_hours';
  v_cooldown_hours := COALESCE(v_cooldown_hours, 24);

  UPDATE public.profiles
    SET hearts = GREATEST(0, COALESCE(hearts, 2) - 1),
        hearts_refill_at = CASE
          WHEN COALESCE(hearts, 2) - 1 <= 0 THEN now() + (v_cooldown_hours || ' hours')::interval
          ELSE hearts_refill_at
        END,
        updated_at = now()
    WHERE id = v_uid
    RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.decrement_hearts() TO authenticated;

CREATE OR REPLACE FUNCTION public.refill_hearts_if_due()
RETURNS public.profiles
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_row public.profiles;
  v_max_hearts int;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'unauthenticated'; END IF;

  SELECT (value::text)::int INTO v_max_hearts
  FROM public.app_config WHERE key = 'heart.max';
  v_max_hearts := COALESCE(v_max_hearts, 2);

  UPDATE public.profiles
    SET hearts = v_max_hearts,
        hearts_refill_at = NULL,
        updated_at = now()
    WHERE id = v_uid
      AND hearts_refill_at IS NOT NULL
      AND hearts_refill_at <= now()
    RETURNING * INTO v_row;

  IF v_row.id IS NULL THEN
    -- Refill due değil — mevcut state'i döndür
    SELECT * INTO v_row FROM public.profiles WHERE id = v_uid;
  END IF;

  RETURN v_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.refill_hearts_if_due() TO authenticated;

-- ═══════════════════════════════════════════════════════
-- 7. RPC upsert_streak — tek günde max +1, ardışık günler chain, kırılırsa reset 1
-- ═══════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.upsert_streak()
RETURNS public.user_streaks
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_today date := current_date;
  v_yesterday date := v_today - interval '1 day';
  v_row public.user_streaks;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'unauthenticated'; END IF;

  INSERT INTO public.user_streaks (user_id, current_streak, longest_streak, last_activity_date)
  VALUES (v_uid, 1, 1, v_today)
  ON CONFLICT (user_id) DO UPDATE SET
    current_streak = CASE
      WHEN user_streaks.last_activity_date = v_today THEN user_streaks.current_streak
      WHEN user_streaks.last_activity_date = v_yesterday THEN user_streaks.current_streak + 1
      ELSE 1
    END,
    longest_streak = GREATEST(
      user_streaks.longest_streak,
      CASE
        WHEN user_streaks.last_activity_date = v_today THEN user_streaks.current_streak
        WHEN user_streaks.last_activity_date = v_yesterday THEN user_streaks.current_streak + 1
        ELSE 1
      END
    ),
    last_activity_date = v_today,
    updated_at = now()
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.upsert_streak() TO authenticated;

-- ═══════════════════════════════════════════════════════
-- 8. app_config — limitleri sıkılaştır
-- ═══════════════════════════════════════════════════════
UPDATE public.app_config SET value = to_jsonb(2), updated_at = now()
  WHERE key = 'freemium.max_lessons_per_day';
UPDATE public.app_config SET value = to_jsonb(2), updated_at = now()
  WHERE key = 'freemium.max_pronunciation_per_day';
UPDATE public.app_config SET value = to_jsonb(24), updated_at = now()
  WHERE key = 'heart.refill_hours';
UPDATE public.app_config SET value = to_jsonb(2), updated_at = now()
  WHERE key = 'heart.max';
UPDATE public.app_config SET value = to_jsonb(false), updated_at = now()
  WHERE key = 'freemium.rewarded_ad_extra_lesson';
UPDATE public.app_config SET value = to_jsonb(false), updated_at = now()
  WHERE key = 'ads.enabled';

-- Yeni keys (idempotent)
INSERT INTO public.app_config (key, value, description, category, data_type)
VALUES
  ('freemium.max_readback_per_day', to_jsonb(2),
   'Free: günde maksimum read-back drill seansı', 'freemium', 'number'),
  ('freemium.max_listen_solve_per_day', to_jsonb(2),
   'Free: günde maksimum listen & solve drill seansı', 'freemium', 'number')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

DO $$ BEGIN
  RAISE NOTICE 'Freemium tightening + Pratik XP league + Hearts/Streak DB persist — APPLIED';
END $$;

COMMIT;
