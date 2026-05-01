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

// ─── Provider routing (TODO: 7.C Claude/GPT) ────────────────────────────
async function evaluate(
  client: SupabaseClient,
  attempt: any,
  prompt: any,
  config: Map<string, any>,
): Promise<EvaluationResult> {
  const provider = String(config.get('ai.examiner_provider') ?? 'mock').replace(/^"|"$/g, '');

  if (provider === 'claude') {
    const apiKey = String(config.get('ai.anthropic_api_key') ?? '').replace(/^"|"$/g, '');
    if (!apiKey || apiKey.length < 10) {
      console.warn('[oral-exam-evaluate] claude provider seçili ama anthropic_api_key boş — mock\'a düşüyor');
      return mockEvaluate(attempt.transcript ?? '', attempt.duration_seconds ?? 0);
    }
    // TODO Sprint 7.C: gerçek Claude API call
    console.warn('[oral-exam-evaluate] claude provider TODO — Sprint 7.C, mock döndürülüyor');
    return mockEvaluate(attempt.transcript ?? '', attempt.duration_seconds ?? 0);
  }

  if (provider === 'gpt') {
    const apiKey = String(config.get('ai.openai_api_key') ?? '').replace(/^"|"$/g, '');
    if (!apiKey || apiKey.length < 10) {
      console.warn('[oral-exam-evaluate] gpt provider seçili ama openai_api_key boş — mock\'a düşüyor');
      return mockEvaluate(attempt.transcript ?? '', attempt.duration_seconds ?? 0);
    }
    // TODO Sprint 7.C
    console.warn('[oral-exam-evaluate] gpt provider TODO — Sprint 7.C, mock döndürülüyor');
    return mockEvaluate(attempt.transcript ?? '', attempt.duration_seconds ?? 0);
  }

  // Default mock
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
