export type UserRole = 'pilot' | 'cabin' | 'technician' | 'ground' | 'student';
export type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

/**
 * Aviation domain proficiency tiers — non-CEFR boyutlar için.
 * Aviation English/Knowledge/Communication için CEFR yerine bu kullanılır.
 */
export type ProficiencyTier = 'beginner' | 'intermediate' | 'advanced' | 'expert';

/**
 * Tek boyutun ölçüm sonucu.
 *
 * - General English için label = CEFR (A1-C1)
 * - Aviation English/Knowledge/Communication için label = ProficiencyTier
 *
 * Confidence kaç soru cevaplandığına göre:
 * - ≥6 → high
 * - 3-5 → medium
 * - <3 → low
 */
export interface DimensionResult {
  /** CEFR level (A1-C1) veya ProficiencyTier (beginner-expert) */
  label: string;
  /** 0-100 normalize skor */
  score: number;
  /** Soru sayısına göre güvenilirlik */
  confidence: 'high' | 'medium' | 'low';
  /** Kategori bazlı yüzdeler (geri uyumluluk için) */
  byCategory?: Record<string, number>;
  /** Bu boyutta cevaplanan toplam soru sayısı */
  questionsAnswered: number;
}

/**
 * Placement test sonrası kişiselleştirilmiş tavsiye paketi.
 */
export interface Recommendations {
  /** En zayıf boyut (örn: "aviationKnowledge") + neden öncelikli olduğu */
  primaryFocus: string;
  /** Roleye özel 3-5 madde tavsiye */
  roleAdvice: string[];
  /** İlk 4 hafta günlük plan */
  roadmap: string[];
}

export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole | null;
  level: Level | null;
  daily_goal_minutes: number;
  timezone: string;
  active_hours: number[];
  is_student: boolean;
  /** Sprint 14.C — server source of truth. role + level seçildikten sonra true. */
  onboarding_completed?: boolean;
  onboarding_completed_at?: string | null;
  created_at: string;
  updated_at: string;
}
