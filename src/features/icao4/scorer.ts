/**
 * ICAO 4 sözlü sınav scorer.
 * Sprint 5'te Claude Sonnet 4.6 ile gerçek değerlendirme.
 * Şu an mock — gerçekçi rastgele skorlar.
 */

export interface IcaoRubric {
  pronunciation: number; // 1-6
  structure: number;
  vocabulary: number;
  fluency: number;
  comprehension: number;
  interactions: number;
}

export interface IcaoResult {
  taskId: string;
  durationMs: number;
  rubric: IcaoRubric;
  overallLevel: number; // ICAO 1-6, en düşük rubric skoru = genel
  feedbackTr: string;
  recommendations: string[];
}

function levelLabel(level: number): string {
  if (level >= 6) return 'Expert (6)';
  if (level >= 5) return 'Extended (5)';
  if (level >= 4) return 'Operational (4) ✓';
  if (level >= 3) return 'Pre-operational (3)';
  if (level >= 2) return 'Elementary (2)';
  return 'Pre-elementary (1)';
}

export function feedbackForLevel(level: number): string {
  if (level >= 5) return 'Mükemmel! ICAO Seviye 5+ — uluslararası operasyonlara hazırsın.';
  if (level >= 4) return 'Tebrikler! ICAO Seviye 4 (Operational) — sınava hazırsın.';
  if (level === 3) return 'Pre-operational. Birkaç alanda gelişim gerek. ICAO 4 için hazır değilsin.';
  if (level === 2) return 'Elementary. Daha fazla pratik gerek.';
  return 'Temel kelime ve yapılarla başla.';
}

function recommendationsForRubric(rubric: IcaoRubric): string[] {
  const recs: string[] = [];
  if (rubric.pronunciation < 4) {
    recs.push('🎙️ Telaffuz drill modülüne odaklan. /θ/, /ð/ sesleri kritik.');
  }
  if (rubric.structure < 4) {
    recs.push('📚 Conditional sentence yapılarını gözden geçir (Modul 2).');
  }
  if (rubric.vocabulary < 4) {
    recs.push('🧠 SRS ile aviation vocabulary genişlet (300 terim hedef).');
  }
  if (rubric.fluency < 4) {
    recs.push('🗣️ Daha fazla AI konuşma pratiği yap (premium).');
  }
  if (rubric.comprehension < 4) {
    recs.push('🎧 Listening egzersizlerine ağırlık ver.');
  }
  if (rubric.interactions < 4) {
    recs.push('💬 Branching dialogue senaryolarına çalış.');
  }
  return recs.length > 0 ? recs : ['🌟 Tüm alanlarda ICAO 4 üstünde — pratiğe devam et.'];
}

export async function scoreIcaoTask(
  taskId: string,
  audioUri: string,
  durationMs: number,
): Promise<IcaoResult> {
  // Mock gecikme
  await new Promise((r) => setTimeout(r, 1800));

  // Gerçekçi rastgele skor — çoğu B2 seviye (4) civarı
  const baseLevel = 3 + Math.random() * 2; // 3-5 arası
  const wobble = () => Math.max(1, Math.min(6, Math.round(baseLevel + (Math.random() - 0.5) * 2)));

  const rubric: IcaoRubric = {
    pronunciation: wobble(),
    structure: wobble(),
    vocabulary: wobble(),
    fluency: wobble(),
    comprehension: wobble(),
    interactions: wobble(),
  };

  // ICAO official rule: en düşük skor genel seviyedir
  const overallLevel = Math.min(...Object.values(rubric));

  return {
    taskId,
    durationMs,
    rubric,
    overallLevel,
    feedbackTr: feedbackForLevel(overallLevel),
    recommendations: recommendationsForRubric(rubric),
  };
}

export { levelLabel };
