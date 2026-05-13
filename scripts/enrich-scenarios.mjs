#!/usr/bin/env node
/**
 * scripts/enrich-scenarios.mjs
 *
 * 36 senaryoyu Claude API ile zenginleştir:
 * - briefing, learner_role, objective, key_vocabulary, estimated_duration_seconds
 * - turns jsonb'a alt-fieldlar: hint, expected_response, vocabulary_focus
 *
 * Paralel 5'er. Cache: briefing IS NOT NULL ise atlanır.
 * Output: supabase/migrations/<timestamp>_enrich_scenarios.sql (UPDATE statements)
 */
import Anthropic from '@anthropic-ai/sdk';
import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = 'claude-sonnet-4-5';

function sqlEsc(s) { return String(s ?? '').replace(/'/g, "''"); }
function jsonSqlEsc(o) { return JSON.stringify(o).replace(/'/g, "''"); }

function prompt(s) {
  return `Aviation training scenario'yu zenginleştir.

CURRENT:
slug: ${s.slug}
role: ${s.role}
level: ${s.level}
title: ${s.title}
title_tr: ${s.title_tr}
setup: ${s.setup}
setup_tr: ${s.setup_tr}
turns: ${JSON.stringify(s.turns).slice(0, 2500)}

GENERATE JSON (no markdown fences, just raw JSON):
{
  "briefing": { "tr": "1-2 cümle Türkçe durum açıklaması (aviation jargon EN: clearance, callsign, runway)", "en": "1-2 sentence English context" },
  "learner_role": { "tr": "Sen [callsign] [aircraft] [role] olarak...", "en": "You are [callsign] [aircraft] [role]..." },
  "objective": { "tr": "Kısa 1 cümle hedef", "en": "Short objective" },
  "key_vocabulary": [
    { "term": "...", "definition_tr": "...", "definition_en": "..." }
  ],
  "estimated_duration_seconds": 120,
  "turn_enrichments": [
    {
      "turn_id": "turn-1",
      "hint": { "text_tr": "...", "text_en": "..." },
      "expected_response": {
        "text_en": "ICAO phraseology correct response",
        "text_tr": "Türkçe açıklama (kısa, doğal)",
        "must_include": ["keyword","alt-form"]
      },
      "vocabulary_focus": ["term1","term2"]
    }
  ]
}

Rules:
- briefing: 1-2 cümle, doğal Türkçe ama aviation jargon EN
- learner_role: "Sen X, Y, Z" formatı — kim/ne uçuyor
- objective: 1 cümle hedef
- key_vocabulary: 5-8 terim (turns'tan + ek aviation jargon)
- her turn için turn_enrichments entry (turn.id eşleştir)
- must_include: 3-8 keyword/phrase (lower case, alt forms dahil)
- TR doğal, sertlik yok, jargon EN kalır`;
}

async function enrichOne(s, idx, total) {
  const startMs = Date.now();
  process.stdout.write(`[${idx + 1}/${total}] ${s.slug.slice(0, 40)}... `);
  try {
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt(s) }],
    });
    const text = msg.content[0]?.text ?? '';
    const cleaned = text.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
    const parsed = JSON.parse(cleaned);
    console.log(`✓ (${Date.now() - startMs}ms, ${msg.usage.input_tokens}→${msg.usage.output_tokens} tok)`);
    return { ok: true, enrichment: parsed, usage: msg.usage };
  } catch (e) {
    console.log(`✗ ${(e.message ?? '').slice(0, 80)}`);
    return { ok: false, error: e.message };
  }
}

async function chunkRun(chunk, base, total) {
  return Promise.all(chunk.map((s, i) => enrichOne(s, base + i, total)));
}

function buildUpdateSql(slug, enrichment, originalTurns) {
  // turn_enrichments → mevcut turns'a merge et
  const enrichMap = new Map();
  for (const te of enrichment.turn_enrichments ?? []) {
    enrichMap.set(te.turn_id, te);
  }
  const newTurns = (originalTurns ?? []).map((t) => {
    const te = enrichMap.get(t.id);
    if (!te) return t;
    return {
      ...t,
      hint: te.hint,
      expected_response: te.expected_response,
      vocabulary_focus: te.vocabulary_focus,
    };
  });

  return `
UPDATE public.scenarios SET
  briefing = '${jsonSqlEsc(enrichment.briefing)}'::jsonb,
  learner_role = '${jsonSqlEsc(enrichment.learner_role)}'::jsonb,
  objective = '${jsonSqlEsc(enrichment.objective)}'::jsonb,
  key_vocabulary = '${jsonSqlEsc(enrichment.key_vocabulary)}'::jsonb,
  estimated_duration_seconds = ${enrichment.estimated_duration_seconds ?? 120},
  turns = '${jsonSqlEsc(newTurns)}'::jsonb,
  updated_at = now()
WHERE slug = '${sqlEsc(slug)}';`;
}

async function main() {
  // Cache-aware: briefing IS NULL olanları çek
  console.log('1) Scenarios fetch (briefing IS NULL)...');
  const raw = execSync(
    `supabase db query --linked --output json "SELECT id, slug, role, level, title, title_tr, setup, setup_tr, turns FROM public.scenarios WHERE briefing IS NULL AND status = 'published' ORDER BY slug"`,
    { encoding: 'utf-8' }
  );
  const json = JSON.parse(raw);
  const rows = json.rows ?? [];
  console.log(`   ${rows.length} senaryo zenginleştirilecek\n`);

  if (rows.length === 0) {
    console.log('Tüm senaryolar zaten zengin — atlanıyor.');
    return;
  }

  const results = [];
  let totalIn = 0, totalOut = 0;
  const CHUNK = 5;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const res = await chunkRun(chunk, i, rows.length);
    for (let j = 0; j < res.length; j++) {
      if (res[j].ok) {
        results.push({ slug: chunk[j].slug, turns: chunk[j].turns, enrichment: res[j].enrichment });
        totalIn += res[j].usage.input_tokens;
        totalOut += res[j].usage.output_tokens;
      }
    }
  }

  console.log(`\n${results.length}/${rows.length} başarılı`);
  console.log(`Token: ${totalIn} → ${totalOut}`);
  const cost = (totalIn / 1e6) * 3 + (totalOut / 1e6) * 15;
  console.log(`Cost: $${cost.toFixed(4)}\n`);

  // UPDATE SQL dump
  const sqls = results.map((r) => buildUpdateSql(r.slug, r.enrichment, r.turns));
  const sqlFile = resolve(ROOT, `supabase/migrations/20260513000012_enrich_scenarios.sql`);
  writeFileSync(sqlFile, '-- Senaryo zenginleştirme (Claude API)\nBEGIN;\n' + sqls.join('\n') + '\nCOMMIT;\n', 'utf-8');
  console.log(`SQL yazıldı: ${sqlFile}`);
  console.log(`Apply: supabase db query --linked --file ${sqlFile}`);
}

main().catch((e) => { console.error('FATAL:', e); process.exit(1); });
