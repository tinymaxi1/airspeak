-- AirSpeak — Sprint 5.C.1 — Trial tracking + social proof + push triggers
--
-- 1. profiles: trial_started_at / trial_ends_at / trial_used / subscription_status
-- 2. profiles: last_active_at + index (sosyal kanıt için "son 24 saat aktif")
-- 3. RPC: start_trial() — bir kez kullanılır, app_config.paywall.trial_days kadar premium
-- 4. RPC: get_active_count_24h() — sosyal kanıt
-- 5. RPC: bump_last_active() — app foreground heartbeat
-- 6. pg_cron: günlük 09:00 UTC trial_ending_t1/t0/winback push
--
-- Notlar:
-- - subscription_status enum DEĞIL — text+CHECK (RevenueCat sonra ekleyeceğimiz statelere esnek).
-- - last_active_at default now() — yeni satırlarda doğru, eski satırlarda created_at kullanılır.
-- - get_active_count_24h() SECURITY DEFINER + grant anon — paywall'da auth öncesi de çağrılabilir.

BEGIN;

-- ─── 1. PROFILES — trial fields + last_active_at ─────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS trial_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz,
  ADD COLUMN IF NOT EXISTS trial_used boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS subscription_status text NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS last_active_at timestamptz;

-- subscription_status CHECK (drop+add idempotent)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_subscription_status_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_subscription_status_check
  CHECK (subscription_status IN ('free', 'trialing', 'active', 'canceled', 'expired'));

-- last_active_at backfill: NULL olanlara created_at, sonra default now()
UPDATE public.profiles SET last_active_at = COALESCE(last_active_at, created_at, now())
WHERE last_active_at IS NULL;
ALTER TABLE public.profiles ALTER COLUMN last_active_at SET DEFAULT now();
ALTER TABLE public.profiles ALTER COLUMN last_active_at SET NOT NULL;

CREATE INDEX IF NOT EXISTS profiles_last_active_at_idx
  ON public.profiles (last_active_at DESC);
CREATE INDEX IF NOT EXISTS profiles_trial_ends_at_idx
  ON public.profiles (trial_ends_at)
  WHERE trial_ends_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS profiles_subscription_status_idx
  ON public.profiles (subscription_status)
  WHERE subscription_status <> 'free';

COMMENT ON COLUMN public.profiles.trial_started_at IS 'Trial başladığı an (null = hiç kullanmadı)';
COMMENT ON COLUMN public.profiles.trial_ends_at IS 'Trial bitiş anı; pg_cron push trigger ediyor';
COMMENT ON COLUMN public.profiles.trial_used IS 'Idempotent guard — bir hesap bir kez trial kullanır';
COMMENT ON COLUMN public.profiles.subscription_status IS 'free | trialing | active | canceled | expired (RevenueCat senkronize edecek)';
COMMENT ON COLUMN public.profiles.last_active_at IS 'App foreground heartbeat — bump_last_active() çağırır, sosyal kanıt için';

-- ─── 2. RPC: start_trial() ───────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.start_trial()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $start_trial$
DECLARE
  v_uid uuid := auth.uid();
  v_already boolean;
  v_days int;
  v_trial_value jsonb;
  v_ends timestamptz;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated');
  END IF;

  SELECT trial_used INTO v_already FROM public.profiles WHERE id = v_uid FOR UPDATE;
  IF v_already IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'profile_not_found');
  END IF;
  IF v_already THEN
    RETURN jsonb_build_object('ok', false, 'error', 'already_used');
  END IF;

  -- app_config.paywall.trial_days oku, yoksa 7 default
  SELECT value INTO v_trial_value FROM public.app_config WHERE key = 'paywall.trial_days';
  v_days := COALESCE(NULLIF(v_trial_value::text, '')::int, 7);
  IF v_days < 1 THEN v_days := 7; END IF;
  IF v_days > 90 THEN v_days := 90; END IF;

  v_ends := now() + (v_days || ' days')::interval;

  UPDATE public.profiles SET
    trial_started_at = now(),
    trial_ends_at = v_ends,
    trial_used = true,
    subscription_status = 'trialing',
    premium_until = v_ends
  WHERE id = v_uid;

  RETURN jsonb_build_object(
    'ok', true,
    'trial_ends_at', v_ends,
    'days', v_days
  );
END;
$start_trial$;

GRANT EXECUTE ON FUNCTION public.start_trial() TO authenticated;

-- ─── 3. RPC: get_active_count_24h() ──────────────────────────────────────
-- Anon da çağırabilsin (paywall pre-auth gösteriliyor olabilir).
CREATE OR REPLACE FUNCTION public.get_active_count_24h()
RETURNS int
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $active$
  SELECT count(*)::int FROM public.profiles
  WHERE last_active_at > now() - interval '24 hours';
$active$;

GRANT EXECUTE ON FUNCTION public.get_active_count_24h() TO authenticated, anon;

-- ─── 4. RPC: bump_last_active() ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.bump_last_active()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $bump$
  UPDATE public.profiles
  SET last_active_at = now()
  WHERE id = auth.uid();
$bump$;

GRANT EXECUTE ON FUNCTION public.bump_last_active() TO authenticated;

-- ─── 5. SUBSCRIPTION STATUS auto-expire — günlük cron ───────────────────
-- Trial bitiminden sonra status 'expired' yap. RevenueCat geldiğinde gerçek
-- abonelik durumu sync edecek; bu sadece "trial bitti, premium_until geçti"
-- temizliği için.
CREATE OR REPLACE FUNCTION public.expire_finished_trials()
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $expire$
DECLARE
  v_count int;
BEGIN
  UPDATE public.profiles SET
    subscription_status = 'expired'
  WHERE subscription_status = 'trialing'
    AND trial_ends_at IS NOT NULL
    AND trial_ends_at < now()
    AND (premium_until IS NULL OR premium_until < now());
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$expire$;

-- ─── 6. APP_CONFIG: notification edge URL/token ──────────────────────────
INSERT INTO public.app_config (key, value, description, category, data_type)
VALUES
  ('notifications.edge_url', '""'::jsonb,
   'notification-triggers Edge Function tam URL',
   'general', 'string'),
  ('notifications.service_token', '""'::jsonb,
   'Service role token, cron Authorization header için',
   'general', 'string')
ON CONFLICT (key) DO NOTHING;

-- ─── 7. pg_cron: trial_ending_t1, trial_ending_t0, trial_winback ─────────
-- Hepsi günlük 09:00 UTC. Önce eski schedule'ları unschedule (idempotent).
DO $unsched$
BEGIN
  PERFORM cron.unschedule('trial-ending-t1');
EXCEPTION WHEN OTHERS THEN NULL;
END $unsched$;
DO $unsched$
BEGIN
  PERFORM cron.unschedule('trial-ending-t0');
EXCEPTION WHEN OTHERS THEN NULL;
END $unsched$;
DO $unsched$
BEGIN
  PERFORM cron.unschedule('trial-winback');
EXCEPTION WHEN OTHERS THEN NULL;
END $unsched$;
DO $unsched$
BEGIN
  PERFORM cron.unschedule('expire-finished-trials');
EXCEPTION WHEN OTHERS THEN NULL;
END $unsched$;

-- expire_finished_trials her gün 00:30 UTC çalışır (push trigger'lardan önce)
DO $sched_expire$
BEGIN
  PERFORM cron.schedule(
    'expire-finished-trials',
    '30 0 * * *',
    $$ SELECT public.expire_finished_trials(); $$
  );
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pg_cron expire schedule skipped: %', SQLERRM;
END $sched_expire$;

DO $sched_push$
DECLARE
  v_url text;
  v_token text;
  v_url_clean text;
  v_token_clean text;
BEGIN
  SELECT value::text INTO v_url FROM public.app_config WHERE key = 'notifications.edge_url';
  SELECT value::text INTO v_token FROM public.app_config WHERE key = 'notifications.service_token';

  IF v_url IS NULL OR v_url = '""' OR length(v_url) < 5 THEN
    RAISE NOTICE 'notifications.edge_url boş — push cron schedule kurulamadı (manuel admin endpoint kullanılır)';
    RETURN;
  END IF;

  v_url_clean := replace(v_url, '"', '');
  v_token_clean := replace(coalesce(v_token, ''), '"', '');

  -- 09:00 UTC trial_ending_t1
  PERFORM cron.schedule(
    'trial-ending-t1',
    '0 9 * * *',
    format(
      $$ SELECT net.http_post(
          url := %L,
          headers := jsonb_build_object('Authorization', 'Bearer ' || %L, 'Content-Type', 'application/json'),
          body := '{}'::jsonb
        ); $$,
      v_url_clean || '/trial_ending_t1',
      v_token_clean
    )
  );

  -- 09:05 UTC trial_ending_t0 (trial bittiği gün)
  PERFORM cron.schedule(
    'trial-ending-t0',
    '5 9 * * *',
    format(
      $$ SELECT net.http_post(
          url := %L,
          headers := jsonb_build_object('Authorization', 'Bearer ' || %L, 'Content-Type', 'application/json'),
          body := '{}'::jsonb
        ); $$,
      v_url_clean || '/trial_ending_t0',
      v_token_clean
    )
  );

  -- 09:10 UTC trial_winback (trial bittikten 3 gün sonra)
  PERFORM cron.schedule(
    'trial-winback',
    '10 9 * * *',
    format(
      $$ SELECT net.http_post(
          url := %L,
          headers := jsonb_build_object('Authorization', 'Bearer ' || %L, 'Content-Type', 'application/json'),
          body := '{}'::jsonb
        ); $$,
      v_url_clean || '/trial_winback',
      v_token_clean
    )
  );
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pg_cron trial push schedule skipped: %', SQLERRM;
END $sched_push$;

DO $$ BEGIN
  RAISE NOTICE 'Sprint 5.C.1 — trial fields + 3 RPC + 3 push trigger cron schedule aktif';
END $$;

COMMIT;
