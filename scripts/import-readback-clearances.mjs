#!/usr/bin/env node
/**
 * scripts/import-readback-clearances.mjs
 *
 * Generated JSON → DB upsert (Sprint C3c).
 *
 * Çağrı:
 *   node scripts/import-readback-clearances.mjs
 *
 * Input:  scripts/readback-generated.json
 * Output: DB upsert (status='draft') — admin review için
 * Idempotent: ON CONFLICT (slug) DO UPDATE
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

// ─── data ───
const inputFile = path.join(ROOT, 'scripts/readback-generated.json');
const generated = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

// ─── DB row hazırla (level cap A0..C2, status='draft') ───
const rows = generated.map((d, i) => ({
  slug: d.slug,
  level: d.level,
  target_role: d.target_role,
  target_sub_roles: d.target_sub_roles ?? [],
  category: d.category ?? null,
  station: d.station ?? null,
  freq: d.freq ?? null,
  atc_utterance: d.atc_utterance,
  expected_readback: d.expected_readback,
  key_phrases: d.key_phrases,
  icao_ref: d.icao_ref ?? null,
  hint_tr: d.hint_tr ?? null,
  hint_en: d.hint_en ?? null,
  status: 'draft',     // admin review için
  sort: 100 + i,       // mevcut 12 seed sonrası (0-11) sıralanır
}));

// ─── upsert (batch 50'şer) ───
async function upsertBatch(batch) {
  const url = `${SUPABASE_URL}/rest/v1/readback_clearances?on_conflict=slug`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify(batch),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`upsert failed: ${res.status} ${text.slice(0, 300)}`);
  }
  return res.json();
}

(async () => {
  console.log(`— Readback import —`);
  console.log(`Input: ${rows.length} satır`);

  const BATCH = 50;
  let imported = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const res = await upsertBatch(batch);
    imported += Array.isArray(res) ? res.length : batch.length;
    console.log(`  ✓ ${i + batch.length}/${rows.length} upserted`);
  }

  console.log(`\n✅ ${imported}/${rows.length} satır DB'ye yazıldı (status='draft')`);

  // ─── SQL doğrulama ───
  console.log('\n— DB Doğrulama —');
  const countRes = await fetch(
    `${SUPABASE_URL}/rest/v1/readback_clearances?select=id&limit=1`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, Prefer: 'count=exact' } },
  );
  const total = countRes.headers.get('content-range')?.split('/')[1] ?? '?';
  console.log(`Toplam satır: ${total}`);

  const draftRes = await fetch(
    `${SUPABASE_URL}/rest/v1/readback_clearances?status=eq.draft&select=id&limit=1`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, Prefer: 'count=exact' } },
  );
  const drafts = draftRes.headers.get('content-range')?.split('/')[1] ?? '?';
  console.log(`Draft: ${drafts}`);

  const pubRes = await fetch(
    `${SUPABASE_URL}/rest/v1/readback_clearances?status=eq.published&select=id&limit=1`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, Prefer: 'count=exact' } },
  );
  const pub = pubRes.headers.get('content-range')?.split('/')[1] ?? '?';
  console.log(`Published: ${pub}`);
})().catch((e) => {
  console.error('FAIL:', e.message);
  process.exit(1);
});
