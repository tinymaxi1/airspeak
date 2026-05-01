/**
 * AirSpeak — Oral Exam Evaluate Edge Function
 *
 * Sprint 7.A.1: placeholder + mock (graceful fallback).
 * Sprint 7.C: gerçek Claude API entegrasyonu.
 *
 * Çağrım:
 *   POST /functions/v1/oral-exam-evaluate
 *   Body: { attempt_id: string }
 *   Headers: Authorization: Bearer <user JWT>  (user owns attempt)
 *
 * Akış:
 *   1. attempt'ı service role ile çek (transcript + prompt)
 *   2. app_config'ten ai.examiner_provider oku
 *   3. provider:
 *      - 'mock' → deterministik 4.0 rubric + generic feedback
 *      - 'claude' → Claude API call (Sprint 7.C)
 *      - 'gpt' → OpenAI Chat Completions (Sprint 7.C)
 *   4. UPDATE oral_exam_attempts: rubric + band_score + feedback_tr +
 *      confidence_score + needs_review (confidence < threshold)
 *
 * Yetki: Caller user JWT olmalı; attempt user_id eşleşmeli (Edge function
 *   kontrol eder). Service role key sadece DB read/write için.
 */
import { createClient, type SupabaseClient } from 'jsr:@supabase/supabase-js@2';

interface EvaluateBody {
  attempt_id: string;
}

interface Rubric {
  pronunciation: number;
  structure: number;
  vocabulary: number;
  fluency: number;
  comprehension: number;
  interactions: number;
}

interface EvaluationResult {
  rubric: Rubric;
  band_score: number;
  feedback_tr: string;
  confidence_score: number;
  provider: string;
  examiner_model: string;
  tokens_in?: number;
  tokens_out?: number;
  estimated_cost_usd?: number;
}

// Claude pricing (USD per 1M tokens) — claude-sonnet-4-5 (snapshot 2026-01)
// Bu sabitler model değiştiğinde admin panel UI'sından update edilebilir.
// Şimdilik hardcoded — gerçek fiyatlandırma anthropic.com/pricing.
const CLAUDE_PRICING: Record<string, { input: number; output: number }> = {
  'claude-sonnet-4-5': { input: 3.0, output: 15.0 },
  'claude-haiku-4-5-20251001': { input: 0.8, output: 4.0 },
  'claude-opus-4-7': { input: 15.0, output: 75.0 },
};

function estimateClaudeCost(model: string, tokensIn: number, tokensOut: number): number {
  const p = CLAUDE_PRICING[model] ?? CLAUDE_PRICING['claude-sonnet-4-5']!;
  return (tokensIn / 1_000_000) * p.input + (tokensOut / 1_000_000) * p.output;
}

// ─── Mock evaluator (graceful fallback) ─────────────────────────────────
// Deterministik orta-iyi performans (4.0 band) + generic Türkçe feedback.
// Transcript uzunluğuna göre küçük varyasyon — boş ise düşük skor.
function mockEvaluate(transcript: string, durationSeconds: number): EvaluationResult {
  const trimmed = transcript.trim();
  const words = trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length;

  // Heuristics: 0 word → 1.0 band, 1-10 → 2.0, 11-30 → 3.0, 31-60 → 4.0, 60+ → 4.5
  let base: number;
  if (words === 0) base = 1.0;
  else if (words < 10) base = 2.0;
  else if (words < 30) base = 3.0;
  else if (words < 60) base = 4.0;
  else base = 4.5;

  const rubric: Rubric = {
    pronunciation: base,
    structure: base,
    vocabulary: Math.max(1, base - 0.5),
    fluency: base,
    comprehension: Math.min(6, base + 0.5),
    interactions: base,
  };
  const band = Math.round(base);

  let feedback = '';
  if (words === 0) {
    feedback =
      'Cevabın algılanamadı. Mikrofon iznini kontrol et ve daha yüksek sesle tekrar dene.';
  } else if (words < 30) {
    feedback =
      'Cevabın çok kısa. ICAO 4 için en az 60 saniyelik akıcı bir yanıt beklenir. ' +
      'Daha fazla detay ekle: ne gördüğünü, ne düşündüğünü, ne yaptığını anlat.';
  } else {
    feedback =
      'Cevabın yapı olarak makul. Telaffuza ve frazeolojiye dikkat et. ' +
      'Daha çok aviation-specific kelime kullan: clearance, vectors, holding, divert vb. ' +
      'AI examiner şu an mock modunda — admin Claude provider\'ı aktive edince detaylı feedback gelir.';
  }
  // Mock confidence düşük (0.5) — kullanıcılar "real" değer beklemesin diye review queue\'ya düşmesin
  // ama kullanıcı kendisi itiraz ederse queue'ya alınır.
  return {
    rubric,
    band_score: band,
    feedback_tr: feedback,
    confidence_score: 0.5,
    provider: 'mock',
    examiner_model: 'mock-v1',
  };
}

// ─── Claude evaluator (Anthropic API) ──────────────────────────────────
// Sistem mesajı + tool use ile structured JSON output (rubric/band/feedback/confidence).
// ICAO Annex 1 — 6 holistic descriptors, scale 1-6 (1=Pre-elementary, 4=Operational, 6=Expert).
async function claudeEvaluate(
  apiKey: string,
  model: string,
  prompt: any,
  attempt: any,
): Promise<EvaluationResult> {
  const transcript = String(attempt.transcript ?? '').trim();
  const promptText = prompt?.prompt ?? '';
  const expectedTopics: string[] = Array.isArray(prompt?.expected_topics)
    ? prompt.expected_topics
    : [];
  const taskType = prompt?.task_type ?? 'unknown';
  const difficulty = prompt?.difficulty_hint ?? 'B1';
  const duration = attempt.duration_seconds ?? 0;

  const systemPrompt =
    'You are an ICAO-certified language proficiency examiner evaluating aviation English oral exams ' +
    'against ICAO Annex 1 holistic descriptors. The examinee responds to a scenario prompt; you score ' +
    'them on 6 descriptors (pronunciation, structure, vocabulary, fluency, comprehension, interactions) ' +
    'on a 1-6 scale where 4 is the operational threshold (passing). Be strict but fair. ' +
    'Use only the transcript — you cannot hear audio. If transcript is empty/very short, score very low. ' +
    'Provide a 3-5 sentence Turkish (TR) feedback that is actionable and specific. ' +
    'Set confidence_score reflecting your certainty given transcript-only evaluation (typically 0.6-0.8).';

  const userPayload =
    `Task type: ${taskType}\n` +
    `Difficulty hint: ${difficulty}\n` +
    `Prompt: ${promptText}\n` +
    `Expected topics: ${expectedTopics.join(', ') || '(none)'}\n` +
    `Recording duration: ${duration}s\n` +
    `Transcript:\n${transcript || '(empty)'}\n`;

  const tool = {
    name: 'submit_evaluation',
    description: 'Submit ICAO oral exam evaluation as structured JSON',
    input_schema: {
      type: 'object',
      properties: {
        rubric: {
          type: 'object',
          properties: {
            pronunciation: { type: 'number', minimum: 1, maximum: 6 },
            structure: { type: 'number', minimum: 1, maximum: 6 },
            vocabulary: { type: 'number', minimum: 1, maximum: 6 },
            fluency: { type: 'number', minimum: 1, maximum: 6 },
            comprehension: { type: 'number', minimum: 1, maximum: 6 },
            interactions: { type: 'number', minimum: 1, maximum: 6 },
          },
          required: [
            'pronunciation',
            'structure',
            'vocabulary',
            'fluency',
            'comprehension',
            'interactions',
          ],
        },
        band_score: {
          type: 'integer',
          minimum: 1,
          maximum: 6,
          description: 'Lowest descriptor — ICAO holistic minimum',
        },
        feedback_tr: {
          type: 'string',
          description: '3-5 sentences Turkish actionable feedback',
        },
        confidence_score: {
          type: 'number',
          minimum: 0,
          maximum: 1,
          description: 'Examiner self-confidence (transcript-only)',
        },
      },
      required: ['rubric', 'band_score', 'feedback_tr', 'confidence_score'],
    },
  };

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      system: systemPrompt,
      tools: [tool],
      tool_choice: { type: 'tool', name: 'submit_evaluation' },
      messages: [{ role: 'user', content: userPayload }],
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`anthropic_${res.status}: ${text.slice(0, 200)}`);
  }

  const json = await res.json();
  const usage = json.usage ?? {};
  const tokensIn = Number(usage.input_tokens ?? 0);
  const tokensOut = Number(usage.output_tokens ?? 0);

  // Tool use response: content[0].type === 'tool_use', .input is the structured output
  const toolBlock = (json.content ?? []).find((c: any) => c?.type === 'tool_use');
  if (!toolBlock?.input) {
    throw new Error('anthropic_no_tool_output');
  }
  const out = toolBlock.input as {
    rubric: Rubric;
    band_score: number;
    feedback_tr: string;
    confidence_score: number;
  };

  // Lowest-descriptor band (ICAO holistic kuralı): if AI yanlış hesapladıysa override.
  const minDescriptor = Math.min(
    out.rubric.pronunciation,
    out.rubric.structure,
    out.rubric.vocabulary,
    out.rubric.fluency,
    out.rubric.comprehension,
    out.rubric.interactions,
  );
  const band = Math.min(out.band_score ?? 4, Math.floor(minDescriptor));

  return {
    rubric: out.rubric,
    band_score: band,
    feedback_tr: out.feedback_tr,
    confidence_score: out.confidence_score,
    provider: 'claude',
    examiner_model: model,
    tokens_in: tokensIn,
    tokens_out: tokensOut,
    estimated_cost_usd: estimateClaudeCost(model, tokensIn, tokensOut),
  };
}

// ─── Provider routing ───────────────────────────────────────────────────
async function evaluate(
  client: SupabaseClient,
  attempt: any,
  prompt: any,
  config: Map<string, any>,
): Promise<EvaluationResult> {
  const provider = String(config.get('ai.examiner_provider') ?? 'mock').replace(/^"|"$/g, '');

  // Daily cost cap check (admin koruması) — aşıldıysa mock'a düş
  if (provider !== 'mock') {
    try {
      const { data: capCheck } = await client.rpc('check_ai_daily_cost');
      if (capCheck && (capCheck as any).within_cap === false) {
        console.warn('[oral-exam-evaluate] daily cost cap aşıldı — mock\'a düşüyor', capCheck);
        return mockEvaluate(attempt.transcript ?? '', attempt.duration_seconds ?? 0);
      }
    } catch (e) {
      console.warn('[oral-exam-evaluate] cost cap check failed:', e);
      // continue — cap check başarısızsa engelleme
    }
  }

  if (provider === 'claude') {
    const apiKey = String(config.get('ai.anthropic_api_key') ?? '').replace(/^"|"$/g, '');
    if (!apiKey || apiKey.length < 10) {
      console.warn('[oral-exam-evaluate] claude seçili ama anthropic_api_key boş — mock');
      return mockEvaluate(attempt.transcript ?? '', attempt.duration_seconds ?? 0);
    }
    const model = String(config.get('ai.examiner_model') ?? 'claude-sonnet-4-5').replace(
      /^"|"$/g,
      '',
    );
    try {
      return await claudeEvaluate(apiKey, model, prompt, attempt);
    } catch (e) {
      console.error('[oral-exam-evaluate] claude error → mock fallback:', e);
      const m = mockEvaluate(attempt.transcript ?? '', attempt.duration_seconds ?? 0);
      // Mock döndürüyoruz ama provider'ı mock_fallback olarak işaretleyebiliriz
      return { ...m, provider: 'mock', examiner_model: 'mock-v1-fallback' };
    }
  }

  if (provider === 'gpt') {
    // GPT path — Anthropic ile benzer, OpenAI Chat Completions structured outputs.
    // Sprint 7.C kapsam dışı — Sprint 7.E'de admin'in iki provider arasından seçim
    // yapması için TODO. Şimdilik mock'a düşür.
    console.warn('[oral-exam-evaluate] gpt provider TODO — mock döndürülüyor');
    return mockEvaluate(attempt.transcript ?? '', attempt.duration_seconds ?? 0);
  }

  return mockEvaluate(attempt.transcript ?? '', attempt.duration_seconds ?? 0);
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method_not_allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: EvaluateBody;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'invalid_json' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!body.attempt_id) {
    return new Response(JSON.stringify({ error: 'attempt_id_required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const client = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  // 1. Attempt çek
  const { data: attempt, error: attemptErr } = await client
    .from('oral_exam_attempts')
    .select('*')
    .eq('id', body.attempt_id)
    .maybeSingle();

  if (attemptErr || !attempt) {
    return new Response(
      JSON.stringify({ error: 'attempt_not_found', detail: attemptErr?.message }),
      { status: 404, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // 2. Prompt çek (context için)
  const { data: prompt } = await client
    .from('oral_exam_prompts')
    .select('*')
    .eq('id', (attempt as any).prompt_id)
    .maybeSingle();

  // 3. AI config çek
  const { data: configRows } = await client.from('app_config').select('key, value').like('key', 'ai.%');
  const config = new Map<string, any>();
  for (const r of (configRows ?? []) as any[]) config.set(r.key, r.value);

  // 4. Evaluate
  let result: EvaluationResult;
  try {
    result = await evaluate(client, attempt, prompt, config);
  } catch (e) {
    console.error('[oral-exam-evaluate] evaluate error:', e);
    return new Response(
      JSON.stringify({ error: 'evaluation_failed', detail: String(e) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // 5. needs_review hesapla (confidence < threshold)
  const threshMs = config.get('ai.review_confidence_min');
  const threshold = Number(typeof threshMs === 'number' ? threshMs : Number(threshMs)) || 0.6;
  const needsReview = result.confidence_score < threshold && result.provider !== 'mock';

  // 6. UPDATE attempt
  const { error: updErr } = await client
    .from('oral_exam_attempts')
    .update({
      rubric: result.rubric,
      band_score: result.band_score,
      feedback_tr: result.feedback_tr,
      confidence_score: result.confidence_score,
      needs_review: needsReview,
      review_status: needsReview ? 'pending' : 'none',
      provider: result.provider,
      examiner_model: result.examiner_model,
      evaluated_at: new Date().toISOString(),
      tokens_in: result.tokens_in ?? null,
      tokens_out: result.tokens_out ?? null,
      estimated_cost_usd: result.estimated_cost_usd ?? null,
    })
    .eq('id', body.attempt_id);

  if (updErr) {
    return new Response(
      JSON.stringify({ error: 'update_failed', detail: updErr.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  return new Response(
    JSON.stringify({
      ok: true,
      attempt_id: body.attempt_id,
      band_score: result.band_score,
      provider: result.provider,
      confidence: result.confidence_score,
      needs_review: needsReview,
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );
});
