-- AirSpeak — Heart refill via coins RPC
--
-- Tek kalp dolumu: spend_coins() RPC çağırır, başarılıysa profiles.hearts +1.
-- Tüm kalpler dolduğunda hearts_refill_at = NULL.
--
-- Çağrı: select * from refill_heart_via_coins();
-- Return: { ok, balance, hearts, error }

BEGIN;

CREATE OR REPLACE FUNCTION public.refill_heart_via_coins()
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_cost int;
  v_max int;
  v_hearts int;
  v_spend_result jsonb;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated');
  END IF;

  SELECT (value::text)::int INTO v_cost FROM public.app_config WHERE key = 'heart.refill_cost_single';
  v_cost := COALESCE(v_cost, 25);

  SELECT (value::text)::int INTO v_max FROM public.app_config WHERE key = 'heart.max';
  v_max := COALESCE(v_max, 2);

  SELECT hearts INTO v_hearts FROM public.profiles WHERE id = v_uid;
  IF v_hearts >= v_max THEN
    RETURN jsonb_build_object('ok', false, 'error', 'already_full', 'hearts', v_hearts);
  END IF;

  -- Coin spend
  v_spend_result := public.spend_coins(v_cost, 'heart_refill', 'other', NULL);
  IF (v_spend_result->>'ok')::boolean IS NOT TRUE THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', COALESCE(v_spend_result->>'error', 'insufficient_coins'),
      'hearts', v_hearts
    );
  END IF;

  -- Heart artır
  UPDATE public.profiles
    SET hearts = LEAST(hearts + 1, v_max),
        hearts_refill_at = CASE WHEN hearts + 1 >= v_max THEN NULL ELSE hearts_refill_at END,
        updated_at = now()
    WHERE id = v_uid
    RETURNING hearts INTO v_hearts;

  RETURN jsonb_build_object(
    'ok', true,
    'hearts', v_hearts,
    'balance', (v_spend_result->>'balance')::int,
    'cost', v_cost
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.refill_heart_via_coins() TO authenticated;

DO $$ BEGIN RAISE NOTICE 'refill_heart_via_coins() RPC eklendi'; END $$;

COMMIT;
