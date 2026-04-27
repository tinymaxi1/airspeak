/**
 * Egzersiz tipleri ve generator'ları.
 *
 * Her vocab term'den 8 farklı egzersiz tipi üretebiliriz.
 * Bu sayede 60 terim × 8 tip = 480 unique egzersiz/rol.
 */
import type { VocabularyTerm } from './seed/pilotVocab';

export type ExerciseType =
  | 'tr_to_en' // Türkçe verilir, doğru EN seçilir
  | 'en_to_tr' // EN verilir, doğru TR seçilir
  | 'fill_blank' // Cümlede boşluk doldur
  | 'definition_match' // Tanım verilir, terim seçilir
  | 'term_to_definition' // Terim verilir, tanım seçilir
  | 'sentence_build' // Karışık kelimelerden cümle kur
  | 'category_match' // Kategoriye göre eşleştir
  | 'true_false'; // Doğru/yanlış ifade

export interface Exercise {
  id: string; // Unique — no-repeat takip için
  type: ExerciseType;
  termId: string; // Hangi term'den üretildi
  question: string;
  options: { id: string; text: string }[];
  correctId: string;
  explanation: string;
  hint?: string;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function pickDistractors<T>(pool: T[], excludeId: string, idGetter: (x: T) => string, count: number): T[] {
  const filtered = pool.filter((p) => idGetter(p) !== excludeId);
  return shuffle(filtered).slice(0, count);
}

/**
 * Her egzersiz tipi için generator.
 */
const generators: Record<
  ExerciseType,
  (term: VocabularyTerm, pool: VocabularyTerm[]) => Exercise | null
> = {
  tr_to_en: (term, pool) => {
    const distractors = pickDistractors(pool, term.id, (t) => t.id, 3);
    if (distractors.length < 3) return null;
    const options = shuffle([
      { id: 'correct', text: term.term },
      ...distractors.map((d, i) => ({ id: `d${i}`, text: d.term })),
    ]);
    return {
      id: `ex_${term.id}_tr_to_en`,
      type: 'tr_to_en',
      termId: term.id,
      question: `"${term.termTr}" İngilizce karşılığı nedir?`,
      options,
      correctId: 'correct',
      explanation: term.definitionTr,
    };
  },

  en_to_tr: (term, pool) => {
    const distractors = pickDistractors(pool, term.id, (t) => t.id, 3);
    if (distractors.length < 3) return null;
    const options = shuffle([
      { id: 'correct', text: term.termTr },
      ...distractors.map((d, i) => ({ id: `d${i}`, text: d.termTr })),
    ]);
    return {
      id: `ex_${term.id}_en_to_tr`,
      type: 'en_to_tr',
      termId: term.id,
      question: `"${term.term}" Türkçesi nedir?`,
      options,
      correctId: 'correct',
      explanation: term.definitionTr,
    };
  },

  fill_blank: (term, pool) => {
    const example = term.examples[0];
    if (!example) return null;
    // Cümleden term'i çıkar, boşluk yap
    const blank = example.en.replace(
      new RegExp(`\\b${term.term}\\b`, 'i'),
      '___',
    );
    if (!blank.includes('___')) return null;
    const distractors = pickDistractors(pool, term.id, (t) => t.id, 3);
    if (distractors.length < 3) return null;
    const options = shuffle([
      { id: 'correct', text: term.term },
      ...distractors.map((d, i) => ({ id: `d${i}`, text: d.term })),
    ]);
    return {
      id: `ex_${term.id}_fill_blank`,
      type: 'fill_blank',
      termId: term.id,
      question: `Boşluğa hangisi gelir?\n\n"${blank}"`,
      options,
      correctId: 'correct',
      explanation: `${term.definitionTr}\n\n📝 ${example.tr}`,
    };
  },

  definition_match: (term, pool) => {
    const distractors = pickDistractors(pool, term.id, (t) => t.id, 3);
    if (distractors.length < 3) return null;
    const options = shuffle([
      { id: 'correct', text: term.term },
      ...distractors.map((d, i) => ({ id: `d${i}`, text: d.term })),
    ]);
    return {
      id: `ex_${term.id}_def_match`,
      type: 'definition_match',
      termId: term.id,
      question: `Hangi terim bu tanıma uyar?\n\n"${term.definitionEn}"`,
      options,
      correctId: 'correct',
      explanation: `${term.term} = ${term.termTr}\n${term.definitionTr}`,
    };
  },

  term_to_definition: (term, pool) => {
    const distractors = pickDistractors(pool, term.id, (t) => t.id, 3);
    if (distractors.length < 3) return null;
    const options = shuffle([
      { id: 'correct', text: term.definitionEn },
      ...distractors.map((d, i) => ({ id: `d${i}`, text: d.definitionEn })),
    ]);
    return {
      id: `ex_${term.id}_term_to_def`,
      type: 'term_to_definition',
      termId: term.id,
      question: `"${term.term}" tanımı hangisi?`,
      options,
      correctId: 'correct',
      explanation: term.definitionTr,
    };
  },

  sentence_build: (term, _pool) => {
    const example = term.examples[0];
    if (!example) return null;
    const words = example.en
      .replace(/[.,!?;:]/g, '')
      .split(/\s+/)
      .filter(Boolean);
    if (words.length < 4 || words.length > 12) return null;
    // Doğru: orijinal sıra
    // 3 distractor: kelime sırası bozulmuş
    const correctText = words.join(' ');
    const distractors = [
      shuffle(words).join(' '),
      shuffle(words).join(' '),
      shuffle(words).join(' '),
    ].filter((s) => s !== correctText);
    if (distractors.length < 3) return null;
    const options = shuffle([
      { id: 'correct', text: correctText },
      ...distractors.slice(0, 3).map((d, i) => ({ id: `d${i}`, text: d })),
    ]);
    return {
      id: `ex_${term.id}_sentence_build`,
      type: 'sentence_build',
      termId: term.id,
      question: `Hangisi doğru cümle?\n\nİpucu: ${example.tr}`,
      options,
      correctId: 'correct',
      explanation: `Doğru: "${correctText}"\n${example.tr}`,
    };
  },

  category_match: (term, pool) => {
    const sameCat = pool.filter((p) => p.category === term.category && p.id !== term.id);
    const otherCat = pool.filter((p) => p.category !== term.category);
    if (sameCat.length < 1 || otherCat.length < 3) return null;
    // Soru: 4 terim arasından bu term'in kategorisinde olmayanı seç
    const wrongs = pickDistractors(otherCat, term.id, (t) => t.id, 1);
    const corrects = pickDistractors(sameCat, term.id, (t) => t.id, 2);
    const wrong = wrongs[0];
    if (!wrong) return null;

    const options = shuffle([
      { id: 'wrong_target', text: wrong.term },
      { id: 'c1', text: term.term },
      ...corrects.slice(0, 2).map((c, i) => ({ id: `c${i + 2}`, text: c.term })),
    ]);
    return {
      id: `ex_${term.id}_category`,
      type: 'category_match',
      termId: term.id,
      question: `"${term.category}" kategorisinden olmayan hangisi?`,
      options,
      correctId: 'wrong_target',
      explanation: `${wrong.term} (${wrong.termTr}) ${wrong.category} kategorisinden. Diğerleri ${term.category}.`,
    };
  },

  true_false: (term, _pool) => {
    const example = term.examples[0];
    if (!example) return null;
    // Coin flip: %50 doğru, %50 yanlış cümle
    const isTrueStatement = Math.random() < 0.5;
    let statement: string;
    let correctAnswer: string;
    if (isTrueStatement) {
      statement = `"${term.term}" anlamı: ${term.termTr}`;
      correctAnswer = 'true';
    } else {
      statement = `"${term.term}" anlamı: ${term.category}`;
      correctAnswer = 'false';
    }
    const options = [
      { id: 'true', text: '✓ Doğru' },
      { id: 'false', text: '✗ Yanlış' },
    ];
    return {
      id: `ex_${term.id}_tf`,
      type: 'true_false',
      termId: term.id,
      question: `Bu ifade doğru mu?\n\n${statement}`,
      options,
      correctId: correctAnswer,
      explanation: `${term.term} = ${term.termTr}\n${term.definitionTr}`,
    };
  },
};

/**
 * Bir term'den tüm uygun egzersizleri üret.
 */
export function generateExercisesForTerm(
  term: VocabularyTerm,
  pool: VocabularyTerm[],
): Exercise[] {
  const types: ExerciseType[] = [
    'tr_to_en',
    'en_to_tr',
    'fill_blank',
    'definition_match',
    'term_to_definition',
    'sentence_build',
    'category_match',
    'true_false',
  ];
  return types
    .map((type) => generators[type](term, pool))
    .filter((e): e is Exercise => e !== null);
}

/**
 * Bir terim havuzundan tüm egzersizleri üret.
 */
export function generateAllExercises(pool: VocabularyTerm[]): Exercise[] {
  const all: Exercise[] = [];
  for (const term of pool) {
    all.push(...generateExercisesForTerm(term, pool));
  }
  return all;
}
