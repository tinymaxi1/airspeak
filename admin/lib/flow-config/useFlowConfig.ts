'use client';

/**
 * useFlowConfig — runtime config (app_config tablosu) client hook.
 *
 * Kaynak: public.app_config — kategorik jsonb key/value mağazası.
 * - Module-level cache (singleton Promise)
 * - İlk çağrı tüm audio.* anahtarları çeker, sonraki çağrılar cache'ten döner
 * - 5 dk TTL — admin tarafında değişiklik yapılırsa sayfa refresh ile yenilenir
 *
 * Şimdilik audio scope'una odaklı. Gerekirse genişletilebilir.
 */
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface AudioConfig {
  maxDurationSeconds: number;
  allowedFormats: string[];
  maxSizeMbLesson: number;
  maxSizeMbVocab: number;
}

export interface FlowConfig {
  audio: AudioConfig;
}

const DEFAULT_CONFIG: FlowConfig = {
  audio: {
    maxDurationSeconds: 60,
    allowedFormats: ['mp3', 'wav', 'ogg'],
    maxSizeMbLesson: 5,
    maxSizeMbVocab: 1,
  },
};

const TTL_MS = 5 * 60 * 1000;
let cache: { config: FlowConfig; loadedAt: number } | null = null;
let inflight: Promise<FlowConfig> | null = null;

async function fetchFlowConfig(): Promise<FlowConfig> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('app_config')
    .select('key, value')
    .eq('category', 'audio');

  if (error || !data) return DEFAULT_CONFIG;

  const map = new Map<string, unknown>();
  for (const row of data as { key: string; value: unknown }[]) {
    map.set(row.key, row.value);
  }

  return {
    audio: {
      maxDurationSeconds:
        (map.get('audio.max_duration_seconds') as number) ?? DEFAULT_CONFIG.audio.maxDurationSeconds,
      allowedFormats:
        (map.get('audio.allowed_formats') as string[]) ?? DEFAULT_CONFIG.audio.allowedFormats,
      maxSizeMbLesson:
        (map.get('audio.max_size_mb_lesson') as number) ?? DEFAULT_CONFIG.audio.maxSizeMbLesson,
      maxSizeMbVocab:
        (map.get('audio.max_size_mb_vocab') as number) ?? DEFAULT_CONFIG.audio.maxSizeMbVocab,
    },
  };
}

function getOrLoad(): Promise<FlowConfig> {
  if (cache && Date.now() - cache.loadedAt < TTL_MS) {
    return Promise.resolve(cache.config);
  }
  if (inflight) return inflight;
  inflight = fetchFlowConfig()
    .then((cfg) => {
      cache = { config: cfg, loadedAt: Date.now() };
      inflight = null;
      return cfg;
    })
    .catch((err) => {
      inflight = null;
      throw err;
    });
  return inflight;
}

/**
 * React hook — config bekleyene kadar default'ları gösterir.
 */
export function useFlowConfig(): { config: FlowConfig; loading: boolean } {
  const [config, setConfig] = useState<FlowConfig>(cache?.config ?? DEFAULT_CONFIG);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    let mounted = true;
    getOrLoad().then((cfg) => {
      if (!mounted) return;
      setConfig(cfg);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return { config, loading };
}

/**
 * Cache'i invalidate et — config admin panel'de değiştirildiğinde çağır.
 */
export function invalidateFlowConfig() {
  cache = null;
}
