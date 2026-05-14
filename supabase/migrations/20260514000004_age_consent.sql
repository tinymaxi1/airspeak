-- Faz 2.E — 13+ yaş onayı (COPPA + App Store age rating uyumu)
--
-- Register'da kullanıcı "13 yaşından büyük olduğumu onaylıyorum" checkbox'u
-- işaretler. Bu işaret profiles.age_13_plus_accepted_at olarak kaydedilir.
-- Eğer onaylanmamışsa hesap oluşturulmaz (consent_missing).

-- ============================================================================
-- 1) profiles.age_13_plus_accepted_at kolonu
-- ============================================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS age_13_plus_accepted_at timestamptz;

-- ============================================================================
-- 2) record_signup_consents RPC overload — p_age_13_plus parametresi
--    Mevcut imza: (boolean, boolean, boolean) → korunur (default 2-arg çağrılar için)
--    Yeni imza: (boolean, boolean, boolean, boolean)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.record_signup_consents(
  p_terms boolean,
  p_kvkk boolean,
  p_marketing boolean DEFAULT false,
  p_age_13_plus boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_now timestamptz := now();
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated');
  END IF;

  -- Zorunlu consent'ler: terms + KVKK + age_13_plus
  IF NOT p_terms OR NOT p_kvkk THEN
    RETURN jsonb_build_object('ok', false, 'error', 'mandatory_consents_missing');
  END IF;

  IF NOT p_age_13_plus THEN
    RETURN jsonb_build_object('ok', false, 'error', 'age_consent_missing');
  END IF;

  UPDATE public.profiles
     SET terms_accepted_at = COALESCE(terms_accepted_at, v_now),
         kvkk_accepted_at = COALESCE(kvkk_accepted_at, v_now),
         age_13_plus_accepted_at = COALESCE(age_13_plus_accepted_at, v_now),
         marketing_consent = p_marketing,
         updated_at = v_now
   WHERE id = v_uid;

  RETURN jsonb_build_object('ok', true, 'accepted_at', v_now);
END;
$$;

REVOKE ALL ON FUNCTION public.record_signup_consents(boolean, boolean, boolean, boolean) FROM public;
GRANT EXECUTE ON FUNCTION public.record_signup_consents(boolean, boolean, boolean, boolean) TO authenticated;

-- ============================================================================
-- 3) Doğrulama
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='profiles' AND column_name='age_13_plus_accepted_at'
  ) THEN
    RAISE EXCEPTION 'profiles.age_13_plus_accepted_at kolonu eklenmedi';
  END IF;

  RAISE NOTICE 'Faz 2.E age consent migration OK';
END $$;
