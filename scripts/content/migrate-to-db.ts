/**
 * AirSpeak İçerik Migrasyonu — TS Seed → Supabase
 *
 * One-shot migration: tüm statik TS seed dosyalarını Supabase tablolarına yazar.
 * Idempotent — birden fazla kez çalıştırılabilir (upsert with onConflict='slug').
 *
 * Kapsam (Faz 1):
 *   - airlines (41+ havayolu)
 *   - vocab_terms (5 rol × ~60 terim = 300+)
 *   - modules → units → lessons → exercises (lessonTree.ts'tan, 5 rol)
 *     Egzersizler deterministik üretilir — sabit lesson slug → sabit exercise seti.
 *   - interview_questions (CORE + 4 ek dosya = 39+ soru)
 *   - icao4_questions (3 set × ~50 soru)
 *   - oral_prompts (31 prompt)
 *   - placement_questions (187 soru)
 *
 * Kullanım:
 *   # Dry-run (DB'ye yazmaz, sadece sayar):
 *   DRY_RUN=1 SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/content/migrate-to-db.ts
 *
 *   # Production:
 *   SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/content/migrate-to-db.ts
 *
 *   # Belirli bir kategoriyi tek başına çalıştır:
 *   ONLY=vocab,airlines SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/content/migrate-to-db.ts
 *
 * Service role key'i Supabase Dashboard'dan al:
 *   https://supabase.com/dashboard/project/neinhbkdctjtyyoskxpg/settings/api
 *   "Project API keys" → "service_role" (secret) → kopyala
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ═══════════════════════════════════════════════════════════════
// SEED IMPORTS
// ═══════════════════════════════════════════════════════════════

// Modüller / üniteler / dersler
import {
  PILOT_MODULES_FAZ1,
  CABIN_MODULES_FAZ1,
  TECHNICIAN_MODULES_FAZ1,
  GROUND_MODULES_FAZ1,
  STUDENT_MODULES_FAZ1,
  type ModuleNode,
  type UnitNode,
  type LessonNode,
} from '../../src/features/lessons/seed/lessonTree';

// Vocab havuzları
import { PILOT_VOCAB_FAZ1 } from '../../src/features/lessons/seed/pilotVocab';
import { CABIN_VOCAB_FAZ1 } from '../../src/features/lessons/seed/cabinVocab';
import { TECHNICIAN_VOCAB_FAZ1 } from '../../src/features/lessons/seed/technicianVocab';
import { GROUND_VOCAB_FAZ1 } from '../../src/features/lessons/seed/groundVocab';
import { STUDENT_VOCAB_FAZ1 } from '../../src/features/lessons/seed/studentVocab';
import type { VocabularyTerm } from '../../src/features/lessons/seed/pilotVocab';

// Egzersiz üretimi (deterministik wrapper alttaki helper'da)
import { generateExercisesForTerm } from '../../src/features/lessons/exerciseTypes';

// Mülakat soruları
import { INTERVIEW_QUESTIONS } from '../../src/features/exams/interviewQuestions';

// ICAO 4 sınav soruları
import { ICAO4_ALL_QUESTIONS } from '../../src/features/exams/icao4Questions';

// Sözlü sınav prompt'ları
import { ORAL_EXAM_PROMPTS } from '../../src/features/icao4/oralExamPrompts';

// Placement testi
import { PLACEMENT_QUESTIONS } from '../../src/features/placement/questions';

// Havayolları
import { ALL_AIRLINES } from '../../src/features/exams/airlines';

// ═══════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://neinhbkdctjtyyoskxpg.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DRY_RUN = process.env.DRY_RUN === '1';
const ONLY = process.env.ONLY?.split(',').map((s) => s.trim().toLowerCase()) ?? [];

if (!SERVICE_ROLE_KEY && !DRY_RUN) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY env değişkeni gerekli (DRY_RUN=1 ile dry-run hariç).');
  console.error('   Dashboard: https://supabase.com/dashboard/project/neinhbkdctjtyyoskxpg/settings/api');
  process.exit(1);
}

const sb: SupabaseClient = SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : (null as any);

const ROLES = ['pilot', 'cabin', 'technician', 'ground', 'student'] as const;
type Role = (typeof ROLES)[number];

const VOCAB_BY_ROLE: Record<Role, VocabularyTerm[]> = {
  pilot: PILOT_VOCAB_FAZ1,
  cabin: CABIN_VOCAB_FAZ1,
  technician: TECHNICIAN_VOCAB_FAZ1,
  ground: GROUND_VOCAB_FAZ1,
  student: STUDENT_VOCAB_FAZ1,
};

const MODULES_BY_ROLE: Record<Role, ModuleNode[]> = {
  pilot: PILOT_MODULES_FAZ1,
  cabin: CABIN_MODULES_FAZ1,
  technician: TECHNICIAN_MODULES_FAZ1,
  ground: GROUND_MODULES_FAZ1,
  student: STUDENT_MODULES_FAZ1,
};

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

/** Hash tabanlı deterministik shuffle (lesson slug seed'ine göre stabil). */
function seededShuffle<T>(arr: T[], seed: string): T[] {
  const a = [...arr];
  // FNV-1a hash
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  // Mulberry32 PRNG
  let s = h >>> 0;
  const rng = () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/** TS exercise type → DB exercise_type enum */
function mapExerciseType(tsType: string): string {
  switch (tsType) {
    case 'fill_blank':
      return 'fill-blank';
    case 'sentence_build':
      return 'order';
    case 'tr_to_en':
    case 'en_to_tr':
    case 'definition_match':
    case 'term_to_definition':
    case 'category_match':
    case 'true_false':
    default:
      return 'vocab-mc';
  }
}

/** Deterministik ders egzersizleri — aynı lesson slug = aynı 5 egzersiz (sabit sıra). */
function generateLessonExercises(
  lesson: LessonNode,
  vocabPool: VocabularyTerm[],
  count: number = 5,
): { type: string; termId: string; question: string; options: any; correctId: string; explanation: string }[] {
  const seed = lesson.id;
  // Lesson tipine göre vocab seçimi:
  //   - lesson.id'deki sayı (ör. "lesson_pilot_m1_u2_l3" → 3) ile ofset
  // 5 vocab × 8 exercise tipi = 40 exercise üret, deterministik shuffle, ilk 5'i al.
  const shuffledVocab = seededShuffle(vocabPool, seed);
  const selected = shuffledVocab.slice(0, Math.max(count, 5));
  const allExercises: any[] = [];
  for (const term of selected) {
    const ex = generateExercisesForTerm(term, vocabPool);
    allExercises.push(...ex);
  }
  // Deterministik tip çeşitliliği — type başına max 2
  const shuffled = seededShuffle(allExercises, seed + '_pick');
  const final: any[] = [];
  const typeCount: Record<string, number> = {};
  for (const ex of shuffled) {
    const cur = typeCount[ex.type] ?? 0;
    if (cur >= 2 && final.length < count) continue;
    final.push(ex);
    typeCount[ex.type] = cur + 1;
    if (final.length >= count) break;
  }
  if (final.length < count) {
    for (const ex of shuffled) {
      if (final.find((s) => s.id === ex.id)) continue;
      final.push(ex);
      if (final.length >= count) break;
    }
  }
  return final.slice(0, count);
}

/** Toplu upsert — Supabase 1000 row limit ile chunked. */
async function batchUpsert<T extends Record<string, any>>(
  table: string,
  rows: T[],
  conflictKey: string = 'slug',
): Promise<number> {
  if (rows.length === 0) return 0;
  if (DRY_RUN) {
    return rows.length;
  }
  const CHUNK = 500;
  let total = 0;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const { error } = await sb.from(table).upsert(chunk, { onConflict: conflictKey });
    if (error) {
      console.error(`❌ ${table} upsert error (chunk ${i / CHUNK + 1}):`, error.message);
      throw error;
    }
    total += chunk.length;
  }
  return total;
}

function shouldRun(category: string): boolean {
  if (ONLY.length === 0) return true;
  return ONLY.includes(category);
}

// ═══════════════════════════════════════════════════════════════
// MIGRATION STEPS
// ═══════════════════════════════════════════════════════════════

async function migrateAirlines(): Promise<number> {
  if (!shouldRun('airlines')) return 0;
  const rows = ALL_AIRLINES.map((a) => ({
    slug: a.id,
    name: a.name,
    iata_code: a.iataCode,
    country_emoji: a.countryEmoji,
    hub: a.hub,
    region: a.region,
    tier: a.tier,
    fleet_size: a.fleetSize,
    destinations: a.destinations,
    prestige: a.prestige,
    hiring_status: a.interviews[0]?.hiringStatus ?? 'closed',
    insider_tip_tr: (a as any).insiderTipTr ?? null,
    pilot_interview: a.interviews.find((i) => i.role === 'pilot') ?? null,
    cabin_interview: a.interviews.find((i) => i.role === 'cabin') ?? null,
    technician_interview: a.interviews.find((i) => i.role === 'technician') ?? null,
    ground_interview: a.interviews.find((i) => i.role === 'ground') ?? null,
    student_interview: a.interviews.find((i) => i.role === 'student') ?? null,
    status: 'published',
  }));
  return await batchUpsert('airlines', rows);
}

async function migrateVocab(): Promise<number> {
  if (!shouldRun('vocab')) return 0;
  let total = 0;
  for (const role of ROLES) {
    const vocab = VOCAB_BY_ROLE[role];
    const rows = vocab.map((v) => ({
      slug: v.id,
      role,
      category: v.category,
      term: v.term,
      term_tr: v.termTr,
      ipa: v.pronunciation,
      pos: null,
      definition: v.definitionEn,
      definition_tr: v.definitionTr,
      example: v.examples?.[0]?.en ?? null,
      example_tr: v.examples?.[0]?.tr ?? null,
      difficulty: v.difficulty,
      audio_url: null,
      tags: (v as any).tags ?? [],
      is_premium: false,
      status: 'published',
    }));
    total += await batchUpsert('vocab_terms', rows);
  }
  return total;
}

interface SlugIdMap {
  [slug: string]: string;
}

async function fetchVocabSlugMap(): Promise<SlugIdMap> {
  if (DRY_RUN) return {};
  const map: SlugIdMap = {};
  let from = 0;
  const PAGE = 1000;
  while (true) {
    const { data, error } = await sb
      .from('vocab_terms')
      .select('id, slug')
      .range(from, from + PAGE - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    for (const r of data) map[r.slug] = r.id;
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return map;
}

async function fetchSlugIdMap(table: string): Promise<SlugIdMap> {
  if (DRY_RUN) return {};
  const map: SlugIdMap = {};
  let from = 0;
  const PAGE = 1000;
  while (true) {
    const { data, error } = await sb
      .from(table)
      .select('id, slug')
      .range(from, from + PAGE - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    for (const r of data) map[r.slug] = r.id;
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return map;
}

async function migrateHierarchy(): Promise<{ modules: number; units: number; lessons: number; exercises: number }> {
  if (!shouldRun('hierarchy') && !shouldRun('modules')) {
    return { modules: 0, units: 0, lessons: 0, exercises: 0 };
  }

  const stats = { modules: 0, units: 0, lessons: 0, exercises: 0 };
  const vocabSlugMap = await fetchVocabSlugMap();

  // ──────── 1. Modules — batch upsert tüm rolleri tek seferde ────────
  const allModuleRows: any[] = [];
  for (const role of ROLES) {
    for (const mod of MODULES_BY_ROLE[role]) {
      allModuleRows.push({
        slug: mod.id,
        role,
        number: mod.number,
        title: mod.title,
        title_tr: null,
        description: mod.description,
        description_tr: mod.description,
        badge: mod.badge,
        reward_xp: mod.rewardXp,
        status: 'published',
        sort: mod.number,
      });
    }
  }
  stats.modules = await batchUpsert('modules', allModuleRows);
  console.log(`    [batch] ${allModuleRows.length} modül upsert`);
  const moduleSlugMap = await fetchSlugIdMap('modules');

  // ──────── 2. Units — module_id'i map'ten al, batch ────────
  const allUnitRows: any[] = [];
  for (const role of ROLES) {
    for (const mod of MODULES_BY_ROLE[role]) {
      for (const unit of mod.units) {
        allUnitRows.push({
          slug: unit.id,
          module_id: moduleSlugMap[mod.id],
          number: unit.number,
          title: unit.title,
          title_tr: null,
          description: unit.description,
          description_tr: unit.description,
          badge: unit.badge ?? null,
          status: 'published',
          sort: unit.number,
        });
      }
    }
  }
  stats.units = await batchUpsert('units', allUnitRows);
  console.log(`    [batch] ${allUnitRows.length} ünite upsert`);
  const unitSlugMap = await fetchSlugIdMap('units');

  // ──────── 3. Lessons — unit_id batch ────────
  const allLessonRows: any[] = [];
  for (const role of ROLES) {
    for (const mod of MODULES_BY_ROLE[role]) {
      for (const unit of mod.units) {
        for (const [idx, lesson] of unit.lessons.entries()) {
          allLessonRows.push({
            slug: lesson.id,
            unit_id: unitSlugMap[unit.id],
            number: (lesson as any).number ?? idx + 1,
            title: lesson.title,
            title_tr: null,
            type: lesson.type,
            xp: lesson.xp,
            estimated_minutes: lesson.estimatedMinutes,
            is_premium: lesson.isPremium,
            status: 'published',
            sort: idx,
          });
        }
      }
    }
  }
  stats.lessons = await batchUpsert('lessons', allLessonRows);
  console.log(`    [batch] ${allLessonRows.length} ders upsert`);
  const lessonSlugMap = await fetchSlugIdMap('lessons');

  // ──────── 4. Exercises — deterministik üret + batch ────────
  const allExerciseRows: any[] = [];
  for (const role of ROLES) {
    const vocabPool = VOCAB_BY_ROLE[role];
    for (const mod of MODULES_BY_ROLE[role]) {
      for (const unit of mod.units) {
        for (const lesson of unit.lessons) {
          const exercises = generateLessonExercises(lesson, vocabPool, 5);
          for (const [idx, ex] of exercises.entries()) {
            allExerciseRows.push({
              slug: `${lesson.id}__ex${idx}`,
              lesson_id: lessonSlugMap[lesson.id],
              sort: idx,
              type: mapExerciseType(ex.type),
              vocab_term_id: vocabSlugMap[ex.termId] ?? null,
              prompt: ex.question,
              prompt_tr: ex.question,
              options: ex.options,
              correct_id: ex.correctId,
              explanation: null,
              explanation_tr: ex.explanation,
              difficulty: 2,
              status: 'published',
            });
          }
        }
      }
    }
  }
  stats.exercises = await batchUpsert('exercises', allExerciseRows);
  console.log(`    [batch] ${allExerciseRows.length} egzersiz upsert`);

  return stats;
}

async function migrateInterviews(): Promise<number> {
  if (!shouldRun('interviews')) return 0;
  // Her soru kayıt başına 1 row (ama soru birden fazla rol içerebilir → role bazlı kopya)
  const rows: any[] = [];
  const seenSlugs = new Set<string>();
  for (const q of INTERVIEW_QUESTIONS) {
    for (const role of q.roles) {
      // Slug: role ile birleştirilir (aynı sorunun farklı rol için ayrı kaydı olabilir)
      const slug = q.roles.length > 1 ? `${q.id}__${role}` : q.id;
      if (seenSlugs.has(slug)) continue;
      seenSlugs.add(slug);
      // Airlines: array'de birden fazla varsa ilkini al; tier'a düşeriz
      const airlineSlug = q.airlineIds && q.airlineIds.length > 0 ? q.airlineIds[0] : null;
      // Category map: airlineTypes'tan gelir, DB'deki check ile eşleşmesi gerekiyor
      const categoryMap: Record<string, string> = {
        icebreaker: 'motivational',
        motivation: 'motivational',
        technical: 'technical',
        behavioral: 'behavioral',
        situational: 'situational',
        english: 'english',
        company_knowledge: 'culture_knowledge',
        group_exercise: 'role_specific',
        role_play: 'role_specific',
        cv_based: 'behavioral',
        tricky: 'tricky',
      };
      const category = categoryMap[q.category] ?? 'role_specific';

      rows.push({
        slug,
        role,
        airline_slug: airlineSlug,
        category,
        difficulty: q.difficulty,
        question: q.question,
        question_tr: null,
        good_answer_points_tr: q.goodAnswerPointsTr,
        red_flags_tr: q.redFlagsTr,
        tips_tr: q.tipsTr,
        detailed_explanation_tr: (q as any).detailedExplanationTr ?? null,
        star_template_tr: q.sampleAnswerTr,
        follow_up_questions: null,
        status: 'published',
      });
    }
  }
  return await batchUpsert('interview_questions', rows);
}

async function migrateIcao4(): Promise<number> {
  if (!shouldRun('icao4')) return 0;
  const rows = ICAO4_ALL_QUESTIONS.map((q: any) => {
    // sectionId formatı: "icao4-set1-vocab", "icao4-set2-listening" vs.
    // Set numarasını ve section'ı bölelim.
    const sectionId: string = q.sectionId ?? '';
    const setMatch = sectionId.match(/set([1-3])/);
    const setNo = setMatch ? parseInt(setMatch[1]!) : 1;
    let section = 'vocabulary';
    if (sectionId.includes('listening')) section = 'listening';
    else if (sectionId.includes('reading')) section = 'reading';
    else if (sectionId.includes('phraseology') || sectionId.includes('frase')) section = 'phraseology';

    return {
      slug: q.id,
      set_no: setNo,
      section,
      level: q.level,
      question: q.question,
      question_tr: null,
      context: q.context ?? null,
      audio_url: q.audioUrl ?? null,
      options: q.options,
      correct_id: q.correctId,
      explanation_tr: q.explanationTr,
      status: 'published',
    };
  });
  return await batchUpsert('icao4_questions', rows);
}

async function migrateOral(): Promise<number> {
  if (!shouldRun('oral')) return 0;
  const rows = ORAL_EXAM_PROMPTS.map((p: any) => ({
    slug: p.id,
    task_type: p.taskType,
    level: p.difficultyHint ?? 'B2',
    prompt: p.prompt,
    prompt_tr: null,
    cues_tr: p.followUps ?? [],
    vocabulary_tr: p.expectedTopics ?? [],
    image_url: null,
    preparation_seconds: 30,
    speaking_seconds: 90,
    status: 'published',
  }));
  return await batchUpsert('oral_prompts', rows);
}

async function migratePlacement(): Promise<number> {
  if (!shouldRun('placement')) return 0;
  const rows = PLACEMENT_QUESTIONS.map((q: any) => ({
    slug: q.id,
    level: q.level,
    category: q.category ?? null,
    dimension: (q.dimension ?? 'general_english')
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase()
      .replace(/^_/, ''), // generalEnglish → general_english
    format: q.format ?? null,
    roles: q.roles ?? ['all'],
    question: q.question,
    question_tr: q.questionTr ?? null,
    context: q.context ?? null,
    options: q.options,
    correct_id: q.correctId,
    weight: 1,
    status: 'published',
  }));
  return await batchUpsert('placement_questions', rows);
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  AirSpeak Content Migration — TS Seed → Supabase');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Mod: ${DRY_RUN ? 'DRY_RUN (yazmaz)' : 'PRODUCTION (yazar)'}`);
  console.log(`  URL: ${SUPABASE_URL}`);
  console.log(`  Filter: ${ONLY.length === 0 ? 'TÜMÜ' : ONLY.join(',')}`);
  console.log('───────────────────────────────────────────────────────────');

  const t0 = Date.now();
  const stats: Record<string, number> = {};

  // 1. Airlines önce (interview_questions'ın FK referans olabilmesi için)
  console.log('▸ airlines...');
  stats.airlines = await migrateAirlines();
  console.log(`  ✓ ${stats.airlines} havayolu`);

  // 2. Vocab — exercises bunlara FK
  console.log('▸ vocab_terms...');
  stats.vocab = await migrateVocab();
  console.log(`  ✓ ${stats.vocab} kelime`);

  // 3. Modules → Units → Lessons → Exercises
  console.log('▸ modules → units → lessons → exercises...');
  const hierarchy = await migrateHierarchy();
  stats.modules = hierarchy.modules;
  stats.units = hierarchy.units;
  stats.lessons = hierarchy.lessons;
  stats.exercises = hierarchy.exercises;
  console.log(`  ✓ ${stats.modules} modül, ${stats.units} ünite, ${stats.lessons} ders, ${stats.exercises} egzersiz`);

  // 4. Interview questions
  console.log('▸ interview_questions...');
  stats.interviews = await migrateInterviews();
  console.log(`  ✓ ${stats.interviews} mülakat sorusu`);

  // 5. ICAO 4
  console.log('▸ icao4_questions...');
  stats.icao4 = await migrateIcao4();
  console.log(`  ✓ ${stats.icao4} ICAO 4 sorusu`);

  // 6. Oral prompts
  console.log('▸ oral_prompts...');
  stats.oral = await migrateOral();
  console.log(`  ✓ ${stats.oral} sözlü prompt`);

  // 7. Placement
  console.log('▸ placement_questions...');
  stats.placement = await migratePlacement();
  console.log(`  ✓ ${stats.placement} placement sorusu`);

  const dt = ((Date.now() - t0) / 1000).toFixed(1);

  console.log('───────────────────────────────────────────────────────────');
  console.log(`  ${DRY_RUN ? 'DRY_RUN ' : ''}TAMAMLANDI · ${dt}s`);
  console.log('  Özet:');
  for (const [k, v] of Object.entries(stats)) {
    console.log(`    ${k.padEnd(15)} ${v}`);
  }
  console.log('═══════════════════════════════════════════════════════════');
}

main().catch((err) => {
  console.error('❌ Migration başarısız:', err);
  process.exit(1);
});
