-- AirSpeak — Sprint 6.B.1 — Mentions + hashtags + bookmarks + content parser
--
-- - community_mentions (post veya comment scope)
-- - community_hashtags (canonical, lowercase, usage_count denormalized)
-- - community_post_hashtags (join)
-- - community_bookmarks (PK user_id+post_id)
-- - profiles.mention_privacy ('all'|'friends_only')
-- - parse_post_content / parse_comment_content RPC: regex ile @username + #tag çıkar,
--   privacy + friend check, mentions + hashtags upsert, mentioned_user_ids döndür.
-- - toggle_bookmark RPC
-- - DB trigger AFTER INSERT mentions → pg_net edge function'a post_mention push
--   (config: notifications.edge_url + service_token)

BEGIN;

-- ─── 1. profiles.mention_privacy ────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS mention_privacy text NOT NULL DEFAULT 'all';
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_mention_privacy_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_mention_privacy_check
  CHECK (mention_privacy IN ('all', 'friends_only'));

COMMENT ON COLUMN public.profiles.mention_privacy IS
  'all = herkes mention edebilir; friends_only = sadece arkadaşlar push alır';

-- ─── 2. community_mentions ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.community_mentions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  comment_id uuid REFERENCES public.community_comments(id) ON DELETE CASCADE,
  mentioned_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mentioner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Bildirim atıldı mı? Edge function tarafından true yapılır.
  notified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  -- Bir mention bir context'te (post veya comment) bir kez
  UNIQUE NULLS NOT DISTINCT (post_id, comment_id, mentioned_user_id)
);

CREATE INDEX IF NOT EXISTS community_mentions_user_idx
  ON public.community_mentions (mentioned_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS community_mentions_post_idx
  ON public.community_mentions (post_id);
CREATE INDEX IF NOT EXISTS community_mentions_unnotified_idx
  ON public.community_mentions (created_at)
  WHERE notified = false;

ALTER TABLE public.community_mentions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS community_mentions_read ON public.community_mentions;
CREATE POLICY community_mentions_read ON public.community_mentions
  FOR SELECT USING (
    mentioned_user_id = auth.uid()
    OR mentioner_user_id = auth.uid()
    OR public.is_admin_user()
  );

-- INSERT/UPDATE/DELETE sadece RPC üzerinden (parse_post_content). Tablo yazımı RLS engellenir.
DROP POLICY IF EXISTS community_mentions_no_insert ON public.community_mentions;
CREATE POLICY community_mentions_no_insert ON public.community_mentions
  FOR INSERT WITH CHECK (false);
DROP POLICY IF EXISTS community_mentions_no_update ON public.community_mentions;
CREATE POLICY community_mentions_no_update ON public.community_mentions
  FOR UPDATE USING (false);

-- ─── 3. community_hashtags ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.community_hashtags (
  tag text PRIMARY KEY CHECK (tag ~ '^[a-z0-9_]+$' AND length(tag) BETWEEN 2 AND 50),
  usage_count int NOT NULL DEFAULT 0,
  last_used_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS community_hashtags_usage_idx
  ON public.community_hashtags (usage_count DESC, last_used_at DESC);
CREATE INDEX IF NOT EXISTS community_hashtags_recent_idx
  ON public.community_hashtags (last_used_at DESC);

ALTER TABLE public.community_hashtags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS community_hashtags_read ON public.community_hashtags;
CREATE POLICY community_hashtags_read ON public.community_hashtags
  FOR SELECT USING (true);

-- INSERT/UPDATE sadece RPC ile (parse content)
DROP POLICY IF EXISTS community_hashtags_no_write ON public.community_hashtags;
CREATE POLICY community_hashtags_no_write ON public.community_hashtags
  FOR ALL USING (false) WITH CHECK (false);

-- ─── 4. community_post_hashtags (join) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.community_post_hashtags (
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  tag text NOT NULL REFERENCES public.community_hashtags(tag) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag)
);

CREATE INDEX IF NOT EXISTS community_post_hashtags_tag_idx
  ON public.community_post_hashtags (tag);

ALTER TABLE public.community_post_hashtags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS community_post_hashtags_read ON public.community_post_hashtags;
CREATE POLICY community_post_hashtags_read ON public.community_post_hashtags
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.community_posts p
            WHERE p.id = post_id AND public.can_read_post(p.id))
    OR public.is_admin_user()
  );

DROP POLICY IF EXISTS community_post_hashtags_no_write ON public.community_post_hashtags;
CREATE POLICY community_post_hashtags_no_write ON public.community_post_hashtags
  FOR ALL USING (false) WITH CHECK (false);

-- ─── 5. community_bookmarks ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.community_bookmarks (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);

CREATE INDEX IF NOT EXISTS community_bookmarks_user_idx
  ON public.community_bookmarks (user_id, created_at DESC);

ALTER TABLE public.community_bookmarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS community_bookmarks_own ON public.community_bookmarks;
CREATE POLICY community_bookmarks_own ON public.community_bookmarks
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ═══════════════════════════════════════════════════════════════════════
-- HELPERS
-- ═══════════════════════════════════════════════════════════════════════

-- ─── 6. Helper: extract @mentions ────────────────────────────────────────
-- Username pattern: a-z, 0-9, _, 3-30 chars (profiles.username constraint'i ile uyumlu)
CREATE OR REPLACE FUNCTION public.extract_mentions(p_content text)
RETURNS text[]
LANGUAGE sql IMMUTABLE
AS $extract_mentions$
  SELECT COALESCE(
    array_agg(DISTINCT lower(m[1])),
    '{}'::text[]
  )
  FROM regexp_matches(
    p_content,
    '@([a-zA-Z0-9_]{3,30})',
    'g'
  ) AS m;
$extract_mentions$;

-- ─── 7. Helper: extract #hashtags ────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.extract_hashtags(p_content text)
RETURNS text[]
LANGUAGE sql IMMUTABLE
AS $extract_hashtags$
  SELECT COALESCE(
    array_agg(DISTINCT lower(m[1])),
    '{}'::text[]
  )
  FROM regexp_matches(
    p_content,
    '#([a-zA-Z0-9_]{2,50})',
    'g'
  ) AS m;
$extract_hashtags$;

-- ─── 8. Helper: friendship check ────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.are_friends(p_a uuid, p_b uuid)
RETURNS boolean
LANGUAGE sql STABLE
AS $are_friends$
  SELECT EXISTS (
    SELECT 1 FROM public.friendships
    WHERE status = 'accepted'
      AND (
        (requester_id = p_a AND addressee_id = p_b)
        OR (requester_id = p_b AND addressee_id = p_a)
      )
  );
$are_friends$;

-- ═══════════════════════════════════════════════════════════════════════
-- CONTENT PARSER RPCs
-- ═══════════════════════════════════════════════════════════════════════

-- ─── 9. parse_post_content ──────────────────────────────────────────────
-- Post içeriğinden @mentions ve #hashtags çıkarır:
--   - Mentions: profiles.username eşleşmesi + mention_privacy check
--   - Hashtags: community_hashtags upsert + community_post_hashtags insert
-- Idempotent: eski mentions/hashtags silinir, yenileri eklenir (edit için).
-- Returns: { mention_ids: uuid[], hashtags: text[] }
CREATE OR REPLACE FUNCTION public.parse_post_content(p_post_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $parse_post$
DECLARE
  v_content text;
  v_author uuid;
  v_usernames text[];
  v_tags text[];
  v_mention_ids uuid[] := '{}';
  v_username text;
  v_target_user uuid;
  v_target_privacy text;
  v_should_mention boolean;
  v_tag text;
BEGIN
  SELECT content, author_id INTO v_content, v_author
    FROM public.community_posts WHERE id = p_post_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'post_not_found');
  END IF;

  -- Eski parse sonuçlarını temizle (edit için)
  DELETE FROM public.community_mentions WHERE post_id = p_post_id AND comment_id IS NULL;
  -- Eski hashtag bağları + usage_count düzelt
  WITH deleted AS (
    DELETE FROM public.community_post_hashtags WHERE post_id = p_post_id RETURNING tag
  )
  UPDATE public.community_hashtags h
     SET usage_count = greatest(0, h.usage_count - 1)
   WHERE h.tag IN (SELECT tag FROM deleted);

  v_usernames := public.extract_mentions(v_content);
  v_tags := public.extract_hashtags(v_content);

  -- Mentions
  FOREACH v_username IN ARRAY v_usernames LOOP
    SELECT id, mention_privacy INTO v_target_user, v_target_privacy
      FROM public.profiles WHERE lower(username) = v_username LIMIT 1;
    IF v_target_user IS NULL THEN CONTINUE; END IF;
    IF v_target_user = v_author THEN CONTINUE; END IF;

    v_should_mention := true;
    IF v_target_privacy = 'friends_only' THEN
      v_should_mention := public.are_friends(v_author, v_target_user);
    END IF;
    IF NOT v_should_mention THEN CONTINUE; END IF;

    INSERT INTO public.community_mentions
      (post_id, comment_id, mentioned_user_id, mentioner_user_id)
    VALUES
      (p_post_id, NULL, v_target_user, v_author)
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_target_user; -- reuse var
    IF v_target_user IS NOT NULL THEN
      v_mention_ids := array_append(v_mention_ids, v_target_user);
    END IF;
  END LOOP;

  -- Hashtags
  FOREACH v_tag IN ARRAY v_tags LOOP
    INSERT INTO public.community_hashtags (tag, usage_count, last_used_at)
    VALUES (v_tag, 1, now())
    ON CONFLICT (tag) DO UPDATE SET
      usage_count = public.community_hashtags.usage_count + 1,
      last_used_at = now();
    INSERT INTO public.community_post_hashtags (post_id, tag)
    VALUES (p_post_id, v_tag)
    ON CONFLICT DO NOTHING;
  END LOOP;

  RETURN jsonb_build_object(
    'ok', true,
    'mentions', array_length(v_mention_ids, 1),
    'hashtags', v_tags
  );
END;
$parse_post$;

GRANT EXECUTE ON FUNCTION public.parse_post_content(uuid) TO authenticated;

-- ─── 10. parse_comment_content ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.parse_comment_content(p_comment_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $parse_comm$
DECLARE
  v_content text;
  v_author uuid;
  v_post uuid;
  v_usernames text[];
  v_username text;
  v_target_user uuid;
  v_target_privacy text;
  v_should_mention boolean;
  v_count int := 0;
BEGIN
  SELECT content, author_id, post_id INTO v_content, v_author, v_post
    FROM public.community_comments WHERE id = p_comment_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'comment_not_found');
  END IF;

  DELETE FROM public.community_mentions WHERE comment_id = p_comment_id;

  v_usernames := public.extract_mentions(v_content);

  FOREACH v_username IN ARRAY v_usernames LOOP
    SELECT id, mention_privacy INTO v_target_user, v_target_privacy
      FROM public.profiles WHERE lower(username) = v_username LIMIT 1;
    IF v_target_user IS NULL OR v_target_user = v_author THEN CONTINUE; END IF;
    v_should_mention := true;
    IF v_target_privacy = 'friends_only' THEN
      v_should_mention := public.are_friends(v_author, v_target_user);
    END IF;
    IF NOT v_should_mention THEN CONTINUE; END IF;
    INSERT INTO public.community_mentions
      (post_id, comment_id, mentioned_user_id, mentioner_user_id)
    VALUES
      (v_post, p_comment_id, v_target_user, v_author)
    ON CONFLICT DO NOTHING;
    v_count := v_count + 1;
  END LOOP;

  RETURN jsonb_build_object('ok', true, 'mentions', v_count);
END;
$parse_comm$;

GRANT EXECUTE ON FUNCTION public.parse_comment_content(uuid) TO authenticated;

-- ═══════════════════════════════════════════════════════════════════════
-- POST/COMMENT RPC'LERINI ENTEGRE ET (parse otomatik)
-- ═══════════════════════════════════════════════════════════════════════

-- Mevcut create/edit RPC'lerini parse'la genişlet (re-define)
-- Mevcut signature ve guard'ları korur, en sonda parse_post_content/parse_comment_content çağırır.

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
BEGIN
  IF v_uid IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated'); END IF;
  IF public.is_banned_user(v_uid) THEN RETURN jsonb_build_object('ok', false, 'error', 'user_banned'); END IF;
  IF NOT public.is_group_member(p_group_id, v_uid) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_a_member');
  END IF;
  IF p_image_urls IS NOT NULL AND array_length(p_image_urls, 1) > 4 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'max_4_images');
  END IF;
  v_id := gen_random_uuid();
  INSERT INTO public.community_posts (id, group_id, author_id, content, image_urls)
  VALUES (v_id, p_group_id, v_uid, p_content, COALESCE(p_image_urls, '{}'));
  PERFORM public.parse_post_content(v_id);
  RETURN jsonb_build_object('ok', true, 'id', v_id);
END;
$cpost$;

CREATE OR REPLACE FUNCTION public.edit_community_post(
  p_post_id uuid,
  p_content text,
  p_image_urls text[] DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $epost$
DECLARE
  v_uid uuid := auth.uid();
  v_author uuid;
  v_status text;
BEGIN
  IF v_uid IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated'); END IF;
  SELECT author_id, status INTO v_author, v_status
    FROM public.community_posts WHERE id = p_post_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'error', 'post_not_found'); END IF;
  IF v_author <> v_uid AND NOT public.is_admin_user() THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authorized');
  END IF;
  IF v_status <> 'active' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'post_not_active');
  END IF;
  UPDATE public.community_posts SET
    content = p_content,
    image_urls = COALESCE(p_image_urls, image_urls),
    edited_at = now()
  WHERE id = p_post_id;
  PERFORM public.parse_post_content(p_post_id);
  RETURN jsonb_build_object('ok', true);
END;
$epost$;

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
  v_id := gen_random_uuid();
  INSERT INTO public.community_comments (id, post_id, author_id, parent_comment_id, content, depth)
  VALUES (v_id, p_post_id, v_uid, p_parent_comment_id, p_content, v_depth);
  PERFORM public.parse_comment_content(v_id);
  RETURN jsonb_build_object('ok', true, 'id', v_id, 'depth', v_depth);
END;
$ccomm$;

CREATE OR REPLACE FUNCTION public.edit_community_comment(
  p_comment_id uuid,
  p_content text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $ecomm$
DECLARE
  v_uid uuid := auth.uid();
  v_author uuid;
  v_status text;
BEGIN
  IF v_uid IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated'); END IF;
  SELECT author_id, status INTO v_author, v_status
    FROM public.community_comments WHERE id = p_comment_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'error', 'comment_not_found'); END IF;
  IF v_author <> v_uid AND NOT public.is_admin_user() THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authorized');
  END IF;
  IF v_status <> 'active' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'comment_not_active');
  END IF;
  UPDATE public.community_comments SET content = p_content, edited_at = now()
    WHERE id = p_comment_id;
  PERFORM public.parse_comment_content(p_comment_id);
  RETURN jsonb_build_object('ok', true);
END;
$ecomm$;

-- ═══════════════════════════════════════════════════════════════════════
-- BOOKMARK RPC
-- ═══════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.toggle_community_bookmark(p_post_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $bm$
DECLARE
  v_uid uuid := auth.uid();
  v_existing boolean;
BEGIN
  IF v_uid IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated'); END IF;
  IF NOT public.can_read_post(p_post_id) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authorized');
  END IF;
  SELECT EXISTS (SELECT 1 FROM public.community_bookmarks
                 WHERE user_id = v_uid AND post_id = p_post_id) INTO v_existing;
  IF v_existing THEN
    DELETE FROM public.community_bookmarks WHERE user_id = v_uid AND post_id = p_post_id;
    RETURN jsonb_build_object('ok', true, 'action', 'removed');
  END IF;
  INSERT INTO public.community_bookmarks (user_id, post_id) VALUES (v_uid, p_post_id);
  RETURN jsonb_build_object('ok', true, 'action', 'added');
END;
$bm$;

GRANT EXECUTE ON FUNCTION public.toggle_community_bookmark(uuid) TO authenticated;

-- ═══════════════════════════════════════════════════════════════════════
-- TRENDING HASHTAGS / SEARCH
-- ═══════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.get_trending_hashtags(
  p_limit int DEFAULT 20,
  p_window_days int DEFAULT 7
) RETURNS TABLE (tag text, usage_count int, last_used_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $trend$
  SELECT tag, usage_count, last_used_at
  FROM public.community_hashtags
  WHERE last_used_at > now() - (p_window_days || ' days')::interval
  ORDER BY usage_count DESC, last_used_at DESC
  LIMIT p_limit;
$trend$;

GRANT EXECUTE ON FUNCTION public.get_trending_hashtags(int, int) TO authenticated, anon;

-- Hashtag feed: belirli tag'a sahip postları döner (RLS post read kuralları geçerli)
CREATE OR REPLACE FUNCTION public.get_posts_by_hashtag(
  p_tag text,
  p_limit int DEFAULT 50
) RETURNS SETOF public.community_posts
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public
AS $byhash$
  SELECT cp.*
  FROM public.community_posts cp
  JOIN public.community_post_hashtags h ON h.post_id = cp.id
  WHERE h.tag = lower(p_tag)
    AND cp.status = 'active'
  ORDER BY cp.created_at DESC
  LIMIT p_limit;
$byhash$;

GRANT EXECUTE ON FUNCTION public.get_posts_by_hashtag(text, int) TO authenticated, anon;

-- Search: ILIKE basit (post content). RLS geçerli.
CREATE OR REPLACE FUNCTION public.search_community_posts(
  p_query text,
  p_limit int DEFAULT 50
) RETURNS SETOF public.community_posts
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public
AS $search$
  SELECT *
  FROM public.community_posts
  WHERE status = 'active'
    AND (content ILIKE '%' || p_query || '%')
  ORDER BY created_at DESC
  LIMIT p_limit;
$search$;

GRANT EXECUTE ON FUNCTION public.search_community_posts(text, int) TO authenticated, anon;

-- ═══════════════════════════════════════════════════════════════════════
-- DB TRIGGER: mention insert sonrası push
-- ═══════════════════════════════════════════════════════════════════════
-- AFTER INSERT mentions → notifications.edge_url + service_token config'inden
-- pg_net ile /post_mention çağırır. Edge function notified=true yapar.
-- Config boş ise sessizce skip (lokal/dev'de cron çalışmaz pattern'i ile uyumlu).

CREATE OR REPLACE FUNCTION public.notify_post_mention()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $notif_mention$
DECLARE
  v_url text;
  v_token text;
BEGIN
  -- Config oku (jsonb text, "..." quotes strip)
  SELECT replace(value::text, '"', '') INTO v_url
    FROM public.app_config WHERE key = 'notifications.edge_url';
  SELECT replace(value::text, '"', '') INTO v_token
    FROM public.app_config WHERE key = 'notifications.service_token';

  IF v_url IS NULL OR length(v_url) < 5 THEN
    RETURN NEW;
  END IF;

  PERFORM extensions.net.http_post(
    url := v_url || '/post_mention',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || COALESCE(v_token, ''),
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object('mention_id', NEW.id)
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'notify_post_mention failed: %', SQLERRM;
  RETURN NEW;
END;
$notif_mention$;

DROP TRIGGER IF EXISTS community_mentions_notify ON public.community_mentions;
CREATE TRIGGER community_mentions_notify
  AFTER INSERT ON public.community_mentions
  FOR EACH ROW EXECUTE FUNCTION public.notify_post_mention();

DO $$ BEGIN
  RAISE NOTICE 'Sprint 6.B.1 — mentions + hashtags + bookmarks + parser + push trigger aktif';
END $$;

COMMIT;
