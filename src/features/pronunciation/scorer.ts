/**
 * Pronunciation scorer — cihaz native STT + Levenshtein bazlı gerçek puanlama.
 *
 * Mantık:
 *   1. expo-speech-recognition ile kullanıcı sesi → tanınan metin (transcript)
 *   2. Hedef metin vs. transcript: word-by-word eşleşme
 *   3. Levenshtein distance her kelime için → 0-100 skor
 *   4. Recognition confidence (varsa) ile blend
 *   5. ICAO 1-6 mapping
 *
 * Hiçbir API ücreti YOK — tamamen cihaz tarafında.
 *
 * Expo Go limitasyonu: dev client (`eas build` veya `expo prebuild`) gerekir.
 * Expo Go'da fallback olarak heuristik scorer kullanılır.
 */

export interface WordScore {
  word: string;
  recognized: string | null; // tanınan eşleşme veya null
  score: number; // 0-100
  level: 'good' | 'fair' | 'poor';
}

export interface PronunciationResult {
  targetText: string;
  recognizedText: string;
  recordedAt: number;
  durationMs: number;
  overallScore: number; // 0-100
  icaoRubric: number; // 1-6
  words: WordScore[];
  feedbackTr: string;
  /** Eğer recognition başarısız olursa fallback kullanıldı mı */
  isHeuristic: boolean;
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[.,!?;:'"„"]/g, '')
    .replace(/[-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text: string): string[] {
  return normalize(text).split(' ').filter(Boolean);
}

/** Levenshtein edit distance (basit DP, küçük string'ler için yeterli). */
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0]![j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = a[j - 1] === b[i - 1] ? 0 : 1;
      matrix[i]![j] = Math.min(
        matrix[i - 1]![j]! + 1, // deletion
        matrix[i]![j - 1]! + 1, // insertion
        matrix[i - 1]![j - 1]! + cost, // substitution
      );
    }
  }
  return matrix[b.length]![a.length]!;
}

/**
 * İki kelimenin benzerlik skoru 0-100.
 * Levenshtein normalized: (1 - dist/maxLen) * 100
 */
function wordSimilarity(target: string, recognized: string): number {
  const t = normalize(target);
  const r = normalize(recognized);
  if (!r) return 0;
  if (t === r) return 100;
  const dist = levenshtein(t, r);
  const maxLen = Math.max(t.length, r.length);
  return Math.max(0, Math.round((1 - dist / maxLen) * 100));
}

/**
 * Hedef ve tanınan metni eşleştirip her hedef kelimesi için en iyi eşleşmeyi bul.
 * Hizalanma: greedy left-to-right.
 */
function alignWords(
  targetWords: string[],
  recognizedWords: string[],
): { target: string; recognized: string | null; score: number }[] {
  const result: { target: string; recognized: string | null; score: number }[] = [];
  let recIdx = 0;

  for (const t of targetWords) {
    // Önümüzdeki 3 kelime içinde en iyi eşleşeni bul
    let best: { idx: number; score: number } | null = null;
    for (let off = 0; off < 3 && recIdx + off < recognizedWords.length; off++) {
      const r = recognizedWords[recIdx + off]!;
      const s = wordSimilarity(t, r);
      if (!best || s > best.score) best = { idx: recIdx + off, score: s };
    }

    if (best && best.score >= 50) {
      result.push({
        target: t,
        recognized: recognizedWords[best.idx] ?? null,
        score: best.score,
      });
      recIdx = best.idx + 1; // forward
    } else {
      // Eşleşme yok — kelime atlandı
      result.push({ target: t, recognized: null, score: 0 });
    }
  }
  return result;
}

function levelFromScore(score: number): 'good' | 'fair' | 'poor' {
  if (score >= 80) return 'good';
  if (score >= 50) return 'fair';
  return 'poor';
}

function feedbackForScore(overall: number): string {
  if (overall >= 90) {
    return 'Mükemmel! ICAO Seviye 5+ kalitesinde telaffuz.';
  }
  if (overall >= 80) {
    return 'Çok iyi! ICAO Seviye 4 kalitesinde — sınava hazırsın.';
  }
  if (overall >= 65) {
    return 'İyi gidiyorsun. Sarı kelimeleri tekrar dene, ağzını biraz daha aç.';
  }
  if (overall >= 50) {
    return 'Geliştirilecek alanlar var. Kırmızı kelimelere odaklan, yavaşla.';
  }
  return 'Yavaş ve net konuş. Her kelimeyi ayrı söylemeyi dene. Mikrofona yakın ol.';
}

/**
 * GERÇEK puanlama: tanınan metin vs hedef metin karşılaştırması.
 * `recognizedText` boşsa → heuristik fallback.
 */
export function scorePronunciationFromTranscript(
  targetText: string,
  recognizedText: string,
  durationMs: number,
): PronunciationResult {
  const targetWords = tokenize(targetText);
  const recWords = tokenize(recognizedText);

  // Boş tanınma → fallback
  if (recWords.length === 0) {
    return heuristicScore(targetText, durationMs, 'Konuşma algılanmadı.');
  }

  const aligned = alignWords(targetWords, recWords);
  const words: WordScore[] = aligned.map((a) => ({
    word: a.target,
    recognized: a.recognized,
    score: a.score,
    level: levelFromScore(a.score),
  }));

  const overallRaw = Math.round(
    words.reduce((s, w) => s + w.score, 0) / Math.max(words.length, 1),
  );

  // Süre cezası: hedef metin uzunluğuna göre WPM ~120 idealdir
  // Çok hızlı (< 80 WPM) veya çok yavaş (> 200 WPM) → -5 puan
  const expectedSec = (targetWords.length / 120) * 60;
  const actualSec = durationMs / 1000;
  const timingPenalty = actualSec < expectedSec * 0.5 || actualSec > expectedSec * 2 ? 5 : 0;

  const overall = Math.max(0, Math.min(100, overallRaw - timingPenalty));
  const icaoRubric = Math.min(6, Math.max(1, Math.round((overall / 100) * 6)));

  return {
    targetText,
    recognizedText,
    recordedAt: Date.now(),
    durationMs,
    overallScore: overall,
    icaoRubric,
    words,
    feedbackTr: feedbackForScore(overall),
    isHeuristic: false,
  };
}

/**
 * Heuristik fallback: STT yoksa, ses süresine ve hedef uzunluğuna göre tahmin.
 * Gerçek bir tahmin değil ama random'dan iyi.
 */
export function heuristicScore(
  targetText: string,
  durationMs: number,
  note?: string,
): PronunciationResult {
  const words = tokenize(targetText);
  const expectedSec = (words.length / 120) * 60;
  const actualSec = durationMs / 1000;

  // Süre yakınsa baz skor 70, çok sapıyorsa düşür
  const timingRatio = actualSec / Math.max(expectedSec, 0.5);
  let baseScore = 70;
  if (timingRatio < 0.4) baseScore = 35; // çok hızlı, muhtemelen okuyamadı
  else if (timingRatio < 0.7) baseScore = 55;
  else if (timingRatio > 2.5) baseScore = 45; // çok yavaş
  else if (timingRatio > 1.5) baseScore = 65;
  else baseScore = 75;

  const wordScores: WordScore[] = words.map((w) => ({
    word: w,
    recognized: null,
    score: baseScore,
    level: levelFromScore(baseScore),
  }));

  const icaoRubric = Math.min(6, Math.max(1, Math.round((baseScore / 100) * 6)));
  const baseFeedback = note ?? 'Cihazda STT mevcut değil — heuristik puanlama.';

  return {
    targetText,
    recognizedText: '',
    recordedAt: Date.now(),
    durationMs,
    overallScore: baseScore,
    icaoRubric,
    words: wordScores,
    feedbackTr: `${baseFeedback} ${feedbackForScore(baseScore)}`,
    isHeuristic: true,
  };
}

/**
 * @deprecated — eski API uyumluluğu için. Gerçek puanlama için
 * `scorePronunciationFromTranscript` kullan.
 */
export async function scorePronunciation(
  targetText: string,
  _audioUri: string,
  durationMs: number,
): Promise<PronunciationResult> {
  return heuristicScore(targetText, durationMs);
}
