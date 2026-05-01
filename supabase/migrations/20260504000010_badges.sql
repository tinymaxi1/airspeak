-- ============================================================================
-- Sprint 3b-A: Badges sistemi
-- ============================================================================
-- badges (template) + user_badges (kazanımlar) + award_badge RPC + 12 seed.
-- Detection şimdilik client-side (mobile'da store change → RPC çağırır).
-- Sprint 3'te user_progress tabloları gelince server trigger eklenecek.
-- ============================================================================

BEGIN;

-- ─── 1. badges template ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name_tr text NOT NULL,
  name_en text,
  description_tr text,
  description_en text,
  icon_emoji text NOT NULL,
  icon_url text,
  category text NOT NULL CHECK (category IN (
    'streak', 'xp', 'level', 'lesson', 'speed', 'social', 'league', 'special'
  )),
  condition_type text NOT NULL CHECK (condition_type IN (
    'streak_days', 'total_xp', 'level', 'lessons_completed',
    'perfect_scores', 'custom'
  )),
  condition_value int NOT NULL,
  rarity text NOT NULL DEFAULT 'common' CHECK (rarity IN (
    'common', 'rare', 'epic', 'legendary'
  )),
  sort int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS badges_category_idx ON public.badges (category, sort);
CREATE INDEX IF NOT EXISTS badges_active_idx ON public.badges (is_active) WHERE is_active = true;

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS badges_public_read ON public.badges;
CREATE POLICY badges_public_read ON public.badges
  FOR SELECT USING (is_active = true OR public.is_admin_user());

DROP POLICY IF EXISTS badges_editor_insert ON public.badges;
CREATE POLICY badges_editor_insert ON public.badges
  FOR INSERT WITH CHECK (public.has_admin_role('editor'));

DROP POLICY IF EXISTS badges_editor_update ON public.badges;
CREATE POLICY badges_editor_update ON public.badges
  FOR UPDATE USING (public.has_admin_role('editor'))
                WITH CHECK (public.has_admin_role('editor'));

DROP POLICY IF EXISTS badges_super_delete ON public.badges;
CREATE POLICY badges_super_delete ON public.badges
  FOR DELETE USING (public.has_admin_role('super_admin'));

DROP TRIGGER IF EXISTS badges_set_updated_at ON public.badges;
CREATE TRIGGER badges_set_updated_at
  BEFORE UPDATE ON public.badges
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── 2. user_badges (kazanımlar) ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS user_badges_user_idx
  ON public.user_badges (user_id, earned_at DESC);
CREATE INDEX IF NOT EXISTS user_badges_badge_idx
  ON public.user_badges (badge_id);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Public read — paylaşım için (profil sayfaları)
DROP POLICY IF EXISTS user_badges_public_read ON public.user_badges;
CREATE POLICY user_badges_public_read ON public.user_badges
  FOR SELECT USING (true);

-- Insert: sadece RPC üzerinden (security definer) — direkt insert kapalı
DROP POLICY IF EXISTS user_badges_no_direct_insert ON public.user_badges;
CREATE POLICY user_badges_no_direct_insert ON public.user_badges
  FOR INSERT WITH CHECK (public.is_admin_user());

DROP POLICY IF EXISTS user_badges_no_update ON public.user_badges;
CREATE POLICY user_badges_no_update ON public.user_badges
  FOR UPDATE USING (false);

DROP POLICY IF EXISTS user_badges_super_delete ON public.user_badges;
CREATE POLICY user_badges_super_delete ON public.user_badges
  FOR DELETE USING (public.has_admin_role('super_admin'));

-- ─── 3. award_badge RPC (idempotent) ───────────────────────────────────────
CREATE OR REPLACE FUNCTION public.award_badge(p_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_badge_id uuid;
  v_inserted_count int;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'no_auth');
  END IF;

  SELECT id INTO v_badge_id
    FROM public.badges
   WHERE code = p_code AND is_active = true;

  IF v_badge_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'badge_not_found');
  END IF;

  INSERT INTO public.user_badges (user_id, badge_id)
  VALUES (v_user_id, v_badge_id)
  ON CONFLICT (user_id, badge_id) DO NOTHING;

  GET DIAGNOSTICS v_inserted_count = ROW_COUNT;

  RETURN jsonb_build_object(
    'ok', true,
    'newly_earned', v_inserted_count = 1,
    'badge_id', v_badge_id,
    'code', p_code
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.award_badge(text) FROM public;
GRANT EXECUTE ON FUNCTION public.award_badge(text) TO authenticated;

COMMENT ON FUNCTION public.award_badge(text) IS
  'Kullanıcıya rozet ver — idempotent, ON CONFLICT NO-OP. Returns { ok, newly_earned, badge_id }.';

-- ─── 4. Storage bucket — custom badge ikonları için ────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'badge-icons', 'badge-icons', true,
  500 * 1024,
  ARRAY['image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE
  SET public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

DROP POLICY IF EXISTS "badge-icons public read" ON storage.objects;
CREATE POLICY "badge-icons public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'badge-icons');

DROP POLICY IF EXISTS "badge-icons editor write" ON storage.objects;
CREATE POLICY "badge-icons editor write" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'badge-icons' AND public.has_admin_role('editor')
  );

DROP POLICY IF EXISTS "badge-icons editor update" ON storage.objects;
CREATE POLICY "badge-icons editor update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'badge-icons' AND public.has_admin_role('editor')
  );

DROP POLICY IF EXISTS "badge-icons super delete" ON storage.objects;
CREATE POLICY "badge-icons super delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'badge-icons' AND public.has_admin_role('super_admin')
  );

-- ─── 5. 12 seed rozet ──────────────────────────────────────────────────────
INSERT INTO public.badges (
  code, name_tr, name_en, description_tr, description_en,
  icon_emoji, category, condition_type, condition_value, rarity, sort
) VALUES
  ('streak_3',     'İlk Ateş',     'First Spark',
   '3 gün üst üste giriş yap', 'Login 3 days in a row',
   '🔥', 'streak', 'streak_days', 3, 'common', 10),
  ('streak_7',     'Haftalık',     'Weekly Warrior',
   '7 gün üst üste giriş yap', 'Login 7 days in a row',
   '🔥', 'streak', 'streak_days', 7, 'common', 20),
  ('streak_30',    'Aylık',        'Monthly Master',
   '30 gün üst üste giriş yap', 'Login 30 days in a row',
   '⚡', 'streak', 'streak_days', 30, 'rare', 30),
  ('streak_100',   'Centurion',    'Centurion',
   '100 gün üst üste giriş yap', 'Login 100 days in a row',
   '💯', 'streak', 'streak_days', 100, 'epic', 40),

  ('xp_1k',        'İlk Bin',      'First K',
   '1.000 XP topla', 'Earn 1,000 XP',
   '⭐', 'xp', 'total_xp', 1000, 'common', 10),
  ('xp_10k',       'XP Avcısı',    'XP Hunter',
   '10.000 XP topla', 'Earn 10,000 XP',
   '🌟', 'xp', 'total_xp', 10000, 'rare', 20),
  ('xp_100k',      'XP Lordu',     'XP Lord',
   '100.000 XP topla', 'Earn 100,000 XP',
   '✨', 'xp', 'total_xp', 100000, 'legendary', 30),

  ('level_10',     'Level 10',     'Level 10',
   'Seviye 10''a ulaş', 'Reach level 10',
   '🎖️', 'level', 'level', 10, 'common', 10),
  ('level_25',     'Level 25',     'Level 25',
   'Seviye 25''e ulaş', 'Reach level 25',
   '🥇', 'level', 'level', 25, 'epic', 20),

  ('lesson_10',    '10 Ders',      '10 Lessons',
   '10 ders tamamla', 'Complete 10 lessons',
   '📚', 'lesson', 'lessons_completed', 10, 'common', 10),
  ('lesson_100',   'Kitap Kurdu',  'Bookworm',
   '100 ders tamamla', 'Complete 100 lessons',
   '📖', 'lesson', 'lessons_completed', 100, 'rare', 20),

  ('perfect_5',    'Hatasız Beş',  'Flawless Five',
   '5 kez hatasız ders bitir', 'Finish 5 lessons with perfect score',
   '🎯', 'speed', 'perfect_scores', 5, 'rare', 10)
ON CONFLICT (code) DO NOTHING;

-- ─── 6. Audit trigger — badges tablosu da içerik audit'ine bağlanır ───────
DROP TRIGGER IF EXISTS audit_change ON public.badges;
CREATE TRIGGER audit_change
  AFTER INSERT OR UPDATE OR DELETE ON public.badges
  FOR EACH ROW EXECUTE FUNCTION public.audit_content_change();

DO $$
BEGIN
  RAISE NOTICE 'badges + user_badges + award_badge RPC + storage bucket + 12 seed yüklendi';
END $$;

COMMIT;
