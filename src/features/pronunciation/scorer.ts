/**
 * Pronunciation scorer — mock versiyon.
 * Gerçek Whisper entegrasyonu Sprint 6'da.
 *
 * MVP mantığı: kullanıcı sesini kaydeder, mock'da rastgele
 * yüksek skorlu sonuç üretiriz. Whisper key gelince burayı
 * actual API call ile değiştireceğiz.
 */

export interface WordScore {
  word: string;
  score: number; // 0-100
  level: 'good' | 'fair' | 'poor';
}

export interface PronunciationResult {
  targetText: string;
  recordedAt: number;
  durationMs: number;
  overallScore: number; // 0-100
  icaoRubric: number; // 1-6 (ICAO Level 4 scale)
  words: WordScore[];
  feedbackTr: string;
}

function tokenize(text: string): string[] {
  return text
    .replace(/[.,!?;:]/g, '')
    .split(/\s+/)
    .filter(Boolean);
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
    return 'İyi gidiyorsun. Birkaç kelimeyi tekrar dene.';
  }
  if (overall >= 50) {
    return 'Geliştirilecek alanlar var. Sarı/kırmızı kelimelere odaklan.';
  }
  return 'Yavaş ve net konuş. Her kelimeyi ayrı söylemeyi dene.';
}

/**
 * Mock scoring: gerçek Whisper integration olana kadar
 * gerçekçi rastgele skorlar üretir.
 */
export async function scorePronunciation(
  targetText: string,
  audioUri: string,
  durationMs: number,
): Promise<PronunciationResult> {
  // Sahte gecikme — gerçek API hissi
  await new Promise((r) => setTimeout(r, 1200));

  const words = tokenize(targetText);
  // Çoğu kelime iyi, %20 ihtimalle bir kelime düşük skor
  const scored = words.map<WordScore>((w) => {
    const base = 60 + Math.random() * 35; // 60-95 arası
    const wobble = Math.random() < 0.2 ? -25 : 0;
    const score = Math.max(0, Math.min(100, Math.round(base + wobble)));
    return { word: w, score, level: levelFromScore(score) };
  });

  const overall = Math.round(scored.reduce((s, w) => s + w.score, 0) / scored.length);
  // ICAO 1-6 mapping
  const icaoRubric = Math.min(6, Math.max(1, Math.round((overall / 100) * 6)));

  return {
    targetText,
    recordedAt: Date.now(),
    durationMs,
    overallScore: overall,
    icaoRubric,
    words: scored,
    feedbackTr: feedbackForScore(overall),
  };
}
