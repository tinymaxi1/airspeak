/**
 * Pilot Faz 1 — İlk 10 vocabulary term seed verisi.
 * Sprint 9'da Claude ile 300'e çıkarılacak.
 */

export interface VocabularyTerm {
  id: string;
  term: string;
  termTr: string;
  pronunciation: string;
  category: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  definitionEn: string;
  definitionTr: string;
  examples: { en: string; tr: string }[];
  icaoReference?: string;
  relatedTerms: string[];
}

export const PILOT_VOCAB_FAZ1: VocabularyTerm[] = [
  {
    id: 'voc_pilot_001',
    term: 'cockpit',
    termTr: 'kokpit',
    pronunciation: '/ˈkɒk.pɪt/',
    category: 'cockpit',
    difficulty: 1,
    definitionEn:
      'The compartment of an aircraft where the pilot and co-pilot sit and operate the controls.',
    definitionTr:
      'Pilotun ve yardımcı pilotun oturduğu, kontrolleri kullandığı uçak bölmesi.',
    examples: [
      { en: 'The captain entered the cockpit before the flight.', tr: 'Kaptan uçuştan önce kokpite girdi.' },
      { en: 'Cockpit voice recorders capture all conversations.', tr: 'Kokpit ses kayıt cihazları tüm konuşmaları kaydeder.' },
      { en: 'Glass cockpit replaced traditional instruments in modern jets.', tr: 'Cam kokpit modern jetlerde geleneksel aletlerin yerini aldı.' },
    ],
    icaoReference: 'ICAO Annex 6, Part I',
    relatedTerms: ['flight deck', 'captain', 'first officer'],
  },
  {
    id: 'voc_pilot_002',
    term: 'runway',
    termTr: 'pist',
    pronunciation: '/ˈrʌn.weɪ/',
    category: 'airport',
    difficulty: 1,
    definitionEn: 'A long strip of paved or grassy land where aircraft take off and land.',
    definitionTr: 'Uçakların kalkıp indiği uzun, asfaltlı veya çimenli şerit.',
    examples: [
      { en: 'Runway 27 is closed due to maintenance.', tr: 'Pist 27 bakım nedeniyle kapalı.' },
      { en: 'The pilot lined up on runway 36L.', tr: 'Pilot 36L pistine hizalandı.' },
      { en: 'Runway lights guide pilots during night landings.', tr: 'Pist ışıkları gece inişlerinde pilotlara rehberlik eder.' },
    ],
    relatedTerms: ['taxiway', 'apron', 'threshold'],
  },
  {
    id: 'voc_pilot_003',
    term: 'taxi',
    termTr: 'taksi (uçak yer hareketi)',
    pronunciation: '/ˈtæk.si/',
    category: 'phraseology',
    difficulty: 1,
    definitionEn: 'The movement of an aircraft on the ground under its own power.',
    definitionTr: 'Bir uçağın kendi gücüyle yerde hareket etmesi.',
    examples: [
      { en: 'Tower: "Turkish 1234, taxi to runway 27 via Alpha."', tr: 'Kule: "Turkish 1234, Alpha üzerinden pist 27\'ye taksi yap."' },
      { en: 'After landing, we will taxi to gate A14.', tr: 'İniş sonrası A14 kapısına taksi yapacağız.' },
    ],
    icaoReference: 'ICAO Doc 9432',
    relatedTerms: ['taxiway', 'pushback', 'ground control'],
  },
  {
    id: 'voc_pilot_004',
    term: 'cleared for takeoff',
    termTr: 'kalkış izni verildi',
    pronunciation: '/klɪərd fɔːr ˈteɪk.ɒf/',
    category: 'phraseology',
    difficulty: 2,
    definitionEn:
      'Authorization given by air traffic control for an aircraft to begin its takeoff roll.',
    definitionTr:
      'Hava trafik kontrol tarafından bir uçağa kalkış koşusuna başlama iznin verilmesi.',
    examples: [
      { en: 'Tower: "Turkish 1234, runway 27, cleared for takeoff."', tr: 'Kule: "Turkish 1234, pist 27, kalkış izni verildi."' },
      { en: 'After holding short, we received clearance for takeoff.', tr: 'Kısa beklemenin ardından kalkış iznini aldık.' },
    ],
    icaoReference: 'ICAO Doc 9432',
    relatedTerms: ['takeoff', 'departure', 'hold short'],
  },
  {
    id: 'voc_pilot_005',
    term: 'altitude',
    termTr: 'irtifa, yükseklik',
    pronunciation: '/ˈæl.tɪ.tjuːd/',
    category: 'navigation',
    difficulty: 2,
    definitionEn:
      'The height of an aircraft above sea level, typically measured in feet.',
    definitionTr:
      'Bir uçağın deniz seviyesinin üzerindeki yüksekliği, genellikle feet olarak ölçülür.',
    examples: [
      { en: 'Climbing to altitude 5,000 feet.', tr: '5.000 feet irtifaya tırmanıyoruz.' },
      { en: 'Cruise altitude is FL350 (35,000 feet).', tr: 'Seyir irtifası FL350 (35.000 feet).' },
      { en: 'Altimeter reads current altitude.', tr: 'Altimetre mevcut irtifayı gösterir.' },
    ],
    relatedTerms: ['flight level', 'altimeter', 'climb', 'descend'],
  },
  {
    id: 'voc_pilot_006',
    term: 'METAR',
    termTr: 'METAR (havaalanı hava raporu)',
    pronunciation: '/ˈmiː.tɑːr/',
    category: 'weather',
    difficulty: 3,
    definitionEn:
      'Meteorological Aerodrome Report — routine weather observation at an airport, issued every 30-60 minutes.',
    definitionTr:
      'Havaalanı Meteoroloji Raporu — havaalanında 30-60 dakikada bir yayımlanan rutin hava gözlem raporu.',
    examples: [
      { en: 'Always check the METAR before departure.', tr: 'Kalkıştan önce mutlaka METAR\'ı kontrol et.' },
      { en: 'METAR shows wind 270/15 KT, visibility 10SM.', tr: 'METAR rüzgar 270/15 knot, görüş 10 mil gösteriyor.' },
    ],
    icaoReference: 'ICAO Annex 3',
    relatedTerms: ['TAF', 'ATIS', 'SIGMET'],
  },
  {
    id: 'voc_pilot_007',
    term: 'mayday',
    termTr: 'mayday (acil durum çağrısı)',
    pronunciation: '/ˈmeɪ.deɪ/',
    category: 'emergency',
    difficulty: 3,
    definitionEn:
      'International distress call indicating life-threatening emergency. Repeated three times for clarity.',
    definitionTr:
      'Hayati tehlike içeren acil durum bildiren uluslararası tehlike çağrısı. Anlaşılırlık için üç kez tekrar edilir.',
    examples: [
      { en: '"Mayday, mayday, mayday, Turkish 1234, engine failure."', tr: '"Mayday, mayday, mayday, Turkish 1234, motor arızası."' },
      { en: 'Mayday claims absolute priority on the frequency.', tr: 'Mayday frekansta mutlak öncelik talep eder.' },
    ],
    icaoReference: 'ICAO Annex 10',
    relatedTerms: ['pan-pan', 'emergency', 'squawk 7700'],
  },
  {
    id: 'voc_pilot_008',
    term: 'flap',
    termTr: 'flap (kanat yardımcı yüzey)',
    pronunciation: '/flæp/',
    category: 'aircraft_parts',
    difficulty: 2,
    definitionEn:
      'A movable surface on the trailing edge of a wing that increases lift and drag during takeoff and landing.',
    definitionTr:
      'Kanadın arka kenarındaki, kalkış ve iniş sırasında kaldırma ve sürtünmeyi artıran hareketli yüzey.',
    examples: [
      { en: 'Set flaps to position 15 for takeoff.', tr: 'Kalkış için flap\'ları pozisyon 15\'e al.' },
      { en: 'Retracting flaps after takeoff.', tr: 'Kalkış sonrası flap\'ları toplama.' },
      { en: 'Full flaps deployed for landing.', tr: 'İniş için tam flap açıldı.' },
    ],
    relatedTerms: ['slat', 'aileron', 'spoiler', 'leading edge'],
  },
  {
    id: 'voc_pilot_009',
    term: 'roger',
    termTr: 'roger (anlaşıldı)',
    pronunciation: '/ˈrɒdʒ.ər/',
    category: 'phraseology',
    difficulty: 1,
    definitionEn: 'Standard ATC term meaning "I have received your last transmission."',
    definitionTr: '"Son iletini aldım" anlamına gelen standart ATC terimi.',
    examples: [
      { en: 'ATC: "Climb to FL250." Pilot: "Roger."', tr: 'ATC: "FL250\'ye tırman." Pilot: "Roger."' },
      { en: 'Roger does NOT mean "I will comply" — that\'s "wilco".', tr: 'Roger "uygulayacağım" değil — onun karşılığı "wilco".' },
    ],
    icaoReference: 'ICAO Doc 9432',
    relatedTerms: ['wilco', 'affirmative', 'standby'],
  },
  {
    id: 'voc_pilot_010',
    term: 'wilco',
    termTr: 'wilco (uygulayacağım)',
    pronunciation: '/ˈwɪl.koʊ/',
    category: 'phraseology',
    difficulty: 2,
    definitionEn: '"Will Comply" — pilot\'s response indicating the instruction will be followed.',
    definitionTr: '"Will Comply" — pilotun talimatı uygulayacağını bildiren cevabı.',
    examples: [
      { en: 'ATC: "Reduce speed to 250 knots." Pilot: "Wilco, Turkish 1234."', tr: 'ATC: "Hızı 250 knot\'a düşür." Pilot: "Wilco, Turkish 1234."' },
      { en: 'Wilco implies both understanding and compliance.', tr: 'Wilco hem anlayışı hem uygulamayı kapsar.' },
    ],
    icaoReference: 'ICAO Doc 9432',
    relatedTerms: ['roger', 'affirmative', 'unable'],
  },
];

export function getVocabByCategory(category: string): VocabularyTerm[] {
  return PILOT_VOCAB_FAZ1.filter((v) => v.category === category);
}

export function getVocabByDifficulty(difficulty: 1 | 2 | 3 | 4 | 5): VocabularyTerm[] {
  return PILOT_VOCAB_FAZ1.filter((v) => v.difficulty === difficulty);
}
