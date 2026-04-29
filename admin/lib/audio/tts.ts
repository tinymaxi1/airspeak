'use server';

import { createServiceClient } from '@/lib/supabase/server';
import { requireAdminRole } from '@/lib/auth/guard';

const ELEVEN_VOICES = {
  atc_male: '21m00Tcm4TlvDq8ikWAM', // Rachel — placeholder, gerçekte male ID
  atc_female: 'EXAVITQu4vr4xnSDxMaL', // Bella
  cabin_announcer: 'pNInz6obpgDQGcFmaJgB', // Adam
  instructor: 'VR6AewLTigWG4xSOukaG', // Arnold
} as const;

export type VoicePreset = keyof typeof ELEVEN_VOICES;

export type TtsResult =
  | { ok: true; url: string; bytes: number }
  | { ok: false; error: string };

/**
 * ElevenLabs ile TTS — text → mp3 üret + Supabase Storage'a yükle.
 */
export async function generateAndUploadTts(
  text: string,
  voice: VoicePreset = 'atc_male',
  bucket: 'lesson-audio' | 'vocab-audio' = 'lesson-audio',
  pathPrefix: string = 'misc',
): Promise<TtsResult> {
  await requireAdminRole('editor');

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return { ok: false, error: 'ELEVENLABS_API_KEY env değişkeni yok' };
  }

  const voiceId = ELEVEN_VOICES[voice];
  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    });
    if (!res.ok) {
      const txt = await res.text();
      return { ok: false, error: `ElevenLabs ${res.status}: ${txt}` };
    }
    const arrayBuffer = await res.arrayBuffer();
    const bytes = arrayBuffer.byteLength;

    const supabase = createServiceClient();
    const fileName = `${pathPrefix}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.mp3`;
    const { error: upErr } = await supabase.storage
      .from(bucket)
      .upload(fileName, arrayBuffer, {
        contentType: 'audio/mpeg',
        upsert: false,
      });
    if (upErr) return { ok: false, error: upErr.message };

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(fileName);

    return { ok: true, url: publicUrl, bytes };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'TTS hatası' };
  }
}

/**
 * Mevcut bir text+voice çifti zaten Storage'da var mı kontrol et — bulursa URL'i döndür.
 * (Bu fonksiyonu Faz 5+ ileride hash-based cache için optimize edebiliriz.)
 */
export async function findCachedTts(
  _text: string,
  _voice: VoicePreset,
  _bucket: 'lesson-audio' | 'vocab-audio',
): Promise<string | null> {
  // Gelecek: SHA-256 hash ile cache lookup
  return null;
}
