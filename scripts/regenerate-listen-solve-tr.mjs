#!/usr/bin/env node
/**
 * listen_solve_drills.question_tr + explanation_tr + hint_tr + options[].label_tr
 * alanlarını doğal Türkçe'ye dönüştür. Aviation jargon İngilizce kalır.
 */
import Anthropic from '@anthropic-ai/sdk';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

if (!process.env.ANTHROPIC_API_KEY) { console.error('ANTHROPIC_API_KEY env yok.'); process.exit(1); }

const envText = fs.readFileSync(path.join(ROOT, 'admin/.env.local'), 'utf8');
const SUPABASE_URL = envText.match(/^NEXT_PUBLIC_SUPABASE_URL=(.+)$/m)?.[1]?.trim().replace(/^["']|["']$/g, '');
const SUPABASE_KEY = envText.match(/^SUPABASE_SERVICE_ROLE_KEY=(.+)$/m)?.[1]?.trim().replace(/^["']|["']$/g, '');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = 'claude-sonnet-4-5';

const SYSTEM_PROMPT = `Sen aviation English'i doğal Türkçe'ye çeviren uzman bir editörsün.

KURAL:
1. Havacılık jargonu HER ZAMAN İngilizce kalır:
   callsign, registration, clearance, runway, taxiway, holding point,
   readback, MEL, AOG, ECAM, hydraulic, unserviceable, flight level,
   altitude, heading, frequency, decimal, squawk, transponder, QNH,
   wilco, roger, mayday, pan-pan, line-up, vector, landing gear,
   brake, threshold, taxi, climb, descent, cruise, approach, departure,
   METAR, NOTAM, SIGMET, ETOPS, ILS, VOR, holding, snag, tech log,
   APU, pushback, marshalling, de-icing, anti-icing, fuel uplift,
   PIREP, slot, alternate.
2. Cümle yapısı doğal Türkçe.
   YANLIŞ: "What altitude was instructed?" → "Hangi altitude instruct edildi?"
   DOĞRU:  → "Hangi altitude'a çıkılması talimat verildi?"
3. ÇIKTI: SADECE JSON.`;

function userPrompt({ audio_text, question_en, question_tr, options, correct_id, explanation_tr, explanation_en, hint_tr }) {
  return `Aşağıdaki listen-solve drill için Türkçe alanları doğal Türkçe'ye dönüştür.

Audio (EN, TTS okunacak): ${audio_text}
Soru EN: ${question_en}
Soru TR (mevcut): ${question_tr}
Cevap doğrusu: ${correct_id}
Seçenekler (mevcut TR ↔ EN):
${options.map((o) => `  ${o.id}: TR="${o.label_tr}" | EN="${o.label_en}"`).join('\n')}
Açıklama TR (mevcut): ${explanation_tr ?? '(yok)'}
Açıklama EN: ${explanation_en ?? '(yok)'}
Hint TR (mevcut): ${hint_tr ?? '(yok)'}

Görev:
1. question_tr: doğal TR. Aviation jargon EN.
2. options[].label_tr: her seçenek doğal TR. Aviation terimler EN kalır.
3. explanation_tr: cevap açıklaması doğal TR.
4. hint_tr (varsa): doğal TR.

ÇIKTI formatı (sadece bu JSON):
{
  "question_tr": "...",
  "options": [{"id": "a", "label_tr": "..."}, {"id": "b", "label_tr": "..."}, ...],
  "explanation_tr": "...",
  "hint_tr": "..."
}`;
}

async function fetchDraft() {
  const url = `${SUPABASE_URL}/rest/v1/listen_solve_drills?status=eq.draft&select=id,slug,audio_text,question_en,question_tr,options,correct_id,explanation_tr,explanation_en,hint_tr`;
  const res = await fetch(url, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } });
  return await res.json();
}

async function regenerateOne(row, idx, total) {
  const start = Date.now();
  process.stdout.write(`[${idx + 1}/${total}] ${row.slug.slice(0, 45)}... `);
  try {
    const msg = await client.messages.create({
      model: MODEL, max_tokens: 800, system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt(row) }],
    });
    const text = msg.content[0]?.type === 'text' ? msg.content[0].text : '';
    const cleaned = text.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
    const parsed = JSON.parse(cleaned);
    if (!parsed.question_tr || !Array.isArray(parsed.options) || parsed.options.length !== 4) {
      throw new Error('format invalid');
    }
    // Merge options: orijinal label_en korunur, sadece label_tr update
    const mergedOptions = row.options.map((orig) => {
      const found = parsed.options.find((p) => p.id === orig.id);
      return { ...orig, label_tr: found?.label_tr ?? orig.label_tr };
    });
    console.log(`✓ (${Date.now() - start}ms)`);
    return {
      ok: true, id: row.id, slug: row.slug,
      question_tr: parsed.question_tr,
      options: mergedOptions,
      explanation_tr: parsed.explanation_tr ?? row.explanation_tr,
      hint_tr: parsed.hint_tr ?? row.hint_tr,
      usage: msg.usage,
    };
  } catch (e) {
    console.log(`✗ ${e.message?.slice(0, 60)}`);
    return { ok: false, id: row.id, slug: row.slug, error: e.message };
  }
}

async function updateDb(id, patch) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/listen_solve_drills?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json', Prefer: 'return=minimal',
    },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(`update ${id}: ${res.status}`);
}

(async () => {
  const rows = await fetchDraft();
  console.log(`Listen-solve draft: ${rows.length}\n`);

  const results = [];
  let totalIn = 0, totalOut = 0;
  const CHUNK = 5;
  const DELAY_MS = 3000;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const chunkResults = await Promise.all(chunk.map((r, j) => regenerateOne(r, i + j, rows.length)));
    for (const r of chunkResults) {
      if (r.ok) {
        results.push(r);
        totalIn += r.usage.input_tokens;
        totalOut += r.usage.output_tokens;
      }
    }
    if (i + CHUNK < rows.length) await new Promise((res) => setTimeout(res, DELAY_MS));
  }
  console.log(`\n✅ ${results.length}/${rows.length} regenerated`);
  const cost = (totalIn / 1_000_000) * 3 + (totalOut / 1_000_000) * 15;
  console.log(`Maliyet: $${cost.toFixed(4)}`);

  console.log('\n─── DB UPDATE ───');
  let updated = 0;
  for (const r of results) {
    try {
      await updateDb(r.id, {
        question_tr: r.question_tr,
        options: r.options,
        explanation_tr: r.explanation_tr,
        hint_tr: r.hint_tr,
      });
      updated++;
    } catch (e) {
      console.log(`  ✗ ${r.slug}: ${e.message}`);
    }
  }
  console.log(`✅ ${updated}/${results.length} DB güncellendi`);
})().catch((e) => { console.error('FAIL:', e); process.exit(1); });
