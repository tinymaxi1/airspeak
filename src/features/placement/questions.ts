/**
 * Placement test soruları — 4-boyutlu seviye ölçümü.
 *
 * Boyutlar:
 * - generalEnglish: CEFR (A1-C1) genel İngilizce — havacılık DIŞI
 * - aviationEnglish: rol bazlı havacılık DİL yeterliliği (jargon, dökümantasyon)
 * - aviationKnowledge: rol bazlı OPERASYONEL bilgi (prosedür, regülasyon)
 * - communication: sözlü/mülakat/senaryo
 *
 * Toplam 22 soru hedefi. Rol bazlı seçim: getQuestionsForSegment().
 */
import type {
  Level,
  UserRole,
  DimensionResult,
  Recommendations,
  ProficiencyTier,
} from '@/types/profile';

export type Category =
  | 'vocabulary'
  | 'listening'
  | 'phraseology'
  | 'grammar'
  | 'reading'
  | 'critical';

export type Dimension =
  | 'generalEnglish'
  | 'aviationEnglish'
  | 'aviationKnowledge'
  | 'communication';

export type QuestionFormat = 'short' | 'passage' | 'scenario';

export interface PlacementQuestion {
  id: string;
  level: Level;
  category: Category;
  /** Hangi boyutta ölçüyor */
  dimension: Dimension;
  /** Format: kısa pratik, uzun pasaj, senaryo */
  format: QuestionFormat;
  /** Hangi rollere uygun. 'all' tüm rollere ortak. */
  roles: (UserRole | 'all')[];
  /** Soru — İngilizce (seviyeyi test etmek için EN olmalı) */
  question: string;
  /** TR ipucu — A1/A2 kullanıcı soruyu anlayamasın diye küçük altta gösterilir */
  questionTr?: string;
  context?: string;
  options: { id: string; text: string }[];
  correctId: string;
  /** Kısa açıklama — feedback ekranında gösterilir */
  explanationTr: string;
  /** Uzun öğretici açıklama — "Daha fazla oku" expand içinde 300-500 kelime */
  explanationLongTr?: string;
  icaoReference?: string;
}

export const PLACEMENT_QUESTIONS: PlacementQuestion[] = [
  {
    id: 'p1',
    dimension: 'aviationEnglish',
    format: 'short',
    level: 'A1',
    category: 'vocabulary',
    roles: ['all'],
    question: 'In aviation, what is a "runway"?',
    questionTr: '✈️ "Runway" havacılıkta ne demektir?',
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
    dimension: 'aviationEnglish',
    format: 'short',
    level: 'A1',
    category: 'vocabulary',
    roles: ['all'],
    question: 'Cabin crew says: "Please ___ your seatbelt."',
    questionTr: '✈️ Boşluğa hangi kelime gelir? Kabin memuru "Lütfen ___" diyor.',
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
    dimension: 'aviationEnglish',
    format: 'short',
    level: 'A2',
    category: 'phraseology',
    roles: ['all'],
    question: 'What does "cleared for takeoff" mean?',
    questionTr: '✈️ "Cleared for takeoff" ne demek?',
    options: [
      { id: 'a', text: 'Engine has been cleaned' },
      { id: 'b', text: 'Permission to take off has been granted' },
      { id: 'c', text: 'Runway is empty' },
      { id: 'd', text: 'Flight is cancelled' },
    ],
    correctId: 'b',
    explanationTr:
      '"Cleared for takeoff" = kalkış izni verildi. ATC tarafından pilota verilen standart izin.',
    explanationLongTr: `**Doğru cevap özeti**: "Cleared for takeoff" = pilota kalkış için açık izin verildi anlamına gelir. Bu, kule kontrolörünün (Tower) verdiği son ve en kritik izindir.

**Neden bu cevap?**: ICAO Doc 9432 (Manual of Radiotelephony) standart havacılık iletişimini düzenler. "Cleared for [eylem]" yapısı, ATC'nin bir hareketi onayladığını net bir şekilde belirtir. Bu kalıp uluslararası standart olduğu için aynı ifade Tokyo'da da, New York'ta da, İstanbul'da da aynı anlama gelir. Pilot bu ifadeyi alır almaz "Cleared for takeoff, [callsign]" şeklinde tekrar (readback) yaparak doğrular.

**Arka plan**: 1977'deki Tenerife felaketi (583 ölü) "cleared" kelimesinin yanlış anlaşılmasıyla ilgili tarihin en büyük havacılık kazasıdır. KLM uçağı kalkış için izin almadığı halde harekete geçti çünkü kontrolörün "stand by for takeoff" mesajını yanlış yorumladı. Bu felaketten sonra ICAO frazeolojisi sıkılaştırıldı: "cleared for takeoff" sadece son ve net bir komut olarak kullanılır, asla başka anlamda kullanılmaz.

**Yaygın hata**: Türkçe konuşan pilotlar bazen "ready for takeoff" ile karıştırır. "Ready for departure" pilotun kuleye kalkmaya hazır olduğunu bildirmesidir; "cleared for takeoff" kuleye verilen izindir. İki yönlü bir iletişim — pilot hazır olduğunu söyler, kule izni verir. Bir başka hata: izin almadan harekete geçmek. "Line up and wait" (sıraya girip bekle) ile "cleared for takeoff" (kalkış izni) ayrı izinlerdir.

**İlgili terimler**: Cleared to land, Line up and wait, Hold short, Cancel takeoff clearance, Roger / Wilco / Affirmative.

**Örnek senaryo**: İstanbul Atatürk kulesinde, TK 1 Tower'a "Turkish 1, ready for departure" der. Tower yanıtlar: "Turkish 1, runway 35L cleared for takeoff, wind 350 at 12 knots." Pilot okur: "Cleared for takeoff runway 35L, Turkish 1." Bu noktada pilotun kalkış için tam izni vardır.`,
    icaoReference: 'ICAO Doc 9432, ICAO Annex 10 Vol II',
  },
  {
    id: 'p4',
    dimension: 'aviationEnglish',
    format: 'short',
    level: 'A2',
    category: 'listening',
    roles: ['all'],
    question: 'ATC says: "Turkish 1234, contact tower 118.1." What frequency should the pilot use?',
    questionTr: '🎧 ATC söylüyor: "Turkish 1234, contact tower 118.1." Pilot hangi frekansı kullanır?',
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
    dimension: 'aviationEnglish',
    format: 'passage',
    level: 'B1',
    category: 'reading',
    roles: ['all'],
    question: 'NOTAM excerpt: "RWY 27 CLSD DUE WIP UFN" — what does this mean?',
    questionTr: '📄 NOTAM\'daki kısaltma: "RWY 27 CLSD DUE WIP UFN" ne anlama gelir?',
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
    dimension: 'generalEnglish',
    format: 'short',
    level: 'B1',
    category: 'grammar',
    roles: ['all'],
    question: 'Choose the correct form: "If the engine ___, we will declare an emergency."',
    questionTr: '📚 Doğru gramer formu hangisi? (If clause)',
    options: [
      { id: 'a', text: 'fail' },
      { id: 'b', text: 'fails' },
      { id: 'c', text: 'failing' },
      { id: 'd', text: 'will fail' },
    ],
    correctId: 'b',
    explanationTr:
      'Birinci şart cümlesi (first conditional): If + present simple, will + verb. "Engine" tekil, "fails".',
    explanationLongTr: `**Doğru cevap özeti**: "Fails" — birinci şart cümlesinde (first conditional) if-clause kısmında present simple kullanılır ve "engine" üçüncü tekil olduğu için fiile "-s" eklenir.

**Neden bu cevap?**: İngilizcede 4 ana koşul cümlesi yapısı vardır. Birinci koşul (gerçekleşme olasılığı yüksek gelecek olaylar) yapısı: "If + Subject + Present Simple, Subject + will + Verb". Cümlenin if-clause kısmında present tense kullanılır çünkü olay gelecekte gerçekleşse bile, if-koşulu mantıksal olarak şimdiki zamanın gramer formunda ifade edilir. Bu kuralın ardındaki mantık: koşul "gerçek/şu an mümkün" olarak sunulur.

**Arka plan**: İngilizcedeki koşul cümleleri Latin "conditional" yapısından gelişti. 1. koşul (real conditional) yaygın günlük kullanım için en kritik yapıdır. Havacılık eğitiminde özellikle önemlidir çünkü tüm checklist talimatları, emergency procedures ve ATC iletişimi bu yapıyı kullanır: "If pressure drops, oxygen masks will deploy", "If engine fails on takeoff above V1, we will continue takeoff". Yanlış kullanım briefing'lerde belirsizliğe yol açabilir.

**Yaygın hata**: Türkçe konuşanlar bazen "If the engine will fail" şeklinde "will" tekrarı yapar — bu yanlıştır. "Will" sadece sonuç cümlesinde (main clause) kullanılır. Diğer hata: "If the engine fail" (üçüncü tekil "-s" eksik). "The engine" tekil özne olduğu için "fails" doğrudur. Çoğul "engines" olsaydı "If the engines fail" doğru olurdu.

**İlgili terimler**: 0. koşul (zero conditional — bilimsel gerçek), 2. koşul (unreal present — hayali), 3. koşul (past unreal — geçmiş için pişmanlık), Mixed conditional, "Unless" (= if not).

**Örnek senaryo**: Bir pilot pre-flight briefing'de der ki: "If we lose pressurization above FL250, we will execute emergency descent to 10,000 feet. If we have hydraulic failure, we will follow QRH procedure." Bu cümlelerin doğru gramer yapısı kritiktir çünkü ekip bu briefing'e göre tepki verir. Belirsiz gramer ölümcül yanlış anlaşılmalara yol açabilir.`,
  },
  {
    id: 'p7',
    dimension: 'aviationKnowledge',
    format: 'short',
    level: 'B2',
    category: 'vocabulary',
    roles: ['all'],
    question: 'What is the difference between "stall" and "spin"?',
    questionTr: '✈️ "Stall" ve "spin" arasındaki fark nedir?',
    options: [
      { id: 'a', text: 'They mean the same' },
      { id: 'b', text: 'Stall: loss of lift; Spin: autorotation after stall' },
      { id: 'c', text: 'Stall: engine failure; Spin: rapid descent' },
      { id: 'd', text: 'Both are landing maneuvers' },
    ],
    correctId: 'b',
    explanationTr:
      'Stall = kanadın kaldırma kuvveti kaybı (saldırı açısı çok yüksek). Spin = stall sonrası kontrolsüz dönerek alçalma. Farklı durumlar, ardışık olabilir.',
    explanationLongTr: `**Doğru cevap özeti**: Stall (perdövites) = kanat saldırı açısının kritik açıyı aşması nedeniyle kaldırma kuvvetinin (lift) ani kaybı. Spin (vrille) = stall edilmiş bir uçağın kontrolsüz autorotasyonla burnu aşağı dönerek alçalması.

**Neden bu cevap?**: Aerodinamik olarak stall, hava akımının kanattan ayrılmasıdır (flow separation). Bu olay HIZLA değil, saldırı açısının (angle of attack — AOA) artmasıyla ilgilidir. Bir uçak yavaş hızda da, hızlı hızda da AOA çok yüksekse stall edebilir. Spin, asimetrik stall sonucudur: bir kanat diğerinden daha derin stall yaparsa uçak o tarafa devrilir ve dönerek alçalmaya başlar. Spin, stall'un ardışık bir komplikasyonudur — ama otomatik olarak değil.

**Arka plan**: 1900'lerin başlarında pilotlar stall'u "düşme" olarak nitelendirirdi. Wilbur Wright 1908'de stall'ın saldırı açısıyla ilişkili olduğunu kanıtladı. Spin recovery prosedürü 1916'da Geoffrey Tyler de Havilland tarafından sistemleştirildi: PARE (Power idle, Ailerons neutral, Rudder opposite, Elevator forward). Modern jetler genellikle spin'e karşı dayanıklıdır (anti-spin design) ama küçük uçaklar ve eski jet trainer'lar (T-37, T-38) spin'e girebilir.

**Yaygın hata**: Pilotlar bazen "stall warning" alındığında reflexsel olarak elevator'ı çekiyor — bu yanlıştır. AOA azaltmak için elevator İLERİ itilmelidir (burnu indir, hızı kazan). "Stall = düşük hız" yanlış inanışı: F/A-18 supersonic stall yapabilir. Bir başka karışıklık: aerodynamic stall ile engine compressor stall (motor kompresör tıkanması) farklı şeylerdir.

**İlgili terimler**: AOA (Angle of Attack), CLmax (maximum coefficient of lift), Stall warning system (stick shaker), Spin recovery, Accelerated stall, Deep stall (T-tail), Approach to stall.

**Örnek senaryo**: Air France 447 (Atlantik, 2009) — pilot pitot tube buzlanması nedeniyle yanlış hız okumalarıyla yüksek irtifada stall etti. Pilot stall warning'i alıp da elevator'ı çekmeye devam etti — bu klasik "behind the airplane" durumudur. 228 kişi öldü. Olay sonrası tüm Airbus pilotları stall recovery eğitimini yenilemek zorunda kaldı: "Pitch down, add power" otomatik refleks olmalı.`,
  },
  {
    id: 'p8',
    dimension: 'aviationEnglish',
    format: 'short',
    level: 'B2',
    category: 'phraseology',
    roles: ['all'],
    question: 'Which is the **correct** ICAO standard phraseology?',
    questionTr: '✈️ Hangisi DOĞRU ICAO standart frazeoloji?',
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
    dimension: 'communication',
    format: 'scenario',
    level: 'C1',
    category: 'critical',
    roles: ['all'],
    question: 'Why is the word "MAYDAY" repeated three times during emergencies?',
    questionTr: '🚨 Acil durumlarda "MAYDAY" neden 3 kez tekrarlanır?',
    options: [
      { id: 'a', text: 'Tradition only' },
      { id: 'b', text: 'To ensure clarity over noisy radio + claim priority traffic' },
      { id: 'c', text: 'ICAO law mandates it' },
      { id: 'd', text: 'For dramatic effect' },
    ],
    correctId: 'b',
    explanationTr:
      'Üç kez tekrar: 1) Radyo paraziti durumunda anlaşılma garantisi 2) Diğer trafiğin durmasını ve frekansı boşaltmasını sağlar 3) Acil durum kesinliği bildirir.',
    explanationLongTr: `**Doğru cevap özeti**: "MAYDAY" üç kez tekrar edilir çünkü gürültülü/parçalı radyo iletişiminde mesajın tam olarak anlaşılmasını garanti eder ve diğer tüm trafiğin frekansı boşaltarak öncelik vermesini sağlar.

**Neden bu cevap?**: ICAO Annex 10 Vol II (Aeronautical Telecommunications), can güvenliği iletişimi protokolünü düzenler. MAYDAY, Fransızca "m'aider" (bana yardım edin) kelimesinden türemiştir ve uluslararası en yüksek öncelikli sıkıntı çağrısıdır. Üç kez tekrar yapısı, radyonun bozuk/gürültülü olduğu durumlarda en az bir tekrarın net olarak ulaşmasını sağlar — bu istatistiksel güvence için tasarlanmıştır.

**Arka plan**: 1923'te Frederick Stanley Mockford (Croydon Havalimanı, İngiltere) tarafından geliştirildi. O dönemde Croydon-Le Bourget (Paris) hattı yoğundu ve Fransızca konuşan kontrolörler vardı. "Mayday" Fransızca "venez m'aider" (gelin bana yardım edin) ifadesinden alındı. 1948'de ICAO tarafından evrensel standart olarak kabul edildi. Üçlü tekrar, denizcilik dünyasındaki "SOS" (üç nokta üç çizgi üç nokta) tekrar mantığından esinlenir.

**Yaygın hata**: Pilotlar bazen "Mayday" kelimesini bir kere söyler ve devam eder — bu yanlıştır. Doğrusu: "MAYDAY MAYDAY MAYDAY, [callsign], [konum], [problem], [niyet]". Diğer hata: PAN-PAN (urgency, can güvenliği değil ama acil) ile karıştırmak. PAN-PAN da üç kez tekrar edilir ama daha düşük öncelikte. Mayday = hayati tehlike; Pan-Pan = acil ama hayati değil.

**İlgili terimler**: PAN-PAN PAN-PAN PAN-PAN (urgency call), SQUAWK 7700 (transponder code for emergency), DECLARE EMERGENCY (formal emergency declaration), MEDICO (tıbbi acil durum çağrısı).

**Örnek senaryo**: Captain Sully'nin US Airways 1549 uçağı (Hudson River, 2009) kuş çarpması sonrası iki motorunu kaybetti. LaGuardia kulesine: "MAYDAY MAYDAY MAYDAY, Cactus 1549, hit birds, lost thrust both engines, returning back towards LaGuardia." Üçlü Mayday, diğer tüm trafiğin frekansı boşaltmasını ve LaGuardia'nın 13 numaralı pisti acil iniş için açmasını sağladı. Sully sonunda Hudson Nehri'ne indi, 155 yolcunun hepsi kurtuldu.`,
    icaoReference: 'ICAO Annex 10 Vol II, ICAO Doc 9432 §4.5',
  },
  {
    id: 'p10',
    dimension: 'aviationKnowledge',
    format: 'short',
    level: 'C1',
    category: 'vocabulary',
    roles: ['all'],
    question: 'In airworthiness, what is the difference between AD and SB?',
    questionTr: '📋 Havacılıkta AD (Airworthiness Directive) ile SB (Service Bulletin) arasındaki fark?',
    options: [
      { id: 'a', text: 'They are the same' },
      { id: 'b', text: 'AD: mandatory regulation; SB: manufacturer recommendation' },
      { id: 'c', text: 'AD: airline-issued; SB: state-issued' },
      { id: 'd', text: 'Both are optional' },
    ],
    correctId: 'b',
    explanationTr:
      'AD (Airworthiness Directive) = havayolu otoritesi tarafından yayımlanan **zorunlu** düzeltme. SB (Service Bulletin) = üretici tarafından yayımlanan **tavsiye** (genelde, AD ile zorunlu hale gelmedikçe).',
    explanationLongTr: `**Doğru cevap özeti**: AD (Airworthiness Directive) havacılık otoritesinin yayımladığı YASAL OLARAK ZORUNLU düzeltici/önleyici eylem talebidir. SB (Service Bulletin) üreticinin yayımladığı tavsiye niteliğinde teknik bilgilendirmedir.

**Neden bu cevap?**: EASA Part-M ve FAA 14 CFR Part 39, AD'yi yasal düzenlemenin bir parçası olarak tanımlar. AD'ye uyulmaması uçağın "unairworthy" (uçuşa elverişsiz) olarak işaretlenmesine yol açar — uçak topraklanır. SB ise üreticinin (Boeing, Airbus, vb.) operatörlere "şu modifikasyonu yapmanızı öneriyoruz" dediği teknik dökümandır. Çoğu zaman SB'ler ürün performansını iyileştirir veya potansiyel sorunları erken çözmek için yayımlanır. Bir SB AD'ye dönüştürülebilir — eğer otorite SB'yi güvenlik açısından kritik bulursa.

**Arka plan**: AD sistemi 1958'de FAA tarafından kuruldu. O dönemde havacılık kazaları çoğunlukla bilinen ama düzeltilmemiş yapısal/sistemsel sorunlardan kaynaklanıyordu. AD, otoritenin belirli bir model uçaktaki kritik defekti tüm operatörlere zorla düzelttirme yetkisi sağlar. EASA (Avrupa) ve FAA (ABD) AD'leri çoğunlukla birbirine eşdeğer — bir FAA AD genelde EASA tarafından da yayımlanır. SB sistemi ise üreticiyle operatör arasında bilgi paylaşımı kanalı: "Bu sorunu yaşadık, şu çözüm önerimiz var".

**Yaygın hata**: Teknisyenler bazen SB'yi de zorunlu sanır — yanlış. SB compliance opsiyoneldir ANCAK üretici operatörü "non-mandatory but recommended" baskısına alır (özellikle ileri ürün desteği için). Bir başka karışıklık: "Alert SB" (acil) ile "Standard SB" farkıdır — Alert SB'ler genelde 30 gün içinde AD'ye dönüştürülür.

**İlgili terimler**: STC (Supplemental Type Certificate), AMM (Aircraft Maintenance Manual), MEL (Minimum Equipment List), CAA (Civil Aviation Authority), TCDS (Type Certificate Data Sheet), CRS (Certificate of Release to Service).

**Örnek senaryo**: 2018 Lion Air JT610 ve 2019 Ethiopian ET302 (737 MAX MCAS) felaketleri sonrası FAA acilen AD 2018-23-51 yayımladı: tüm 737 MAX operatörleri, MCAS yazılımını güncellemek ve crew training tamamlamak zorunda kaldı. Bu AD compliance eksikliği uçağı topraklattı. Eş zamanlı Boeing SB 737-22A1342 yayımladı (üretici tavsiyesi) ama AD compliance asıl yasal yükümlülüktü. AD süreç tamamlanana kadar 737 MAX 20 ay yerde kaldı.`,
    icaoReference: 'EASA Part-M, FAA 14 CFR Part 39, ICAO Annex 8',
  },

  // ===== PILOT-SPECIFIC =====
  {
    id: 'p_pilot_1', dimension: 'aviationEnglish', format: 'short', level: 'A1', category: 'vocabulary', roles: ['pilot'],
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
    id: 'p_pilot_2', dimension: 'aviationEnglish', format: 'short', level: 'B1', category: 'phraseology', roles: ['pilot'],
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
    id: 'p_pilot_3', dimension: 'aviationKnowledge', format: 'scenario', level: 'B2', category: 'critical', roles: ['pilot'],
    question: 'During approach, you encounter "windshear, go around". What is your immediate action?',
    options: [
      { id: 'a', text: 'Continue approach to land quickly' },
      { id: 'b', text: 'Maximum thrust, pitch up to recover, climb away' },
      { id: 'c', text: 'Lower flaps and gear' },
      { id: 'd', text: 'Declare emergency only' },
    ],
    correctId: 'b',
    explanationTr: 'Windshear escape = TOGA thrust, pitch attitude 15° up (FBW maneuvers via stick), do NOT change config (gear/flap stays). Recovery first, ATC sonra.',
    explanationLongTr: `**Doğru cevap özeti**: Windshear escape manevrası: TOGA (Take-Off/Go-Around) maksimum itki, pitch attitude 15° yukarı, mevcut konfigürasyon korunur (gear/flap değiştirilmez), ATC iletişimi sonraya bırakılır.

**Neden bu cevap?**: Windshear (rüzgar kayması), kısa mesafe içinde rüzgar yön/şiddetinin ani değişmesidir. Microburst (mikrosaplama) en tehlikeli formdur — kuru havada tornado gibi aşağı doğru hava akımı oluşturur. Yaklaşmada uçak önce headwind kazanır (lift artar — pilot pitch down eder), sonra ANI olarak tailwind'e geçer (lift düşer, sink rate artar). Bu noktada elevator çekmek YETMEZ — maximum thrust + maximum pitch gerekir. Recovery ilk öncelik, configuration değişikliği (gear up, flap retract) kontrolü riske sokar.

**Arka plan**: 1985'te Delta 191 (Dallas-Fort Worth) microburst'a girdi ve 137 ölü ile sonuçlandı. Bu felaket sonrası FAA tüm büyük havalimanlarına TDWR (Terminal Doppler Weather Radar) zorunlu kıldı ve tüm transport kategori uçaklara on-board windshear detection radar takılmaya başlandı. 1992'de standart escape manevrası geliştirildi. PWS (Predictive Windshear System) artık 30 saniye önceden tehlikeyi sinyalize ediyor. Modern uçaklar ayrıca FBW (Fly-By-Wire) sistemleriyle alpha-floor protection sağlar — pilot ne kadar pitch çekerse çeksin uçak stall etmez.

**Yaygın hata**: Pilotlar bazen "go-around" prosedürü uygulayıp gear up komutunu vermeye eğilim duyar — bu YANLIŞ. Windshear escape'de gear ve flap değiştirilmez çünkü konfigürasyon değişikliği geçici lift kaybına neden olur ve tam o an sink rate kritik. ATC bilgilendirme de daha sonra yapılır — radio iletişimi attention split yaratır. Diğer hata: "pull harder" — alpha-floor olmadan stall riski yaratır.

**İlgili terimler**: Microburst, Macroburst, Headwind/Tailwind shear, TDWR, PWS (Predictive Windshear), Alpha-floor protection, Stick shaker, GPWS (Ground Proximity Warning), TOGA thrust setting.

**Örnek senaryo**: USAir Flight 1016 (1994, Charlotte) windshear nedeniyle 37 ölü. Ekibin escape manevrası uygulamasına rağmen geç tepki verdi ve PWS henüz yaygın değildi. Sonuç: PWS tüm Boeing/Airbus uçaklarda zorunlu, simülatör eğitimine windshear scenario eklendi. ICAO Doc 9817 (Manual on Low-level Wind Shear) standart prosedürleri tanımladı: "Maximum thrust, pitch attitude 15° nose up, do not change configuration, climb away from terrain".`,
    icaoReference: 'ICAO Doc 9817, FAA AC 00-54',
  },
  {
    id: 'p_pilot_4', dimension: 'aviationKnowledge', format: 'short', level: 'C1', category: 'vocabulary', roles: ['pilot'],
    question: 'What does ETOPS 180 mean?',
    options: [
      { id: 'a', text: 'Engine thrust at 180% maximum' },
      { id: 'b', text: 'Twin-engine ops up to 180 minutes from suitable alternate' },
      { id: 'c', text: 'Maximum 180 passengers' },
      { id: 'd', text: 'Estimated time over polar 180 NM' },
    ],
    correctId: 'b',
    explanationTr: 'ETOPS = Extended Twin Operations. ETOPS 180 = uygun alternatiften en fazla 180 dk uzakta uçma yetkisi (single engine cruise hızında).',
    explanationLongTr: `**Doğru cevap özeti**: ETOPS 180 = "Extended Twin-engine Operations" sertifikasyon kategorisi. İki motorlu uçağın, alternatif havaalanından maksimum 180 dakika tek motor cruise hızında uçabileceği anlamına gelir.

**Neden bu cevap?**: 1953'ten 1985'e kadar FAA "60-dakika kuralı" uyguluyordu — iki motorlu uçaklar herhangi bir alternatiften 60 dakikadan uzak rotalarda uçamazdı. Bu kural Atlantic ve Pasifik üzerinde sadece 3-4 motorlu uçakların (B747, DC-10, L-1011) operasyonunu zorunlu kılıyordu. 1985'te ETOPS 120 (TWA, Boeing 767), sonra ETOPS 180 (Singapore Airlines) onaylandı. ETOPS 180 ile B767/B777 transatlantik routes'a girdi. ETOPS sertifikasyonu hem uçağa (engine reliability), hem operatöre (training, maintenance), hem de rotaya (alternate availability) bağlıdır.

**Arka plan**: ETOPS gelişimi havacılığın en büyük ekonomik dönüşümü. 4-motor B747'nin yakıt maliyeti 2-motor B777'nin 1.7 katı. ETOPS 180 ile transatlantic operasyonlar twin'lara kaydı. ETOPS 207 (Boeing 777-300ER 2007), ETOPS 330 (B787 Dreamliner) ve ETOPS 370 (A350-900) ile artık herhangi iki noktayı dünya üzerinde direkt uçabilirler. EDTO (Extended Diversion Time Operations) ICAO'nun ETOPS'a verdiği yeni isim — quad-jet'lere de uygulanır. Single-engine cruise hızı LRC (Long Range Cruise) speed'in altındaki bir değerdir.

**Yaygın hata**: ETOPS 180'i "180 mil" sananlar var — yanlış. Süre cinsindendir (DAKİKA), mesafe cinsinden değil. Diğer karışıklık: ETOPS rakamı "iki motorla uçma süresi" değil "tek motorla diversion süresi"dir. Pilotlar bazen ETOPS routing'in normalden uzun olduğunu varsayar — aslında ETOPS optimal short routes açıyor.

**İlgili terimler**: EDTO (ICAO terminolojisi), Single-engine cruise speed, Adequate alternate, ETOPS entry/exit point, MEL items for ETOPS, ETP (Equal Time Point), Critical Fuel Calculation.

**Örnek senaryo**: TK 1 IST→JFK 9-saatlik ETOPS uçuş. Captain pre-flight ETP'leri belirler — Atlantic'in ortasında 4 farklı diversion airport (Reykjavik, Gander, Goose Bay, Shannon) belirler. Her ETP'de "kalan yakıt single engine cruise + ETOPS 180 minute reserve" hesaplanır. Eğer engine fail olursa pilot 180 dakika içinde herhangi bir alternatife inebilmek zorunda. Modern A350-900 ETOPS 370 ile bu kısıtlama neredeyse kalktı — artık Pacific direct uçuşlar yapılıyor.`,
  },

  // ===== CABIN-SPECIFIC =====
  {
    id: 'p_cabin_1', dimension: 'aviationEnglish', format: 'short', level: 'A1', category: 'vocabulary', roles: ['cabin'],
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
    id: 'p_cabin_2', dimension: 'aviationEnglish', format: 'short', level: 'A2', category: 'phraseology', roles: ['cabin'],
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
    id: 'p_cabin_3', dimension: 'aviationKnowledge', format: 'scenario', level: 'B1', category: 'critical', roles: ['cabin'],
    question: 'Passenger refuses to fasten seatbelt during turbulence. What\'s your priority response?',
    options: [
      { id: 'a', text: 'Ignore — it\'s their choice' },
      { id: 'b', text: 'Calmly explain safety reason, document if persistent, inform purser' },
      { id: 'c', text: 'Force them physically' },
      { id: 'd', text: 'Land the plane' },
    ],
    correctId: 'b',
    explanationTr: 'Önce sakin açıklama (yasal zorunluluk + güvenlik). Israr ederse purser\'a bildir, gerekirse unruly passenger raporu doldur.',
    explanationLongTr: `**Doğru cevap özeti**: Sakin tonla emniyet kemerinin yasal zorunluluğunu açıkla, çözüm odaklı kal. Israr devam ederse purser'a bildir, yazılı uncruly passenger raporu doldur. Asla fiziksel müdahale etme.

**Neden bu cevap?**: Türbülans sırasında emniyet kemerini takmak Türkiye'de SHGM Genelge 2017/4'e ve uluslararası ICAO Annex 6 Part I'e göre yasal zorunluluktur. Kabin ekibi yolcunun güvenliğinden de hava operatörünün yasal sorumluluğundan da sorumludur. Ancak fiziksel müdahale (kemeri zorla bağlama) hem yasal hem mesleki risktir — assault sayılabilir. Doğru sıra: 1) Empati + bilgi 2) Eskalasyon (purser) 3) Belgeleme (incident report) 4) Gerekirse kaptan kararı (re-routing veya police on arrival).

**Arka plan**: 2018'de Türkiye'de 60+ unruly passenger olayı raporlandı; küresel olarak yıllık 3.000+ olay (IATA). Tokyo Convention 1963 (henüz Montreal Protocol 2014 ile güncellendi) uçaktaki disruptive davranışları suç olarak tanımlar. Ekibin yetkisi sınırlıdır — tutuklama yetkisi olmasa da "reasonable measures" alabilir. Gulf carriers (Emirates, Qatar) bu konuda çok katı: tek bir tepki ile yolcuya hayatlık ban verilebilir.

**Yaygın hata**: Yeni kabin memurları sıkça iki uçtan birine düşer. Ya çok pasif olur ("yolcunun tercihi") ya da çok agresif olur ("kemeri tak yoksa polis çağırırım"). İkisi de yanlış. Doğru ton: "Sayın yolcu, anlıyorum bu rahatsız ama türbülansta kemer takmak yasal zorunluluk ve sizin güvenliğiniz için. Yardımcı olabilir miyim?" Diğer hata: Yolcuyu utandırmak — etrafındaki yolcuları rahatsız edebilir.

**İlgili terimler**: Unruly Passenger Report, Tokyo Convention, Reasonable Force, Cabin Authority, PIC (Pilot in Command) authority, Diversion (Sapma), Notice to Passenger, IATA DAVS (Database of Air Violators).

**Örnek senaryo**: Türk Hava Yolları TK1989 (Düsseldorf-İstanbul, 2019): Yolcu türbülansta kemer takmayı reddetti, kabin memurunu itti. Kabin memuru sakin kaldı, purser'a bildirdi, kaptan polis welcome talep etti, vardığında polis tutukladı. Yolcuya 18 ay TK ban verildi, 5.000€ tazminat ödedi. Olayda kabin memurunun profesyonelliği takdir edildi — eğer fiziksel müdahale etseydi sigorta sorumluluk doğabilirdi.`,
  },
  {
    id: 'p_cabin_4', dimension: 'aviationKnowledge', format: 'short', level: 'C1', category: 'vocabulary', roles: ['cabin'],
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
    id: 'p_tech_1', dimension: 'aviationEnglish', format: 'short', level: 'A1', category: 'vocabulary', roles: ['technician'],
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
    id: 'p_tech_2', dimension: 'aviationEnglish', format: 'passage', level: 'A2', category: 'reading', roles: ['technician'],
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
    id: 'p_tech_3', dimension: 'aviationKnowledge', format: 'scenario', level: 'B1', category: 'critical', roles: ['technician'],
    question: 'You find a crack on a wing skin during inspection. What\'s the correct sequence?',
    options: [
      { id: 'a', text: 'Repair it immediately, then document' },
      { id: 'b', text: 'Document defect, consult SRM/AMM for damage limits, raise EO/work card, perform approved repair, sign CRS' },
      { id: 'c', text: 'Ignore if small' },
      { id: 'd', text: 'Ground the aircraft permanently' },
    ],
    correctId: 'b',
    explanationTr: 'Yapısal hasarda doğru sıra: doc → SRM kontrolü → engineering order → onaylı tamir → CRS imzası. Belgesiz tamir yasak.',
    explanationLongTr: `**Doğru cevap özeti**: Wing skin'de çatlak bulunduğunda doğru sıra: 1) Hasarı belgele (foto + ölçüm) 2) SRM/AMM'de damage limits kontrol et 3) Engineering Order/work card düzenle 4) Onaylı prosedüre göre tamir et 5) CRS (Certificate of Release to Service) imzala.

**Neden bu cevap?**: EASA Part-145 ve FAA 14 CFR Part 43 çerçevesinde havacılık bakımında "documented action" temel prensiptir. Belgesiz tamir yasaldır değildir ve uçağı "unairworthy" yapar. SRM (Structural Repair Manual) üreticinin (Boeing, Airbus) yayımladığı, her hasar tipi için izin verilen sınırlar ve onaylı tamir yöntemlerini içeren dökümandır. SRM'de hasar "in limits" ise standart tamir uygulanır; "out of limits" ise EO (Engineering Order) gerekir — DOA (Design Organisation Approval) sahibi mühendislik müdahalesi şart.

**Arka plan**: Aloha 243 (1988) felaketi sonrası FAA bu sıkı süreci zorunlu kıldı. Aloha 737-200 cruise'da tepe kabuk kısmı koptu (cabin decompression). Soruşturma: pre-existing fatigue cracks tespit edilmiş ama belgesiz "mark and ignore" yapılmıştı. 1 ölü, 65 yaralı. Olay sonrası tüm yaşlı uçaklar "Aging Aircraft Program"'a alındı. Modern AMM/SRM digital olarak güncellenir, her teknisyen current revision kontrol etmek zorunda.

**Yaygın hata**: Genç teknisyenler bazen "küçük hasar yok say" eğilimi gösterir — yasal sorumluluk yaratır. Bir başka hata: tamir bittikten sonra CRS imzalamadan teslim. CRS olmadan uçak yere bağlıdır, dispatch edemez. Diğer karışıklık: "SRM" ve "AMM" farkı — AMM rutin bakım, SRM yapısal tamir içindir. Wrong manual = wrong repair.

**İlgili terimler**: SRM (Structural Repair Manual), AMM (Aircraft Maintenance Manual), CRS (Certificate of Release to Service), EO (Engineering Order), DOA (Design Organisation Approval), Damage Limits, Repair Category (A/B/C), NDT (Non-Destructive Testing).

**Örnek senaryo**: TK Technic'te bir teknisyen B777 wing skin'de 2cm crack tespit etti. SRM 57-32-15'e baktı: 5cm altı in-limits, doubler patch ile tamir edilebilir. Work card açıldı, NDT (eddy current) ile crack ucu doğrulandı, doubler hazırlandı, kurşun rivet ile kapatıldı, post-repair NDT clean. Senior teknisyen CRS imzaladı. Toplam 18 saat, full traceable. Eğer "küçük çatlak görmedim say" denilseydi: 6 ay sonra crack 30cm olabilir, in-flight depressurization riski.`,
    icaoReference: 'EASA Part-145, FAA 14 CFR Part 43, Boeing/Airbus SRM',
  },
  {
    id: 'p_tech_4', dimension: 'aviationKnowledge', format: 'short', level: 'C1', category: 'vocabulary', roles: ['technician'],
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
    id: 'p_ground_1', dimension: 'aviationEnglish', format: 'short', level: 'A1', category: 'vocabulary', roles: ['ground'],
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
    id: 'p_ground_2', dimension: 'aviationEnglish', format: 'short', level: 'A2', category: 'phraseology', roles: ['ground'],
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
    id: 'p_ground_3', dimension: 'aviationKnowledge', format: 'scenario', level: 'B1', category: 'critical', roles: ['ground'],
    question: 'Aircraft arriving with hot brakes (hot brake light). Your action?',
    options: [
      { id: 'a', text: 'Chock immediately and connect GPU' },
      { id: 'b', text: 'Maintain safe distance, wait for cooling, no chocks until cleared, watch for fire risk' },
      { id: 'c', text: 'Spray water on brakes' },
      { id: 'd', text: 'Tow aircraft to maintenance' },
    ],
    correctId: 'b',
    explanationTr: 'Hot brakes = patlama / yangın riski. Önce min mesafe (200ft) + ekibi uzaklaştır + soğumayı bekle. Su KULLANMA (termal şok).',
    explanationLongTr: `**Doğru cevap özeti**: Hot brakes alarmı verdiğinde: 200 feet (60m) güvenli mesafede dur, ekibi uzaklaştır, soğumayı bekle (15-30 dk), chocks koymayı geciktir, fire risk için yangın söndürücü hazırla. Su KULLANMA — termal şok wheel hub fracture'a yol açabilir.

**Neden bu cevap?**: Carbon brake disc'ler iniş sonrası 800°C+ sıcaklığa ulaşabilir. Tire wheel hub aluminyum alaşımdır ve ısı ile genleşir. Wheel'in iç tarafında "fusible plug" (eriyebilir tıpa) vardır — sıcaklık kritiği aşarsa eriyerek havayı kontrollü serbest bırakır (pneumatic explosion önlenir). Eğer plug çalışmazsa veya plug öncesi su uygulanırsa: 1) Termal şok ile rim/hub çatlaması 2) Steam explosion riski 3) Carbon disc spallation. Bu nedenle protokol: pasif soğuma + güvenli mesafe.

**Arka plan**: 1990'larda birden fazla GSE (Ground Support Equipment) operatörü hot brake patlamasından yaralandı. IATA AHM (Airport Handling Manual) 600 chapter "Aircraft Servicing" hot brake protokolünü standardize etti: 200 ft minimum mesafe, 30 dk minimum cooling time veya thermal sensor reading <300°C. Modern airport'larda thermal IR camera ile uzaktan kontrol yapılır. ISAGO denetiminde bu protokol kritik — uyumsuzluk audit major finding'idir.

**Yaygın hata**: Yeni rampa personeli hızlı turnaround baskısıyla "hot brake light yandı ama bir şey olmaz" der ve chocks koyar — ramp accident. Diğer hata: brake fan veya ventilatörle aktif soğutma — bu da termal stres yaratır, pasif beklemek daha iyidir. Su uygulamak en kritik hata: 800°C carbon + soğuk su = steam explosion + wheel structural failure.

**İlgili terimler**: Brake Fan (passive air flow), Thermal Index (BTU rating), Fusible Plug (eriyebilir tıpa), Carbon-Carbon Brakes, Wheel Hub, Tire Burst, ISAGO Audit, IATA AHM 600, BTU (British Thermal Unit), Reject Takeoff (RTO) — yüksek hız abort hot brake yaratabilir.

**Örnek senaryo**: 2019 Manchester havalimanında Ryanair 737-800 RTO sonrası landed. Captain "hot brakes" deklare etti. Ramp ekibi protokol uyguladı: 200ft mesafe, GSE uzaklaştırıldı, 25 dakika beklendi, fusible plug çalıştı (kontrollü air release ses), thermal camera reading <250°C olunca chock koyuldu. Bir tire değiştirildi (overheated), uçak 90 dakika sonra dispatch oldu. Hiç kimse yaralanmadı. Eğer su uygulansaydı: $2M+ wheel/brake damage + potansiyel ramp casualty.`,
  },
  {
    id: 'p_ground_4', dimension: 'aviationKnowledge', format: 'short', level: 'C1', category: 'vocabulary', roles: ['ground'],
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
    id: 'p_student_1', dimension: 'aviationEnglish', format: 'short', level: 'A1', category: 'vocabulary', roles: ['student'],
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
    id: 'p_student_2', dimension: 'aviationKnowledge', format: 'short', level: 'A2', category: 'reading', roles: ['student'],
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
    id: 'p_student_3', dimension: 'communication', format: 'scenario', level: 'B1', category: 'critical', roles: ['student'],
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
    id: 'p_student_4', dimension: 'aviationKnowledge', format: 'short', level: 'C1', category: 'vocabulary', roles: ['student'],
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

  // ═══════════════════════════════════════════════
  // GENERAL ENGLISH — Havacılık DIŞI CEFR ölçümü (5 ek soru)
  // ═══════════════════════════════════════════════
  { id: 'p_gen_1', dimension: 'generalEnglish', format: 'short', level: 'A1', category: 'vocabulary', roles: ['all'],
    question: 'Choose the correct sentence:',
    questionTr: '📚 Hangi cümle doğru? (Basit gramer)',
    options: [
      { id: 'a', text: 'She have a meeting tomorrow.' },
      { id: 'b', text: 'She has a meeting tomorrow.' },
      { id: 'c', text: 'She having a meeting tomorrow.' },
      { id: 'd', text: 'She is have a meeting tomorrow.' },
    ],
    correctId: 'b',
    explanationTr: 'Üçüncü tekil şahısta (she/he/it) "have" → "has" olur. Present simple tense.',
  },
  { id: 'p_gen_2', dimension: 'generalEnglish', format: 'short', level: 'A2', category: 'vocabulary', roles: ['all'],
    question: 'What is the past tense of "go"?',
    questionTr: '📚 "Go" fiilinin geçmiş zamanı nedir?',
    options: [
      { id: 'a', text: 'goed' },
      { id: 'b', text: 'gone' },
      { id: 'c', text: 'went' },
      { id: 'd', text: 'going' },
    ],
    correctId: 'c',
    explanationTr: '"Go" düzensiz fiil. Past simple = "went", past participle = "gone".',
  },
  { id: 'p_gen_3', dimension: 'generalEnglish', format: 'short', level: 'B1', category: 'grammar', roles: ['all'],
    question: 'Choose: "I have been working here ___ five years."',
    questionTr: '📚 Boşluğa hangi kelime gelir? (Present perfect continuous)',
    options: [
      { id: 'a', text: 'since' },
      { id: 'b', text: 'for' },
      { id: 'c', text: 'during' },
      { id: 'd', text: 'while' },
    ],
    correctId: 'b',
    explanationTr: '"For" + süre uzunluğu (5 yıl, 2 saat). "Since" + başlangıç noktası (2020, March).',
  },
  { id: 'p_gen_4', dimension: 'generalEnglish', format: 'passage', level: 'B2', category: 'reading', roles: ['all'],
    question: 'Read this paragraph: "Despite his initial reluctance, John eventually agreed to the proposal, recognizing that compromise was essential for the team\'s success." What is John\'s attitude?',
    questionTr: '📖 Pasajı oku: John\'un tutumu ne?',
    context: 'Ileri seviye reading — anlam çıkarma',
    options: [
      { id: 'a', text: 'He always wanted to agree' },
      { id: 'b', text: 'He was hesitant but understood the need to cooperate' },
      { id: 'c', text: 'He refused completely' },
      { id: 'd', text: 'He was angry about the decision' },
    ],
    correctId: 'b',
    explanationTr: '"Despite his initial reluctance" = başta tereddütlü. "Eventually agreed" + "recognizing... essential" = sonunda anladı, uzlaşma gerekli.',
  },
  { id: 'p_gen_5', dimension: 'generalEnglish', format: 'short', level: 'C1', category: 'vocabulary', roles: ['all'],
    question: 'What does "to err on the side of caution" mean?',
    questionTr: '📚 "To err on the side of caution" deyiminin anlamı? (İleri vocab)',
    options: [
      { id: 'a', text: 'To make a mistake' },
      { id: 'b', text: 'To choose the safer option when uncertain' },
      { id: 'c', text: 'To be reckless' },
      { id: 'd', text: 'To apologize' },
    ],
    correctId: 'b',
    explanationTr: 'Idiom: "Şüphede kal güvenli olanı seç" — emin olmadığında riski almak yerine güvenli yolu tercih et.',
  },

  // ═══════════════════════════════════════════════
  // COMMUNICATION — Ortak senaryo (2 ek soru)
  // ═══════════════════════════════════════════════
  { id: 'p_comm_1', dimension: 'communication', format: 'scenario', level: 'B2', category: 'critical', roles: ['all'],
    question: 'In an interview, you are asked: "Tell me about a time you disagreed with your manager." What is the BEST approach?',
    questionTr: '💼 Mülakatta "Yöneticinizle anlaşmadığınız bir an" sorusunda en iyi yaklaşım?',
    options: [
      { id: 'a', text: 'Avoid the question — say "I never disagreed"' },
      { id: 'b', text: 'Use STAR format: Situation, Task, Action, Result with respectful tone' },
      { id: 'c', text: 'Complain about your manager\'s mistakes' },
      { id: 'd', text: 'Tell a long unrelated story' },
    ],
    correctId: 'b',
    explanationTr: 'STAR formatı + saygılı ton: Durum + Görev + Eylem + Sonuç. Yöneticiyi kötüleme; kendi olgunluğunu, çatışma çözme becerini göster.',
    explanationLongTr: `**Doğru cevap özeti**: "Yöneticiyle anlaşmadığın bir an" sorusu davranışsal mülakat (behavioral interview) sorusu. Doğru yaklaşım: STAR formatı (Situation, Task, Action, Result) + saygılı ton + olgun çatışma yönetimi gösterme. Yöneticiyi asla kötüleme.

**Neden bu cevap?**: Behavioral interview, 1980'lerde Tom Janz (HR psikolog) tarafından geliştirildi. Premise: "Geçmiş davranış gelecek davranışın en iyi göstergesidir". HR uzmanı bu soruyla 3 şey ölçer: 1) Çatışma yönetebilir misin? 2) Otoriteyle ilişkin sağlıklı mı? 3) Profesyonel olgunluk seviyen ne? "Hiç anlaşmadım" cevabı kırmızı bayrak — ya yalan söylüyor ya çatışmadan kaçınıyor (passive-aggressive risk). Yöneticiyi kötülemek de bayrak — şirket içi sorun çıkarma riski.

**Arka plan**: STAR formatı IBM tarafından 1970'lerde sistematize edildi. Format: Situation (durumu kısaca anlat — 20%), Task (senin sorumluluğun ne — 10%), Action (sen ne yaptın — 50% en kritik), Result (ölçülebilir sonuç + ne öğrendiğin — 20%). Modern havayolu mülakatlarında (Emirates, Qatar, BA, THY) behavioral sorular toplam zamanın 40-60%'ını kaplar. Cevap 90 saniye optimum, 2 dakika maksimum.

**Yaygın hata**: 4 ana tuzak. 1) "Hiç çatışmam olmadı" — naivete sinyali. 2) Yöneticiyi karaktermel suçlama ("o çok aptaldı") — toxic. 3) Soruyu cevaplamadan teknik detaya kaçma — soruyu anlamadığını gösterir. 4) "I/Ben" yerine sürekli "Biz/We" — bireysel sorumluluğu üstlenmiyorsun gibi görünür. Doğru: kendi tepkin, kendi inisiyatif, ne öğrendiğin.

**İlgili terimler**: Behavioral Interview, Competency-Based Interview, STAR Method, CAR Method (Challenge-Action-Result), Conflict Resolution, Emotional Intelligence (EQ), Self-Awareness, Crucial Conversations.

**Örnek senaryo**: THY mülakatında bir aday: "Durum: Operasyon manageri yeni vardiya planını duyurdu, 4 hafta hazırlık olmadan. Görev: Ekibimi geçişe hazırlamak benim sorumluluğumdaydı. Eylem: Önce manager ile birebir konuşmak istedim — 'Bu plan ekip için neden zorlu olur, önereceğim 2 alternatif var' dedim. 30 dk konuştuk, manager bir alternatife açık oldu. Sonuç: Geçiş 4 hafta yerine 6 hafta yayıldı, ekip morali korundu, manager beni o sezon best performer ödülüne tavsiye etti. Öğrendiğim: Hiyerarşiye saygı + assertive iletişim aynı anda mümkün."`,
  },
  { id: 'p_comm_2', dimension: 'communication', format: 'scenario', level: 'B1', category: 'critical', roles: ['all'],
    question: 'A passenger is rude and insults you. What is the most professional response?',
    questionTr: '💼 Kaba/hakaretçi yolcu — en profesyonel cevap?',
    options: [
      { id: 'a', text: 'Argue back firmly' },
      { id: 'b', text: 'Stay calm, acknowledge their feelings, offer solution, escalate if persistent' },
      { id: 'c', text: 'Ignore them completely' },
      { id: 'd', text: 'Walk away without saying anything' },
    ],
    correctId: 'b',
    explanationTr: 'De-escalation: sakin kal → "Anladığım kadarıyla rahatsızsınız" → çözüm öner → ısrarlıysa supervisor\'a bildirin. Tartışma yangını büyütür.',
    explanationLongTr: `**Doğru cevap özeti**: Kaba/hakaretçi yolcuya en profesyonel yanıt: De-escalation tekniği uygula — sakin kal, duygularını acknowledge et, çözüm öner, ısrar ederse supervisor'a yükselt. Tartışmaya girme, görmezden gelme, sessizce çekilme yanlış.

**Neden bu cevap?**: Servis sektöründe de-escalation, FAA "Conflict Management" eğitiminin temel taşıdır. Bilimsel temel: yolcu öfkeliyse beyninin amygdala bölgesi aktif, mantık devre dışı. Kabin memuru aynı şekilde yanıt verirse iki amygdala karşı karşıya — eskalasyon kaçınılmaz. Sakin tonun amacı yolcunun amygdala'yı yatıştırarak prefrontal cortex (mantık) aktive etmek. "Anladığım kadarıyla rahatsızsınız" gibi acknowledgment cümleleri yolcunun "duyuldum" hissini yaratır — bu yatışmanın %60'ını sağlar.

**Arka plan**: De-escalation tekniği aslında polis ve hastane acil servis çalışanları için geliştirildi. Havacılığa 1990'larda IATA tarafından entegre edildi. 4-adım modeli: 1) Active listening (engaged dinleme) 2) Empathy validation (duyguyu kabul) 3) Boundary setting (sınır koyma — sakin ton) 4) Solution offering (çözüm seçenekleri). Eğer ilk 4 adım çalışmazsa: 5) Hierarchical escalation (purser/captain). Crew'un "tek başına çözmesi gerekmez" — şirket protokolü onları korur.

**Yaygın hata**: 3 büyük yanlış. 1) "Argue back firmly" — savunmacı tepki, eskalasyon. 2) "Ignore them completely" — yolcu daha çok kızar, başka yolcuları rahatsız eder. 3) "Walk away" — sorumsuzluk + yolcu ekibi daha agresif yapabilir. Diğer kritik hata: özür dilerken "I'm sorry you feel that way" — gizlemiş suçlama. Doğru: "I understand this is frustrating, let me see how I can help."

**İlgili terimler**: De-escalation, Active Listening, LEAP Method (Listen-Empathize-Agree-Partner), Verbal Judo, Trauma-Informed Service, Body Language Mirroring, Crisis Communication, Customer Recovery.

**Örnek senaryo**: Emirates EK10 (Dubai-London Heathrow, 2018): Premium economy yolcu meal seçimini kaybedince crew'a "you idiots" diye bağırdı. Senior FA: önce göz teması (active listening), sonra "I completely understand this is frustrating, especially after such a long day. Let me see what I can do." Galley'e gitti, business class'tan kalan vegetarian special meal getirdi + complimentary champagne. Yolcu sakinleşti, post-flight feedback'inde "exceptional crisis handling" diye yazdı. Eğer crew tartışsaydı: yolcu inişe doğru daha agresifleşir, FA "unruly passenger" raporu doldurur, yolcu Emirates ban'ına girerdi.`,
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

// ═══════════════════════════════════════════════════════════════════
// 4-BOYUTLU PLACEMENT — yeni API
// ═══════════════════════════════════════════════════════════════════

/**
 * Segment bazlı soru havuzu — 4 boyut için ayrı liste.
 *
 * Hedef:
 * - generalEnglish: 6 soru (havacılık DIŞI, hepsi 'all' rolünde)
 * - aviationEnglish: 6 soru (rol bazlı + ortaklar)
 * - aviationKnowledge: 6 soru (rol bazlı + ortaklar)
 * - communication: 4 soru (ortak)
 */
export function getQuestionsForSegment(
  role: UserRole | null | undefined,
  dimension: Dimension,
): PlacementQuestion[] {
  const inDim = PLACEMENT_QUESTIONS.filter((q) => q.dimension === dimension);

  let pool: PlacementQuestion[];
  if (!role) {
    pool = inDim.filter((q) => q.roles.includes('all'));
  } else {
    pool = inDim.filter((q) => q.roles.includes('all') || q.roles.includes(role));
  }

  // Sırala: A1 → C1
  const order: Record<Level, number> = { A1: 0, A2: 1, B1: 2, B2: 3, C1: 4 };
  pool.sort((a, b) => order[a.level] - order[b.level]);

  // Her boyut için hedef soru sayısı
  const targetCount: Record<Dimension, number> = {
    generalEnglish: 6,
    aviationEnglish: 6,
    aviationKnowledge: 6,
    communication: 4,
  };

  return pool.slice(0, targetCount[dimension]);
}

/**
 * Tek boyut için DimensionResult hesapla.
 */
function calculateDimensionResult(
  answers: { questionId: string; selectedId: string }[],
  pool: PlacementQuestion[],
  dimension: Dimension,
): DimensionResult {
  let correct = 0;
  let answered = 0;
  const correctByLevel = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0 };
  const totalByLevel = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0 };
  const correctByCategory: Record<string, number> = {};
  const totalByCategory: Record<string, number> = {};

  for (const q of pool) {
    totalByLevel[q.level] += 1;
    totalByCategory[q.category] = (totalByCategory[q.category] ?? 0) + 1;
    const answer = answers.find((a) => a.questionId === q.id);
    if (answer) {
      answered += 1;
      if (answer.selectedId === q.correctId) {
        correct += 1;
        correctByLevel[q.level] += 1;
        correctByCategory[q.category] = (correctByCategory[q.category] ?? 0) + 1;
      }
    }
  }

  // Skor (%): doğru / cevaplanmış (cevaplanmamış sayılmaz)
  const score = answered > 0 ? Math.round((correct / answered) * 100) : 0;

  // Confidence: cevap sayısı bazlı
  const confidence: 'high' | 'medium' | 'low' =
    answered >= 6 ? 'high' : answered >= 3 ? 'medium' : 'low';

  // Label: generalEnglish → CEFR; diğer 3 → ProficiencyTier
  let label: string;
  if (dimension === 'generalEnglish') {
    if (correctByLevel.C1 >= 1) label = 'C1';
    else if (correctByLevel.B2 === totalByLevel.B2 && totalByLevel.B2 > 0) label = 'C1';
    else if (correctByLevel.B2 >= 1) label = 'B2';
    else if (correctByLevel.B1 === totalByLevel.B1 && totalByLevel.B1 > 0) label = 'B2';
    else if (correctByLevel.B1 >= 1) label = 'B1';
    else if (correctByLevel.A2 === totalByLevel.A2 && totalByLevel.A2 > 0) label = 'B1';
    else if (correctByLevel.A2 >= 1) label = 'A2';
    else label = 'A1';
  } else {
    // ProficiencyTier eşik
    const tier: ProficiencyTier =
      score >= 80 ? 'expert' : score >= 55 ? 'advanced' : score >= 30 ? 'intermediate' : 'beginner';
    label = tier;
  }

  // Kategori yüzdesi
  const byCategory: Record<string, number> = {};
  for (const cat of Object.keys(totalByCategory)) {
    byCategory[cat] = totalByCategory[cat]! > 0
      ? Math.round((correctByCategory[cat] ?? 0) / totalByCategory[cat]! * 100)
      : 0;
  }

  return {
    label,
    score,
    confidence,
    byCategory,
    questionsAnswered: answered,
  };
}

/**
 * 4 boyut + recommendations üreten ana fonksiyon.
 *
 * @param answers Tüm cevaplar (4 segment toplamı)
 * @param role Kullanıcının seçtiği rol
 */
export function calculateAllDimensions(
  answers: { questionId: string; selectedId: string }[],
  role: UserRole | null | undefined,
): {
  generalEnglish: DimensionResult;
  aviationEnglish: DimensionResult;
  aviationKnowledge: DimensionResult;
  communication: DimensionResult;
  recommendations: Recommendations;
} {
  const generalEnglish = calculateDimensionResult(
    answers,
    getQuestionsForSegment(role, 'generalEnglish'),
    'generalEnglish',
  );
  const aviationEnglish = calculateDimensionResult(
    answers,
    getQuestionsForSegment(role, 'aviationEnglish'),
    'aviationEnglish',
  );
  const aviationKnowledge = calculateDimensionResult(
    answers,
    getQuestionsForSegment(role, 'aviationKnowledge'),
    'aviationKnowledge',
  );
  const communication = calculateDimensionResult(
    answers,
    getQuestionsForSegment(role, 'communication'),
    'communication',
  );

  const results = { generalEnglish, aviationEnglish, aviationKnowledge, communication };
  const recommendations = buildRoleAdvice(role, results);

  return { ...results, recommendations };
}

/**
 * Rol bazlı tavsiye paketi üretir.
 *
 * Strateji:
 * - En düşük skorlu boyut = primaryFocus
 * - Roleye özel hard-coded öneriler
 * - 4 haftalık roadmap her boyutun durumuna göre
 */
export function buildRoleAdvice(
  role: UserRole | null | undefined,
  results: {
    generalEnglish: DimensionResult;
    aviationEnglish: DimensionResult;
    aviationKnowledge: DimensionResult;
    communication: DimensionResult;
  },
): Recommendations {
  // En zayıf boyutu bul
  const dims = [
    { name: 'generalEnglish' as const, label: 'Genel İngilizce', score: results.generalEnglish.score },
    { name: 'aviationEnglish' as const, label: 'Havacılık İngilizcesi', score: results.aviationEnglish.score },
    { name: 'aviationKnowledge' as const, label: 'Havacılık Bilgisi', score: results.aviationKnowledge.score },
    { name: 'communication' as const, label: 'İletişim & Mülakat', score: results.communication.score },
  ];
  const weakest = dims.reduce((min, cur) => (cur.score < min.score ? cur : min), dims[0]!);

  const primaryFocus =
    `${weakest.label} (${weakest.score}%) — bu alanda gelişimin diğer boyutları da güçlendirir.`;

  // Roleye özel tavsiye listesi
  const roleAdvice: string[] = [];
  if (role === 'pilot') {
    roleAdvice.push(
      'ICAO 4 sözlü sınava hazırlık için günlük 10 dk frazeoloji pratik yap',
      'Her hafta 1 NOTAM/METAR pasajı çöz — okuma + decode beceri',
      'Aylık 1 tam ICAO 4 mock exam (4 görev tipi)',
      'THY/Pegasus mülakat soru bankasından haftalık 3 davranışsal STAR pratiği',
    );
  } else if (role === 'cabin') {
    roleAdvice.push(
      'PA anonsları için günlük 5 dk telaffuz pratiği (Whisper analizi)',
      'Acil durum protokolleri (decompression, brace) ezbere hâkim ol',
      'THY/Emirates mülakat soru bankasından haftalık 5 senaryo çalış',
      'Multi-cultural servis dilini geliştir (Arapça/Almanca öğrenme avantajı)',
    );
  } else if (role === 'technician') {
    roleAdvice.push(
      'AMM/SRM/IPC pasajları haftada 2 kez okuma çalışması',
      'EASA Part-66 Modül 9-10 İngilizce konularına odaklan',
      'ATA chapter sistem eşlemesini ezberle (21/24/27/32/49/71)',
      'Defect write-up ve work card jargonunu pratik yap',
    );
  } else if (role === 'ground') {
    roleAdvice.push(
      'IATA IGOM dokümantasyonunu haftada 1 kez okuma',
      'Pushback comm script pratik — hand signal + standart cevaplar',
      'Hot brake / FOD walk gibi acil prosedürleri ezbere hâkim ol',
      'IRROPS senaryolarında müşteri iletişimi pratiği',
    );
  } else if (role === 'student') {
    roleAdvice.push(
      'Önce genel İngilizce B1 seviyesine ulaş (CEFR)',
      'Havacılık temel terminolojisi (NATO phonetic, ATC fraz) günlük öğren',
      'ICAO 4 önizleme testleri ile sektör havasını yakala',
      'Hangi uzmanlık (pilot/kabin/teknisyen) seçeceğini netleştir → o role özel kaynaklara geç',
    );
  } else {
    roleAdvice.push(
      'Önce rolünü seç — kişiselleştirilmiş öneri için kritik',
      'Genel İngilizce seviyeni B1\'in üstüne çıkar',
      'Havacılık vocabulary günlük 5 yeni terim',
    );
  }

  // Roadmap — 4 hafta planı
  const roadmap: string[] = [];
  if (weakest.name === 'generalEnglish') {
    roadmap.push(
      'Hafta 1-2: Genel İngilizce gramer ve okuma — günlük 20 dk',
      'Hafta 3: Havacılık vocabulary girişi — 30 yeni terim',
      'Hafta 4: Aviation phraseology temelleri',
    );
  } else if (weakest.name === 'aviationEnglish') {
    roadmap.push(
      'Hafta 1: Rolüne özel temel jargon — 50 anahtar terim',
      'Hafta 2: ICAO frazeoloji + standart anonslar',
      'Hafta 3: NOTAM/METAR/AMM pasaj okuma pratiği',
      'Hafta 4: Tam senaryo dialog egzersizleri',
    );
  } else if (weakest.name === 'aviationKnowledge') {
    roadmap.push(
      'Hafta 1: Rolüne özel kritik prosedürler ezbere',
      'Hafta 2: Acil durum protokolleri + regülasyon',
      'Hafta 3: Sertifika sınavı odaklı pratik',
      'Hafta 4: Tam mock sınav + zayıf alan tekrarı',
    );
  } else {
    roadmap.push(
      'Hafta 1: STAR formatı + 5 davranışsal soru pratik',
      'Hafta 2: Rol-play senaryoları (zorlu yolcu/durum)',
      'Hafta 3: Mock interview AI partner ile',
      'Hafta 4: Hedef havayolu mülakat formatına özel hazırlık',
    );
  }

  return { primaryFocus, roleAdvice, roadmap };
}
