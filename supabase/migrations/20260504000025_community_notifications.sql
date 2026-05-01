-- AirSpeak — Sprint 6.D.1 — Community notifications + comment_reply + post_reaction push
--
-- - community_notifications tablo: kullanıcı için in-app feed
--   (mention_received / comment_reply / post_reaction / mod_warning_in_app)
-- - Auto-insert DB triggers: comments AFTER INSERT (reply + post sahibi),
--   reactions AFTER INSERT (post target).
-- - 2 push trigger: comment_reply + post_reaction (Edge Function).
-- - app_config: kill switch'ler (push_post_reaction_enabled default false —
--   spam'i önlemek için reaction push opsiyonel).

BEGIN;

-- ─── 1. community_notifications tablo ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.community_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Çeşit: in-app feed UI'da grupla
  type text NOT NULL CHECK (type IN (
    'mention',         -- @kullanici_adi (post veya comment)
    'comment_reply',   -- bir post veya yorum yanıtlandı
    'post_reaction',   -- post'a tepki geldi (kapatabilir)
    'mod_warning'      -- içerik gizlendi
  )),
  -- Action'ı yapan
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  -- Hedef ne (link için)
  target_type text NOT NULL CHECK (target_type IN ('post', 'comment')),
  target_id uuid NOT NULL,
  -- Görüntü için snippet (ilk 200 char)
  snippet text,
  -- Push gönderildi mi (idempotency)
  pushed boolean NOT NULL DEFAULT false,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS community_notifications_user_unread_idx
  ON public.community_notifications (user_id, created_at DESC)
  WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS community_notifications_user_idx
  ON public.community_notifications (user_id, created_at DESC);

ALTER TABLE public.community_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS community_notifications_own_read ON public.community_notifications;
CREATE POLICY community_notifications_own_read ON public.community_notifications
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin_user());

-- Insert: sadece DB trigger (RLS engelle)
DROP POLICY IF EXISTS community_notifications_no_insert ON public.community_notifications;
CREATE POLICY community_notifications_no_insert ON public.community_notifications
  FOR INSERT WITH CHECK (false);

-- Update: kullanıcı kendi notifikasyonunu okundu işaretler
DROP POLICY IF EXISTS community_notifications_own_update ON public.community_notifications;
CREATE POLICY community_notifications_own_update ON public.community_notifications
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Delete: kullanıcı kendi
DROP POLICY IF EXISTS community_notifications_own_delete ON public.community_notifications;
CREATE POLICY community_notifications_own_delete ON public.community_notifications
  FOR DELETE USING (user_id = auth.uid());

-- ─── 2. Mark notifications read RPC ─────────────────────────────────────
CREATE OR REPLACE FUNCTION public.mark_community_notifications_read(
  p_ids uuid[] DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $mark_read$
DECLARE
  v_uid uuid := auth.uid();
  v_count int;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated');
  END IF;
  IF p_ids IS NULL OR array_length(p_ids, 1) IS NULL THEN
    UPDATE public.community_notifications
       SET read_at = now()
     WHERE user_id = v_uid AND read_at IS NULL;
  ELSE
    UPDATE public.community_notifications
       SET read_at = now()
     WHERE user_id = v_uid AND id = ANY(p_ids) AND read_at IS NULL;
  END IF;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN jsonb_build_object('ok', true, 'count', v_count);
END;
$mark_read$;

GRANT EXECUTE ON FUNCTION public.mark_community_notifications_read(uuid[]) TO authenticated;

-- ─── 3. app_config: post_reaction push kill switch ──────────────────────
INSERT INTO public.app_config (key, value, description, category, data_type)
VALUES
  ('community.push_post_reaction_enabled', 'false'::jsonb,
   'Post reaction geldiğinde push gönderilsin mi (gürültü açabilir)',
   'general', 'boolean')
ON CONFLICT (key) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════
-- 4. AUTO-INSERT TRIGGERS — community_comments + community_reactions
-- ═══════════════════════════════════════════════════════════════════════

-- Comment INSERT → notification(s):
--   - parent_comment_id varsa: parent author'a comment_reply (kendisine değil)
--   - parent_comment_id yoksa: post author'a comment_reply (kendisine değil)
--   - Mention'lar zaten parse_comment_content RPC'sinde oluşuyor (community_mentions
--     trigger'i mention notif insert eder — aşağıda 5. madde).
CREATE OR REPLACE FUNCTION public.notify_comment_reply()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $cr$
DECLARE
  v_recipient uuid;
  v_post_author uuid;
  v_parent_author uuid;
  v_url text;
  v_token text;
BEGIN
  -- Sadece active comment için
  IF NEW.status <> 'active' THEN RETURN NEW; END IF;

  IF NEW.parent_comment_id IS NOT NULL THEN
    SELECT author_id INTO v_parent_author FROM public.community_comments WHERE id = NEW.parent_comment_id;
    v_recipient := v_parent_author;
  ELSE
    SELECT author_id INTO v_post_author FROM public.community_posts WHERE id = NEW.post_id;
    v_recipient := v_post_author;
  END IF;

  -- Kendi yorumuna kendine bildirim atma
  IF v_recipient IS NULL OR v_recipient = NEW.author_id THEN
    RETURN NEW;
  END IF;

  -- In-app notification insert (RLS bypass — SECURITY DEFINER ile)
  INSERT INTO public.community_notifications (user_id, type, actor_id, target_type, target_id, snippet)
  VALUES (
    v_recipient,
    'comment_reply',
    NEW.author_id,
    'comment',
    NEW.id,
    left(NEW.content, 200)
  );

  -- Push (config'ten edge URL)
  SELECT replace(value::text, '"', '') INTO v_url
    FROM public.app_config WHERE key = 'notifications.edge_url';
  SELECT replace(value::text, '"', '') INTO v_token
    FROM public.app_config WHERE key = 'notifications.service_token';
  IF v_url IS NULL OR length(v_url) < 5 THEN RETURN NEW; END IF;
  PERFORM extensions.net.http_post(
    url := v_url || '/comment_reply',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || COALESCE(v_token, ''),
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'recipient_id', v_recipient,
      'actor_id', NEW.author_id,
      'comment_id', NEW.id,
      'post_id', NEW.post_id,
      'parent_id', NEW.parent_comment_id
    )
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'notify_comment_reply failed: %', SQLERRM;
  RETURN NEW;
END;
$cr$;

DROP TRIGGER IF EXISTS community_comments_notify_reply ON public.community_comments;
CREATE TRIGGER community_comments_notify_reply
  AFTER INSERT ON public.community_comments
  FOR EACH ROW EXECUTE FUNCTION public.notify_comment_reply();

-- Reaction INSERT → post owner'a notif (kapatabilir).
CREATE OR REPLACE FUNCTION public.notify_post_reaction()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $pr$
DECLARE
  v_recipient uuid;
  v_url text;
  v_token text;
  v_push_enabled boolean;
BEGIN
  -- Sadece post hedefli (comment reaction'lar için bildirim yok, gürültü çok)
  IF NEW.target_type <> 'post' THEN RETURN NEW; END IF;

  SELECT author_id INTO v_recipient FROM public.community_posts WHERE id = NEW.target_id;

  IF v_recipient IS NULL OR v_recipient = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- In-app her zaman insert (kullanıcı feed'ten görür)
  INSERT INTO public.community_notifications (user_id, type, actor_id, target_type, target_id, snippet)
  VALUES (
    v_recipient,
    'post_reaction',
    NEW.user_id,
    'post',
    NEW.target_id,
    NEW.kind
  );

  -- Push: sadece kill switch açıkken
  SELECT (value::text)::boolean INTO v_push_enabled
    FROM public.app_config WHERE key = 'community.push_post_reaction_enabled';
  IF NOT COALESCE(v_push_enabled, false) THEN
    RETURN NEW;
  END IF;

  SELECT replace(value::text, '"', '') INTO v_url
    FROM public.app_config WHERE key = 'notifications.edge_url';
  SELECT replace(value::text, '"', '') INTO v_token
    FROM public.app_config WHERE key = 'notifications.service_token';
  IF v_url IS NULL OR length(v_url) < 5 THEN RETURN NEW; END IF;
  PERFORM extensions.net.http_post(
    url := v_url || '/post_reaction',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || COALESCE(v_token, ''),
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'recipient_id', v_recipient,
      'actor_id', NEW.user_id,
      'post_id', NEW.target_id,
      'kind', NEW.kind
    )
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'notify_post_reaction failed: %', SQLERRM;
  RETURN NEW;
END;
$pr$;

DROP TRIGGER IF EXISTS community_reactions_notify ON public.community_reactions;
CREATE TRIGGER community_reactions_notify
  AFTER INSERT ON public.community_reactions
  FOR EACH ROW EXECUTE FUNCTION public.notify_post_reaction();

-- ═══════════════════════════════════════════════════════════════════════
-- 5. Mention notifications: in-app feed'e ekle
-- ═══════════════════════════════════════════════════════════════════════
-- Mevcut community_mentions trigger'i (post_mention edge function) push atıyor
-- ama in-app notification kaydetmiyor. SECURITY DEFINER trigger ekleyerek hem
-- in-app insert hem mevcut push korunur.
CREATE OR REPLACE FUNCTION public.notify_mention_inapp()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $mention_inapp$
DECLARE
  v_snippet text;
  v_target_type text;
  v_target_id uuid;
BEGIN
  IF NEW.comment_id IS NOT NULL THEN
    v_target_type := 'comment';
    v_target_id := NEW.comment_id;
    SELECT left(content, 200) INTO v_snippet FROM public.community_comments WHERE id = NEW.comment_id;
  ELSE
    v_target_type := 'post';
    v_target_id := NEW.post_id;
    SELECT left(content, 200) INTO v_snippet FROM public.community_posts WHERE id = NEW.post_id;
  END IF;

  INSERT INTO public.community_notifications (user_id, type, actor_id, target_type, target_id, snippet)
  VALUES (
    NEW.mentioned_user_id,
    'mention',
    NEW.mentioner_user_id,
    v_target_type,
    v_target_id,
    v_snippet
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'notify_mention_inapp failed: %', SQLERRM;
  RETURN NEW;
END;
$mention_inapp$;

DROP TRIGGER IF EXISTS community_mentions_inapp ON public.community_mentions;
CREATE TRIGGER community_mentions_inapp
  AFTER INSERT ON public.community_mentions
  FOR EACH ROW EXECUTE FUNCTION public.notify_mention_inapp();

DO $$ BEGIN
  RAISE NOTICE 'Sprint 6.D.1 — community_notifications + comment_reply + post_reaction triggers aktif';
END $$;

COMMIT;
