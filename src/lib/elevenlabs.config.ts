/**
 * ElevenLabs voice ID konfigürasyonu.
 * Voice ID'ler ElevenLabs default voice library'sinden:
 *   https://elevenlabs.io/voice-library
 *
 * Pro plan sonrası custom voice clone ID'leri buraya gelir.
 */

export const ELEVENLABS_VOICES = {
  /** Pilot — derin erkek ses (Adam) */
  pilot: 'pNInz6obpgDQGcFmaJgB',
  /** ATC kontrolör — anons tarzı (Antoni) */
  atc: 'ErXwobaYiN019PkySvjV',
  /** Kabin ekibi — sıcak kadın ses (Bella) */
  cabin: 'EXAVITQu4vr4xnSDxMaL',
  /** Günün kelimesi narrator (Rachel) */
  wordOfDay: '21m00Tcm4TlvDq8ikWAM',
} as const;

export type ElevenLabsVoiceKey = keyof typeof ELEVENLABS_VOICES;

export const ELEVENLABS_MODEL_ID = 'eleven_multilingual_v2';

export const ELEVENLABS_DEFAULT_VOICE_SETTINGS = {
  stability: 0.5,
  similarity_boost: 0.75,
  style: 0.0,
  use_speaker_boost: true,
};

export const ELEVENLABS_API_BASE = 'https://api.elevenlabs.io/v1';
