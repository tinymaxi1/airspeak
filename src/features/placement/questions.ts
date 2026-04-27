/**
 * Placement test soruları — A1'den C1'e progression.
 * 10 soru, ~3 dakika. Sonuçlar onboarding store'a yazılır.
 *
 * Rol-bazlı: Her sorunun "roles" alanı var. Kullanıcının rolüne uygun
 * sorulardan 10 tanesi seçilir (her seviyeden temsil + role-spesifik karışım).
 *
 * Gerçek üretimde 100+ soruluk havuzdan adaptive seçim yapılır (Sprint 9).
 */
import type { Level, UserRole } from '@/types/profile';

export type Category =
  | 'vocabulary'
  | 'listening'
  | 'phraseology'
  | 'grammar'
  | 'reading'
  | 'critical';

export interface PlacementQuestion {
  id: string;
  level: Level;
  category: Category;
  /** Hangi rollere uygun. 'all' tüm rollere ortak. */
  roles: (UserRole | 'all')[];
  question: string;
  context?: string;
  options: { id: string; text: string }[];
  correctId: string;
  explanationTr: string;
  icaoReference?: string;
}

export const PLACEMENT_QUESTIONS: PlacementQuestion[] = [
  {
    id: 'p1',
    level: 'A1',
    category: 'vocabulary',
    roles: ['all'],
    question: 'In aviation, what is a "runway"?',
    options: [
      { id: 'a', text: 'A restaurant in the airport' },
      { id: 'b', text: 'A strip where aircraft take off and land' },
      { id: 'c', text: 'The pilot\'s seat' },
      { id: 'd', text: 'A type of airplane' },
    ],
    correctId: 'b',
    explanationTr: 'Runway = pist. Uçakların kalkıp indiği uzun şeritli alan.',
  },
  {
    id: 'p2',
    level: 'A1',
    category: 'vocabulary',
    roles: ['all'],
    question: 'Cabin crew says: "Please ___ your seatbelt."',
    options: [
      { id: 'a', text: 'open' },
      { id: 'b', text: 'fasten' },
      { id: 'c', text: 'buy' },
      { id: 'd', text: 'eat' },
    ],
    correctId: 'b',
    explanationTr: '"Fasten" = bağla, kemerini bağla. Uçaklarda standart anons.',
  },
  {
    id: 'p3',
    level: 'A2',
    category: 'phraseology',
    roles: ['all'],
    question: 'What does "cleared for takeoff" mean?',
    options: [
      { id: 'a', text: 'Engine has been cleaned' },
      { id: 'b', text: 'Permission to take off has been granted' },
      { id: 'c', text: 'Runway is empty' },
      { id: 'd', text: 'Flight is cancelled' },
    ],
    correctId: 'b',
    explanationTr:
      '"Cleared for takeoff" = kalkış izni verildi. ATC tarafından pilota verilen standart izin.',
    icaoReference: 'ICAO Doc 9432',
  },
  {
    id: 'p4',
    level: 'A2',
    category: 'listening',
    roles: ['all'],
    question: 'ATC says: "Turkish 1234, contact tower 118.1." What frequency should the pilot use?',
    context: '🎧 Sesli soru olacak (Sprint 5 ses entegrasyonu sonra)',
    options: [
      { id: 'a', text: '1234' },
      { id: 'b', text: '12.34' },
      { id: 'c', text: '118.1' },
      { id: 'd', text: '11.81' },
    ],
    correctId: 'c',
    explanationTr:
      'ATC frekans değişimi belirtiyor. "Tower 118.1" = kule frekansı 118.1 MHz.',
  },
  {
    id: 'p5',
    level: 'B1',
    category: 'reading',
    roles: ['all'],
    question: 'NOTAM excerpt: "RWY 27 CLSD DUE WIP UFN" — what does this mean?',
    options: [
      { id: 'a', text: 'Runway 27 is open' },
      { id: 'b', text: 'Runway 27 is closed due to work in progress, until further notice' },
      { id: 'c', text: 'Wind is 27 knots' },
      { id: 'd', text: 'Visibility 27 miles' },
    ],
    correctId: 'b',
    explanationTr:
      'CLSD = closed (kapalı), WIP = work in progress (çalışma var), UFN = until further notice (yeni bildirime kadar).',
  },
  {
    id: 'p6',
    level: 'B1',
    category: 'grammar',
    roles: ['all'],
    question: 'Choose the correct form: "If the engine ___, we will declare an emergency."',
    options: [
      { id: 'a', text: 'fail' },
      { id: 'b', text: 'fails' },
      { id: 'c', text: 'failing' },
      { id: 'd', text: 'will fail' },
    ],
    correctId: 'b',
    explanationTr:
      'Birinci şart cümlesi (first conditional): If + present simple, will + verb. "Engine" tekil, "fails".',
  },
  {
    id: 'p7',
    level: 'B2',
    category: 'vocabulary',
    roles: ['all'],
    question: 'What is the difference between "stall" and "spin"?',
    options: [
      { id: 'a', text: 'They mean the same' },
      { id: 'b', text: 'Stall: loss of lift; Spin: autorotation after stall' },
      { id: 'c', text: 'Stall: engine failure; Spin: rapid descent' },
      { id: 'd', text: 'Both are landing maneuvers' },
    ],
    correctId: 'b',
    explanationTr:
      'Stall = kanadın kaldırma kuvveti kaybı (saldırı açısı çok yüksek). Spin = stall sonrası kontrolsüz dönerek alçalma. Farklı durumlar, ardışık olabilir.',
  },
  {
    id: 'p8',
    level: 'B2',
    category: 'phraseology',
    roles: ['all'],
    question: 'Which is the **correct** ICAO standard phraseology?',
    options: [
      { id: 'a', text: '"We\'re ready to go"' },
      { id: 'b', text: '"Ready for departure"' },
      { id: 'c', text: '"Let\'s take off now"' },
      { id: 'd', text: '"Send us up"' },
    ],
    correctId: 'b',
    explanationTr:
      'ICAO standart frazeolojisinde "ready for departure" doğrudur. Diğerleri günlük İngilizce, ATC iletişiminde kullanılmaz.',
    icaoReference: 'ICAO Doc 9432',
  },
  {
    id: 'p9',
    level: 'C1',
    category: 'critical',
    roles: ['all'],
    question: 'Why is the word "MAYDAY" repeated three times during emergencies?',
    options: [
      { id: 'a', text: 'Tradition only' },
      { id: 'b', text: 'To ensure clarity over noisy radio + claim priority traffic' },
      { id: 'c', text: 'ICAO law mandates it' },
      { id: 'd', text: 'For dramatic effect' },
    ],
    correctId: 'b',
    explanationTr:
      'Üç kez tekrar: 1) Radyo paraziti durumunda anlaşılma garantisi 2) Diğer trafiğin durmasını ve frekansı boşaltmasını sağlar 3) Acil durum kesinliği bildirir.',
    icaoReference: 'ICAO Annex 10',
  },
  {
    id: 'p10',
    level: 'C1',
    category: 'vocabulary',
    roles: ['all'],
    question: 'In airworthiness, what is the difference between AD and SB?',
    options: [
      { id: 'a', text: 'They are the same' },
      { id: 'b', text: 'AD: mandatory regulation; SB: manufacturer recommendation' },
      { id: 'c', text: 'AD: airline-issued; SB: state-issued' },
      { id: 'd', text: 'Both are optional' },
    ],
    correctId: 'b',
    explanationTr:
      'AD (Airworthiness Directive) = havayolu otoritesi tarafından yayımlanan **zorunlu** düzeltme. SB (Service Bulletin) = üretici tarafından yayımlanan **tavsiye** (genelde, AD ile zorunlu hale gelmedikçe).',
    icaoReference: 'EASA Part-M',
  },

  // ===== PILOT-SPECIFIC =====
  {
    id: 'p_pilot_1', level: 'A1', category: 'vocabulary', roles: ['pilot'],
    question: 'In the cockpit, what does the pilot use to control pitch and roll?',
    options: [
      { id: 'a', text: 'Throttle' },
      { id: 'b', text: 'Yoke (or side-stick)' },
      { id: 'c', text: 'Brakes' },
      { id: 'd', text: 'Trim wheel' },
    ],
    correctId: 'b',
    explanationTr: 'Yoke veya side-stick = pilotun pitch (burun aşağı/yukarı) ve roll (yatış) kontrolü için kullandığı ana komuta.',
  },
  {
    id: 'p_pilot_2', level: 'B1', category: 'phraseology', roles: ['pilot'],
    question: 'ATC: "Turkish 1234, climb FL 350, expedite through FL 200." What must the pilot do?',
    options: [
      { id: 'a', text: 'Climb to 35,000 ft, descend slowly through 20,000 ft' },
      { id: 'b', text: 'Climb to FL350 with maximum rate while passing FL200' },
      { id: 'c', text: 'Stop climb at FL200' },
      { id: 'd', text: 'Maintain FL350 then descend to FL200' },
    ],
    correctId: 'b',
    explanationTr: '"Expedite through FL200" = FL200\'ü geçerken maksimum dikey hız ile devam et. Trafik ayırma için sık talep.',
    icaoReference: 'ICAO Doc 9432',
  },
  {
    id: 'p_pilot_3', level: 'B2', category: 'critical', roles: ['pilot'],
    question: 'During approach, you encounter "windshear, go around". What is your immediate action?',
    options: [
      { id: 'a', text: 'Continue approach to land quickly' },
      { id: 'b', text: 'Maximum thrust, pitch up to recover, climb away' },
      { id: 'c', text: 'Lower flaps and gear' },
      { id: 'd', text: 'Declare emergency only' },
    ],
    correctId: 'b',
    explanationTr: 'Windshear escape = TOGA thrust, pitch attitude 15° up (FBW maneuvers via stick), do NOT change config (gear/flap stays). Recovery first, ATC sonra.',
    icaoReference: 'ICAO Doc 9817',
  },
  {
    id: 'p_pilot_4', level: 'C1', category: 'vocabulary', roles: ['pilot'],
    question: 'What does ETOPS 180 mean?',
    options: [
      { id: 'a', text: 'Engine thrust at 180% maximum' },
      { id: 'b', text: 'Twin-engine ops up to 180 minutes from suitable alternate' },
      { id: 'c', text: 'Maximum 180 passengers' },
      { id: 'd', text: 'Estimated time over polar 180 NM' },
    ],
    correctId: 'b',
    explanationTr: 'ETOPS = Extended Twin Operations. ETOPS 180 = uygun alternatiften en fazla 180 dk uzakta uçma yetkisi (single engine cruise hızında).',
  },

  // ===== CABIN-SPECIFIC =====
  {
    id: 'p_cabin_1', level: 'A1', category: 'vocabulary', roles: ['cabin'],
    question: 'During boarding, what does "stowage" refer to?',
    options: [
      { id: 'a', text: 'Free seat' },
      { id: 'b', text: 'Storage area for luggage (overhead bin, under seat)' },
      { id: 'c', text: 'Refreshment cart' },
      { id: 'd', text: 'Emergency exit' },
    ],
    correctId: 'b',
    explanationTr: 'Stowage = depolama. Yolcuların kabin bagajı için overhead bin ve koltuk altı alanlar.',
  },
  {
    id: 'p_cabin_2', level: 'A2', category: 'phraseology', roles: ['cabin'],
    question: 'When is "doors armed and cross-checked" announced?',
    options: [
      { id: 'a', text: 'After landing' },
      { id: 'b', text: 'Before pushback / departure' },
      { id: 'c', text: 'During cruise' },
      { id: 'd', text: 'In emergencies only' },
    ],
    correctId: 'b',
    explanationTr: 'Pushback öncesi tüm kapı modu "armed" (acil durumda slide otomatik açılır). Cross-check = kapı eşleri birbirini doğrular.',
  },
  {
    id: 'p_cabin_3', level: 'B1', category: 'critical', roles: ['cabin'],
    question: 'Passenger refuses to fasten seatbelt during turbulence. What\'s your priority response?',
    options: [
      { id: 'a', text: 'Ignore — it\'s their choice' },
      { id: 'b', text: 'Calmly explain safety reason, document if persistent, inform purser' },
      { id: 'c', text: 'Force them physically' },
      { id: 'd', text: 'Land the plane' },
    ],
    correctId: 'b',
    explanationTr: 'Önce sakin açıklama (yasal zorunluluk + güvenlik). Israr ederse purser\'a bildir, gerekirse unruly passenger raporu doldur.',
  },
  {
    id: 'p_cabin_4', level: 'C1', category: 'vocabulary', roles: ['cabin'],
    question: 'What is a "PED" in cabin operations?',
    options: [
      { id: 'a', text: 'Passenger Emergency Drill' },
      { id: 'b', text: 'Personal Electronic Device (phone, tablet, laptop)' },
      { id: 'c', text: 'Pre-flight Equipment Display' },
      { id: 'd', text: 'Pilot Equipment Door' },
    ],
    correctId: 'b',
    explanationTr: 'PED = Personal Electronic Device. Kabinde uçuş aşamasına göre kullanım kuralları (T-PED, U-PED) düzenlenir.',
  },

  // ===== TECHNICIAN-SPECIFIC =====
  {
    id: 'p_tech_1', level: 'A1', category: 'vocabulary', roles: ['technician'],
    question: 'A "torque wrench" is used to:',
    options: [
      { id: 'a', text: 'Cut metal' },
      { id: 'b', text: 'Tighten fasteners to a specific force value' },
      { id: 'c', text: 'Measure voltage' },
      { id: 'd', text: 'Paint surfaces' },
    ],
    correctId: 'b',
    explanationTr: 'Torque wrench = tork anahtarı. AMM\'de belirtilen tam tork değerinde cıvata sıkmak için kullanılır.',
  },
  {
    id: 'p_tech_2', level: 'A2', category: 'reading', roles: ['technician'],
    question: 'AMM task says "Reference IPC Fig. 32-11-01 Item 5". Where do you look?',
    options: [
      { id: 'a', text: 'Engine manual page 32' },
      { id: 'b', text: 'Illustrated Parts Catalog, ATA chapter 32 (landing gear), figure 11-01, item 5' },
      { id: 'c', text: 'Wiring diagram 32' },
      { id: 'd', text: 'Service Bulletin 32' },
    ],
    correctId: 'b',
    explanationTr: 'IPC = Illustrated Parts Catalog. ATA 32 = landing gear. Figure-Item formatı ile parça lokasyonu.',
  },
  {
    id: 'p_tech_3', level: 'B1', category: 'critical', roles: ['technician'],
    question: 'You find a crack on a wing skin during inspection. What\'s the correct sequence?',
    options: [
      { id: 'a', text: 'Repair it immediately, then document' },
      { id: 'b', text: 'Document defect, consult SRM/AMM for damage limits, raise EO/work card, perform approved repair, sign CRS' },
      { id: 'c', text: 'Ignore if small' },
      { id: 'd', text: 'Ground the aircraft permanently' },
    ],
    correctId: 'b',
    explanationTr: 'Yapısal hasarda doğru sıra: doc → SRM kontrolü → engineering order → onaylı tamir → CRS imzası. Belgesiz tamir yasak.',
  },
  {
    id: 'p_tech_4', level: 'C1', category: 'vocabulary', roles: ['technician'],
    question: 'In NDT, what does "phased array UT" detect best?',
    options: [
      { id: 'a', text: 'Surface paint defects' },
      { id: 'b', text: 'Subsurface defects in thick composite/metal structures' },
      { id: 'c', text: 'Electrical faults' },
      { id: 'd', text: 'Engine vibration' },
    ],
    correctId: 'b',
    explanationTr: 'Phased Array Ultrasonic Testing = çok elementli prob ile derin/karmaşık yapılarda iç hasar tespiti. Modern kompozit yapılar için standart.',
  },

  // ===== GROUND-SPECIFIC =====
  {
    id: 'p_ground_1', level: 'A1', category: 'vocabulary', roles: ['ground'],
    question: 'A "GPU" on the ramp is:',
    options: [
      { id: 'a', text: 'Ground Power Unit (provides electricity to parked aircraft)' },
      { id: 'b', text: 'Gate Pass User' },
      { id: 'c', text: 'Graphics Processing Unit' },
      { id: 'd', text: 'General Purpose Uniform' },
    ],
    correctId: 'a',
    explanationTr: 'GPU = Ground Power Unit. APU yerine yerden 115V 400Hz AC sağlar (gate\'te yakıt tasarrufu).',
  },
  {
    id: 'p_ground_2', level: 'A2', category: 'phraseology', roles: ['ground'],
    question: 'Pushback procedure: pilot says "Brakes released, ready for pushback". You reply:',
    options: [
      { id: 'a', text: '"Goodbye"' },
      { id: 'b', text: '"Roger, releasing brakes, commencing pushback, nose left/right"' },
      { id: 'c', text: '"Wait"' },
      { id: 'd', text: '"Engine start approved"' },
    ],
    correctId: 'b',
    explanationTr: 'Headset operatörü standart cevap: brake durumunu doğrula, push yönünü teyit et, hareketi başlat.',
  },
  {
    id: 'p_ground_3', level: 'B1', category: 'critical', roles: ['ground'],
    question: 'Aircraft arriving with hot brakes (hot brake light). Your action?',
    options: [
      { id: 'a', text: 'Chock immediately and connect GPU' },
      { id: 'b', text: 'Maintain safe distance, wait for cooling, no chocks until cleared, watch for fire risk' },
      { id: 'c', text: 'Spray water on brakes' },
      { id: 'd', text: 'Tow aircraft to maintenance' },
    ],
    correctId: 'b',
    explanationTr: 'Hot brakes = patlama / yangın riski. Önce min mesafe (200ft) + ekibi uzaklaştır + soğumayı bekle. Su KULLANMA (termal şok).',
  },
  {
    id: 'p_ground_4', level: 'C1', category: 'vocabulary', roles: ['ground'],
    question: 'ISAGO is:',
    options: [
      { id: 'a', text: 'A type of catering trolley' },
      { id: 'b', text: 'IATA Safety Audit for Ground Operations — global standard' },
      { id: 'c', text: 'International Slot Allocation Guideline Office' },
      { id: 'd', text: 'Iberian Ground Operations' },
    ],
    correctId: 'b',
    explanationTr: 'ISAGO = IATA\'nın yer hizmetleri için zorunlu güvenlik denetim programı. 24 ayda 1 yenileme. GHA\'lar için sektör standardı.',
  },

  // ===== STUDENT-SPECIFIC =====
  {
    id: 'p_student_1', level: 'A1', category: 'vocabulary', roles: ['student'],
    question: 'A "captain" in commercial aviation is:',
    options: [
      { id: 'a', text: 'A passenger seat' },
      { id: 'b', text: 'Pilot in Command (PIC) — final authority on the flight' },
      { id: 'c', text: 'Air traffic controller' },
      { id: 'd', text: 'Flight attendant supervisor' },
    ],
    correctId: 'b',
    explanationTr: 'Captain = Kaptan = Pilot in Command. Uçuşun nihai komuta yetkisi, sol koltuk.',
  },
  {
    id: 'p_student_2', level: 'A2', category: 'reading', roles: ['student'],
    question: 'To become an airline pilot, you typically need:',
    options: [
      { id: 'a', text: 'Only a high school diploma' },
      { id: 'b', text: 'CPL/IR + ATPL theory + type rating + minimum hours; ICAO 4 English' },
      { id: 'c', text: 'A driving license' },
      { id: 'd', text: 'Cabin crew experience only' },
    ],
    correctId: 'b',
    explanationTr: 'Tipik yol: ATPL teori → CPL pratik → IR (aletli uçuş) → MCC → tip yetkisi. Minimum saat (Türkiye 200, ICAO 250). ICAO 4 zorunlu.',
  },
  {
    id: 'p_student_3', level: 'B1', category: 'critical', roles: ['student'],
    question: 'Why is ICAO Level 4 English mandatory for pilots and ATCs?',
    options: [
      { id: 'a', text: 'For passenger entertainment' },
      { id: 'b', text: 'To ensure clear communication in non-routine/emergency situations across borders' },
      { id: 'c', text: 'Required by UNESCO' },
      { id: 'd', text: 'Optional, just a preference' },
    ],
    correctId: 'b',
    explanationTr: 'ICAO 4 = Operasyonel İngilizce. Standart frazeoloji yetmediğinde plain English ile anlaşma garantisi → uluslararası güvenlik.',
    icaoReference: 'ICAO Annex 1',
  },
  {
    id: 'p_student_4', level: 'C1', category: 'vocabulary', roles: ['student'],
    question: 'What does "CRM" mean in pilot training?',
    options: [
      { id: 'a', text: 'Customer Relationship Management' },
      { id: 'b', text: 'Crew Resource Management — leadership, communication, decision-making in cockpit' },
      { id: 'c', text: 'Cabin Reset Mode' },
      { id: 'd', text: 'Continuous Radio Monitoring' },
    ],
    correctId: 'b',
    explanationTr: 'CRM = Crew Resource Management. Kokpit/kabin ekibinin etkin liderlik, durum farkındalığı, karar verme ve iletişim becerilerini geliştiren disiplin.',
  },
];

/**
 * Kullanıcının rolüne göre 10 soruluk placement seti seç.
 *
 * Strateji:
 * - 6 ortak (her seviyeden temsil)
 * - 4 rol-spesifik (rol seçilmişse — A1, A2/B1, B1/B2, C1)
 * - Rol seçilmemişse 10 ortak fallback
 *
 * @param role Kullanıcının seçtiği rol
 * @returns 10 soruluk düzenli set (A1→C1 sıralı)
 */
export function getQuestionsForRole(
  role: UserRole | null | undefined,
): PlacementQuestion[] {
  if (!role) {
    return PLACEMENT_QUESTIONS.filter((q) => q.roles.includes('all'));
  }
  const common = PLACEMENT_QUESTIONS.filter((q) => q.roles.includes('all'));
  const roleSpecific = PLACEMENT_QUESTIONS.filter((q) => q.roles.includes(role));

  // 6 ortaktan al (A1-A2-B1-B1-B2-C1 dengeli) + 4 rol-spesifik
  const commonPicked: PlacementQuestion[] = [];
  const targetCommon: Level[] = ['A1', 'A2', 'A2', 'B1', 'B2', 'C1'];
  for (const lvl of targetCommon) {
    const candidate = common.find((q) => q.level === lvl && !commonPicked.includes(q));
    if (candidate) commonPicked.push(candidate);
  }

  const all = [...commonPicked, ...roleSpecific];
  // Sıralı: A1 → A2 → B1 → B2 → C1
  const order: Record<Level, number> = { A1: 0, A2: 1, B1: 2, B2: 3, C1: 4 };
  all.sort((a, b) => order[a.level] - order[b.level]);
  return all.slice(0, 10);
}

/**
 * Sonuçtan seviye hesapla.
 * Her seviye için ağırlıklı puan, en yüksek olan seviye seçilir.
 *
 * @param answers Kullanıcı cevapları
 * @param questionPool Hangi sorulara karşılık (default: tüm havuz; rol bazlı kullanım için filtreli set geçilir)
 */
export function calculateLevel(
  answers: { questionId: string; selectedId: string }[],
  questionPool: PlacementQuestion[] = PLACEMENT_QUESTIONS,
): PlacementQuestion['level'] {
  let correctByLevel = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0 };
  const totalByLevel = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0 };

  for (const q of questionPool) {
    totalByLevel[q.level] += 1;
    const answer = answers.find((a) => a.questionId === q.id);
    if (answer && answer.selectedId === q.correctId) {
      correctByLevel[q.level] += 1;
    }
  }

  // Algorithm: en yüksek seviyede en az 1 doğru → o seviye
  // Çoğu C1 doğru → C1, çoğu B2 doğru → B2, vs.
  if (correctByLevel.C1 >= 1) return 'C1';
  if (correctByLevel.B2 === totalByLevel.B2) return 'C1';
  if (correctByLevel.B2 >= 1) return 'B2';
  if (correctByLevel.B1 === totalByLevel.B1) return 'B2';
  if (correctByLevel.B1 >= 1) return 'B1';
  if (correctByLevel.A2 === totalByLevel.A2) return 'B1';
  if (correctByLevel.A2 >= 1) return 'A2';
  return 'A1';
}

export function calculateScores(
  answers: { questionId: string; selectedId: string }[],
  questionPool: PlacementQuestion[] = PLACEMENT_QUESTIONS,
): {
  total: number;
  byCategory: Record<Category, number>;
} {
  const correctByCategory: Record<Category, number> = {
    vocabulary: 0,
    listening: 0,
    phraseology: 0,
    grammar: 0,
    reading: 0,
    critical: 0,
  };
  const totalByCategory: Record<Category, number> = {
    vocabulary: 0,
    listening: 0,
    phraseology: 0,
    grammar: 0,
    reading: 0,
    critical: 0,
  };

  for (const q of questionPool) {
    totalByCategory[q.category] += 1;
    const answer = answers.find((a) => a.questionId === q.id);
    if (answer && answer.selectedId === q.correctId) {
      correctByCategory[q.category] += 1;
    }
  }

  const byCategory: Record<Category, number> = {
    vocabulary: 0,
    listening: 0,
    phraseology: 0,
    grammar: 0,
    reading: 0,
    critical: 0,
  };

  for (const cat of Object.keys(byCategory) as Category[]) {
    byCategory[cat] = totalByCategory[cat] > 0
      ? Math.round((correctByCategory[cat] / totalByCategory[cat]) * 100)
      : 0;
  }

  const totalCorrect = Object.values(correctByCategory).reduce((a, b) => a + b, 0);
  const total = Math.round((totalCorrect / questionPool.length) * 100);

  return { total, byCategory };
}
