'use client';

/**
 * AudioPlayer — admin oral review için signed URL ile native HTML <audio>.
 *
 * Lazy: ilk Play tıklayınca signed URL alır (60sn TTL'lik kısa olmasın diye 1 saat).
 */
import { useState } from 'react';
import { getOralAudioSignedUrl } from '@/lib/oral-review/actions';
import { Play, Volume2 } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  audioPath: string | null;
}

export function AudioPlayer({ audioPath }: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!audioPath) {
    return (
      <span className="text-xs text-muted-foreground italic">Audio yok</span>
    );
  }

  if (url) {
    return (
      <audio controls className="h-9 max-w-[280px]" src={url}>
        Tarayıcı audio desteklemiyor.
      </audio>
    );
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        const r = await getOralAudioSignedUrl(audioPath);
        setLoading(false);
        if (!r.ok || !r.url) {
          toast.error(`Audio yüklenemedi: ${r.error ?? 'unknown'}`);
          return;
        }
        setUrl(r.url);
      }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-airspeak-navy/10 text-airspeak-navy hover:bg-airspeak-navy/20"
    >
      {loading ? <Volume2 className="w-3 h-3 animate-pulse" /> : <Play className="w-3 h-3" />}
      {loading ? 'Yükleniyor…' : 'Audio aç'}
    </button>
  );
}
