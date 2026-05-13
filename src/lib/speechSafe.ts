/**
 * speechSafe — expo-speech çağrılarını crash-safe sarmalayan helper.
 *
 * SORUN: Build 28'de expo-speech config plugin'i app.json'da yoktu →
 * native modül kısmen link edildi → `Speech.speak` veya `Speech.stop`
 * runtime'da undefined olabildi → "undefined is not a function" → CRASH.
 *
 * Build 29 itibarıyla plugin eklendi ama gelecekte benzer bir native
 * modül kazası yine olabilir. Bu wrapper iki katmanlı koruma sağlar:
 *   1. typeof check — Speech.speak undefined ise sessiz başarısız (Sentry'ye log)
 *   2. try/catch — runtime exception app'i patlatmaz
 *
 * Sonuç: TTS çalışmasa bile kullanıcı senaryoyu metin olarak okur,
 * uygulama freeze olmaz.
 */
import * as Speech from 'expo-speech';
import { captureException } from '@/lib/sentry';

/**
 * Güvenli TTS speak. Native modül yoksa/patlasa Sentry'ye log atar, false döner.
 * @returns true = konuşma başlatıldı, false = sessiz başarısız (TTS yok)
 */
export function safeSpeechSpeak(text: string, options?: Speech.SpeechOptions): boolean {
  try {
    if (typeof Speech?.speak !== 'function') {
      try {
        captureException(new Error('Speech.speak undefined'), {
          tags: { source: 'safeSpeechSpeak', native_module_missing: 'true' },
        } as any);
      } catch {
        /* sentry kendisi patladıysa sus */
      }
      return false;
    }
    Speech.speak(text, options);
    return true;
  } catch (error) {
    try {
      captureException(error as Error, { tags: { source: 'safeSpeechSpeak' } } as any);
    } catch {
      /* ignore */
    }
    return false;
  }
}

/** Güvenli TTS stop. Hata fırlatmaz. */
export function safeSpeechStop(): void {
  try {
    if (typeof Speech?.stop !== 'function') return;
    Speech.stop();
  } catch (error) {
    try {
      captureException(error as Error, { tags: { source: 'safeSpeechStop' } } as any);
    } catch {
      /* ignore */
    }
  }
}

/** Native modül var ve fonksiyonlar tanımlı mı? UI'da TTS butonunu disabled yapmak için. */
export function safeSpeechIsAvailable(): boolean {
  return typeof Speech?.speak === 'function' && typeof Speech?.stop === 'function';
}
