/**
 * Oral exam STT wrapper — native (expo-speech-recognition) üstüne UI-friendly hook.
 *
 * Mevcut shim: src/lib/speechRecognition.ts (Expo Go fallback stub).
 * Bu dosya state machine + interim/final transcript birleştirici.
 *
 * Kullanım (icao4-live.tsx):
 *   const stt = useOralSTT();
 *   stt.start({ lang: 'en-US' }) → recording başlar
 *   stt.interim → ham transkript (cursor)
 *   stt.final → birleşik final transkript (submit için)
 *   stt.stop() → recording durur, final fix edilir
 *
 * Audio recording ile paralel çalışır:
 *   audioRecording.start()  → ses dosyası kaydı (Whisper fallback)
 *   stt.start()             → native STT
 *   audioRecording.stop()   → uri
 *   stt.stop()              → final transcript
 *   submitOralAttempt(attempt_id, stt.final, durationSeconds)
 */
import { useEffect, useRef, useState } from 'react';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
  isSpeechRecognitionAvailable,
} from '@/lib/speechRecognition';

interface STTOptions {
  lang?: string;       // 'en-US' default ICAO için
  interimResults?: boolean;
  continuous?: boolean;
}

export interface OralSTT {
  available: boolean;
  recording: boolean;
  interim: string;       // Henüz final olmamış transkript (live cursor)
  final: string;         // Birleştirilmiş tüm final segmentler
  error: string | null;
  start: (options?: STTOptions) => Promise<{ ok: boolean; error?: string }>;
  stop: () => Promise<void>;
  reset: () => void;
}

export function useOralSTT(): OralSTT {
  const [recording, setRecording] = useState(false);
  const [interim, setInterim] = useState('');
  const [final, setFinal] = useState('');
  const [error, setError] = useState<string | null>(null);
  const finalSegmentsRef = useRef<string[]>([]);

  // result event: { results: [{ transcript, confidence }], isFinal }
  useSpeechRecognitionEvent('result', (e) => {
    const text = e.results?.[0]?.transcript ?? '';
    if (e.isFinal) {
      finalSegmentsRef.current.push(text);
      setFinal(finalSegmentsRef.current.join(' ').trim());
      setInterim('');
    } else {
      setInterim(text);
    }
  });

  useSpeechRecognitionEvent('end', () => {
    setRecording(false);
    setInterim('');
  });

  useSpeechRecognitionEvent('error', (e) => {
    setError(e.error ?? e.message ?? 'unknown_error');
    setRecording(false);
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        ExpoSpeechRecognitionModule.abort?.();
      } catch {
        /* ignore */
      }
    };
  }, []);

  async function start(options?: STTOptions): Promise<{ ok: boolean; error?: string }> {
    if (!isSpeechRecognitionAvailable) {
      return { ok: false, error: 'native_module_unavailable' };
    }
    const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!perm.granted) {
      return { ok: false, error: 'permission_denied' };
    }
    finalSegmentsRef.current = [];
    setFinal('');
    setInterim('');
    setError(null);
    try {
      ExpoSpeechRecognitionModule.start({
        lang: options?.lang ?? 'en-US',
        interimResults: options?.interimResults ?? true,
        continuous: options?.continuous ?? true,
        // iOS specific (gerekirse)
        requiresOnDeviceRecognition: false,
        addsPunctuation: true,
      });
      setRecording(true);
      return { ok: true };
    } catch (e) {
      setError(String(e));
      return { ok: false, error: String(e) };
    }
  }

  async function stop(): Promise<void> {
    try {
      await ExpoSpeechRecognitionModule.stop();
    } catch {
      /* ignore */
    }
    setRecording(false);
    setInterim('');
  }

  function reset(): void {
    finalSegmentsRef.current = [];
    setFinal('');
    setInterim('');
    setError(null);
  }

  return {
    available: isSpeechRecognitionAvailable,
    recording,
    interim,
    final,
    error,
    start,
    stop,
    reset,
  };
}

/**
 * Birleşik transcript: final + interim (UI gösterimi için).
 */
export function joinTranscript(final: string, interim: string): string {
  if (!interim) return final;
  if (!final) return interim;
  return `${final} ${interim}`.trim();
}
