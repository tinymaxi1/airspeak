/**
 * Lesson Generator — bir derste hangi egzersizler gösterileceğini seçer.
 *
 * Kurallar:
 * 1. Daha önce görülmüş egzersizleri ATLA (no-repeat).
 * 2. Bir derste 5-7 egzersiz, mümkünse farklı tiplerde.
 * 3. Eğer havuz tükenirse, en eski görülenleri tekrar göstermeye başlar (fail-safe).
 */
import { generateAllExercises, type Exercise } from './exerciseTypes';
import type { VocabularyTerm } from './seed/pilotVocab';

/**
 * Bir ders için 5 egzersiz seç.
 *
 * @param vocabPool Tüm vocab havuzu (rol bazlı)
 * @param seenIds Kullanıcının daha önce gördüğü exercise ID'leri
 * @param targetCount Bu derste kaç egzersiz olsun (default 5)
 */
export function generateLesson(
  vocabPool: VocabularyTerm[],
  seenIds: Set<string>,
  targetCount = 5,
): Exercise[] {
  const allExercises = generateAllExercises(vocabPool);

  // 1. Görülmemişleri filtrele
  const unseenExercises = allExercises.filter((ex) => !seenIds.has(ex.id));

  // 2. Yeterli görülmemiş varsa, çeşitlilik için tip dağılımını gözet
  if (unseenExercises.length >= targetCount) {
    return diversifyExercises(unseenExercises, targetCount);
  }

  // 3. Havuz tükendiyse fail-safe: tüm havuzdan random
  if (unseenExercises.length === 0) {
    return diversifyExercises(allExercises, targetCount);
  }

  // 4. Kısmi: önce görülmemişleri al, kalanını eski'lerden tamamla
  const remaining = allExercises.filter((ex) => seenIds.has(ex.id));
  const filler = diversifyExercises(remaining, targetCount - unseenExercises.length);
  return [...unseenExercises, ...filler];
}

/**
 * Egzersizleri tip çeşitliliği gözeterek seç.
 * Aynı tipten 3+ tane olmasın hedef.
 */
function diversifyExercises(pool: Exercise[], count: number): Exercise[] {
  const shuffled = shuffle(pool);
  const selected: Exercise[] = [];
  const typeCount: Record<string, number> = {};

  for (const ex of shuffled) {
    const cur = typeCount[ex.type] ?? 0;
    if (cur >= 2 && selected.length < count) continue; // Aynı tipten max 2
    selected.push(ex);
    typeCount[ex.type] = cur + 1;
    if (selected.length >= count) break;
  }

  // Yetersizse eksiği herhangi bir egzersizle tamamla
  if (selected.length < count) {
    for (const ex of shuffled) {
      if (selected.find((s) => s.id === ex.id)) continue;
      selected.push(ex);
      if (selected.length >= count) break;
    }
  }

  return selected;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/**
 * Bir lesson içinde kaç farklı term içeriyor, kullanıcı için bilgi.
 */
export function countUniqueTerms(exercises: Exercise[]): number {
  return new Set(exercises.map((e) => e.termId)).size;
}
