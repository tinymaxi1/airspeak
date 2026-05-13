/**
 * AirSpeak Text-to-Speech soyutlama katmanı.
 *
 * Strateji:
 * - Vendor-agnostic interface — sağlayıcı değişikliği kolay
 * - 20 dil destekli (her dilin native voice listesi)
 * - Sprint 10'da gerçek implementasyon: ElevenLabs (premium) veya
 *   Cartesia (alternatif), Azure Speech (ucuz batch), Google Cloud TTS
 * - MVP'de stub — gerçek ses üretimi yok, infrastructure hazır
 *
 * Kullanım örneği (Sprint 10):
 *   const url = await tts.synthesize({
 *     text: 'cleared for takeoff',
 *     locale: 'en',
 *     voice: 'professional-male',
 *     speed: 0.9, // ICAO 4 net telaffuz için yavaş
 *   });
 */
import type { Locale } from './i18nTypes';

export type TtsProvider = 'elevenlabs' | 'cartesia' | 'azure' | 'google' | 'openai' | 'stub';

export type TtsVoice =
  | 'professional-male'
  | 'professional-female'
  | 'friendly-male'
  | 'friendly-female'
  | 'atc-controller' // ATC karakteristik ton
  | 'cabin-crew' // sıcak servis tonu
  | 'pilot-captain'; // kaptan tonu

export interface TtsRequest {
  text: string;
  locale: Locale;
  voice?: TtsVoice;
  /** 0.5-2.0, 1.0 normal */
  speed?: number;
  /** 0.5-2.0, 1.0 normal */
  pitch?: number;
  /** Önbellek anahtarı için (aynı text+locale+voice = aynı URL) */
  cacheKey?: string;
}

export interface TtsResponse {
  /** Üretilen ses dosyasının URL'i (CDN veya yerel cache) */
  audioUrl: string;
  /** Dakika cinsinden süre */
  durationSeconds: number;
  /** Karakter sayısı (faturalama için) */
  charactersUsed: number;
  /** Maliyet (USD) */
  costUsd: number;
  /** Cache hit miydi */
  fromCache: boolean;
}

export interface TtsService {
  provider: TtsProvider;
  synthesize(req: TtsRequest): Promise<TtsResponse>;
  /** Bir dilin desteklenen sesleri */
  getVoicesForLocale(locale: Locale): TtsVoice[];
  /** Toplam aylık karakter kullanımı (cost takibi) */
  getMonthlyUsage(): Promise<{ characters: number; costUsd: number }>;
}

/**
 * ElevenLabs implementation — Supabase Edge Function üzerinden çağrı.
 * Edge function: supabase/functions/elevenlabs-tts/index.ts
 * Cache: Supabase Storage `tts-cache` bucket (1 yıl public TTL).
 *
 * Karakter ekonomisi: aynı cacheKey ikinci çağrıda Storage'tan döner,
 * ElevenLabs'a istek atılmaz (0 karakter düşer).
 */
import { supabase } from './supabase';
import { ELEVENLABS_VOICES, type ElevenLabsVoiceKey } from './elevenlabs.config';

class ElevenLabsTtsService implements TtsService {
  provider: TtsProvider = 'elevenlabs';

  async synthesize(req: TtsRequest): Promise<TtsResponse> {
    // voice → ElevenLabs voice ID map
    const voiceKey: ElevenLabsVoiceKey =
      req.voice === 'atc-controller' ? 'atc' :
      req.voice === 'cabin-crew' ? 'cabin' :
      req.voice === 'pilot-captain' ? 'pilot' :
      'wordOfDay';
    const voiceId = ELEVENLABS_VOICES[voiceKey];

    const cacheKey = req.cacheKey ?? `${voiceKey}_${req.locale}_${hashText(req.text)}`;

    try {
      const { data, error } = await (supabase as any).functions.invoke('elevenlabs-tts', {
        body: { text: req.text, voice_id: voiceId, cache_key: cacheKey },
      });
      if (error) throw error;
      const characters = data?.characters_used ?? 0;
      return {
        audioUrl: data?.url ?? '',
        durationSeconds: Math.max(1, Math.ceil(req.text.length / 15)), // ~15 char/sec
        charactersUsed: characters,
        costUsd: characters * (0.30 / 1000),
        fromCache: !!data?.cached,
      };
    } catch {
      // Fail-safe — UI safeSpeechSpeak fallback'e düşer
      return { audioUrl: '', durationSeconds: 0, charactersUsed: 0, costUsd: 0, fromCache: false };
    }
  }

  getVoicesForLocale(locale: Locale): TtsVoice[] {
    // Tüm 20 dilde temel sesler — gerçek voice ID'leri Sprint 10'da
    const all: TtsVoice[] = [
      'professional-male',
      'professional-female',
      'friendly-male',
      'friendly-female',
    ];
    if (['en', 'tr', 'de', 'fr', 'es'].includes(locale)) {
      // Bu diller için özel rol sesleri ElevenLabs'da mevcut
      return [...all, 'atc-controller', 'cabin-crew', 'pilot-captain'];
    }
    return all;
  }

  async getMonthlyUsage(): Promise<{ characters: number; costUsd: number }> {
    return { characters: 0, costUsd: 0 };
  }
}

/** Basit text hash — cacheKey için (büyük olmasın). */
function hashText(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}

export const tts: TtsService = new ElevenLabsTtsService();

/**
 * TTS maliyet tahmini — bütçe planlama için.
 * ElevenLabs Turbo v2.5 fiyatı: $0.30 / 1K karakter.
 *
 * Örnek:
 * - 1300 vocab × 20 dil × ortalama 30 karakter = 780K karakter
 * - 300 lesson × 5 cümle × 50 char × 20 dil = 1.5M karakter
 * - Toplam: ~2.3M karakter × $0.30/K = $690 (one-time)
 */
export function estimateTtsCost(characters: number, provider: TtsProvider = 'elevenlabs'): number {
  const rates: Record<TtsProvider, number> = {
    elevenlabs: 0.30 / 1000,
    cartesia: 0.25 / 1000,
    azure: 0.016 / 1000, // Azure Speech çok ucuz batch için
    google: 0.016 / 1000,
    openai: 0.015 / 1000,
    stub: 0,
  };
  return characters * (rates[provider] ?? 0);
}
