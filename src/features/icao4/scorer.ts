/**
 * ICAO Level 4 sözlü sınav scorer — gerçek rule-based 6-descriptor değerlendirme.
 *
 * ICAO Doc 9835 6-descriptor:
 *   1. Pronunciation (telaffuz)
 *   2. Structure (gramer/yapı)
 *   3. Vocabulary (havacılık + genel kelime)
 *   4. Fluency (akıcılık, hız, duraksamalar)
 *   5. Comprehension (anlama — sadece interactive task'larda)
 *   6. Interactions (cevap verme, soru sorma — interactive task'larda)
 *
 * Bu scorer cihaz STT transcript'inden başlar ve heuristik kurallarla
 * her descriptor için 1-6 puan verir. ICAO kuralı: en düşük skor genel level.
 *
 * Sıfır API maliyeti — tüm hesap deterministik.
 */

import { matchTranscript } from '@/features/conversation/scenarios';

const AVIATION_VOCAB = [
  // Phraseology
  'cleared', 'roger', 'wilco', 'affirm', 'negative', 'mayday', 'pan-pan', 'squawk',
  'altitude', 'flight level', 'heading', 'runway', 'taxi', 'pushback', 'descent',
  'climb', 'maintain', 'expedite', 'acknowledge', 'standby', 'approach', 'departure',
  'tower', 'ground', 'frequency', 'callsign', 'inbound', 'outbound', 'final',
  'holding', 'vector', 'intercept', 'localizer', 'glide', 'glidepath',
  // Equipment
  'aileron', 'elevator', 'rudder', 'flap', 'spoiler', 'thrust', 'engine',
  'altimeter', 'transponder', 'autopilot', 'compass', 'gyro',
  // Weather
  'turbulence', 'wind shear', 'icing', 'fog', 'cumulonimbus', 'crosswind',
  'visibility', 'ceiling', 'thunderstorm', 'metar', 'taf',
  // Emergency
  'emergency', 'evacuate', 'fire', 'depressurization', 'divert', 'mayday',
  'engine failure', 'hydraulic', 'electrical', 'fuel',
];

const GRAMMAR_PATTERNS = [
  /\b(if|when|unless)\b.+\b(will|would|should)\b/i, // conditional
  /\b(have|has|had)\s+\w+ed\b/i, // perfect tense
  /\b(was|were)\s+\w+ing\b/i, // past continuous
  /\b(am|is|are|was|were)\s+being\s+\w+/i, // passive
  /\b(must|should|may|might|could|would)\b/i, // modal
];

const FILLER_WORDS = [
  'um', 'uh', 'erm', 'er', 'ah', 'eee', 'mmm',
];

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
  recognizedText: string;
  rubric: IcaoRubric;
  overallLevel: number;
  feedbackTr: string;
  recommendations: string[];
  /** Her descriptor için açıklayıcı not */
  explanationsTr: Record<keyof IcaoRubric, string>;
  /** STT yoksa heuristik kullanıldı mı */
  isHeuristic: boolean;
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

function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[.,!?;:'"„"]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function wpm(transcript: string, durationMs: number): number {
  const words = tokens(transcript).length;
  const minutes = durationMs / 60000;
  return minutes > 0 ? Math.round(words / minutes) : 0;
}

/**
 * Pronunciation skoru: STT confidence proxy.
 * Eğer transcript metin uzun + tutarlı → STT güveniyor → iyi telaffuz.
 * Heuristik: kelime/saniye yoğunluğu + filler oran.
 */
function scorePronunciation(transcript: string, durationMs: number): {
  level: number;
  note: string;
} {
  const tokenList = tokens(transcript);
  const wordsPerMin = wpm(transcript, durationMs);
  const fillerCount = tokenList.filter((w) => FILLER_WORDS.includes(w)).length;
  const fillerRate = tokenList.length > 0 ? fillerCount / tokenList.length : 1;

  // Çok az kelime → telaffuz tanımadı → kötü
  if (tokenList.length < 5) return { level: 2, note: 'Çok az kelime tanındı.' };

  // 80-160 WPM ideal
  if (wordsPerMin < 50) return { level: 3, note: 'Çok yavaş, telaffuz takılıyor.' };
  if (wordsPerMin > 200) return { level: 3, note: 'Çok hızlı, telaffuz kayboluyor.' };

  // Filler oranı
  if (fillerRate > 0.15) return { level: 3, note: 'Çok fazla "uh, um, er" — telaffuz emin değil.' };
  if (fillerRate > 0.08) return { level: 4, note: 'Genelde net, bazen tereddüt.' };

  // İdeal aralık
  if (wordsPerMin >= 100 && wordsPerMin <= 160 && fillerRate < 0.05) {
    return { level: 5, note: 'Net, akıcı telaffuz.' };
  }
  return { level: 4, note: 'Operasyonel telaffuz.' };
}

/**
 * Structure skoru: gramer kalıp sayısı.
 */
function scoreStructure(transcript: string): { level: number; note: string } {
  const matched = GRAMMAR_PATTERNS.filter((p) => p.test(transcript)).length;
  const tokenCount = tokens(transcript).length;

  if (tokenCount < 10) return { level: 2, note: 'Cümle çok kısa, yapı değerlendirilemiyor.' };

  // 5 pattern toplam, ne kadar geçti
  if (matched >= 4) return { level: 5, note: 'Karmaşık yapılar (modal, conditional) net kullanılıyor.' };
  if (matched >= 3) return { level: 4, note: 'Gramer çoğunlukla doğru, modal/perfect aktif.' };
  if (matched >= 2) return { level: 4, note: 'Temel yapılar yerinde.' };
  if (matched >= 1) return { level: 3, note: 'Sadece basit yapılar — modal/conditional ekle.' };
  return { level: 2, note: 'Yapı çeşitliliği yok, simple present tekrarlanıyor.' };
}

/**
 * Vocabulary: havacılık jargon hit oranı + toplam farklı kelime.
 */
function scoreVocabulary(transcript: string): { level: number; note: string } {
  const tokenList = tokens(transcript);
  const unique = new Set(tokenList);
  const aviationHits = AVIATION_VOCAB.filter((v) => transcript.toLowerCase().includes(v)).length;

  if (tokenList.length < 8) return { level: 2, note: 'Yetersiz kelime sayısı.' };

  if (aviationHits >= 8 && unique.size >= 30) {
    return { level: 5, note: `${aviationHits} havacılık terimi · ${unique.size} farklı kelime — zengin.` };
  }
  if (aviationHits >= 5 && unique.size >= 20) {
    return { level: 4, note: `${aviationHits} havacılık terimi · operasyonel.` };
  }
  if (aviationHits >= 3) {
    return { level: 3, note: `Sadece ${aviationHits} havacılık terimi — sözlüğünü genişlet.` };
  }
  return { level: 2, note: 'Havacılık terimi neredeyse yok, genel kelime hâkim.' };
}

/**
 * Fluency: WPM + duraksama tahmini (kelime aralığı).
 */
function scoreFluency(transcript: string, durationMs: number): { level: number; note: string } {
  const tokenList = tokens(transcript);
  const wordsPerMin = wpm(transcript, durationMs);
  const fillerCount = tokenList.filter((w) => FILLER_WORDS.includes(w)).length;

  if (tokenList.length < 10) return { level: 2, note: 'Çok kısa konuşma.' };

  if (wordsPerMin >= 110 && wordsPerMin <= 170 && fillerCount < 3) {
    return { level: 5, note: `${wordsPerMin} WPM · akıcı, doğal.` };
  }
  if (wordsPerMin >= 90 && wordsPerMin <= 180 && fillerCount < 5) {
    return { level: 4, note: `${wordsPerMin} WPM · operasyonel akıcılık.` };
  }
  if (wordsPerMin < 70) return { level: 3, note: `${wordsPerMin} WPM — daha rahat konuş.` };
  if (wordsPerMin > 200) return { level: 3, note: `${wordsPerMin} WPM — çok hızlı, anlaşılmıyor.` };
  return { level: 3, note: `${wordsPerMin} WPM · ${fillerCount} filler — tereddüt var.` };
}

/**
 * Comprehension + Interactions: monolog görevde N/A, sabit 4.
 * İnteraktif görevde (Q&A) cevap-soru eşleşmesi sayılır.
 */
function scoreComprehensionInteractions(
  taskType: string,
  transcript: string,
  expectedKeyPhrases?: string[][],
): { comprehension: { level: number; note: string }; interactions: { level: number; note: string } } {
  // Monolog (picture, story, topic) → comprehension/interactions belirsiz, default 4
  if (taskType === 'picture' || taskType === 'story' || taskType === 'topic') {
    return {
      comprehension: { level: 4, note: 'Monolog görevde değerlendirilmedi.' },
      interactions: { level: 4, note: 'Monolog görevde değerlendirilmedi.' },
    };
  }

  // Interactive görevde key phrases'a uyum
  if (expectedKeyPhrases && expectedKeyPhrases.length > 0) {
    const match = matchTranscript(transcript, expectedKeyPhrases);
    if (match.score >= 80) {
      return {
        comprehension: { level: 5, note: `Talimatın ${match.score}%'i karşılandı.` },
        interactions: { level: 5, note: 'Akıcı cevap, sorular doğru anlaşılmış.' },
      };
    }
    if (match.score >= 60) {
      return {
        comprehension: { level: 4, note: `Talimatın ${match.score}%'i karşılandı.` },
        interactions: { level: 4, note: 'Cevap operasyonel.' },
      };
    }
    if (match.score >= 40) {
      return {
        comprehension: { level: 3, note: `Sadece ${match.score}% — bazı kelimeler kaçırıldı.` },
        interactions: { level: 3, note: 'Cevaplar eksik veya yanlış sırada.' },
      };
    }
    return {
      comprehension: { level: 2, note: `${match.score}% — talimatı çoğunlukla anlamadın.` },
      interactions: { level: 2, note: 'Cevaplar talimatla uyumsuz.' },
    };
  }

  return {
    comprehension: { level: 4, note: 'Default operasyonel.' },
    interactions: { level: 4, note: 'Default operasyonel.' },
  };
}

function recommendationsForRubric(rubric: IcaoRubric): string[] {
  const recs: string[] = [];
  if (rubric.pronunciation < 4) {
    recs.push('🎙 Telaffuz drill modülüne odaklan. /θ/, /ð/ sesleri kritik.');
  }
  if (rubric.structure < 4) {
    recs.push('📚 Conditional ve modal verb yapılarını gözden geçir.');
  }
  if (rubric.vocabulary < 4) {
    recs.push('🧠 SRS ile aviation vocabulary genişlet (300+ terim hedef).');
  }
  if (rubric.fluency < 4) {
    recs.push('🗣 AI co-pilot senaryolarıyla daha çok konuş, filler azalt.');
  }
  if (rubric.comprehension < 4) {
    recs.push('🎧 Listening egzersizlerine ağırlık ver.');
  }
  if (rubric.interactions < 4) {
    recs.push('💬 Branching dialogue senaryolarına çalış.');
  }
  return recs.length > 0 ? recs : ['🌟 Tüm alanlarda ICAO 4 üstünde — pratiğe devam et.'];
}

/**
 * Heuristic fallback (STT yok).
 */
function heuristicResult(taskId: string, durationMs: number): IcaoResult {
  // Konuşulan süre yeterli mi?
  const minutes = durationMs / 60000;
  let baseLevel = 3;
  if (minutes >= 1 && minutes <= 3) baseLevel = 4;
  else if (minutes >= 0.5) baseLevel = 3;
  else baseLevel = 2;

  const rubric: IcaoRubric = {
    pronunciation: baseLevel,
    structure: baseLevel,
    vocabulary: baseLevel,
    fluency: baseLevel,
    comprehension: baseLevel,
    interactions: baseLevel,
  };

  return {
    taskId,
    durationMs,
    recognizedText: '',
    rubric,
    overallLevel: baseLevel,
    feedbackTr: feedbackForLevel(baseLevel),
    recommendations: recommendationsForRubric(rubric),
    explanationsTr: {
      pronunciation: 'STT mevcut değil — sadece konuşma süresi baz alındı.',
      structure: 'STT mevcut değil.',
      vocabulary: 'STT mevcut değil.',
      fluency: 'STT mevcut değil.',
      comprehension: 'STT mevcut değil.',
      interactions: 'STT mevcut değil.',
    },
    isHeuristic: true,
  };
}

/**
 * GERÇEK puanlama: cihaz STT'den gelen transcript'i 6 descriptor ile değerlendir.
 */
export function scoreIcaoFromTranscript(
  taskId: string,
  taskType: string,
  recognizedText: string,
  durationMs: number,
  expectedKeyPhrases?: string[][],
): IcaoResult {
  if (!recognizedText.trim()) {
    return heuristicResult(taskId, durationMs);
  }

  const pron = scorePronunciation(recognizedText, durationMs);
  const struct = scoreStructure(recognizedText);
  const vocab = scoreVocabulary(recognizedText);
  const flu = scoreFluency(recognizedText, durationMs);
  const ci = scoreComprehensionInteractions(taskType, recognizedText, expectedKeyPhrases);

  const rubric: IcaoRubric = {
    pronunciation: pron.level,
    structure: struct.level,
    vocabulary: vocab.level,
    fluency: flu.level,
    comprehension: ci.comprehension.level,
    interactions: ci.interactions.level,
  };

  // ICAO official: en düşük skor genel level
  const overallLevel = Math.min(...Object.values(rubric));

  return {
    taskId,
    durationMs,
    recognizedText,
    rubric,
    overallLevel,
    feedbackTr: feedbackForLevel(overallLevel),
    recommendations: recommendationsForRubric(rubric),
    explanationsTr: {
      pronunciation: pron.note,
      structure: struct.note,
      vocabulary: vocab.note,
      fluency: flu.note,
      comprehension: ci.comprehension.note,
      interactions: ci.interactions.note,
    },
    isHeuristic: false,
  };
}

/**
 * @deprecated — eski mock API. Yeni: scoreIcaoFromTranscript.
 */
export async function scoreIcaoTask(
  taskId: string,
  _audioUri: string,
  durationMs: number,
): Promise<IcaoResult> {
  return heuristicResult(taskId, durationMs);
}

export { levelLabel };
