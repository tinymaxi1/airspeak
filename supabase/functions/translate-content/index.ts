/**
 * AirSpeak — translate-content Edge Function
 * Sprint 9.C
 *
 * Body:
 *   { content_type, content_id, target_langs?: string[], fields?: string[] }
 *
 * Akış:
 *   1. Source row çek (content_type'a göre tablo + field whitelist)
 *   2. target_langs boşsa: SUPPORTED_LOCALES \ mevcut çeviriler (eksikler)
 *   3. Aviation glossary (verified=true) çek → system prompt
 *   4. Claude API tek çağrı: tüm fields × tüm langs JSON çıktı
 *   5. content_translations bulk upsert
 *   6. Cost tracking (ai.translation_cost_total + ai.translation_calls)
 *
 * Mock-first: ANTHROPIC API key yok ise her field × lang için
 *   "[lang] {original}" placeholder yazılır.
 *
 * Auth: service_role bearer (admin'den çağrılır).
 * Rate limit: 'translate' bucket, 60/saat per IP.
 */
import { createClient, type SupabaseClient } from 'jsr:@supabase/supabase-js@2';

const SUPPORTED_LOCALES = [
  'en', 'tr', 'ar', 'fa', 'de', 'fr', 'es', 'it', 'pt', 'nl',
  'pl', 'el', 'zh', 'ja', 'ko', 'hi', 'id', 'th', 'ms', 'ru',
] as const;

// content_type → (tablo, çevrilebilir field'lar)
const CONTENT_FIELD_MAP: Record<string, { table: string; fields: string[] }> = {
  modules: { table: 'modules', fields: ['title', 'description'] },
  units: { table: 'units', fields: ['title', 'description'] },
  lessons: { table: 'lessons', fields: ['title'] },
  exercises: { table: 'exercises', fields: ['prompt', 'context', 'explanation'] },
  vocab_terms: { table: 'vocab_terms', fields: ['term', 'definition', 'example'] },
  interview_questions: { table: 'interview_questions', fields: ['question'] },
  oral_prompts: { table: 'oral_prompts', fields: ['prompt'] },
  placement_questions: { table: 'placement_questions', fields: ['question', 'explanation'] },
  airlines: { table: 'airlines', fields: ['title'] },
};

interface ReqBody {
  content_type: string;
  content_id: string;
  target_langs?: string[];
  fields?: string[];
}

async function getConfig(client: SupabaseClient): Promise<Map<string, any>> {
  const { data } = await client.from('app_config').select('key, value').like('key', 'ai.%');
  const m = new Map<string, any>();
  for (const r of (data ?? []) as any[]) m.set(r.key, r.value);
  return m;
}

function unquote(v: any): string {
  return String(v ?? '').replace(/^"|"$/g, '');
}

interface GlossaryEntry {
  term_en: string;
  term_tr: string | null;
  abbreviation: string | null;
  category: string;
}

async function getGlossary(client: SupabaseClient): Promise<GlossaryEntry[]> {
  const { data } = await client
    .from('aviation_glossary')
    .select('term_en, term_tr, abbreviation, category')
    .eq('is_verified', true)
    .order('frequency', { ascending: false })
    .limit(500); // System prompt boyutu için cap
  return ((data as any[]) ?? []) as GlossaryEntry[];
}

function buildSystemPrompt(glossary: GlossaryEntry[]): string {
  const glossaryText = glossary.length === 0
    ? '(no verified glossary terms)'
    : glossary
        .map((g) => `- ${g.term_en}${g.abbreviation ? ` (${g.abbreviation})` : ''}${g.term_tr ? ` [TR: ${g.term_tr}]` : ''} — ${g.category}`)
        .join('\n');

  return `You are an aviation industry professional translator for AirSpeak (an aviation English learning app).

ICAO Standard Phraseology RULE:
- Standard ICAO radio phraseology (Mayday, Squawk, Roger, Wilco, Affirm, Negative, Cleared for takeoff, etc.) MUST stay in English in ALL target languages. This is an international aviation standard.

GLOSSARY (verified aviation terms — use these translations when applicable):
${glossaryText}

Translation rules:
1. Preserve {{variables}} exactly (no translation).
2. Use ICAO terminology for aviation contexts.
3. Tone: professional + warm (cabin crew style).
4. Length: ±20% of source.
5. Cultural sensitivity: NO political content; aviation neutral.
6. Output STRICT JSON only — no markdown, no explanation.`;
}

interface TranslateBatch {
  // { fieldName: { lang: translatedText } }
  [field: string]: { [lang: string]: string };
}

async function callClaude(
  apiKey: string,
  model: string,
  systemPrompt: string,
  sourceFields: Record<string, string>,
  targetLangs: string[],
): Promise<{ result: TranslateBatch; tokensIn: number; tokensOut: number }> {
  const userMessage = `Translate the following fields into ${targetLangs.join(', ')}.

Source (English):
${JSON.stringify(sourceFields, null, 2)}

Output JSON format:
{
  "fieldName1": { "lang1": "...", "lang2": "..." },
  "fieldName2": { "lang1": "...", "lang2": "..." }
}

Output JSON only.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Claude API ${response.status}: ${text}`);
  }
  const data = await response.json();
  const tokensIn = data.usage?.input_tokens ?? 0;
  const tokensOut = data.usage?.output_tokens ?? 0;
  const content = data.content?.[0]?.text ?? '{}';

  // Strip markdown code fences if present
  const cleaned = content.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
  let result: TranslateBatch = {};
  try {
    result = JSON.parse(cleaned);
  } catch (e) {
    throw new Error('Claude returned invalid JSON: ' + cleaned.slice(0, 200));
  }
  return { result, tokensIn, tokensOut };
}

function mockTranslate(
  sourceFields: Record<string, string>,
  targetLangs: string[],
): TranslateBatch {
  const out: TranslateBatch = {};
  for (const [field, value] of Object.entries(sourceFields)) {
    out[field] = {};
    for (const lang of targetLangs) {
      out[field][lang] = `[${lang.toUpperCase()}] ${value}`;
    }
  }
  return out;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method_not_allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: ReqBody;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'invalid_json' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  if (!body.content_type || !body.content_id) {
    return new Response(JSON.stringify({ error: 'content_type_and_id_required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const fieldMap = CONTENT_FIELD_MAP[body.content_type];
  if (!fieldMap) {
    return new Response(
      JSON.stringify({ error: 'unsupported_content_type', supported: Object.keys(CONTENT_FIELD_MAP) }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const client = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  // Sprint 7.C — Rate limit: 60/saat per IP
  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0]?.trim() || 'unknown';
  const { data: rl } = await client.rpc('check_rate_limit', {
    p_bucket: 'translate',
    p_identity: `ip:${ip}`,
    p_max: 60,
    p_window_seconds: 3600,
  });
  if (rl && (rl as any).ok === false) {
    return new Response(JSON.stringify(rl), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 1) Source row
  const fieldList = body.fields ?? fieldMap.fields;
  const { data: row, error: rowErr } = await client
    .from(fieldMap.table)
    .select('id, ' + fieldList.join(', '))
    .eq('id', body.content_id)
    .maybeSingle();

  if (rowErr || !row) {
    return new Response(
      JSON.stringify({ error: 'source_not_found', detail: rowErr?.message }),
      { status: 404, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const sourceFields: Record<string, string> = {};
  for (const f of fieldList) {
    const val = (row as any)[f];
    if (typeof val === 'string' && val.trim().length > 0) {
      sourceFields[f] = val;
    }
  }
  if (Object.keys(sourceFields).length === 0) {
    return new Response(
      JSON.stringify({ ok: true, translated: 0, skipped: 'no_source_text' }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  }

  // 2) Target langs (eksikleri otomatik bul)
  let targetLangs = body.target_langs;
  if (!targetLangs || targetLangs.length === 0) {
    const { data: existing } = await client
      .from('content_translations')
      .select('language_code, field_name')
      .eq('content_type', body.content_type)
      .eq('content_id', body.content_id);

    const existingPairs = new Set(
      ((existing as any[]) ?? []).map((r) => `${r.field_name}:${r.language_code}`),
    );
    // EN ve TR mevcut tablodan geliyor (legacy _tr) — content_translations sadece 18 ek dil
    targetLangs = SUPPORTED_LOCALES.filter((l) => l !== 'en' && l !== 'tr').filter((l) => {
      // Bu lang en az 1 field için eksikse hedefte olsun
      return Object.keys(sourceFields).some((f) => !existingPairs.has(`${f}:${l}`));
    });
  } else {
    targetLangs = targetLangs.filter((l) => SUPPORTED_LOCALES.includes(l as any));
  }

  if (targetLangs.length === 0) {
    return new Response(
      JSON.stringify({ ok: true, translated: 0, skipped: 'all_langs_complete' }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  }

  // 3) Glossary
  const glossary = await getGlossary(client);
  const systemPrompt = buildSystemPrompt(glossary);

  // 4) Claude or mock
  const config = await getConfig(client);
  const provider = unquote(config.get('ai.translation_provider') ?? 'mock');
  const apiKey = unquote(config.get('ai.anthropic_api_key') ?? '');
  const model = unquote(config.get('ai.translation_model') ?? 'claude-sonnet-4-5');

  let translateResult: TranslateBatch;
  let translator = 'claude';
  let tokensIn = 0;
  let tokensOut = 0;
  let costUsd = 0;
  let usedProvider = provider;

  if (provider === 'claude' && apiKey.length >= 10) {
    try {
      const r = await callClaude(apiKey, model, systemPrompt, sourceFields, targetLangs);
      translateResult = r.result;
      tokensIn = r.tokensIn;
      tokensOut = r.tokensOut;
      // Claude Sonnet 4.5 batch est. — input $3/M, output $15/M
      costUsd = (tokensIn / 1_000_000) * 3 + (tokensOut / 1_000_000) * 15;
    } catch (e) {
      console.error('[translate-content] claude error → mock fallback:', e);
      translateResult = mockTranslate(sourceFields, targetLangs as string[]);
      translator = 'claude';
      usedProvider = 'mock_fallback';
    }
  } else {
    translateResult = mockTranslate(sourceFields, targetLangs as string[]);
    translator = 'claude'; // schema check için; mock entry de claude bucket
    usedProvider = 'mock';
  }

  // 5) Bulk upsert
  type Row = {
    content_type: string;
    content_id: string;
    field_name: string;
    language_code: string;
    value: string;
    is_machine_translated: boolean;
    translator: string;
  };
  const upserts: Row[] = [];
  for (const [field, langs] of Object.entries(translateResult)) {
    for (const [lang, value] of Object.entries(langs)) {
      if (!SUPPORTED_LOCALES.includes(lang as any)) continue;
      if (!value || typeof value !== 'string') continue;
      upserts.push({
        content_type: body.content_type,
        content_id: body.content_id,
        field_name: field,
        language_code: lang,
        value,
        is_machine_translated: true,
        translator,
      });
    }
  }

  if (upserts.length > 0) {
    const { error: upErr } = await client.from('content_translations').upsert(upserts, {
      onConflict: 'content_type,content_id,field_name,language_code',
    });
    if (upErr) {
      console.error('[translate-content] upsert error:', upErr);
      return new Response(
        JSON.stringify({ ok: false, error: 'upsert_failed', detail: upErr.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }
  }

  // 6) Cost tracking (best-effort)
  if (costUsd > 0) {
    try {
      const cur = parseFloat(unquote(config.get('ai.translation_cost_total') ?? '0')) || 0;
      const calls = parseInt(unquote(config.get('ai.translation_calls') ?? '0'), 10) || 0;
      await client.from('app_config').upsert(
        [
          {
            key: 'ai.translation_cost_total',
            value: JSON.stringify((cur + costUsd).toFixed(4)),
            description: 'Toplam çeviri maliyeti (USD)',
            category: 'general',
            data_type: 'string',
          },
          {
            key: 'ai.translation_calls',
            value: JSON.stringify(String(calls + 1)),
            description: 'Toplam çeviri Edge fn çağrı sayısı',
            category: 'general',
            data_type: 'string',
          },
        ],
        { onConflict: 'key' },
      );
    } catch {
      /* ignore */
    }
  }

  return new Response(
    JSON.stringify({
      ok: true,
      translated: upserts.length,
      target_langs: targetLangs,
      provider: usedProvider,
      tokens_in: tokensIn,
      tokens_out: tokensOut,
      cost_usd: costUsd,
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );
});
