'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/Button';
import { Input, Label, Select } from '@/components/ui/Input';
import { Volume2, Sparkles, Upload, RefreshCw } from 'lucide-react';
import { generateAndUploadTts, type VoicePreset } from '@/lib/audio/tts';
import { toast } from 'sonner';

interface Props {
  /** Ses üretmek için kaynak metin (prompt veya term) */
  sourceText: string;
  /** Üretilen URL'i parent'a iletir */
  onAudioGenerated: (url: string) => void;
  /** Hangi bucket'a yüklensin */
  bucket?: 'lesson-audio' | 'vocab-audio';
  /** Folder prefix (örn lesson_slug) */
  pathPrefix?: string;
  /** Mevcut URL */
  currentUrl?: string | null;
  /** Browser preview butonu göster */
  showBrowserPreview?: boolean;
}

export function AudioUploader({
  sourceText,
  onAudioGenerated,
  bucket = 'lesson-audio',
  pathPrefix = 'misc',
  currentUrl,
  showBrowserPreview = true,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [voice, setVoice] = useState<VoicePreset>('atc_male');

  function browserPreview() {
    if (!sourceText) {
      toast.error('Önce metni yaz');
      return;
    }
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      toast.error('Browser TTS desteklenmiyor');
      return;
    }
    const u = new SpeechSynthesisUtterance(sourceText);
    u.lang = 'en-US';
    u.rate = 0.95;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  function elevenGenerate() {
    if (!sourceText) {
      toast.error('Önce metni yaz');
      return;
    }
    startTransition(async () => {
      toast.loading('ElevenLabs ile üretiliyor…', { id: 'tts' });
      const r = await generateAndUploadTts(sourceText, voice, bucket, pathPrefix);
      if (r.ok) {
        toast.success(`Ses üretildi (${(r.bytes / 1024).toFixed(0)} KB)`, { id: 'tts' });
        onAudioGenerated(r.url);
      } else {
        toast.error(r.error, { id: 'tts' });
      }
    });
  }

  return (
    <div className="border border-border rounded-lg p-3 bg-secondary/30 space-y-3">
      <div className="flex items-center gap-2">
        <Volume2 className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Ses üretimi
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-2">
          <Label className="mb-1">Ses preset</Label>
          <Select value={voice} onChange={(e) => setVoice(e.target.value as VoicePreset)}>
            <option value="atc_male">ATC Erkek</option>
            <option value="atc_female">ATC Kadın</option>
            <option value="cabin_announcer">Kabin Anonsör</option>
            <option value="instructor">Eğitmen</option>
          </Select>
        </div>
        <div className="flex items-end">
          <Button
            type="button"
            variant="green"
            disabled={isPending}
            onClick={elevenGenerate}
            className="w-full"
          >
            <Sparkles className="w-4 h-4" /> Üret
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {showBrowserPreview && (
          <Button type="button" variant="outline" size="sm" onClick={browserPreview}>
            <Volume2 className="w-3 h-3" /> Browser önizleme
          </Button>
        )}
        {currentUrl && (
          <audio controls src={currentUrl} className="h-8 flex-1">
            <track kind="captions" />
          </audio>
        )}
      </div>

      {currentUrl && (
        <p className="text-xs text-muted-foreground truncate">📁 {currentUrl}</p>
      )}
    </div>
  );
}
