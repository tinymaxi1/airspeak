/**
 * Bulk import — Zod schema'ları (per-table row validation).
 *
 * Kural: payload'da `slug` ve `status` alanları KABUL EDİLMEZ.
 * - slug → server her satır için otomatik üretir
 * - status → her satır 'draft' olarak yazılır (defansif: yanlışlıkla
 *   yayında saçma içerik olmasın, admin manuel publish eder)
 *
 * .strict() ile bilinmeyen / yasaklı alanlar hatayla raporlanır.
 */
import { z } from 'zod';

const optionRow = z.object({
  id: z.string().min(1).max(2),
  text: z.string().min(1),
});

const fourOptionsArray = z.array(optionRow).length(4, '4 şık zorunlu');

const ROLES = ['pilot', 'cabin', 'technician', 'ground', 'student', 'all'] as const;
const SCENARIO_CATEGORIES = [
  'atc', 'cabin_emergency', 'maintenance_call', 'gate_announcement',
  'pre_flight', 'post_flight', 'irrops', 'medical', 'security',
] as const;
const ICAO4_SECTIONS = [
  'vocabulary', 'phraseology', 'listening', 'reading', 'grammar', 'critical',
] as const;
const PLACEMENT_DIMENSIONS = [
  'general_english', 'aviation_english', 'aviation_knowledge', 'communication',
] as const;
const PLACEMENT_FORMATS = ['short', 'passage', 'scenario'] as const;
const ICAO4_LEVELS = ['B1', 'B2', 'B2+', 'C1'] as const;
const PLACEMENT_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'] as const;
const ORAL_TASK_TYPES = [
  'picture_description', 'story_telling', 'problem_solving', 'common_topics',
] as const;
const EXERCISE_TYPES = [
  'vocab-mc', 'fill-blank', 'dialogue-fill', 'listening-mc',
  'pronunciation-record', 'match', 'order', 'drag-drop', 'open-text',
] as const;

// ─────────────────────────────────────────────
// VOCAB TERMS
// ─────────────────────────────────────────────
export const vocabTermSchema = z
  .object({
    role: z.enum(ROLES).optional().default('all'),
    category: z.string().nullable().optional(),
    term: z.string().min(1, 'term zorunlu'),
    term_tr: z.string().nullable().optional(),
    ipa: z.string().nullable().optional(),
    pos: z.string().nullable().optional(),
    definition: z.string().nullable().optional(),
    definition_tr: z.string().nullable().optional(),
    example: z.string().nullable().optional(),
    example_tr: z.string().nullable().optional(),
    difficulty: z.number().int().min(1).max(5).optional().default(2),
    audio_url: z.string().nullable().optional(),
    tags: z.array(z.string()).optional().default([]),
    is_premium: z.boolean().optional().default(false),
  })
  .strict();

// ─────────────────────────────────────────────
// ORAL PROMPTS
// ─────────────────────────────────────────────
export const oralPromptSchema = z
  .object({
    task_type: z.enum(ORAL_TASK_TYPES),
    level: z.enum(ICAO4_LEVELS),
    prompt: z.string().nullable().optional(),
    prompt_tr: z.string().nullable().optional(),
    cues_tr: z.array(z.string()).optional().default([]),
    vocabulary_tr: z.array(z.string()).optional().default([]),
    image_url: z.string().nullable().optional(),
    preparation_seconds: z.number().int().min(0).optional().default(30),
    speaking_seconds: z.number().int().min(1).optional().default(90),
  })
  .strict();

// ─────────────────────────────────────────────
// ICAO 4 QUESTIONS
// ─────────────────────────────────────────────
export const icao4QuestionSchema = z
  .object({
    set_no: z.number().int().min(1).max(5),
    section: z.enum(ICAO4_SECTIONS),
    level: z.enum(ICAO4_LEVELS),
    question: z.string().min(1, 'question zorunlu'),
    question_tr: z.string().nullable().optional(),
    context: z.string().nullable().optional(),
    audio_url: z.string().nullable().optional(),
    options: fourOptionsArray,
    correct_id: z.string().min(1).max(2),
    explanation_tr: z.string().nullable().optional(),
  })
  .strict()
  .refine((d) => d.options.some((o) => o.id === d.correct_id), {
    message: 'correct_id options içinde olmalı',
    path: ['correct_id'],
  });

// ─────────────────────────────────────────────
// PLACEMENT QUESTIONS
// ─────────────────────────────────────────────
export const placementQuestionSchema = z
  .object({
    dimension: z.enum(PLACEMENT_DIMENSIONS),
    level: z.enum(PLACEMENT_LEVELS),
    category: z.string().nullable().optional(),
    format: z.enum(PLACEMENT_FORMATS).optional().default('short'),
    roles: z.array(z.enum(ROLES)).optional().default(['all']),
    question: z.string().min(1, 'question zorunlu'),
    question_tr: z.string().nullable().optional(),
    context: z.string().nullable().optional(),
    options: fourOptionsArray,
    correct_id: z.string().min(1).max(2),
    weight: z.number().int().min(1).max(5).optional().default(1),
  })
  .strict()
  .refine((d) => d.options.some((o) => o.id === d.correct_id), {
    message: 'correct_id options içinde olmalı',
    path: ['correct_id'],
  });

// ─────────────────────────────────────────────
// SCENARIOS
// ─────────────────────────────────────────────
export const scenarioSchema = z
  .object({
    role: z.enum(ROLES).optional().default('all'),
    category: z.enum(SCENARIO_CATEGORIES),
    title: z.string().min(1, 'title zorunlu'),
    title_tr: z.string().nullable().optional(),
    setup: z.string().nullable().optional(),
    setup_tr: z.string().nullable().optional(),
    initial_message: z.string().nullable().optional(),
    goal: z.string().nullable().optional(),
    goal_tr: z.string().nullable().optional(),
    difficulty: z.number().int().min(1).max(5).optional().default(3),
    estimated_minutes: z.number().int().min(1).optional().default(5),
    is_premium: z.boolean().optional().default(false),
    audio_intro_url: z.string().nullable().optional(),
  })
  .strict();

// ─────────────────────────────────────────────
// EXERCISES (lesson_slug payload'da zorunlu)
// ─────────────────────────────────────────────
export const exerciseSchema = z
  .object({
    lesson_slug: z.string().min(1, "lesson_slug zorunlu — hangi lesson'a ait olduğunu belirt"),
    sort: z.number().int().min(0),
    type: z.enum(EXERCISE_TYPES),
    vocab_term_slug: z.string().nullable().optional(),
    prompt: z.string().nullable().optional(),
    prompt_tr: z.string().nullable().optional(),
    context: z.string().nullable().optional(),
    context_tr: z.string().nullable().optional(),
    options: z.array(optionRow).nullable().optional(),
    correct_id: z.string().nullable().optional(),
    alt_correct_ids: z.array(z.string()).nullable().optional(),
    explanation: z.string().nullable().optional(),
    explanation_tr: z.string().nullable().optional(),
    detailed_explanation_tr: z.string().nullable().optional(),
    audio_url: z.string().nullable().optional(),
    image_url: z.string().nullable().optional(),
    difficulty: z.number().int().min(1).max(5).optional().default(2),
  })
  .strict();

// ─────────────────────────────────────────────
// REGISTRY
// ─────────────────────────────────────────────
export const IMPORT_SCHEMAS = {
  vocab_terms: vocabTermSchema,
  oral_prompts: oralPromptSchema,
  icao4_questions: icao4QuestionSchema,
  placement_questions: placementQuestionSchema,
  scenarios: scenarioSchema,
  exercises: exerciseSchema,
} as const;

export type ImportTable = keyof typeof IMPORT_SCHEMAS;

export const IMPORT_TABLES: ImportTable[] = [
  'vocab_terms',
  'oral_prompts',
  'icao4_questions',
  'placement_questions',
  'scenarios',
  'exercises',
];

export const TABLE_LABEL: Record<ImportTable, string> = {
  vocab_terms: 'Kelime Terimleri',
  oral_prompts: 'Sözlü Sınav Promptları',
  icao4_questions: 'ICAO 4 Soruları',
  placement_questions: 'Placement Soruları',
  scenarios: 'AI Senaryolar',
  exercises: 'Egzersizler',
};
