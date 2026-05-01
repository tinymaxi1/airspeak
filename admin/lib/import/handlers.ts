/**
 * Bulk import — table-specific normalizer'lar.
 *
 * Validate edilmiş satırları DB-ready row'lara çevirir:
 * - slug otomatik üretim
 * - exercises: lesson_slug → lesson_id resolve
 * - exercises: vocab_term_slug → vocab_term_id resolve
 * - status: her zaman 'draft'
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { uniqueSlug } from '@/lib/content/slug';
import type { ImportTable } from './schemas';

export type ImportRow = Record<string, unknown>;

export interface RowError {
  row: number;
  message: string;
  detail?: string;
}

export interface NormalizeResult {
  ok: true;
  rows: ImportRow[];
}

export interface NormalizeFail {
  ok: false;
  errors: RowError[];
}

/**
 * Validate edilmiş row'ları DB'ye yazılabilir formata çevir.
 * exercises tipinde `lesson_slug` ve `vocab_term_slug`'ı id'ye resolve eder.
 */
export async function normalizeRows(
  table: ImportTable,
  rows: any[],
  supabase: SupabaseClient,
): Promise<NormalizeResult | NormalizeFail> {
  if (table === 'exercises') {
    return normalizeExercises(rows, supabase);
  }
  return { ok: true, rows: rows.map((r) => attachSlugAndStatus(table, r)) };
}

function attachSlugAndStatus(table: ImportTable, row: any): ImportRow {
  const slug = generateSlug(table, row);
  return { ...row, slug, status: 'draft' };
}

function generateSlug(table: ImportTable, row: any): string {
  switch (table) {
    case 'vocab_terms':
      return uniqueSlug(row.term, `vocab_${row.role ?? 'all'}`);
    case 'oral_prompts':
      return uniqueSlug(row.prompt ?? row.prompt_tr ?? 'oral', `oral_${row.task_type}`);
    case 'icao4_questions':
      return uniqueSlug(row.question, `icao4_set${row.set_no}_${row.section}`);
    case 'placement_questions':
      return uniqueSlug(row.question, `placement_${row.dimension}_${row.level}`);
    case 'scenarios':
      return uniqueSlug(row.title, `scenario_${row.role ?? 'all'}_${row.category}`);
    case 'exercises':
      return uniqueSlug(row.prompt_tr ?? row.prompt ?? 'exercise', `${row.lesson_slug ?? 'lesson'}_ex`);
    default: {
      const _exhaustive: never = table;
      return _exhaustive;
    }
  }
}

async function normalizeExercises(
  rows: any[],
  supabase: SupabaseClient,
): Promise<NormalizeResult | NormalizeFail> {
  const errors: RowError[] = [];
  const lessonSlugs = Array.from(new Set(rows.map((r) => r.lesson_slug).filter(Boolean)));
  const vocabSlugs = Array.from(
    new Set(rows.map((r) => r.vocab_term_slug).filter((s) => s != null && s !== '')),
  );

  // Lessons resolve
  const lessonMap = new Map<string, string>();
  if (lessonSlugs.length > 0) {
    const { data, error } = await (supabase as any)
      .from('lessons')
      .select('id, slug')
      .in('slug', lessonSlugs);
    if (error) {
      return { ok: false, errors: [{ row: -1, message: `lesson lookup hatası: ${error.message}` }] };
    }
    for (const r of (data ?? []) as { id: string; slug: string }[]) {
      lessonMap.set(r.slug, r.id);
    }
  }

  // Vocab terms resolve
  const vocabMap = new Map<string, string>();
  if (vocabSlugs.length > 0) {
    const { data, error } = await (supabase as any)
      .from('vocab_terms')
      .select('id, slug')
      .in('slug', vocabSlugs);
    if (error) {
      return { ok: false, errors: [{ row: -1, message: `vocab lookup hatası: ${error.message}` }] };
    }
    for (const r of (data ?? []) as { id: string; slug: string }[]) {
      vocabMap.set(r.slug, r.id);
    }
  }

  const out: ImportRow[] = [];
  rows.forEach((r, idx) => {
    const lesson_id = lessonMap.get(r.lesson_slug);
    if (!lesson_id) {
      errors.push({
        row: idx,
        message: `lesson_slug bulunamadı: "${r.lesson_slug}"`,
      });
      return;
    }
    let vocab_term_id: string | null = null;
    if (r.vocab_term_slug) {
      const found = vocabMap.get(r.vocab_term_slug);
      if (!found) {
        errors.push({
          row: idx,
          message: `vocab_term_slug bulunamadı: "${r.vocab_term_slug}"`,
        });
        return;
      }
      vocab_term_id = found;
    }
    const { lesson_slug: _ls, vocab_term_slug: _vs, ...rest } = r;
    out.push({
      ...rest,
      lesson_id,
      vocab_term_id,
      slug: uniqueSlug(r.prompt_tr ?? r.prompt ?? 'exercise', `${r.lesson_slug}_ex`),
      status: 'draft',
    });
  });

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, rows: out };
}
