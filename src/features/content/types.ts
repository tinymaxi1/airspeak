/**
 * Content layer — DB row tipleri.
 *
 * Supabase `Database['public']['Tables']` generated tipleri Faz 2'de yeniden
 * jenerasyon yapılana kadar burada manuel tutuyoruz. Schema:
 * supabase/migrations/20260430110000_content_tables.sql
 */

export type ContentStatus = 'draft' | 'review' | 'published' | 'archived';
export type LessonType = 'vocabulary' | 'dialogue' | 'listening' | 'pronunciation' | 'quiz' | 'reading' | 'speaking' | 'theory';
export type ExerciseType =
  | 'vocab-mc'
  | 'fill-blank'
  | 'dialogue-fill'
  | 'listening-mc'
  | 'pronunciation-record'
  | 'match'
  | 'order'
  | 'drag-drop'
  | 'open-text'
  // Sprint 10.A — yeni tipler
  | 'matching'
  | 'ordering'
  | 'true_false'
  // Sprint 14.B.2 — DB'de mevcut alternatif spelling'ler
  | 'fill_blank'
  | 'listening'
  | 'speaking';

/** Sprint 10.A — matching tipi için pair item */
export interface ExercisePair {
  id: string;
  left: string;
  right: string;
}

export type Role = 'pilot' | 'atc' | 'cabin' | 'technician' | 'ground' | 'student' | 'dispatcher';

export interface ContentBase {
  id: string;
  slug: string;
  status: ContentStatus;
  created_at: string;
  updated_at: string;
}

export interface ModuleRow extends ContentBase {
  role: Role;
  number: number;
  title: string;
  title_tr: string | null;
  description: string | null;
  description_tr: string | null;
  badge: string | null;
  reward_xp: number;
  sort: number;
}

export interface UnitRow extends ContentBase {
  module_id: string;
  number: number;
  title: string;
  title_tr: string | null;
  description: string | null;
  description_tr: string | null;
  badge: string | null;
  sort: number;
  // Sprint 12 — ünite girişinde modal'da gösterilen tanıtım metni (markdown)
  intro_md: string | null;
  intro_md_en: string | null;
}

export interface LessonRow extends ContentBase {
  unit_id: string;
  number: number;
  title: string;
  title_tr: string | null;
  type: LessonType;
  xp: number;
  estimated_minutes: number;
  is_premium: boolean;
  sort: number;
  // Sprint 12 — type=theory için anlatım içeriği (markdown)
  theory_md: string | null;
  theory_md_en: string | null;
  theory_image_url: string | null;
}

export interface ExerciseOption {
  id: string;
  text: string;
  textTr?: string;
  audioUrl?: string;
}

export interface ExerciseRow extends ContentBase {
  lesson_id: string;
  sort: number;
  type: ExerciseType;
  vocab_term_id: string | null;
  prompt: string | null;
  prompt_tr: string | null;
  context: string | null;
  context_tr: string | null;
  options: ExerciseOption[] | null;
  correct_id: string | null;
  alt_correct_ids: string[] | null;
  explanation: string | null;
  explanation_tr: string | null;
  detailed_explanation_tr: string | null;
  audio_url: string | null;
  image_url: string | null;
  difficulty: number;
  // Sprint 10.A — tipe-özel kolonlar (nullable; CHECK constraint zorunluluğu serverda)
  pairs: ExercisePair[] | null;
  correct_order: string[] | null;
  is_true: boolean | null;
}

export interface VocabTermRow extends ContentBase {
  role: Role | 'all' | null;
  category: string | null;
  term: string;
  term_tr: string | null;
  ipa: string | null;
  pos: string | null;
  definition: string | null;
  definition_tr: string | null;
  example: string | null;
  example_tr: string | null;
  difficulty: number;
  audio_url: string | null;
  tags: string[];
  is_premium: boolean;
}

export interface InterviewQuestionRow extends ContentBase {
  role: Role;
  airline_slug: string | null;
  category: string;
  difficulty: number;
  question: string;
  question_tr: string | null;
  good_answer_points_tr: string[] | null;
  red_flags_tr: string[] | null;
  tips_tr: string[] | null;
  detailed_explanation_tr: string | null;
  star_template_tr: string | null;
  follow_up_questions: string[] | null;
}

export interface Icao4QuestionRow extends ContentBase {
  set_no: number;
  section: string;
  level: string;
  question: string;
  question_tr: string | null;
  context: string | null;
  audio_url: string | null;
  options: ExerciseOption[];
  correct_id: string;
  explanation_tr: string | null;
}

export interface OralPromptRow extends ContentBase {
  task_type: 'picture_description' | 'story_telling' | 'problem_solving' | 'common_topics';
  level: string;
  prompt: string | null;
  prompt_tr: string | null;
  cues_tr: string[] | null;
  vocabulary_tr: string[] | null;
  image_url: string | null;
  preparation_seconds: number;
  speaking_seconds: number;
}

export interface PlacementQuestionRow extends ContentBase {
  level: string;
  category: string | null;
  dimension: string;
  format: string | null;
  roles: string[];
  question: string;
  question_tr: string | null;
  context: string | null;
  options: ExerciseOption[];
  correct_id: string;
  weight: number;
}

export interface AirlineInterview {
  role: Role;
  hiringStatus: string;
  englishWeight?: number;
  requiredLevel?: string;
  totalProcessDays?: number;
  averageSalaryTryK?: number;
  stages?: Array<{ id: string; titleTr: string; durationMinutes: number; type?: string }>;
  perks?: string[];
}

export interface AirlineRow extends ContentBase {
  name: string;
  iata_code: string | null;
  country_emoji: string | null;
  hub: string | null;
  region: string | null;
  tier: string | null;
  fleet_size: number | null;
  destinations: number | null;
  prestige: number | null;
  hiring_status: string | null;
  insider_tip_tr: string | null;
  pilot_interview: AirlineInterview | null;
  cabin_interview: AirlineInterview | null;
  technician_interview: AirlineInterview | null;
  ground_interview: AirlineInterview | null;
  student_interview: AirlineInterview | null;
}

export interface ScenarioRow extends ContentBase {
  role: Role | 'all' | null;
  category: string | null;
  title: string;
  title_tr: string | null;
  setup: string | null;
  setup_tr: string | null;
  initial_message: string | null;
  goal: string | null;
  goal_tr: string | null;
  difficulty: number;
  estimated_minutes: number;
  is_premium: boolean;
  audio_intro_url: string | null;
}

// Composite tipler — hooks query'lerinde join'le döner

export interface LessonWithExercises extends LessonRow {
  exercises: ExerciseRow[];
}

export interface UnitWithLessons extends UnitRow {
  lessons: LessonRow[];
}

export interface ModuleWithUnits extends ModuleRow {
  units: UnitWithLessons[];
}
