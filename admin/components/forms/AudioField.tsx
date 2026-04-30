'use client';

/**
 * AudioField — form-level ses dosyası alanı.
 *
 * useFlowConfig'ten bucket'a göre limitleri okur ve AudioFileUploader'ı
 * sarar. Form'larda Input'un audio karşılığı olarak kullanılır.
 */
import { AudioFileUploader } from '@/components/forms/AudioFileUploader';
import { useFlowConfig } from '@/lib/flow-config/useFlowConfig';

interface Props {
  bucket: 'lesson-audio' | 'vocab-audio';
  pathPrefix: string;
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  /** Süre limiti devre dışı bırakmak istenirse */
  enforceDuration?: boolean;
}

export function AudioField({
  bucket,
  pathPrefix,
  value,
  onChange,
  enforceDuration = true,
}: Props) {
  const { config, loading } = useFlowConfig();

  const maxSizeMb =
    bucket === 'lesson-audio' ? config.audio.maxSizeMbLesson : config.audio.maxSizeMbVocab;

  if (loading) {
    return (
      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center bg-secondary/30">
        <p className="text-xs text-muted-foreground">Audio config yükleniyor…</p>
      </div>
    );
  }

  return (
    <AudioFileUploader
      bucket={bucket}
      pathPrefix={pathPrefix}
      currentUrl={value}
      onUploaded={(url) => onChange(url)}
      onCleared={() => onChange(null)}
      allowedFormats={config.audio.allowedFormats}
      maxSizeMb={maxSizeMb}
      maxDurationSeconds={enforceDuration ? config.audio.maxDurationSeconds : undefined}
    />
  );
}
