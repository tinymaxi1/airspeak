-- AirSpeak — Sprint 5.D.1 — Limited Offers (admin-driven discount campaigns)
--
-- - limited_offers tablosu: priority + audience + tier override + discount_percent
-- - Logic: tier override > discount_percent > default fiyat (paywall.*)
-- - Audience: 6 segment (all/free/trial_used/expired_trial/active_premium/inactive_7d)
-- - RPC: get_active_offers() — audience match + window + priority desc
-- - RPC: get_effective_pricing(offer_code) — tier × offer → effective price
-- - RPC: claim_offer(code) — revenue_events 'admin_grant'+source='promo' (mock; RevenueCat 6'da)
-- - RLS: read herkese, write admin_role >= editor

BEGIN;

-- ─── 1. TABLE ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.limited_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  title_tr text NOT NULL,
  title_en text,
  body_tr text NOT NULL,
  body_en text,
  -- Pricing — tier override OR discount_percent (logic RPC'de)
  monthly_price_try numeric,        -- NULL = default kullan
  yearly_price_try numeric,         -- NULL = default kullan
  lifetime_price_try numeric,       -- NULL = default kullan
  discount_percent int CHECK (discount_percent IS NULL OR (discount_percent BETWEEN 1 AND 90)),
  -- Window
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  -- Display
  banner_color text DEFAULT '#E63946',
  -- Push
  push_title_tr text,
  push_body_tr text,
  -- Targeting
  audience text NOT NULL DEFAULT 'all'
    CHECK (audience IN ('all', 'free', 'trial_used', 'expired_trial', 'active_premium', 'inactive_7d')),
  priority int NOT NULL DEFAULT 0,
  -- Metadata
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT limited_offers_window_check CHECK (ends_at > starts_at),
  CONSTRAINT limited_offers_pricing_or_discount CHECK (
    monthly_price_try IS NOT NULL
    OR yearly_price_try IS NOT NULL
    OR lifetime_price_try IS NOT NULL
    OR discount_percent IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS limited_offers_active_window_idx
  ON public.limited_offers (is_active, starts_at, ends_at)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS limited_offers_audience_idx
  ON public.limited_offers (audience, priority DESC);

CREATE INDEX IF NOT EXISTS limited_offers_code_idx ON public.limited_offers (code);

DROP TRIGGER IF EXISTS set_limited_offers_updated_at ON public.limited_offers;
CREATE TRIGGER set_limited_offers_updated_at
  BEFORE UPDATE ON public.limited_offers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE public.limited_offers IS 'Admin-driven discount campaigns; audience-targeted + windowed';
COMMENT ON COLUMN public.limited_offers.audience IS 'all|free|trial_used|expired_trial|active_premium|inactive_7d';
COMMENT ON COLUMN public.limited_offers.priority IS 'En yüksek priority + audience match gösterilir';
COMMENT ON COLUMN public.limited_offers.discount_percent IS 'Tier override yoksa default fiyata uygulanır';

-- ─── 2. RLS ──────────────────────────────────────────────────────────────
ALTER TABLE public.limited_offers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS limited_offers_read_all ON public.limited_offers;
CREATE POLICY limited_offers_read_all
  ON public.limited_offers
  FOR SELECT
  USING (true);  -- Audience filter RPC içinde, herkes hangi offer'ların var olduğunu okuyabilir

DROP POLICY IF EXISTS limited_offers_admin_write ON public.limited_offers;
CREATE POLICY limited_offers_admin_write
  ON public.limited_offers
  FOR ALL
  USING (public.has_admin_role('editor'))
  WITH CHECK (public.has_admin_role('editor'));

-- ─── 3. RPC: audience match helper ───────────────────────────────────────
-- Bir kullanıcı bir audience'a uygun mu? auth.uid() bağımlı.
CREATE OR REPLACE FUNCTION public.user_matches_audience(p_audience text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $aud$
DECLARE
  v_uid uuid := auth.uid();
  v_premium_until timestamptz;
  v_trial_used boolean;
  v_subscription_status text;
  v_last_active timestamptz;
  v_now timestamptz := now();
BEGIN
  IF p_audience = 'all' THEN RETURN true; END IF;
  IF v_uid IS NULL THEN RETURN p_audience = 'all'; END IF;

  SELECT premium_until, trial_used, subscription_status, last_active_at
    INTO v_premium_until, v_trial_used, v_subscription_status, v_last_active
  FROM public.profiles WHERE id = v_uid;

  -- profile yoksa varsayılan: free
  IF NOT FOUND THEN
    RETURN p_audience = 'free';
  END IF;

  CASE p_audience
    WHEN 'free' THEN
      RETURN COALESCE(v_premium_until, '-infinity'::timestamptz) < v_now
         AND COALESCE(v_trial_used, false) = false;
    WHEN 'trial_used' THEN
      RETURN COALESCE(v_trial_used, false) = true
         AND COALESCE(v_premium_until, '-infinity'::timestamptz) < v_now;
    WHEN 'expired_trial' THEN
      RETURN v_subscription_status = 'expired'
         AND COALESCE(v_premium_until, '-infinity'::timestamptz) < (v_now - interval '7 days');
    WHEN 'active_premium' THEN
      RETURN COALESCE(v_premium_until, '-infinity'::timestamptz) > v_now;
    WHEN 'inactive_7d' THEN
      RETURN COALESCE(v_last_active, '-infinity'::timestamptz) < (v_now - interval '7 days');
    ELSE
      RETURN false;
  END CASE;
END;
$aud$;

GRANT EXECUTE ON FUNCTION public.user_matches_audience(text) TO authenticated, anon;

-- ─── 4. RPC: get_active_offers() ─────────────────────────────────────────
-- Şu an aktif + window içinde + audience match olanlar (priority desc).
CREATE OR REPLACE FUNCTION public.get_active_offers()
RETURNS TABLE (
  id uuid,
  code text,
  title_tr text,
  title_en text,
  body_tr text,
  body_en text,
  monthly_price_try numeric,
  yearly_price_try numeric,
  lifetime_price_try numeric,
  discount_percent int,
  starts_at timestamptz,
  ends_at timestamptz,
  banner_color text,
  audience text,
  priority int
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $offers$
  SELECT
    lo.id, lo.code, lo.title_tr, lo.title_en, lo.body_tr, lo.body_en,
    lo.monthly_price_try, lo.yearly_price_try, lo.lifetime_price_try,
    lo.discount_percent, lo.starts_at, lo.ends_at,
    lo.banner_color, lo.audience, lo.priority
  FROM public.limited_offers lo
  WHERE lo.is_active = true
    AND lo.starts_at <= now()
    AND lo.ends_at > now()
    AND public.user_matches_audience(lo.audience)
  ORDER BY lo.priority DESC, lo.ends_at ASC;
$offers$;

GRANT EXECUTE ON FUNCTION public.get_active_offers() TO authenticated, anon;

-- ─── 5. RPC: get_effective_pricing(offer_code) ───────────────────────────
-- Bir offer + default paywall config'inden tier başına effective fiyat döner.
-- monthly/yearly/lifetime override > discount_percent > default.
CREATE OR REPLACE FUNCTION public.get_effective_pricing(p_offer_code text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $price$
DECLARE
  v_offer RECORD;
  v_default_monthly numeric;
  v_default_yearly numeric;
  v_default_lifetime numeric;
  v_monthly numeric;
  v_yearly numeric;
  v_lifetime numeric;
BEGIN
  -- Default fiyatlar (jsonb'den numeric cast)
  SELECT (value::text)::numeric INTO v_default_monthly FROM public.app_config
    WHERE key = 'paywall.monthly_price_try';
  SELECT (value::text)::numeric INTO v_default_yearly FROM public.app_config
    WHERE key = 'paywall.yearly_price_try';
  SELECT (value::text)::numeric INTO v_default_lifetime FROM public.app_config
    WHERE key = 'paywall.lifetime_price_try';

  v_default_monthly := COALESCE(v_default_monthly, 0);
  v_default_yearly := COALESCE(v_default_yearly, 0);
  v_default_lifetime := COALESCE(v_default_lifetime, 0);

  v_monthly := v_default_monthly;
  v_yearly := v_default_yearly;
  v_lifetime := v_default_lifetime;

  IF p_offer_code IS NOT NULL THEN
    SELECT monthly_price_try, yearly_price_try, lifetime_price_try, discount_percent
      INTO v_offer
    FROM public.limited_offers
    WHERE code = p_offer_code
      AND is_active = true
      AND starts_at <= now()
      AND ends_at > now();

    IF FOUND THEN
      -- Tier override > discount_percent > default
      v_monthly := COALESCE(
        v_offer.monthly_price_try,
        CASE WHEN v_offer.discount_percent IS NOT NULL
             THEN ROUND(v_default_monthly * (100 - v_offer.discount_percent) / 100.0, 2)
             ELSE v_default_monthly END
      );
      v_yearly := COALESCE(
        v_offer.yearly_price_try,
        CASE WHEN v_offer.discount_percent IS NOT NULL
             THEN ROUND(v_default_yearly * (100 - v_offer.discount_percent) / 100.0, 2)
             ELSE v_default_yearly END
      );
      v_lifetime := COALESCE(
        v_offer.lifetime_price_try,
        CASE WHEN v_offer.discount_percent IS NOT NULL
             THEN ROUND(v_default_lifetime * (100 - v_offer.discount_percent) / 100.0, 2)
             ELSE v_default_lifetime END
      );
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'monthly', v_monthly,
    'yearly', v_yearly,
    'lifetime', v_lifetime,
    'monthly_default', v_default_monthly,
    'yearly_default', v_default_yearly,
    'lifetime_default', v_default_lifetime
  );
END;
$price$;

GRANT EXECUTE ON FUNCTION public.get_effective_pricing(text) TO authenticated, anon;

-- ─── 6. RPC: claim_offer(code) ───────────────────────────────────────────
-- revenue_events insert (idempotent — son 24h aynı code+user varsa skip).
-- Premium aktivasyonu RevenueCat'le yapacağız (Sprint 6); bu sadece audit log.
CREATE OR REPLACE FUNCTION public.claim_offer(p_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $claim$
DECLARE
  v_uid uuid := auth.uid();
  v_offer RECORD;
  v_already boolean;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated');
  END IF;

  SELECT id, code, title_tr, audience INTO v_offer
  FROM public.limited_offers
  WHERE code = p_code
    AND is_active = true
    AND starts_at <= now()
    AND ends_at > now();
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'offer_not_found_or_expired');
  END IF;

  IF NOT public.user_matches_audience(v_offer.audience) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'audience_mismatch');
  END IF;

  -- Son 24h içinde aynı offer claim'i var mı? (idempotency)
  SELECT EXISTS (
    SELECT 1 FROM public.revenue_events
    WHERE user_id = v_uid
      AND source = 'promo'
      AND metadata->>'offer_code' = p_code
      AND created_at > now() - interval '24 hours'
  ) INTO v_already;

  IF v_already THEN
    RETURN jsonb_build_object('ok', true, 'already_claimed', true);
  END IF;

  INSERT INTO public.revenue_events (user_id, event_type, source, metadata)
  VALUES (
    v_uid,
    'admin_grant',
    'promo',
    jsonb_build_object('offer_code', p_code, 'offer_id', v_offer.id, 'offer_title', v_offer.title_tr)
  );

  RETURN jsonb_build_object('ok', true, 'offer_id', v_offer.id);
END;
$claim$;

GRANT EXECUTE ON FUNCTION public.claim_offer(text) TO authenticated;

-- ─── 7. APP_CONFIG: limited_offer feature flag ──────────────────────────
INSERT INTO public.app_config (key, value, description, category, data_type)
VALUES
  ('offers.banner_enabled', 'true'::jsonb,
   'Mobile aktif offer banner gösterilsin mi (kapatma kill switch)',
   'paywall', 'boolean')
ON CONFLICT (key) DO NOTHING;

DO $$ BEGIN
  RAISE NOTICE 'Sprint 5.D.1 — limited_offers + 4 RPC + RLS aktif';
END $$;

COMMIT;
