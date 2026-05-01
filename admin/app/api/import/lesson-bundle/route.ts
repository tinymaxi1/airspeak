/**
 * POST /api/import/lesson-bundle — Sprint 10.C
 *
 * Body:
 *   {
 *     "lesson_slug": "tech-a1-engine-basics",
 *     "vocab": [...vocab_terms rows...],
 *     "exercises": [...exercises rows (lesson_slug auto-injected)...]
 *   }
 *
 * Akış:
 *   1. lesson_slug → lesson_id resolve (yoksa 422)
 *   2. vocab[] validate + slug üret + insert (vocab_term_id'ler döner)
 *   3. exercises[] validate + lesson_slug inject + normalize + insert
 *   4. Hata: vocab eklendiyse cleanup (best-effort rollback)
 *
 * Yetki: super_admin
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { requireAdminRole } from '@/lib/auth/guard';
import { vocabTermSchema, exerciseSchema } from '@/lib/import/schemas';
import { normalizeRows } from '@/lib/import/handlers';
import { uniqueSlug } from '@/lib/content/slug';

// exercise schema'dan lesson_slug'ı çıkar (top-level body'den inject edilecek)
const exerciseSchemaWithoutLesson = exerciseSchema.innerType
  ? exerciseSchema
  : exerciseSchema; // strict() innerType yoksa olduğu gibi kullan
// Pratikte: bundle exercises içinde lesson_slug yazmaya gerek yok; biz inject ediyoruz.
// Schema reuse için schema'yı geçici olarak partial yapıyoruz lesson_slug için.
const exerciseBundleItemSchema = z
  .object({
    sort: z.number().int().min(0),
    type: z.enum([
      'vocab-mc', 'fill-blank', 'dialogue-fill', 'listening-mc',
      'pronunciation-record', 'match', 'order', 'drag-drop', 'open-text',
      'matching', 'ordering', 'true_false',
    ] as const),
    vocab_term_slug: z.string().nullable().optional(),
    prompt: z.string().nullable().optional(),
    prompt_tr: z.string().nullable().optional(),
    context: z.string().nullable().optional(),
    context_tr: z.string().nullable().optional(),
    options: z.array(z.object({ id: z.string().min(1).max(2), text: z.string().min(1) })).nullable().optional(),
    correct_id: z.string().nullable().optional(),
    alt_correct_ids: z.array(z.string()).nullable().optional(),
    explanation: z.string().nullable().optional(),
    explanation_tr: z.string().nullable().optional(),
    detailed_explanation_tr: z.string().nullable().optional(),
    audio_url: z.string().nullable().optional(),
    image_url: z.string().nullable().optional(),
    difficulty: z.number().int().min(1).max(5).optional().default(2),
    // Sprint 10.A yeni kolonlar
    pairs: z.array(z.object({ id: z.string(), left: z.string(), right: z.string() })).nullable().optional(),
    correct_order: z.array(z.string()).nullable().optional(),
    is_true: z.boolean().nullable().optional(),
  })
  .strict();

const bundleSchema = z.object({
  lesson_slug: z.string().min(1, 'lesson_slug zorunlu'),
  vocab: z.array(vocabTermSchema).optional().default([]),
  exercises: z.array(exerciseBundleItemSchema).optional().default([]),
});

interface RowError {
  row: number;
  section?: 'vocab' | 'exercises';
  message: string;
  detail?: string;
}

export async function POST(req: NextRequest) {
  await requireAdminRole('super_admin');

  // 1. Body parse + validate
  const raw = await req.json().catch(() => null);
  if (!raw) {
    return NextResponse.json(
      { ok: false, errors: [{ row: -1, message: 'Geçersiz JSON' }] },
      { status: 400 },
    );
  }
  const parsed = bundleSchema.safeParse(raw);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((i) => ({
      row: -1,
      message: 'Bundle validation',
      detail: `${i.path.join('.') || '<root>'}: ${i.message}`,
    }));
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }
  const body = parsed.data;

  // Vocab+exercise toplam 0 ise reject
  if (body.vocab.length === 0 && body.exercises.length === 0) {
    return NextResponse.json(
      { ok: false, errors: [{ row: -1, message: 'En az 1 vocab veya 1 exercise gerekli' }] },
      { status: 400 },
    );
  }

  // Limit (5000 toplam)
  if (body.vocab.length + body.exercises.length > 5000) {
    return NextResponse.json(
      { ok: false, errors: [{ row: -1, message: 'Max 5000 toplam satır (vocab+exercises)' }] },
      { status: 400 },
    );
  }

  const supabase = await createClient();

  // 2. lesson_slug resolve
  const { data: lessonRow, error: lesErr } = await (supabase as any)
    .from('lessons')
    .select('id, slug')
    .eq('slug', body.lesson_slug)
    .maybeSingle();

  if (lesErr) {
    return NextResponse.json(
      { ok: false, errors: [{ row: -1, message: `lesson lookup hatası: ${lesErr.message}` }] },
      { status: 500 },
    );
  }
  if (!lessonRow) {
    return NextResponse.json(
      {
        ok: false,
        errors: [{ row: -1, message: `lesson_slug bulunamadı: "${body.lesson_slug}"` }],
      },
      { status: 422 },
    );
  }

  const lessonId = (lessonRow as any).id as string;

  // 3. Vocab insert (slug üret)
  let insertedVocabIds: string[] = [];
  if (body.vocab.length > 0) {
    const vocabRows = body.vocab.map((v) => ({
      ...v,
      slug: uniqueSlug(v.term, `vocab_${v.role ?? 'all'}`),
      status: 'draft' as const,
    }));
    const { data: vocabIns, error: vocabErr } = await (supabase as any)
      .from('vocab_terms')
      .insert(vocabRows)
      .select('id, slug');
    if (vocabErr) {
      return NextResponse.json(
        {
          ok: false,
          errors: [
            { row: -1, section: 'vocab', message: `vocab insert hatası: ${vocabErr.message}` },
          ],
        },
        { status: 500 },
      );
    }
    insertedVocabIds = ((vocabIns ?? []) as { id: string }[]).map((r) => r.id);
  }

  // 4. Exercises insert (lesson_slug inject + normalize)
  let insertedExerciseCount = 0;
  if (body.exercises.length > 0) {
    const exRows = body.exercises.map((e) => ({
      ...e,
      lesson_slug: body.lesson_slug, // top-level inject
    }));

    // Mevcut normalizer kullan — lesson_id + vocab_term_slug→id resolve
    const normalized = await normalizeRows('exercises', exRows, supabase as any);
    if (!normalized.ok) {
      // ROLLBACK best-effort: yeni eklenen vocab'ları sil
      if (insertedVocabIds.length > 0) {
        await (supabase as any).from('vocab_terms').delete().in('id', insertedVocabIds);
      }
      return NextResponse.json(
        {
          ok: false,
          errors: normalized.errors.map((e) => ({ ...e, section: 'exercises' as const })),
        },
        { status: 422 },
      );
    }

    const { data: exIns, error: exErr } = await (supabase as any)
      .from('exercises')
      .insert(normalized.rows)
      .select('id');

    if (exErr) {
      // ROLLBACK
      if (insertedVocabIds.length > 0) {
        await (supabase as any).from('vocab_terms').delete().in('id', insertedVocabIds);
      }
      return NextResponse.json(
        {
          ok: false,
          errors: [
            { row: -1, section: 'exercises', message: `exercise insert hatası: ${exErr.message}` },
          ],
        },
        { status: 500 },
      );
    }

    insertedExerciseCount = (exIns ?? []).length;
  }

  // 5. Audit
  await (supabase as any).rpc('log_admin_action', {
    p_action: 'import',
    p_table_name: 'lesson_bundle',
    p_metadata: {
      lesson_slug: body.lesson_slug,
      lesson_id: lessonId,
      vocab_count: insertedVocabIds.length,
      exercise_count: insertedExerciseCount,
      source: 'lesson_bundle',
    },
  });

  return NextResponse.json({
    ok: true,
    lesson_id: lessonId,
    vocab_count: insertedVocabIds.length,
    exercise_count: insertedExerciseCount,
  });
}
