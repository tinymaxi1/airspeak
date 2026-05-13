/**
 * Seed practice content: TS bank → DB
 *
 * Çağrı:
 *   bun scripts/seed-practice-content.mjs
 *   veya: node scripts/seed-practice-content.mjs
 *
 * Idempotent: ON CONFLICT (slug) DO UPDATE.
 * Status: published.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ─── env ───
const envFile = path.join(ROOT, 'admin/.env.local');
const envText = fs.readFileSync(envFile, 'utf8');
const getEnv = (k) => {
  const m = envText.match(new RegExp(`^${k}=(.*)$`, 'm'));
  return m ? m[1].replace(/^["']|["']$/g, '').trim() : '';
};
const SUPABASE_URL = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const SUPABASE_KEY = getEnv('SUPABASE_SERVICE_ROLE_KEY');
if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error('env missing');

// ─── helper: REST upsert ───
async function upsert(table, rows) {
  const url = `${SUPABASE_URL}/rest/v1/${table}?on_conflict=slug`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(rows),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${table} upsert failed: ${res.status} ${text}`);
  }
  return rows.length;
}

// ═══════════════════════════════════════════════════════
// 1. readback_clearances — TS dosyasından parse et
// ═══════════════════════════════════════════════════════
async function seedReadback() {
  // TS dosyasını text olarak oku, CLEARANCES array'ini eval ile parse et
  const tsFile = path.join(ROOT, 'src/features/readback/clearances.ts');
  const src = fs.readFileSync(tsFile, 'utf8');

  // CLEARANCES array'inin başlangıç/bitiş bul
  const startIdx = src.indexOf('export const CLEARANCES');
  const arrStart = src.indexOf('[', startIdx);
  // En son ']' (file sonunda olabilir)
  const arrEnd = src.lastIndexOf('];');
  const arrText = src.slice(arrStart, arrEnd + 1);

  // TS object literal'i JS olarak eval et (Function constructor)
  const items = new Function(`return ${arrText};`)();
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('CLEARANCES parse failed');
  }

  const rows = items.map((c, i) => ({
    slug: c.id,
    level: c.level === 'L4' ? 'B2' : c.level, // L4 → B2 (ICAO 4 = B2 yakın)
    target_role: 'pilot', // mevcut TS'de role yok, hepsi pilot odaklı
    target_sub_roles: [],
    category: c.category ?? null,
    station: c.station ?? null,
    freq: c.freq ?? null,
    atc_utterance: c.atcUtterance,
    expected_readback: c.expectedReadback,
    key_phrases: c.keyPhrases,
    icao_ref: c.icaoRef ?? null,
    hint_tr: c.hintTr ?? null,
    hint_en: null,
    status: 'published',
    sort: i,
  }));

  const n = await upsert('readback_clearances', rows);
  console.log(`✓ readback_clearances: ${n} upserted`);
  return n;
}

// ═══════════════════════════════════════════════════════
// 2. pronunciation_sentences
// ═══════════════════════════════════════════════════════
async function seedPronunciation() {
  const tsFile = path.join(ROOT, 'src/features/pronunciation/sentences.ts');
  const src = fs.readFileSync(tsFile, 'utf8');

  const startIdx = src.indexOf('export const PRONUNCIATION_SENTENCES');
  const arrStart = src.indexOf('[', startIdx);
  const arrEnd = src.lastIndexOf('];');
  const arrText = src.slice(arrStart, arrEnd + 1);
  const items = new Function(`return ${arrText};`)();

  const rows = items.map((s, i) => ({
    slug: s.id,
    text_en: s.text ?? s.text_en,
    text_tr: s.text_tr ?? null,
    ipa: s.ipa ?? null,
    phonemes: s.phonemes ?? null,
    level: s.level ?? null,
    target_role: 'all',
    target_sub_roles: [],
    category: s.category ?? null,
    hint_tr: s.hintTr ?? null,
    hint_en: null,
    status: 'published',
    sort: i,
  }));

  const n = await upsert('pronunciation_sentences', rows);
  console.log(`✓ pronunciation_sentences: ${n} upserted`);
  return n;
}

// ═══════════════════════════════════════════════════════
// 3. listen_solve_drills
// ═══════════════════════════════════════════════════════
async function seedListenSolve() {
  const tsFile = path.join(ROOT, 'src/features/listen-solve/drills.ts');
  const src = fs.readFileSync(tsFile, 'utf8');

  const startIdx = src.indexOf('export const LISTEN_SOLVE_DRILLS');
  const arrStart = src.indexOf('[', startIdx);
  const arrEnd = src.lastIndexOf('];');
  const arrText = src.slice(arrStart, arrEnd + 1);
  const items = new Function(`return ${arrText};`)();

  const rows = items.map((d, i) => ({
    slug: d.slug ?? d.id,
    level: d.level ?? null,
    target_role: d.target_role,
    target_sub_roles: d.target_sub_roles ?? [],
    category: d.category,
    audio_text: d.audio_text,
    question_tr: d.question_tr,
    question_en: d.question_en,
    options: d.options,
    correct_id: d.correct_id,
    explanation_tr: d.explanation_tr ?? null,
    explanation_en: d.explanation_en ?? null,
    hint_tr: d.hint_tr ?? null,
    hint_en: null,
    noise_level: 0,
    status: 'published',
    sort: i,
  }));

  const n = await upsert('listen_solve_drills', rows);
  console.log(`✓ listen_solve_drills: ${n} upserted`);
  return n;
}

(async () => {
  console.log('— Practice content seed —');
  const r = await seedReadback();
  const p = await seedPronunciation();
  const l = await seedListenSolve();
  console.log(`\nTOTAL: ${r + p + l} rows (readback=${r}, pronunciation=${p}, listen_solve=${l})`);
})().catch((e) => {
  console.error('SEED FAIL:', e.message);
  process.exit(1);
});
