/**
 * Telaffuz drill cümleleri — Pilot Faz 1 için 20 örnek.
 * Sprint 9'da 200'e çıkarılacak.
 */

export interface PronunciationSentence {
  id: string;
  text: string;
  category: 'phraseology' | 'numbers' | 'phonetic' | 'emergency';
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  hint?: string;
}

export const PRONUNCIATION_SENTENCES: PronunciationSentence[] = [
  {
    id: 'pron_001',
    text: 'Cleared for takeoff, runway two seven.',
    category: 'phraseology',
    level: 'A2',
    hint: 'Sayıları tek tek söyle: "two seven", "twenty-seven" değil.',
  },
  {
    id: 'pron_002',
    text: 'Turkish four three two one, contact tower one one eight decimal one.',
    category: 'phraseology',
    level: 'B1',
    hint: 'Frekansta "decimal" deki "i" sesi kısa.',
  },
  {
    id: 'pron_003',
    text: 'Mayday, mayday, mayday, engine failure.',
    category: 'emergency',
    level: 'A2',
    hint: 'Mayday üç kez net şekilde, panik yok.',
  },
  {
    id: 'pron_004',
    text: 'Climb and maintain flight level three five zero.',
    category: 'numbers',
    level: 'B1',
    hint: '"Tree fife zero" pilot İngilizcesinde standart.',
  },
  {
    id: 'pron_005',
    text: 'Alpha Bravo Charlie Delta Echo Foxtrot.',
    category: 'phonetic',
    level: 'A1',
    hint: 'NATO fonetik alfabe — her kelimeyi ayrı söyle.',
  },
  {
    id: 'pron_006',
    text: 'Request descent to flight level two five zero.',
    category: 'phraseology',
    level: 'B1',
  },
  {
    id: 'pron_007',
    text: 'Wind two seven zero at one fife knots.',
    category: 'numbers',
    level: 'A2',
  },
  {
    id: 'pron_008',
    text: 'Squawk seven seven zero zero.',
    category: 'emergency',
    level: 'A2',
    hint: '7700 = acil durum transponder kodu.',
  },
  {
    id: 'pron_009',
    text: 'Established on the localizer runway two seven right.',
    category: 'phraseology',
    level: 'B2',
  },
  {
    id: 'pron_010',
    text: 'Negative, unable. Request alternate routing.',
    category: 'phraseology',
    level: 'B2',
    hint: '"Unable" net telaffuz — ATC ile iletişimde kritik.',
  },
];

export function getSentencesByLevel(
  level: PronunciationSentence['level'],
): PronunciationSentence[] {
  return PRONUNCIATION_SENTENCES.filter((s) => s.level === level);
}
