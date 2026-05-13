#!/usr/bin/env node
/**
 * scripts/generate-scenarios.mjs
 *
 * Claude API (claude-sonnet-4-5) ile aviation senaryosu üret.
 *
 * Kullanım:
 *   node scripts/generate-scenarios.mjs --preview   # ilk 3 örnek (atc, cabin, tech)
 *   node scripts/generate-scenarios.mjs --batch     # tüm 35 senaryo
 *
 * Output: scripts/scenarios-generated.json
 */
import Anthropic from '@anthropic-ai/sdk';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

// Çağrı: node --env-file=.env.local scripts/generate-scenarios.mjs [--preview|--batch]
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = 'claude-sonnet-4-5';

// Hedef senaryolar — her satır: { role, sub_role?, level, theme }
const PREVIEW_TARGETS = [
  { role: 'atc', level: 'B2', theme: 'Departure clearance issue', sub_role: null },
  { role: 'cabin', level: 'B1', theme: 'Boarding PA announcement', sub_role: null },
  { role: 'technician', level: 'B2', theme: 'Pre-flight walk-around defect found', sub_role: null },
];

const FULL_TARGETS = [
  // pilot: 1
  { role: 'pilot', level: 'B2', theme: 'Weather diversion request' },
  // atc: 4 (preview Departure clearance hariç)
  { role: 'atc', level: 'B1', theme: 'Taxi clearance with crossing instruction' },
  { role: 'atc', level: 'B2', theme: 'Vectoring for ILS approach' },
  { role: 'atc', level: 'L4', theme: 'Conflict resolution between two aircraft' },
  { role: 'atc', level: 'L4', theme: 'Emergency declaration handling' },
  // cabin: 4 (preview Boarding PA + existing PA turbulence hariç)
  { role: 'cabin', level: 'B1', theme: 'Pre-departure safety briefing demo' },
  { role: 'cabin', level: 'B2', theme: 'Medical emergency in cabin coordination' },
  { role: 'cabin', level: 'L4', theme: 'Cabin evacuation command sequence' },
  { role: 'cabin', level: 'B2', theme: 'Unruly passenger handling' },
  // technician: 4 (preview walk-around hariç)
  { role: 'technician', level: 'B1', theme: 'MEL item dispatch decision' },
  { role: 'technician', level: 'B2', theme: 'AOG report to operations control' },
  { role: 'technician', level: 'B2', theme: 'Snag entry to tech log' },
  { role: 'technician', level: 'B1', theme: 'Post-flight inspection report' },
  // ground: 5
  { role: 'ground', level: 'B1', theme: 'Pushback coordination with cockpit' },
  { role: 'ground', level: 'B1', theme: 'Marshalling aircraft to gate' },
  { role: 'ground', level: 'B2', theme: 'Refueling supervision' },
  { role: 'ground', level: 'B2', theme: 'De-icing fluid request and HOT time' },
  { role: 'ground', level: 'B1', theme: 'Baggage loading coordination' },
  // student: 5
  { role: 'student', level: 'B1', theme: 'Basic ATC readback practice' },
  { role: 'student', level: 'B1', theme: 'ICAO phonetic alphabet drill' },
  { role: 'student', level: 'B1', theme: 'Number transmission (altitudes, headings, frequencies)' },
  { role: 'student', level: 'B2', theme: 'Standard phraseology recall' },
  { role: 'student', level: 'B2', theme: 'Mock pilot interview Q&A' },
  // dispatcher: 5
  { role: 'dispatcher', level: 'B2', theme: 'METAR and TAF briefing to flight crew' },
  { role: 'dispatcher', level: 'B2', theme: 'Route planning with active NOTAM' },
  { role: 'dispatcher', level: 'L4', theme: 'Weather diversion coordination' },
  { role: 'dispatcher', level: 'B2', theme: 'Fuel calculation for ETOPS flight' },
  { role: 'dispatcher', level: 'B1', theme: 'NOTAM impact briefing' },
];

const SYSTEM_PROMPT = `You are an aviation English content designer for AirSpeak, a Turkish aviation app.
You create realistic ATC/operational training scenarios for ICAO Annex 1 language proficiency practice.

Rules:
- Use real ICAO phraseology (e.g., "cleared for takeoff", "say again", "wilco", "stand by").
- Realistic call signs (Turkish 1453, Speedbird 285), airports (IST, JFK, LHR), runways (35L, 27R).
- Each scenario has 2-3 dialog turns. User responds to ATC/colleague/system prompts.
- Turn structure:
    atcStation (e.g., "ISTANBUL TOWER", "CAPTAIN", "CABIN CHIEF" for English original)
    atcUtterance (English, what the other party says)
    expectedReadback (English, what the USER must say back)
    keyPhrases (array of arrays, alternative wordings to match)
    correctionTr (Turkish hint if user fails — natural Turkish, keep aviation jargon in English)
    hintTr (optional Turkish encouragement)
    isFinal (last turn)
- gauges only for pilot/atc (alt, hdg, spd, freq); optional.

TURKISH LANGUAGE RULES (KRİTİK):
- KEEP aviation jargon in English inside Turkish text:
    walk-around, briefing, clearance, MEL, AOG, NOTAM, METAR, TAF, snag,
    pushback, marshalling, vectoring, holding, readback, taxi, runway,
    PA, takeoff, landing, gear, flaps, throttle, autopilot, ILS, VOR, ETOPS.
  Örnek (DOĞRU): "Sabah walk-around yapıyorsunuz, hidrolik kaçak gördünüz."
  Örnek (YANLIŞ): "Sabah çevir kontrolünde hidrolik sıvısı sızıntısı."
- TR speakers/stations names: Kaptan, FO (Birinci Pilot), Kule, Yer, Yaklaşma,
  Süpervisör, Teknisyen, Kabin Amiri, Operasyon, OCC. (atcStation İngilizce kalır,
  ama setup_tr ve correctionTr içinde TR isim kullan).
- TR summary kısa, doğal, sertlik yok. 1-2 cümle yeter. Korkmuş/emir kipi yerine
  açıklayıcı.

OUTPUT: Pure JSON, no markdown fences, no commentary.`;

function userPrompt({ role, sub_role, level, theme }) {
  return `Generate a single training scenario as JSON.

Inputs:
  role: ${role}
  sub_role: ${sub_role ?? '(none)'}
  level: ${level}
  theme: ${theme}

Output schema (return ONLY this JSON object):
{
  "slug": "lowercase-with-hyphens-max-40",
  "role": "${role}",
  "level": "${level}",
  "title": "English short title",
  "title_tr": "Turkish short title",
  "setup": "1-2 sentence English context",
  "setup_tr": "1-2 sentence Turkish context",
  "estimated_minutes": 2,
  "difficulty": ${level === 'L4' ? 5 : level === 'B2' ? 3 : 1},
  "gauges": ${['pilot','atc'].includes(role) ? '{"alt":"...","hdg":"...","spd":"...","freq":"..."}' : 'null'},
  "turns": [
    {
      "id": "turn-1",
      "atcStation": "STATION NAME",
      "frequency": "120.9",
      "atcUtterance": "ATC says something",
      "expectedReadback": "User must readback",
      "keyPhrases": [["key1","alt1"],["key2"]],
      "correctionTr": "Turkish correction hint",
      "hintTr": "optional Turkish encouragement",
      "isFinal": false
    }
  ]
}`;
}

async function generateOne(target, idx, total) {
  const startMs = Date.now();
  process.stdout.write(`[${idx + 1}/${total}] ${target.role}/${target.theme.slice(0, 40)}... `);
  try {
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt(target) }],
    });
    const text = msg.content[0]?.type === 'text' ? msg.content[0].text : '';
    // Strip code fences if any
    const cleaned = text.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
    const parsed = JSON.parse(cleaned);
    const ms = Date.now() - startMs;
    console.log(`✓ (${ms}ms, ${msg.usage.input_tokens}→${msg.usage.output_tokens} tok)`);
    return { ok: true, scenario: parsed, usage: msg.usage };
  } catch (e) {
    console.log(`✗ ${e.message?.slice(0, 80)}`);
    return { ok: false, error: e.message };
  }
}

async function generateChunk(chunk, baseIdx, total) {
  // Paralel 5'er — Promise.all
  return Promise.all(chunk.map((t, i) => generateOne(t, baseIdx + i, total)));
}

async function main() {
  const mode = process.argv[2] ?? '--preview';
  const targets = mode === '--preview' ? PREVIEW_TARGETS : FULL_TARGETS;

  console.log(`Model: ${MODEL}`);
  console.log(`Mode: ${mode} | ${targets.length} senaryo üretilecek (paralel 5'er)\n`);

  const results = [];
  let totalIn = 0;
  let totalOut = 0;
  const CHUNK = 5;
  for (let i = 0; i < targets.length; i += CHUNK) {
    const chunk = targets.slice(i, i + CHUNK);
    const res = await generateChunk(chunk, i, targets.length);
    for (let j = 0; j < res.length; j++) {
      const r = res[j];
      if (r.ok) {
        // sub_role_tag varsa scenario'ya ekle
        if (chunk[j].sub_role_tag && chunk[j].sub_role_tag.length > 0) {
          r.scenario.target_sub_roles = chunk[j].sub_role_tag;
        }
        results.push(r.scenario);
        totalIn += r.usage.input_tokens;
        totalOut += r.usage.output_tokens;
      }
    }
  }

  const out = resolve(ROOT, `scripts/scenarios-${mode === '--preview' ? 'preview' : 'generated'}.json`);
  writeFileSync(out, JSON.stringify(results, null, 2), 'utf-8');

  // Sonnet 4.5 fiyatı: $3/M input, $15/M output
  const cost = (totalIn / 1_000_000) * 3 + (totalOut / 1_000_000) * 15;
  console.log(`\n✅ ${results.length}/${targets.length} senaryo üretildi`);
  console.log(`   Token: ${totalIn} input + ${totalOut} output`);
  console.log(`   Maliyet: $${cost.toFixed(4)}`);
  console.log(`   Dosya: ${out}`);
}

main().catch((e) => { console.error('FATAL:', e); process.exit(1); });
