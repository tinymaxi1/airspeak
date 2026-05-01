-- ============================================================================
-- Sprint 5.B — Coin server-side wallet + Streak freeze gerçek mekanik
-- ============================================================================
-- profiles: coins + envanter alanları (streak_freezes_inventory + hints +
--           lesson_skips + xp_boosts).
-- coin_transactions: audit log.
-- RPC'ler: add_coins, spend_coins, purchase_shop_item, apply_streak_freeze.
-- ============================================================================

BEGIN;

-- ─── 1. profiles wallet kolonları ────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS coins int NOT NULL DEFAULT 0 CHECK (coins >= 0),
  ADD COLUMN IF NOT EXISTS streak_freezes_inventory int NOT NULL DEFAULT 0 CHECK (streak_freezes_inventory >= 0),
  ADD COLUMN IF NOT EXISTS hints_inventory int NOT NULL DEFAULT 0 CHECK (hints_inventory >= 0),
  ADD COLUMN IF NOT EXISTS lesson_skips_inventory int NOT NULL DEFAULT 0 CHECK (lesson_skips_inventory >= 0),
  ADD COLUMN IF NOT EXISTS xp_boost_until timestamptz;

CREATE INDEX IF NOT EXISTS profiles_coins_idx ON public.profiles (coins DESC) WHERE coins > 0;

-- ─── 2. coin_transactions ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.coin_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- pozitif = kazanç (lesson/league/admin_grant), negatif = harcama (shop/freeze)
  amount int NOT NULL,
  balance_after int NOT NULL CHECK (balance_after >= 0),
  reason text NOT NULL,
  source text NOT NULL CHECK (source IN (
    'lesson_completed', 'admin_grant', 'shop_purchase', 'league_reward',
    'competition_reward', 'streak_freeze_use', 'one_way_migration', 'other'
  )),
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS coin_tx_user_idx
  ON public.coin_transactions (user_id, created_at DESC);

ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS coin_tx_own_read ON public.coin_transactions;
CREATE POLICY coin_tx_own_read ON public.coin_transactions
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin_user());

-- Insert sadece SECURITY DEFINER RPC'ler aracılığıyla
DROP POLICY IF EXISTS coin_tx_admin_insert ON public.coin_transactions;
CREATE POLICY coin_tx_admin_insert ON public.coin_transactions
  FOR INSERT WITH CHECK (public.is_admin_user());

-- ─── 3. add_coins RPC ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.add_coins(
  p_amount int,
  p_reason text,
  p_source text DEFAULT 'other',
  p_metadata jsonb DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_balance int;
BEGIN
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'no_auth');
  END IF;
  IF p_amount <= 0 OR p_amount > 1000000 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_amount');
  END IF;

  UPDATE public.profiles
     SET coins = coins + p_amount
   WHERE id = v_user
   RETURNING coins INTO v_balance;

  INSERT INTO public.coin_transactions (user_id, amount, balance_after, reason, source, metadata)
  VALUES (v_user, p_amount, v_balance, p_reason, p_source, p_metadata);

  RETURN jsonb_build_object('ok', true, 'balance', v_balance, 'delta', p_amount);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.add_coins(int, text, text, jsonb) FROM public;
GRANT EXECUTE ON FUNCTION public.add_coins(int, text, text, jsonb) TO authenticated;

-- ─── 4. spend_coins RPC ──────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.spend_coins(
  p_amount int,
  p_reason text,
  p_source text DEFAULT 'shop_purchase',
  p_metadata jsonb DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_current int;
  v_balance int;
BEGIN
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'no_auth');
  END IF;
  IF p_amount <= 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_amount');
  END IF;

  -- Lock row
  SELECT coins INTO v_current FROM public.profiles WHERE id = v_user FOR UPDATE;
  IF v_current IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'profile_missing');
  END IF;
  IF v_current < p_amount THEN
    RETURN jsonb_build_object('ok', false, 'error', 'insufficient', 'balance', v_current);
  END IF;

  UPDATE public.profiles
     SET coins = coins - p_amount
   WHERE id = v_user
   RETURNING coins INTO v_balance;

  INSERT INTO public.coin_transactions (user_id, amount, balance_after, reason, source, metadata)
  VALUES (v_user, -p_amount, v_balance, p_reason, p_source, p_metadata);

  RETURN jsonb_build_object('ok', true, 'balance', v_balance, 'delta', -p_amount);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.spend_coins(int, text, text, jsonb) FROM public;
GRANT EXECUTE ON FUNCTION public.spend_coins(int, text, text, jsonb) TO authenticated;

-- ─── 5. purchase_shop_item RPC ──────────────────────────────────────────
-- Atomik: coin düş + envanter alanını artır (ya da xp_boost_until set et).
CREATE OR REPLACE FUNCTION public.purchase_shop_item(
  p_item_id text,
  p_cost int,
  p_inventory_field text DEFAULT NULL,  -- 'streak_freezes_inventory' / 'hints_inventory' / 'lesson_skips_inventory'
  p_inventory_count int DEFAULT 1,
  p_boost_minutes int DEFAULT NULL  -- xp_boost için
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_current int;
  v_balance int;
BEGIN
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'no_auth');
  END IF;
  IF p_cost < 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_cost');
  END IF;

  SELECT coins INTO v_current FROM public.profiles WHERE id = v_user FOR UPDATE;
  IF COALESCE(v_current, 0) < p_cost THEN
    RETURN jsonb_build_object('ok', false, 'error', 'insufficient', 'balance', COALESCE(v_current, 0));
  END IF;

  -- Coin düş
  UPDATE public.profiles
     SET coins = coins - p_cost
   WHERE id = v_user
   RETURNING coins INTO v_balance;

  -- Envanter güncelle (kolon adı whitelist)
  IF p_inventory_field IS NOT NULL THEN
    IF p_inventory_field NOT IN (
      'streak_freezes_inventory', 'hints_inventory', 'lesson_skips_inventory'
    ) THEN
      RETURN jsonb_build_object('ok', false, 'error', 'invalid_inventory_field');
    END IF;
    EXECUTE format(
      'UPDATE public.profiles SET %I = %I + $1 WHERE id = $2',
      p_inventory_field, p_inventory_field
    ) USING p_inventory_count, v_user;
  END IF;

  -- XP boost (opsiyonel)
  IF p_boost_minutes IS NOT NULL AND p_boost_minutes > 0 THEN
    UPDATE public.profiles
       SET xp_boost_until = GREATEST(COALESCE(xp_boost_until, now()), now())
                            + (p_boost_minutes * INTERVAL '1 minute')
     WHERE id = v_user;
  END IF;

  INSERT INTO public.coin_transactions (user_id, amount, balance_after, reason, source, metadata)
  VALUES (
    v_user, -p_cost, v_balance, 'shop_' || p_item_id, 'shop_purchase',
    jsonb_build_object(
      'item_id', p_item_id,
      'inventory_field', p_inventory_field,
      'inventory_count', p_inventory_count,
      'boost_minutes', p_boost_minutes
    )
  );

  RETURN jsonb_build_object('ok', true, 'balance', v_balance, 'item', p_item_id);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.purchase_shop_item(text, int, text, int, int) FROM public;
GRANT EXECUTE ON FUNCTION public.purchase_shop_item(text, int, text, int, int) TO authenticated;

-- ─── 6. apply_streak_freeze RPC ─────────────────────────────────────────
-- Envanterden 1 freeze kullan, streaks.frozen_until = today + 1 day.
CREATE OR REPLACE FUNCTION public.apply_streak_freeze()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_inv int;
  v_target date := (now() AT TIME ZONE 'UTC')::date + 1;
BEGIN
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'no_auth');
  END IF;

  SELECT streak_freezes_inventory INTO v_inv
    FROM public.profiles WHERE id = v_user FOR UPDATE;
  IF COALESCE(v_inv, 0) <= 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'no_inventory');
  END IF;

  UPDATE public.profiles
     SET streak_freezes_inventory = streak_freezes_inventory - 1
   WHERE id = v_user;

  -- streaks satırı yoksa oluştur
  INSERT INTO public.streaks (user_id, current_streak, longest_streak, frozen_until)
  VALUES (v_user, 0, 0, v_target)
  ON CONFLICT (user_id) DO UPDATE
    SET frozen_until = GREATEST(COALESCE(public.streaks.frozen_until, v_target), v_target),
        updated_at = now();

  RETURN jsonb_build_object(
    'ok', true,
    'frozen_until', v_target,
    'remaining_inventory', v_inv - 1
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.apply_streak_freeze() FROM public;
GRANT EXECUTE ON FUNCTION public.apply_streak_freeze() TO authenticated;

-- ─── 7. migrate_local_coins RPC (one-way migration) ─────────────────────
-- Mobile app first launch'ta MMKV'de bulunan coin sayısını DB'ye taşır.
-- Idempotent: zaten DB'de coin varsa skip (ya da MAX(local, db) — pragmatik
-- "ekle" kararı: kullanıcı local coin'i kaybetmez).
CREATE OR REPLACE FUNCTION public.migrate_local_coins(
  p_local_coins int,
  p_local_freezes int DEFAULT 0,
  p_local_hints int DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_already_migrated boolean;
BEGIN
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'no_auth');
  END IF;
  IF p_local_coins < 0 OR p_local_coins > 100000 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_coins');
  END IF;

  -- Idempotency check: 'one_way_migration' transaction var mı?
  SELECT EXISTS (
    SELECT 1 FROM public.coin_transactions
     WHERE user_id = v_user AND source = 'one_way_migration'
  ) INTO v_already_migrated;

  IF v_already_migrated THEN
    RETURN jsonb_build_object('ok', true, 'already_migrated', true);
  END IF;

  UPDATE public.profiles
     SET coins = coins + p_local_coins,
         streak_freezes_inventory = streak_freezes_inventory + p_local_freezes,
         hints_inventory = hints_inventory + p_local_hints
   WHERE id = v_user;

  INSERT INTO public.coin_transactions (user_id, amount, balance_after, reason, source, metadata)
  SELECT v_user, p_local_coins, coins, 'local_to_db_migration', 'one_way_migration',
         jsonb_build_object('local_freezes', p_local_freezes, 'local_hints', p_local_hints)
    FROM public.profiles WHERE id = v_user;

  RETURN jsonb_build_object('ok', true, 'migrated', true, 'coins', p_local_coins);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.migrate_local_coins(int, int, int) FROM public;
GRANT EXECUTE ON FUNCTION public.migrate_local_coins(int, int, int) TO authenticated;

DO $$ BEGIN
  RAISE NOTICE 'Sprint 5.B — coins + inventory + 5 RPC + audit aktif';
END $$;

COMMIT;
