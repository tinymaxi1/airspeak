-- Seed mevcut 5 static scenario (idempotent)
BEGIN;

INSERT INTO public.scenarios (
  slug, role, target_roles, target_sub_roles, level, title, title_tr,
  setup, setup_tr, turns, gauges, difficulty, estimated_minutes,
  status, is_premium
) VALUES (
  'holding-vecon',
  'pilot',
  ARRAY['pilot']::text[],
  '{}'::text[],
  'B2',
  'VECON üzerinde holding pattern',
  'VECON üzerinde holding pattern',
  'Türk Hava Yolları 1453, Ankara yaklaşma kontrolü ile bekleme paterninde.',
  'Türk Hava Yolları 1453, Ankara yaklaşma kontrolü ile bekleme paterninde.',
  '[{"id":"turn-1","atcStation":"ANKARA APPROACH","frequency":"120.9","atcUtterance":"Turkish 1453, hold at VECON as published, expect further clearance one-two-four-five Zulu.","expectedReadback":"Hold at VECON as published, expect further clearance one-two-four-five Zulu, Turkish 1453.","keyPhrases":[["hold","holding"],["vecon"],["as published"],["expect further clearance","further clearance","efc"],["one two four five","1245","12 45","twelve forty five"],["zulu","z"],["turkish","thy"],["1453","one four five three"]],"correctionTr":"Standart read-back: ''Hold at VECON as published, expect further clearance one-two-four-five Zulu, Turkish 1453.'' Çağrı kodunu cümle sonunda söyle, EFC zamanını her zaman tekrarla.","hintTr":"EFC = Expect Further Clearance. Saati ICAO formatında oku: \"one-two-four-five\"."},{"id":"turn-2","atcStation":"ANKARA APPROACH","frequency":"120.9","atcUtterance":"Turkish 1453, read-back correct.","expectedReadback":"Turkish 1453.","keyPhrases":[["turkish"],["1453","one four five three"]],"correctionTr":"Sadece çağrı kodunu söyle: \"Turkish 1453\"."},{"id":"turn-3","atcStation":"ANKARA APPROACH","frequency":"120.9","atcUtterance":"Turkish 1453, weather building south. Suggest reverse direction in hold. Confirm if able.","expectedReadback":"Affirm reversing hold direction, Turkish 1453.","keyPhrases":[["affirm","affirmative","yes"],["reverse","reversing","reverse direction"],["hold","holding"],["turkish"],["1453","one four five three"]],"correctionTr":"Sapmayı \"Affirm\" ile onayla, sonra ne yapacağını tekrarla: \"Affirm reversing hold direction\".","isFinal":true}]'::jsonb,
  '{"alt":"FL240","hdg":"270°","spd":"280kt","freq":"120.9"}'::jsonb,
  3,
  3,
  'published',
  false
)
ON CONFLICT (slug) DO UPDATE SET
  role = EXCLUDED.role,
  target_roles = EXCLUDED.target_roles,
  level = EXCLUDED.level,
  title = EXCLUDED.title,
  title_tr = EXCLUDED.title_tr,
  setup = EXCLUDED.setup,
  setup_tr = EXCLUDED.setup_tr,
  turns = EXCLUDED.turns,
  gauges = EXCLUDED.gauges,
  difficulty = EXCLUDED.difficulty,
  estimated_minutes = EXCLUDED.estimated_minutes,
  status = EXCLUDED.status,
  updated_at = now();

INSERT INTO public.scenarios (
  slug, role, target_roles, target_sub_roles, level, title, title_tr,
  setup, setup_tr, turns, gauges, difficulty, estimated_minutes,
  status, is_premium
) VALUES (
  'taxi-clearance-ist',
  'pilot',
  ARRAY['pilot']::text[],
  '{}'::text[],
  'B1',
  'Istanbul taxi clearance',
  'Istanbul taxi clearance',
  'IST gate A21''den runway 35L''a taxi clearance.',
  'IST gate A21''den runway 35L''a taxi clearance.',
  '[{"id":"turn-1","atcStation":"ISTANBUL GROUND","frequency":"129.6","atcUtterance":"Turkish 1453, taxi to holding point runway 35 left, via Echo Six, Hotel.","expectedReadback":"Taxi to holding point runway 35 left via Echo Six Hotel, Turkish 1453.","keyPhrases":[["taxi"],["holding point","hold short"],["runway 35 left","runway three five left","35l","three five left"],["echo six","e6","e 6"],["hotel","h"],["turkish"],["1453","one four five three"]],"correctionTr":"Taxi clearance read-back şu sırayla: HOLDING POINT + RUNWAY + via TAXIWAYS + CALLSIGN."},{"id":"turn-2","atcStation":"ISTANBUL GROUND","frequency":"129.6","atcUtterance":"Turkish 1453, give way to A320 from your right, then continue.","expectedReadback":"Giving way to A320, then continuing, Turkish 1453.","keyPhrases":[["give way","giving way","yield"],["a320","airbus 320"],["continue","continuing"],["turkish"]],"correctionTr":"\"Giving way\" + ne için (\"to A320\") + \"then continuing\" şeklinde tekrarla.","isFinal":true}]'::jsonb,
  '{"freq":"129.6"}'::jsonb,
  1,
  2,
  'published',
  false
)
ON CONFLICT (slug) DO UPDATE SET
  role = EXCLUDED.role,
  target_roles = EXCLUDED.target_roles,
  level = EXCLUDED.level,
  title = EXCLUDED.title,
  title_tr = EXCLUDED.title_tr,
  setup = EXCLUDED.setup,
  setup_tr = EXCLUDED.setup_tr,
  turns = EXCLUDED.turns,
  gauges = EXCLUDED.gauges,
  difficulty = EXCLUDED.difficulty,
  estimated_minutes = EXCLUDED.estimated_minutes,
  status = EXCLUDED.status,
  updated_at = now();

INSERT INTO public.scenarios (
  slug, role, target_roles, target_sub_roles, level, title, title_tr,
  setup, setup_tr, turns, gauges, difficulty, estimated_minutes,
  status, is_premium
) VALUES (
  'go-around-final',
  'pilot',
  ARRAY['pilot']::text[],
  '{}'::text[],
  'L4',
  'Final approach''ta go-around',
  'Final approach''ta go-around',
  'Final approach 27R, önündeki uçak henüz pisti boşaltmadı.',
  'Final approach 27R, önündeki uçak henüz pisti boşaltmadı.',
  '[{"id":"turn-1","atcStation":"TOWER","frequency":"118.1","atcUtterance":"Turkish 1453, go around. Climb runway heading to 3000 feet.","expectedReadback":"Going around, runway heading climb 3000 feet, Turkish 1453.","keyPhrases":[["go around","going around","go-around"],["runway heading","runway track"],["3000","three thousand","3 thousand"],["feet","ft"],["turkish"]],"correctionTr":"Go-around emrini hemen ve standart: \"Going around\" + tırmanış talimatı + callsign.","hintTr":"Go-around aciliyettir — read-back hemen ve net olmalı."},{"id":"turn-2","atcStation":"TOWER","frequency":"118.1","atcUtterance":"Turkish 1453, contact approach 124 decimal 35 for re-sequencing.","expectedReadback":"124 decimal 35, Turkish 1453.","keyPhrases":[["124","one two four","one twenty four"],["decimal","point"],["35","three five","thirty five"],["turkish"]],"correctionTr":"Frekans değişiminde sadece frekansı + callsign söyle: \"124 decimal 35, Turkish 1453\".","isFinal":true}]'::jsonb,
  '{"alt":"500ft","hdg":"270°","spd":"140kt","freq":"118.1"}'::jsonb,
  5,
  2,
  'published',
  false
)
ON CONFLICT (slug) DO UPDATE SET
  role = EXCLUDED.role,
  target_roles = EXCLUDED.target_roles,
  level = EXCLUDED.level,
  title = EXCLUDED.title,
  title_tr = EXCLUDED.title_tr,
  setup = EXCLUDED.setup,
  setup_tr = EXCLUDED.setup_tr,
  turns = EXCLUDED.turns,
  gauges = EXCLUDED.gauges,
  difficulty = EXCLUDED.difficulty,
  estimated_minutes = EXCLUDED.estimated_minutes,
  status = EXCLUDED.status,
  updated_at = now();

INSERT INTO public.scenarios (
  slug, role, target_roles, target_sub_roles, level, title, title_tr,
  setup, setup_tr, turns, gauges, difficulty, estimated_minutes,
  status, is_premium
) VALUES (
  'pa-turbulence',
  'cabin',
  ARRAY['cabin']::text[],
  '{}'::text[],
  'B2',
  'PA: türbülans uyarısı',
  'PA: türbülans uyarısı',
  'Cruise sırasında ani türbülans, kabin için PA anonsu.',
  'Cruise sırasında ani türbülans, kabin için PA anonsu.',
  '[{"id":"turn-1","atcStation":"CAPTAIN","atcUtterance":"Cabin, captain. Expect moderate turbulence in 3 minutes. Make a PA announcement and secure the cabin.","expectedReadback":"Ladies and gentlemen, the captain has switched on the seatbelt sign. Please return to your seats and fasten your seatbelts.","keyPhrases":[["ladies and gentlemen","dear passengers"],["captain","flight deck"],["seatbelt","seat belt"],["return","go back"],["seats","your seat"],["fasten","buckle"]],"correctionTr":"PA anonsu standart: \"Ladies and gentlemen\" hitabı + captain bilgisi + seatbelt sign + return to seats + fasten.","isFinal":true}]'::jsonb,
  NULL,
  3,
  1,
  'published',
  false
)
ON CONFLICT (slug) DO UPDATE SET
  role = EXCLUDED.role,
  target_roles = EXCLUDED.target_roles,
  level = EXCLUDED.level,
  title = EXCLUDED.title,
  title_tr = EXCLUDED.title_tr,
  setup = EXCLUDED.setup,
  setup_tr = EXCLUDED.setup_tr,
  turns = EXCLUDED.turns,
  gauges = EXCLUDED.gauges,
  difficulty = EXCLUDED.difficulty,
  estimated_minutes = EXCLUDED.estimated_minutes,
  status = EXCLUDED.status,
  updated_at = now();

INSERT INTO public.scenarios (
  slug, role, target_roles, target_sub_roles, level, title, title_tr,
  setup, setup_tr, turns, gauges, difficulty, estimated_minutes,
  status, is_premium
) VALUES (
  'mayday-engine-fire',
  'pilot',
  ARRAY['pilot']::text[],
  '{}'::text[],
  'L4',
  'MAYDAY: engine fire',
  'MAYDAY: engine fire',
  'Sol motorda yangın, derhal acil durum bildirimi gerekli.',
  'Sol motorda yangın, derhal acil durum bildirimi gerekli.',
  '[{"id":"turn-1","atcStation":"YOU","frequency":"121.5","atcUtterance":"[Acil durum bildirimi yap — MAYDAY çağrısı]","expectedReadback":"Mayday, Mayday, Mayday, Istanbul approach, Turkish 1453, engine fire, descending, request immediate vectors to nearest airport.","keyPhrases":[["mayday","may day"],["istanbul","ist"],["turkish"],["1453","one four five three"],["engine fire","fire engine","engine on fire"],["descending","descend"],["vectors","vector","heading"],["nearest airport","nearest field","closest airport"]],"correctionTr":"MAYDAY çağrısı 3 kez tekrar edilir, sonra istasyon, callsign, problem, niyetin (descending/turning) ve istek (vectors/clearance).","hintTr":"MAYDAY = en yüksek aciliyet. PAN-PAN ondan bir alt seviye.","isFinal":true}]'::jsonb,
  '{"alt":"FL080","hdg":"180°","spd":"230kt","freq":"121.5"}'::jsonb,
  5,
  2,
  'published',
  false
)
ON CONFLICT (slug) DO UPDATE SET
  role = EXCLUDED.role,
  target_roles = EXCLUDED.target_roles,
  level = EXCLUDED.level,
  title = EXCLUDED.title,
  title_tr = EXCLUDED.title_tr,
  setup = EXCLUDED.setup,
  setup_tr = EXCLUDED.setup_tr,
  turns = EXCLUDED.turns,
  gauges = EXCLUDED.gauges,
  difficulty = EXCLUDED.difficulty,
  estimated_minutes = EXCLUDED.estimated_minutes,
  status = EXCLUDED.status,
  updated_at = now();
COMMIT;
