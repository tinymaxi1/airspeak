/**
 * AirSpeak Sınav Kataloğu — 5 rol × Türkiye + uluslararası sınavlar
 *
 * Toplam 18 sınav (MVP):
 * - Pilot: 5 (ICAO 4 written, ICAO 4 oral, SHGM PEL English, YDS Havacılık, THY/Pegasus/Emirates Mülakat)
 * - Kabin: 4 (SHGM CCD, THY Kabin Mülakat, Pegasus Kabin, Emirates/Qatar Kabin)
 * - Teknisyen: 3 (EASA Part-66 English, AMM Reading Test, FAA A&P English)
 * - Yer Hizmetleri: 3 (IATA-IGOM English, IATA Customer Service, Ramp Safety English)
 * - Öğrenci: 3 (YDS Hazırlık, YKS Sonrası Havacılık, ICAO 4 Önizleme)
 *
 * Her sınav için tam yapı (sections, durations, questions) tanımlı.
 * Sample sorular var; gerçek üretimde SHGM/ÖSYM çıkmış sorulardan + Claude üretiminden 50-100 soru/sınav.
 */
import type { ExamDefinition } from './types';

export const EXAM_CATALOG: ExamDefinition[] = [
  // ═══════════════════════════════════════════════
  // PILOT (5)
  // ═══════════════════════════════════════════════
  {
    id: 'icao4_written_pilot',
    category: 'icao',
    organization: 'ICAO',
    titleTr: 'ICAO 4 Yazılı Sınav (Pilot)',
    titleEn: 'ICAO Level 4 Written Exam (Pilot)',
    descriptionTr:
      'Uluslararası uçuş için zorunlu. Pilot ve ATC için 6 alanda dil yeterliliği: telaffuz, yapı, kelime, akıcılık, anlama, etkileşim. Yazılı + sözlü iki bölüm.',
    descriptionEn:
      'Mandatory for international flight. Six skills assessed: pronunciation, structure, vocabulary, fluency, comprehension, interactions.',
    roles: ['pilot', 'student'],
    targetLevel: 'B2',
    totalDurationMinutes: 90,
    totalQuestions: 60,
    passingScorePercent: 70,
    sections: [
      { id: 'icao_w_voc', titleTr: 'Kelime (Pilot terminoloji)', titleEn: 'Vocabulary', format: 'written_mcq', durationMinutes: 20, questionCount: 20, weight: 25 },
      { id: 'icao_w_phr', titleTr: 'ICAO Frazeoloji', titleEn: 'ICAO Phraseology', format: 'written_mcq', durationMinutes: 20, questionCount: 15, weight: 25 },
      { id: 'icao_w_lis', titleTr: 'ATC Dinleme', titleEn: 'ATC Listening', format: 'listening', durationMinutes: 25, questionCount: 15, weight: 30 },
      { id: 'icao_w_read', titleTr: 'METAR/NOTAM Okuma', titleEn: 'NOTAM/METAR Reading', format: 'reading', durationMinutes: 25, questionCount: 10, weight: 20 },
    ],
    freePreviewCount: 5,
    isPremium: true,
    schedule: 'Yılda 4 kez (DGCA/SHGM yetkili merkezler)',
    officialUrl: 'https://www.icao.int',
    prestige: 5,
    badge: '✈️',
  },
  {
    id: 'icao4_oral_pilot',
    category: 'icao',
    organization: 'ICAO',
    titleTr: 'ICAO 4 Sözlü Sınav (Pilot AI Examiner)',
    titleEn: 'ICAO Level 4 Oral Exam (Pilot)',
    descriptionTr:
      '4 görev tipi: Picture description, Story telling, Problem solving, Common topics. AI examiner 6-alan rubric ile değerlendirir.',
    descriptionEn: 'Four tasks: picture, story, problem-solving, common topics. AI examiner with 6-skill rubric.',
    roles: ['pilot', 'student'],
    targetLevel: 'B2',
    totalDurationMinutes: 25,
    totalQuestions: 4,
    passingScorePercent: 70,
    sections: [
      { id: 'icao_o_pic', titleTr: 'Picture description', titleEn: 'Picture description', format: 'oral', durationMinutes: 5, questionCount: 1, weight: 25 },
      { id: 'icao_o_sto', titleTr: 'Story telling', titleEn: 'Story telling', format: 'oral', durationMinutes: 7, questionCount: 1, weight: 25 },
      { id: 'icao_o_pro', titleTr: 'Problem solving', titleEn: 'Problem solving', format: 'oral', durationMinutes: 7, questionCount: 1, weight: 25 },
      { id: 'icao_o_top', titleTr: 'Common topics', titleEn: 'Common topics', format: 'oral', durationMinutes: 6, questionCount: 1, weight: 25 },
    ],
    freePreviewCount: 1,
    isPremium: true,
    schedule: 'AI Examiner — istediğin zaman',
    prestige: 5,
    badge: '🎙️',
  },
  {
    id: 'shgm_pel_english',
    category: 'shgm',
    organization: 'SHGM',
    titleTr: 'SHGM PEL İngilizce Yeterlilik (Pilot)',
    titleEn: 'SHGM Pilot Licensing English',
    descriptionTr:
      'Sivil Havacılık Genel Müdürlüğü pilot lisansı için zorunlu İngilizce yeterlilik. ICAO 4 referanslı ama SHGM kendi soru havuzunu kullanır. Türkiye\'de uçacak her pilot için.',
    descriptionEn: 'Turkish DGCA mandatory English exam for pilot licensing.',
    roles: ['pilot', 'student'],
    targetLevel: 'B1',
    totalDurationMinutes: 60,
    totalQuestions: 40,
    passingScorePercent: 65,
    sections: [
      { id: 'shgm_p_voc', titleTr: 'Kelime + Frazeoloji', titleEn: 'Vocab + Phraseology', format: 'written_mcq', durationMinutes: 20, questionCount: 20, weight: 40 },
      { id: 'shgm_p_lis', titleTr: 'Türkiye ATC Dinleme', titleEn: 'TR ATC Listening', format: 'listening', durationMinutes: 20, questionCount: 10, weight: 30 },
      { id: 'shgm_p_read', titleTr: 'Operasyonel Doküman Okuma', titleEn: 'Ops Doc Reading', format: 'reading', durationMinutes: 20, questionCount: 10, weight: 30 },
    ],
    freePreviewCount: 5,
    isPremium: true,
    schedule: 'Ayda 1 (SHGM yetkili merkezler — Ankara, İstanbul)',
    officialUrl: 'https://web.shgm.gov.tr',
    prestige: 5,
    badge: '🇹🇷',
  },
  {
    id: 'yds_aviation',
    category: 'yds',
    organization: 'ÖSYM',
    titleTr: 'YDS / YÖKDİL Havacılık Hazırlık',
    titleEn: 'YDS / YÖKDİL Aviation Track',
    descriptionTr:
      'Yabancı Dil Sınavı + akademik YÖKDİL — havacılık alanında doktora, yüksek lisans, akademik kariyer için. Havacılık temalı pasajlar.',
    descriptionEn: 'Turkish national language exam, aviation-themed prep for academic careers.',
    roles: ['pilot', 'cabin', 'technician', 'ground', 'student'],
    targetLevel: 'B2',
    totalDurationMinutes: 180,
    totalQuestions: 80,
    passingScorePercent: 70,
    sections: [
      { id: 'yds_voc', titleTr: 'Kelime', titleEn: 'Vocabulary', format: 'written_mcq', durationMinutes: 30, questionCount: 12, weight: 15 },
      { id: 'yds_grm', titleTr: 'Gramer', titleEn: 'Grammar', format: 'written_mcq', durationMinutes: 30, questionCount: 12, weight: 15 },
      { id: 'yds_cls', titleTr: 'Cloze test', titleEn: 'Cloze test', format: 'written_mcq', durationMinutes: 25, questionCount: 10, weight: 15 },
      { id: 'yds_sen', titleTr: 'Sentence completion', titleEn: 'Sentence completion', format: 'written_mcq', durationMinutes: 25, questionCount: 10, weight: 15 },
      { id: 'yds_read', titleTr: 'Reading comprehension', titleEn: 'Reading', format: 'reading', durationMinutes: 70, questionCount: 36, weight: 40 },
    ],
    freePreviewCount: 10,
    isPremium: true,
    schedule: 'Yılda 2 kez (ÖSYM)',
    officialUrl: 'https://www.osym.gov.tr',
    prestige: 4,
    badge: '🎓',
  },
  {
    id: 'thy_pilot_interview',
    category: 'interview',
    organization: 'THY HR',
    titleTr: 'THY Pilot Mülakat Hazırlık',
    titleEn: 'Turkish Airlines Pilot Interview Prep',
    descriptionTr:
      'THY First Officer + Type Rating mülakatı için tam hazırlık. Ön görüşme + simülatör + İngilizce + teknik + grup egzersizi + HR. 100 sık soru bankası.',
    descriptionEn: 'THY pilot recruitment interview comprehensive prep.',
    roles: ['pilot', 'student'],
    targetLevel: 'B2',
    totalDurationMinutes: 120,
    totalQuestions: 100,
    passingScorePercent: 75,
    sections: [
      { id: 'thy_p_pre', titleTr: 'Ön görüşme + CV İngilizcesi', titleEn: 'CV & screening', format: 'mixed_interview', durationMinutes: 20, questionCount: 20, weight: 15 },
      { id: 'thy_p_tech', titleTr: 'Teknik bilgi (sistemler, frazeoloji)', titleEn: 'Technical', format: 'mixed_interview', durationMinutes: 30, questionCount: 25, weight: 30 },
      { id: 'thy_p_eng', titleTr: 'İngilizce yeterlilik', titleEn: 'English proficiency', format: 'oral', durationMinutes: 20, questionCount: 15, weight: 25 },
      { id: 'thy_p_hr', titleTr: 'HR + davranışsal', titleEn: 'HR & behavioral', format: 'mixed_interview', durationMinutes: 30, questionCount: 25, weight: 20 },
      { id: 'thy_p_grp', titleTr: 'Grup egzersizi', titleEn: 'Group exercise', format: 'mixed_interview', durationMinutes: 20, questionCount: 15, weight: 10 },
    ],
    freePreviewCount: 5,
    isPremium: true,
    prestige: 5,
    badge: '🇹🇷',
  },

  // ═══════════════════════════════════════════════
  // CABIN (4)
  // ═══════════════════════════════════════════════
  {
    id: 'shgm_ccd_english',
    category: 'shgm',
    organization: 'SHGM',
    titleTr: 'SHGM CCD İngilizce (Kabin)',
    titleEn: 'SHGM Cabin Crew Diploma English',
    descriptionTr:
      'Kabin Memuru Sertifikası için SHGM zorunlu İngilizce yeterlilik sınavı. PA anonsları, acil durum, yolcu iletişimi temalı. Türkiye\'de kabin memuru olmak için şart.',
    descriptionEn: 'SHGM mandatory English for cabin crew certification.',
    roles: ['cabin', 'student'],
    targetLevel: 'B1',
    totalDurationMinutes: 60,
    totalQuestions: 40,
    passingScorePercent: 65,
    sections: [
      { id: 'shgm_c_pa', titleTr: 'PA Anonsları', titleEn: 'PA announcements', format: 'listening', durationMinutes: 15, questionCount: 10, weight: 25 },
      { id: 'shgm_c_em', titleTr: 'Acil Durum İletişimi', titleEn: 'Emergency comms', format: 'mixed_interview', durationMinutes: 15, questionCount: 10, weight: 25 },
      { id: 'shgm_c_pax', titleTr: 'Yolcu Diyalogları', titleEn: 'Passenger dialogues', format: 'oral', durationMinutes: 15, questionCount: 10, weight: 25 },
      { id: 'shgm_c_doc', titleTr: 'Doküman Okuma', titleEn: 'Document reading', format: 'reading', durationMinutes: 15, questionCount: 10, weight: 25 },
    ],
    freePreviewCount: 5,
    isPremium: true,
    schedule: 'Ayda 1 (SHGM)',
    prestige: 5,
    badge: '🇹🇷',
  },
  {
    id: 'thy_cabin_interview',
    category: 'interview',
    organization: 'THY HR',
    titleTr: 'THY Kabin Memuru Mülakat',
    titleEn: 'THY Cabin Crew Interview',
    descriptionTr:
      'THY kabin memuru mülakatına hazırlık. İngilizce yeterlilik + grup mülakatı + bireysel + role-play. 80 soru bankası.',
    descriptionEn: 'Turkish Airlines cabin crew interview preparation.',
    roles: ['cabin', 'student'],
    targetLevel: 'B1',
    totalDurationMinutes: 90,
    totalQuestions: 80,
    passingScorePercent: 70,
    sections: [
      { id: 'thy_c_eng', titleTr: 'İngilizce konuşma', titleEn: 'English speaking', format: 'oral', durationMinutes: 20, questionCount: 15, weight: 30 },
      { id: 'thy_c_grp', titleTr: 'Grup mülakatı', titleEn: 'Group interview', format: 'mixed_interview', durationMinutes: 25, questionCount: 20, weight: 25 },
      { id: 'thy_c_rp', titleTr: 'Role-play (yolcu)', titleEn: 'Pax role-play', format: 'oral', durationMinutes: 20, questionCount: 20, weight: 25 },
      { id: 'thy_c_hr', titleTr: 'HR + motivasyon', titleEn: 'HR motivation', format: 'mixed_interview', durationMinutes: 25, questionCount: 25, weight: 20 },
    ],
    freePreviewCount: 5,
    isPremium: true,
    prestige: 5,
    badge: '🇹🇷',
  },
  {
    id: 'pegasus_cabin',
    category: 'interview',
    organization: 'Pegasus HR',
    titleTr: 'Pegasus Kabin Mülakat',
    titleEn: 'Pegasus Cabin Crew Interview',
    descriptionTr: 'Pegasus kabin mülakatı: İngilizce + grup + role-play + height/reach test pratikleri.',
    descriptionEn: 'Pegasus cabin crew interview prep.',
    roles: ['cabin', 'student'],
    targetLevel: 'B1',
    totalDurationMinutes: 60,
    totalQuestions: 50,
    passingScorePercent: 70,
    sections: [
      { id: 'peg_c_eng', titleTr: 'İngilizce', titleEn: 'English', format: 'oral', durationMinutes: 15, questionCount: 15, weight: 35 },
      { id: 'peg_c_grp', titleTr: 'Grup', titleEn: 'Group', format: 'mixed_interview', durationMinutes: 20, questionCount: 15, weight: 30 },
      { id: 'peg_c_rp', titleTr: 'Role-play', titleEn: 'Role-play', format: 'oral', durationMinutes: 25, questionCount: 20, weight: 35 },
    ],
    freePreviewCount: 3,
    isPremium: true,
    prestige: 4,
    badge: '🟡',
  },
  {
    id: 'emirates_qatar_cabin',
    category: 'interview',
    organization: 'Emirates / Qatar HR',
    titleTr: 'Emirates / Qatar Kabin Mülakat',
    titleEn: 'Emirates / Qatar Cabin Interview',
    descriptionTr: 'Open day + final interview + assessment center hazırlık. Tüm aşamalar İngilizce. Yurtdışı kabin kariyeri için.',
    descriptionEn: 'Gulf carrier cabin crew interview prep — open day + final + AC.',
    roles: ['cabin'],
    targetLevel: 'B2',
    totalDurationMinutes: 120,
    totalQuestions: 80,
    passingScorePercent: 75,
    sections: [
      { id: 'gulf_c_od', titleTr: 'Open Day + CV drop', titleEn: 'Open Day + CV', format: 'mixed_interview', durationMinutes: 20, questionCount: 15, weight: 15 },
      { id: 'gulf_c_grp', titleTr: 'Group + Article reading', titleEn: 'Group + Reading', format: 'mixed_interview', durationMinutes: 30, questionCount: 20, weight: 25 },
      { id: 'gulf_c_psy', titleTr: 'Psychometric', titleEn: 'Psychometric', format: 'written_mcq', durationMinutes: 30, questionCount: 25, weight: 30 },
      { id: 'gulf_c_fin', titleTr: 'Final 1-on-1', titleEn: 'Final interview', format: 'oral', durationMinutes: 40, questionCount: 20, weight: 30 },
    ],
    freePreviewCount: 3,
    isPremium: true,
    prestige: 5,
    badge: '🌍',
  },

  // ═══════════════════════════════════════════════
  // TECHNICIAN (3)
  // ═══════════════════════════════════════════════
  {
    id: 'easa_part66_english',
    category: 'easa',
    organization: 'EASA',
    titleTr: 'EASA Part-66 İngilizce (Teknisyen)',
    titleEn: 'EASA Part-66 English (Technician)',
    descriptionTr:
      'B1/B2 lisansı için Modül 9 (Human Factors) + Modül 10 (Aviation Legislation) İngilizce sorularına özel hazırlık. AMM, IPC, TSM dökümantasyon okuma ağırlıklı.',
    descriptionEn: 'EASA Part-66 license English questions: Modules 9, 10 + AMM/IPC reading.',
    roles: ['technician', 'student'],
    targetLevel: 'B1',
    totalDurationMinutes: 90,
    totalQuestions: 60,
    passingScorePercent: 75,
    sections: [
      { id: 'easa_t_voc', titleTr: 'Teknik kelime', titleEn: 'Technical vocab', format: 'written_mcq', durationMinutes: 25, questionCount: 20, weight: 30 },
      { id: 'easa_t_amm', titleTr: 'AMM/IPC Okuma', titleEn: 'AMM/IPC reading', format: 'reading', durationMinutes: 30, questionCount: 20, weight: 35 },
      { id: 'easa_t_hf', titleTr: 'Human Factors (Mod 9)', titleEn: 'Human Factors', format: 'written_mcq', durationMinutes: 20, questionCount: 12, weight: 20 },
      { id: 'easa_t_leg', titleTr: 'Mevzuat (Mod 10)', titleEn: 'Legislation', format: 'written_mcq', durationMinutes: 15, questionCount: 8, weight: 15 },
    ],
    freePreviewCount: 5,
    isPremium: true,
    schedule: 'Yılda 4 kez (EASA Part-147 yetkili merkezler)',
    officialUrl: 'https://www.easa.europa.eu',
    prestige: 5,
    badge: '🇪🇺',
  },
  {
    id: 'amm_reading_test',
    category: 'easa',
    organization: 'AirSpeak',
    titleTr: 'AMM Okuma Yeterlilik Testi',
    titleEn: 'AMM Reading Proficiency Test',
    descriptionTr:
      'Gerçek Boeing/Airbus AMM pasajları üzerinden okuma + komut anlama testi. Teknisyenin günlük iş gerçekliği.',
    descriptionEn: 'Real Boeing/Airbus AMM passage comprehension test.',
    roles: ['technician'],
    targetLevel: 'B1',
    totalDurationMinutes: 45,
    totalQuestions: 30,
    passingScorePercent: 70,
    sections: [
      { id: 'amm_b737', titleTr: 'B737 AMM pasajları', titleEn: 'B737 AMM', format: 'reading', durationMinutes: 15, questionCount: 10, weight: 35 },
      { id: 'amm_a320', titleTr: 'A320 AMM pasajları', titleEn: 'A320 AMM', format: 'reading', durationMinutes: 15, questionCount: 10, weight: 35 },
      { id: 'amm_tsm', titleTr: 'TSM (sorun giderme) okuma', titleEn: 'TSM reading', format: 'reading', durationMinutes: 15, questionCount: 10, weight: 30 },
    ],
    freePreviewCount: 3,
    isPremium: true,
    prestige: 4,
    badge: '🛠️',
  },
  {
    id: 'faa_ap_english',
    category: 'faa',
    organization: 'FAA',
    titleTr: 'FAA A&P İngilizce (Teknisyen)',
    titleEn: 'FAA A&P Mechanic English',
    descriptionTr:
      'FAA Airframe & Powerplant lisansına hazırlananlar için. Tüm sınav İngilizce — General + Airframe + Powerplant. ABD\'de çalışmak isteyenler için.',
    descriptionEn: 'FAA Airframe & Powerplant license English prep.',
    roles: ['technician'],
    targetLevel: 'B2',
    totalDurationMinutes: 120,
    totalQuestions: 80,
    passingScorePercent: 70,
    sections: [
      { id: 'faa_gen', titleTr: 'General (60 sorulu)', titleEn: 'General', format: 'written_mcq', durationMinutes: 40, questionCount: 30, weight: 35 },
      { id: 'faa_air', titleTr: 'Airframe', titleEn: 'Airframe', format: 'written_mcq', durationMinutes: 40, questionCount: 25, weight: 32 },
      { id: 'faa_pwr', titleTr: 'Powerplant', titleEn: 'Powerplant', format: 'written_mcq', durationMinutes: 40, questionCount: 25, weight: 33 },
    ],
    freePreviewCount: 5,
    isPremium: true,
    schedule: 'Sürekli (FAA-yetkili test merkezleri)',
    officialUrl: 'https://www.faa.gov',
    prestige: 5,
    badge: '🇺🇸',
  },

  // ═══════════════════════════════════════════════
  // GROUND SERVICES (3)
  // ═══════════════════════════════════════════════
  {
    id: 'iata_igom_english',
    category: 'iata',
    organization: 'IATA',
    titleTr: 'IATA IGOM İngilizce (Yer Hizmetleri)',
    titleEn: 'IATA Ground Operations Manual English',
    descriptionTr:
      'IATA Ground Ops Manual (IGOM) İngilizce yeterlilik. Pushback, marshalling, loading, headset comms odaklı. Tüm yer hizmetleri çalışanı için.',
    descriptionEn: 'IATA IGOM English proficiency for ground ops.',
    roles: ['ground', 'student'],
    targetLevel: 'B1',
    totalDurationMinutes: 60,
    totalQuestions: 40,
    passingScorePercent: 70,
    sections: [
      { id: 'iata_g_phr', titleTr: 'Ramp Frazeoloji', titleEn: 'Ramp phraseology', format: 'oral', durationMinutes: 15, questionCount: 10, weight: 30 },
      { id: 'iata_g_doc', titleTr: 'IGOM Dokümantasyon', titleEn: 'IGOM docs', format: 'reading', durationMinutes: 15, questionCount: 10, weight: 25 },
      { id: 'iata_g_em', titleTr: 'Acil Durum İletişim', titleEn: 'Emergency comms', format: 'listening', durationMinutes: 15, questionCount: 10, weight: 25 },
      { id: 'iata_g_voc', titleTr: 'Teknik Kelime', titleEn: 'Technical vocab', format: 'written_mcq', durationMinutes: 15, questionCount: 10, weight: 20 },
    ],
    freePreviewCount: 5,
    isPremium: true,
    schedule: 'IATA Training merkezlerinde',
    prestige: 4,
    badge: '🌐',
  },
  {
    id: 'iata_customer_service',
    category: 'iata',
    organization: 'IATA',
    titleTr: 'IATA Müşteri Hizmetleri İngilizce',
    titleEn: 'IATA Passenger Service English',
    descriptionTr:
      'Check-in, gate, transit, irrops senaryoları için müşteri iletişim İngilizcesi. Şikayet yönetimi, refund, rebooking diyalogları.',
    descriptionEn: 'Passenger service English: check-in, gate, IRROPS, complaints.',
    roles: ['ground', 'cabin'],
    targetLevel: 'B1',
    totalDurationMinutes: 60,
    totalQuestions: 50,
    passingScorePercent: 70,
    sections: [
      { id: 'iata_cs_chk', titleTr: 'Check-in dialogları', titleEn: 'Check-in dialogues', format: 'oral', durationMinutes: 15, questionCount: 15, weight: 30 },
      { id: 'iata_cs_irr', titleTr: 'IRROPS senaryoları', titleEn: 'IRROPS scenarios', format: 'mixed_interview', durationMinutes: 20, questionCount: 15, weight: 35 },
      { id: 'iata_cs_cmp', titleTr: 'Şikayet yönetimi', titleEn: 'Complaint handling', format: 'oral', durationMinutes: 15, questionCount: 10, weight: 20 },
      { id: 'iata_cs_doc', titleTr: 'Doküman okuma (PNR/eTicket)', titleEn: 'Doc reading', format: 'reading', durationMinutes: 10, questionCount: 10, weight: 15 },
    ],
    freePreviewCount: 5,
    isPremium: true,
    prestige: 4,
    badge: '💼',
  },
  {
    id: 'ramp_safety_english',
    category: 'iata',
    organization: 'AirSpeak',
    titleTr: 'Ramp Safety İngilizce',
    titleEn: 'Ramp Safety English',
    descriptionTr:
      'Yer hizmetleri güvenlik kuralları, GSE operasyonu, FOD walk, hot brake, fueling safety odaklı İngilizce yeterlilik.',
    descriptionEn: 'Ramp safety, GSE ops, FOD, fueling, hot brake English.',
    roles: ['ground'],
    targetLevel: 'A2',
    totalDurationMinutes: 30,
    totalQuestions: 25,
    passingScorePercent: 75,
    sections: [
      { id: 'ramp_voc', titleTr: 'Güvenlik kelime', titleEn: 'Safety vocab', format: 'written_mcq', durationMinutes: 15, questionCount: 15, weight: 60 },
      { id: 'ramp_em', titleTr: 'Acil Durum Komutları', titleEn: 'Emergency commands', format: 'oral', durationMinutes: 15, questionCount: 10, weight: 40 },
    ],
    freePreviewCount: 5,
    isPremium: false, // Ramp safety bedava — herkes açabilsin
    prestige: 3,
    badge: '🦺',
  },

  // ═══════════════════════════════════════════════
  // STUDENT (3) — havacılık öğrencileri için
  // ═══════════════════════════════════════════════
  {
    id: 'yds_general_prep',
    category: 'yds',
    organization: 'ÖSYM',
    titleTr: 'YDS Genel İngilizce (Havacılık Tema)',
    titleEn: 'YDS General English (Aviation themed)',
    descriptionTr:
      'YDS sınavı havacılık tema ağırlıklı hazırlık seti. Üniversite + akademik + sektör başlangıç için.',
    descriptionEn: 'YDS exam prep with aviation themes.',
    roles: ['student', 'pilot', 'cabin'],
    targetLevel: 'B1',
    totalDurationMinutes: 180,
    totalQuestions: 80,
    passingScorePercent: 70,
    sections: [
      { id: 'ydsg_voc', titleTr: 'Kelime', titleEn: 'Vocabulary', format: 'written_mcq', durationMinutes: 30, questionCount: 12, weight: 15 },
      { id: 'ydsg_grm', titleTr: 'Gramer', titleEn: 'Grammar', format: 'written_mcq', durationMinutes: 30, questionCount: 12, weight: 15 },
      { id: 'ydsg_cls', titleTr: 'Cloze', titleEn: 'Cloze', format: 'written_mcq', durationMinutes: 30, questionCount: 12, weight: 15 },
      { id: 'ydsg_sen', titleTr: 'Sentence completion', titleEn: 'Sentence completion', format: 'written_mcq', durationMinutes: 30, questionCount: 12, weight: 15 },
      { id: 'ydsg_read', titleTr: 'Reading', titleEn: 'Reading', format: 'reading', durationMinutes: 60, questionCount: 32, weight: 40 },
    ],
    freePreviewCount: 10,
    isPremium: true,
    schedule: 'Yılda 2 kez',
    prestige: 4,
    badge: '🎓',
  },
  {
    id: 'university_aviation_prep',
    category: 'university',
    organization: 'AirSpeak',
    titleTr: 'Havacılık Üniversite Hazırlık (YKS Sonrası)',
    titleEn: 'Aviation University Prep (after YKS)',
    descriptionTr:
      'Pilotaj, Havacılık Yönetimi, Uçak Teknolojisi bölümlerine başlayanlar için ilk yıl İngilizcesi hazırlık. Hava terimleri başlangıç + akademik konuşma.',
    descriptionEn: 'Aviation university preparation for first-year students.',
    roles: ['student'],
    targetLevel: 'A2',
    totalDurationMinutes: 60,
    totalQuestions: 50,
    passingScorePercent: 60,
    sections: [
      { id: 'uni_voc', titleTr: 'Temel kelime', titleEn: 'Basic vocab', format: 'written_mcq', durationMinutes: 15, questionCount: 15, weight: 25 },
      { id: 'uni_acad', titleTr: 'Akademik İngilizce', titleEn: 'Academic English', format: 'reading', durationMinutes: 20, questionCount: 15, weight: 30 },
      { id: 'uni_av', titleTr: 'Havacılık Giriş', titleEn: 'Aviation intro', format: 'written_mcq', durationMinutes: 15, questionCount: 10, weight: 25 },
      { id: 'uni_pres', titleTr: 'Sunum İngilizcesi', titleEn: 'Presentation', format: 'oral', durationMinutes: 10, questionCount: 10, weight: 20 },
    ],
    freePreviewCount: 10,
    isPremium: false, // Öğrencileri çekmek için bedava
    prestige: 3,
    badge: '📚',
  },
  {
    id: 'icao4_preview_student',
    category: 'icao',
    organization: 'ICAO',
    titleTr: 'ICAO 4 Önizleme (Öğrenci)',
    titleEn: 'ICAO 4 Preview (Student)',
    descriptionTr:
      'Pilot/ATC olmayı hedefleyen öğrenciler için ICAO 4 sınavının ne olduğunu gösteren tadımlık. 20 soruluk hızlı geçiş — gerçek seviyeyi pilot rolünde gör.',
    descriptionEn: 'ICAO 4 preview for aspiring pilots/ATCs — taste before pilot path.',
    roles: ['student'],
    targetLevel: 'A2',
    totalDurationMinutes: 30,
    totalQuestions: 20,
    passingScorePercent: 60,
    sections: [
      { id: 'icao_pre_voc', titleTr: 'Havacılık Kelime Tadımlık', titleEn: 'Vocab taste', format: 'written_mcq', durationMinutes: 15, questionCount: 10, weight: 50 },
      { id: 'icao_pre_phr', titleTr: 'Frazeoloji Önizleme', titleEn: 'Phraseology preview', format: 'listening', durationMinutes: 15, questionCount: 10, weight: 50 },
    ],
    freePreviewCount: 20, // Tüm sınav free
    isPremium: false,
    prestige: 3,
    badge: '🎯',
  },
];

/**
 * Bir rolün tüm sınavlarını getir (free + premium karışık).
 */
export function getExamsForRole(role: string | null | undefined): ExamDefinition[] {
  if (!role) return EXAM_CATALOG;
  return EXAM_CATALOG.filter((e) => e.roles.includes(role as never));
}

/**
 * Sınavları kategori bazında grupla.
 */
export function getExamsByCategory(role: string | null | undefined) {
  const exams = getExamsForRole(role);
  const groups: Record<string, ExamDefinition[]> = {};
  for (const e of exams) {
    if (!groups[e.category]) groups[e.category] = [];
    groups[e.category]!.push(e);
  }
  return groups;
}

export const EXAM_CATEGORY_LABELS: Record<string, { tr: string; emoji: string }> = {
  icao: { tr: 'ICAO Uluslararası', emoji: '✈️' },
  shgm: { tr: 'SHGM Türkiye', emoji: '🇹🇷' },
  yds: { tr: 'YDS / YÖKDİL Akademik', emoji: '🎓' },
  easa: { tr: 'EASA Avrupa', emoji: '🇪🇺' },
  faa: { tr: 'FAA Amerika', emoji: '🇺🇸' },
  iata: { tr: 'IATA Mesleki', emoji: '🌐' },
  interview: { tr: 'Havayolu Mülakatları', emoji: '💼' },
  university: { tr: 'Üniversite Hazırlık', emoji: '📚' },
};
