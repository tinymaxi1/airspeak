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
): Promise<{ transcript: string; provider: string; cost_usd?: number }> {
  const apiKey = String(config.get('ai.openai_api_key') ?? '').replace(/^"|"$/g, '');
  if (!apiKey || apiKey.length < 10) {
    console.warn('[whisper-transcribe] openai_api_key boş — native\'i bekliyoruz');
    return { transcript: attempt.transcript ?? '', provider: 'fallback_native' };
  }

  const model = String(config.get('ai.whisper_model') ?? 'whisper-1').replace(/^"|"$/g, '');
  const audioPath = attempt.audio_path;
  if (!audioPath) {
    return { transcript: attempt.transcript ?? '', provider: 'fallback_no_audio' };
  }

  // 1. Storage'dan signed URL al (private bucket)
  const { data: signed, error: signedErr } = await (client as any).storage
    .from('oral-recordings')
    .createSignedUrl(audioPath, 60);
  if (signedErr || !signed?.signedUrl) {
    throw new Error(`signed_url_failed: ${signedErr?.message ?? 'no_url'}`);
  }

  // 2. Audio dosyayı download et
  const audioRes = await fetch(signed.signedUrl);
  if (!audioRes.ok) {
    throw new Error(`audio_download_${audioRes.status}`);
  }
  const audioBlob = await audioRes.blob();

  // 3. Whisper multipart form
  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.m4a');
  formData.append('model', model);
  formData.append('language', 'en');
  formData.append('response_format', 'json');

  const transcribeRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  });

  if (!transcribeRes.ok) {
    const text = await transcribeRes.text().catch(() => '');
    throw new Error(`whisper_${transcribeRes.status}: ${text.slice(0, 200)}`);
  }

  const json = await transcribeRes.json();
  const transcript = String(json.text ?? '').trim();

  // Whisper pricing: $0.006 per minute (whisper-1, 2026-01)
  const durationSec = Number(attempt.duration_seconds ?? 0);
  const costUsd = (durationSec / 60) * 0.006;

  return { transcript, provider: 'whisper', cost_usd: costUsd };
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

  let result: { transcript: string; provider: string; cost_usd?: number };

  if (provider === 'whisper') {
    try {
      result = await transcribeWhisper(client, attempt, config);
    } catch (e) {
      console.error('[whisper-transcribe] error → native fallback:', e);
      result = {
        transcript: (attempt as any).transcript ?? '',
        provider: 'fallback_native_after_error',
      };
    }
  } else if (provider === 'mock') {
    result = { transcript: '', provider: 'mock' };
  } else {
    // native: client zaten transcript göndermiş olmalı, no-op
    result = {
      transcript: (attempt as any).transcript ?? '',
      provider: 'native',
    };
  }

  // Whisper transcript geldi ise DB'ye yaz (override) + cost ekle
  if (result.provider === 'whisper' && result.transcript) {
    const updates: Record<string, unknown> = { transcript: result.transcript };
    if (typeof result.cost_usd === 'number') {
      // Whisper maliyetini estimated_cost_usd'a EKLE (mevcut Claude maliyeti varsa korunur)
      const existing = Number((attempt as any).estimated_cost_usd ?? 0);
      updates.estimated_cost_usd = existing + result.cost_usd;
    }
    await client.from('oral_exam_attempts').update(updates).eq('id', body.attempt_id);
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
