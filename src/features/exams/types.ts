/**
 * Exam catalog tipleri — havacılık sektöründe geçerli
 * tüm yazılı + sözlü + mülakat sınavları için ortak şema.
 */
import type { Level, UserRole } from '@/types/profile';

export type ExamCategory =
  | 'icao' // ICAO Level 4/5/6
  | 'shgm' // SHGM (Sivil Havacılık Genel Müdürlüğü) sınavları
  | 'yds' // YDS / YÖKDİL akademik
  | 'easa' // EASA Part-66 / FCL
  | 'faa' // FAA A&P / ATP
  | 'iata' // IATA mesleki sertifikalar
  | 'interview' // Havayolu mülakatları (THY, Pegasus, Emirates, Qatar...)
  | 'university'; // YKS sonrası havacılık üniversite hazırlık

export type ExamFormat =
  | 'written_mcq' // Çoktan seçmeli yazılı
  | 'reading' // Okuma + anlama
  | 'listening' // Dinleme + anlama
  | 'oral' // Sözlü (AI examiner)
  | 'mixed_interview'; // Mülakat (sözlü + grup + yazılı karma)

export interface ExamSection {
  id: string;
  titleTr: string;
  titleEn: string;
  format: ExamFormat;
  durationMinutes: number;
  questionCount: number;
  weight: number; // sınavın toplam puanına yüzde katkısı
}

export interface ExamQuestion {
  id: string;
  examId: string;
  sectionId: string;
  level: Level;
  question: string;
  context?: string; // pasaj, NOTAM metni, dialog vb.
  audioUrl?: string;
  options: { id: string; text: string }[];
  correctId: string;
  explanationTr: string;
  reference?: string; // ICAO Doc 9432, SHGM Genelge 2023/15 vb.
}

export interface ExamDefinition {
  id: string;
  category: ExamCategory;
  organization: string; // "SHGM", "ICAO", "ÖSYM", "THY HR", "EASA"
  titleTr: string;
  titleEn: string;
  descriptionTr: string;
  descriptionEn: string;
  /** Hangi roller için geçerli */
  roles: UserRole[];
  /** Tahmini hazırlık seviyesi */
  targetLevel: Level;
  totalDurationMinutes: number;
  totalQuestions: number;
  passingScorePercent: number;
  sections: ExamSection[];
  /** Free tadımlık soru sayısı (kalan premium) */
  freePreviewCount: number;
  isPremium: boolean;
  /** Sınavın ne sıklıkta yapıldığı (kullanıcıya sınav günü modu için) */
  schedule?: string; // "Yılda 4 kez", "Her ay", "Talebe göre"
  officialUrl?: string;
  /** Sektörde tanınma seviyesi (1-5) */
  prestige: 1 | 2 | 3 | 4 | 5;
  badge: string;
}
