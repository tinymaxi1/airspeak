#!/usr/bin/env node
/**
 * scripts/regenerate-readback-tr.mjs
 *
 * readback_clearances.hint_tr alanını doğal Türkçe'ye dönüştür.
 * Aviation jargon İngilizce kalır, cümle fiil ve yapısı doğal TR.
 *
 * Çağrı:
 *   export ANTHROPIC_API_KEY=$(grep '^ANTHROPIC_API_KEY=' .env.local | cut -d= -f2-)
 *   node scripts/regenerate-readback-tr.mjs --preview   # 3 sample
 *   node scripts/regenerate-readback-tr.mjs --batch     # tüm draft satırlar
 *
 * Pattern doğru: "Arıza raporunda aircraft registration, exact location
 *   (left main gear), sıvı tipi (hydraulic) ve unserviceable durumu mutlaka
 *   teyit edilmeli."
 * Pattern yanlış: "Defect report'ta aircraft registration, exact location,
 *   ve unserviceable status mutlaka acknowledge edilmeli."
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
if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error('Supabase env eksik');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = 'claude-sonnet-4-5';

const SYSTEM_PROMPT = `Sen aviation English'i doğal Türkçe'ye çeviren uzman bir editörsün.

KURAL:
1. Havacılık jargonu HER ZAMAN İngilizce kalır:
   callsign, registration, clearance, runway, taxiway, holding point,
   readback, MEL, AOG, ECAM, hydraulic, unserviceable, flight level,
   altitude, heading, frequency, decimal, squawk, transponder, QNH,
   wilco, roger, affirm, negative, mayday, pan-pan, line-up, vector,
   landing gear, brake, accumulator, threshold, taxi, climb, descent,
   cruise, approach, departure, dispatcher, METAR, NOTAM, SIGMET,
   ETOPS, CTOT, SID, STAR, ILS, VOR, holding, snag, defect, AOG,
   tech log, A-check, C-check, EGT, APU, pushback, marshalling,
   de-icing, anti-icing, fuel uplift, PIREP, slot, alternate.
2. Cümle fiilleri ve yapısı tamamen doğal Türkçe olur.
   YANLIŞ: "Defect report'ta acknowledge edilmeli"
   DOĞRU:  "Arıza raporunda mutlaka teyit edilmeli"
3. "report" → "rapor"; "acknowledge" → "teyit et" / "onayla"; "confirm" → "doğrula".
4. Birden fazla cümle olabilir ama TR akıcı olsun.
5. ÇIKTI: SADECE JSON, başka metin yok. Markdown fence yok.`;

function userPrompt({ atc_utterance, expected_readback, hint_tr, hint_en, category }) {
  return `Aşağıdaki readback drill için Türkçe ipucunu doğal Türkçe'ye dönüştür.

Drill bağlamı:
  category: ${category ?? '(yok)'}
  atc_utterance: ${atc_utterance}
  expected_readback: ${expected_readback}

Mevcut Türkçe (karışık): ${hint_tr}
İngilizce referans:      ${hint_en ?? '(yok)'}

Görev: hint_tr'yi ${hint_en ?? 'mevcut TR'}'in anlamını koruyarak, havacılık jargonu İngilizce KALACAK şekilde DOĞAL TÜRKÇE'ye dönüştür. Cümle yapısı tamamen Türkçe olmalı. 1-2 cümle.

ÇIKTI formatı (sadece bu JSON, başka şey yok):
{"hint_tr": "düzenlenmiş doğal türkçe ipucu"}`;
}

async function fetchDraftClearances(limit = null) {
  const url = `${SUPABASE_URL}/rest/v1/readback_clearances?status=eq.draft&select=id,slug,atc_utterance,expected_readback,hint_tr,hint_en,category${limit ? `&limit=${limit}` : ''}`;
  const res = await fetch(url, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  if (!res.ok) throw new Error(`fetch failed: ${res.status} ${await res.text()}`);
  return await res.json();
}

async function regenerateOne(row, idx, total) {
  const start = Date.now();
  process.stdout.write(`[${idx + 1}/${total}] ${row.slug.slice(0, 50)}... `);
  try {
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt(row) }],
    });
    const text = msg.content[0]?.type === 'text' ? msg.content[0].text : '';
    const cleaned = text.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
    const parsed = JSON.parse(cleaned);
    if (!parsed.hint_tr || typeof parsed.hint_tr !== 'string') {
      throw new Error('hint_tr missing or invalid');
    }
    const ms = Date.now() - start;
    console.log(`✓ (${ms}ms, ${msg.usage.input_tokens}→${msg.usage.output_tokens} tok)`);
    return { ok: true, id: row.id, slug: row.slug, old: row.hint_tr, new: parsed.hint_tr, usage: msg.usage };
  } catch (e) {
    console.log(`✗ ${e.message?.slice(0, 60)}`);
    return { ok: false, id: row.id, slug: row.slug, error: e.message };
  }
}

async function updateDb(id, hint_tr) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/readback_clearances?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ hint_tr }),
  });
  if (!res.ok) throw new Error(`update failed ${id}: ${res.status}`);
}

(async () => {
  const mode = process.argv[2] ?? '--preview';
  console.log(`Mode: ${mode} | Model: ${MODEL}\n`);

  // Preview: 3 sample (farklı kategorilerden — emergency, maintenance, taxi)
  let rows = await fetchDraftClearances();
  console.log(`Toplam draft: ${rows.length}`);
  if (mode === '--preview') {
    // Çeşitli kategori, çeşitli rol seç
    const categories = ['maintenance_comm', 'emergency', 'taxi'];
    rows = categories
      .map((cat) => rows.find((r) => r.category === cat && r.hint_tr && r.hint_tr.length > 30))
      .filter(Boolean);
    if (rows.length < 3) {
      // Fallback: ilk 3 hint_tr dolu
      rows = (await fetchDraftClearances())
        .filter((r) => r.hint_tr && r.hint_tr.length > 30)
        .slice(0, 3);
    }
    console.log(`Preview: ${rows.length} sample (${rows.map((r) => r.category).join(', ')})\n`);
  }

  const results = [];
  let totalIn = 0, totalOut = 0;
  const CHUNK = mode === '--preview' ? 3 : 5;       // rate limit için 5
  const DELAY_MS = mode === '--preview' ? 0 : 3000; // chunk arası 3 sn
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
    if (i + CHUNK < rows.length && DELAY_MS > 0) {
      await new Promise((res) => setTimeout(res, DELAY_MS));
    }
  }

  console.log(`\n✅ ${results.length}/${rows.length} regenerated`);
  console.log(`Token: ${totalIn} in + ${totalOut} out`);
  const cost = (totalIn / 1_000_000) * 3 + (totalOut / 1_000_000) * 15;
  console.log(`Maliyet: $${cost.toFixed(4)}`);

  if (mode === '--preview') {
    // DB'ye yazma, sadece karşılaştırma göster
    console.log('\n═══ KARŞILAŞTIRMA (DB güncellenmedi) ═══\n');
    for (const r of results) {
      console.log(`── ${r.slug} (${rows.find((x) => x.id === r.id)?.category}) ──`);
      console.log(`ESKİ: ${r.old}`);
      console.log(`YENİ: ${r.new}\n`);
    }
    const avgIn = totalIn / results.length;
    const avgOut = totalOut / results.length;
    const totalRows = (await fetchDraftClearances()).length;
    const batchCost = ((avgIn * totalRows) / 1_000_000) * 3 + ((avgOut * totalRows) / 1_000_000) * 15;
    console.log(`Tahmini batch (${totalRows} draft): $${batchCost.toFixed(2)}`);
  } else {
    // Batch: DB UPDATE
    console.log('\n─── DB UPDATE ───');
    let updated = 0;
    for (const r of results) {
      try {
        await updateDb(r.id, r.new);
        updated++;
      } catch (e) {
        console.log(`  ✗ ${r.slug}: ${e.message}`);
      }
    }
    console.log(`✅ ${updated}/${results.length} DB güncellendi`);
  }
})().catch((e) => {
  console.error('FAIL:', e);
  process.exit(1);
});
