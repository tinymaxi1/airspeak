/**
 * AirSpeak içerik üretim prompt template'leri.
 *
 * 3 hedef:
 * 1. detailedExplanationTr — mülakat soruları (6-katmanlı 300-500 kelime)
 * 2. richDefinitionTr — vocab terimleri (5-katmanlı 200-400 kelime)
 * 3. explanationLongTr — placement soruları (6-katmanlı 300-500 kelime)
 */

export const SYSTEM_PROMPT = `Sen AirSpeak için havacılık İngilizcesi içerik üreticisisin.

KURALLAR:
- Türkçe yazıyorsun (içerik dili TR)
- Aviation terimleri İngilizce kalır (cockpit, runway, MAYDAY, etc.)
- ICAO Doc 9432, EASA Part-145, FAA AC referansları doğru olmalı
- Gerçek havacılık olayları/vakaları örnek olarak dahil et
- Yanlış bilgi UYDURUYORSAN kullanma — emin olmadığın olayı atla
- Markdown formatı: **kalın** başlıklar için
- Kelime sayısına UYUM (300-500 veya 200-400 belirtilen)`;

/**
 * Placement long explanation prompt.
 * 6-katmanlı format.
 */
export function buildPlacementLongPrompt(question: {
  id: string;
  question: string;
  questionTr?: string;
  options: { id: string; text: string }[];
  correctId: string;
  explanationTr: string;
  level: string;
  category: string;
  dimension: string;
}): string {
  return `Aşağıdaki placement test sorusu için 300-500 kelime ÖĞRETİCİ açıklama yaz.

SORU: ${question.question}
${question.questionTr ? `(TR ipucu: ${question.questionTr})` : ''}

SEÇENEKLER:
${question.options.map((o) => `- ${o.id.toUpperCase()}) ${o.text}${o.id === question.correctId ? ' ← DOĞRU' : ''}`).join('\n')}

KISA AÇIKLAMA (mevcut): ${question.explanationTr}

Seviye: ${question.level} | Kategori: ${question.category} | Boyut: ${question.dimension}

GÖREV: Aşağıdaki 6-katmanlı yapıda 300-500 kelime detaylı öğretici açıklama yaz:

**Doğru cevap özeti** (1 cümle): ...
**Neden bu cevap?** (50-80 kelime): regülasyon + ICAO Doc/EASA Part referansı
**Arka plan** (80-120 kelime): tarihsel veya operasyonel bağlam
**Yaygın hata** (60-80 kelime): yanlış anlaşılan noktalar
**İlgili terimler**: 3-5 ilgili kavram listele
**Örnek senaryo** (50-80 kelime): gerçek havacılık olayı/vakası

ÖNEMLİ:
- Sadece açıklamayı dön, başka yorum ekleme
- Markdown başlıkları yukarıdaki gibi tut (kalın)
- Aviation jargon İngilizce kalır
- Gerçek havayolu / olay / yıl referansları doğru olmalı (uydurma)`;
}

/**
 * Interview detailed explanation prompt.
 * 6-katmanlı + 3 seviyeli cevap örneği.
 */
export function buildInterviewDetailedPrompt(question: {
  id: string;
  category: string;
  question: string;
  difficulty: number;
  airlineIds: string[];
  goodAnswerPointsTr: string[];
  redFlagsTr: string[];
  sampleAnswerTr?: string;
  modelAnswerEn?: string;
  tipsTr: string[];
}): string {
  const airlineHint = question.airlineIds.length > 0
    ? `Hedef havayolları: ${question.airlineIds.join(', ')}`
    : 'Genel havayolu (rol bazlı)';

  return `Aşağıdaki mülakat sorusu için 300-500 kelime DETAYLI öğretici cevap yaz.

SORU: ${question.question}
Kategori: ${question.category} | Zorluk: ${question.difficulty}/5
${airlineHint}

İYİ CEVAP NOKTALARI:
${question.goodAnswerPointsTr.map((p) => `- ${p}`).join('\n')}

RED FLAG'LER:
${question.redFlagsTr.map((p) => `- ${p}`).join('\n')}

${question.sampleAnswerTr ? `ÖRNEK CEVAP (TR): ${question.sampleAnswerTr}` : ''}

GÖREV: Aşağıdaki 6-katmanlı yapıda 300-500 kelime detaylı cevap yaz:

**HR psikoloji perspektifi** (60-80 kelime): HR uzmanı bu soruyla ne ölçer? Hangi 3-4 nitelik?
**Bu aşamada neden sorulur** (40-60 kelime): Mülakatın hangi noktasında sorulur, neden o noktada?
**3 seviyeli cevap örneği** (120-180 kelime):
- **Zayıf**: ... → kötü çünkü...
- **Orta**: ... → iyi ama eksik...
- **Güçlü**: ... → bu cevap işe alır

**STAR formatı uygulaması** (50-80 kelime): Bu soruda STAR (Situation, Task, Action, Result) nasıl uygulanır? Yapısal yön.
**Havayolu uyarlama** (50-80 kelime): Spesifik havayollarına nasıl uyarlanır? Emirates X / Qatar Y / THY Z vurgular.
**Tipik takip soruları** (30-50 kelime): HR muhtemelen ne sorabilir sonrasında? 2-3 soru örneği.

ÖNEMLİ:
- Sadece içeriği dön, başka yorum ekleme
- Markdown başlıkları (kalın) tut
- Gerçek havayolu kültür/değer referansları doğru olmalı
- 3 seviyeli örnekte SOMUT cümleler (genel laflar değil)`;
}

/**
 * Vocab rich definition prompt.
 * 5-katmanlı.
 */
export function buildVocabRichPrompt(term: {
  id: string;
  term: string;
  termTr: string;
  pronunciation: string;
  category: string;
  difficulty: number;
  definitionEn: string;
  definitionTr: string;
  examples: { en: string; tr: string }[];
  icaoReference?: string;
  relatedTerms: string[];
}): string {
  return `Aşağıdaki havacılık terimi için 200-400 kelime ZENGİN tanım yaz.

TERİM: ${term.term} (${term.termTr})
Telaffuz: ${term.pronunciation}
Kategori: ${term.category} | Zorluk: ${term.difficulty}/5

KISA TANIM (mevcut):
- EN: ${term.definitionEn}
- TR: ${term.definitionTr}

ÖRNEK CÜMLELER:
${term.examples.map((e) => `- ${e.en} / ${e.tr}`).join('\n')}

${term.icaoReference ? `ICAO Referans: ${term.icaoReference}` : ''}
İlgili terimler: ${term.relatedTerms.join(', ')}

GÖREV: Aşağıdaki 5-katmanlı yapıda 200-400 kelime zengin tanım yaz:

**Etimoloji + tarihçe** (40-60 kelime): Kelime nereden geliyor, ne zaman havacılığa girdi?
**Operasyonel/teknik bağlam** (60-100 kelime): Modern havacılıkta bu kavram nasıl kullanılır? Spesifik teknik detay (sistem, prosedür, regülasyon).
**Yaygın yanlış kullanım** (40-60 kelime): Bu terimle hangi terimler karıştırılır? Yaygın hatalar?
**İlgili terimler** (20-40 kelime): 4-6 bağlantılı kavramı listele (kısa açıklama ile).
**Sektör örneği / vaka** (40-80 kelime): Gerçek havacılık olayı veya operasyonel uygulama örneği.

ÖNEMLİ:
- Sadece içeriği dön, başka yorum ekleme
- Markdown başlıkları (kalın) tut
- Aviation jargon İngilizce kalır (terim, regülasyon adı)
- Etimoloji ve tarih DOĞRU olmalı (uydurma)
- Vaka örneği gerçek + doğrulanabilir (Aloha 243, Tenerife, Sully gibi)`;
}
