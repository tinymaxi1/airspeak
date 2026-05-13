#!/usr/bin/env node
/**
 * scripts/i18n/translate-sub-roles.mjs
 *
 * public.sub_roles tablosu names JSONB → Argos ile 16 dile çevir.
 * Idempotent: eğer hedef dilde değer EN ile aynıysa (çevrilmemiş) → çevir.
 *
 * Çıktı: stdout'a UPDATE SQL'leri yazar — supabase db query --linked ile uygulanır.
 * Veya direkt PSQL bağlantısı kullanır (psql var ise).
 */
import { spawn } from 'node:child_process';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { writeFileSync } from 'node:fs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const PYTHON = '/tmp/argos-venv/bin/python3';
const HELPER_PY = resolve(ROOT, 'scripts/i18n/argos-translate-helper.py');

const TARGETS = ['de', 'fr', 'es', 'it', 'pt', 'nl', 'pl', 'el', 'zh', 'ja', 'ko', 'id', 'ru', 'ar', 'fa', 'hi'];

async function argosTranslate(texts, toLang) {
  return new Promise((resolveP, rejectP) => {
    const p = spawn(PYTHON, [HELPER_PY], { stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    p.stdout.on('data', (d) => (stdout += d));
    p.stderr.on('data', (d) => (stderr += d));
    p.on('close', (code) => {
      if (code !== 0) return rejectP(new Error(stderr.slice(0, 200)));
      try {
        resolveP(JSON.parse(stdout).translations);
      } catch (e) {
        rejectP(e);
      }
    });
    p.stdin.write(JSON.stringify({ texts, to: toLang }));
    p.stdin.end();
  });
}

function supabaseQuery(sql) {
  // Use supabase db query --linked for SELECT/UPDATE
  const output = execSync(
    `supabase db query --linked --output json ${JSON.stringify(sql)}`,
    { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
  );
  return JSON.parse(output);
}

async function main() {
  console.log('1) sub_roles SELECT...');
  const result = supabaseQuery("SELECT id, names FROM public.sub_roles ORDER BY parent_role, display_order");
  const rows = result.rows || [];
  console.log(`   ${rows.length} satır`);

  if (rows.length === 0) {
    console.error('Boş — sub_roles tablosunda kayıt yok');
    process.exit(1);
  }

  // Her satır için EN'i çevir, gerekli dillerde EN ile aynı olanları update et
  let totalUpdates = 0;
  const startTime = Date.now();

  // SQL update'leri batch'le hazırla
  const updates = [];

  for (const lang of TARGETS) {
    // Bu dilde EN ile aynı (çevrilmemiş) satırları topla
    const needsTranslation = [];
    const idsForUpdate = [];

    for (const row of rows) {
      const names = row.names || {};
      const enValue = names.en;
      const currentValue = names[lang];
      if (!enValue) continue;
      if (currentValue == null || currentValue === enValue) {
        needsTranslation.push(enValue);
        idsForUpdate.push(row.id);
      }
    }

    if (needsTranslation.length === 0) {
      console.log(`[${lang}] zaten çevrili`);
      continue;
    }

    console.log(`[${lang}] ${needsTranslation.length} çeviriliyor...`);
    let translated;
    try {
      translated = await argosTranslate(needsTranslation, lang);
    } catch (e) {
      console.error(`[${lang}] ✗ Argos hatası: ${e.message}`);
      continue;
    }

    // Her satır için tek UPDATE: jsonb_set(names, '{<lang>}', '"<translated>"')
    for (let i = 0; i < idsForUpdate.length; i++) {
      const id = idsForUpdate[i].replace(/'/g, "''");
      const tr = translated[i].replace(/'/g, "''").replace(/"/g, '\\"');
      updates.push(
        `UPDATE public.sub_roles SET names = jsonb_set(names, '{${lang}}', '"${tr}"'::jsonb) WHERE id = '${id}';`
      );
    }
    totalUpdates += idsForUpdate.length;
    console.log(`[${lang}] ✓ ${idsForUpdate.length} UPDATE hazır`);
  }

  // SQL dump dosyaya yaz
  const sqlFile = resolve(ROOT, 'scripts/i18n/sub-roles-translation.sql');
  writeFileSync(sqlFile, '-- Argos çeviri — sub_roles names JSONB\nBEGIN;\n' + updates.join('\n') + '\nCOMMIT;\n', 'utf-8');

  const seconds = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n✅ ${totalUpdates} UPDATE hazır → ${sqlFile} (${seconds}s)`);
  console.log(`\nUygula: supabase db query --linked --file ${sqlFile}`);
}

main().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
