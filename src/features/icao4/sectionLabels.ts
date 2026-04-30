/**
 * ICAO 4 section → context field UI mapping
 *
 * Tek kaynak: `icao4_questions.context` kolonu section'a göre farklı
 * anlamlar taşır (transcript / passage / situational backdrop).
 * Hem admin form hem mobile render bu mapping'i kullanır → label tutarlılığı.
 *
 * - rows = 0  → context field hiç render edilmesin
 * - required  → submit-time validation + UI'da görsel işaret
 */

export type IcaoSection =
  | 'vocabulary'
  | 'phraseology'
  | 'listening'
  | 'reading'
  | 'grammar'
  | 'critical';

export interface IcaoSectionContextConfig {
  label: string;
  placeholder: string;
  rows: number;
  required: boolean;
}

export const ICAO4_CONTEXT_LABELS: Record<IcaoSection, IcaoSectionContextConfig> = {
  vocabulary: {
    label: '',
    placeholder: '',
    rows: 0,
    required: false,
  },
  phraseology: {
    label: 'ATC durumu',
    placeholder: 'Pilot taxi clearance istiyor.',
    rows: 2,
    required: false,
  },
  listening: {
    label: 'Transcript',
    placeholder: 'Audio metnini buraya yaz.',
    rows: 4,
    required: false,
  },
  reading: {
    label: 'Pasaj / NOTAM / METAR',
    placeholder: 'TAF AMD LTBA 121400Z 1214/1314 27015KT 9999 BKN025...',
    rows: 8,
    required: true,
  },
  grammar: {
    label: '',
    placeholder: '',
    rows: 0,
    required: false,
  },
  critical: {
    label: 'Durum bağlamı',
    placeholder: 'Acil durumda karar verme senaryosu.',
    rows: 3,
    required: false,
  },
};

export const ICAO4_SECTIONS: { id: IcaoSection; label: string; emoji: string }[] = [
  { id: 'vocabulary', label: 'Vocabulary', emoji: '📝' },
  { id: 'phraseology', label: 'Phraseology', emoji: '📡' },
  { id: 'listening', label: 'Listening', emoji: '🎧' },
  { id: 'reading', label: 'Reading', emoji: '📖' },
];
