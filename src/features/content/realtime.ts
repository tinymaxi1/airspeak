/**
 * Realtime invalidation — admin yeni içerik publish edince mobil app cache'i bust olur.
 *
 * Channel: 'public-content'
 * Mantık: Postgres CDC eventleri yakalanır → React Query invalidate edilir.
 *
 * Kullanım: app/_layout.tsx'te bir kez subscribeContentRealtime() çağır.
 */
import { QueryClient } from '@tanstack/react-query';
import { supabase as typedSupabase } from '@/lib/supabase';
const supabase: any = typedSupabase;

const CONTENT_TABLES = [
  'modules',
  'units',
  'lessons',
  'exercises',
  'vocab_terms',
  'interview_questions',
  'icao4_questions',
  'oral_prompts',
  'placement_questions',
  'airlines',
  'scenarios',
] as const;

export function subscribeContentRealtime(queryClient: QueryClient): () => void {
  const channel = supabase.channel('public-content');

  for (const table of CONTENT_TABLES) {
    channel.on(
      'postgres_changes' as any,
      { event: '*', schema: 'public', table },
      (payload: any) => {
        try {
          const newRow = payload.new ?? payload.old;
          // Sadece published değişikliklerini önemse
          const status = newRow?.status;
          if (payload.eventType === 'DELETE' || status === 'published' || status === 'archived') {
            queryClient.invalidateQueries({ queryKey: ['content'] });
          }
        } catch (e) {
          console.warn('[content realtime] invalidation error', e);
        }
      },
    );
  }

  channel.subscribe((status: string) => {
    if (status === 'SUBSCRIBED') {
      console.log('[content realtime] connected');
    }
  });

  return () => {
    supabase.removeChannel(channel);
  };
}
