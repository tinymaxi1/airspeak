-- ============================================================================
-- Sprint 4F — Yarışmalar (event-based competitions)
-- ============================================================================
-- 3 yeni tablo: competitions, competition_entries, competition_rewards.
-- Trigger: user_lesson_progress sonrası aktif competition entries.score
-- güncellenir (type'a göre xp/count/perfect/specific).
-- RPC: resolve_competition — final rank + ödül dağıt + status='closed'.
-- pg_cron: her saat competition-tick edge function (rank recalc + resolve).
-- ============================================================================

BEGIN;

-- ─── 1. competitions ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.competitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  name_tr text,
  description text,
  description_tr text,
  theme text NOT NULL CHECK (theme IN (
    'icao_focus', 'phraseology', 'vocabulary_blast', 'maintenance',
    'cabin_safety', 'seasonal', 'company_event', 'other'
  )),
  type text NOT NULL CHECK (type IN (
    'xp_race', 'lesson_count', 'perfect_score', 'streak', 'specific_content'
  )),
  rules jsonb NOT NULL DEFAULT '{}'::jsonb,
  target_role text CHECK (target_role IS NULL OR target_role IN (
    'pilot', 'cabin', 'technician', 'ground', 'student', 'all'
  )),
  target_level_tier text CHECK (target_level_tier IS NULL OR target_level_tier IN (
    'A1', 'A2', 'B1', 'B2', 'C1'
  )),
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  is_premium boolean NOT NULL DEFAULT false,
  entry_cost_coin int NOT NULL DEFAULT 0 CHECK (entry_cost_coin >= 0),
  prize_pool jsonb NOT NULL DEFAULT '[]'::jsonb,
  banner_url text,
  icon_emoji text NOT NULL DEFAULT '🏁',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'announced', 'active', 'closed', 'cancelled'
  )),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_date > start_date)
);

CREATE INDEX IF NOT EXISTS competitions_status_idx
  ON public.competitions (status, start_date) WHERE status IN ('announced', 'active');
CREATE INDEX IF NOT EXISTS competitions_active_window_idx
  ON public.competitions (start_date, end_date) WHERE status = 'active';

-- ─── 2. competition_entries ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.competition_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score numeric NOT NULL DEFAULT 0 CHECK (score >= 0),
  progress_data jsonb,
  rank int CHECK (rank IS NULL OR rank >= 1),
  rank_calculated_at timestamptz,
  rewards_granted boolean NOT NULL DEFAULT false,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (competition_id, user_id)
);

CREATE INDEX IF NOT EXISTS competition_entries_user_idx
  ON public.competition_entries (user_id);
CREATE INDEX IF NOT EXISTS competition_entries_score_idx
  ON public.competition_entries (competition_id, score DESC);

-- ─── 3. competition_rewards ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.competition_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
  entry_id uuid REFERENCES public.competition_entries(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rank int CHECK (rank IS NULL OR rank >= 1),
  reward_type text NOT NULL CHECK (reward_type IN (
    'coin', 'badge', 'premium_days', 'certificate', 'custom'
  )),
  reward_value jsonb,
  granted_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS competition_rewards_user_idx
  ON public.competition_rewards (user_id, granted_at DESC);
CREATE INDEX IF NOT EXISTS competition_rewards_comp_idx
  ON public.competition_rewards (competition_id);

-- ─── 4. updated_at trigger ───────────────────────────────────────────────
DROP TRIGGER IF EXISTS set_updated_at ON public.competitions;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.competitions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── 5. RLS ──────────────────────────────────────────────────────────────
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_rewards ENABLE ROW LEVEL SECURITY;

-- competitions: public sadece announced/active/closed; admin tümü
DROP POLICY IF EXISTS competitions_public_read ON public.competitions;
CREATE POLICY competitions_public_read ON public.competitions
  FOR SELECT USING (
    status IN ('announced', 'active', 'closed')
    OR public.is_admin_user()
  );

DROP POLICY IF EXISTS competitions_admin_insert ON public.competitions;
CREATE POLICY competitions_admin_insert ON public.competitions
  FOR INSERT WITH CHECK (public.has_admin_role('editor'));

DROP POLICY IF EXISTS competitions_admin_update ON public.competitions;
CREATE POLICY competitions_admin_update ON public.competitions
  FOR UPDATE USING (public.has_admin_role('editor'))
                WITH CHECK (public.has_admin_role('editor'));

DROP POLICY IF EXISTS competitions_super_delete ON public.competitions;
CREATE POLICY competitions_super_delete ON public.competitions
  FOR DELETE USING (public.has_admin_role('super_admin'));

-- competition_entries: own RW + public read (leaderboard)
DROP POLICY IF EXISTS competition_entries_public_read ON public.competition_entries;
CREATE POLICY competition_entries_public_read ON public.competition_entries
  FOR SELECT USING (true);

DROP POLICY IF EXISTS competition_entries_own_insert ON public.competition_entries;
CREATE POLICY competition_entries_own_insert ON public.competition_entries
  FOR INSERT WITH CHECK (user_id = auth.uid() OR public.is_admin_user());

DROP POLICY IF EXISTS competition_entries_own_update ON public.competition_entries;
CREATE POLICY competition_entries_own_update ON public.competition_entries
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin_user())
                WITH CHECK (user_id = auth.uid() OR public.is_admin_user());

DROP POLICY IF EXISTS competition_entries_admin_delete ON public.competition_entries;
CREATE POLICY competition_entries_admin_delete ON public.competition_entries
  FOR DELETE USING (public.has_admin_role('super_admin') OR user_id = auth.uid());

-- competition_rewards: public read + admin write
DROP POLICY IF EXISTS competition_rewards_public_read ON public.competition_rewards;
CREATE POLICY competition_rewards_public_read ON public.competition_rewards
  FOR SELECT USING (true);

DROP POLICY IF EXISTS competition_rewards_admin_insert ON public.competition_rewards;
CREATE POLICY competition_rewards_admin_insert ON public.competition_rewards
  FOR INSERT WITH CHECK (public.has_admin_role('editor'));

-- ─── 6. join_competition RPC ─────────────────────────────────────────────
-- Mobile çağırır. Filter (role/level/premium) + entry_cost kontrolü yok
-- (entry_cost client tarafında coin düşülür; server idempotent insert).
CREATE OR REPLACE FUNCTION public.join_competition(p_competition_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_comp record;
  v_profile record;
  v_entry_id uuid;
BEGIN
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'no_auth');
  END IF;

  SELECT * INTO v_comp FROM public.competitions WHERE id = p_competition_id;
  IF v_comp IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_found');
  END IF;
  IF v_comp.status NOT IN ('announced', 'active') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_joinable');
  END IF;
  IF v_comp.end_date <= now() THEN
    RETURN jsonb_build_object('ok', false, 'error', 'ended');
  END IF;

  -- Filter: role / level
  SELECT role, level INTO v_profile FROM public.profiles WHERE id = v_user;
  IF v_comp.target_role IS NOT NULL
     AND v_comp.target_role <> 'all'
     AND v_comp.target_role <> v_profile.role
  THEN
    RETURN jsonb_build_object('ok', false, 'error', 'role_mismatch');
  END IF;
  IF v_comp.target_level_tier IS NOT NULL
     AND v_comp.target_level_tier <> v_profile.level
  THEN
    RETURN jsonb_build_object('ok', false, 'error', 'level_mismatch');
  END IF;

  INSERT INTO public.competition_entries (competition_id, user_id, score)
  VALUES (p_competition_id, v_user, 0)
  ON CONFLICT (competition_id, user_id) DO NOTHING
  RETURNING id INTO v_entry_id;

  IF v_entry_id IS NULL THEN
    SELECT id INTO v_entry_id
      FROM public.competition_entries
     WHERE competition_id = p_competition_id AND user_id = v_user;
    RETURN jsonb_build_object(
      'ok', true, 'entry_id', v_entry_id, 'newly_joined', false
    );
  END IF;

  RETURN jsonb_build_object(
    'ok', true, 'entry_id', v_entry_id, 'newly_joined', true
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.join_competition(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.join_competition(uuid) TO authenticated;

-- ─── 7. update_competition_scores trigger ────────────────────────────────
-- user_lesson_progress INSERT/UPDATE sonrası aktif competition entries
-- score'unu type'a göre günceller. Sadece **mevcut** entries (auto-join yok).
CREATE OR REPLACE FUNCTION public.update_competition_scores()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_xp_delta numeric;
  v_perfect_delta numeric;
BEGIN
  -- INSERT: tam delta. UPDATE: sadece artış kısmı (best score override).
  IF TG_OP = 'INSERT' THEN
    v_xp_delta := COALESCE(NEW.xp_awarded, 0);
    v_perfect_delta := CASE WHEN NEW.score = 100 THEN 1 ELSE 0 END;

    UPDATE public.competition_entries e
       SET score = score + (
             CASE c.type
               WHEN 'xp_race' THEN v_xp_delta
               WHEN 'lesson_count' THEN 1
               WHEN 'perfect_score' THEN v_perfect_delta
               WHEN 'specific_content' THEN
                 CASE WHEN c.rules ? 'target_lesson_ids'
                       AND c.rules->'target_lesson_ids' ? NEW.lesson_id::text
                      THEN 1 ELSE 0 END
               ELSE 0
             END
           )
      FROM public.competitions c
     WHERE e.competition_id = c.id
       AND e.user_id = NEW.user_id
       AND c.status = 'active'
       AND c.start_date <= now()
       AND c.end_date > now();

  ELSIF TG_OP = 'UPDATE' THEN
    v_xp_delta := GREATEST(0, COALESCE(NEW.xp_awarded, 0) - COALESCE(OLD.xp_awarded, 0));
    v_perfect_delta := CASE
      WHEN NEW.score = 100 AND COALESCE(OLD.score, 0) < 100 THEN 1
      ELSE 0
    END;

    UPDATE public.competition_entries e
       SET score = score + (
             CASE c.type
               WHEN 'xp_race' THEN v_xp_delta
               WHEN 'perfect_score' THEN v_perfect_delta
               -- lesson_count: tekrar ders bitirme +1 sayılmaz (UPDATE)
               -- specific_content: aynı şekilde tek sayım (INSERT'te artıyor)
               ELSE 0
             END
           )
      FROM public.competitions c
     WHERE e.competition_id = c.id
       AND e.user_id = NEW.user_id
       AND c.status = 'active'
       AND c.start_date <= now()
       AND c.end_date > now();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS competition_score_sync ON public.user_lesson_progress;
CREATE TRIGGER competition_score_sync
  AFTER INSERT OR UPDATE ON public.user_lesson_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_competition_scores();

-- ─── 8. recalc_competition_ranks RPC ─────────────────────────────────────
-- Cron her saat çağırır. Aktif competitions'taki entries'i score DESC sırala,
-- rank set et.
CREATE OR REPLACE FUNCTION public.recalc_competition_ranks()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_comp RECORD;
  v_count int := 0;
BEGIN
  FOR v_comp IN
    SELECT id FROM public.competitions
     WHERE status = 'active' AND end_date > now()
  LOOP
    WITH ranked AS (
      SELECT id, ROW_NUMBER() OVER (ORDER BY score DESC, joined_at ASC) AS r
        FROM public.competition_entries
       WHERE competition_id = v_comp.id
    )
    UPDATE public.competition_entries e
       SET rank = ranked.r,
           rank_calculated_at = now()
      FROM ranked
     WHERE e.id = ranked.id;
    v_count := v_count + 1;
  END LOOP;

  RETURN jsonb_build_object('ok', true, 'competitions_recalculated', v_count);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.recalc_competition_ranks() FROM public;
GRANT EXECUTE ON FUNCTION public.recalc_competition_ranks() TO service_role;

-- ─── 9. resolve_competition RPC ──────────────────────────────────────────
-- Final rank + ödül dağıtımı + status='closed'.
-- prize_pool format: [{ "rank": 1, "type": "coin", "amount": 1000 }, ...]
-- veya range: [{ "rank_from": 4, "rank_to": 10, "type": "coin", "amount": 200 }]
CREATE OR REPLACE FUNCTION public.resolve_competition(p_competition_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_comp RECORD;
  v_prize jsonb;
  v_rank_from int;
  v_rank_to int;
  v_entry RECORD;
  v_reward_count int := 0;
BEGIN
  SELECT * INTO v_comp FROM public.competitions WHERE id = p_competition_id;
  IF v_comp IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_found');
  END IF;
  IF v_comp.status = 'closed' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'already_closed');
  END IF;

  -- Final rank set
  WITH ranked AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY score DESC, joined_at ASC) AS r
      FROM public.competition_entries
     WHERE competition_id = p_competition_id
  )
  UPDATE public.competition_entries e
     SET rank = ranked.r,
         rank_calculated_at = now()
    FROM ranked
   WHERE e.id = ranked.id;

  -- prize_pool iterate
  FOR v_prize IN SELECT * FROM jsonb_array_elements(v_comp.prize_pool)
  LOOP
    v_rank_from := COALESCE((v_prize->>'rank')::int, (v_prize->>'rank_from')::int);
    v_rank_to := COALESCE((v_prize->>'rank')::int, (v_prize->>'rank_to')::int);

    IF v_rank_from IS NULL OR v_rank_to IS NULL THEN CONTINUE; END IF;

    FOR v_entry IN
      SELECT id, user_id, rank
        FROM public.competition_entries
       WHERE competition_id = p_competition_id
         AND rank BETWEEN v_rank_from AND v_rank_to
    LOOP
      INSERT INTO public.competition_rewards (
        competition_id, entry_id, user_id, rank, reward_type, reward_value
      )
      VALUES (
        p_competition_id, v_entry.id, v_entry.user_id, v_entry.rank,
        COALESCE(v_prize->>'type', 'coin'),
        v_prize
      );
      v_reward_count := v_reward_count + 1;

      -- Type-spesifik yan etkiler
      IF v_prize->>'type' = 'badge' AND v_prize ? 'code' THEN
        INSERT INTO public.user_badges (user_id, badge_id)
        SELECT v_entry.user_id, b.id
          FROM public.badges b
         WHERE b.code = v_prize->>'code' AND b.is_active = true
        ON CONFLICT (user_id, badge_id) DO NOTHING;
      ELSIF v_prize->>'type' = 'premium_days' AND v_prize ? 'days' THEN
        UPDATE public.profiles
           SET premium_until = GREATEST(COALESCE(premium_until, now()), now())
                                + ((v_prize->>'days')::int * INTERVAL '1 day')
         WHERE id = v_entry.user_id;
      END IF;
    END LOOP;
  END LOOP;

  -- Tüm entries için rewards_granted = true
  UPDATE public.competition_entries
     SET rewards_granted = true
   WHERE competition_id = p_competition_id;

  -- Competition status = closed
  UPDATE public.competitions
     SET status = 'closed', resolved_at = now()
   WHERE id = p_competition_id;

  RETURN jsonb_build_object(
    'ok', true,
    'competition_id', p_competition_id,
    'rewards_granted', v_reward_count
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.resolve_competition(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.resolve_competition(uuid) TO service_role;

-- ─── 10. tick_competitions RPC — auto resolver ───────────────────────────
-- Hem rank recalc + hem biten yarışmaları resolve eder.
CREATE OR REPLACE FUNCTION public.tick_competitions()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_announced_to_active int := 0;
  v_resolved_count int := 0;
  v_recalc_result jsonb;
  v_id uuid;
BEGIN
  -- announced → active geçişi
  UPDATE public.competitions
     SET status = 'active'
   WHERE status = 'announced' AND start_date <= now() AND end_date > now();
  GET DIAGNOSTICS v_announced_to_active = ROW_COUNT;

  -- Rank recalc
  v_recalc_result := public.recalc_competition_ranks();

  -- end_date < now ve hâlâ active → resolve
  FOR v_id IN
    SELECT id FROM public.competitions
     WHERE status = 'active' AND end_date <= now()
  LOOP
    PERFORM public.resolve_competition(v_id);
    v_resolved_count := v_resolved_count + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'ok', true,
    'announced_to_active', v_announced_to_active,
    'recalc', v_recalc_result,
    'resolved', v_resolved_count
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.tick_competitions() FROM public;
GRANT EXECUTE ON FUNCTION public.tick_competitions() TO service_role;

-- ─── 11. pg_cron schedule — her saat ────────────────────────────────────
DO $outer$ BEGIN
  PERFORM cron.unschedule('competition-tick');
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
      'competition-tick',
      '0 * * * *',  -- her saat başı
      $$ SELECT public.tick_competitions(); $$
    );
  ELSE
    PERFORM cron.schedule(
      'competition-tick',
      '0 * * * *',
      format(
        $$ SELECT net.http_post(
            url := %L,
            headers := jsonb_build_object('Authorization', 'Bearer ' || %L, 'Content-Type', 'application/json'),
            body := '{}'::jsonb
          ); $$,
        replace(replace(v_url, '"', ''), 'league-weekly-rotation', 'competition-tick'),
        replace(v_token, '"', '')
      )
    );
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'competition-tick cron schedule skipped: %', SQLERRM;
END $outer$;

DO $$ BEGIN
  RAISE NOTICE 'Sprint 4F — competitions + 3 RPC + score trigger + cron tick aktif';
END $$;

COMMIT;
