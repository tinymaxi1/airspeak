-- AirSpeak — profiles.onboarding_completed (Sprint 14.C)
-- Reinstall sonrası kullanıcının tekrar onboarding'e düşmesini engelle.
-- Server source-of-truth; local Zustand persist ikincil.

-- ─── 1) Kolonlar ───────────────────────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz;

-- Tamamlanmamış user'ları kolay query — partial index
CREATE INDEX IF NOT EXISTS profiles_onboarding_pending_idx
  ON public.profiles (id)
  WHERE onboarding_completed = false;

-- ─── 2) Backfill ──────────────────────────────────────────────────────────
-- Mevcut user'lar: role + level ikisi de set ise onboarding tamam say.
-- Bu profilini doldurmuş eski kullanıcılar için reinstall'da onboarding
-- sormayacak.
UPDATE public.profiles
   SET onboarding_completed = true,
       onboarding_completed_at = COALESCE(updated_at, now())
 WHERE role IS NOT NULL
   AND level IS NOT NULL
   AND onboarding_completed = false;

-- ─── 3) RPC: mark_onboarding_completed ────────────────────────────────────
-- Idempotent; goals submit handler tarafından çağrılır.
CREATE OR REPLACE FUNCTION public.mark_onboarding_completed()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_changed boolean := false;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'no_auth');
  END IF;

  UPDATE public.profiles
     SET onboarding_completed = true,
         onboarding_completed_at = now()
   WHERE id = v_user_id
     AND onboarding_completed = false;

  GET DIAGNOSTICS v_changed = ROW_COUNT;

  RETURN jsonb_build_object(
    'ok', true,
    'user_id', v_user_id,
    'changed', v_changed > 0
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.mark_onboarding_completed() TO authenticated;
