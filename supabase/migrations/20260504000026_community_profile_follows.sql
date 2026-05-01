-- AirSpeak — Sprint 6.E.1 — Profile entegrasyonu + asimetrik follows
--
-- - profiles: community_post_count + community_follower_count + community_following_count (denormalized)
-- - community_follows: asimetrik (follower → followed), idempotent
--   (friendships'a dokunulmaz — squad/lig için kullanılıyor; bu farklı semantik)
-- - Triggers: count denormalize (posts.status='active' transitions + follows insert/delete)
-- - RPC: toggle_follow, is_following_user, get_user_posts (RLS preserve)

BEGIN;

-- ─── 1. profiles count kolonları ────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS community_post_count int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS community_follower_count int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS community_following_count int NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS profiles_community_post_count_idx
  ON public.profiles (community_post_count DESC) WHERE community_post_count > 0;
CREATE INDEX IF NOT EXISTS profiles_community_follower_count_idx
  ON public.profiles (community_follower_count DESC) WHERE community_follower_count > 0;

COMMENT ON COLUMN public.profiles.community_post_count IS 'Aktif community post sayısı (denormalized)';
COMMENT ON COLUMN public.profiles.community_follower_count IS 'Bu kullanıcıyı takip eden sayısı';
COMMENT ON COLUMN public.profiles.community_following_count IS 'Bu kullanıcının takip ettiği sayısı';

-- ─── 2. community_follows ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.community_follows (
  follower_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  followed_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, followed_id),
  CHECK (follower_id <> followed_id)
);

CREATE INDEX IF NOT EXISTS community_follows_followed_idx
  ON public.community_follows (followed_id, created_at DESC);
CREATE INDEX IF NOT EXISTS community_follows_follower_idx
  ON public.community_follows (follower_id, created_at DESC);

ALTER TABLE public.community_follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS community_follows_read ON public.community_follows;
CREATE POLICY community_follows_read ON public.community_follows
  FOR SELECT USING (true);  -- Public — kim kimi takip ediyor görünür

DROP POLICY IF EXISTS community_follows_insert ON public.community_follows;
CREATE POLICY community_follows_insert ON public.community_follows
  FOR INSERT WITH CHECK (follower_id = auth.uid());

DROP POLICY IF EXISTS community_follows_delete ON public.community_follows;
CREATE POLICY community_follows_delete ON public.community_follows
  FOR DELETE USING (follower_id = auth.uid());

-- ═══════════════════════════════════════════════════════════════════════
-- DENORMALIZED COUNT TRIGGERS
-- ═══════════════════════════════════════════════════════════════════════

-- ─── 3. user community_post_count sync ──────────────────────────────────
CREATE OR REPLACE FUNCTION public.user_post_count_sync()
RETURNS trigger
LANGUAGE plpgsql
AS $upc$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
    UPDATE public.profiles SET community_post_count = community_post_count + 1
      WHERE id = NEW.author_id;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'active' THEN
    UPDATE public.profiles SET community_post_count = greatest(0, community_post_count - 1)
      WHERE id = OLD.author_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status = 'active' AND NEW.status <> 'active' THEN
      UPDATE public.profiles SET community_post_count = greatest(0, community_post_count - 1)
        WHERE id = NEW.author_id;
    ELSIF OLD.status <> 'active' AND NEW.status = 'active' THEN
      UPDATE public.profiles SET community_post_count = community_post_count + 1
        WHERE id = NEW.author_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$upc$;

DROP TRIGGER IF EXISTS community_posts_user_count ON public.community_posts;
CREATE TRIGGER community_posts_user_count
  AFTER INSERT OR UPDATE OR DELETE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.user_post_count_sync();

-- ─── 4. follower/following count sync ───────────────────────────────────
CREATE OR REPLACE FUNCTION public.user_follow_count_sync()
RETURNS trigger
LANGUAGE plpgsql
AS $ufc$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles SET community_follower_count = community_follower_count + 1
      WHERE id = NEW.followed_id;
    UPDATE public.profiles SET community_following_count = community_following_count + 1
      WHERE id = NEW.follower_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles SET community_follower_count = greatest(0, community_follower_count - 1)
      WHERE id = OLD.followed_id;
    UPDATE public.profiles SET community_following_count = greatest(0, community_following_count - 1)
      WHERE id = OLD.follower_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$ufc$;

DROP TRIGGER IF EXISTS community_follows_count_sync ON public.community_follows;
CREATE TRIGGER community_follows_count_sync
  AFTER INSERT OR DELETE ON public.community_follows
  FOR EACH ROW EXECUTE FUNCTION public.user_follow_count_sync();

-- ═══════════════════════════════════════════════════════════════════════
-- RPC FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════════

-- ─── 5. toggle_follow ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.toggle_community_follow(p_target_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $tf$
DECLARE
  v_uid uuid := auth.uid();
  v_existing boolean;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated');
  END IF;
  IF v_uid = p_target_id THEN
    RETURN jsonb_build_object('ok', false, 'error', 'cannot_follow_self');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_target_id) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'user_not_found');
  END IF;
  SELECT EXISTS (
    SELECT 1 FROM public.community_follows
    WHERE follower_id = v_uid AND followed_id = p_target_id
  ) INTO v_existing;
  IF v_existing THEN
    DELETE FROM public.community_follows WHERE follower_id = v_uid AND followed_id = p_target_id;
    RETURN jsonb_build_object('ok', true, 'action', 'unfollowed');
  END IF;
  INSERT INTO public.community_follows (follower_id, followed_id) VALUES (v_uid, p_target_id);
  RETURN jsonb_build_object('ok', true, 'action', 'followed');
END;
$tf$;

GRANT EXECUTE ON FUNCTION public.toggle_community_follow(uuid) TO authenticated;

-- ─── 6. is_following_user ────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_following_user(p_target_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $isf$
  SELECT EXISTS (
    SELECT 1 FROM public.community_follows
    WHERE follower_id = auth.uid() AND followed_id = p_target_id
  );
$isf$;

GRANT EXECUTE ON FUNCTION public.is_following_user(uuid) TO authenticated, anon;

-- ─── 7. get_user_community_posts ────────────────────────────────────────
-- Bir kullanıcının post'ları (RLS post read kuralları geçerli — gizli grupların
-- post'ları başkalarına görünmez).
CREATE OR REPLACE FUNCTION public.get_user_community_posts(
  p_user_id uuid,
  p_limit int DEFAULT 50
) RETURNS SETOF public.community_posts
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public
AS $gucp$
  SELECT *
  FROM public.community_posts
  WHERE author_id = p_user_id
    AND status = 'active'
  ORDER BY created_at DESC
  LIMIT p_limit;
$gucp$;

GRANT EXECUTE ON FUNCTION public.get_user_community_posts(uuid, int) TO authenticated, anon;

DO $$ BEGIN
  RAISE NOTICE 'Sprint 6.E.1 — community_follows + post/follower counts + 3 RPC aktif';
END $$;

COMMIT;
