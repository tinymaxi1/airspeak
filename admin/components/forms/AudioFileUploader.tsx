'use client';

/**
 * AudioFileUploader — drag-drop + file picker MP3/WAV/OGG yükleyici.
 *
 * Manuel-only akış: ses üretimi yapmaz, sadece editörün cihazından
 * dosya alır → client-side validation → Supabase Storage upload.
 */
import { useRef, useState, useTransition } from 'react';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { Upload, Trash2, RefreshCw, FileAudio } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  /** Hangi bucket'a yüklensin */
  bucket: 'lesson-audio' | 'vocab-audio';
  /** Storage path prefix (örn `icao4/listening`) — slash ile birleştirilir */
  pathPrefix: string;
  /** Mevcut public URL (varsa preview gösterir) */
  currentUrl?: string | null;
  /** Yükleme başarılı olduğunda parent'a public URL ilet */
  onUploaded: (url: string) => void;
  /** Mevcut dosyayı temizleme — null gönderir */
  onCleared?: () => void;
  /** İzin verilen extension'lar (config'den) */
  allowedFormats: string[];
  /** Max dosya boyutu (MB) */
  maxSizeMb: number;
  /** Max süre (saniye) — opsiyonel (audio metadata okunur) */
  maxDurationSeconds?: number;
}

function formatToMime(ext: string): string[] {
  switch (ext) {
    case 'mp3':
      return ['audio/mpeg', 'audio/mp3'];
    case 'wav':
      return ['audio/wav', 'audio/x-wav'];
    case 'ogg':
      return ['audio/ogg'];
    default:
      return [];
  }
}

function buildAcceptAttr(formats: string[]): string {
  return formats.flatMap((f) => [`.${f}`, ...formatToMime(f)]).join(',');
}

async function readAudioDuration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(Number.isFinite(audio.duration) ? audio.duration : null);
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    audio.src = url;
  });
}

export function AudioFileUploader({
  bucket,
  pathPrefix,
  currentUrl,
  onUploaded,
  onCleared,
  allowedFormats,
  maxSizeMb,
  maxDurationSeconds,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const acceptAttr = buildAcceptAttr(allowedFormats);
  const maxSizeBytes = maxSizeMb * 1024 * 1024;

  function pickFile() {
    inputRef.current?.click();
  }

  async function validateAndUpload(file: File) {
    // 1. Extension
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!allowedFormats.includes(ext)) {
      toast.error(`Sadece ${allowedFormats.join('/').toUpperCase()} kabul edilir (.${ext} reddedildi)`);
      return;
    }
    // 2. MIME type
    const mimes = formatToMime(ext);
    if (file.type && !mimes.includes(file.type)) {
      toast.error(`Geçersiz MIME: ${file.type}`);
      return;
    }
    // 3. Size
    if (file.size > maxSizeBytes) {
      const mb = (file.size / 1024 / 1024).toFixed(2);
      toast.error(`Dosya ${mb} MB — max ${maxSizeMb} MB`);
      return;
    }
    // 4. Duration (best-effort, browser'a bağlı)
    if (maxDurationSeconds) {
      const dur = await readAudioDuration(file);
      if (dur !== null && dur > maxDurationSeconds) {
        toast.error(`Süre ${dur.toFixed(1)}sn — max ${maxDurationSeconds}sn`);
        return;
      }
    }

    startTransition(async () => {
      setProgress(0);
      const supabase = createClient();
      const slug = file.name
        .replace(/\.[^.]+$/, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .slice(0, 60);
      const stamp = Date.now();
      const path = `${pathPrefix.replace(/^\/+|\/+$/g, '')}/${stamp}_${slug}.${ext}`;

      toast.loading('Yükleniyor…', { id: 'audio-upload' });
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, { contentType: mimes[0] ?? file.type, upsert: false });

      if (error) {
        setProgress(null);
        toast.error(`Yükleme hatası: ${error.message}`, { id: 'audio-upload' });
        return;
      }

      const { data: pub } = supabase.storage.from(bucket).getPublicUrl(data.path);
      setProgress(100);
      toast.success(`Yüklendi (${(file.size / 1024).toFixed(0)} KB)`, { id: 'audio-upload' });
      onUploaded(pub.publicUrl);
      setProgress(null);
    });
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) void validateAndUpload(f);
    e.target.value = '';
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) void validateAndUpload(f);
  }

  function clear() {
    onCleared?.();
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={acceptAttr}
        className="hidden"
        onChange={onInputChange}
      />

      {currentUrl ? (
        <div className="border border-border rounded-lg p-3 bg-secondary/30 space-y-2">
          <div className="flex items-center gap-2">
            <FileAudio className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex-1">
              Yüklü ses dosyası
            </span>
            <Button type="button" size="sm" variant="outline" onClick={pickFile} disabled={isPending}>
              <RefreshCw className="w-3 h-3" /> Değiştir
            </Button>
            {onCleared && (
              <Button type="button" size="sm" variant="ghost" onClick={clear} disabled={isPending}>
                <Trash2 className="w-3 h-3" /> Sil
              </Button>
            )}
          </div>
          <audio controls src={currentUrl} className="w-full h-9">
            <track kind="captions" />
          </audio>
          <p className="text-xs text-muted-foreground truncate">📁 {currentUrl}</p>
        </div>
      ) : (
        <button
          type="button"
          onClick={pickFile}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={onDrop}
          disabled={isPending}
          className={`w-full border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? 'border-airspeak-red bg-airspeak-red/5'
              : 'border-border bg-secondary/30 hover:border-airspeak-navy/50'
          } ${isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <Upload className="w-6 h-6 mx-auto text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground mt-2">
            {isPending ? 'Yükleniyor…' : 'Ses dosyası yükle'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Sürükle bırak ya da tıkla. {allowedFormats.map((f) => f.toUpperCase()).join(' / ')}, max{' '}
            {maxSizeMb} MB{maxDurationSeconds ? ` · max ${maxDurationSeconds}sn` : ''}
          </p>
        </button>
      )}

      {progress !== null && progress < 100 && (
        <div className="h-1 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-airspeak-red transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
