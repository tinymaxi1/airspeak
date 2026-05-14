-- Faz 2.F — 30 gün grace sonrası HARD DELETE cron
--
-- request_account_deletion soft delete yapıyor (deletion_requested_at).
-- 30 gün sonra kullanıcı iptal etmediyse → bu cron auth.users'tan silinir.
-- profiles.id REFERENCES auth.users(id) ON DELETE CASCADE olduğu için tüm
-- bağlı tablolar (push_tokens, exam_simulations, user_xp_summary, streaks,
-- league_memberships, friendships, vs.) otomatik temizlenir.

-- ============================================================================
-- 1) deleted_accounts_log — audit (kim ne zaman silindi)
--    KVKK/GDPR compliance — kişisel veri içermez, sadece hash + timestamp
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.deleted_accounts_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- user_id'nin SHA-256 hash'i (gerçek user_id GDPR right-to-be-forgotten)
  user_id_hash text NOT NULL,
  -- Hangi sürede grace period vardı (ör. 30d)
  grace_period_days int NOT NULL DEFAULT 30,
  -- soft delete tarihi
  deletion_requested_at timestamptz NOT NULL,
  -- gerçek hard delete tarihi
  hard_deleted_at timestamptz NOT NULL DEFAULT now(),
  -- kullanıcının verdiği sebep (request_account_deletion'da toplanıyor)
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS deleted_accounts_log_hard_deleted_at_idx
  ON public.deleted_accounts_log (hard_deleted_at DESC);

-- RLS: sadece admin okuyabilir
ALTER TABLE public.deleted_accounts_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS deleted_accounts_log_admin_read ON public.deleted_accounts_log;
CREATE POLICY deleted_accounts_log_admin_read
  ON public.deleted_accounts_log FOR SELECT
  USING (public.is_admin_user());

-- INSERT sadece service_role (edge function) — RLS bypass eder
-- Mobile/anon hiç dokunmaz

-- ============================================================================
-- 2) RPC: list_pending_hard_deletions — edge function çağırır
--    SECURITY DEFINER + admin check → service_role ile çağrı OK
-- ============================================================================
CREATE OR REPLACE FUNCTION public.list_pending_hard_deletions(
  p_grace_days int DEFAULT 30
)
RETURNS TABLE (
  user_id uuid,
  deletion_requested_at timestamptz,
  email text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Sadece service_role veya admin çağırabilir
  IF NOT (current_setting('role', true) = 'service_role' OR public.is_admin_user()) THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  RETURN QUERY
  SELECT p.id, p.deletion_requested_at, au.email::text
    FROM public.profiles p
    LEFT JOIN auth.users au ON au.id = p.id
   WHERE p.deletion_requested_at IS NOT NULL
     AND p.deletion_requested_at < (now() - (p_grace_days || ' days')::interval);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.list_pending_hard_deletions(int) FROM public;
GRANT EXECUTE ON FUNCTION public.list_pending_hard_deletions(int) TO service_role;

-- ============================================================================
-- 3) RPC: record_hard_deletion — audit log + admin_actions
--    Edge function her başarılı silmeden SONRA çağırır
--    (auth.users delete önce, sonra bu log)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.record_hard_deletion(
  p_user_id uuid,
  p_deletion_requested_at timestamptz,
  p_reason text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hash text;
BEGIN
  IF NOT (current_setting('role', true) = 'service_role') THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  v_hash := encode(digest(p_user_id::text, 'sha256'), 'hex');

  INSERT INTO public.deleted_accounts_log (
    user_id_hash, grace_period_days,
    deletion_requested_at, hard_deleted_at, reason
  ) VALUES (
    v_hash, 30, p_deletion_requested_at, now(), p_reason
  );

  RETURN jsonb_build_object('ok', true, 'hash', v_hash);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.record_hard_deletion(uuid, timestamptz, text) FROM public;
GRANT EXECUTE ON FUNCTION public.record_hard_deletion(uuid, timestamptz, text) TO service_role;

-- ============================================================================
-- 4) pg_cron schedule — günlük 03:00 UTC edge function tetikler
--    notifications.edge_url + service_token app_config'te zaten var (Sprint 5.D)
-- ============================================================================
DO $$
DECLARE
  v_url text;
  v_token text;
BEGIN
  -- pg_cron extension var mı kontrol
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    RAISE NOTICE 'pg_cron yok — cron schedule manuel eklenebilir';
    RETURN;
  END IF;

  -- account-cleanup-cron için edge_url + token
  SELECT (value::text)::jsonb->>0 INTO v_url FROM public.app_config WHERE key = 'notifications.edge_url';
  SELECT (value::text)::jsonb->>0 INTO v_token FROM public.app_config WHERE key = 'notifications.service_token';

  IF v_url IS NULL OR v_token IS NULL THEN
    RAISE NOTICE 'notifications.edge_url/service_token boş — cron schedule eklenmedi';
    RETURN;
  END IF;

  -- Eski schedule varsa kaldır
  PERFORM cron.unschedule('account-cleanup-daily')
    WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'account-cleanup-daily');

  -- Günlük 03:00 UTC
  PERFORM cron.schedule(
    'account-cleanup-daily',
    '0 3 * * *',
    format(
      $cron$
      SELECT net.http_post(
        url := %L,
        headers := jsonb_build_object('Authorization', 'Bearer %s', 'Content-Type', 'application/json'),
        body := jsonb_build_object('trigger', 'account_cleanup')
      );
      $cron$,
      replace(v_url, 'notification-triggers', 'process-account-deletions'),
      v_token
    )
  );

  RAISE NOTICE 'pg_cron schedule eklendi: account-cleanup-daily @ 03:00 UTC';
END $$;

-- ============================================================================
-- 5) Doğrulama
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name='deleted_accounts_log'
  ) THEN
    RAISE EXCEPTION 'deleted_accounts_log tablosu yok';
  END IF;

  RAISE NOTICE 'Faz 2.F hard delete cron migration OK';
END $$;
