/**
 * Placement test soruları — A1'den C1'e progression.
 * 10 soru, ~3 dakika. Sonuçlar onboarding store'a yazılır.
 *
 * Gerçek üretimde 100+ soruluk havuzdan adaptive seçim yapılır (Sprint 9).
 */
import type { Level } from '@/types/profile';

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
];

/**
 * Sonuçtan seviye hesapla.
 * Her seviye için ağırlıklı puan, en yüksek olan seviye seçilir.
 */
export function calculateLevel(
  answers: { questionId: string; selectedId: string }[],
): PlacementQuestion['level'] {
  let correctByLevel = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0 };
  const totalByLevel = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0 };

  for (const q of PLACEMENT_QUESTIONS) {
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

  for (const q of PLACEMENT_QUESTIONS) {
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
  const total = Math.round((totalCorrect / PLACEMENT_QUESTIONS.length) * 100);

  return { total, byCategory };
}
