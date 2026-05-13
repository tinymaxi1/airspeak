/**
 * Listen & Solve drill bank — hardcoded TS (geçici, DB tablosu sonra).
 *
 * Her drill için TTS okutulacak `audio_text` (İngilizce) + Türkçe soru/açıklama.
 * 14 drill, 7 rol için minimum 2 drill garantili.
 *
 * Kategori:
 *   - atc_listen: ATC anonsu/clearance dinleme
 *   - garbled_radio: gürültülü/garbled telsiz (text aynı, soru zorluk)
 *   - transcribe: kelime/sayı tutma (callsign, frekans, altitude)
 *   - pa_decode: cabin PA mesajı çözme
 *   - snag_report: teknisyen snag/maintenance call
 *   - metar_notam: dispatcher hava/saha raporları
 *
 * `target_role`: drill kime özel. 'all' = tüm rol fallback.
 */

export type ListenSolveCategory =
  | 'atc_listen'
  | 'garbled_radio'
  | 'transcribe'
  | 'pa_decode'
  | 'snag_report'
  | 'metar_notam';

export type ListenSolveRole =
  | 'pilot' | 'atc' | 'cabin' | 'technician' | 'ground' | 'student' | 'dispatcher' | 'all';

export type ListenSolveLevel = 'A2' | 'B1' | 'B2';

export interface ListenSolveOption {
  id: string; // 'a' | 'b' | 'c' | 'd'
  label_tr: string;
  label_en: string;
}

export interface ListenSolveDrill {
  id: string;
  slug: string;
  level: ListenSolveLevel;
  target_role: ListenSolveRole;
  target_sub_roles?: string[];
  category: ListenSolveCategory;
  audio_text: string;           // TTS okutur (İngilizce, gerçek havacılık frazeolojisi)
  question_tr: string;
  question_en: string;
  options: ListenSolveOption[]; // tam 4
  correct_id: string;
  explanation_tr: string;
  explanation_en: string;
  hint_tr?: string;
}

export const LISTEN_SOLVE_DRILLS: ListenSolveDrill[] = [
  // ═══════════════════ PILOT (3) ═══════════════════
  {
    id: 'ls_pilot_clr_01',
    slug: 'pilot-clearance-fl350',
    level: 'B1',
    target_role: 'pilot',
    category: 'atc_listen',
    audio_text: 'Turkish 1453, climb and maintain flight level 350.',
    question_tr: 'Hangi yüksekliğe çıkılması istendi?',
    question_en: 'What altitude was instructed?',
    options: [
      { id: 'a', label_tr: 'FL 250', label_en: 'FL 250' },
      { id: 'b', label_tr: 'FL 350', label_en: 'FL 350' },
      { id: 'c', label_tr: 'FL 450', label_en: 'FL 450' },
      { id: 'd', label_tr: 'FL 150', label_en: 'FL 150' },
    ],
    correct_id: 'b',
    explanation_tr: 'ATC "flight level 350" dedi — FL350 doğru cevap. Read-back yaparken bu seviyeyi tekrar etmek zorunlu.',
    explanation_en: 'ATC said "flight level 350" — FL350 is correct. Pilot must read-back this level.',
    hint_tr: '"Flight level" sayısına odaklan.',
  },
  {
    id: 'ls_pilot_atis_01',
    slug: 'pilot-heathrow-atis-charlie',
    level: 'B2',
    target_role: 'pilot',
    category: 'atc_listen',
    audio_text: 'Heathrow Information Charlie, time 1450 zulu, runway 27 Left in use, wind 270 at 15.',
    question_tr: 'Kullanımdaki pist hangisi?',
    question_en: 'Which runway is in use?',
    options: [
      { id: 'a', label_tr: '27 Right', label_en: '27 Right' },
      { id: 'b', label_tr: '09 Left', label_en: '09 Left' },
      { id: 'c', label_tr: '27 Left', label_en: '27 Left' },
      { id: 'd', label_tr: '09 Right', label_en: '09 Right' },
    ],
    correct_id: 'c',
    explanation_tr: 'ATIS Charlie "runway 27 Left in use" dedi. Heathrow paralel pistlerde L/R ayrımı kritik — yanlış pist okuması ciddi runway incursion riski.',
    explanation_en: 'ATIS Charlie said "runway 27 Left in use." At Heathrow, L/R distinction is critical for parallel runways.',
  },
  {
    id: 'ls_pilot_rwy_01',
    slug: 'pilot-runway-change-09L',
    level: 'B1',
    target_role: 'pilot',
    category: 'atc_listen',
    audio_text: 'Turkish 1453, runway changed to 09 Left due to wind shift, expect new approach briefing.',
    question_tr: 'Yeni pist hangisi?',
    question_en: 'What is the new runway?',
    options: [
      { id: 'a', label_tr: '27 Left', label_en: '27 Left' },
      { id: 'b', label_tr: '09 Right', label_en: '09 Right' },
      { id: 'c', label_tr: '09 Left', label_en: '09 Left' },
      { id: 'd', label_tr: '36 Left', label_en: '36 Left' },
    ],
    correct_id: 'c',
    explanation_tr: 'Rüzgar değişimi sebebiyle 09 Left\'e yönlendirildi. "Wind shift" durumlarında runway değişimi yaygın.',
    explanation_en: 'Due to wind shift, runway changed to 09 Left. Runway changes are common with wind shifts.',
  },

  // ═══════════════════ ATC (2) ═══════════════════
  {
    id: 'ls_atc_readback_01',
    slug: 'atc-readback-correct-fl350',
    level: 'B2',
    target_role: 'atc',
    category: 'atc_listen',
    audio_text: 'Climbing flight level 350, Turkish 1453.',
    question_tr: 'Pilot read-back\'i doğru mu? ATC talimatı "climb and maintain flight level 350" idi.',
    question_en: 'Is the pilot read-back correct? ATC instruction was "climb and maintain flight level 350."',
    options: [
      { id: 'a', label_tr: 'Doğru — kabul et', label_en: 'Correct — accept' },
      { id: 'b', label_tr: 'Yanlış — callsign eksik', label_en: 'Wrong — missing callsign' },
      { id: 'c', label_tr: 'Yanlış — yükseklik eksik', label_en: 'Wrong — missing altitude' },
      { id: 'd', label_tr: 'Yanlış — "maintain" eksik', label_en: 'Wrong — "maintain" missing' },
    ],
    correct_id: 'a',
    explanation_tr: 'Read-back doğru: "climbing FL 350" + callsign. ICAO Doc 4444 standartına uygun. "Maintain" zorunlu okuma değil, action verb yeterli.',
    explanation_en: 'Read-back is correct: "climbing FL 350" + callsign. Meets ICAO Doc 4444. "Maintain" is not mandatory in read-back.',
  },
  {
    id: 'ls_atc_emerg_01',
    slug: 'atc-mayday-engine-failure',
    level: 'B2',
    target_role: 'atc',
    category: 'atc_listen',
    audio_text: 'Mayday, mayday, mayday, Turkish 1453, engine number two failure, requesting immediate return.',
    question_tr: 'Acil durum tipi nedir?',
    question_en: 'What is the emergency type?',
    options: [
      { id: 'a', label_tr: 'Yangın', label_en: 'Fire' },
      { id: 'b', label_tr: 'Motor arızası', label_en: 'Engine failure' },
      { id: 'c', label_tr: 'Hidrolik arıza', label_en: 'Hydraulic failure' },
      { id: 'd', label_tr: 'Tıbbi acil', label_en: 'Medical emergency' },
    ],
    correct_id: 'b',
    explanation_tr: '"Engine number two failure" — 2 numaralı motor arızası. MAYDAY × 3 ICAO standart distress call. ATC öncelikli yardım sağlar.',
    explanation_en: '"Engine number two failure" — engine #2 failure. MAYDAY × 3 is standard ICAO distress call.',
  },

  // ═══════════════════ CABIN (2) ═══════════════════
  {
    id: 'ls_cabin_pa_01',
    slug: 'cabin-pa-turbulence',
    level: 'A2',
    target_role: 'cabin',
    category: 'pa_decode',
    audio_text: 'Ladies and gentlemen, we\'re encountering moderate turbulence. Please return to your seats and fasten your seatbelts.',
    question_tr: 'Yolculara ne yapması söyleniyor?',
    question_en: 'What are passengers asked to do?',
    options: [
      { id: 'a', label_tr: 'Pencere açın', label_en: 'Open windows' },
      { id: 'b', label_tr: 'Yerlerine dönün ve kemer bağlayın', label_en: 'Return to seats and fasten seatbelts' },
      { id: 'c', label_tr: 'Acil çıkışı bulun', label_en: 'Find emergency exit' },
      { id: 'd', label_tr: 'Maske takın', label_en: 'Put on oxygen mask' },
    ],
    correct_id: 'b',
    explanation_tr: 'Türbülans durumunda standart cabin PA: yerlerine dönüp kemer bağlamak. Kabin görevlileri kemerli olduklarından emin olmalı.',
    explanation_en: 'Standard turbulence PA: return to seats and fasten seatbelts. Cabin crew must verify compliance.',
  },
  {
    id: 'ls_cabin_pa_02',
    slug: 'cabin-pa-prepare-landing',
    level: 'A2',
    target_role: 'cabin',
    category: 'pa_decode',
    audio_text: 'Cabin crew, prepare cabin for landing. Doors on manual, cross-check.',
    question_tr: 'Cabin crew\'dan istenen sonraki adım nedir?',
    question_en: 'What is the next step for cabin crew?',
    options: [
      { id: 'a', label_tr: 'Servis hazırlığı', label_en: 'Prepare service' },
      { id: 'b', label_tr: 'Kabin iniş hazırlığı + kapıları manuel', label_en: 'Prepare cabin for landing + doors manual' },
      { id: 'c', label_tr: 'Acil tahliye', label_en: 'Emergency evacuation' },
      { id: 'd', label_tr: 'Boarding başlat', label_en: 'Begin boarding' },
    ],
    correct_id: 'b',
    explanation_tr: '"Prepare cabin for landing" + "doors on manual, cross-check" — iniş öncesi standart prosedür. Doors manual = slide armed değil.',
    explanation_en: '"Prepare cabin for landing" + "doors on manual, cross-check" — standard pre-landing procedure.',
  },

  // ═══════════════════ TECHNICIAN (2) ═══════════════════
  {
    id: 'ls_tech_call_01',
    slug: 'tech-hydraulic-pressure-drop',
    level: 'B1',
    target_role: 'technician',
    category: 'snag_report',
    audio_text: 'Tech line, we have a hydraulic pressure drop in system A. Reading 2400 PSI, normal is 3000 PSI.',
    question_tr: 'Bildirilen sorun ne?',
    question_en: 'What is the reported issue?',
    options: [
      { id: 'a', label_tr: 'Yakıt sızıntısı', label_en: 'Fuel leak' },
      { id: 'b', label_tr: 'A sistemi hidrolik basınç düşüklüğü', label_en: 'System A hydraulic pressure drop' },
      { id: 'c', label_tr: 'Elektrik arızası', label_en: 'Electrical failure' },
      { id: 'd', label_tr: 'APU çalışmıyor', label_en: 'APU not running' },
    ],
    correct_id: 'b',
    explanation_tr: 'Hidrolik sistem A 2400 PSI okuyor, normal 3000 PSI. 600 PSI düşüş ciddi — pump veya leak shvallarıyor olabilir.',
    explanation_en: 'Hydraulic system A reads 2400 PSI vs normal 3000 PSI. 600 PSI drop is significant — possible pump or leak.',
  },
  {
    id: 'ls_tech_snag_01',
    slug: 'tech-apu-snag-postflight',
    level: 'B1',
    target_role: 'technician',
    category: 'snag_report',
    audio_text: 'Maintenance, post-flight snag: APU did not start on first attempt. Second attempt successful. Pilot reports intermittent fault.',
    question_tr: 'Snag özet nedir?',
    question_en: 'Snag summary?',
    options: [
      { id: 'a', label_tr: 'APU hiç çalışmıyor', label_en: 'APU completely dead' },
      { id: 'b', label_tr: 'APU ilk denemede çalışmadı, ikincide tamam — intermittent', label_en: 'APU failed first start, second OK — intermittent' },
      { id: 'c', label_tr: 'APU yangın alarmı', label_en: 'APU fire warning' },
      { id: 'd', label_tr: 'APU yakıt sızıntısı', label_en: 'APU fuel leak' },
    ],
    correct_id: 'b',
    explanation_tr: 'Intermittent fault = aralıklı arıza. İlk start fail, ikinci ok. AMM troubleshooting prosedürü uygulanır, igniter / starter inceleme.',
    explanation_en: 'Intermittent fault = recurring issue. First start failed, second OK. AMM troubleshooting procedure applies.',
  },

  // ═══════════════════ GROUND (2) ═══════════════════
  {
    id: 'ls_grd_push_01',
    slug: 'ground-pushback-facing-north',
    level: 'A2',
    target_role: 'ground',
    category: 'atc_listen',
    audio_text: 'Turkish 1453, pushback approved, facing north, contact ground 121.9 after pushback.',
    question_tr: 'Pushback hangi yöne bakacak şekilde yapılacak?',
    question_en: 'After pushback, which direction will the aircraft face?',
    options: [
      { id: 'a', label_tr: 'Kuzey', label_en: 'North' },
      { id: 'b', label_tr: 'Güney', label_en: 'South' },
      { id: 'c', label_tr: 'Doğu', label_en: 'East' },
      { id: 'd', label_tr: 'Batı', label_en: 'West' },
    ],
    correct_id: 'a',
    explanation_tr: '"Facing north" = pushback sonrası uçak kuzeye bakacak. Bu next taxi yönünü belirler.',
    explanation_en: '"Facing north" = aircraft will face north after pushback. Determines next taxi direction.',
  },
  {
    id: 'ls_grd_marsh_01',
    slug: 'ground-contact-ground-121-9',
    level: 'A2',
    target_role: 'ground',
    category: 'transcribe',
    audio_text: 'Turkish 1453, contact ground 121 decimal 9 after pushback.',
    question_tr: 'Pushback sonrası hangi frekansa geçilecek?',
    question_en: 'Which frequency to contact after pushback?',
    options: [
      { id: 'a', label_tr: '121.5', label_en: '121.5' },
      { id: 'b', label_tr: '121.9', label_en: '121.9' },
      { id: 'c', label_tr: '129.6', label_en: '129.6' },
      { id: 'd', label_tr: '118.1', label_en: '118.1' },
    ],
    correct_id: 'b',
    explanation_tr: '121.9 = ground frekansı. "Decimal" = nokta. 121.5 acil durum frekansıdır, karıştırılmamalı.',
    explanation_en: '121.9 = ground frequency. "Decimal" = point. 121.5 is the emergency frequency, do not confuse.',
  },

  // ═══════════════════ STUDENT (2) ═══════════════════
  {
    id: 'ls_std_basic_01',
    slug: 'student-contact-tower-118-1',
    level: 'A2',
    target_role: 'student',
    category: 'transcribe',
    audio_text: 'Turkish 1453, contact tower 118 decimal 1.',
    question_tr: 'Hangi frekansa geçilecek?',
    question_en: 'Which frequency to contact?',
    options: [
      { id: 'a', label_tr: '118.1', label_en: '118.1' },
      { id: 'b', label_tr: '128.1', label_en: '128.1' },
      { id: 'c', label_tr: '118.5', label_en: '118.5' },
      { id: 'd', label_tr: '108.1', label_en: '108.1' },
    ],
    correct_id: 'a',
    explanation_tr: '118.1 = kule frekansı. "One one eight decimal one" şeklinde okunur ICAO standardında.',
    explanation_en: '118.1 = tower frequency. Spoken "one one eight decimal one" per ICAO standard.',
  },
  {
    id: 'ls_std_alt_01',
    slug: 'student-descend-7000',
    level: 'A2',
    target_role: 'student',
    category: 'atc_listen',
    audio_text: 'Turkish 1453, descend to altitude seven thousand feet.',
    question_tr: 'Hangi yüksekliğe iniş istendi?',
    question_en: 'What altitude to descend to?',
    options: [
      { id: 'a', label_tr: '17,000 ft', label_en: '17,000 ft' },
      { id: 'b', label_tr: '7,000 ft', label_en: '7,000 ft' },
      { id: 'c', label_tr: '70,000 ft', label_en: '70,000 ft' },
      { id: 'd', label_tr: '700 ft', label_en: '700 ft' },
    ],
    correct_id: 'b',
    explanation_tr: '"Seven thousand" = 7,000 ft. ICAO uçuş seviyesi (FL) yerine "altitude" geçince feet cinsinden söylenir.',
    explanation_en: '"Seven thousand" = 7,000 ft. When "altitude" is used (instead of FL), spoken in feet.',
  },

  // ═══════════════════ DISPATCHER (2) ═══════════════════
  {
    id: 'ls_disp_metar_01',
    slug: 'dispatcher-metar-ltba-wind',
    level: 'B2',
    target_role: 'dispatcher',
    category: 'metar_notam',
    audio_text: 'METAR Lima Tango Bravo Alpha, one two one four hundred zulu, two seven zero degrees, one five gust two five knots, visibility nine thousand nine hundred ninety nine, scattered clouds four thousand feet.',
    question_tr: 'Rüzgar yönü nedir?',
    question_en: 'What is the wind direction?',
    options: [
      { id: 'a', label_tr: '170°', label_en: '170°' },
      { id: 'b', label_tr: '270°', label_en: '270°' },
      { id: 'c', label_tr: '027°', label_en: '027°' },
      { id: 'd', label_tr: '027 KT', label_en: '027 KT' },
    ],
    correct_id: 'b',
    explanation_tr: 'METAR formatı: yön (3 hane) + hız + gust. "Two seven zero degrees" = 270° (batı rüzgarı). LTBA = Istanbul Atatürk.',
    explanation_en: 'METAR format: direction (3 digits) + speed + gust. "Two seven zero degrees" = 270° (westerly wind).',
  },
  {
    id: 'ls_disp_notam_01',
    slug: 'dispatcher-notam-runway-35l-closed',
    level: 'B2',
    target_role: 'dispatcher',
    category: 'metar_notam',
    audio_text: 'NOTAM Alpha one two three four, runway 35 Left closed for maintenance from 1200 zulu to 1800 zulu.',
    question_tr: 'Hangi pist kapalı?',
    question_en: 'Which runway is closed?',
    options: [
      { id: 'a', label_tr: '35 Right', label_en: '35 Right' },
      { id: 'b', label_tr: '17 Left', label_en: '17 Left' },
      { id: 'c', label_tr: '35 Left', label_en: '35 Left' },
      { id: 'd', label_tr: '34 Left', label_en: '34 Left' },
    ],
    correct_id: 'c',
    explanation_tr: '35L bakım nedeniyle 1200Z-1800Z arası kapalı. Dispatcher uçuş planında alternate runway 35R\'i öngörmeli.',
    explanation_en: 'Runway 35L closed for maintenance 1200Z-1800Z. Dispatcher should plan for alternate 35R.',
  },
];

/** Kategori kullanıcı dostu i18n key. */
export const CATEGORY_LABEL: Record<ListenSolveCategory, { tr: string; en: string }> = {
  atc_listen:    { tr: 'ATC Dinleme',          en: 'ATC Listen' },
  garbled_radio: { tr: 'Bozuk Telsiz',         en: 'Garbled Radio' },
  transcribe:    { tr: 'Yazıya Dök',           en: 'Transcribe' },
  pa_decode:     { tr: 'Kabin Anonsu',         en: 'Cabin PA' },
  snag_report:   { tr: 'Arıza Bildirimi',      en: 'Snag Report' },
  metar_notam:   { tr: 'METAR / NOTAM',        en: 'METAR / NOTAM' },
};
