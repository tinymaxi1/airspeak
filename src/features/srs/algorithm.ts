/**
 * SuperMemo SM-2 algoritması.
 * Anki, RemNote ve diğer SRS uygulamalarının temeli.
 *
 * Quality:
 * 0 = Tamamen unuttum
 * 1 = Yanlış cevap, ama hatırladım
 * 2 = Yanlış, çok zor
 * 3 = Doğru, ciddi efor
 * 4 = Doğru, hafif tereddüt
 * 5 = Tam, kolay
 *
 * Quality < 3 → repetitions sıfırla, interval=1
 * Quality >= 3 → easeFactor güncelle, interval artır
 */

export interface SrsCardState {
  termId: string;
  easeFactor: number; // 1.3 - 2.5+
  intervalDays: number;
  repetitions: number;
  nextReviewAt: number; // timestamp
  lastQuality: number | null;
}

export function initialCardState(termId: string): SrsCardState {
  return {
    termId,
    easeFactor: 2.5,
    intervalDays: 1,
    repetitions: 0,
    nextReviewAt: Date.now(),
    lastQuality: null,
  };
}

/**
 * SM-2 update.
 * Klasik formül:
 * - q < 3 → repetitions = 0, interval = 1
 * - q >= 3:
 *   - rep 0 → interval = 1
 *   - rep 1 → interval = 6
 *   - rep 2+ → interval = previous interval × easeFactor
 *   - easeFactor = max(1.3, ef + (0.1 - (5-q)*(0.08 + (5-q)*0.02)))
 */
export function reviewCard(card: SrsCardState, quality: number): SrsCardState {
  const q = Math.max(0, Math.min(5, Math.round(quality)));
  let newEf = card.easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  newEf = Math.max(1.3, newEf);

  let newInterval: number;
  let newReps: number;

  if (q < 3) {
    // Yanlış: tekrar sıfırla
    newReps = 0;
    newInterval = 1;
  } else {
    newReps = card.repetitions + 1;
    if (newReps === 1) newInterval = 1;
    else if (newReps === 2) newInterval = 6;
    else newInterval = Math.round(card.intervalDays * newEf);
  }

  const nextReview = Date.now() + newInterval * 24 * 60 * 60 * 1000;

  return {
    ...card,
    easeFactor: parseFloat(newEf.toFixed(2)),
    intervalDays: newInterval,
    repetitions: newReps,
    nextReviewAt: nextReview,
    lastQuality: q,
  };
}

/**
 * Bugün review'a gelen kartları döndürür.
 * nextReviewAt <= now ise due.
 */
export function getDueCards(cards: SrsCardState[]): SrsCardState[] {
  const now = Date.now();
  return cards.filter((c) => c.nextReviewAt <= now);
}

/**
 * Yeni terim ilk kez görülecek mi?
 */
export function isNewCard(card: SrsCardState): boolean {
  return card.repetitions === 0 && card.lastQuality === null;
}
