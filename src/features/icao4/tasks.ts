/**
 * ICAO 4 sözlü sınav görevleri.
 * 4 task type: picture, story, problem, topic
 *
 * Sprint 9'da Claude ile 30 prompt'a çıkarılacak.
 */

export type TaskType = 'picture' | 'story' | 'problem' | 'topic';

export interface IcaoTask {
  id: string;
  type: TaskType;
  titleTr: string;
  promptEn: string;
  promptTr: string;
  imageUrl?: string;
  expectedDurationSeconds: number;
  hintTr: string;
  evaluationCriteria: string[];
}

export const ICAO4_TASKS: IcaoTask[] = [
  // PICTURE DESCRIPTION
  {
    id: 'icao_pic_001',
    type: 'picture',
    titleTr: 'Fotoğrafı tarif et: Kalkış',
    promptEn:
      'Look at the picture. Describe what you see in detail. Include weather, runway, aircraft type, and any unusual elements. Speak for 1-2 minutes.',
    promptTr:
      'Fotoğrafa bak. Gördüklerini detaylı tarif et. Hava durumu, pist, uçak tipi ve sıradışı unsurları dahil et. 1-2 dakika konuş.',
    expectedDurationSeconds: 90,
    hintTr: 'Spesifik kelimeler kullan: runway numbers, weather conditions, aircraft livery.',
    evaluationCriteria: [
      'Vocabulary: aviation specific terms',
      'Structure: complete sentences',
      'Fluency: minimal pauses',
      'Pronunciation: clear consonants',
    ],
  },
  {
    id: 'icao_pic_002',
    type: 'picture',
    titleTr: 'Fotoğrafı tarif et: Acil iniş',
    promptEn:
      'Describe this emergency landing scenario. What appears to have gone wrong? What actions might the crew be taking?',
    promptTr:
      'Bu acil iniş senaryosunu tarif et. Ne ters gitmiş görünüyor? Ekip ne yapıyor olabilir?',
    expectedDurationSeconds: 90,
    hintTr: 'Acil durum kelimeleri: brace, evacuate, emergency vehicles, first responders.',
    evaluationCriteria: [
      'Critical thinking: cause analysis',
      'Problem solving: action proposals',
      'Vocabulary: emergency terms',
    ],
  },

  // STORY TELLING
  {
    id: 'icao_story_001',
    type: 'story',
    titleTr: 'Hikaye anlat: Türbülans',
    promptEn:
      'You are flying at FL350 when you encounter severe turbulence. Tell the story of how you handled it — communications with ATC, cabin crew, and passengers.',
    promptTr:
      'FL350\'de uçarken şiddetli türbülansa giriyorsun. Bu durumla nasıl başa çıktığını anlat — ATC, kabin ekibi ve yolcularla iletişimini.',
    expectedDurationSeconds: 120,
    hintTr: 'Sıralı anlat: önce, sonra, daha sonra, sonunda. Eylemler ve sebepler.',
    evaluationCriteria: [
      'Structure: logical sequence',
      'Vocabulary: ATC phraseology',
      'Fluency: storytelling flow',
      'Comprehension: context awareness',
    ],
  },
  {
    id: 'icao_story_002',
    type: 'story',
    titleTr: 'Hikaye anlat: Bird strike',
    promptEn:
      'During takeoff, you experience a bird strike on the right engine. Tell the story of your decision-making and the actions you took.',
    promptTr:
      'Kalkış sırasında sağ motorda bird strike yaşıyorsun. Karar süreçleri ve aldığın aksiyonları anlat.',
    expectedDurationSeconds: 120,
    hintTr: 'Karar adımlarını anlat: assess → analyze → action → review.',
    evaluationCriteria: [
      'Critical thinking: decision quality',
      'Vocabulary: emergency procedures',
      'Structure: chronological order',
    ],
  },

  // PROBLEM SOLVING
  {
    id: 'icao_prob_001',
    type: 'problem',
    titleTr: 'Problem çöz: Yakıt eksikliği',
    promptEn:
      'You are 30 minutes from your destination but realize you have only 25 minutes of fuel. The destination has heavy traffic. What do you do?',
    promptTr:
      'Hedefinden 30 dakika uzaktasın ama sadece 25 dakikalık yakıtın var. Hedef havalimanında yoğun trafik var. Ne yaparsın?',
    expectedDurationSeconds: 90,
    hintTr: 'Aksiyonlar: declare, divert, fuel emergency, alternate. Sebep belirt.',
    evaluationCriteria: [
      'Problem solving: viable plan',
      'Vocabulary: fuel emergency phraseology',
      'Critical thinking: priority assessment',
    ],
  },
  {
    id: 'icao_prob_002',
    type: 'problem',
    titleTr: 'Problem çöz: Tıbbi acil',
    promptEn:
      'A passenger is having a heart attack mid-flight, 2 hours from the nearest airport. Walk through your decision and communications.',
    promptTr:
      'Uçuş sırasında bir yolcu kalp krizi geçiriyor, en yakın havalimanı 2 saat uzakta. Kararını ve iletişimini anlat.',
    expectedDurationSeconds: 120,
    hintTr: 'Adım adım: cabin crew, ground medical, ATC priority, alternate selection.',
    evaluationCriteria: [
      'Critical thinking: triage logic',
      'Interactions: multiple stakeholder communication',
      'Vocabulary: medical emergency terms',
    ],
  },

  // COMMON TOPICS
  {
    id: 'icao_topic_001',
    type: 'topic',
    titleTr: 'Konu: Pilot kariyerin',
    promptEn:
      "Tell me about your aviation career so far. What inspired you? What's your favorite aircraft type? Where do you see yourself in 5 years?",
    promptTr:
      'Şu ana kadarki havacılık kariyerini anlat. Sana ilham veren ne? En sevdiğin uçak tipi? 5 yıl sonra kendini nerede görüyorsun?',
    expectedDurationSeconds: 120,
    hintTr: 'Geçmiş, şimdi, gelecek — 3 zaman dilimi kullan. Spesifik isimler/yerler.',
    evaluationCriteria: [
      'Fluency: natural conversation',
      'Vocabulary: career terminology',
      'Structure: complex sentences',
    ],
  },
  {
    id: 'icao_topic_002',
    type: 'topic',
    titleTr: 'Konu: Hava durumu kararı',
    promptEn:
      'How do you decide whether to divert due to weather? What factors do you consider, and which is most important?',
    promptTr:
      'Hava durumu nedeniyle divert kararını nasıl verirsin? Hangi faktörleri değerlendirirsin? En önemli olan hangisi?',
    expectedDurationSeconds: 120,
    hintTr: 'Liste yap: fuel, weather minima, alternate availability, runway condition.',
    evaluationCriteria: [
      'Critical thinking: decision framework',
      'Vocabulary: weather phraseology',
      'Structure: comparison + ranking',
    ],
  },
];

export function getTasksByType(type: TaskType): IcaoTask[] {
  return ICAO4_TASKS.filter((t) => t.type === type);
}
