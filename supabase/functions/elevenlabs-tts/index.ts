/**
 * Supabase Edge Function — ElevenLabs TTS proxy with Supabase Storage cache.
 *
 * Akış:
 *   1. Input: { text, voice_id, cache_key, lang? }
 *   2. cache_key Storage'da var mı kontrol → varsa public URL döndür (karakter harcanmaz)
 *   3. Yoksa ElevenLabs API → mp3 üret → Storage'a yükle → public URL döndür
 *
 * Auth: caller authenticated olmalı (mobile + admin). API key sunucu env.
 *
 * Karakter ekonomisi:
 *   - Cache hit = ücretsiz
 *   - Cache miss = text.length karakter ElevenLabs'tan düşer
 *   - Aynı text+voice = aynı cache_key = aynı dosya (idempotent)
 */
// @ts-nocheck — Deno runtime, IDE TS hata gösterir
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const BUCKET = 'tts-cache';

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await req.json();
    const { text, voice_id, cache_key } = body;

    if (!text || !voice_id || !cache_key) {
      return jsonResponse({ error: 'text, voice_id, cache_key gerekli' }, 400);
    }
    if (text.length > 5000) {
      return jsonResponse({ error: 'text 5000 karakter sınırını aşıyor' }, 400);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const filePath = `${cache_key}.mp3`;

    // 1) Cache kontrolü
    const { data: existing } = await supabase.storage.from(BUCKET).list('', {
      search: filePath,
      limit: 1,
    });
    if (existing && existing.some((f: any) => f.name === filePath)) {
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
      return jsonResponse({
        url: urlData.publicUrl,
        cached: true,
        characters_used: 0,
      });
    }

    // 2) ElevenLabs API çağrısı
    const elResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true,
        },
      }),
    });

    if (!elResponse.ok) {
      const errBody = await elResponse.text();
      return jsonResponse({ error: 'ElevenLabs fail', detail: errBody.slice(0, 300) }, 502);
    }

    const audioBytes = new Uint8Array(await elResponse.arrayBuffer());

    // 3) Storage'a yükle
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(filePath, audioBytes, {
      contentType: 'audio/mpeg',
      cacheControl: '31536000', // 1 yıl CDN cache
      upsert: false,
    });
    if (uploadError) {
      return jsonResponse({ error: 'Upload fail', detail: uploadError.message }, 500);
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
    return jsonResponse({
      url: urlData.publicUrl,
      cached: false,
      characters_used: text.length,
    });
  } catch (err) {
    return jsonResponse({ error: String(err) }, 500);
  }
});

function jsonResponse(obj: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
