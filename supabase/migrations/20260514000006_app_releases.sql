-- Faz 4 — App Releases (güncelleme bildirim sistemi)
--
-- 1) app_releases tablosu — admin her yeni OTA push öncesi/sonrası release notu girer
-- 2) profiles.last_seen_release_version — kullanıcı hangi release'i gördü
-- 3) RPC get_latest_release + mark_release_seen
-- 4) DB trigger AFTER INSERT → release-broadcast edge function tetik (pg_net)

-- ============================================================================
-- 1) app_releases tablosu
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.app_releases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version text NOT NULL UNIQUE,
  released_at timestamptz NOT NULL DEFAULT now(),
  -- jsonb array: [{ emoji: "🔥", title: "...", description: "..." }, ...]
  changes_tr jsonb NOT NULL DEFAULT '[]'::jsonb,
  changes_en jsonb NOT NULL DEFAULT '[]'::jsonb,
  mandatory boolean NOT NULL DEFAULT false,
  -- Tekrar push gönderilmesin diye guard
  push_sent_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT version_semver_check CHECK (version ~ '^[0-9]+\.[0-9]+\.[0-9]+(-[a-z0-9]+)?$')
);

CREATE INDEX IF NOT EXISTS app_releases_released_at_idx
  ON public.app_releases (released_at DESC);

-- RLS: herkes okuyabilir (mobile en son release'i çekiyor), admin INSERT/UPDATE
ALTER TABLE public.app_releases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS app_releases_public_read ON public.app_releases;
CREATE POLICY app_releases_public_read
  ON public.app_releases FOR SELECT
  USING (true);

DROP POLICY IF EXISTS app_releases_admin_write ON public.app_releases;
CREATE POLICY app_releases_admin_write
  ON public.app_releases FOR INSERT
  WITH CHECK (public.is_admin_user());

DROP POLICY IF EXISTS app_releases_admin_update ON public.app_releases;
CREATE POLICY app_releases_admin_update
  ON public.app_releases FOR UPDATE
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

DROP POLICY IF EXISTS app_releases_admin_delete ON public.app_releases;
CREATE POLICY app_releases_admin_delete
  ON public.app_releases FOR DELETE
  USING (public.is_admin_user());

-- ============================================================================
-- 2) profiles.last_seen_release_version
-- ============================================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_seen_release_version text;

-- ============================================================================
-- 3) RPC: get_latest_release(p_user_id) → version + seen_status + changes
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_latest_release(p_user_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := COALESCE(p_user_id, auth.uid());
  v_latest record;
  v_seen text;
  v_is_seen boolean;
BEGIN
  -- En son release
  SELECT * INTO v_latest
    FROM public.app_releases
   ORDER BY released_at DESC
   LIMIT 1;

  IF v_latest.version IS NULL THEN
    RETURN jsonb_build_object('ok', true, 'has_release', false);
  END IF;

  -- Kullanıcının son gördüğü release version (auth gerekmez — guest için)
  IF v_uid IS NOT NULL THEN
    SELECT last_seen_release_version INTO v_seen
      FROM public.profiles WHERE id = v_uid;
  END IF;

  -- v_seen NULL ise hiç görmemiş demektir → seen=false
  -- v_seen = v_latest.version ise zaten gördü
  v_is_seen := v_seen IS NOT NULL AND v_seen = v_latest.version;

  RETURN jsonb_build_object(
    'ok', true,
    'has_release', true,
    'version', v_latest.version,
    'released_at', v_latest.released_at,
    'changes_tr', v_latest.changes_tr,
    'changes_en', v_latest.changes_en,
    'mandatory', v_latest.mandatory,
    'seen', v_is_seen
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_latest_release(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.get_latest_release(uuid) TO authenticated, anon;

-- ============================================================================
-- 4) RPC: mark_release_seen(p_version) — kullanıcı sheet'i kapattı
-- ============================================================================
CREATE OR REPLACE FUNCTION public.mark_release_seen(p_version text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated');
  END IF;

  UPDATE public.profiles
     SET last_seen_release_version = p_version,
         updated_at = now()
   WHERE id = v_uid;

  RETURN jsonb_build_object('ok', true, 'version', p_version);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.mark_release_seen(text) FROM public;
GRANT EXECUTE ON FUNCTION public.mark_release_seen(text) TO authenticated;

-- ============================================================================
-- 5) DB trigger: AFTER INSERT ON app_releases → release-broadcast edge function
--    notifications.edge_url + service_token (Sprint 5.D config) kullanır
-- ============================================================================
CREATE OR REPLACE FUNCTION public.trigger_release_broadcast()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_url text;
  v_token text;
  v_broadcast_url text;
BEGIN
  -- pg_net extension kontrolü
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
    RAISE NOTICE 'pg_net yok — release-broadcast manuel tetiklenmeli';
    RETURN NEW;
  END IF;

  SELECT (value::text)::jsonb->>0 INTO v_url
    FROM public.app_config WHERE key = 'notifications.edge_url';
  SELECT (value::text)::jsonb->>0 INTO v_token
    FROM public.app_config WHERE key = 'notifications.service_token';

  IF v_url IS NULL OR v_token IS NULL THEN
    RAISE NOTICE 'edge_url/service_token boş — release push gönderilmedi';
    RETURN NEW;
  END IF;

  v_broadcast_url := replace(v_url, 'notification-triggers', 'release-broadcast');

  PERFORM net.http_post(
    url := v_broadcast_url,
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || v_token,
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object('release_id', NEW.id, 'version', NEW.version)
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS app_releases_broadcast_trigger ON public.app_releases;
CREATE TRIGGER app_releases_broadcast_trigger
  AFTER INSERT ON public.app_releases
  FOR EACH ROW EXECUTE FUNCTION public.trigger_release_broadcast();

-- ============================================================================
-- 6) Doğrulama
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name='app_releases'
  ) THEN
    RAISE EXCEPTION 'app_releases tablosu yok';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='profiles' AND column_name='last_seen_release_version'
  ) THEN
    RAISE EXCEPTION 'profiles.last_seen_release_version yok';
  END IF;
  RAISE NOTICE 'Faz 4 app_releases migration OK';
END $$;
