-- ═══════════════════════════════════════════════════════════════════
-- Apple Submit Guideline 1.2 — User Block System
-- ═══════════════════════════════════════════════════════════════════
-- Kullanıcılar başka kullanıcıları engelleyebilir.
-- Engellenen kullanıcının içeriği (post + comment + reactions) görünmez.
-- Asimetrik: A blocks B → B hâlâ A'yı bloklamadıysa A'yı görebilir
-- (Apple gereksinim "tek yönlü engelleme").

-- ─── community_blocks tablosu ───
CREATE TABLE IF NOT EXISTS public.community_blocks (
  blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id),
  CONSTRAINT no_self_block CHECK (blocker_id <> blocked_id)
);

CREATE INDEX IF NOT EXISTS idx_community_blocks_blocker
  ON public.community_blocks (blocker_id);
CREATE INDEX IF NOT EXISTS idx_community_blocks_blocked
  ON public.community_blocks (blocked_id);

ALTER TABLE public.community_blocks ENABLE ROW LEVEL SECURITY;

-- RLS: kullanıcı sadece kendi engellemelerini görebilir / yönetebilir
DROP POLICY IF EXISTS community_blocks_select_own ON public.community_blocks;
CREATE POLICY community_blocks_select_own
  ON public.community_blocks
  FOR SELECT
  USING (blocker_id = auth.uid());

DROP POLICY IF EXISTS community_blocks_insert_own ON public.community_blocks;
CREATE POLICY community_blocks_insert_own
  ON public.community_blocks
  FOR INSERT
  WITH CHECK (blocker_id = auth.uid());

DROP POLICY IF EXISTS community_blocks_delete_own ON public.community_blocks;
CREATE POLICY community_blocks_delete_own
  ON public.community_blocks
  FOR DELETE
  USING (blocker_id = auth.uid());

-- ─── RPC: block_user ───
CREATE OR REPLACE FUNCTION public.block_user(p_target_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated');
  END IF;
  IF v_uid = p_target_id THEN
    RETURN jsonb_build_object('ok', false, 'error', 'cannot_block_self');
  END IF;

  INSERT INTO public.community_blocks (blocker_id, blocked_id)
  VALUES (v_uid, p_target_id)
  ON CONFLICT (blocker_id, blocked_id) DO NOTHING;

  -- Engelleme sonrası karşılıklı follow varsa kaldır (tek yönlü engelleme bozulmasın)
  DELETE FROM public.community_follows
  WHERE (follower_id = v_uid AND following_id = p_target_id)
     OR (follower_id = p_target_id AND following_id = v_uid);

  RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.block_user(UUID) TO authenticated;

-- ─── RPC: unblock_user ───
CREATE OR REPLACE FUNCTION public.unblock_user(p_target_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated');
  END IF;

  DELETE FROM public.community_blocks
  WHERE blocker_id = v_uid AND blocked_id = p_target_id;

  RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.unblock_user(UUID) TO authenticated;

-- ─── RPC: is_blocked ───
CREATE OR REPLACE FUNCTION public.is_blocked(p_target_id UUID)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.community_blocks
    WHERE blocker_id = auth.uid() AND blocked_id = p_target_id
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_blocked(UUID) TO authenticated;

-- ─── Helper RPC: get_blocked_user_ids (mobile feed filter için) ───
CREATE OR REPLACE FUNCTION public.get_blocked_user_ids()
RETURNS UUID[]
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(array_agg(blocked_id), ARRAY[]::UUID[])
  FROM public.community_blocks
  WHERE blocker_id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.get_blocked_user_ids() TO authenticated;

-- ─── Helper RPC: list_blocked_users (Settings ekranı için: profil bilgisiyle) ───
CREATE OR REPLACE FUNCTION public.list_blocked_users()
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  blocked_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT
    cb.blocked_id AS user_id,
    p.username,
    p.full_name,
    p.avatar_url,
    cb.created_at AS blocked_at
  FROM public.community_blocks cb
  LEFT JOIN public.profiles p ON p.id = cb.blocked_id
  WHERE cb.blocker_id = auth.uid()
  ORDER BY cb.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.list_blocked_users() TO authenticated;

COMMENT ON TABLE public.community_blocks IS
  'Apple Submit Guideline 1.2 — User block system. Asimetrik (tek yönlü). RLS: kullanıcı sadece kendi blocks''larını yönetir.';
