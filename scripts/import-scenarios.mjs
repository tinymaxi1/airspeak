#!/usr/bin/env node
/**
 * Generated scenarios JSON → SQL INSERT.
 * Idempotent (ON CONFLICT slug DO UPDATE).
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function sqlEsc(s) { return String(s ?? '').replace(/'/g, "''"); }
function jsonEsc(o) { return JSON.stringify(o).replace(/'/g, "''"); }

// Slug pattern → sub_role tag mapping (theme bazlı manuel)
// FULL_TARGETS'te sub_role_tag eklemek edit fail olduğu için burada uyguluyoruz.
function inferSubRoles(slug, role) {
  const s = slug.toLowerCase();
  // ATC sub_roles
  if (role === 'atc') {
    if (/approach|ils|vector/.test(s)) return ['atc_approach'];
    if (/taxi|ground|crossing/.test(s)) return ['atc_ground'];
    if (/conflict|enroute|departure/.test(s)) return ['atc_enroute'];
    if (/tower|takeoff/.test(s)) return ['atc_tower'];
  }
  // Cabin sub_roles
  if (role === 'cabin') {
    if (/medical|evacuation|emergency|unruly/.test(s)) return ['cabin_purser'];
    if (/boarding/.test(s)) return ['cabin_economy'];
  }
  // Technician sub_roles
  if (role === 'technician') {
    if (/walk-around|walkaround|pre-?flight|mel|snag/.test(s)) return ['tech_line'];
    if (/engine|inspection/.test(s)) return ['tech_engine'];
    if (/aog/.test(s)) return ['tech_line'];
  }
  // Ground sub_roles
  if (role === 'ground') {
    if (/pushback|marshall/.test(s)) return ['ground_pushback'];
    if (/refuel|fuel/.test(s)) return ['ground_refueling'];
    if (/deic|hot/.test(s)) return ['ground_deicing'];
    if (/baggage|load/.test(s)) return ['ground_baggage'];
  }
  // Student sub_roles
  if (role === 'student') {
    if (/pilot.*interview/.test(s)) return ['student_pilot_interview'];
    if (/cabin.*interview/.test(s)) return ['student_cabin_interview'];
    if (/atc.*interview/.test(s)) return ['student_atc_interview'];
    return ['student_icao4'];
  }
  // Dispatcher sub_roles
  if (role === 'dispatcher') {
    if (/etops/.test(s)) return ['dispatcher_major'];
  }
  return [];
}

function rowToSql(s) {
  const role = s.role;
  // target_roles: rol kendisi (eğer 'all' değilse)
  const targetRoles = role === 'all'
    ? ['pilot','atc','cabin','technician','ground','student','dispatcher']
    : [role];
  // JSON'da yoksa slug'tan infer et (FULL_TARGETS edit fail olduğu için)
  const targetSubRoles = (s.target_sub_roles && s.target_sub_roles.length > 0)
    ? s.target_sub_roles
    : inferSubRoles(s.slug ?? '', s.role);
  const turns = jsonEsc(s.turns ?? []);
  const gauges = s.gauges ? jsonEsc(s.gauges) : null;
  const slug = sqlEsc(s.slug);
  const title = sqlEsc(s.title);
  const titleTr = sqlEsc(s.title_tr ?? s.title);
  const setup = sqlEsc(s.setup);
  const setupTr = sqlEsc(s.setup_tr ?? s.setup);
  const level = s.level;
  const diff = s.difficulty ?? (level === 'L4' ? 5 : level === 'B2' ? 3 : 1);
  const estMin = s.estimated_minutes ?? 2;

  return `
INSERT INTO public.scenarios (
  slug, role, target_roles, target_sub_roles, level, title, title_tr,
  setup, setup_tr, turns, gauges, difficulty, estimated_minutes, status, is_premium
) VALUES (
  '${slug}', '${role}',
  ARRAY[${targetRoles.map(r => `'${r}'`).join(',')}]::text[],
  ARRAY[${targetSubRoles.map(r => `'${sqlEsc(r)}'`).join(',')}]::text[],
  '${level}', '${title}', '${titleTr}',
  '${setup}', '${setupTr}',
  '${turns}'::jsonb,
  ${gauges ? `'${gauges}'::jsonb` : 'NULL'},
  ${diff}, ${estMin}, 'published', false
)
ON CONFLICT (slug) DO UPDATE SET
  role = EXCLUDED.role,
  target_roles = EXCLUDED.target_roles,
  target_sub_roles = EXCLUDED.target_sub_roles,
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
  updated_at = now();`;
}

function readJson(p) {
  return existsSync(p) ? JSON.parse(readFileSync(p, 'utf-8')) : [];
}

const preview = readJson(resolve(ROOT, 'scripts/scenarios-preview.json'));
const batch = readJson(resolve(ROOT, 'scripts/scenarios-generated.json'));
const all = [...preview, ...batch];

console.log(`${preview.length} preview + ${batch.length} batch = ${all.length} senaryo`);

const sql = '-- Generated scenarios bulk import (Claude API)\nBEGIN;\n' +
  all.map(rowToSql).join('\n') + '\nCOMMIT;\n';

const out = resolve(ROOT, 'supabase/migrations/20260513000010_seed_generated_scenarios.sql');
writeFileSync(out, sql, 'utf-8');
console.log(`Yazıldı: ${out}`);
