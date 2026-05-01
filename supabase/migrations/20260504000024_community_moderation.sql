-- AirSpeak — Sprint 6.C.1 — Community moderation: mod role + banned words + rate limit + auto-mod
--
-- - profiles.is_moderator (global moderation flag — content_flags review yetkisi)
-- - community_banned_words (admin yönetir; severity warn/block + category)
-- - app_config: community.rate_limits (posts_per_5min / comments_per_5min / reports_per_day)
-- - content_flags.content_type whitelist genişletildi: community_post / community_comment /
--   community_group / user_profile
-- - RPC: auto_check_text (banned_words match), check_rate_limit, report_community_content,
--   set_user_moderator, hide_post/comment (mod action), unhide
-- - create_community_post + create_community_comment: auto-mod entegre (block/warn)
-- - DB trigger: post/comment status 'hidden' olunca push trigger 'mod_warning'

BEGIN;

-- ─── 1. profiles.is_moderator ───────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_moderator boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS profiles_is_moderator_idx
  ON public.profiles (is_moderator) WHERE is_moderator = true;

COMMENT ON COLUMN public.profiles.is_moderator IS
  'Global community moderator — content_flags review + post/comment hide yetkisi';

-- Helper
CREATE OR REPLACE FUNCTION public.is_moderator_user(p_uid uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $is_mod$
  SELECT COALESCE(
    (SELECT is_moderator FROM public.profiles WHERE id = COALESCE(p_uid, auth.uid())),
    false
  );
$is_mod$;

GRANT EXECUTE ON FUNCTION public.is_moderator_user(uuid) TO authenticated, anon;

-- ─── 2. community_banned_words ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.community_banned_words (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word text NOT NULL UNIQUE CHECK (length(word) BETWEEN 2 AND 80),
  severity text NOT NULL DEFAULT 'block'
    CHECK (severity IN ('warn', 'block')),
  category text NOT NULL DEFAULT 'other'
    CHECK (category IN ('profanity', 'spam', 'hate', 'pii', 'other')),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS community_banned_words_word_idx
  ON public.community_banned_words (lower(word));
CREATE INDEX IF NOT EXISTS community_banned_words_severity_idx
  ON public.community_banned_words (severity);

ALTER TABLE public.community_banned_words ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS community_banned_words_admin_read ON public.community_banned_words;
CREATE POLICY community_banned_words_admin_read ON public.community_banned_words
  FOR SELECT USING (
    public.is_admin_user() OR public.is_moderator_user()
  );

DROP POLICY IF EXISTS community_banned_words_admin_write ON public.community_banned_words;
CREATE POLICY community_banned_words_admin_write ON public.community_banned_words
  FOR ALL USING (public.has_admin_role('editor'))
  WITH CHECK (public.has_admin_role('editor'));

-- ─── 3. content_flags.content_type whitelist genişlet ───────────────────
-- Eski check: lesson/vocab/exam vs. yeni: community_*, user_profile
ALTER TABLE public.content_flags DROP CONSTRAINT IF EXISTS content_flags_content_type_check;
ALTER TABLE public.content_flags
  ADD CONSTRAINT content_flags_content_type_check
  CHECK (content_type IN (
    'interview_question',
    'exam_question',
    'lesson_exercise',
    'vocabulary_term',
    'conversation_scenario',
    'phraseology_entry',
    'ai_response',
    -- 6.C.1 community moderation
    'community_post',
    'community_comment',
    'community_group',
    'user_profile',
    'other'
  ));

-- ─── 4. content_flags.reason whitelist genişlet ─────────────────────────
ALTER TABLE public.content_flags DROP CONSTRAINT IF EXISTS content_flags_reason_check;
ALTER TABLE public.content_flags
  ADD CONSTRAINT content_flags_reason_check
  CHECK (reason IN (
    'inaccurate', 'offensive', 'copyright', 'spam', 'broken_audio',
    -- 6.C.1 community moderation
    'harassment', 'misinformation', 'hate_speech', 'sexual', 'violence',
    'self_harm', 'impersonation', 'pii', 'illegal',
    'other'
  ));

-- Reviewer rolünü genişlet: moderator da review edebilir
DROP POLICY IF EXISTS "content_flags_review_admin" ON public.content_flags;
CREATE POLICY "content_flags_review_admin" ON public.content_flags
  FOR UPDATE USING (
    public.is_admin_user() OR public.is_moderator_user()
  ) WITH CHECK (
    public.is_admin_user() OR public.is_moderator_user()
  );

-- Mod queue read: admin + moderator
DROP POLICY IF EXISTS "content_flags_admin_read_all" ON public.content_flags;
CREATE POLICY "content_flags_admin_read_all" ON public.content_flags
  FOR SELECT USING (
    user_id = auth.uid()
    OR public.is_admin_user()
    OR public.is_moderator_user()
  );

-- ═══════════════════════════════════════════════════════════════════════
-- AUTO-MOD HELPERS
-- ═══════════════════════════════════════════════════════════════════════

-- ─── 5. auto_check_text ──────────────────────────────────────────────────
-- İçerik içinde herhangi bir banned_word var mı? Block ya da warn varsa döner.
-- Word-boundary regex (\m \M) ile false-positive azaltılır.
CREATE OR REPLACE FUNCTION public.auto_check_community_text(p_content text)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $autocheck$
DECLARE
  v_lower text := lower(p_content);
  v_matched_block text[] := '{}';
  v_matched_warn text[] := '{}';
  rec RECORD;
BEGIN
  FOR rec IN SELECT word, severity FROM public.community_banned_words LOOP
    IF v_lower ~ ('\m' || regexp_replace(lower(rec.word), '([().*+?{}\\\[\]^$|])', '\\\1', 'g') || '\M') THEN
      IF rec.severity = 'block' THEN
        v_matched_block := array_append(v_matched_block, rec.word);
      ELSE
        v_matched_warn := array_append(v_matched_warn, rec.word);
      END IF;
    END IF;
  END LOOP;
  RETURN jsonb_build_object(
    'block', array_length(v_matched_block, 1) IS NOT NULL,
    'warn', array_length(v_matched_warn, 1) IS NOT NULL,
    'matched_block', v_matched_block,
    'matched_warn', v_matched_warn
  );
END;
$autocheck$;

GRANT EXECUTE ON FUNCTION public.auto_check_community_text(text) TO authenticated;

-- ─── 6. check_community_rate_limit ──────────────────────────────────────
-- 5 dakikalık pencerede son N kayıt var mı? Posts/comments için.
-- Limit app_config'ten okur (community.rate_limit_*).
CREATE OR REPLACE FUNCTION public.check_community_rate_limit(p_action_type text)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $rate$
DECLARE
  v_uid uuid := auth.uid();
  v_limit_value jsonb;
  v_limit int;
  v_count int;
  v_window_start timestamptz := now() - interval '5 minutes';
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated');
  END IF;

  IF p_action_type = 'post' THEN
    SELECT value INTO v_limit_value FROM public.app_config WHERE key = 'community.rate_limit_posts_per_5min';
    v_limit := COALESCE(NULLIF(v_limit_value::text, '')::int, 5);
    SELECT count(*)::int INTO v_count FROM public.community_posts
      WHERE author_id = v_uid AND created_at > v_window_start;
  ELSIF p_action_type = 'comment' THEN
    SELECT value INTO v_limit_value FROM public.app_config WHERE key = 'community.rate_limit_comments_per_5min';
    v_limit := COALESCE(NULLIF(v_limit_value::text, '')::int, 20);
    SELECT count(*)::int INTO v_count FROM public.community_comments
      WHERE author_id = v_uid AND created_at > v_window_start;
  ELSIF p_action_type = 'report' THEN
    SELECT value INTO v_limit_value FROM public.app_config WHERE key = 'community.rate_limit_reports_per_day';
    v_limit := COALESCE(NULLIF(v_limit_value::text, '')::int, 20);
    SELECT count(*)::int INTO v_count FROM public.content_flags
      WHERE user_id = v_uid AND created_at > now() - interval '1 day';
  ELSE
    RETURN jsonb_build_object('ok', false, 'error', 'unknown_action');
  END IF;

  RETURN jsonb_build_object(
    'ok', v_count < v_limit,
    'count', v_count,
    'limit', v_limit
  );
END;
$rate$;

GRANT EXECUTE ON FUNCTION public.check_community_rate_limit(text) TO authenticated;

-- ─── 7. app_config: rate limits ─────────────────────────────────────────
INSERT INTO public.app_config (key, value, description, category, data_type)
VALUES
  ('community.rate_limit_posts_per_5min', '5'::jsonb,
   '5 dakikalık pencerede max post sayısı', 'general', 'number'),
  ('community.rate_limit_comments_per_5min', '20'::jsonb,
   '5 dakikalık pencerede max yorum sayısı', 'general', 'number'),
  ('community.rate_limit_reports_per_day', '20'::jsonb,
   'Günlük max report sayısı', 'general', 'number')
ON CONFLICT (key) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════
-- MOD ACTIONS
-- ═══════════════════════════════════════════════════════════════════════

-- ─── 8. set_user_moderator (admin only) ─────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_user_moderator(
  p_user_id uuid,
  p_is_moderator boolean
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $setmod$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF NOT public.has_admin_role('super_admin') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'super_admin_required');
  END IF;
  UPDATE public.profiles SET is_moderator = p_is_moderator WHERE id = p_user_id;
  PERFORM public.log_admin_action(
    CASE WHEN p_is_moderator THEN 'set_admin_role' ELSE 'unset_admin_role' END,
    'profiles',
    NULL,
    p_user_id,
    NULL,
    jsonb_build_object('is_moderator', p_is_moderator)
  );
  RETURN jsonb_build_object('ok', true);
END;
$setmod$;

GRANT EXECUTE ON FUNCTION public.set_user_moderator(uuid, boolean) TO authenticated;

-- ─── 9. hide_community_post (mod) ───────────────────────────────────────
CREATE OR REPLACE FUNCTION public.hide_community_post(
  p_post_id uuid,
  p_unhide boolean DEFAULT false
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $hide_post$
DECLARE
  v_uid uuid := auth.uid();
  v_group uuid;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated');
  END IF;
  SELECT group_id INTO v_group FROM public.community_posts WHERE id = p_post_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'post_not_found');
  END IF;
  -- Yetki: global moderator OR group staff OR admin
  IF NOT public.is_moderator_user(v_uid)
     AND NOT public.is_group_staff(v_group, v_uid)
     AND NOT public.is_admin_user() THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authorized');
  END IF;
  UPDATE public.community_posts SET status = CASE WHEN p_unhide THEN 'active' ELSE 'hidden' END
    WHERE id = p_post_id;
  RETURN jsonb_build_object('ok', true, 'hidden', NOT p_unhide);
END;
$hide_post$;

GRANT EXECUTE ON FUNCTION public.hide_community_post(uuid, boolean) TO authenticated;

-- ─── 10. hide_community_comment (mod) ───────────────────────────────────
CREATE OR REPLACE FUNCTION public.hide_community_comment(
  p_comment_id uuid,
  p_unhide boolean DEFAULT false
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $hide_comm$
DECLARE
  v_uid uuid := auth.uid();
  v_group uuid;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated');
  END IF;
  SELECT cp.group_id INTO v_group
    FROM public.community_comments cc
    JOIN public.community_posts cp ON cp.id = cc.post_id
    WHERE cc.id = p_comment_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'comment_not_found');
  END IF;
  IF NOT public.is_moderator_user(v_uid)
     AND NOT public.is_group_staff(v_group, v_uid)
     AND NOT public.is_admin_user() THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authorized');
  END IF;
  UPDATE public.community_comments SET status = CASE WHEN p_unhide THEN 'active' ELSE 'hidden' END
    WHERE id = p_comment_id;
  RETURN jsonb_build_object('ok', true, 'hidden', NOT p_unhide);
END;
$hide_comm$;

GRANT EXECUTE ON FUNCTION public.hide_community_comment(uuid, boolean) TO authenticated;

-- ─── 11. report_community_content (kullanıcı flag) ──────────────────────
CREATE OR REPLACE FUNCTION public.report_community_content(
  p_target_type text,
  p_target_id text,
  p_reason text,
  p_comment text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $report$
DECLARE
  v_uid uuid := auth.uid();
  v_rate_check jsonb;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated');
  END IF;
  IF p_target_type NOT IN ('community_post', 'community_comment', 'community_group', 'user_profile') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_target_type');
  END IF;

  -- Rate limit
  v_rate_check := public.check_community_rate_limit('report');
  IF NOT (v_rate_check->>'ok')::boolean THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', 'rate_limited',
      'count', v_rate_check->>'count',
      'limit', v_rate_check->>'limit'
    );
  END IF;

  INSERT INTO public.content_flags (user_id, content_type, content_id, reason, comment)
  VALUES (v_uid, p_target_type, p_target_id, p_reason, p_comment);

  RETURN jsonb_build_object('ok', true);
END;
$report$;

GRANT EXECUTE ON FUNCTION public.report_community_content(text, text, text, text) TO authenticated;

-- ═══════════════════════════════════════════════════════════════════════
-- POST/COMMENT RPC'LERINI AUTO-MOD ENTEGRE ET
-- ═══════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.create_community_post(
  p_group_id uuid,
  p_content text,
  p_image_urls text[] DEFAULT '{}'
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $cpost$
DECLARE
  v_uid uuid := auth.uid();
  v_id uuid;
  v_check jsonb;
  v_rate jsonb;
  v_status text := 'active';
BEGIN
  IF v_uid IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated'); END IF;
  IF public.is_banned_user(v_uid) THEN RETURN jsonb_build_object('ok', false, 'error', 'user_banned'); END IF;
  IF NOT public.is_group_member(p_group_id, v_uid) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_a_member');
  END IF;
  IF p_image_urls IS NOT NULL AND array_length(p_image_urls, 1) > 4 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'max_4_images');
  END IF;

  -- Rate limit
  v_rate := public.check_community_rate_limit('post');
  IF NOT (v_rate->>'ok')::boolean THEN
    RETURN jsonb_build_object('ok', false, 'error', 'rate_limited', 'count', v_rate->>'count', 'limit', v_rate->>'limit');
  END IF;

  -- Auto-mod
  v_check := public.auto_check_community_text(p_content);
  IF (v_check->>'block')::boolean THEN
    RETURN jsonb_build_object('ok', false, 'error', 'banned_words_blocked', 'matches', v_check->'matched_block');
  END IF;
  IF (v_check->>'warn')::boolean THEN
    -- Sessiz hide — kullanıcı görmez ama mod'lar review eder
    v_status := 'hidden';
  END IF;

  v_id := gen_random_uuid();
  INSERT INTO public.community_posts (id, group_id, author_id, content, image_urls, status)
  VALUES (v_id, p_group_id, v_uid, p_content, COALESCE(p_image_urls, '{}'), v_status);
  -- Parse mention/hashtag (sadece active için)
  IF v_status = 'active' THEN
    PERFORM public.parse_post_content(v_id);
  END IF;
  RETURN jsonb_build_object('ok', true, 'id', v_id, 'auto_hidden', v_status = 'hidden');
END;
$cpost$;

CREATE OR REPLACE FUNCTION public.create_community_comment(
  p_post_id uuid,
  p_content text,
  p_parent_comment_id uuid DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $ccomm$
DECLARE
  v_uid uuid := auth.uid();
  v_id uuid;
  v_depth int := 0;
  v_parent_depth int;
  v_parent_post uuid;
  v_check jsonb;
  v_rate jsonb;
  v_status text := 'active';
BEGIN
  IF v_uid IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated'); END IF;
  IF public.is_banned_user(v_uid) THEN RETURN jsonb_build_object('ok', false, 'error', 'user_banned'); END IF;
  IF NOT public.can_read_post(p_post_id) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authorized');
  END IF;
  IF p_parent_comment_id IS NOT NULL THEN
    SELECT depth, post_id INTO v_parent_depth, v_parent_post
      FROM public.community_comments WHERE id = p_parent_comment_id;
    IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'error', 'parent_not_found'); END IF;
    IF v_parent_post <> p_post_id THEN
      RETURN jsonb_build_object('ok', false, 'error', 'parent_post_mismatch');
    END IF;
    v_depth := least(2, v_parent_depth + 1);
  END IF;

  -- Rate limit
  v_rate := public.check_community_rate_limit('comment');
  IF NOT (v_rate->>'ok')::boolean THEN
    RETURN jsonb_build_object('ok', false, 'error', 'rate_limited', 'count', v_rate->>'count', 'limit', v_rate->>'limit');
  END IF;

  -- Auto-mod
  v_check := public.auto_check_community_text(p_content);
  IF (v_check->>'block')::boolean THEN
    RETURN jsonb_build_object('ok', false, 'error', 'banned_words_blocked', 'matches', v_check->'matched_block');
  END IF;
  IF (v_check->>'warn')::boolean THEN
    v_status := 'hidden';
  END IF;

  v_id := gen_random_uuid();
  INSERT INTO public.community_comments (id, post_id, author_id, parent_comment_id, content, depth, status)
  VALUES (v_id, p_post_id, v_uid, p_parent_comment_id, p_content, v_depth, v_status);
  IF v_status = 'active' THEN
    PERFORM public.parse_comment_content(v_id);
  END IF;
  RETURN jsonb_build_object('ok', true, 'id', v_id, 'depth', v_depth, 'auto_hidden', v_status = 'hidden');
END;
$ccomm$;

-- ═══════════════════════════════════════════════════════════════════════
-- DB TRIGGER: post/comment status='hidden' olunca push 'mod_warning'
-- ═══════════════════════════════════════════════════════════════════════
-- Yeni 'hidden' status (auto-mod veya manuel mod hide) → notify post sahibine.
-- INSERT (auto_hidden) ve UPDATE (manuel hide) iki path.

CREATE OR REPLACE FUNCTION public.notify_mod_warning_post()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $modw_post$
DECLARE
  v_url text;
  v_token text;
BEGIN
  -- Sadece hidden'a geçiş
  IF (TG_OP = 'INSERT' AND NEW.status = 'hidden')
     OR (TG_OP = 'UPDATE' AND NEW.status = 'hidden' AND OLD.status <> 'hidden') THEN
    SELECT replace(value::text, '"', '') INTO v_url
      FROM public.app_config WHERE key = 'notifications.edge_url';
    SELECT replace(value::text, '"', '') INTO v_token
      FROM public.app_config WHERE key = 'notifications.service_token';
    IF v_url IS NULL OR length(v_url) < 5 THEN RETURN NEW; END IF;
    PERFORM extensions.net.http_post(
      url := v_url || '/mod_warning',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || COALESCE(v_token, ''),
        'Content-Type', 'application/json'
      ),
      body := jsonb_build_object(
        'kind', 'post',
        'target_id', NEW.id,
        'user_id', NEW.author_id
      )
    );
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'notify_mod_warning_post failed: %', SQLERRM;
  RETURN NEW;
END;
$modw_post$;

DROP TRIGGER IF EXISTS community_posts_mod_warning ON public.community_posts;
CREATE TRIGGER community_posts_mod_warning
  AFTER INSERT OR UPDATE OF status ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.notify_mod_warning_post();

CREATE OR REPLACE FUNCTION public.notify_mod_warning_comment()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $modw_comm$
DECLARE
  v_url text;
  v_token text;
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.status = 'hidden')
     OR (TG_OP = 'UPDATE' AND NEW.status = 'hidden' AND OLD.status <> 'hidden') THEN
    SELECT replace(value::text, '"', '') INTO v_url
      FROM public.app_config WHERE key = 'notifications.edge_url';
    SELECT replace(value::text, '"', '') INTO v_token
      FROM public.app_config WHERE key = 'notifications.service_token';
    IF v_url IS NULL OR length(v_url) < 5 THEN RETURN NEW; END IF;
    PERFORM extensions.net.http_post(
      url := v_url || '/mod_warning',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || COALESCE(v_token, ''),
        'Content-Type', 'application/json'
      ),
      body := jsonb_build_object(
        'kind', 'comment',
        'target_id', NEW.id,
        'user_id', NEW.author_id
      )
    );
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'notify_mod_warning_comment failed: %', SQLERRM;
  RETURN NEW;
END;
$modw_comm$;

DROP TRIGGER IF EXISTS community_comments_mod_warning ON public.community_comments;
CREATE TRIGGER community_comments_mod_warning
  AFTER INSERT OR UPDATE OF status ON public.community_comments
  FOR EACH ROW EXECUTE FUNCTION public.notify_mod_warning_comment();

DO $$ BEGIN
  RAISE NOTICE 'Sprint 6.C.1 — moderation: is_moderator + banned_words + rate_limit + auto-mod + mod_warning push aktif';
END $$;

COMMIT;
