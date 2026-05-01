/**
 * AirSpeak — Whisper Transcribe Edge Function
 *
 * Sprint 7.A.1: placeholder (graceful fallback).
 * Sprint 7.B/C: gerçek OpenAI Whisper API entegrasyonu.
 *
 * Çağrım:
 *   POST /functions/v1/whisper-transcribe
 *   Body: { attempt_id: string }  (audio_path attempt'tan okunur)
 *
 * Akış:
 *   1. attempt çek (audio_path)
 *   2. provider check (config: ai.stt_provider)
 *      - 'native' → no-op (mobile native STT zaten yapmış olmalı, transcript var)
 *      - 'whisper' → OpenAI Whisper API + storage signed URL (Sprint 7.B/C)
 *      - 'mock' → empty string (test)
 *   3. attempt.transcript update
 */
import { createClient, type SupabaseClient } from 'jsr:@supabase/supabase-js@2';

interface TranscribeBody {
  attempt_id: string;
}

async function transcribeWhisper(
  client: SupabaseClient,
  attempt: any,
  config: Map<string, any>,
): Promise<{ transcript: string; provider: string }> {
  const apiKey = String(config.get('ai.openai_api_key') ?? '').replace(/^"|"$/g, '');
  if (!apiKey || apiKey.length < 10) {
    console.warn('[whisper-transcribe] openai_api_key boş — native\'i bekliyoruz');
    return { transcript: attempt.transcript ?? '', provider: 'fallback_native' };
  }
  // TODO Sprint 7.B/C: storage signed URL + multipart fetch + Whisper API
  console.warn('[whisper-transcribe] whisper API call TODO — Sprint 7.B/C');
  return { transcript: attempt.transcript ?? '', provider: 'whisper_todo' };
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method_not_allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: TranscribeBody;
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

  const { data: attempt, error: attemptErr } = await client
    .from('oral_exam_attempts')
    .select('id, audio_path, transcript')
    .eq('id', body.attempt_id)
    .maybeSingle();

  if (attemptErr || !attempt) {
    return new Response(
      JSON.stringify({ error: 'attempt_not_found', detail: attemptErr?.message }),
      { status: 404, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const { data: configRows } = await client.from('app_config').select('key, value').like('key', 'ai.%');
  const config = new Map<string, any>();
  for (const r of (configRows ?? []) as any[]) config.set(r.key, r.value);

  const provider = String(config.get('ai.stt_provider') ?? 'native').replace(/^"|"$/g, '');

  let result: { transcript: string; provider: string };

  if (provider === 'whisper') {
    result = await transcribeWhisper(client, attempt, config);
  } else if (provider === 'mock') {
    result = { transcript: '', provider: 'mock' };
  } else {
    // native: client zaten transcript göndermiş olmalı, no-op
    result = {
      transcript: (attempt as any).transcript ?? '',
      provider: 'native',
    };
  }

  // Native ise transcript zaten DB'de — sadece provider'ı işaretlemek için
  // (transcript override etmeyelim, mobile zaten submit_oral_attempt ile yazdı)
  if (provider !== 'native' && result.transcript) {
    await client
      .from('oral_exam_attempts')
      .update({ transcript: result.transcript })
      .eq('id', body.attempt_id);
  }

  return new Response(
    JSON.stringify({
      ok: true,
      attempt_id: body.attempt_id,
      provider: result.provider,
      transcript_length: result.transcript.length,
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );
});
