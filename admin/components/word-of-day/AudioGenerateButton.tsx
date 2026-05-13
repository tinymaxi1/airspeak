'use client';

/**
 * 🎙 Ses üret — Word of Day kayıtları için ElevenLabs TTS Edge Function call.
 *
 * Akış:
 *   1. text + voice + cache_key gönder → Edge Function
 *   2. cache hit → URL döner (karakter harcanmaz)
 *   3. cache miss → ElevenLabs → mp3 → Storage → URL
 *   4. URL state'e yazılır (form save'inde DB'ye yazılır)
 *
 * ⚠️ ElevenLabs Free Tier'da "abuse detection" tetiklenirse Edge Function fail eder.
 *    Pro plan'a yükseltme sonrası çalışır.
 */
import { useState } from 'react';
import { Loader2, Mic, AlertTriangle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const VOICE_RACHEL = '21m00Tcm4TlvDq8ikWAM'; // Word of Day narrator

interface Props {
  text: string;
  cacheKey: string;
  currentUrl: string | null;
  onUrlChange: (url: string) => void;
  label: string;
}

export function AudioGenerateButton({ text, cacheKey, currentUrl, onUrlChange, label }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    if (!text.trim()) {
      setError('Önce metin gir');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error } = await (supabase as any).functions.invoke('elevenlabs-tts', {
        body: { text: text.trim(), voice_id: VOICE_RACHEL, cache_key: cacheKey },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.detail ?? data.error);
      if (data?.url) {
        onUrlChange(data.url);
      }
    } catch (e: any) {
      setError(e.message ?? 'Üretim başarısız');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={busy || !text.trim()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-airspeak-navy text-white hover:bg-airspeak-navy/90 disabled:opacity-50"
        >
          {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Mic className="w-3 h-3" />}
          🎙 {label}
        </button>
        {currentUrl && (
          <audio controls className="h-8 max-w-[200px]" src={currentUrl}>
            <track kind="captions" />
          </audio>
        )}
      </div>
      {error && (
        <div className="text-xs text-red-700 flex items-start gap-1">
          <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
