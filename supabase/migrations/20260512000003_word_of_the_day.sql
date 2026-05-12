-- AirSpeak — word_of_the_day tablosu + role-based RPC + seed
-- Sprint 14.D — Home screen "Günün Kelimesi" rol bazlı içerik

-- ─── 1) Tablo ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.word_of_the_day (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- İçerik tipi
  content_type text NOT NULL CHECK (content_type IN ('word', 'phrase', 'sentence', 'dialogue', 'tip')),
  word_or_phrase text NOT NULL,
  ipa text,  -- sadece tek kelimeler için
  word_type text CHECK (word_type IN ('noun', 'verb', 'adj', 'adv', 'phrase', 'abbr', 'dialogue', 'tip')),

  -- Hangi rollere gösterilecek (ARRAY)
  target_roles text[] NOT NULL CHECK (
    array_length(target_roles, 1) >= 1
    AND target_roles <@ ARRAY['pilot', 'atc', 'cabin', 'technician', 'ground', 'student']
  ),

  -- Çeviriler (TR + EN zorunlu, diğer 18 dil için JSONB)
  definition_en text NOT NULL,
  definition_tr text NOT NULL,
  definition_other jsonb DEFAULT '{}'::jsonb,

  example_en text NOT NULL,
  example_tr text NOT NULL,
  example_other jsonb DEFAULT '{}'::jsonb,

  -- Dialogue formatı (content_type='dialogue' için)
  dialogue_lines jsonb,

  -- Audio (vocab-audio bucket'ında dosyaya URL)
  word_audio_url text,
  example_audio_url text,

  -- Metadata
  category text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('basic', 'intermediate', 'advanced')),
  etymology text,
  related_words text[],
  source text,

  -- Rotation
  display_order int,
  scheduled_date date,  -- manuel atama (admin paneli)

  -- Admin metadata
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- ─── 2) Indexes ───────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_wotd_target_roles ON public.word_of_the_day USING GIN(target_roles);
CREATE INDEX IF NOT EXISTS idx_wotd_category ON public.word_of_the_day(category);
CREATE INDEX IF NOT EXISTS idx_wotd_scheduled ON public.word_of_the_day(scheduled_date) WHERE scheduled_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_wotd_active ON public.word_of_the_day(is_active) WHERE is_active = true;

-- ─── 3) updated_at trigger ────────────────────────────────────────────────
CREATE TRIGGER wotd_set_updated_at
  BEFORE UPDATE ON public.word_of_the_day
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── 4) RLS ───────────────────────────────────────────────────────────────
ALTER TABLE public.word_of_the_day ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS wotd_authenticated_read ON public.word_of_the_day;
CREATE POLICY wotd_authenticated_read ON public.word_of_the_day
  FOR SELECT TO authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS wotd_editor_manage ON public.word_of_the_day;
CREATE POLICY wotd_editor_manage ON public.word_of_the_day
  FOR ALL TO authenticated
  USING (public.has_admin_role('editor'))
  WITH CHECK (public.has_admin_role('editor'));

-- ─── 5) RPC: get_word_of_today ────────────────────────────────────────────
-- Kullanıcının rolüne göre bugünün kelimesini döner.
-- Önce scheduled_date eşleşmesi (admin manuel atadıysa), sonra rotation.
CREATE OR REPLACE FUNCTION public.get_word_of_today()
RETURNS SETOF public.word_of_the_day
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_user_role text;
  v_today_doy int := EXTRACT(DOY FROM CURRENT_DATE)::int;
  v_role_word_count int;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'auth required';
  END IF;

  -- User rolünü al; null ise fallback 'pilot'
  SELECT COALESCE(role, 'pilot') INTO v_user_role
  FROM public.profiles
  WHERE id = v_user_id;

  IF v_user_role IS NULL THEN
    v_user_role := 'pilot';
  END IF;

  -- 1) Scheduled date öncelikli (admin manuel atadıysa)
  RETURN QUERY
  SELECT * FROM public.word_of_the_day
  WHERE scheduled_date = CURRENT_DATE
    AND is_active = true
    AND v_user_role = ANY(target_roles)
  LIMIT 1;
  IF FOUND THEN RETURN; END IF;

  -- 2) Bu rol için aktif kelime sayısı
  SELECT COUNT(*) INTO v_role_word_count
  FROM public.word_of_the_day
  WHERE is_active = true
    AND v_user_role = ANY(target_roles);

  -- 2a) Bu rol için içerik yoksa, herhangi bir aktif kelime
  IF v_role_word_count = 0 THEN
    RETURN QUERY
    SELECT * FROM public.word_of_the_day
    WHERE is_active = true
    ORDER BY id
    LIMIT 1;
    RETURN;
  END IF;

  -- 2b) day_of_year ile deterministik rotation
  RETURN QUERY
  SELECT * FROM public.word_of_the_day
  WHERE is_active = true
    AND v_user_role = ANY(target_roles)
  ORDER BY id
  OFFSET (v_today_doy % v_role_word_count)
  LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_word_of_today() TO authenticated;

-- ─── 6) SEED — 30 kayıt (her rol için 5) ──────────────────────────────────
INSERT INTO public.word_of_the_day (
  content_type, word_or_phrase, ipa, word_type, target_roles,
  definition_en, definition_tr, example_en, example_tr,
  category, difficulty
) VALUES

-- PILOT (5)
('word', 'squawk', '/skwɔːk/', 'verb', ARRAY['pilot'],
 'To set a 4-digit transponder code as instructed by ATC.',
 'ATC''nin verdiği 4 haneli transponder kodunu ayarlamak.',
 'Turkish 1453, squawk 7421.',
 'Türk 1453, 7421 kodunu ayarla.',
 'atc_communication', 'intermediate'),

('phrase', 'cleared for takeoff', '/klɪərd fər ˈteɪkɒf/', 'phrase', ARRAY['pilot'],
 'Authorization from ATC to begin takeoff roll.',
 'ATC''den kalkış için verilen izin.',
 'Turkish 1453, runway 17R, cleared for takeoff.',
 'Türk 1453, 17 sağ pist, kalkışa müsade.',
 'phraseology', 'basic'),

('word', 'go-around', '/ˈɡoʊ əˌraʊnd/', 'phrase', ARRAY['pilot'],
 'Aborted landing approach; climb out and re-attempt.',
 'İptal edilen iniş yaklaşımı; tırmanıp tekrar denemek.',
 'Turkish 1453, going around, request vectors for second approach.',
 'Türk 1453, go-around yapıyoruz, ikinci yaklaşma için vektör talep ediyoruz.',
 'phraseology', 'intermediate'),

('word', 'V1', '/viː wʌn/', 'abbr', ARRAY['pilot'],
 'Decision speed — beyond which takeoff must be continued even if engine fails.',
 'Karar hızı — bu hızdan sonra motor arızası olsa bile kalkışa devam edilmeli.',
 'V1... rotate.',
 'V1... rotate.',
 'pilot_terminology', 'advanced'),

('word', 'crosswind', '/ˈkrɒswɪnd/', 'noun', ARRAY['pilot','atc'],
 'Wind blowing perpendicular to runway heading.',
 'Pist yönüne dik olarak esen rüzgar.',
 'Turkish 1453, crosswind 15 knots gusting 25.',
 'Türk 1453, yan rüzgar 15 knot, 25''e kadar hamleli.',
 'weather', 'basic'),

-- ATC (5)
('phrase', 'cleared to land', '/klɪərd tuː lænd/', 'phrase', ARRAY['atc','pilot'],
 'ATC authorization for aircraft to land on specified runway.',
 'ATC''nin uçağın belirli pistte iniş yapması için verdiği izin.',
 'Turkish 1453, runway 35L, cleared to land.',
 'Türk 1453, 35 sol pisti, inişe müsade.',
 'phraseology', 'basic'),

('phrase', 'taxi via', NULL, 'phrase', ARRAY['atc','pilot'],
 'ATC instruction specifying taxi route via certain taxiways.',
 'Belirli taxiway''lerden geçerek taksi talimatı.',
 'Turkish 1453, taxi to runway 17R via Alpha, Bravo.',
 'Türk 1453, Alpha ve Bravo üzerinden 17 sağ piste taksi.',
 'ground_movement', 'intermediate'),

('phrase', 'expedite climb', NULL, 'phrase', ARRAY['atc','pilot'],
 'Instruction to climb at maximum rate due to traffic or terrain.',
 'Trafik veya arazi nedeniyle maksimum hızda tırmanma talimatı.',
 'Turkish 1453, expedite climb to FL250 due to traffic.',
 'Türk 1453, trafik nedeniyle FL250''ye hızlı tırmanın.',
 'phraseology', 'advanced'),

('phrase', 'wilco', '/ˈwɪlkoʊ/', 'phrase', ARRAY['atc','pilot'],
 'Will Comply — confirmation that instruction will be followed.',
 'Will Comply — verilen talimata uyulacağının onayı.',
 'Wilco, descending to 5000.',
 'Wilco, 5000''e iniyorum.',
 'phraseology', 'basic'),

('word', 'separation', '/ˌsepəˈreɪʃən/', 'noun', ARRAY['atc'],
 'Minimum required distance between aircraft for safety.',
 'Güvenlik için uçaklar arasında gereken minimum mesafe.',
 'Maintain 5-mile separation between successive arrivals.',
 'Birbirini takip eden inişler arasında 5 millik ayrım koru.',
 'atc_procedures', 'intermediate'),

-- CABIN (5)
('phrase', 'Cabin crew, prepare for departure', NULL, 'phrase', ARRAY['cabin'],
 'Captain instruction signaling final pre-takeoff preparations.',
 'Kaptanın son kalkış öncesi hazırlık komutu.',
 'Cabin crew, prepare for departure. Doors armed and cross-checked.',
 'Kabin ekibi, kalkışa hazırlanın. Kapılar silahlandı ve çapraz kontrol edildi.',
 'cabin_announcements', 'basic'),

('sentence', 'Brace! Brace! Heads down, stay down!', NULL, 'phrase', ARRAY['cabin','pilot'],
 'Emergency landing command issued to passengers.',
 'Yolculara acil iniş için verilen komut.',
 'In emergency: Brace! Brace! Heads down, stay down!',
 'Acil durumda: Eğil! Eğil! Başınız aşağıda, aşağıda kalın!',
 'emergency_procedures', 'intermediate'),

('phrase', 'galley check', NULL, 'phrase', ARRAY['cabin'],
 'Pre-flight inspection of galley equipment, supplies and security.',
 'Galley ekipman, malzeme ve güvenlik öncesi uçuş kontrolü.',
 'Number 1, complete galley check before boarding.',
 '1 numara, biniş öncesi galley kontrolünü tamamla.',
 'cabin_procedures', 'basic'),

('phrase', 'pax', '/pæks/', 'abbr', ARRAY['cabin','ground','pilot'],
 'Passengers — industry shorthand for passenger count.',
 'Yolcular — sektörde yolcu sayısı için kısaltma.',
 'Boarding complete: 142 pax, 6 crew on board.',
 'Biniş tamam: 142 yolcu, 6 ekip uçakta.',
 'industry_jargon', 'basic'),

('phrase', 'jumpseat', '/ˈdʒʌmpˌsiːt/', 'noun', ARRAY['cabin','pilot'],
 'Foldable seat for crew or authorized personnel during taxi/takeoff/landing.',
 'Taksi/kalkış/iniş sırasında ekip için katlanan koltuk.',
 'Number 3, take your jumpseat for landing.',
 '3 numara, iniş için jumpseat''e geç.',
 'cabin_equipment', 'basic'),

-- TECHNICIAN (5)
('word', 'AOG', '/eɪ oʊ dʒiː/', 'abbr', ARRAY['technician'],
 'Aircraft On Ground — aircraft unavailable for service due to defect or maintenance.',
 'Yer Bağlı Uçak — arıza veya bakım nedeniyle servise hazır olmayan uçak.',
 'TC-JFA is AOG due to hydraulic system failure.',
 'TC-JFA, hidrolik sistem arızası nedeniyle AOG.',
 'maintenance', 'basic'),

('word', 'snag', '/snæɡ/', 'noun', ARRAY['technician'],
 'A defect or fault reported by pilot/crew that needs maintenance attention.',
 'Pilot/ekip tarafından raporlanan ve bakım gerektiren arıza.',
 'Logged snag: APU autostart fails on second attempt.',
 'Kayıt edilen arıza: APU ikinci denemede otomatik başlamıyor.',
 'maintenance_log', 'intermediate'),

('word', 'MEL', '/em iː el/', 'abbr', ARRAY['technician','pilot'],
 'Minimum Equipment List — required equipment for safe flight operation.',
 'Minimum Ekipman Listesi — güvenli uçuş operasyonu için gerekli ekipman.',
 'Check MEL for inoperative weather radar before dispatch.',
 'Sevkten önce çalışmayan hava radarı için MEL kontrol et.',
 'documentation', 'advanced'),

('word', 'torque', '/tɔːrk/', 'noun', ARRAY['technician'],
 'Rotational force applied to fasteners or shafts; measured in Nm or lb-ft.',
 'Sıkıştırıcı veya millere uygulanan dönme kuvveti; Nm veya lb-ft ile ölçülür.',
 'Apply 25 Nm torque to engine mount bolts.',
 'Motor montaj cıvatalarına 25 Nm tork uygula.',
 'maintenance_terminology', 'intermediate'),

('phrase', 'borescope inspection', NULL, 'phrase', ARRAY['technician'],
 'Internal engine inspection using flexible camera-equipped probe.',
 'Esnek kamera donanımlı sonda ile motor iç kontrolü.',
 'Schedule borescope inspection after FOD incident.',
 'FOD olayından sonra borescope kontrolü planla.',
 'inspection_procedures', 'advanced'),

-- GROUND (5)
('phrase', 'pushback', '/ˈpʊʃˌbæk/', 'noun', ARRAY['ground','pilot'],
 'Tug-assisted reverse movement of aircraft from gate to taxiway.',
 'Uçağı kapıdan taksi yoluna geri itme işlemi.',
 'Turkish 1453, ready for pushback, gate A12.',
 'Türk 1453, pushback için hazır, A12 kapısı.',
 'ground_operations', 'basic'),

('phrase', 'chocks in place', NULL, 'phrase', ARRAY['ground','pilot'],
 'Wheel chocks positioned to prevent aircraft rolling.',
 'Uçağın kaymasını önlemek için tekerlek takozları yerleştirildi.',
 'Turkish 1453, chocks in place, ground power connected.',
 'Türk 1453, takoz yerinde, yer gücü bağlı.',
 'ground_operations', 'basic'),

('word', 'marshaller', '/ˈmɑːrʃələr/', 'noun', ARRAY['ground','pilot'],
 'Ground crew member guiding aircraft parking with hand signals.',
 'El işaretleriyle uçak park yönlendirmesi yapan yer ekibi.',
 'Follow marshaller signals to parking position.',
 'Park pozisyonu için marshaller işaretlerini takip et.',
 'ground_operations', 'basic'),

('phrase', 'ground power unit', '/graʊnd ˈpaʊər ˈjuːnɪt/', 'phrase', ARRAY['ground','technician'],
 'External electrical power source for parked aircraft (GPU).',
 'Park halindeki uçak için harici elektrik kaynağı (GPU).',
 'Connect ground power unit before APU shutdown.',
 'APU kapatılmadan önce yer gücü ünitesini bağla.',
 'ground_equipment', 'intermediate'),

('phrase', 'cargo manifest', NULL, 'phrase', ARRAY['ground'],
 'Document listing all cargo items, weights and destinations.',
 'Tüm yük kalemleri, ağırlıklar ve hedefleri listeleyen belge.',
 'Cross-check cargo manifest before loading completion.',
 'Yükleme tamamlanmadan önce kargo manifesto çapraz kontrol et.',
 'cargo_operations', 'intermediate'),

-- STUDENT (5)
('tip', 'NATO Phonetic Alphabet', NULL, 'tip',
 ARRAY['student','pilot','atc','cabin','technician','ground'],
 'Aviation uses NATO phonetic: Alpha, Bravo, Charlie, Delta, Echo, Foxtrot, Golf, Hotel, India, Juliet, Kilo, Lima, Mike, November, Oscar, Papa, Quebec, Romeo, Sierra, Tango, Uniform, Victor, Whiskey, X-ray, Yankee, Zulu.',
 'Havacılıkta NATO fonetik alfabesi kullanılır: Alpha, Bravo, Charlie...',
 'TC-JFA → Tango Charlie Juliet Foxtrot Alpha',
 'TC-JFA → Tango Charlie Juliet Foxtrot Alpha',
 'fundamentals', 'basic'),

('word', 'METAR', '/ˈmiːtɑːr/', 'abbr', ARRAY['student','pilot','atc'],
 'Meteorological Aerodrome Report — standardized airport weather report.',
 'Meteoroloji Havalimanı Raporu — standart havalimanı hava durumu raporu.',
 'Reading METAR: VFR conditions, wind 270 at 10 knots.',
 'METAR okuma: VFR koşullar, rüzgar 270, 10 knot.',
 'weather', 'basic'),

('word', 'ICAO', '/ˈaɪkeɪoʊ/', 'abbr', ARRAY['student','pilot','atc','cabin','technician','ground'],
 'International Civil Aviation Organization — UN body setting global aviation standards.',
 'Uluslararası Sivil Havacılık Örgütü — BM bağlı, küresel havacılık standartları belirler.',
 'ICAO Annex 1 sets Aviation English Level 4 requirement.',
 'ICAO Annex 1, Havacılık İngilizcesi Seviye 4 gereksinimini belirler.',
 'regulations', 'basic'),

('word', 'VFR', '/viː ef ɑːr/', 'abbr', ARRAY['student','pilot'],
 'Visual Flight Rules — flight operations conducted by visual reference to ground.',
 'Görsel Uçuş Kuralları — yere görsel referansla yürütülen uçuş operasyonları.',
 'Weather is VFR — minimum 3 statute miles visibility and 1000ft ceiling.',
 'Hava VFR — minimum 3 statute mil görüş ve 1000ft tavan.',
 'flight_rules', 'basic'),

('word', 'FL', '/ef el/', 'abbr', ARRAY['student','pilot','atc'],
 'Flight Level — altitude above standard sea level pressure (1013.25 hPa) divided by 100.',
 'Uçuş Seviyesi — standart deniz seviyesi basıncına (1013.25 hPa) göre irtifa, 100''e bölünmüş.',
 'Climb and maintain FL370 (= 37,000 feet).',
 'FL370''e tırman ve koru (= 37.000 fit).',
 'flight_rules', 'basic');

COMMENT ON TABLE public.word_of_the_day IS
  'Sprint 14.D — Home screen daily content (role-based). Pilot/ATC/Cabin/Technician/Ground/Student için ayrı içerik. RPC get_word_of_today() rol bazlı rotation.';
