#!/usr/bin/env node
/**
 * pronunciation_sentences.text_tr + hint_tr alanlarını doğal Türkçe'ye dönüştür.
 * Aviation jargon İngilizce kalır, cümle yapısı doğal TR.
 *
 * Çağrı:
 *   export ANTHROPIC_API_KEY=$(...)
 *   node scripts/regenerate-pronunciation-tr.mjs --batch
 */
import Anthropic from '@anthropic-ai/sdk';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY env yok.');
  process.exit(1);
}

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
   wilco, roger, affirm, negative, mayday, pan-pan, line-up, vector,
   landing gear, brake, threshold, taxi, climb, descent, cruise,
   approach, departure, dispatcher, METAR, NOTAM, SIGMET, ETOPS,
   CTOT, SID, STAR, ILS, VOR, holding, snag, tech log, APU, pushback,
   marshalling, de-icing, anti-icing, fuel uplift, PIREP.
2. Cümle fiilleri ve yapısı doğal Türkçe.
   YANLIŞ: "Climb to flight level three five zero, Speedbird two six alpha"
           → "Speedbird two six alpha için flight level üç beş sıfıra climb"
   DOĞRU:  → "Speedbird two six alpha, flight level three five zero'a tırmanın"
3. ÇIKTI: SADECE JSON, başka metin yok.`;

function userPrompt({ text_en, text_tr, hint_tr, hint_en, ipa }) {
  return `Aşağıdaki pronunciation drill için Türkçe alanları doğal Türkçe'ye dönüştür.

Cümle (EN):  ${text_en}
IPA:         ${ipa ?? '(yok)'}
Mevcut TR:   ${text_tr ?? '(yok)'}
İpucu (TR):  ${hint_tr ?? '(yok)'}
İpucu (EN):  ${hint_en ?? '(yok)'}

Görev:
1. text_tr: cümlenin Türkçe karşılığı. Aviation terimler EN kalır.
   ÖRN: "Climb flight level three five zero" → "Flight level three five zero'a tırmanın"
2. hint_tr: ipucu. Telaffuz tavsiyesi (vurgu, ses, fonetik) doğal Türkçe.

ÇIKTI formatı (sadece bu JSON):
{"text_tr": "...", "hint_tr": "..."}`;
}

async function fetchDraft() {
  const url = `${SUPABASE_URL}/rest/v1/pronunciation_sentences?status=eq.draft&select=id,slug,text_en,text_tr,hint_tr,hint_en,ipa`;
  const res = await fetch(url, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } });
  return await res.json();
}

async function regenerateOne(row, idx, total) {
  const start = Date.now();
  process.stdout.write(`[${idx + 1}/${total}] ${row.slug.slice(0, 45)}... `);
  try {
    const msg = await client.messages.create({
      model: MODEL, max_tokens: 400, system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt(row) }],
    });
    const text = msg.content[0]?.type === 'text' ? msg.content[0].text : '';
    const cleaned = text.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
    const parsed = JSON.parse(cleaned);
    if (!parsed.text_tr || !parsed.hint_tr) throw new Error('field missing');
    console.log(`✓ (${Date.now() - start}ms)`);
    return { ok: true, id: row.id, slug: row.slug, ...parsed, usage: msg.usage };
  } catch (e) {
    console.log(`✗ ${e.message?.slice(0, 60)}`);
    return { ok: false, id: row.id, slug: row.slug, error: e.message };
  }
}

async function updateDb(id, patch) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/pronunciation_sentences?id=eq.${id}`, {
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
  console.log(`Pronunciation draft: ${rows.length}\n`);

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
      await updateDb(r.id, { text_tr: r.text_tr, hint_tr: r.hint_tr });
      updated++;
    } catch (e) {
      console.log(`  ✗ ${r.slug}: ${e.message}`);
    }
  }
  console.log(`✅ ${updated}/${results.length} DB güncellendi`);
})().catch((e) => { console.error('FAIL:', e); process.exit(1); });
