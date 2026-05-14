-- Faz 3.8 — Lig auto-join + NPC seed
--
-- 1. profiles.is_npc kolonu ekle
-- 2. handle_new_user trigger UPDATE: register sonrası otomatik lig atama
--    (Şu an sadece bump_user_xp ilk derste lazy assign yapıyor — yeni kullanıcı
--     register olur olmaz league_memberships'ta görünmesi için)
-- 3. 20 NPC kullanıcısı seed:
--    - 5 pilot, 3 atc, 3 cabin, 3 technician, 2 ground, 2 student, 2 dispatcher
--    - TR gerçekçi callsign'lar (TK-Demir, ATC-Kaya, vs)
--    - Random XP 50-800 arası (Cadet'ten Captain'a yayılım)
--    - assign_user_to_league ile uygun gruba yerleştir
--    - Login yapamasınlar: encrypted_password '*' (placeholder)

-- ============================================================================
-- 1) profiles.is_npc kolonu
-- ============================================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_npc boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS profiles_is_npc_idx
  ON public.profiles (is_npc) WHERE is_npc = true;

-- ============================================================================
-- 2) handle_new_user trigger — register sonrası otomatik lig atama
--    Mevcut trigger korunur (profile + settings INSERT). Üzerine lazy assign eklenir.
--    NOT: assign_user_to_league no_active_season durumunda gracefully fail eder.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL)
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Faz 3.8: Register sonrası otomatik lig atama (best-effort)
  -- Aktif weekly season yoksa veya hata olursa sessizce devam et.
  -- NPC'ler için (raw_user_meta_data->>'is_npc' = 'true') ÇAĞIRMA — onları
  -- ayrıca seed bloğunda yöneteceğiz (rol/level set edildikten SONRA).
  BEGIN
    IF COALESCE(NEW.raw_user_meta_data->>'is_npc', 'false') <> 'true' THEN
      PERFORM public.assign_user_to_league(NEW.id, 'bronze');
    END IF;
  EXCEPTION WHEN OTHERS THEN
    NULL; -- non-critical, log'a düşmesin
  END;

  RETURN NEW;
END;
$$;

-- Trigger zaten mevcut — sadece function tanımı yeniden create edildi

-- ============================================================================
-- 3) NPC SEED — 20 fake user
--    auth.users INSERT → handle_new_user trigger profile oluşturur →
--    UPDATE profiles ile rol/level/callsign/is_npc set →
--    assign_user_to_league ile lig grubuna yerleştir
-- ============================================================================
DO $$
DECLARE
  v_npc record;
  v_user_id uuid;
  v_xp int;
  v_npc_class league_class;
BEGIN
  FOR v_npc IN (
    VALUES
      -- (callsign, full_name, role, level)
      ('TK-Demir',    'Ali Demir',       'pilot',      'B2'),
      ('TK-Yılmaz',   'Mehmet Yılmaz',   'pilot',      'B1'),
      ('PG-Çelik',    'Hakan Çelik',     'pilot',      'B2'),
      ('X-Aydın',     'Burak Aydın',     'pilot',      'A2'),
      ('TK-Şahin',    'Murat Şahin',     'pilot',      'C1'),

      ('ATC-Kaya',    'Emre Kaya',       'atc',        'B2'),
      ('ATC-Erdoğan', 'Cem Erdoğan',     'atc',        'B1'),
      ('ATC-Doğan',   'Selim Doğan',     'atc',        'B2'),

      ('TK-Yıldız',   'Elif Yıldız',     'cabin',      'B1'),
      ('X-Çetin',     'Zeynep Çetin',    'cabin',      'A2'),
      ('PG-Kara',     'Ayşe Kara',       'cabin',      'B1'),

      ('TECH-Erol',   'Ahmet Erol',      'technician', 'B1'),
      ('TECH-Aksoy',  'Hasan Aksoy',     'technician', 'B2'),
      ('TECH-Polat',  'Kemal Polat',     'technician', 'A2'),

      ('GND-Acar',    'Mert Acar',       'ground',     'B1'),
      ('GND-Korkmaz', 'Onur Korkmaz',    'ground',     'A2'),

      ('OGR-Ates',    'Defne Ateş',      'student',    'A1'),
      ('OGR-Tunc',    'Cansu Tunç',      'student',    'A2'),

      ('DSP-Solak',   'Tolga Solak',     'pilot',      'B1'),  -- dispatcher rolü yok, pilot fallback
      ('DSP-Erim',    'İrem Erim',       'ground',     'B1')   -- ground fallback
  ) AS t(callsign, full_name, role, level)
  LOOP
    v_user_id := gen_random_uuid();
    v_xp := 50 + (random() * 750)::int;  -- 50-800 arası
    -- Class tier XP'ye göre: <100 bronze, 100-300 silver, 300-500 gold,
    -- 500-700 sapphire, >700 ruby
    v_npc_class := CASE
      WHEN v_xp < 100 THEN 'bronze'::league_class
      WHEN v_xp < 300 THEN 'silver'::league_class
      WHEN v_xp < 500 THEN 'gold'::league_class
      WHEN v_xp < 700 THEN 'sapphire'::league_class
      ELSE 'ruby'::league_class
    END;

    -- auth.users INSERT — minimum kolonlar
    -- encrypted_password '!' → bcrypt format'ında değil, login impossible
    -- email_confirmed_at NOT NULL → trigger'ı tetikler
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_user_meta_data, role, aud, created_at, updated_at
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'npc-' || lower(v_npc.callsign) || '@airspeak-npc.local',
      '!' , -- invalid hash → login impossible
      now(),
      jsonb_build_object('is_npc', true, 'full_name', v_npc.full_name),
      'authenticated',
      'authenticated',
      now(), now()
    )
    ON CONFLICT (id) DO NOTHING;

    -- Profiles handle_new_user trigger ile oluştu, update et
    UPDATE public.profiles
       SET role = v_npc.role,
           level = v_npc.level,
           full_name = v_npc.full_name,
           username = lower(v_npc.callsign),
           is_npc = true,
           updated_at = now()
     WHERE id = v_user_id;

    -- user_xp_summary seed (week_xp = v_xp)
    INSERT INTO public.user_xp_summary (user_id, total_xp, week_xp, month_xp, year_xp)
    VALUES (v_user_id, v_xp, v_xp, v_xp, v_xp)
    ON CONFLICT (user_id) DO UPDATE SET week_xp = v_xp;

    -- Lige ata (uygun grup veya yeni grup açar)
    PERFORM public.assign_user_to_league(v_user_id, v_npc_class);
  END LOOP;

  RAISE NOTICE 'Faz 3.8: 20 NPC seed tamamlandı.';
END $$;

-- ============================================================================
-- 4) Doğrulama
-- ============================================================================
DO $$
DECLARE
  v_npc_count int;
  v_npc_in_league int;
BEGIN
  SELECT count(*) INTO v_npc_count FROM public.profiles WHERE is_npc = true;
  SELECT count(*) INTO v_npc_in_league
    FROM public.league_memberships m
    JOIN public.profiles p ON p.id = m.user_id
    WHERE p.is_npc = true;

  IF v_npc_count < 20 THEN
    RAISE EXCEPTION 'NPC seed eksik: %/20 profile, %/20 league_membership',
      v_npc_count, v_npc_in_league;
  END IF;

  RAISE NOTICE 'NPC doğrulama OK: % profile, % league_membership',
    v_npc_count, v_npc_in_league;
END $$;
