export type UserRole = 'pilot' | 'atc' | 'cabin' | 'technician' | 'ground' | 'student' | 'dispatcher';

/**
 * SubRole — DB tablosundaki sub_roles.id değeri.
 * 40 başlangıç değeri var ama admin yeni ekleyebilir → generic string.
 * Compile-time literal union istenirse SubRoleId tipini kullan.
 */
export type SubRole = string;

/**
 * SubRoleId — Migration `20260513000003_sub_roles_architecture.sql` seed'inde
 * tanımlı 40 sub_role id'sinin literal union'ı. Compile-time autocompletion için.
 * Runtime'da admin tarafından yeni eklenen değerler `SubRole` (string) altında okunur.
 */
export type SubRoleId =
  // PILOT (11)
  | 'pilot_a320' | 'pilot_a321' | 'pilot_a350'
  | 'pilot_b737_800' | 'pilot_b737_900' | 'pilot_b737_max'
  | 'pilot_b777' | 'pilot_b787'
  | 'pilot_cessna' | 'pilot_helicopter' | 'pilot_atr'
  // TECHNICIAN (7)
  | 'tech_line' | 'tech_a_check' | 'tech_c_check'
  | 'tech_landing_gear' | 'tech_engine' | 'tech_wheels' | 'tech_avionics'
  // CABIN (5)
  | 'cabin_business' | 'cabin_economy' | 'cabin_purser'
  | 'cabin_trainer' | 'cabin_first'
  // ATC (4)
  | 'atc_tower' | 'atc_approach' | 'atc_ground' | 'atc_enroute'
  // GROUND (5)
  | 'ground_pushback' | 'ground_baggage' | 'ground_catering'
  | 'ground_refueling' | 'ground_deicing'
  // STUDENT (4)
  | 'student_icao4' | 'student_pilot_interview'
  | 'student_cabin_interview' | 'student_atc_interview'
  // DISPATCHER (4)
  | 'dispatcher_major' | 'dispatcher_charter'
  | 'dispatcher_vip' | 'dispatcher_cargo';

/** sub_roles tablosundan tek bir kayıt — admin/onboarding listesi için. */
export interface SubRoleRow {
  id: SubRole;
  parent_role: UserRole;
  display_order: number;
  active: boolean;
  icon: string | null;
  /** { tr: 'A320 Pilot', en: 'A320 Pilot', ... 20 dil } */
  names: Record<string, string>;
  /** { tr: '...', en: '...' } — diğer diller admin'den eklenir */
  descriptions: Record<string, string> | null;
  created_at: string;
  updated_at: string;
}
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
  /**
   * Granular sub-role (örn. 'pilot_a320'). Migration 20260513000003 ile
   * eklendi — FK: sub_roles(id), ON DELETE SET NULL.
   * NULL = sadece parent role seçili, sub_role seçilmedi.
   */
  sub_role?: SubRole | null;
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
