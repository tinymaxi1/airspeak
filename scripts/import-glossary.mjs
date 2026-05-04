/**
 * Aviation Glossary bulk import script
 * Sprint 11.B
 *
 * Usage:
 *   node --env-file=admin/.env.local scripts/import-glossary.mjs <file.json>
 *
 * JSON format:
 *   [{ term_en, term_tr?, category, abbreviation?, definition_en?,
 *      definition_tr?, example_usage?, icao_reference?, ipa?, pos?,
 *      difficulty? (1-5), is_public? (default true), is_verified? (default false),
 *      source? (icao_doc | admin_manual | ai_generated, default ai_generated) }]
 *
 * Kategori mapping: atc_phraseology → phraseology (enum'da yok)
 * Empty string → null otomatik.
 * Duplicate term_en (case-insensitive) → atlanır, hata olarak sayılmaz.
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { homedir } from 'node:os';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY env zorunlu.');
  console.error('   Çağırma: node --env-file=admin/.env.local scripts/import-glossary.mjs <file>');
  process.exit(1);
}

const file = process.argv[2];
if (!file) {
  console.error('❌ Kullanım: node --env-file=admin/.env.local scripts/import-glossary.mjs <file.json>');
  process.exit(1);
}

// ─── Pre-flight: glossary registry validation ──────────────────────────
// ~/airspeak/glossary/validate_batch.py varsa, import öncesi conflict kontrol.
// Exit 0 = clean → devam. Exit 1 = blocking → import iptal. Exit 2 = error.
// SKIP_GLOSSARY_VALIDATE=1 env ile bypass edilebilir (acil durum).
const validatorPath = resolve(homedir(), 'airspeak/glossary/validate_batch.py');
if (existsSync(validatorPath) && process.env.SKIP_GLOSSARY_VALIDATE !== '1') {
  console.log('🛡  Glossary registry validation — duplicate detection');
  console.log(`   ${validatorPath}`);
  const result = spawnSync('python3', [validatorPath, resolve(file)], {
    stdio: 'inherit',
  });
  if (result.status === 1) {
    console.error('\n⛔ Import iptal — registry conflict var. Yukarıdaki çakışmaları düzelt veya');
    console.error('   SKIP_GLOSSARY_VALIDATE=1 node ... ile bypass et (acil durumlar için).');
    process.exit(1);
  }
  if (result.status === 2) {
    console.error('\n⚠  Validator internal hata (exit 2) — schema/parse problemi. Lütfen düzelt.');
    process.exit(2);
  }
  if (result.status !== 0) {
    console.error(`\n⚠  Validator beklenmedik exit kodu: ${result.status}. Devam ediliyor.`);
  }
  console.log(''); // boşluk satırı
} else if (process.env.SKIP_GLOSSARY_VALIDATE === '1') {
  console.log('⚠  SKIP_GLOSSARY_VALIDATE=1 — registry validation atlandı');
} else {
  console.log('ℹ  ~/airspeak/glossary/validate_batch.py yok — validation atlandı');
}

// Kategori mapping (JSON kaynağı → DB enum)
const CATEGORY_MAP = {
  atc_phraseology: 'phraseology',
  // diğer alias'lar buraya eklenebilir
};

const VALID_CATEGORIES = new Set([
  'phraseology', 'aircraft_parts', 'aerodynamics', 'navigation',
  'meteorology', 'atc_communication', 'emergency', 'flight_operations',
  'crew_resource_mgmt', 'maintenance', 'cabin_service', 'ground_operations',
  'documentation', 'regulations', 'medical', 'general',
]);

const VALID_SOURCES = new Set(['icao_doc', 'admin_manual', 'ai_generated']);

function normalizeText(v) {
  if (typeof v !== 'string') return null;
  const trimmed = v.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function normalizeRow(raw, idx) {
  const term_en = normalizeText(raw.term_en);
  if (!term_en) return { error: `[${idx}] term_en zorunlu` };

  let category = CATEGORY_MAP[raw.category] ?? raw.category ?? 'general';
  if (!VALID_CATEGORIES.has(category)) {
    return { error: `[${idx}] geçersiz kategori: "${raw.category}" (mapping yok, fallback general)` };
  }

  const source = raw.source && VALID_SOURCES.has(raw.source) ? raw.source : 'ai_generated';

  let difficulty = typeof raw.difficulty === 'number' ? raw.difficulty : 1;
  difficulty = Math.max(1, Math.min(5, Math.round(difficulty)));

  return {
    row: {
      term_en,
      term_tr: normalizeText(raw.term_tr),
      category,
      abbreviation: normalizeText(raw.abbreviation),
      definition_en: normalizeText(raw.definition_en),
      definition_tr: normalizeText(raw.definition_tr),
      example_usage: normalizeText(raw.example_usage),
      icao_reference: normalizeText(raw.icao_reference),
      ipa: normalizeText(raw.ipa),
      pos: normalizeText(raw.pos),
      difficulty,
      is_public: raw.is_public !== false, // default true
      is_verified: raw.is_verified === true, // default false
      source,
      frequency: typeof raw.frequency === 'number' ? raw.frequency : 0,
    },
  };
}

const filePath = resolve(file);
console.log(`📂 ${filePath}`);
const raw = JSON.parse(readFileSync(filePath, 'utf-8'));
if (!Array.isArray(raw)) {
  console.error('❌ JSON root array olmalı.');
  process.exit(1);
}

const normalized = [];
const skipReasons = [];
for (let i = 0; i < raw.length; i++) {
  const result = normalizeRow(raw[i], i);
  if (result.error) {
    skipReasons.push(result.error);
  } else {
    normalized.push(result.row);
  }
}

console.log(`📊 Total: ${raw.length} | Geçerli: ${normalized.length} | Atlanan: ${skipReasons.length}`);
if (skipReasons.length > 0) {
  console.log('⚠️  Atlanan satırlar:');
  skipReasons.slice(0, 10).forEach((r) => console.log('   ' + r));
  if (skipReasons.length > 10) console.log(`   ... +${skipReasons.length - 10} daha`);
}

const client = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Mevcut term_en'leri al (case-insensitive duplicate filter)
console.log('🔍 Mevcut term_en\'ler kontrol ediliyor...');
const { data: existing, error: selectErr } = await client
  .from('aviation_glossary')
  .select('term_en');
if (selectErr) {
  console.error('❌ Existing fetch error:', selectErr.message);
  process.exit(1);
}
const existingSet = new Set((existing ?? []).map((r) => r.term_en.toLowerCase()));
console.log(`   ${existingSet.size} mevcut kayıt`);

const toInsert = normalized.filter((r) => !existingSet.has(r.term_en.toLowerCase()));
const skippedDupes = normalized.length - toInsert.length;

if (skippedDupes > 0) {
  console.log(`⏭  ${skippedDupes} duplicate atlandı`);
}
if (toInsert.length === 0) {
  console.log('✓ Yeni eklenecek terim yok. Çıkılıyor.');
  process.exit(0);
}

console.log(`📤 ${toInsert.length} terim yükleniyor...`);

// Batch insert (Supabase limit: 1000 row per call güvenli)
const BATCH_SIZE = 200;
let inserted = 0;
const errors = [];

for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
  const batch = toInsert.slice(i, i + BATCH_SIZE);
  const { error, count } = await client
    .from('aviation_glossary')
    .insert(batch, { count: 'exact' });

  if (error) {
    console.error(`❌ Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${error.message}`);
    errors.push(error.message);
    // Tek tek dene, hangisi sorunlu bul
    for (const row of batch) {
      const { error: rowErr } = await client.from('aviation_glossary').insert(row);
      if (rowErr) {
        if (rowErr.code === '23505') {
          // unique violation, sayılmaz
        } else {
          console.error(`   "${row.term_en}": ${rowErr.message}`);
        }
      } else {
        inserted++;
      }
    }
  } else {
    inserted += count ?? batch.length;
    process.stdout.write(`\r   ${inserted} / ${toInsert.length}`);
  }
}

console.log(`\n\n✅ ${inserted} terim eklendi`);
if (errors.length > 0) console.log(`❌ ${errors.length} batch hatası`);
console.log(`⏭  ${skippedDupes} duplicate atlandı`);
console.log(`⚠️  ${skipReasons.length} kayıt validation fail (kategori/term_en eksik)`);
