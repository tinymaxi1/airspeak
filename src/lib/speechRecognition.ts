/**
 * Speech Recognition shim — Expo Go fallback.
 *
 * `expo-speech-recognition` üçüncü taraf native modül; Expo Go'da yok.
 * Dev build'de gerçek modülü re-export eder, Expo Go'da no-op stub döndürür.
 *
 * Kullanım: tüm `from 'expo-speech-recognition'` → `from '@/lib/speechRecognition'`
 *
 * Stub modunda:
 * - permission grant taklidi (denied döner) → caller fallback heuristic'e geçer
 * - start/stop no-op → 'end' event'i tetiklenmez, kullanıcı manuel "Bitti" akışına düşer
 * - useSpeechRecognitionEvent no-op (event hiç tetiklenmez)
 */

interface SpeechRecognitionEvent {
  results?: { transcript: string; confidence?: number }[];
  isFinal?: boolean;
  error?: string;
  message?: string;
}

interface ModuleAPI {
  requestPermissionsAsync: () => Promise<{ granted: boolean }>;
  start: (options?: Record<string, unknown>) => void;
  stop: () => Promise<void> | void;
  abort?: () => void;
}

type EventName = 'result' | 'end' | 'error' | 'start' | 'audiostart' | 'audioend' | 'speechstart' | 'speechend' | 'nomatch';

type Listener = (event: SpeechRecognitionEvent) => void;

let ModuleImpl: ModuleAPI;
let useSpeechRecognitionEventImpl: (event: EventName, listener: Listener) => void;
let isAvailable = false;

try {
  // Native build (dev client / production)
  const native = require('expo-speech-recognition') as {
    ExpoSpeechRecognitionModule: ModuleAPI;
    useSpeechRecognitionEvent: (event: EventName, listener: Listener) => void;
  };
  ModuleImpl = native.ExpoSpeechRecognitionModule;
  useSpeechRecognitionEventImpl = native.useSpeechRecognitionEvent;
  isAvailable = true;
} catch {
  // Expo Go fallback — stub
  console.warn('[speechRecognition] Native module unavailable (Expo Go?) — STT stub mode');
  ModuleImpl = {
    requestPermissionsAsync: async () => ({ granted: false }),
    start: () => undefined,
    stop: () => undefined,
    abort: () => undefined,
  };
  useSpeechRecognitionEventImpl = () => undefined;
}

export const ExpoSpeechRecognitionModule: ModuleAPI = ModuleImpl;
export const useSpeechRecognitionEvent = useSpeechRecognitionEventImpl;
export const isSpeechRecognitionAvailable = isAvailable;
