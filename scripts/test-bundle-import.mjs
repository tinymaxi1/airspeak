#!/usr/bin/env node
/**
 * Sprint 10.E test — kullanıcının lesson bundle JSON'unu DB'ye direkt
 * import et (endpoint mantığını yerel script ile çalıştır).
 *
 * Service role key ile Supabase'e bağlanır, endpoint'in yaptığı 5 adımı
 * yapar: lesson_slug resolve → vocab insert → correct_order normalize →
 * exercise insert. Hata olursa rollback.
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Env'den oku
const envPath = path.join(__dirname, '..', '..', '..', '..', 'admin', '.env.local');
const envText = fs.readFileSync(envPath, 'utf-8');
const env = Object.fromEntries(
  envText
    .split('\n')
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => {
      const idx = l.indexOf('=');
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
    }),
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Bundle JSON
const bundlePath = path.join(__dirname, 'bundle-input.json');
const bundles = JSON.parse(fs.readFileSync(bundlePath, 'utf-8'));

console.log(`📦 ${bundles.length} bundle yüklendi`);

// Slug helper (admin/lib/content/slug uniqueSlug benzeri minimal)
function slugify(text, prefix) {
  const base = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${base}_${rand}`;
}

// 1. lesson_slug resolve (toplu)
const slugs = [...new Set(bundles.map((b) => b.lesson_slug))];
const { data: lessons, error: lesErr } = await supabase
  .from('lessons')
  .select('id, slug')
  .in('slug', slugs);

if (lesErr) {
  console.error('❌ lesson lookup hatası:', lesErr.message);
  process.exit(1);
}
const lessonMap = new Map(lessons.map((r) => [r.slug, r.id]));
const missing = slugs.filter((s) => !lessonMap.has(s));
if (missing.length > 0) {
  console.error('❌ Eksik lesson_slug:', missing);
  process.exit(1);
}
console.log(`✓ ${slugs.length} lesson_slug resolve edildi`);

// 2. Bundle process
const insertedVocabIds = [];
const insertedExerciseIds = [];
const results = [];

async function rollback(reason) {
  console.error(`\n⏪ ROLLBACK: ${reason}`);
  if (insertedExerciseIds.length > 0) {
    await supabase.from('exercises').delete().in('id', insertedExerciseIds);
    console.log(`  ${insertedExerciseIds.length} exercise silindi`);
  }
  if (insertedVocabIds.length > 0) {
    await supabase.from('vocab_terms').delete().in('id', insertedVocabIds);
    console.log(`  ${insertedVocabIds.length} vocab silindi`);
  }
}

for (let bi = 0; bi < bundles.length; bi++) {
  const b = bundles[bi];
  const lessonId = lessonMap.get(b.lesson_slug);
  let bundleVocabCount = 0;
  let bundleExerciseCount = 0;

  // Vocab insert
  if (Array.isArray(b.vocab) && b.vocab.length > 0) {
    const vocabRows = b.vocab.map((v) => ({
      ...v,
      slug: slugify(v.term, `vocab_${v.role ?? 'all'}`),
      status: 'draft',
    }));
    const { data: vocabIns, error: vocabErr } = await supabase
      .from('vocab_terms')
      .insert(vocabRows)
      .select('id');
    if (vocabErr) {
      await rollback(`bundle ${bi} vocab: ${vocabErr.message}`);
      process.exit(1);
    }
    insertedVocabIds.push(...vocabIns.map((r) => r.id));
    bundleVocabCount = vocabIns.length;
  }

  // Exercises insert (correct_order normalize + lesson_id resolve)
  if (Array.isArray(b.exercises) && b.exercises.length > 0) {
    let exRows;
    try {
      exRows = b.exercises.map((e) => {
        const norm = { ...e, lesson_id: lessonId, status: 'draft' };
        // correct_order number → options[i].id mapping
        if (Array.isArray(e.correct_order) && e.correct_order.length > 0 && typeof e.correct_order[0] === 'number') {
          if (!Array.isArray(e.options)) {
            throw new Error(`bundle ${bi} sort=${e.sort}: correct_order numeric ama options eksik`);
          }
          norm.correct_order = e.correct_order.map((idx) => {
            const opt = e.options[idx];
            if (!opt) throw new Error(`bundle ${bi} sort=${e.sort}: correct_order[${idx}] OOB`);
            return opt.id;
          });
        }
        // slug üret
        norm.slug = slugify(e.prompt_tr ?? e.prompt ?? 'exercise', `${b.lesson_slug}_ex`);
        return norm;
      });
    } catch (mapErr) {
      await rollback(`bundle ${bi} normalize: ${mapErr.message}`);
      process.exit(1);
    }

    const { data: exIns, error: exErr } = await supabase
      .from('exercises')
      .insert(exRows)
      .select('id');
    if (exErr) {
      await rollback(`bundle ${bi} exercises: ${exErr.message}`);
      process.exit(1);
    }
    insertedExerciseIds.push(...exIns.map((r) => r.id));
    bundleExerciseCount = exIns.length;
  }

  results.push({
    lesson_slug: b.lesson_slug,
    vocab_count: bundleVocabCount,
    exercise_count: bundleExerciseCount,
  });
}

// 3. Rapor
console.log('\n✅ IMPORT BAŞARILI\n');
console.log('Bundle başına:');
for (const r of results) {
  console.log(
    `  ${r.lesson_slug.padEnd(24)} → ${String(r.vocab_count).padStart(2)} vocab · ${String(r.exercise_count).padStart(2)} exercise`,
  );
}
console.log(
  `\nTOPLAM: ${insertedVocabIds.length} vocab · ${insertedExerciseIds.length} exercise eklendi`,
);
