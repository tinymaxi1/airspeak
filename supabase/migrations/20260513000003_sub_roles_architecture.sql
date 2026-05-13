-- AirSpeak — Sub-Role Architecture (FAZ 1)
-- v1.0 polish — daha granular rol seçimi.
-- 7 parent rol (UserRole) altında 40 sub_role.
--
-- Profile.sub_role nullable — eski user'lar etkilenmez.
-- scenarios/word_of_the_day/vocab_terms tablolarına target_sub_roles text[] eklenir.

-- ─── 1) sub_roles tablosu ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sub_roles (
  id            text PRIMARY KEY,
  parent_role   text NOT NULL CHECK (parent_role IN ('pilot','atc','cabin','technician','ground','student','dispatcher')),
  display_order int NOT NULL DEFAULT 0,
  active        boolean NOT NULL DEFAULT true,
  icon          text,
  names         jsonb NOT NULL,           -- { tr: 'A320 Pilot', en: '...', ... 20 dil }
  descriptions  jsonb,                    -- { tr: '...', en: '...', boş diller admin'den }
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.sub_roles IS
  'Granular sub-role taxonomy. 7 parent role × ~5-11 sub_role each. v1.0 polish.';

-- ─── 2) Index ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_sub_roles_parent_active
  ON public.sub_roles (parent_role, active, display_order);

-- ─── 3) updated_at trigger ────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.tg_sub_roles_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $func$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$func$;

DROP TRIGGER IF EXISTS trg_sub_roles_updated_at ON public.sub_roles;
CREATE TRIGGER trg_sub_roles_updated_at
  BEFORE UPDATE ON public.sub_roles
  FOR EACH ROW EXECUTE FUNCTION public.tg_sub_roles_updated_at();

-- ─── 4) RLS: public read (active only), admin write ───────────────────────
ALTER TABLE public.sub_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sub_roles public read active" ON public.sub_roles;
CREATE POLICY "sub_roles public read active"
  ON public.sub_roles
  FOR SELECT
  TO authenticated
  USING (active = true);

-- Admin write — admin_role editor+ (mevcut pattern, profiles.admin_role kolonu varsa)
DROP POLICY IF EXISTS "sub_roles admin write" ON public.sub_roles;
CREATE POLICY "sub_roles admin write"
  ON public.sub_roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.admin_role IN ('super_admin', 'editor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.admin_role IN ('super_admin', 'editor')
    )
  );

-- ─── 5) profiles.sub_role kolonu ──────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS sub_role text REFERENCES public.sub_roles(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.profiles.sub_role IS
  'Optional granular sub-role (e.g. pilot_a320). NULL = parent role only.';

CREATE INDEX IF NOT EXISTS idx_profiles_sub_role ON public.profiles (sub_role) WHERE sub_role IS NOT NULL;

-- ─── 6) İçerik tablolarına target_sub_roles array kolonu ──────────────────
-- scenarios (eski conversation_scenarios — bazı projelerde scenarios)
DO $body$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema='public' AND table_name='scenarios') THEN
    EXECUTE 'ALTER TABLE public.scenarios ADD COLUMN IF NOT EXISTS target_sub_roles text[] DEFAULT ''{}''';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_scenarios_target_sub_roles ON public.scenarios USING GIN (target_sub_roles)';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema='public' AND table_name='conversation_scenarios') THEN
    EXECUTE 'ALTER TABLE public.conversation_scenarios ADD COLUMN IF NOT EXISTS target_sub_roles text[] DEFAULT ''{}''';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_conv_scenarios_target_sub_roles ON public.conversation_scenarios USING GIN (target_sub_roles)';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema='public' AND table_name='word_of_the_day') THEN
    EXECUTE 'ALTER TABLE public.word_of_the_day ADD COLUMN IF NOT EXISTS target_sub_roles text[] DEFAULT ''{}''';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_word_of_day_target_sub_roles ON public.word_of_the_day USING GIN (target_sub_roles)';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema='public' AND table_name='vocab_terms') THEN
    EXECUTE 'ALTER TABLE public.vocab_terms ADD COLUMN IF NOT EXISTS target_sub_roles text[] DEFAULT ''{}''';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_vocab_terms_target_sub_roles ON public.vocab_terms USING GIN (target_sub_roles)';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema='public' AND table_name='vocabulary_terms') THEN
    EXECUTE 'ALTER TABLE public.vocabulary_terms ADD COLUMN IF NOT EXISTS target_sub_roles text[] DEFAULT ''{}''';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_vocabulary_terms_target_sub_roles ON public.vocabulary_terms USING GIN (target_sub_roles)';
  END IF;
END $body$;

-- ─── 7) Seed — 40 sub_roles ────────────────────────────────────────────────

INSERT INTO public.sub_roles (id, parent_role, display_order, icon, names, descriptions) VALUES
  ('pilot_a320', 'pilot', 0, '✈️', '{"tr": "A320 Pilot", "en": "A320 Pilot", "de": "A320 Pilot", "fr": "A320 Pilot", "es": "A320 Pilot", "it": "A320 Pilot", "pt": "A320 Pilot", "ru": "A320 Pilot", "ja": "A320 Pilot", "ko": "A320 Pilot", "zh": "A320 Pilot", "ar": "A320 Pilot", "hi": "A320 Pilot", "nl": "A320 Pilot", "pl": "A320 Pilot", "id": "A320 Pilot", "el": "A320 Pilot", "fa": "A320 Pilot", "ms": "A320 Pilot", "th": "A320 Pilot"}'::jsonb, '{"tr": "Airbus A320 ailesi — orta menzil dar gövde. SHGM Type Rating + ICAO 4 gereklilikleri.", "en": "Airbus A320 family — medium-range narrow-body. CAA Type Rating + ICAO 4 required."}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  parent_role = EXCLUDED.parent_role,
  display_order = EXCLUDED.display_order,
  icon = EXCLUDED.icon,
  names = EXCLUDED.names,
  descriptions = EXCLUDED.descriptions;

INSERT INTO public.sub_roles (id, parent_role, display_order, icon, names, descriptions) VALUES
  ('pilot_a321', 'pilot', 1, '✈️', '{"tr": "A321 Pilot", "en": "A321 Pilot", "de": "A321 Pilot", "fr": "A321 Pilot", "es": "A321 Pilot", "it": "A321 Pilot", "pt": "A321 Pilot", "ru": "A321 Pilot", "ja": "A321 Pilot", "ko": "A321 Pilot", "zh": "A321 Pilot", "ar": "A321 Pilot", "hi": "A321 Pilot", "nl": "A321 Pilot", "pl": "A321 Pilot", "id": "A321 Pilot", "el": "A321 Pilot", "fa": "A321 Pilot", "ms": "A321 Pilot", "th": "A321 Pilot"}'::jsonb, '{"tr": "A321 — A320 ailesinin uzatılmış versiyonu. Aynı Type Rating, daha yüksek MTOW.", "en": "A321 — stretched A320. Same Type Rating, higher MTOW."}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  parent_role = EXCLUDED.parent_role,
  display_order = EXCLUDED.display_order,
  icon = EXCLUDED.icon,
  names = EXCLUDED.names,
  descriptions = EXCLUDED.descriptions;

INSERT INTO public.sub_roles (id, parent_role, display_order, icon, names, descriptions) VALUES
  ('pilot_a350', 'pilot', 2, '🛩️', '{"tr": "A350 Pilot", "en": "A350 Pilot", "de": "A350 Pilot", "fr": "A350 Pilot", "es": "A350 Pilot", "it": "A350 Pilot", "pt": "A350 Pilot", "ru": "A350 Pilot", "ja": "A350 Pilot", "ko": "A350 Pilot", "zh": "A350 Pilot", "ar": "A350 Pilot", "hi": "A350 Pilot", "nl": "A350 Pilot", "pl": "A350 Pilot", "id": "A350 Pilot", "el": "A350 Pilot", "fa": "A350 Pilot", "ms": "A350 Pilot", "th": "A350 Pilot"}'::jsonb, '{"tr": "Airbus A350 — geniş gövde uzun menzil. CCQ farkı + L4 oral.", "en": "Airbus A350 — wide-body long-haul. CCQ delta + L4 oral."}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  parent_role = EXCLUDED.parent_role,
  display_order = EXCLUDED.display_order,
  icon = EXCLUDED.icon,
  names = EXCLUDED.names,
  descriptions = EXCLUDED.descriptions;

INSERT INTO public.sub_roles (id, parent_role, display_order, icon, names, descriptions) VALUES
  ('pilot_b737_800', 'pilot', 3, '🛬', '{"tr": "B737-800 Pilot", "en": "B737-800 Pilot", "de": "B737-800 Pilot", "fr": "B737-800 Pilot", "es": "B737-800 Pilot", "it": "B737-800 Pilot", "pt": "B737-800 Pilot", "ru": "B737-800 Pilot", "ja": "B737-800 Pilot", "ko": "B737-800 Pilot", "zh": "B737-800 Pilot", "ar": "B737-800 Pilot", "hi": "B737-800 Pilot", "nl": "B737-800 Pilot", "pl": "B737-800 Pilot", "id": "B737-800 Pilot", "el": "B737-800 Pilot", "fa": "B737-800 Pilot", "ms": "B737-800 Pilot", "th": "B737-800 Pilot"}'::jsonb, '{"tr": "Boeing 737-800 NG — Türkiye filosunun çekirdek dar gövdesi.", "en": "Boeing 737-800 NG — backbone narrow-body of TR fleet."}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  parent_role = EXCLUDED.parent_role,
  display_order = EXCLUDED.display_order,
  icon = EXCLUDED.icon,
  names = EXCLUDED.names,
  descriptions = EXCLUDED.descriptions;

INSERT INTO public.sub_roles (id, parent_role, display_order, icon, names, descriptions) VALUES
  ('pilot_b737_900', 'pilot', 4, '🛬', '{"tr": "B737-900 Pilot", "en": "B737-900 Pilot", "de": "B737-900 Pilot", "fr": "B737-900 Pilot", "es": "B737-900 Pilot", "it": "B737-900 Pilot", "pt": "B737-900 Pilot", "ru": "B737-900 Pilot", "ja": "B737-900 Pilot", "ko": "B737-900 Pilot", "zh": "B737-900 Pilot", "ar": "B737-900 Pilot", "hi": "B737-900 Pilot", "nl": "B737-900 Pilot", "pl": "B737-900 Pilot", "id": "B737-900 Pilot", "el": "B737-900 Pilot", "fa": "B737-900 Pilot", "ms": "B737-900 Pilot", "th": "B737-900 Pilot"}'::jsonb, '{"tr": "Boeing 737-900 — 737NG uzun versiyonu, aynı Type Rating.", "en": "Boeing 737-900 — extended 737NG, same Type Rating."}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  parent_role = EXCLUDED.parent_role,
  display_order = EXCLUDED.display_order,
  icon = EXCLUDED.icon,
  names = EXCLUDED.names,
  descriptions = EXCLUDED.descriptions;

INSERT INTO public.sub_roles (id, parent_role, display_order, icon, names, descriptions) VALUES
  ('pilot_b737_max', 'pilot', 5, '🛫', '{"tr": "B737 MAX Pilot", "en": "B737 MAX Pilot", "de": "B737 MAX Pilot", "fr": "B737 MAX Pilot", "es": "B737 MAX Pilot", "it": "B737 MAX Pilot", "pt": "B737 MAX Pilot", "ru": "B737 MAX Pilot", "ja": "B737 MAX Pilot", "ko": "B737 MAX Pilot", "zh": "B737 MAX Pilot", "ar": "B737 MAX Pilot", "hi": "B737 MAX Pilot", "nl": "B737 MAX Pilot", "pl": "B737 MAX Pilot", "id": "B737 MAX Pilot", "el": "B737 MAX Pilot", "fa": "B737 MAX Pilot", "ms": "B737 MAX Pilot", "th": "B737 MAX Pilot"}'::jsonb, '{"tr": "Boeing 737 MAX — yeni nesil dar gövde, MCAS eğitimi zorunlu.", "en": "Boeing 737 MAX — next-gen narrow-body, MCAS training required."}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  parent_role = EXCLUDED.parent_role,
  display_order = EXCLUDED.display_order,
  icon = EXCLUDED.icon,
  names = EXCLUDED.names,
  descriptions = EXCLUDED.descriptions;

INSERT INTO public.sub_roles (id, parent_role, display_order, icon, names, descriptions) VALUES
  ('pilot_b777', 'pilot', 6, '✈️', '{"tr": "B777 Pilot", "en": "B777 Pilot", "de": "B777 Pilot", "fr": "B777 Pilot", "es": "B777 Pilot", "it": "B777 Pilot", "pt": "B777 Pilot", "ru": "B777 Pilot", "ja": "B777 Pilot", "ko": "B777 Pilot", "zh": "B777 Pilot", "ar": "B777 Pilot", "hi": "B777 Pilot", "nl": "B777 Pilot", "pl": "B777 Pilot", "id": "B777 Pilot", "el": "B777 Pilot", "fa": "B777 Pilot", "ms": "B777 Pilot", "th": "B777 Pilot"}'::jsonb, '{"tr": "Boeing 777 — uzun menzil geniş gövde. ICAO 4 + uzun yol oral.", "en": "Boeing 777 — long-haul wide-body. ICAO 4 + long-haul oral."}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  parent_role = EXCLUDED.parent_role,
  display_order = EXCLUDED.display_order,
  icon = EXCLUDED.icon,
  names = EXCLUDED.names,
  descriptions = EXCLUDED.descriptions;

INSERT INTO public.sub_roles (id, parent_role, display_order, icon, names, descriptions) VALUES
  ('pilot_b787', 'pilot', 7, '🛩️', '{"tr": "B787 Pilot", "en": "B787 Pilot", "de": "B787 Pilot", "fr": "B787 Pilot", "es": "B787 Pilot", "it": "B787 Pilot", "pt": "B787 Pilot", "ru": "B787 Pilot", "ja": "B787 Pilot", "ko": "B787 Pilot", "zh": "B787 Pilot", "ar": "B787 Pilot", "hi": "B787 Pilot", "nl": "B787 Pilot", "pl": "B787 Pilot", "id": "B787 Pilot", "el": "B787 Pilot", "fa": "B787 Pilot", "ms": "B787 Pilot", "th": "B787 Pilot"}'::jsonb, '{"tr": "Boeing 787 Dreamliner — composite fuselage, ETOPS odaklı.", "en": "Boeing 787 Dreamliner — composite fuselage, ETOPS-focused."}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  parent_role = EXCLUDED.parent_role,
  display_order = EXCLUDED.display_order,
  icon = EXCLUDED.icon,
  names = EXCLUDED.names,
  descriptions = EXCLUDED.descriptions;

INSERT INTO public.sub_roles (id, parent_role, display_order, icon, names, descriptions) VALUES
  ('pilot_cessna', 'pilot', 8, '🛩️', '{"tr": "Cessna Pilotu", "en": "Cessna Pilot", "de": "Cessna Pilot", "fr": "Cessna Pilot", "es": "Cessna Pilot", "it": "Cessna Pilot", "pt": "Cessna Pilot", "ru": "Cessna Pilot", "ja": "Cessna Pilot", "ko": "Cessna Pilot", "zh": "Cessna Pilot", "ar": "Cessna Pilot", "hi": "Cessna Pilot", "nl": "Cessna Pilot", "pl": "Cessna Pilot", "id": "Cessna Pilot", "el": "Cessna Pilot", "fa": "Cessna Pilot", "ms": "Cessna Pilot", "th": "Cessna Pilot"}'::jsonb, '{"tr": "Cessna 152/172/Caravan — PPL/CPL eğitim uçakları.", "en": "Cessna 152/172/Caravan — PPL/CPL training aircraft."}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  parent_role = EXCLUDED.parent_role,
  display_order = EXCLUDED.display_order,
  icon = EXCLUDED.icon,
  names = EXCLUDED.names,
  descriptions = EXCLUDED.descriptions;

INSERT INTO public.sub_roles (id, parent_role, display_order, icon, names, descriptions) VALUES
  ('pilot_helicopter', 'pilot', 9, '🚁', '{"tr": "Helikopter Pilotu", "en": "Helicopter Pilot", "de": "Helicopter Pilot", "fr": "Helicopter Pilot", "es": "Helicopter Pilot", "it": "Helicopter Pilot", "pt": "Helicopter Pilot", "ru": "Helicopter Pilot", "ja": "Helicopter Pilot", "ko": "Helicopter Pilot", "zh": "Helicopter Pilot", "ar": "Helicopter Pilot", "hi": "Helicopter Pilot", "nl": "Helicopter Pilot", "pl": "Helicopter Pilot", "id": "Helicopter Pilot", "el": "Helicopter Pilot", "fa": "Helicopter Pilot", "ms": "Helicopter Pilot", "th": "Helicopter Pilot"}'::jsonb, '{"tr": "Helikopter rating — VFR/IFR, hover ve troop drop terimleri.", "en": "Helicopter rating — VFR/IFR, hover and troop drop vocab."}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  parent_role = EXCLUDED.parent_role,
  display_order = EXCLUDED.display_order,
  icon = EXCLUDED.icon,
  names = EXCLUDED.names,
  descriptions = EXCLUDED.descriptions;

INSERT INTO public.sub_roles (id, parent_role, display_order, icon, names, descriptions) VALUES
  ('pilot_atr', 'pilot', 10, '🛩️', '{"tr": "ATR Pilot", "en": "ATR Pilot", "de": "ATR Pilot", "fr": "ATR Pilot", "es": "ATR Pilot", "it": "ATR Pilot", "pt": "ATR Pilot", "ru": "ATR Pilot", "ja": "ATR Pilot", "ko": "ATR Pilot", "zh": "ATR Pilot", "ar": "ATR Pilot", "hi": "ATR Pilot", "nl": "ATR Pilot", "pl": "ATR Pilot", "id": "ATR Pilot", "el": "ATR Pilot", "fa": "ATR Pilot", "ms": "ATR Pilot", "th": "ATR Pilot"}'::jsonb, '{"tr": "ATR 42/72 — turboprop regional. Kısa pist ve yan rüzgar.", "en": "ATR 42/72 — regional turboprop. Short field + crosswind."}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  parent_role = EXCLUDED.parent_role,
  display_order = EXCLUDED.display_order,
  icon = EXCLUDED.icon,
  names = EXCLUDED.names,
  descriptions = EXCLUDED.descriptions;

INSERT INTO public.sub_roles (id, parent_role, display_order, icon, names, descriptions) VALUES
  ('tech_line', 'technician', 0, '🔧', '{"tr": "Hat Bakım", "en": "Line Maintenance", "de": "Line Maintenance", "fr": "Line Maintenance", "es": "Line Maintenance", "it": "Line Maintenance", "pt": "Line Maintenance", "ru": "Line Maintenance", "ja": "Line Maintenance", "ko": "Line Maintenance", "zh": "Line Maintenance", "ar": "Line Maintenance", "hi": "Line Maintenance", "nl": "Line Maintenance", "pl": "Line Maintenance", "id": "Line Maintenance", "el": "Line Maintenance", "fa": "Line Maintenance", "ms": "Line Maintenance", "th": "Line Maintenance"}'::jsonb, '{"tr": "Apron + transit kontroller, MEL release, gemiyi uçuşa hazırlama.", "en": "Apron + transit checks, MEL release, dispatch certification."}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  parent_role = EXCLUDED.parent_role,
  display_order = EXCLUDED.display_order,
  icon = EXCLUDED.icon,
  names = EXCLUDED.names,
  descriptions = EXCLUDED.descriptions;

INSERT INTO public.sub_roles (id, parent_role, display_order, icon, names, descriptions) VALUES
  ('tech_a_check', 'technician', 1, '🛠️', '{"tr": "A-Check Teknisyeni", "en": "A-Check Technician", "de": "A-Check Technician", "fr": "A-Check Technician", "es": "A-Check Technician", "it": "A-Check Technician", "pt": "A-Check Technician", "ru": "A-Check Technician", "ja": "A-Check Technician", "ko": "A-Check Technician", "zh": "A-Check Technician", "ar": "A-Check Technician", "hi": "A-Check Technician", "nl": "A-Check Technician", "pl": "A-Check Technician", "id": "A-Check Technician", "el": "A-Check Technician", "fa": "A-Check Technician", "ms": "A-Check Technician", "th": "A-Check Technician"}'::jsonb, '{"tr": "A-Check — 400-600 saat aralık. Hangar bakım, görsel + fonksiyonel kontrol.", "en": "A-Check — 400-600 hr interval. Hangar visit, visual + functional."}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  parent_role = EXCLUDED.parent_role,
  display_order = EXCLUDED.display_order,
  icon = EXCLUDED.icon,
  names = EXCLUDED.names,
  descriptions = EXCLUDED.descriptions;

INSERT INTO public.sub_roles (id, parent_role, display_order, icon, names, descriptions) VALUES
  ('tech_c_check', 'technician', 2, '⚙️', '{"tr": "C-Check Teknisyeni", "en": "C-Check Technician", "de": "C-Check Technician", "fr": "C-Check Technician", "es": "C-Check Technician", "it": "C-Check Technician", "pt": "C-Check Technician", "ru": "C-Check Technician", "ja": "C-Check Technician", "ko": "C-Check Technician", "zh": "C-Check Technician", "ar": "C-Check Technician", "hi": "C-Check Technician", "nl": "C-Check Technician", "pl": "C-Check Technician", "id": "C-Check Technician", "el": "C-Check Technician", "fa": "C-Check Technician", "ms": "C-Check Technician", "th": "C-Check Technician"}'::jsonb, '{"tr": "C-Check — 20-24 ay. Kapsamlı strüktürel + komponent revizyonu.", "en": "C-Check — 20-24 months. Deep structural + component overhaul."}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  parent_role = EXCLUDED.parent_role,
  display_order = EXCLUDED.display_order,
  icon = EXCLUDED.icon,
  names = EXCLUDED.names,
  descriptions = EXCLUDED.descriptions;

INSERT INTO public.sub_roles (id, parent_role, display_order, icon, names, descriptions) VALUES
  ('tech_landing_gear', 'technician', 3, '🛞', '{"tr": "İniş Takımı Teknisyeni", "en": "Landing Gear Technician", "de": "Landing Gear Technician", "fr": "Landing Gear Technician", "es": "Landing Gear Technician", "it": "Landing Gear Technician", "pt": "Landing Gear Technician", "ru": "Landing Gear Technician", "ja": "Landing Gear Technician", "ko": "Landing Gear Technician", "zh": "Landing Gear Technician", "ar": "Landing Gear Technician", "hi": "Landing Gear Technician", "nl": "Landing Gear Technician", "pl": "Landing Gear Technician", "id": "Landing Gear Technician", "el": "Landing Gear Technician", "fa": "Landing Gear Technician", "ms": "Landing Gear Technician", "th": "Landing Gear Technician"}'::jsonb, '{"tr": "Landing gear strut, brake assembly, retraction system uzmanlığı.", "en": "Landing gear strut, brake assembly, retraction systems specialist."}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  parent_role = EXCLUDED.parent_role,
  display_order = EXCLUDED.display_order,
  icon = EXCLUDED.icon,
  names = EXCLUDED.names,
  descriptions = EXCLUDED.descriptions;

INSERT INTO public.sub_roles (id, parent_role, display_order, icon, names, descriptions) VALUES
  ('tech_engine', 'technician', 4, '🔥', '{"tr": "Motor Teknisyeni", "en": "Engine Technician", "de": "Engine Technician", "fr": "Engine Technician", "es": "Engine Technician", "it": "Engine Technician", "pt": "Engine Technician", "ru": "Engine Technician", "ja": "Engine Technician", "ko": "Engine Technician", "zh": "Engine Technician", "ar": "Engine Technician", "hi": "Engine Technician", "nl": "Engine Technician", "pl": "Engine Technician", "id": "Engine Technician", "el": "Engine Technician", "fa": "Engine Technician", "ms": "Engine Technician", "th": "Engine Technician"}'::jsonb, '{"tr": "CFM56/LEAP/Trent/GE90 — borescope, boroscope, FOD inspection.", "en": "CFM56/LEAP/Trent/GE90 — borescope inspections, FOD checks."}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  parent_role = EXCLUDED.parent_role,
  display_order = EXCLUDED.display_order,
  icon = EXCLUDED.icon,
  names = EXCLUDED.names,
  descriptions = EXCLUDED.descriptions;

INSERT INTO public.sub_roles (id, parent_role, display_order, icon, names, descriptions) VALUES
  ('tech_wheels', 'technician', 5, '🛞', '{"tr": "Lastik/Fren Teknisyeni", "en": "Wheels & Brakes Technician", "de": "Wheels & Brakes Technician", "fr": "Wheels & Brakes Technician", "es": "Wheels & Brakes Technician", "it": "Wheels & Brakes Technician", "pt": "Wheels & Brakes Technician", "ru": "Wheels & Brakes Technician", "ja": "Wheels & Brakes Technician", "ko": "Wheels & Brakes Technician", "zh": "Wheels & Brakes Technician", "ar": "Wheels & Brakes Technician", "hi": "Wheels & Brakes Technician", "nl": "Wheels & Brakes Technician", "pl": "Wheels & Brakes Technician", "id": "Wheels & Brakes Technician", "el": "Wheels & Brakes Technician", "fa": "Wheels & Brakes Technician", "ms": "Wheels & Brakes Technician", "th": "Wheels & Brakes Technician"}'::jsonb, '{"tr": "Tire pressure, brake wear, anti-skid sistem kontrolü.", "en": "Tire pressure, brake wear, anti-skid system checks."}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  parent_role = EXCLUDED.parent_role,
  display_order = EXCLUDED.display_order,
  icon = EXCLUDED.icon,
  names = EXCLUDED.names,
  descriptions = EXCLUDED.descriptions;

INSERT INTO public.sub_roles (id, parent_role, display_order, icon, names, descriptions) VALUES
  ('tech_avionics', 'technician', 6, '📡', '{"tr": "Aviyonik Teknisyen", "en": "Avionics Technician", "de": "Avionics Technician", "fr": "Avionics Technician", "es": "Avionics Technician", "it": "Avionics Technician", "pt": "Avionics Technician", "ru": "Avionics Technician", "ja": "Avionics Technician", "ko": "Avionics Technician", "zh": "Avionics Technician", "ar": "Avionics Technician", "hi": "Avionics Technician", "nl": "Avionics Technician", "pl": "Avionics Technician", "id": "Avionics Technician", "el": "Avionics Technician", "fa": "Avionics Technician", "ms": "Avionics Technician", "th": "Avionics Technician"}'::jsonb, '{"tr": "EFIS, FMS, navigation radios, transponder troubleshooting.", "en": "EFIS, FMS, navigation radios, transponder troubleshooting."}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  parent_role = EXCLUDED.parent_role,
  display_order = EXCLUDED.display_order,
  icon = EXCLUDED.icon,
  names = EXCLUDED.names,
  descriptions = EXCLUDED.descriptions;

INSERT INTO public.sub_roles (id, parent_role, display_order, icon, names, descriptions) VALUES
  ('cabin_business', 'cabin', 0, '🥂', '{"tr": "Business Class Kabin", "en": "Business Class Crew", "de": "Business Class Crew", "fr": "Business Class Crew", "es": "Business Class Crew", "it": "Business Class Crew", "pt": "Business Class Crew", "ru": "Business Class Crew", "ja": "Business Class Crew", "ko": "Business Class Crew", "zh": "Business Class Crew", "ar": "Business Class Crew", "hi": "Business Class Crew", "nl": "Business Class Crew", "pl": "Business Class Crew", "id": "Business Class Crew", "el": "Business Class Crew", "fa": "Business Class Crew", "ms": "Business Class Crew", "th": "Business Class Crew"}'::jsonb, '{"tr": "Business sınıf yolcu hizmeti — premium service standartları.", "en": "Business class passenger service — premium service standards."}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  parent_role = EXCLUDED.parent_role,
  display_order = EXCLUDED.display_order,
  icon = EXCLUDED.icon,
  names = EXCLUDED.names,
  descriptions = EXCLUDED.descriptions;

INSERT INTO public.sub_roles (id, parent_role, display_order, icon, names, descriptions) VALUES
  ('cabin_economy', 'cabin', 1, '🎧', '{"tr": "Economy Class Kabin", "en": "Economy Class Crew", "de": "Economy Class Crew", "fr": "Economy Class Crew", "es": "Economy Class Crew", "it": "Economy Class Crew", "pt": "Economy Class Crew", "ru": "Economy Class Crew", "ja": "Economy Class Crew", "ko": "Economy Class Crew", "zh": "Economy Class Crew", "ar": "Economy Class Crew", "hi": "Economy Class Crew", "nl": "Economy Class Crew", "pl": "Economy Class Crew", "id": "Economy Class Crew", "el": "Economy Class Crew", "fa": "Economy Class Crew", "ms": "Economy Class Crew", "th": "Economy Class Crew"}'::jsonb, '{"tr": "Economy sınıf yolcu hizmeti — boarding, ikram, güvenlik anonsları.", "en": "Economy class passenger service — boarding, catering, safety PA."}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  parent_role = EXCLUDED.parent_role,
  display_order = EXCLUDED.display_order,
  icon = EXCLUDED.icon,
  names = EXCLUDED.names,
  descriptions = EXCLUDED.descriptions;

INSERT INTO public.sub_roles (id, parent_role, display_order, icon, names, descriptions) VALUES
  ('cabin_purser', 'cabin', 2, '👔', '{"tr": "Kabin Amiri (Purser)", "en": "Purser", "de": "Purser", "fr": "Purser", "es": "Purser", "it": "Purser", "pt": "Purser", "ru": "Purser", "ja": "Purser", "ko": "Purser", "zh": "Purser", "ar": "Purser", "hi": "Purser", "nl": "Purser", "pl": "Purser", "id": "Purser", "el": "Purser", "fa": "Purser", "ms": "Purser", "th": "Purser"}'::jsonb, '{"tr": "Kabin amiri — ekip yönetimi, kaptan iletişimi, acil durum lideri.", "en": "Cabin chief — crew management, captain comms, emergency lead."}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  parent_role = EXCLUDED.parent_role,
  display_order = EXCLUDED.display_order,
  icon = EXCLUDED.icon,
  names = EXCLUDED.names,
  descriptions = EXCLUDED.descriptions;

INSERT INTO public.sub_roles (id, parent_role, display_order, icon, names, descriptions) VALUES
  ('cabin_trainer', 'cabin', 3, '🎓', '{"tr": "Kabin Eğitmen", "en": "Cabin Trainer", "de": "Cabin Trainer", "fr": "Cabin Trainer", "es": "Cabin Trainer", "it": "Cabin Trainer", "pt": "Cabin Trainer", "ru": "Cabin Trainer", "ja": "Cabin Trainer", "ko": "Cabin Trainer", "zh": "Cabin Trainer", "ar": "Cabin Trainer", "hi": "Cabin Trainer", "nl": "Cabin Trainer", "pl": "Cabin Trainer", "id": "Cabin Trainer", "el": "Cabin Trainer", "fa": "Cabin Trainer", "ms": "Cabin Trainer", "th": "Cabin Trainer"}'::jsonb, '{"tr": "Kabin eğitmeni — yeni ekibe IATA + şirket prosedürleri öğretir.", "en": "Cabin trainer — teaches new crew IATA + company procedures."}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  parent_role = EXCLUDED.parent_role,
  display_order = EXCLUDED.display_order,
  icon = EXCLUDED.icon,
  names = EXCLUDED.names,
  descriptions = EXCLUDED.descriptions;

INSERT INTO public.sub_roles (id, parent_role, display_order, icon, names, descriptions) VALUES
  ('cabin_first', 'cabin', 4, '🍾', '{"tr": "First Class Kabin", "en": "First Class Crew", "de": "First Class Crew", "fr": "First Class Crew", "es": "First Class Crew", "it": "First Class Crew", "pt": "First Class Crew", "ru": "First Class Crew", "ja": "First Class Crew", "ko": "First Class Crew", "zh": "First Class Crew", "ar": "First Class Crew", "hi": "First Class Crew", "nl": "First Class Crew", "pl": "First Class Crew", "id": "First Class Crew", "el": "First Class Crew", "fa": "First Class Crew", "ms": "First Class Crew", "th": "First Class Crew"}'::jsonb, '{"tr": "First class kabin — bireysel hizmet, üstün ürün bilgisi.", "en": "First class crew — personalized service, deep product knowledge."}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  parent_role = EXCLUDED.parent_role,
  display_order = EXCLUDED.display_order,
  icon = EXCLUDED.icon,
  names = EXCLUDED.names,
  descriptions = EXCLUDED.descriptions;

INSERT INTO public.sub_roles (id, parent_role, display_order, icon, names, descriptions) VALUES
  ('atc_tower', 'atc', 0, '🗼', '{"tr": "Kule Kontrolör", "en": "Tower Controller", "de": "Tower Controller", "fr": "Tower Controller", "es": "Tower Controller", "it": "Tower Controller", "pt": "Tower Controller", "ru": "Tower Controller", "ja": "Tower Controller", "ko": "Tower Controller", "zh": "Tower Controller", "ar": "Tower Controller", "hi": "Tower Controller", "nl": "Tower Controller", "pl": "Tower Controller", "id": "Tower Controller", "el": "Tower Controller", "fa": "Tower Controller", "ms": "Tower Controller", "th": "Tower Controller"}'::jsonb, '{"tr": "Kule (TWR) — runway operations, takeoff/landing clearance.", "en": "Tower (TWR) — runway operations, takeoff/landing clearance."}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  parent_role = EXCLUDED.parent_role,
  display_order = EXCLUDED.display_order,
  icon = EXCLUDED.icon,
  names = EXCLUDED.names,
  descriptions = EXCLUDED.descriptions;

INSERT INTO public.sub_roles (id, parent_role, display_order, icon, names, descriptions) VALUES
  ('atc_approach', 'atc', 1, '🛬', '{"tr": "Yaklaşma Kontrolör", "en": "Approach Controller", "de": "Approach Controller", "fr": "Approach Controller", "es": "Approach Controller", "it": "Approach Controller", "pt": "Approach Controller", "ru": "Approach Controller", "ja": "Approach Controller", "ko": "Approach Controller", "zh": "Approach Controller", "ar": "Approach Controller", "hi": "Approach Controller", "nl": "Approach Controller", "pl": "Approach Controller", "id": "Approach Controller", "el": "Approach Controller", "fa": "Approach Controller", "ms": "Approach Controller", "th": "Approach Controller"}'::jsonb, '{"tr": "Yaklaşma (APP) — vector + sequencing, ILS intercept.", "en": "Approach (APP) — vector + sequencing, ILS intercept."}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  parent_role = EXCLUDED.parent_role,
  display_order = EXCLUDED.display_order,
  icon = EXCLUDED.icon,
  names = EXCLUDED.names,
  descriptions = EXCLUDED.descriptions;

INSERT INTO public.sub_roles (id, parent_role, display_order, icon, names, descriptions) VALUES
  ('atc_ground', 'atc', 2, '🚦', '{"tr": "Yer Kontrolör", "en": "Ground Controller", "de": "Ground Controller", "fr": "Ground Controller", "es": "Ground Controller", "it": "Ground Controller", "pt": "Ground Controller", "ru": "Ground Controller", "ja": "Ground Controller", "ko": "Ground Controller", "zh": "Ground Controller", "ar": "Ground Controller", "hi": "Ground Controller", "nl": "Ground Controller", "pl": "Ground Controller", "id": "Ground Controller", "el": "Ground Controller", "fa": "Ground Controller", "ms": "Ground Controller", "th": "Ground Controller"}'::jsonb, '{"tr": "Yer (GND) — taxi clearance, runway crossing, pushback.", "en": "Ground (GND) — taxi clearance, runway crossing, pushback."}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  parent_role = EXCLUDED.parent_role,
  display_order = EXCLUDED.display_order,
  icon = EXCLUDED.icon,
  names = EXCLUDED.names,
  descriptions = EXCLUDED.descriptions;

INSERT INTO public.sub_roles (id, parent_role, display_order, icon, names, descriptions) VALUES
  ('atc_enroute', 'atc', 3, '🌐', '{"tr": "Saha Kontrolör (En-route)", "en": "En-route Controller", "de": "En-route Controller", "fr": "En-route Controller", "es": "En-route Controller", "it": "En-route Controller", "pt": "En-route Controller", "ru": "En-route Controller", "ja": "En-route Controller", "ko": "En-route Controller", "zh": "En-route Controller", "ar": "En-route Controller", "hi": "En-route Controller", "nl": "En-route Controller", "pl": "En-route Controller", "id": "En-route Controller", "el": "En-route Controller", "fa": "En-route Controller", "ms": "En-route Controller", "th": "En-route Controller"}'::jsonb, '{"tr": "Saha (ACC/CTR) — cruise level changes, deviation, handover.", "en": "Center (ACC/CTR) — cruise level changes, deviation, handover."}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  parent_role = EXCLUDED.parent_role,
  display_order = EXCLUDED.display_order,
  icon = EXCLUDED.icon,
  names = EXCLUDED.names,
  descriptions = EXCLUDED.descriptions;

INSERT INTO public.sub_roles (id, parent_role, display_order, icon, names, descriptions) VALUES
  ('ground_pushback', 'ground', 0, '🚜', '{"tr": "Pushback Personeli", "en": "Pushback Crew", "de": "Pushback Crew", "fr": "Pushback Crew", "es": "Pushback Crew", "it": "Pushback Crew", "pt": "Pushback Crew", "ru": "Pushback Crew", "ja": "Pushback Crew", "ko": "Pushback Crew", "zh": "Pushback Crew", "ar": "Pushback Crew", "hi": "Pushback Crew", "nl": "Pushback Crew", "pl": "Pushback Crew", "id": "Pushback Crew", "el": "Pushback Crew", "fa": "Pushback Crew", "ms": "Pushback Crew", "th": "Pushback Crew"}'::jsonb, '{"tr": "Pushback tow + marshaller koordinasyonu, brake release prosedürü.", "en": "Pushback tow + marshaller coordination, brake release procedure."}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  parent_role = EXCLUDED.parent_role,
  display_order = EXCLUDED.display_order,
  icon = EXCLUDED.icon,
  names = EXCLUDED.names,
  descriptions = EXCLUDED.descriptions;

INSERT INTO public.sub_roles (id, parent_role, display_order, icon, names, descriptions) VALUES
  ('ground_baggage', 'ground', 1, '🧳', '{"tr": "Bagaj Personeli", "en": "Baggage Handler", "de": "Baggage Handler", "fr": "Baggage Handler", "es": "Baggage Handler", "it": "Baggage Handler", "pt": "Baggage Handler", "ru": "Baggage Handler", "ja": "Baggage Handler", "ko": "Baggage Handler", "zh": "Baggage Handler", "ar": "Baggage Handler", "hi": "Baggage Handler", "nl": "Baggage Handler", "pl": "Baggage Handler", "id": "Baggage Handler", "el": "Baggage Handler", "fa": "Baggage Handler", "ms": "Baggage Handler", "th": "Baggage Handler"}'::jsonb, '{"tr": "Belly loading + ULD/AKE container, weight distribution.", "en": "Belly loading + ULD/AKE containers, weight distribution."}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  parent_role = EXCLUDED.parent_role,
  display_order = EXCLUDED.display_order,
  icon = EXCLUDED.icon,
  names = EXCLUDED.names,
  descriptions = EXCLUDED.descriptions;

INSERT INTO public.sub_roles (id, parent_role, display_order, icon, names, descriptions) VALUES
  ('ground_catering', 'ground', 2, '🍱', '{"tr": "İkram Personeli", "en": "Catering Crew", "de": "Catering Crew", "fr": "Catering Crew", "es": "Catering Crew", "it": "Catering Crew", "pt": "Catering Crew", "ru": "Catering Crew", "ja": "Catering Crew", "ko": "Catering Crew", "zh": "Catering Crew", "ar": "Catering Crew", "hi": "Catering Crew", "nl": "Catering Crew", "pl": "Catering Crew", "id": "Catering Crew", "el": "Catering Crew", "fa": "Catering Crew", "ms": "Catering Crew", "th": "Catering Crew"}'::jsonb, '{"tr": "Galley loading, hi-loader operasyonu, hygiene compliance.", "en": "Galley loading, hi-loader operation, hygiene compliance."}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  parent_role = EXCLUDED.parent_role,
  display_order = EXCLUDED.display_order,
  icon = EXCLUDED.icon,
  names = EXCLUDED.names,
  descriptions = EXCLUDED.descriptions;

INSERT INTO public.sub_roles (id, parent_role, display_order, icon, names, descriptions) VALUES
  ('ground_refueling', 'ground', 3, '⛽', '{"tr": "Yakıt İkmal", "en": "Refueling Crew", "de": "Refueling Crew", "fr": "Refueling Crew", "es": "Refueling Crew", "it": "Refueling Crew", "pt": "Refueling Crew", "ru": "Refueling Crew", "ja": "Refueling Crew", "ko": "Refueling Crew", "zh": "Refueling Crew", "ar": "Refueling Crew", "hi": "Refueling Crew", "nl": "Refueling Crew", "pl": "Refueling Crew", "id": "Refueling Crew", "el": "Refueling Crew", "fa": "Refueling Crew", "ms": "Refueling Crew", "th": "Refueling Crew"}'::jsonb, '{"tr": "Jet A-1 fuel uplift, bonding wire, fuel quantity verification.", "en": "Jet A-1 fuel uplift, bonding wire, fuel quantity verification."}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  parent_role = EXCLUDED.parent_role,
  display_order = EXCLUDED.display_order,
  icon = EXCLUDED.icon,
  names = EXCLUDED.names,
  descriptions = EXCLUDED.descriptions;

INSERT INTO public.sub_roles (id, parent_role, display_order, icon, names, descriptions) VALUES
  ('ground_deicing', 'ground', 4, '❄️', '{"tr": "Buz Çözücü", "en": "De-icing Crew", "de": "De-icing Crew", "fr": "De-icing Crew", "es": "De-icing Crew", "it": "De-icing Crew", "pt": "De-icing Crew", "ru": "De-icing Crew", "ja": "De-icing Crew", "ko": "De-icing Crew", "zh": "De-icing Crew", "ar": "De-icing Crew", "hi": "De-icing Crew", "nl": "De-icing Crew", "pl": "De-icing Crew", "id": "De-icing Crew", "el": "De-icing Crew", "fa": "De-icing Crew", "ms": "De-icing Crew", "th": "De-icing Crew"}'::jsonb, '{"tr": "Type I/II/IV fluid, HOT time, anti-icing prosedürleri.", "en": "Type I/II/IV fluid, HOT time, anti-icing procedures."}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  parent_role = EXCLUDED.parent_role,
  display_order = EXCLUDED.display_order,
  icon = EXCLUDED.icon,
  names = EXCLUDED.names,
  descriptions = EXCLUDED.descriptions;

INSERT INTO public.sub_roles (id, parent_role, display_order, icon, names, descriptions) VALUES
  ('student_icao4', 'student', 0, '🎓', '{"tr": "ICAO 4 Hazırlık", "en": "ICAO 4 Prep", "de": "ICAO 4 Prep", "fr": "ICAO 4 Prep", "es": "ICAO 4 Prep", "it": "ICAO 4 Prep", "pt": "ICAO 4 Prep", "ru": "ICAO 4 Prep", "ja": "ICAO 4 Prep", "ko": "ICAO 4 Prep", "zh": "ICAO 4 Prep", "ar": "ICAO 4 Prep", "hi": "ICAO 4 Prep", "nl": "ICAO 4 Prep", "pl": "ICAO 4 Prep", "id": "ICAO 4 Prep", "el": "ICAO 4 Prep", "fa": "ICAO 4 Prep", "ms": "ICAO 4 Prep", "th": "ICAO 4 Prep"}'::jsonb, '{"tr": "ICAO Annex 1 Level 4 yazılı + sözlü sınav hazırlığı.", "en": "ICAO Annex 1 Level 4 written + oral exam preparation."}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  parent_role = EXCLUDED.parent_role,
  display_order = EXCLUDED.display_order,
  icon = EXCLUDED.icon,
  names = EXCLUDED.names,
  descriptions = EXCLUDED.descriptions;

INSERT INTO public.sub_roles (id, parent_role, display_order, icon, names, descriptions) VALUES
  ('student_pilot_interview', 'student', 1, '✈️', '{"tr": "Pilot Mülakat Hazırlık", "en": "Pilot Interview Prep", "de": "Pilot Interview Prep", "fr": "Pilot Interview Prep", "es": "Pilot Interview Prep", "it": "Pilot Interview Prep", "pt": "Pilot Interview Prep", "ru": "Pilot Interview Prep", "ja": "Pilot Interview Prep", "ko": "Pilot Interview Prep", "zh": "Pilot Interview Prep", "ar": "Pilot Interview Prep", "hi": "Pilot Interview Prep", "nl": "Pilot Interview Prep", "pl": "Pilot Interview Prep", "id": "Pilot Interview Prep", "el": "Pilot Interview Prep", "fa": "Pilot Interview Prep", "ms": "Pilot Interview Prep", "th": "Pilot Interview Prep"}'::jsonb, '{"tr": "THY, Pegasus, AnadoluJet vb. pilot mülakat sorularına hazırlık.", "en": "THY, Pegasus, AnadoluJet etc. pilot interview prep."}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  parent_role = EXCLUDED.parent_role,
  display_order = EXCLUDED.display_order,
  icon = EXCLUDED.icon,
  names = EXCLUDED.names,
  descriptions = EXCLUDED.descriptions;

INSERT INTO public.sub_roles (id, parent_role, display_order, icon, names, descriptions) VALUES
  ('student_cabin_interview', 'student', 2, '🎧', '{"tr": "Kabin Mülakat Hazırlık", "en": "Cabin Interview Prep", "de": "Cabin Interview Prep", "fr": "Cabin Interview Prep", "es": "Cabin Interview Prep", "it": "Cabin Interview Prep", "pt": "Cabin Interview Prep", "ru": "Cabin Interview Prep", "ja": "Cabin Interview Prep", "ko": "Cabin Interview Prep", "zh": "Cabin Interview Prep", "ar": "Cabin Interview Prep", "hi": "Cabin Interview Prep", "nl": "Cabin Interview Prep", "pl": "Cabin Interview Prep", "id": "Cabin Interview Prep", "el": "Cabin Interview Prep", "fa": "Cabin Interview Prep", "ms": "Cabin Interview Prep", "th": "Cabin Interview Prep"}'::jsonb, '{"tr": "Kabin memuru mülakatı — İngilizce konuşma + senaryo cevapları.", "en": "Cabin crew interview — English speaking + scenario answers."}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  parent_role = EXCLUDED.parent_role,
  display_order = EXCLUDED.display_order,
  icon = EXCLUDED.icon,
  names = EXCLUDED.names,
  descriptions = EXCLUDED.descriptions;

INSERT INTO public.sub_roles (id, parent_role, display_order, icon, names, descriptions) VALUES
  ('student_atc_interview', 'student', 3, '🗼', '{"tr": "ATC Mülakat Hazırlık", "en": "ATC Interview Prep", "de": "ATC Interview Prep", "fr": "ATC Interview Prep", "es": "ATC Interview Prep", "it": "ATC Interview Prep", "pt": "ATC Interview Prep", "ru": "ATC Interview Prep", "ja": "ATC Interview Prep", "ko": "ATC Interview Prep", "zh": "ATC Interview Prep", "ar": "ATC Interview Prep", "hi": "ATC Interview Prep", "nl": "ATC Interview Prep", "pl": "ATC Interview Prep", "id": "ATC Interview Prep", "el": "ATC Interview Prep", "fa": "ATC Interview Prep", "ms": "ATC Interview Prep", "th": "ATC Interview Prep"}'::jsonb, '{"tr": "DHMI/SHGM ATC aday süreci — teknik + lisan değerlendirme.", "en": "DHMI/SHGM ATC candidate process — technical + language assessment."}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  parent_role = EXCLUDED.parent_role,
  display_order = EXCLUDED.display_order,
  icon = EXCLUDED.icon,
  names = EXCLUDED.names,
  descriptions = EXCLUDED.descriptions;

INSERT INTO public.sub_roles (id, parent_role, display_order, icon, names, descriptions) VALUES
  ('dispatcher_major', 'dispatcher', 0, '📊', '{"tr": "Major Hava Yolu Dispatcher", "en": "Major Airline Dispatcher", "de": "Major Airline Dispatcher", "fr": "Major Airline Dispatcher", "es": "Major Airline Dispatcher", "it": "Major Airline Dispatcher", "pt": "Major Airline Dispatcher", "ru": "Major Airline Dispatcher", "ja": "Major Airline Dispatcher", "ko": "Major Airline Dispatcher", "zh": "Major Airline Dispatcher", "ar": "Major Airline Dispatcher", "hi": "Major Airline Dispatcher", "nl": "Major Airline Dispatcher", "pl": "Major Airline Dispatcher", "id": "Major Airline Dispatcher", "el": "Major Airline Dispatcher", "fa": "Major Airline Dispatcher", "ms": "Major Airline Dispatcher", "th": "Major Airline Dispatcher"}'::jsonb, '{"tr": "Major airline OCC — flight plan, weight & balance, ETOPS planning.", "en": "Major airline OCC — flight plan, W&B, ETOPS planning."}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  parent_role = EXCLUDED.parent_role,
  display_order = EXCLUDED.display_order,
  icon = EXCLUDED.icon,
  names = EXCLUDED.names,
  descriptions = EXCLUDED.descriptions;

INSERT INTO public.sub_roles (id, parent_role, display_order, icon, names, descriptions) VALUES
  ('dispatcher_charter', 'dispatcher', 1, '🛫', '{"tr": "Charter Dispatcher", "en": "Charter Dispatcher", "de": "Charter Dispatcher", "fr": "Charter Dispatcher", "es": "Charter Dispatcher", "it": "Charter Dispatcher", "pt": "Charter Dispatcher", "ru": "Charter Dispatcher", "ja": "Charter Dispatcher", "ko": "Charter Dispatcher", "zh": "Charter Dispatcher", "ar": "Charter Dispatcher", "hi": "Charter Dispatcher", "nl": "Charter Dispatcher", "pl": "Charter Dispatcher", "id": "Charter Dispatcher", "el": "Charter Dispatcher", "fa": "Charter Dispatcher", "ms": "Charter Dispatcher", "th": "Charter Dispatcher"}'::jsonb, '{"tr": "Charter ops — adhoc routing, slot negotiation, VIP handling.", "en": "Charter ops — adhoc routing, slot negotiation, VIP handling."}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  parent_role = EXCLUDED.parent_role,
  display_order = EXCLUDED.display_order,
  icon = EXCLUDED.icon,
  names = EXCLUDED.names,
  descriptions = EXCLUDED.descriptions;

INSERT INTO public.sub_roles (id, parent_role, display_order, icon, names, descriptions) VALUES
  ('dispatcher_vip', 'dispatcher', 2, '💼', '{"tr": "VIP Dispatcher", "en": "VIP Dispatcher", "de": "VIP Dispatcher", "fr": "VIP Dispatcher", "es": "VIP Dispatcher", "it": "VIP Dispatcher", "pt": "VIP Dispatcher", "ru": "VIP Dispatcher", "ja": "VIP Dispatcher", "ko": "VIP Dispatcher", "zh": "VIP Dispatcher", "ar": "VIP Dispatcher", "hi": "VIP Dispatcher", "nl": "VIP Dispatcher", "pl": "VIP Dispatcher", "id": "VIP Dispatcher", "el": "VIP Dispatcher", "fa": "VIP Dispatcher", "ms": "VIP Dispatcher", "th": "VIP Dispatcher"}'::jsonb, '{"tr": "VIP/Bizjet — protocol, customs, FBO coordination.", "en": "VIP/Bizjet — protocol, customs, FBO coordination."}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  parent_role = EXCLUDED.parent_role,
  display_order = EXCLUDED.display_order,
  icon = EXCLUDED.icon,
  names = EXCLUDED.names,
  descriptions = EXCLUDED.descriptions;

INSERT INTO public.sub_roles (id, parent_role, display_order, icon, names, descriptions) VALUES
  ('dispatcher_cargo', 'dispatcher', 3, '📦', '{"tr": "Kargo Dispatcher", "en": "Cargo Dispatcher", "de": "Cargo Dispatcher", "fr": "Cargo Dispatcher", "es": "Cargo Dispatcher", "it": "Cargo Dispatcher", "pt": "Cargo Dispatcher", "ru": "Cargo Dispatcher", "ja": "Cargo Dispatcher", "ko": "Cargo Dispatcher", "zh": "Cargo Dispatcher", "ar": "Cargo Dispatcher", "hi": "Cargo Dispatcher", "nl": "Cargo Dispatcher", "pl": "Cargo Dispatcher", "id": "Cargo Dispatcher", "el": "Cargo Dispatcher", "fa": "Cargo Dispatcher", "ms": "Cargo Dispatcher", "th": "Cargo Dispatcher"}'::jsonb, '{"tr": "Cargo ops — DG handling, load distribution, B777F/B747F planning.", "en": "Cargo ops — DG handling, load distribution, B777F/B747F planning."}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  parent_role = EXCLUDED.parent_role,
  display_order = EXCLUDED.display_order,
  icon = EXCLUDED.icon,
  names = EXCLUDED.names,
  descriptions = EXCLUDED.descriptions;


-- Seed tamamlandı: 40 sub_role