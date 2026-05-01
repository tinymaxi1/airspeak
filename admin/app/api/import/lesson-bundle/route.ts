/**
 * POST /api/import/lesson-bundle — Sprint 10.C/E
 *
 * Body — iki format kabul (backward compat):
 *   1. Tek bundle:  { lesson_slug, vocab[], exercises[] }
 *   2. Çoklu bundle: [ { lesson_slug, vocab[], exercises[] }, ... ]
 *
 * Akış (multi):
 *   1. Tüm lesson_slug'ları tek lookup ile resolve (yoksa 422)
 *   2. Bundle başına vocab insert (slug üret) + exercises insert
 *      (lesson_slug inject, normalizeRows reuse)
 *   3. Hata: şimdiye kadar eklenen vocab+exercise ID'leri cleanup
 *      (best-effort rollback — Supabase JS SDK transaction yok)
 *
 * Yetki: super_admin
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { requireAdminRole } from '@/lib/auth/guard';
import { vocabTermSchema } from '@/lib/import/schemas';
import { normalizeRows } from '@/lib/import/handlers';
import { uniqueSlug } from '@/lib/content/slug';

// Bundle exercise schema (lesson_slug body top-level'da)
const exerciseBundleItemSchema = z
  .object({
    sort: z.number().int().min(0),
    type: z.enum([
      // Eski naming
      'vocab-mc', 'fill-blank', 'dialogue-fill', 'listening-mc',
      'pronunciation-record', 'match', 'order', 'drag-drop', 'open-text',
      // Sprint 10.A yeni
      'matching', 'ordering', 'true_false',
      // Sprint 10.E yeni naming
      'fill_blank', 'listening', 'speaking',
    ] as const),
    vocab_term_slug: z.string().nullable().optional(),
    prompt: z.string().nullable().optional(),
    prompt_tr: z.string().nullable().optional(),
    context: z.string().nullable().optional(),
    context_tr: z.string().nullable().optional(),
    options: z
      .array(z.object({ id: z.string().min(1).max(4), text: z.string().min(1) }))
      .nullable()
      .optional(),
    correct_id: z.string().nullable().optional(),
    alt_correct_ids: z.array(z.string()).nullable().optional(),
    explanation: z.string().nullable().optional(),
    explanation_tr: z.string().nullable().optional(),
    detailed_explanation_tr: z.string().nullable().optional(),
    audio_url: z.string().nullable().optional(),
    image_url: z.string().nullable().optional(),
    difficulty: z.number().int().min(1).max(5).optional().default(2),
    // Sprint 10.A: matching pairs, ordering correct_order, true_false is_true
    pairs: z
      .array(z.object({ id: z.string(), left: z.string(), right: z.string() }))
      .nullable()
      .optional(),
    // correct_order: string id'ler veya 0-based number indexes (normalize'da id'ye çevrilir)
    correct_order: z.array(z.union([z.string(), z.number()])).nullable().optional(),
    is_true: z.boolean().nullable().optional(),
    // Sprint 10.E: listening transcript, speaking target_text
    transcript: z.string().nullable().optional(),
    target_text: z.string().nullable().optional(),
  })
  .strict();

const bundleSchema = z.object({
  lesson_slug: z.string().min(1, 'lesson_slug zorunlu'),
  vocab: z.array(vocabTermSchema).optional().default([]),
  exercises: z.array(exerciseBundleItemSchema).optional().default([]),
});

// Tek bundle veya array — backward compat
const bodySchema = z.union([bundleSchema, z.array(bundleSchema).min(1, 'En az 1 bundle')]);

interface RowError {
  row: number;
  bundle?: number;
  section?: 'vocab' | 'exercises';
  message: string;
  detail?: string;
}

interface BundleResult {
  lesson_slug: string;
  lesson_id: string;
  vocab_count: number;
  exercise_count: number;
}

const MAX_TOTAL_ROWS = 5000;

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
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((i) => ({
      row: -1,
      message: 'Bundle validation',
      detail: `${i.path.join('.') || '<root>'}: ${i.message}`,
    }));
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  // Normalize: tek bundle → array
  const bundles = Array.isArray(parsed.data) ? parsed.data : [parsed.data];

  // 2. Toplam satır kontrolü
  let total = 0;
  for (const b of bundles) total += b.vocab.length + b.exercises.length;
  if (total === 0) {
    return NextResponse.json(
      { ok: false, errors: [{ row: -1, message: 'En az 1 vocab veya 1 exercise gerekli' }] },
      { status: 400 },
    );
  }
  if (total > MAX_TOTAL_ROWS) {
    return NextResponse.json(
      { ok: false, errors: [{ row: -1, message: `Max ${MAX_TOTAL_ROWS} toplam satır` }] },
      { status: 400 },
    );
  }

  const supabase = await createClient();

  // 3. Tüm lesson_slug'ları tek lookup ile resolve
  const lessonSlugs = Array.from(new Set(bundles.map((b) => b.lesson_slug)));
  const { data: lessonsData, error: lesErr } = await (supabase as any)
    .from('lessons')
    .select('id, slug')
    .in('slug', lessonSlugs);

  if (lesErr) {
    return NextResponse.json(
      { ok: false, errors: [{ row: -1, message: `lesson lookup hatası: ${lesErr.message}` }] },
      { status: 500 },
    );
  }

  const lessonMap = new Map<string, string>();
  for (const r of ((lessonsData ?? []) as { id: string; slug: string }[])) {
    lessonMap.set(r.slug, r.id);
  }

  const missingSlugs = lessonSlugs.filter((s) => !lessonMap.has(s));
  if (missingSlugs.length > 0) {
    return NextResponse.json(
      {
        ok: false,
        errors: missingSlugs.map((s, i) => ({
          row: -1,
          message: `lesson_slug bulunamadı: "${s}"`,
        })),
      },
      { status: 422 },
    );
  }

  // 4. Bundle başına process — best-effort rollback için ID'leri tut
  const insertedVocabIds: string[] = [];
  const insertedExerciseIds: string[] = [];
  const results: BundleResult[] = [];

  async function rollback() {
    if (insertedExerciseIds.length > 0) {
      await (supabase as any).from('exercises').delete().in('id', insertedExerciseIds);
    }
    if (insertedVocabIds.length > 0) {
      await (supabase as any).from('vocab_terms').delete().in('id', insertedVocabIds);
    }
  }

  for (let bi = 0; bi < bundles.length; bi++) {
    const b = bundles[bi]!;
    const lessonId = lessonMap.get(b.lesson_slug)!;
    let bundleVocabCount = 0;
    let bundleExerciseCount = 0;

    // Vocab insert
    if (b.vocab.length > 0) {
      const vocabRows = b.vocab.map((v) => ({
        ...v,
        slug: uniqueSlug(v.term, `vocab_${v.role ?? 'all'}`),
        status: 'draft' as const,
      }));
      const { data: vocabIns, error: vocabErr } = await (supabase as any)
        .from('vocab_terms')
        .insert(vocabRows)
        .select('id, slug');

      if (vocabErr) {
        await rollback();
        return NextResponse.json(
          {
            ok: false,
            errors: [
              {
                row: -1,
                bundle: bi,
                section: 'vocab',
                message: `bundle ${bi} vocab insert hatası: ${vocabErr.message}`,
              },
            ],
          },
          { status: 500 },
        );
      }
      const ids = ((vocabIns ?? []) as { id: string }[]).map((r) => r.id);
      insertedVocabIds.push(...ids);
      bundleVocabCount = ids.length;
    }

    // Exercises insert (lesson_slug inject + correct_order number→id normalize)
    if (b.exercises.length > 0) {
      let exRows: any[];
      try {
        exRows = b.exercises.map((e) => {
          const norm: any = { ...e, lesson_slug: b.lesson_slug };
          // Sprint 10.E — correct_order number array → options[i].id mapping
          if (Array.isArray(e.correct_order) && e.correct_order.length > 0) {
            const co = e.correct_order;
            if (typeof co[0] === 'number') {
              if (!Array.isArray(e.options)) {
                throw new Error(
                  `bundle ${bi} exercise sort=${e.sort}: correct_order numeric ama options eksik`,
                );
              }
              norm.correct_order = co.map((idx: any) => {
                const opt = e.options![idx as number];
                if (!opt) {
                  throw new Error(
                    `bundle ${bi} exercise sort=${e.sort}: correct_order[${idx}] options dışında`,
                  );
                }
                return opt.id;
              });
            }
            // string array: olduğu gibi geçir
          }
          return norm;
        });
      } catch (mapErr: any) {
        await rollback();
        return NextResponse.json(
          {
            ok: false,
            errors: [
              {
                row: -1,
                bundle: bi,
                section: 'exercises',
                message: mapErr?.message ?? 'correct_order normalize hatası',
              },
            ],
          },
          { status: 422 },
        );
      }
      const normalized = await normalizeRows('exercises', exRows, supabase as any);
      if (!normalized.ok) {
        await rollback();
        return NextResponse.json(
          {
            ok: false,
            errors: normalized.errors.map((e) => ({
              ...e,
              bundle: bi,
              section: 'exercises' as const,
            })),
          },
          { status: 422 },
        );
      }

      const { data: exIns, error: exErr } = await (supabase as any)
        .from('exercises')
        .insert(normalized.rows)
        .select('id');

      if (exErr) {
        await rollback();
        return NextResponse.json(
          {
            ok: false,
            errors: [
              {
                row: -1,
                bundle: bi,
                section: 'exercises',
                message: `bundle ${bi} exercise insert hatası: ${exErr.message}`,
              },
            ],
          },
          { status: 500 },
        );
      }
      const ids = ((exIns ?? []) as { id: string }[]).map((r) => r.id);
      insertedExerciseIds.push(...ids);
      bundleExerciseCount = ids.length;
    }

    results.push({
      lesson_slug: b.lesson_slug,
      lesson_id: lessonId,
      vocab_count: bundleVocabCount,
      exercise_count: bundleExerciseCount,
    });
  }

  // 5. Audit
  await (supabase as any).rpc('log_admin_action', {
    p_action: 'import',
    p_table_name: 'lesson_bundle',
    p_metadata: {
      bundle_count: bundles.length,
      total_vocab: insertedVocabIds.length,
      total_exercises: insertedExerciseIds.length,
      source: 'lesson_bundle',
      lesson_slugs: lessonSlugs,
    },
  });

  return NextResponse.json({
    ok: true,
    bundles: results,
    total_vocab: insertedVocabIds.length,
    total_exercises: insertedExerciseIds.length,
  });
}
