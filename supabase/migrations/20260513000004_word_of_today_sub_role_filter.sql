-- AirSpeak — get_word_of_today() RPC: sub_role filter (FAZ 3)
--
-- Eski davranış: sadece target_roles filter.
-- Yeni davranış:
--   1. Kullanıcının profile.sub_role'u varsa:
--      - Önce target_sub_roles içeren kayıtlardan ara
--      - Yoksa target_sub_roles boş olan (= tüm sub_role'lara açık) kayıtlardan ara
--   2. sub_role yoksa veya hiç eşleşme yoksa: mevcut target_roles davranışı (fallback)
--
-- Scheduled date öncelik mantığı korunur.

CREATE OR REPLACE FUNCTION public.get_word_of_today()
RETURNS SETOF public.word_of_the_day
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_user_role text;
  v_user_sub_role text;
  v_today_doy int := EXTRACT(DOY FROM CURRENT_DATE)::int;
  v_count int;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'auth required';
  END IF;

  -- User rol + sub_role
  SELECT COALESCE(role, 'pilot'), sub_role
  INTO v_user_role, v_user_sub_role
  FROM public.profiles
  WHERE id = v_user_id;

  IF v_user_role IS NULL THEN
    v_user_role := 'pilot';
  END IF;

  -- ─── 1) Scheduled date öncelikli (admin manuel atadıysa) ───────────────────
  -- Scheduled için sub_role match tercih edilir, sonra target_roles fallback.
  IF v_user_sub_role IS NOT NULL THEN
    RETURN QUERY
    SELECT * FROM public.word_of_the_day
    WHERE scheduled_date = CURRENT_DATE
      AND is_active = true
      AND v_user_role = ANY(target_roles)
      AND (
        v_user_sub_role = ANY(target_sub_roles)
        OR target_sub_roles IS NULL
        OR array_length(target_sub_roles, 1) IS NULL
      )
    LIMIT 1;
    IF FOUND THEN RETURN; END IF;
  END IF;

  RETURN QUERY
  SELECT * FROM public.word_of_the_day
  WHERE scheduled_date = CURRENT_DATE
    AND is_active = true
    AND v_user_role = ANY(target_roles)
  LIMIT 1;
  IF FOUND THEN RETURN; END IF;

  -- ─── 2) Sub-role öncelikli rotation ─────────────────────────────────────────
  IF v_user_sub_role IS NOT NULL THEN
    -- Sub-role'a özel kayıt sayısı
    SELECT COUNT(*) INTO v_count
    FROM public.word_of_the_day
    WHERE is_active = true
      AND v_user_role = ANY(target_roles)
      AND v_user_sub_role = ANY(target_sub_roles);

    IF v_count > 0 THEN
      RETURN QUERY
      SELECT * FROM public.word_of_the_day
      WHERE is_active = true
        AND v_user_role = ANY(target_roles)
        AND v_user_sub_role = ANY(target_sub_roles)
      ORDER BY id
      OFFSET (v_today_doy % v_count)
      LIMIT 1;
      RETURN;
    END IF;
  END IF;

  -- ─── 3) Sub-role eşleşme yok → target_roles fallback ────────────────────────
  -- Bu rol için aktif kelime sayısı (target_sub_roles boş olanlar dahil)
  SELECT COUNT(*) INTO v_count
  FROM public.word_of_the_day
  WHERE is_active = true
    AND v_user_role = ANY(target_roles);

  -- 3a) Bu rol için içerik yoksa, herhangi bir aktif kelime
  IF v_count = 0 THEN
    RETURN QUERY
    SELECT * FROM public.word_of_the_day
    WHERE is_active = true
    ORDER BY id
    LIMIT 1;
    RETURN;
  END IF;

  -- 3b) day_of_year ile deterministik rotation (mevcut davranış)
  RETURN QUERY
  SELECT * FROM public.word_of_the_day
  WHERE is_active = true
    AND v_user_role = ANY(target_roles)
  ORDER BY id
  OFFSET (v_today_doy % v_count)
  LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_word_of_today() TO authenticated;

COMMENT ON FUNCTION public.get_word_of_today() IS
  'FAZ 3 — sub_role filter eklendi. Önce sub_role match (varsa), sonra target_roles fallback. Scheduled date öncelikli.';
