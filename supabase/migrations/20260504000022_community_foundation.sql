-- AirSpeak — Sprint 6.A.1 — Community foundation
--
-- - community_groups + community_group_members (squadrons'tan ayrı; lig cohort vs komünite grupları semantik farklı)
-- - community_posts (text + max 4 image_urls), community_comments (max 3 derin), community_reactions (4 emoji toggle)
-- - 4 privacy seviyesi: open / closed / secret / premium
-- - Group-scoped role: admin / mod / member
-- - Storage bucket: post-images
-- - RPC: create_group / join / request_join / approve_join / leave / ban_member /
--        create_post / edit_post / delete_post / pin_post /
--        create_comment / edit_comment / delete_comment / react
-- - Denormalized counts: member_count / post_count / comment_count / reaction_count

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- ─── 1. community_groups ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.community_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL CHECK (slug ~ '^[a-z0-9_-]+$' AND length(slug) BETWEEN 3 AND 40),
  name text NOT NULL CHECK (length(name) BETWEEN 2 AND 80),
  description text CHECK (description IS NULL OR length(description) <= 500),
  emoji text NOT NULL DEFAULT '✈️',
  banner_url text,
  privacy text NOT NULL DEFAULT 'open'
    CHECK (privacy IN ('open', 'closed', 'secret', 'premium')),
  -- Sadece privacy='secret' için. Hash: digest(passcode || id::text, 'sha256').
  -- RLS bu kolonu OKUMAYI engellemez ama RPC içinde sadece doğrulama amaçlı kullanılır.
  -- Hassas değil (grup şifresi, hesap şifresi değil) ama yine de raw saklamıyoruz.
  secret_passcode_hash text,
  capacity int NOT NULL DEFAULT 100 CHECK (capacity BETWEEN 2 AND 5000),
  member_count int NOT NULL DEFAULT 0,
  post_count int NOT NULL DEFAULT 0,
  -- Sadece premium kullanıcılar oluşturabilir grup oluşturma RPC içinde kontrol edilir.
  -- Bu flag yalnızca grup PRIVACY=premium ise üyelik şartını gösterir.
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS community_groups_privacy_idx
  ON public.community_groups (privacy, member_count DESC)
  WHERE privacy IN ('open', 'closed', 'premium');
CREATE INDEX IF NOT EXISTS community_groups_creator_idx
  ON public.community_groups (created_by);

DROP TRIGGER IF EXISTS set_community_groups_updated_at ON public.community_groups;
CREATE TRIGGER set_community_groups_updated_at
  BEFORE UPDATE ON public.community_groups
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.community_groups ENABLE ROW LEVEL SECURITY;

-- ─── 2. community_group_members ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.community_group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.community_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'mod', 'member')),
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'pending', 'banned')),
  joined_at timestamptz NOT NULL DEFAULT now(),
  banned_at timestamptz,
  banned_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ban_reason text CHECK (ban_reason IS NULL OR length(ban_reason) <= 500),
  UNIQUE (group_id, user_id)
);

CREATE INDEX IF NOT EXISTS community_group_members_user_idx
  ON public.community_group_members (user_id, status);
CREATE INDEX IF NOT EXISTS community_group_members_group_idx
  ON public.community_group_members (group_id, status);
CREATE INDEX IF NOT EXISTS community_group_members_pending_idx
  ON public.community_group_members (group_id)
  WHERE status = 'pending';

ALTER TABLE public.community_group_members ENABLE ROW LEVEL SECURITY;

-- Helper: bir kullanıcı bir grubun aktif üyesi mi?
CREATE OR REPLACE FUNCTION public.is_group_member(p_group_id uuid, p_user_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $is_member$
  SELECT EXISTS (
    SELECT 1 FROM public.community_group_members
    WHERE group_id = p_group_id
      AND user_id = COALESCE(p_user_id, auth.uid())
      AND status = 'active'
  );
$is_member$;

GRANT EXECUTE ON FUNCTION public.is_group_member(uuid, uuid) TO authenticated, anon;

-- Helper: kullanıcı grup admin/mod mi?
CREATE OR REPLACE FUNCTION public.is_group_staff(p_group_id uuid, p_user_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $is_staff$
  SELECT EXISTS (
    SELECT 1 FROM public.community_group_members
    WHERE group_id = p_group_id
      AND user_id = COALESCE(p_user_id, auth.uid())
      AND status = 'active'
      AND role IN ('admin', 'mod')
  );
$is_staff$;

GRANT EXECUTE ON FUNCTION public.is_group_staff(uuid, uuid) TO authenticated, anon;

-- ─── 3. community_posts ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.community_groups(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL CHECK (length(content) BETWEEN 1 AND 10000),
  image_urls text[] NOT NULL DEFAULT '{}'
    CHECK (array_length(image_urls, 1) IS NULL OR array_length(image_urls, 1) <= 4),
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'hidden', 'deleted')),
  pinned boolean NOT NULL DEFAULT false,
  comment_count int NOT NULL DEFAULT 0,
  reaction_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  edited_at timestamptz,
  deleted_at timestamptz
);

CREATE INDEX IF NOT EXISTS community_posts_group_idx
  ON public.community_posts (group_id, pinned DESC, created_at DESC)
  WHERE status = 'active';
CREATE INDEX IF NOT EXISTS community_posts_author_idx
  ON public.community_posts (author_id, created_at DESC);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- ─── 4. community_comments ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.community_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_comment_id uuid REFERENCES public.community_comments(id) ON DELETE CASCADE,
  content text NOT NULL CHECK (length(content) BETWEEN 1 AND 2000),
  -- depth 0=top, 1=reply, 2=reply-of-reply (max 3 derin: 0/1/2)
  depth int NOT NULL DEFAULT 0 CHECK (depth BETWEEN 0 AND 2),
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'hidden', 'deleted')),
  reaction_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  edited_at timestamptz,
  deleted_at timestamptz
);

CREATE INDEX IF NOT EXISTS community_comments_post_idx
  ON public.community_comments (post_id, created_at)
  WHERE status = 'active';
CREATE INDEX IF NOT EXISTS community_comments_parent_idx
  ON public.community_comments (parent_comment_id, created_at)
  WHERE status = 'active';

ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;

-- ─── 5. community_reactions ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.community_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type text NOT NULL CHECK (target_type IN ('post', 'comment')),
  target_id uuid NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- 4 reaction: thumbs / heart / target-bullseye / thinking
  kind text NOT NULL CHECK (kind IN ('like', 'love', 'goal', 'thinking')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (target_type, target_id, user_id, kind)
);

CREATE INDEX IF NOT EXISTS community_reactions_target_idx
  ON public.community_reactions (target_type, target_id);
CREATE INDEX IF NOT EXISTS community_reactions_user_idx
  ON public.community_reactions (user_id, created_at DESC);

ALTER TABLE public.community_reactions ENABLE ROW LEVEL SECURITY;

-- ═════════════════════════════════════════════════════════════════════════
-- RLS POLICIES
-- ═════════════════════════════════════════════════════════════════════════

-- ─── 6. RLS: community_groups ───────────────────────────────────────────
DROP POLICY IF EXISTS community_groups_read ON public.community_groups;
CREATE POLICY community_groups_read ON public.community_groups
  FOR SELECT USING (
    -- open / closed / premium → herkes (premium client-side gate; row visibility ayrı)
    privacy IN ('open', 'closed', 'premium')
    -- secret → sadece üye veya yaratıcı veya admin
    OR (privacy = 'secret' AND (
      created_by = auth.uid()
      OR public.is_group_member(id, auth.uid())
      OR public.is_admin_user()
    ))
  );

DROP POLICY IF EXISTS community_groups_insert ON public.community_groups;
CREATE POLICY community_groups_insert ON public.community_groups
  FOR INSERT WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS community_groups_update ON public.community_groups;
CREATE POLICY community_groups_update ON public.community_groups
  FOR UPDATE USING (
    public.is_group_staff(id, auth.uid()) OR public.is_admin_user()
  )
  WITH CHECK (
    public.is_group_staff(id, auth.uid()) OR public.is_admin_user()
  );

DROP POLICY IF EXISTS community_groups_delete ON public.community_groups;
CREATE POLICY community_groups_delete ON public.community_groups
  FOR DELETE USING (created_by = auth.uid() OR public.has_admin_role('super_admin'));

-- ─── 7. RLS: community_group_members ────────────────────────────────────
DROP POLICY IF EXISTS community_group_members_read ON public.community_group_members;
CREATE POLICY community_group_members_read ON public.community_group_members
  FOR SELECT USING (
    -- Kullanıcı kendisi her zaman okur (banned olduğunu bilmeli)
    user_id = auth.uid()
    -- Üyeler kendi grup üyelerini okur
    OR public.is_group_member(group_id, auth.uid())
    -- Grup staff bütün members + pending'leri görür
    OR public.is_group_staff(group_id, auth.uid())
    -- Admin
    OR public.is_admin_user()
  );

-- INSERT yok — RPC üzerinden yapılır (join_group / request_join_group)
DROP POLICY IF EXISTS community_group_members_insert ON public.community_group_members;
CREATE POLICY community_group_members_insert ON public.community_group_members
  FOR INSERT WITH CHECK (false);

-- UPDATE: sadece grup staff (rol/status değişiklik için RPC kullanır)
DROP POLICY IF EXISTS community_group_members_update ON public.community_group_members;
CREATE POLICY community_group_members_update ON public.community_group_members
  FOR UPDATE USING (
    public.is_group_staff(group_id, auth.uid()) OR public.is_admin_user()
  );

-- DELETE: kendisi (leave) veya staff (kick)
DROP POLICY IF EXISTS community_group_members_delete ON public.community_group_members;
CREATE POLICY community_group_members_delete ON public.community_group_members
  FOR DELETE USING (
    user_id = auth.uid()
    OR public.is_group_staff(group_id, auth.uid())
    OR public.is_admin_user()
  );

-- ─── 8. RLS: community_posts ────────────────────────────────────────────
-- Bir post okumak için kullanıcı: post grubunu okuyabilmeli + grup secret değilse açık,
-- secret/closed ise üye, premium ise premium aktif.
CREATE OR REPLACE FUNCTION public.can_read_group(p_group_id uuid)
RETURNS boolean
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $can_read$
DECLARE
  v_privacy text;
  v_uid uuid := auth.uid();
BEGIN
  SELECT privacy INTO v_privacy FROM public.community_groups WHERE id = p_group_id;
  IF NOT FOUND THEN RETURN false; END IF;
  IF v_privacy = 'open' THEN RETURN true; END IF;
  IF v_uid IS NULL THEN RETURN false; END IF;
  IF public.is_admin_user() THEN RETURN true; END IF;
  IF v_privacy = 'closed' THEN
    RETURN public.is_group_member(p_group_id, v_uid);
  END IF;
  IF v_privacy = 'secret' THEN
    RETURN public.is_group_member(p_group_id, v_uid);
  END IF;
  IF v_privacy = 'premium' THEN
    -- Premium grupta sadece premium aktif olanlar okur
    RETURN public.is_premium_user(v_uid) AND public.is_group_member(p_group_id, v_uid);
  END IF;
  RETURN false;
END;
$can_read$;

GRANT EXECUTE ON FUNCTION public.can_read_group(uuid) TO authenticated, anon;

DROP POLICY IF EXISTS community_posts_read ON public.community_posts;
CREATE POLICY community_posts_read ON public.community_posts
  FOR SELECT USING (
    status = 'active' AND public.can_read_group(group_id)
    OR public.is_admin_user()
  );

-- INSERT/UPDATE/DELETE RPC üzerinden — RLS açık ama check yazar kısıtı
DROP POLICY IF EXISTS community_posts_insert ON public.community_posts;
CREATE POLICY community_posts_insert ON public.community_posts
  FOR INSERT WITH CHECK (
    author_id = auth.uid()
    AND public.is_group_member(group_id, auth.uid())
  );

DROP POLICY IF EXISTS community_posts_update ON public.community_posts;
CREATE POLICY community_posts_update ON public.community_posts
  FOR UPDATE USING (
    author_id = auth.uid()
    OR public.is_group_staff(group_id, auth.uid())
    OR public.is_admin_user()
  );

DROP POLICY IF EXISTS community_posts_delete ON public.community_posts;
CREATE POLICY community_posts_delete ON public.community_posts
  FOR DELETE USING (
    author_id = auth.uid()
    OR public.is_group_staff(group_id, auth.uid())
    OR public.has_admin_role('super_admin')
  );

-- ─── 9. RLS: community_comments ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.can_read_post(p_post_id uuid)
RETURNS boolean
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $can_read_post$
DECLARE
  v_group_id uuid;
  v_status text;
BEGIN
  SELECT group_id, status INTO v_group_id, v_status FROM public.community_posts WHERE id = p_post_id;
  IF NOT FOUND OR v_status <> 'active' THEN
    RETURN public.is_admin_user();
  END IF;
  RETURN public.can_read_group(v_group_id);
END;
$can_read_post$;

GRANT EXECUTE ON FUNCTION public.can_read_post(uuid) TO authenticated, anon;

DROP POLICY IF EXISTS community_comments_read ON public.community_comments;
CREATE POLICY community_comments_read ON public.community_comments
  FOR SELECT USING (
    (status = 'active' AND public.can_read_post(post_id))
    OR public.is_admin_user()
  );

DROP POLICY IF EXISTS community_comments_insert ON public.community_comments;
CREATE POLICY community_comments_insert ON public.community_comments
  FOR INSERT WITH CHECK (
    author_id = auth.uid()
    AND public.can_read_post(post_id)
  );

DROP POLICY IF EXISTS community_comments_update ON public.community_comments;
CREATE POLICY community_comments_update ON public.community_comments
  FOR UPDATE USING (
    author_id = auth.uid() OR public.is_admin_user()
  );

DROP POLICY IF EXISTS community_comments_delete ON public.community_comments;
CREATE POLICY community_comments_delete ON public.community_comments
  FOR DELETE USING (
    author_id = auth.uid() OR public.has_admin_role('super_admin')
  );

-- ─── 10. RLS: community_reactions ───────────────────────────────────────
DROP POLICY IF EXISTS community_reactions_read ON public.community_reactions;
CREATE POLICY community_reactions_read ON public.community_reactions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS community_reactions_insert ON public.community_reactions;
CREATE POLICY community_reactions_insert ON public.community_reactions
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS community_reactions_delete ON public.community_reactions;
CREATE POLICY community_reactions_delete ON public.community_reactions
  FOR DELETE USING (user_id = auth.uid());

-- ═════════════════════════════════════════════════════════════════════════
-- DENORMALIZED COUNT TRIGGERS
-- ═════════════════════════════════════════════════════════════════════════

-- ─── 11. member_count ─────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.community_groups_member_count_sync()
RETURNS trigger
LANGUAGE plpgsql
AS $sync_member$
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.status = 'active') THEN
    UPDATE public.community_groups SET member_count = member_count + 1 WHERE id = NEW.group_id;
  ELSIF (TG_OP = 'DELETE' AND OLD.status = 'active') THEN
    UPDATE public.community_groups SET member_count = greatest(0, member_count - 1) WHERE id = OLD.group_id;
  ELSIF (TG_OP = 'UPDATE') THEN
    IF OLD.status = 'active' AND NEW.status <> 'active' THEN
      UPDATE public.community_groups SET member_count = greatest(0, member_count - 1) WHERE id = NEW.group_id;
    ELSIF OLD.status <> 'active' AND NEW.status = 'active' THEN
      UPDATE public.community_groups SET member_count = member_count + 1 WHERE id = NEW.group_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$sync_member$;

DROP TRIGGER IF EXISTS community_group_members_count_sync ON public.community_group_members;
CREATE TRIGGER community_group_members_count_sync
  AFTER INSERT OR UPDATE OR DELETE ON public.community_group_members
  FOR EACH ROW EXECUTE FUNCTION public.community_groups_member_count_sync();

-- ─── 12. post_count ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.community_posts_count_sync()
RETURNS trigger
LANGUAGE plpgsql
AS $sync_post$
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.status = 'active') THEN
    UPDATE public.community_groups SET post_count = post_count + 1 WHERE id = NEW.group_id;
  ELSIF (TG_OP = 'DELETE' AND OLD.status = 'active') THEN
    UPDATE public.community_groups SET post_count = greatest(0, post_count - 1) WHERE id = OLD.group_id;
  ELSIF (TG_OP = 'UPDATE') THEN
    IF OLD.status = 'active' AND NEW.status <> 'active' THEN
      UPDATE public.community_groups SET post_count = greatest(0, post_count - 1) WHERE id = NEW.group_id;
    ELSIF OLD.status <> 'active' AND NEW.status = 'active' THEN
      UPDATE public.community_groups SET post_count = post_count + 1 WHERE id = NEW.group_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$sync_post$;

DROP TRIGGER IF EXISTS community_posts_count_sync ON public.community_posts;
CREATE TRIGGER community_posts_count_sync
  AFTER INSERT OR UPDATE OR DELETE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.community_posts_count_sync();

-- ─── 13. comment_count ──────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.community_comments_count_sync()
RETURNS trigger
LANGUAGE plpgsql
AS $sync_comm$
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.status = 'active') THEN
    UPDATE public.community_posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  ELSIF (TG_OP = 'DELETE' AND OLD.status = 'active') THEN
    UPDATE public.community_posts SET comment_count = greatest(0, comment_count - 1) WHERE id = OLD.post_id;
  ELSIF (TG_OP = 'UPDATE') THEN
    IF OLD.status = 'active' AND NEW.status <> 'active' THEN
      UPDATE public.community_posts SET comment_count = greatest(0, comment_count - 1) WHERE id = NEW.post_id;
    ELSIF OLD.status <> 'active' AND NEW.status = 'active' THEN
      UPDATE public.community_posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$sync_comm$;

DROP TRIGGER IF EXISTS community_comments_count_sync ON public.community_comments;
CREATE TRIGGER community_comments_count_sync
  AFTER INSERT OR UPDATE OR DELETE ON public.community_comments
  FOR EACH ROW EXECUTE FUNCTION public.community_comments_count_sync();

-- ─── 14. reaction_count ─────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.community_reactions_count_sync()
RETURNS trigger
LANGUAGE plpgsql
AS $sync_react$
DECLARE
  v_target_type text;
  v_target_id uuid;
  v_delta int;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_target_type := NEW.target_type;
    v_target_id := NEW.target_id;
    v_delta := 1;
  ELSE
    v_target_type := OLD.target_type;
    v_target_id := OLD.target_id;
    v_delta := -1;
  END IF;
  IF v_target_type = 'post' THEN
    UPDATE public.community_posts
       SET reaction_count = greatest(0, reaction_count + v_delta)
     WHERE id = v_target_id;
  ELSIF v_target_type = 'comment' THEN
    UPDATE public.community_comments
       SET reaction_count = greatest(0, reaction_count + v_delta)
     WHERE id = v_target_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$sync_react$;

DROP TRIGGER IF EXISTS community_reactions_count_sync ON public.community_reactions;
CREATE TRIGGER community_reactions_count_sync
  AFTER INSERT OR DELETE ON public.community_reactions
  FOR EACH ROW EXECUTE FUNCTION public.community_reactions_count_sync();

-- ═════════════════════════════════════════════════════════════════════════
-- RPC FUNCTIONS
-- ═════════════════════════════════════════════════════════════════════════

-- ─── 15. RPC: create_group ──────────────────────────────────────────────
-- Premium privacy = sadece premium kullanıcı oluşturabilir.
CREATE OR REPLACE FUNCTION public.create_community_group(
  p_slug text,
  p_name text,
  p_description text DEFAULT NULL,
  p_emoji text DEFAULT '✈️',
  p_privacy text DEFAULT 'open',
  p_capacity int DEFAULT 100,
  p_passcode text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions
AS $cgrp$
DECLARE
  v_uid uuid := auth.uid();
  v_id uuid;
  v_hash text;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated');
  END IF;

  IF p_privacy NOT IN ('open', 'closed', 'secret', 'premium') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_privacy');
  END IF;

  -- Premium grup oluşturma yetkisi: sadece premium kullanıcı
  IF p_privacy = 'premium' AND NOT public.is_premium_user(v_uid) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'premium_required');
  END IF;

  -- Secret grup için passcode zorunlu
  IF p_privacy = 'secret' THEN
    IF p_passcode IS NULL OR length(p_passcode) < 4 THEN
      RETURN jsonb_build_object('ok', false, 'error', 'passcode_min_4_chars');
    END IF;
  END IF;

  v_id := gen_random_uuid();

  IF p_passcode IS NOT NULL THEN
    v_hash := encode(extensions.digest(p_passcode || v_id::text, 'sha256'), 'hex');
  END IF;

  INSERT INTO public.community_groups (
    id, slug, name, description, emoji, privacy, capacity, secret_passcode_hash, created_by
  ) VALUES (
    v_id, p_slug, p_name, p_description, COALESCE(p_emoji, '✈️'),
    p_privacy, COALESCE(p_capacity, 100), v_hash, v_uid
  );

  -- Yaratıcı otomatik admin
  INSERT INTO public.community_group_members (group_id, user_id, role, status)
  VALUES (v_id, v_uid, 'admin', 'active');

  RETURN jsonb_build_object('ok', true, 'id', v_id);
EXCEPTION WHEN unique_violation THEN
  RETURN jsonb_build_object('ok', false, 'error', 'slug_already_exists');
END;
$cgrp$;

GRANT EXECUTE ON FUNCTION public.create_community_group(text, text, text, text, text, int, text) TO authenticated;

-- ─── 16. RPC: join_group ─────────────────────────────────────────────────
-- open: direkt katıl
-- closed: pending request
-- secret: passcode doğru ise direkt katıl
-- premium: premium ise direkt katıl, değilse error
CREATE OR REPLACE FUNCTION public.join_community_group(
  p_group_id uuid,
  p_passcode text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions
AS $jgrp$
DECLARE
  v_uid uuid := auth.uid();
  v_grp RECORD;
  v_existing RECORD;
  v_status text;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated');
  END IF;

  SELECT id, privacy, capacity, member_count, secret_passcode_hash
    INTO v_grp FROM public.community_groups WHERE id = p_group_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'group_not_found');
  END IF;

  -- Mevcut üyelik
  SELECT id, status INTO v_existing
    FROM public.community_group_members
    WHERE group_id = p_group_id AND user_id = v_uid;

  IF FOUND THEN
    IF v_existing.status = 'banned' THEN
      RETURN jsonb_build_object('ok', false, 'error', 'banned');
    END IF;
    IF v_existing.status = 'active' THEN
      RETURN jsonb_build_object('ok', true, 'already_joined', true);
    END IF;
    -- pending — closed'da bekliyor
    RETURN jsonb_build_object('ok', true, 'pending', true);
  END IF;

  -- Capacity check
  IF v_grp.member_count >= v_grp.capacity THEN
    RETURN jsonb_build_object('ok', false, 'error', 'group_full');
  END IF;

  -- Privacy logic
  IF v_grp.privacy = 'open' THEN
    v_status := 'active';
  ELSIF v_grp.privacy = 'closed' THEN
    v_status := 'pending';
  ELSIF v_grp.privacy = 'secret' THEN
    IF p_passcode IS NULL OR
       encode(extensions.digest(p_passcode || v_grp.id::text, 'sha256'), 'hex') <> v_grp.secret_passcode_hash THEN
      RETURN jsonb_build_object('ok', false, 'error', 'invalid_passcode');
    END IF;
    v_status := 'active';
  ELSIF v_grp.privacy = 'premium' THEN
    IF NOT public.is_premium_user(v_uid) THEN
      RETURN jsonb_build_object('ok', false, 'error', 'premium_required');
    END IF;
    v_status := 'active';
  ELSE
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_privacy');
  END IF;

  INSERT INTO public.community_group_members (group_id, user_id, role, status)
  VALUES (p_group_id, v_uid, 'member', v_status);

  RETURN jsonb_build_object('ok', true, 'status', v_status);
END;
$jgrp$;

GRANT EXECUTE ON FUNCTION public.join_community_group(uuid, text) TO authenticated;

-- ─── 17. RPC: approve_join_request (closed group admin/mod) ─────────────
CREATE OR REPLACE FUNCTION public.approve_community_join(
  p_member_id uuid,
  p_approve boolean DEFAULT true
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $appr$
DECLARE
  v_uid uuid := auth.uid();
  v_mem RECORD;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated');
  END IF;

  SELECT id, group_id, status INTO v_mem
    FROM public.community_group_members WHERE id = p_member_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'member_not_found');
  END IF;
  IF v_mem.status <> 'pending' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_pending');
  END IF;
  IF NOT public.is_group_staff(v_mem.group_id, v_uid) AND NOT public.is_admin_user() THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authorized');
  END IF;

  IF p_approve THEN
    UPDATE public.community_group_members SET status = 'active' WHERE id = p_member_id;
  ELSE
    DELETE FROM public.community_group_members WHERE id = p_member_id;
  END IF;
  RETURN jsonb_build_object('ok', true, 'approved', p_approve);
END;
$appr$;

GRANT EXECUTE ON FUNCTION public.approve_community_join(uuid, boolean) TO authenticated;

-- ─── 18. RPC: leave_group ───────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.leave_community_group(p_group_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $leave$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated');
  END IF;
  DELETE FROM public.community_group_members WHERE group_id = p_group_id AND user_id = v_uid;
  RETURN jsonb_build_object('ok', true);
END;
$leave$;

GRANT EXECUTE ON FUNCTION public.leave_community_group(uuid) TO authenticated;

-- ─── 19. RPC: ban_group_member (staff) ──────────────────────────────────
CREATE OR REPLACE FUNCTION public.ban_community_member(
  p_group_id uuid,
  p_user_id uuid,
  p_reason text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $ban$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated');
  END IF;
  IF NOT public.is_group_staff(p_group_id, v_uid) AND NOT public.is_admin_user() THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authorized');
  END IF;
  -- Yaratıcı banlanamaz
  IF EXISTS (SELECT 1 FROM public.community_groups WHERE id = p_group_id AND created_by = p_user_id) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'cannot_ban_creator');
  END IF;

  UPDATE public.community_group_members SET
    status = 'banned',
    banned_at = now(),
    banned_by = v_uid,
    ban_reason = p_reason
  WHERE group_id = p_group_id AND user_id = p_user_id;

  RETURN jsonb_build_object('ok', true);
END;
$ban$;

GRANT EXECUTE ON FUNCTION public.ban_community_member(uuid, uuid, text) TO authenticated;

-- ─── 20. RPC: create_post ───────────────────────────────────────────────
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
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated');
  END IF;
  IF public.is_banned_user(v_uid) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'user_banned');
  END IF;
  IF NOT public.is_group_member(p_group_id, v_uid) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_a_member');
  END IF;
  IF p_image_urls IS NOT NULL AND array_length(p_image_urls, 1) > 4 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'max_4_images');
  END IF;

  v_id := gen_random_uuid();
  INSERT INTO public.community_posts (id, group_id, author_id, content, image_urls)
  VALUES (v_id, p_group_id, v_uid, p_content, COALESCE(p_image_urls, '{}'));

  RETURN jsonb_build_object('ok', true, 'id', v_id);
END;
$cpost$;

GRANT EXECUTE ON FUNCTION public.create_community_post(uuid, text, text[]) TO authenticated;

-- ─── 21. RPC: edit_post ─────────────────────────────────────────────────
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
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated');
  END IF;
  SELECT author_id, status INTO v_author, v_status
    FROM public.community_posts WHERE id = p_post_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'post_not_found');
  END IF;
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
  RETURN jsonb_build_object('ok', true);
END;
$epost$;

GRANT EXECUTE ON FUNCTION public.edit_community_post(uuid, text, text[]) TO authenticated;

-- ─── 22. RPC: delete_post (soft) ────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.delete_community_post(p_post_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $dpost$
DECLARE
  v_uid uuid := auth.uid();
  v_author uuid;
  v_group uuid;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated');
  END IF;
  SELECT author_id, group_id INTO v_author, v_group
    FROM public.community_posts WHERE id = p_post_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'post_not_found');
  END IF;
  IF v_author <> v_uid AND NOT public.is_group_staff(v_group, v_uid) AND NOT public.is_admin_user() THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authorized');
  END IF;
  UPDATE public.community_posts SET
    status = 'deleted',
    deleted_at = now()
  WHERE id = p_post_id;
  RETURN jsonb_build_object('ok', true);
END;
$dpost$;

GRANT EXECUTE ON FUNCTION public.delete_community_post(uuid) TO authenticated;

-- ─── 23. RPC: pin_post (staff) ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.pin_community_post(
  p_post_id uuid,
  p_pin boolean DEFAULT true
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $pin$
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
  IF NOT public.is_group_staff(v_group, v_uid) AND NOT public.is_admin_user() THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authorized');
  END IF;
  UPDATE public.community_posts SET pinned = p_pin WHERE id = p_post_id;
  RETURN jsonb_build_object('ok', true);
END;
$pin$;

GRANT EXECUTE ON FUNCTION public.pin_community_post(uuid, boolean) TO authenticated;

-- ─── 24. RPC: create_comment (depth check) ──────────────────────────────
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
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated');
  END IF;
  IF public.is_banned_user(v_uid) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'user_banned');
  END IF;
  IF NOT public.can_read_post(p_post_id) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authorized');
  END IF;

  IF p_parent_comment_id IS NOT NULL THEN
    SELECT depth, post_id INTO v_parent_depth, v_parent_post
      FROM public.community_comments WHERE id = p_parent_comment_id;
    IF NOT FOUND THEN
      RETURN jsonb_build_object('ok', false, 'error', 'parent_not_found');
    END IF;
    IF v_parent_post <> p_post_id THEN
      RETURN jsonb_build_object('ok', false, 'error', 'parent_post_mismatch');
    END IF;
    -- Max 3 derin (0/1/2). 2'ye reply gelirse depth=2 olarak flat tutulur (parent'la aynı seviye).
    v_depth := least(2, v_parent_depth + 1);
  END IF;

  v_id := gen_random_uuid();
  INSERT INTO public.community_comments (id, post_id, author_id, parent_comment_id, content, depth)
  VALUES (v_id, p_post_id, v_uid, p_parent_comment_id, p_content, v_depth);

  RETURN jsonb_build_object('ok', true, 'id', v_id, 'depth', v_depth);
END;
$ccomm$;

GRANT EXECUTE ON FUNCTION public.create_community_comment(uuid, text, uuid) TO authenticated;

-- ─── 25. RPC: edit_comment ──────────────────────────────────────────────
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
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated');
  END IF;
  SELECT author_id, status INTO v_author, v_status
    FROM public.community_comments WHERE id = p_comment_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'comment_not_found');
  END IF;
  IF v_author <> v_uid AND NOT public.is_admin_user() THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authorized');
  END IF;
  IF v_status <> 'active' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'comment_not_active');
  END IF;
  UPDATE public.community_comments SET content = p_content, edited_at = now()
    WHERE id = p_comment_id;
  RETURN jsonb_build_object('ok', true);
END;
$ecomm$;

GRANT EXECUTE ON FUNCTION public.edit_community_comment(uuid, text) TO authenticated;

-- ─── 26. RPC: delete_comment (soft) ─────────────────────────────────────
CREATE OR REPLACE FUNCTION public.delete_community_comment(p_comment_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $dcomm$
DECLARE
  v_uid uuid := auth.uid();
  v_author uuid;
  v_post uuid;
  v_group uuid;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated');
  END IF;
  SELECT cc.author_id, cc.post_id, cp.group_id
    INTO v_author, v_post, v_group
    FROM public.community_comments cc
    JOIN public.community_posts cp ON cp.id = cc.post_id
   WHERE cc.id = p_comment_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'comment_not_found');
  END IF;
  IF v_author <> v_uid AND NOT public.is_group_staff(v_group, v_uid) AND NOT public.is_admin_user() THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authorized');
  END IF;
  UPDATE public.community_comments SET status = 'deleted', deleted_at = now()
    WHERE id = p_comment_id;
  RETURN jsonb_build_object('ok', true);
END;
$dcomm$;

GRANT EXECUTE ON FUNCTION public.delete_community_comment(uuid) TO authenticated;

-- ─── 27. RPC: react (toggle) ────────────────────────────────────────────
-- Aynı kind varsa kaldırır, yoksa ekler. UNIQUE constraint sayesinde tek satır.
CREATE OR REPLACE FUNCTION public.react_community(
  p_target_type text,
  p_target_id uuid,
  p_kind text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $react$
DECLARE
  v_uid uuid := auth.uid();
  v_existing uuid;
  v_can_read boolean;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated');
  END IF;
  IF p_target_type NOT IN ('post', 'comment') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_target_type');
  END IF;
  IF p_kind NOT IN ('like', 'love', 'goal', 'thinking') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_kind');
  END IF;

  IF p_target_type = 'post' THEN
    v_can_read := public.can_read_post(p_target_id);
  ELSE
    SELECT public.can_read_post(post_id) INTO v_can_read
      FROM public.community_comments WHERE id = p_target_id;
  END IF;
  IF NOT v_can_read THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authorized');
  END IF;

  SELECT id INTO v_existing FROM public.community_reactions
   WHERE target_type = p_target_type AND target_id = p_target_id
     AND user_id = v_uid AND kind = p_kind;
  IF FOUND THEN
    DELETE FROM public.community_reactions WHERE id = v_existing;
    RETURN jsonb_build_object('ok', true, 'action', 'removed');
  END IF;
  INSERT INTO public.community_reactions (target_type, target_id, user_id, kind)
    VALUES (p_target_type, p_target_id, v_uid, p_kind);
  RETURN jsonb_build_object('ok', true, 'action', 'added');
END;
$react$;

GRANT EXECUTE ON FUNCTION public.react_community(text, uuid, text) TO authenticated;

-- ═════════════════════════════════════════════════════════════════════════
-- STORAGE: post-images bucket
-- ═════════════════════════════════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'post-images', 'post-images', true,
  5 * 1024 * 1024,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- post-images: public read (CDN), authenticated write (kendi kullanıcı klasörüne)
DROP POLICY IF EXISTS "post-images public read" ON storage.objects;
CREATE POLICY "post-images public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'post-images');

DROP POLICY IF EXISTS "post-images own write" ON storage.objects;
CREATE POLICY "post-images own write"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'post-images'
    AND auth.uid() IS NOT NULL
    -- Kullanıcı sadece <user_id>/* path'ine yazabilir
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "post-images own delete" ON storage.objects;
CREATE POLICY "post-images own delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'post-images'
    AND (auth.uid()::text = (storage.foldername(name))[1] OR public.has_admin_role('editor'))
  );

DO $$ BEGIN
  RAISE NOTICE 'Sprint 6.A.1 — community foundation: 5 tablo + 13 RPC + RLS + storage bucket aktif';
END $$;

COMMIT;
