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
 * Stub implementation — gerçek TTS yapmıyor, infrastructure hazır.
 * Sprint 10'da gerçek sağlayıcıyla değiştirilecek.
 */
class StubTtsService implements TtsService {
  provider: TtsProvider = 'stub';

  async synthesize(_req: TtsRequest): Promise<TtsResponse> {
    // Production'da: ElevenLabs API call + S3 upload + URL döndür
    return {
      audioUrl: '',
      durationSeconds: 0,
      charactersUsed: 0,
      costUsd: 0,
      fromCache: false,
    };
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

export const tts: TtsService = new StubTtsService();

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
