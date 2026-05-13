#!/usr/bin/env node
/**
 * Static SCENARIOS (src/features/conversation/scenarios.ts) → DB seed.
 * Idempotent: ON CONFLICT (slug) DO UPDATE — yeniden çalıştırılabilir.
 */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';
import { writeFileSync } from 'node:fs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

// tsx ile TS modül yükle — runtime'da static SCENARIOS array al
async function loadScenarios() {
  const tsxLoader = resolve(ROOT, 'node_modules/tsx/dist/loader.mjs');
  // Doğrudan dynamic import — tsx zaten loader, file extension için fallback
  const mod = await import(pathToFileURL(resolve(ROOT, 'src/features/conversation/scenarios.ts')).href);
  return mod.SCENARIOS;
}

function sqlEscape(s) {
  return String(s).replace(/'/g, "''");
}

function jsonEscape(o) {
  return JSON.stringify(o).replace(/'/g, "''");
}

async function main() {
  const SCENARIOS = await loadScenarios();
  console.log(`${SCENARIOS.length} senaryo yüklendi (static)`);

  const updates = [];
  for (const s of SCENARIOS) {
    // role → target_roles mapping: tekil 'pilot' → ARRAY['pilot']
    const targetRoles = s.role === 'all' ? ['pilot','atc','cabin','technician','ground','student','dispatcher'] : [s.role];
    const turns = jsonEscape(s.turns);
    const gauges = s.gauges ? jsonEscape(s.gauges) : null;
    const titleTr = sqlEscape(s.titleTr);
    const setupTr = sqlEscape(s.contextTr);
    // estimated_minutes = ceil(estimatedSeconds / 60)
    const estMin = Math.max(1, Math.ceil((s.estimatedSeconds || 60) / 60));

    updates.push(`
INSERT INTO public.scenarios (
  slug, role, target_roles, target_sub_roles, level, title, title_tr,
  setup, setup_tr, turns, gauges, difficulty, estimated_minutes,
  status, is_premium
) VALUES (
  '${sqlEscape(s.id)}',
  '${s.role}',
  ARRAY[${targetRoles.map(r => `'${r}'`).join(',')}]::text[],
  '{}'::text[],
  '${s.level}',
  '${titleTr}',
  '${titleTr}',
  '${setupTr}',
  '${setupTr}',
  '${turns}'::jsonb,
  ${gauges ? `'${gauges}'::jsonb` : 'NULL'},
  ${s.level === 'L4' ? 5 : s.level === 'B2' ? 3 : 1},
  ${estMin},
  'published',
  false
)
ON CONFLICT (slug) DO UPDATE SET
  role = EXCLUDED.role,
  target_roles = EXCLUDED.target_roles,
  level = EXCLUDED.level,
  title = EXCLUDED.title,
  title_tr = EXCLUDED.title_tr,
  setup = EXCLUDED.setup,
  setup_tr = EXCLUDED.setup_tr,
  turns = EXCLUDED.turns,
  gauges = EXCLUDED.gauges,
  difficulty = EXCLUDED.difficulty,
  estimated_minutes = EXCLUDED.estimated_minutes,
  status = EXCLUDED.status,
  updated_at = now();`);
  }

  const out = resolve(ROOT, 'supabase/migrations/20260513000009_seed_scenarios.sql');
  writeFileSync(out, '-- Seed mevcut 5 static scenario (idempotent)\nBEGIN;\n' + updates.join('\n') + '\nCOMMIT;\n', 'utf-8');
  console.log(`\nYazıldı: ${out}`);
}

main().catch((e) => { console.error('FATAL:', e); process.exit(1); });
