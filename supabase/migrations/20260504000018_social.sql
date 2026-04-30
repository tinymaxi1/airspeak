-- ============================================================================
-- Sprint 4G — Sosyal yarış (friendships + squadrons)
-- ============================================================================
-- friendships: simetrik arkadaşlık (request → accept)
-- squadrons: kullanıcı oluşturulan grup (cohort)
-- squadron_members: üyelik
-- RPC'ler: send_friend_request / respond_friend_request / create_squadron /
--          join_squadron / leave_squadron
-- ============================================================================

BEGIN;

-- ─── 1. friendships ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  addressee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  responded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (requester_id <> addressee_id),
  UNIQUE (requester_id, addressee_id)
);

CREATE INDEX IF NOT EXISTS friendships_requester_idx
  ON public.friendships (requester_id, status);
CREATE INDEX IF NOT EXISTS friendships_addressee_idx
  ON public.friendships (addressee_id, status);

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS friendships_own_read ON public.friendships;
CREATE POLICY friendships_own_read ON public.friendships
  FOR SELECT USING (
    requester_id = auth.uid()
    OR addressee_id = auth.uid()
    OR public.is_admin_user()
  );

DROP POLICY IF EXISTS friendships_own_insert ON public.friendships;
CREATE POLICY friendships_own_insert ON public.friendships
  FOR INSERT WITH CHECK (requester_id = auth.uid());

DROP POLICY IF EXISTS friendships_own_update ON public.friendships;
CREATE POLICY friendships_own_update ON public.friendships
  FOR UPDATE USING (
    addressee_id = auth.uid() OR requester_id = auth.uid()
  )
  WITH CHECK (
    addressee_id = auth.uid() OR requester_id = auth.uid()
  );

DROP POLICY IF EXISTS friendships_own_delete ON public.friendships;
CREATE POLICY friendships_own_delete ON public.friendships
  FOR DELETE USING (
    requester_id = auth.uid() OR addressee_id = auth.uid()
  );

-- ─── 2. squadrons ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.squadrons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  emoji text NOT NULL DEFAULT '✈️',
  banner_url text,
  is_public boolean NOT NULL DEFAULT true,
  capacity int NOT NULL DEFAULT 25 CHECK (capacity BETWEEN 2 AND 100),
  member_count int NOT NULL DEFAULT 0,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS squadrons_creator_idx ON public.squadrons (created_by);
CREATE INDEX IF NOT EXISTS squadrons_public_idx ON public.squadrons (is_public, member_count DESC) WHERE is_public = true;

ALTER TABLE public.squadrons ENABLE ROW LEVEL SECURITY;
-- squadrons RLS policy'leri squadron_members'a referans verdiği için
-- aşağıda squadron_members yaratıldıktan sonra eklenir.

DROP TRIGGER IF EXISTS set_updated_at ON public.squadrons;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.squadrons
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── 3. squadron_members ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.squadron_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  squadron_id uuid NOT NULL REFERENCES public.squadrons(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (squadron_id, user_id)
);

CREATE INDEX IF NOT EXISTS squadron_members_user_idx
  ON public.squadron_members (user_id);
CREATE INDEX IF NOT EXISTS squadron_members_squadron_idx
  ON public.squadron_members (squadron_id);

ALTER TABLE public.squadron_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS squadron_members_public_read ON public.squadron_members;
CREATE POLICY squadron_members_public_read ON public.squadron_members
  FOR SELECT USING (true);

DROP POLICY IF EXISTS squadron_members_self_insert ON public.squadron_members;
CREATE POLICY squadron_members_self_insert ON public.squadron_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS squadron_members_self_delete ON public.squadron_members;
CREATE POLICY squadron_members_self_delete ON public.squadron_members
  FOR DELETE USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.squadrons s
       WHERE s.id = squadron_id AND s.created_by = auth.uid()
    )
  );

-- ─── 3.5. squadrons RLS (squadron_members yaratıldığı için artık geçerli) ─
DROP POLICY IF EXISTS squadrons_public_read ON public.squadrons;
CREATE POLICY squadrons_public_read ON public.squadrons
  FOR SELECT USING (
    is_public = true
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.squadron_members sm
       WHERE sm.squadron_id = id AND sm.user_id = auth.uid()
    )
    OR public.is_admin_user()
  );

DROP POLICY IF EXISTS squadrons_creator_insert ON public.squadrons;
CREATE POLICY squadrons_creator_insert ON public.squadrons
  FOR INSERT WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS squadrons_creator_update ON public.squadrons;
CREATE POLICY squadrons_creator_update ON public.squadrons
  FOR UPDATE USING (created_by = auth.uid())
                WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS squadrons_creator_delete ON public.squadrons;
CREATE POLICY squadrons_creator_delete ON public.squadrons
  FOR DELETE USING (created_by = auth.uid() OR public.has_admin_role('super_admin'));

-- ─── 4. RPC: send_friend_request ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.send_friend_request(p_username text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_target uuid;
  v_existing record;
  v_id uuid;
BEGIN
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'no_auth');
  END IF;

  SELECT id INTO v_target FROM public.profiles WHERE username = p_username;
  IF v_target IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'user_not_found');
  END IF;
  IF v_target = v_user THEN
    RETURN jsonb_build_object('ok', false, 'error', 'cannot_friend_self');
  END IF;

  -- Mevcut kayıt kontrolü (her iki yönde)
  SELECT * INTO v_existing
    FROM public.friendships
   WHERE (requester_id = v_user AND addressee_id = v_target)
      OR (requester_id = v_target AND addressee_id = v_user);

  IF v_existing IS NOT NULL THEN
    -- Diğer taraf zaten request gönderdiyse otomatik kabul (sembolik)
    IF v_existing.requester_id = v_target AND v_existing.status = 'pending' THEN
      UPDATE public.friendships
         SET status = 'accepted', responded_at = now()
       WHERE id = v_existing.id;
      RETURN jsonb_build_object('ok', true, 'auto_accepted', true, 'id', v_existing.id);
    END IF;
    RETURN jsonb_build_object('ok', false, 'error', 'already_exists', 'status', v_existing.status);
  END IF;

  INSERT INTO public.friendships (requester_id, addressee_id)
  VALUES (v_user, v_target)
  RETURNING id INTO v_id;

  RETURN jsonb_build_object('ok', true, 'id', v_id);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.send_friend_request(text) FROM public;
GRANT EXECUTE ON FUNCTION public.send_friend_request(text) TO authenticated;

-- ─── 5. RPC: respond_friend_request ─────────────────────────────────────
CREATE OR REPLACE FUNCTION public.respond_friend_request(
  p_friendship_id uuid,
  p_accept boolean
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_existing record;
BEGIN
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'no_auth');
  END IF;

  SELECT * INTO v_existing FROM public.friendships WHERE id = p_friendship_id;
  IF v_existing IS NULL OR v_existing.addressee_id <> v_user THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_found');
  END IF;
  IF v_existing.status <> 'pending' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'already_responded');
  END IF;

  IF p_accept THEN
    UPDATE public.friendships
       SET status = 'accepted', responded_at = now()
     WHERE id = p_friendship_id;
  ELSE
    DELETE FROM public.friendships WHERE id = p_friendship_id;
  END IF;

  RETURN jsonb_build_object('ok', true, 'accepted', p_accept);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.respond_friend_request(uuid, boolean) FROM public;
GRANT EXECUTE ON FUNCTION public.respond_friend_request(uuid, boolean) TO authenticated;

-- ─── 6. RPC: create_squadron ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.create_squadron(
  p_slug text,
  p_name text,
  p_description text DEFAULT NULL,
  p_emoji text DEFAULT '✈️',
  p_is_public boolean DEFAULT true
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_id uuid;
BEGIN
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'no_auth');
  END IF;
  IF p_slug !~ '^[a-z0-9_-]+$' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_slug');
  END IF;

  INSERT INTO public.squadrons (slug, name, description, emoji, is_public, created_by, member_count)
  VALUES (p_slug, p_name, p_description, COALESCE(p_emoji, '✈️'), p_is_public, v_user, 1)
  RETURNING id INTO v_id;

  -- Yaratıcı admin olarak otomatik katılır
  INSERT INTO public.squadron_members (squadron_id, user_id, role)
  VALUES (v_id, v_user, 'admin');

  RETURN jsonb_build_object('ok', true, 'id', v_id);
EXCEPTION WHEN unique_violation THEN
  RETURN jsonb_build_object('ok', false, 'error', 'slug_taken');
END;
$$;

REVOKE EXECUTE ON FUNCTION public.create_squadron(text, text, text, text, boolean) FROM public;
GRANT EXECUTE ON FUNCTION public.create_squadron(text, text, text, text, boolean) TO authenticated;

-- ─── 7. RPC: join_squadron ───────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.join_squadron(p_squadron_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_squadron record;
  v_id uuid;
BEGIN
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'no_auth');
  END IF;

  SELECT * INTO v_squadron FROM public.squadrons WHERE id = p_squadron_id;
  IF v_squadron IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_found');
  END IF;
  IF v_squadron.member_count >= v_squadron.capacity THEN
    RETURN jsonb_build_object('ok', false, 'error', 'capacity_full');
  END IF;

  INSERT INTO public.squadron_members (squadron_id, user_id, role)
  VALUES (p_squadron_id, v_user, 'member')
  ON CONFLICT (squadron_id, user_id) DO NOTHING
  RETURNING id INTO v_id;

  IF v_id IS NULL THEN
    RETURN jsonb_build_object('ok', true, 'newly_joined', false);
  END IF;

  UPDATE public.squadrons
     SET member_count = member_count + 1
   WHERE id = p_squadron_id;

  RETURN jsonb_build_object('ok', true, 'newly_joined', true);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.join_squadron(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.join_squadron(uuid) TO authenticated;

-- ─── 8. RPC: leave_squadron ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.leave_squadron(p_squadron_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_deleted int;
BEGIN
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'no_auth');
  END IF;

  DELETE FROM public.squadron_members
   WHERE squadron_id = p_squadron_id AND user_id = v_user;
  GET DIAGNOSTICS v_deleted = ROW_COUNT;

  IF v_deleted > 0 THEN
    UPDATE public.squadrons
       SET member_count = GREATEST(0, member_count - 1)
     WHERE id = p_squadron_id;
  END IF;

  RETURN jsonb_build_object('ok', true, 'left', v_deleted > 0);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.leave_squadron(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.leave_squadron(uuid) TO authenticated;

-- ─── 9. View: squadron_leaderboard ───────────────────────────────────────
-- Squadron'ların toplam haftalık XP'si — leaderboard
CREATE OR REPLACE VIEW public.squadron_leaderboard AS
SELECT
  s.id,
  s.slug,
  s.name,
  s.emoji,
  s.member_count,
  s.is_public,
  COALESCE(SUM(x.week_xp), 0)::bigint AS total_week_xp,
  COALESCE(SUM(x.total_xp), 0)::bigint AS total_xp,
  ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(x.week_xp), 0) DESC, s.created_at ASC) AS rank
FROM public.squadrons s
LEFT JOIN public.squadron_members sm ON sm.squadron_id = s.id
LEFT JOIN public.user_xp_summary x ON x.user_id = sm.user_id
WHERE s.is_public = true
GROUP BY s.id;

GRANT SELECT ON public.squadron_leaderboard TO authenticated;

DO $$ BEGIN
  RAISE NOTICE 'Sprint 4G — friendships + squadrons + 5 RPC + leaderboard view aktif';
END $$;

COMMIT;
